import restify from 'restify';
import corsMiddleware from 'restify-cors-middleware';
import db from './database-mysql';
import auth from './auth'
import figlet from 'figlet'

/*
 *  Initialise Restify.
 *  (See http://restify.com/docs/plugins-api/)
 *  - parse the ?a=b stuff in the URL
 *  - parse a BODY sent in the request (e.g. JSON data in a POST request)
 *  - ZIP the response if possible, so the reply is small/faster.
 */
var server = restify.createServer();

server.use(restify.plugins.queryParser({ mapParams: true }));
server.use(restify.plugins.bodyParser({
  mapParams: true,
  mapFiles: true
}));
server.use(restify.plugins.gzipResponse());

/*
 *	Support CORS (Cross-Origin Resource Sharing) to allow cross domain access.
 *  Normally a browser cannot call an API at a different domain to the website.
 *  (For example a web page at http://aaa.com cannot call an API at http://bbb.com)
 *  See https://github.com/TabDigital/restify-cors-middleware
 */
const cors = corsMiddleware({
  preflightMaxAge: 5, // Optional
  origins: ['*'],
  allowHeaders: ['Authorization'],
  exposeHeaders: ['*'],
});
server.pre(cors.preflight);
server.use(cors.actual);

function respond(req, res, next) {
  res.send('hello ' + req.params.name);
  next();
}
server.get('/hello/:name', respond);
server.head('/hello/:name', respond);

// Healthcheck, so the load balancer can check the API is operational
server.get('/healthcheck', async (req, res, next) => {
  console.log(`GET /healthcheck`);

  res.send({
    status: 'ok',
    version: '___INSERT_VERSION_HERE___',
    buildNo: '___INSERT_BUILD_NUMBER_HERE___',
    commitMsg: '___INSERT_COMMITMSG_HERE___',
    identifier: 'Snarglefish'
  })
  next()
});

// ******************** All server calls related to /deployables page *********************
/*
 *  /deployables: Selects the all deployables that are PROJECTS from MySQL db
 *  (See https://www.w3schools.com/nodejs/nodejs_mysql.asp)
 */
server.get('/deployables', auth, async (req, res, next) => {
  console.log('------------------------------')
  console.log(`GET /deployables`);

  let userIdentity = req.payload.userIdentity
  // console.log(`userIdentity is:::`, userIdentity)
  let me = req.identity.username
  console.log(`I am ${me}`);
  

  const sql = `SELECT owner, name, type, is_project, product_owner, description FROM deployable`

  // const sql = `(SELECT deployable.name, deployable.is_project, deployable.product_owner, deployable.description FROM deployable INNER JOIN project_user ON deployable.name = project_user.project AND project_user.user_id =?) UNION (SELECT * FROM deployable WHERE deployable.is_project = 'no')`
  const params = [ userIdentity ]
  console.log(`SQL IS ${sql}`)

  let con = await db.checkConnection()
  con.query(sql, params, function (err, result) {
    if (err) throw err;
    res.send({ deployables: result })
    next()
  });
});

/*
 *  /deployables: Selects all DEPLOYABLES from MySQL db
 *  
 */
server.get('/showDeployables', async (req, res, next) => {
  console.log(`GET /showDeployables`);

  let con = await db.checkConnection()
  const sql = `(SELECT * FROM deployable)`

  console.log(`SQL IS ${sql}`)
  con.query(sql, function (err, result) {
    if (err) throw err;
    res.send({ list: result })
    next()
  });
}); // ******************** end of /deployables server calls *********************

// ********************** All server calls related to /_deployableNAME page **********************
/*
 *  /_deployableNAME: Dynamically select the DEPLOYABLE for /_deployableNAME from MySQL db
 *  
 */
server.get('/deployable', async (req, res, next) => {
  console.log(`GET /deployable`);

  let deployableName = req.query.deployableName
  let con = await db.checkConnection()
  const sql = `SELECT * from deployable where name=?`
  const params = [ deployableName ]

  con.query(sql, params, function (err, result) {
    if (err) throw err;
    console.log("Result: " + result);
    console.log(`result[0]=`, result[0]);
    res.send({ record: result[0] })
    next()
  });
});

/*
 *  /_deployableNAME: Dynamically select the ENVIRONMENT for /_deployableNAME from MySQL db
 *  
 */
server.get('/envDeployments', async (req, res, next) => {
  console.log(`GET /envDeployments`);

  let deployableName = req.query.deployableName
  let con = await db.checkConnection()
  const sql = `SELECT * from deployments where deployable =?`
  const params = [ deployableName ];
  
  con.query(sql, params, function (err, result) {
    if (err) throw err;
    console.log("Result: " + result);
    res.send({ deployments: result })
    next()
  });
});

/*
 *  /_deployableNAME: Dynamically select the USERS for /_deployableNAME from MySQL db
 *  
 */
server.get('/project_users', async (req, res, next) => {
  console.log(`GET /project_users`);

  let deployableName = req.query.deployableName
  let con = await db.checkConnection()
  const sql = `SELECT PU.project, PU.user_id, PU.access, U.first_name, U.last_name FROM project_user PU left outer join user U on PU.user_id = U.id WHERE PU.project=?`
  let params = [ deployableName ]

  con.query(sql, params, function (err, result) {
    if (err) throw err;
    res.send({ users: result })
    next()
  })
})

/*
 *  /_deployableNAME: Dynamically select ALL DEPENDENCIES from MySQL db
 *  
 */
server.get('/dependencies', async (req, res, next) => {
  console.log(`GET /dependencies`);

  let con = await db.checkConnection()
  const sql = `SELECT * from dependency`

  con.query(sql, function (err, result) {
    if (err) throw err;
    res.send({ dependencies: result })
    next()
  });
});

/*
 *  /_deployableNAME: Dynamically select DEPENDENCIES for /_deployableNAME from MySQL db
 *  
 */
server.get('/dependencies1', async (req, res, next) => {
  console.log(`GET /dependencies1`);

  let deployableName = req.query.deployableName
  let con = await db.checkConnection()
  const sql = `SELECT * from dependency where parent=?`
  const params = [ deployableName ]

  con.query(sql, params, function (err, result) {
    if (err) throw err;
    res.send({ dependencies: result })
    next()
  });
});

/*
 *  /_deployableNAME: Dynamically select ALL VARIABLES from MySQL db
 *  
 */  
server.get('/variablesAll', async (req, res, next) => {
  console.log(`GET /variablesAll`);

  let con = await db.checkConnection()
  const sql = `SELECT * FROM variable`

  con.query(sql, function (err, result) {
    if (err) throw err;
    console.log("Result: " + result);
    console.log(`result[0]=`, result[0]);
    res.send({ variables: result })
    next()
  });
});

/*
 *  /_deployableNAME: Dynamically select VARIABLES for /_deployableNAME from MySQL db
 *  
 */
server.get('/variables', async (req, res, next) => {
  console.log(`GET /variables`);

  let deployableName = req.query.deployableName
  let con = await db.checkConnection()
  const sql = `SELECT * FROM variable WHERE deployable=?`
  const params = [ deployableName ]

  con.query(sql, params, function (err, result) {
    if (err) throw err;
    console.log("Result: " + result);
    console.log(`result[0]=`, result[0]);
    res.send({ variables: result })
    next()
  });
});

/*
 *  /_deployableNAME: Edit the DEPLOYABLE values for /_deployableNAME on MySQL db
 *  ~~ This edits the db deployable ~~
 */
server.use(restify.plugins.queryParser({
  mapParams: true
}));
server.use(restify.plugins.bodyParser({
  mapParams: true
}));
server.use(restify.plugins.acceptParser(server.acceptable));

server.post('/deployable', async (req, res, next) => {
  console.log(`POST /deployable`)

  let con = await db.checkConnection()
  const product_owner = req.params.product_owner;
  const description = req.params.description;
  const is_project = req.params.is_project;
  const name = req.params.name;
  const sql = `UPDATE deployable SET product_owner =?, description =?, is_project =? WHERE name =?`
  const params = [ product_owner, description, is_project, name ]

  con.query(sql, params, (err, result) => {
    if (err) throw err;
    console.log("Result: " + req.params.product_owner + ' ' + req.params.description + ' ' + req.params.is_project)

    // Send a success reply
    res.send({ status: 'ok' });
    return next();
  })
}); // End of section

/*
 *  /_deployableNAME: Add a new project USER for /_deployableNAME on MySQL db
 *  ~~This updates db project_user~~ 
 */
server.use(restify.plugins.queryParser({
  mapParams: true
}));
server.use(restify.plugins.bodyParser({
  mapParams: true
}));
server.use(restify.plugins.acceptParser(server.acceptable));
// server.post('/newProjectUser', async (req, res, next) => {
//   console.log(`POST /newProjectUser`)

//   let con = await db.checkConnection()
//   const userValues = {user_id: req.params.id, project: req.params.project, access: req.params.access}
//   let sql = `INSERT INTO project_user SET ?`
//   let params = [ userValues ]

//   con.query( sql, params, (err, result) => {
//     if (err) throw err;
//     console.log("Result: NEW project user- " + req.params.name + ' project- ' + req.params.project + " access- " + req.params.access) 

//     // Send reply
//     res.send({ status: 'ok' })
//     return next();
//     }) 
// }); // End of section
server.get('/variableValues', async (req, res, next) => {
  console.log(`GET /variableValues`);

  let environmentOwner = req.query.environmentOwner
  let environment = req.query.environment
  let applicationName = req.query.applicationName

  let con = await db.checkConnection()
  const sql = `SELECT * FROM variable_value WHERE environment_owner=? AND environment=? AND application_name=?`
  const params = [ environmentOwner, environment, applicationName ]

  con.query(sql, params, function (err, result) {
    if (err) throw err;
    console.log("Result: ", result);
    res.send({ variableValues: result })
    next()
  });
});

server.post('/variableValues', auth, async (req, res, next) => {
  console.log(`POST /variableValues`);

  console.log(`rec.params=`, req.params);

  // See what variables we currently have in th DB
  let environmentOwner = req.params.environmentOwner
  let environment = req.params.environment
  let applicationName = req.params.applicationName
  let variableValues = req.params.variableValues

  let con = await db.checkConnection()
  const sql = `SELECT * FROM variable_value WHERE environment_owner=? AND environment=? AND application_name=?`
  const params = [ environmentOwner, environment, applicationName ]

  // let result = await con.query(sql, params)
  // console.log(`result=`, result);

  let toAdd = []
  let toUpdate = []
  let toDelete = []
  
  con.query(sql, params, function (err, result) {
    if (err) throw err;
    // console.log("Result: ", result);

    // See what we have in the database that can be deleted.
    let dbIndex = { } // Hash of variables and values in the DB
    result.forEach(row => {
      let variableName = row.variable_name
      dbIndex[variableName] = row.value
      if (typeof(variableValues[variableName]) === 'undefined') {
        // console.log(`  -> delete ${variableName}`);
        toDelete.push(variableName)
      }
    })

    // See what we're received that can be added or updated
    for (let variableName in variableValues) {
      let newValue = variableValues[variableName]
      // console.log(`check ${variableName}`);
      let oldValue = dbIndex[variableName]
      if (typeof(oldValue) === 'undefined') {
        // console.log(`  -> add ${variableName} (${newValue})`);
        toAdd.push({ variableName, value: newValue })
      } else if (oldValue !== newValue) {
        // console.log(`  -> update ${variableName} (${newValue})`);        
        toUpdate.push({ variableName, value: newValue })
      }
    }

    deleteVariableValues(con, environmentOwner, environment, applicationName, toDelete, (err) => {
      if (err) throw err
      addVariableValues(con, environmentOwner, environment, applicationName, toAdd, (err) => {
        if (err) throw err
        updateVariableValues(con, environmentOwner, environment, applicationName, toUpdate, err => {
          if (err) throw err

          // Seems all worked.
          res.send({ status: 'ok' })
          next()
        })
      })  
    })
  });

});

async function deleteVariableValues(connection, environmentOwner, environment, applicationName, array, cb) {
  console.log(`deleteVariableValues()`, array);

  if (array.length === 0) {
    return cb(null)
  }
  let sql = `DELETE FROM variable_value WHERE environment_owner=? AND environment=? AND application_name=? AND (`
  let params = [ environmentOwner, environment, applicationName ]
  let sep = ''
  array.forEach(variableName => {
    sql += `${sep}variable_name=?`
    params.push(variableName)
    sep = ' OR '
  })
  sql += ')'

  console.log(`sql=${sql}`);
  console.log(`params=`, params);
  connection.query(sql, params, function (err, result) {
    if (err) throw err;
    // console.log("Result: ", result);
    return cb(null)
  })
}

async function addVariableValues(connection, environmentOwner, environment, applicationName, array, cb) {
  console.log(`addVariableValues()`, array);

  let doAdd = (index) => {
    if (index >= array.length) {
      return cb(null)
    }

    let sql = `INSERT INTO variable_value SET ?`
    let params = {
      environment_owner: environmentOwner,
      environment: environment,
      application_name: applicationName,
      variable_name: array[index].variableName,
      value: array[index].value
    }
    console.log(`sql=${sql}`);
    console.log(`params=`, params);
    connection.query(sql, params, function (err, result) {
      if (err) throw err;
      // console.log("Result: ", result);
  
      // We use setTimeout so the stack does not overflow
      setTimeout(()=> {
        doAdd(index + 1)
      }, 0)
    })
  }
  doAdd(0)
}

async function updateVariableValues(connection, environmentOwner, environment, applicationName, array, cb) {
  console.log(`updateVariableValues()`, array);

  let doUpdate = (index) => {
    if (index >= array.length) {
      return cb(null)
    }

    let sql = `UPDATE variable_value SET value=? WHERE environment_owner=? AND environment=? AND application_name=? AND variable_name=?`
    let params = [
      array[index].value,
      environmentOwner,
      environment,
      applicationName,
      array[index].variableName
    ]
    console.log(`sql=${sql}`);
    console.log(`params=`, params);

    connection.query(sql, params, function (err, result) {
      if (err) throw err;
      // console.log("Result: ", result);
  
      // We use setTimeout so the stack does not overflow
      setTimeout(()=> {
        doUpdate(index + 1)
      }, 0)
    })
  }
  doUpdate(0)
}

/*
 *  /_deployableNAME: Add a new VARIABLE for /_deployableNAME on MySQL db
 *  ~~This updates db variable~~ 
 */
server.use(restify.plugins.queryParser({
  mapParams: true
}));
server.use(restify.plugins.bodyParser({
  mapParams: true
}));
server.use(restify.plugins.acceptParser(server.acceptable));
server.post('/newVariable', async (req, res, next) => {
  console.log(`POST /newVariable`)

  let con = await db.checkConnection()
  const variableValues = {name: req.params.name, description: req.params.description, type: req.params.type, mandatory: req.params.mandatory, deployable: req.params.deployable, is_external: req.params.external}
  let sql = `INSERT INTO variable SET ?`
  let params = [ variableValues ]

  con.query( sql, params, (err, result) => {
    if (err) throw err;

    console.log("Result: NEW variable- " + req.params.name + " deployable- " + req.params.deployable + " Description- " + req.params.description) 
    

    // Send reply
    res.send({ status: 'ok' })
    return next();
  })
}); // End of section

/*
*  /_deployableNAME: Edit a VARIABLE for /_deployableNAME on MySQL db
*  ~~This updates db variable~~ 
*/
server.use(restify.plugins.queryParser({
  mapParams: true
}));
server.use(restify.plugins.bodyParser({
  mapParams: true
}));
server.use(restify.plugins.acceptParser(server.acceptable));

server.post('/variable', async (req, res, next) => {
  console.log(`POST /variable`)

  let con = await db.checkConnection()
  const deployable = req.params.deployable;
  const name = req.params.name;
  const description = req.params.description;
  const type = req.params.type;
  const mandatory = req.params.mandatory;
  const is_external = req.params.external;
  let sql = `UPDATE variable SET type=?, description =?, mandatory=?, is_external=? WHERE name=? AND deployable=?`
  let params = [ type, description, mandatory, is_external, name, deployable ]

  con.query(sql, params, (err, result) => {
    if (err) throw err;
    console.log("Result: ", result)

    // Send a success reply
    res.send({ status: 'ok' })
    return next();
  })
}); // End of section

// server.put('/variableValue', async (req, res, next) => {
//   console.log(`PUT /variableValue`)

//   console.log(`params=`, req.params);
//   res.send({ status: 'ok' })
//   return next();

//   let con = await db.checkConnection()
//   const deployable = req.params.deployable;
//   const name = req.params.name;
//   const description = req.params.description;
//   const type = req.params.type;
//   const mandatory = req.params.mandatory;
//   const is_external = req.params.external;
//   let sql = `INSERT INTO variable_value SET ?`

//   // let sql = `UPDATE variable SET type=?, description =?, mandatory=?, is_external=? WHERE name=? AND deployable=?`
//   let params = [ type, description, mandatory, is_external, name, deployable ]

//   con.query(sql, params, (err, result) => {
//     if (err) throw err;
//     console.log("Result: ", result)

//     // Send a success reply
//     res.send({ status: 'ok' })
//     return next();
//   })
// }); // End of section

/*
 *  /_deployableNAME: Add a new DEPENDENCY for /_deployableNAME on MySQL db
 *  ~~This updates db dependency~~ 
 */
server.use(restify.plugins.queryParser({
  mapParams: true
}));
server.use(restify.plugins.bodyParser({
  mapParams: true
}));
server.use(restify.plugins.acceptParser(server.acceptable));

server.post('/newDependency', async (req, res, next) => {
  console.log(`POST /newDependency`)

  let con = await db.checkConnection()
  const dependencyValues = {parent: req.params.deployable, child: req.params.child, prefix: req.params.prefix, version: req.params.version}
  let sql = `INSERT INTO dependency SET ?`
  let params = [ dependencyValues ]

  con.query( sql, params, (err, result) => {
    if (err) throw err;
    console.log("Result: NEW dependency " + req.params.deployable + " child- " + req.params.child + " prefix- " + req.params.prefix) 

    // Send reply
    res.send({ status: 'ok' })
    return next();
  })
}); // End of section

/*
*  /_deployableNAME: Edit a USER in /_deployableNAME on MySQL db
*  ~~ This edits the db project_user ~~
*/
server.use(restify.plugins.queryParser({
  mapParams: true
}));
server.use(restify.plugins.bodyParser({
  mapParams: true
}));
server.use(restify.plugins.acceptParser(server.acceptable));

server.post('/editUser', async (req, res, next) => {
  console.log(`POST /editUser`)

  let con = await db.checkConnection()
  const id = req.params.id;
  const access = req.params.access;
  const project = req.params.project;
  let sql = `UPDATE project_user SET access=? WHERE user_id=? AND project=?`
  let params = [ access, id, project ]

  con.query(sql, params, (err, result) => {
    if (err) throw err;
    console.log("Result: ", result)

    // Send a success reply
    res.send({ status: 'ok' });
    return next();
  })
}); // ******************** end of /_deployableNAME server calls *********************

// ********************** All server calls related to /_userNAME page **********************
/*
 *  _userName: Dynamically select the USER for /_userName from MySQL database
 *  (See https://www.w3schools.com/nodejs/nodejs_mysql.asp)
 */
server.get('/userName', async (req, res, next) => {
  console.log(`GET /userName`);

  let userID = req.query.userID
  let con = await db.checkConnection()
  const sql = `SELECT * from user where id=?`
  const params = [ userID ]

  con.query(sql, params, function (err, result) {
    if (err) throw err;
    console.log("Result: " + result);
    console.log(`result[0]=`, result[0]);
    res.send({ record: result[0] })
    next()
  });
});

/*
 *  _userName: Dynamically select the PROJECTS for /_userName from MySQL database
 *  
 */
server.get('/usersProjects', async (req, res, next) => {
  console.log(`GET /usersProjects`);

  let userID = req.query.userID
  let con = await db.checkConnection()
  const sql = `SELECT * from project_user where user_id=?`
  const params = [ userID ]

  con.query(sql, params, function (err, result) {
    if (err) throw err;
    console.log("Result: " + result);
    res.send({ records: result })
    next()
  });
});

/*
 *  _userName: Dynamically select the ENVIRONMENTS for /_userName from MySQL database
 *  
 */
server.get('/usersEnvironments', async (req, res, next) => {
  console.log(`GET /usersEnvironments`);

  let userID = req.query.userID
  let con = await db.checkConnection()
  const sql = `SELECT * from environment_user where user_id=?`
  const params = [ userID ]

  con.query(sql, params, function (err, result) {
    if (err) throw err;
    console.log("Result: " + result);
    res.send({ records: result })
    next()
  });
});

/*
 *  _userName: Edit values for /_userName on MySQL database
 *  ~~ This edits the db user ~~
 */
server.use(restify.plugins.queryParser({
  mapParams: true
}));
server.use(restify.plugins.bodyParser({
  mapParams: true
}));
server.use(restify.plugins.acceptParser(server.acceptable));

server.post('/editUserAccount', async (req, res, next) => {
  console.log(`POST /editUserAccount`)

  let con = await db.checkConnection()
  const access = req.params.access;
  const role = req.params.role;
  const email = req.params.email;
  const id = req.params.id;
  const sql = `UPDATE user SET access =?, role =?, email =? Where id =?`
  const params = [ access, role, email, id ]

  con.query(sql, params, (err, result) => {
    if (err) throw err;
    console.log("Updated: " + req.params.access + ' ' + req.params.role + ' ' + req.params.email)

    // Send a success reply
    res.send({ status: 'ok' })
    return next();
  }) 
}); // - end of call
  
/*
 *  _userName: Select ENVIRONMENTS for /_userName on MySQL database
 *  ~~ This uses an innerjoin bt db's environment and environment_user ~~
 */
server.get('/environments', auth, async (req, res, next) => {
  console.log(`GET /environments`);

  let userIdentity = req.payload.userIdentity
  console.log(`userIdentity is:::`, userIdentity)
  console.log(`payload is`, req.payload);
  console.log(`identity is`, req.identity);
  
  let me = req.identity.username
  console.log(`I am ${me}`);

  let con = await db.checkConnection()
  const sql = `(SELECT environment.owner, environment.name, environment.description, environment.notes, environment.is_universal FROM environment)`
  //const sql = `(SELECT environment.owner, environment.name, environment.description, environment.notes, environment.is_universal FROM environment INNER JOIN environment_user ON environment.name = environment_user.environment AND environment_user.user_id =?) UNION (SELECT environment.name, environment.description, environment.notes, environment.is_universal FROM environment WHERE environment.is_universal = 'yes')`
  const params = [ userIdentity ]
    
    console.log(`SQL IS ${sql}`)
    con.query(sql, params, function (err, result) {
      if (err) throw err;
      // console.log("Result: " + result);
      // console.log(`result[0]=`, result[0]);
      res.send({ environments: result })
      // con.end()
      next()
    });
  // });
});

// ******************** All server calls related to /environment page *********************

/*
 *  /environment: Select ALL ENVIRONMENTS from MySQL database
 *  (See https://www.w3schools.com/nodejs/nodejs_mysql.asp)
 */
server.get('/showEnvironments', async (req, res, next) => {
  console.log(`GET /showEnvironments`);

  let con = await db.checkConnection()
  const sql = `SELECT * FROM environment`
  
  con.query(sql, function (err, result) {
    if (err) throw err;
    res.send({ environments: result })
    next()
  });
}); // ******************** end of /environment server calls *********************

// ******************** All server calls related to /_environmentNAME page *********************
/*
 *  /_environmentNAME: Select ENVIRONMENT values for /_environmentNAME on MySQL database
 *  
 */
server.get('/environment', async (req, res, next) => {
  console.log(`GET /environment`);

  let environmentName = req.query.environmentName;
  let con = await db.checkConnection()
  const sql = `SELECT * from environment where name=?`
  const params = [ environmentName ]

  con.query(sql, params, function (err, result) {
    if (err) throw err;
    console.log("Result: " + result);
    res.send({ record: result[0] })
    next()
  });
});

/*
 *  /_environmentNAME: Select DEPLOYMENTS for /_environmentNAME on MySQL database
 *  
 */
server.get('/deployments', async (req, res, next) => {
  console.log(`GET /deployments`);

  let environmentOwner = req.query.environmentOwner
  let environmentName = req.query.environmentName
  let applicationName = req.query.applicationName
  let deployableOwner = req.query.deployableOwner
  let deployableName = req.query.deployableName
  console.log(`environmentOwner=${environmentOwner}`);
  console.log(`environmentName=${environmentName}`);
  console.log(`applicationName=${applicationName}`);
  console.log(`deployableOwner=${deployableOwner}`);
  console.log(`deployableName=${deployableName}`);
  

  // Either the environment or the deployable must be for the
  // current user. They can't just go looking at everyone's stuff.
  //ZZZZ

  let con = await db.checkConnection()
  let sql = `SELECT * from deployments`
  // let sql = `SELECT * from deployments where environment =?`
  const params = [ ];
  let first = true
  if (environmentName) {
    sql += (first ? ' WHERE ':' AND ') + `environment_owner=? AND environment=?`
    params.push(environmentOwner)
    params.push(environmentName)
    first = false
  }
  if (applicationName) {
    sql += (first ? ' WHERE ':' AND ') + `application_name=?`
    params.push(applicationName)
    first = false
  }
  if (deployableName) {
    sql += (first ? ' WHERE ':' AND ') + `deployable_owner=? AND deployable=?`
    params.push(deployableOwner)
    params.push(deployableName)
    first = false
  }
  if (first) {
    // Select the deployables involving the current user's environments or deployables.
    // res.send(new restify.errors.BadRequestError('Must specify environment or deployable'))
    // sql += `where environmentOwner=? OR deployableOwner=?` //ZZZ should set owner
    // let me = ?????
    // params.push(me, me )
  }

  console.log(`sql=${sql}`);
  console.log(`params=`, params);    
  con.query(sql, params, function (err, result) {
    if (err) throw err;
    console.log("Result: " + result);
    res.send({ deployments: result })
    next()
  });
});

/*
 *  /_environmentNAME: Select USERS for /_environmentNAME on MySQL database
 *  
 */
server.get('/environments_users', async (req, res, next) => {
  console.log(`GET /environments_users`);
  
  let environmentName = req.query.environmentName
  let con = await db.checkConnection()
  const sql = `SELECT EU.environment, EU.user_id, EU.access, U.first_name, U.last_name FROM environment_user EU left outer join user U on EU.user_id = U.id WHERE EU.environment=?`
  let params = [ environmentName ]

  con.query(sql, params, function (err, result) {
    if (err) throw err;
    res.send({ users: result })
    next()
  })
})

/*
 *  /_environmentNAME: Edit ENVIRONMENT values for /_environmentNAME on MySQL database
 *  ~~ This edits the db environment ~~
 */
server.use(restify.plugins.queryParser({
  mapParams: true
}));
server.use(restify.plugins.bodyParser({
  mapParams: true
}));
server.use(restify.plugins.acceptParser(server.acceptable));

server.post('/editedEnv', async (req, res, next) => {
  console.log(`POST /editedEnv`)

  let con = await db.checkConnection()
  const name = req.params.name;
  const description = req.params.description;
  const notes = req.params.notes;
  const sql = `UPDATE environment SET description =?, notes =? WHERE name =?`
  const params = [ description, notes, name ]

  con.query(sql, params, (err, result) => {
    if (err) throw err;
    console.log("Saved: " + req.params.name + ' ' + req.params.description + ' ' + req.params.notes)
    console.log(`Result is `, result);
    
    // Send a success reply
    res.send({ status: 'ok' })
    return next();
  }) 
}); // End of section

/*
 *  /_environmentNAME: Add a NEW USER for /_environmentNAME on MySQL database
 *  ~~ This updates db environment_user ~~
 */
server.use(restify.plugins.queryParser({
  mapParams: true
}));
server.use(restify.plugins.bodyParser({
  mapParams: true
}));
server.use(restify.plugins.acceptParser(server.acceptable));

server.post('/newEnvironmentUser', async (req, res, next) => {
  console.log(`POST /newEnvironmentUser`)

  let con = await db.checkConnection()
  const userValues = {user_id: req.params.id, environment: req.params.environment, access: req.params.access}
  let sql = `INSERT INTO environment_user SET ?`
  let params = [ userValues ]

  con.query( sql, params, (err, result) => {
    if (err) throw err;
    console.log("Result: NEW environment user- " + req.params.id + ' environment- ' + req.params.environment + " access- " + req.params.access) 

    // Send reply
    res.send({ status: 'ok' })
    return next();
  })
}); // End of section

/*
*  /_environmentNAME: Edit a USER for /_environmentNAME on MySQL database
*  ~~ This updates db environment_user ~~
*/
server.use(restify.plugins.queryParser({
  mapParams: true
}));
server.use(restify.plugins.bodyParser({
  mapParams: true
}));
server.use(restify.plugins.acceptParser(server.acceptable));

server.post('/editEnvUser', async (req, res, next) => {
  console.log(`POST /editEnvUser`)

  let con = await db.checkConnection()
  const id = req.params.id;
  const access = req.params.access;
  const environment = req.params.environment;
  let sql = `UPDATE environment_user SET access=? WHERE user_id=? AND environment=?`
  let params = [ access, id, environment ]

  con.query(sql, params, (err, result) => {
    if (err) throw err;
    console.log("Result: ", result)

    // Send a success reply
    res.send({ status: 'ok' })
    return next();
  })
}); // End of section

/*
 *  /_environmentNAME AND /_deployableNAME: Add a NEW DEPLOYMENT 
 *  ... for /_environmentNAME + /_deployableNAMEon MySQL database
 *  ~~ This updates db deployments ~~
 */
server.use(restify.plugins.queryParser({
  mapParams: true
}));
server.use(restify.plugins.bodyParser({
  mapParams: true
}));
server.use(restify.plugins.acceptParser(server.acceptable));

server.post('/newDeployment', auth, async (req, res, next) => {
  console.log(`POST /newDeployment`)

  // Get the values passed in.
  let environmentOwner = req.params.environment_owner
  let environment = req.params.environment
  let deployableOwner = req.params.deployable_owner
  let deployable = req.params.deployable
  let notes = req.params.notes
  let applicationName = req.params.application_

  let obj = { }
  if (req.params.environment_owner) {
    obj.environment_owner = req.params.environment_owner
  }
  if (req.params.environment) {
    obj.environment = req.params.environment
  }
  if (req.params.deployable_owner) {
    obj.deployable_owner = req.params.deployable_owner
  }
  if (req.params.deployable) {
    obj.deployable = req.params.deployable
  }
  if (req.params.application_name) {
    obj.application_name = req.params.application_name
  }
  if (req.params.notes) {
    obj.notes = req.params.notes
  }
  console.log(`will save this:`, obj);
  

  //ZZZZ Check we are allowed to do this.



  let con = await db.checkConnection()
  // const deploymentValues = {notes: req.params.notes, deployable: req.params.deployable, environment: req.params.environment}
  let sql = `INSERT INTO deployments SET ?`
  // let params = [ deploymentValues ]

  con.query( sql, obj, (err, result) => {
    if (err) throw err;
    console.log("Result: NEW deployment ", result) 

    // Send reply
    res.send({ status: 'ok' })
    return next();
  }) 
}); // ******************** end of /_environmentNAME server calls *********************

server.put('/deployment', async (req, res, next) => {
  console.log(`PUT /deployment`)

  let con = await db.checkConnection()
  const deploymentValues = {
  }
  if (req.params.notes) {
    deploymentValues.notes = req.params.notes
  }
  if (req.params.healthcheck_url) {
    deploymentValues.healthcheck_url = req.params.healthcheck_url
  }
  if (req.params.aws_service) {
    deploymentValues.aws_service = req.params.aws_service
  }
  if (req.params.aws_loadbalancer) {
    deploymentValues.aws_loadbalancer = req.params.aws_loadbalancer
  }
  if (req.params.aws_targetgroup) {
    deploymentValues.aws_targetgroup = req.params.aws_targetgroup
  }
  if (req.params.aws_logfile_url) {
    deploymentValues.aws_logfile_url = req.params.aws_logfile_url
  }
  if (req.params.aws_secretsmanager_secret) {
    deploymentValues.aws_secretsmanager_secret = req.params.aws_secretsmanager_secret
  }

  let sql = `UPDATE deployments SET ? WHERE environment=? AND deployable=?`
  let params = [ deploymentValues, req.params.environment, req.params.deployable ]

  console.log(`sql=`, sql);
  console.log(`params=`, params);
  
  
  con.query( sql, params, (err, result) => {
    if (err) throw err;
    // console.log("Result: UPDATE deployment result", result) 

    // Send reply
    res.send({ status: 'ok' })
    return next();
  }) 
}); // ******************** end of /_environmentNAME server calls *********************

server.put('/environment', async (req, res, next) => {
  console.log(`PUT /environment`)

  let con = await db.checkConnection()
  const record = {
  }
  if (typeof(req.params.is_universal) != 'undefined') {
    record.is_universal = req.params.is_universal
  }
  if (typeof(req.params.is_secure_environment) != 'undefined') {
    record.is_secure_environment = req.params.is_secure_environment
  }
  if (typeof(req.params.description) != 'undefined') {
    record.description = req.params.description
  }
  if (typeof(req.params.notes) != 'undefined') {
    record.notes = req.params.notes
  }
  if (typeof(req.params.type) != 'undefined') {
    record.type = req.params.type
  }
  if (typeof(req.params.aws_region) != 'undefined') {
    record.aws_region = req.params.aws_region
  }
  if (typeof(req.params.aws_cf_stack) != 'undefined') {
    record.aws_cf_stack = req.params.aws_cf_stack
  }
  if (typeof(req.params.aws_cluster_url) != 'undefined') {
    record.aws_cluster_url = req.params.aws_cluster_url
  }
  if (typeof(req.params.aws_vpc_url) != 'undefined') {
    record.aws_vpc_url = req.params.aws_vpc_url
  }

  // let sql = `UPDATE environment SET ? WHERE owner=? AND environment=?`
  let sql = `UPDATE environment SET ? WHERE name=?`
  let params = [ record, req.params.name ]

  console.log(`sql=`, sql);
  console.log(`params=`, params);
  
  
  con.query( sql, params, (err, result) => {
    if (err) throw err;
    // console.log("Result: UPDATE deployment result", result) 

    // Send reply
    res.send({ status: 'ok' })
    return next();
  }) 
}); // ******************** end of PUT /environment *********************

// ******************** All server calls related to /users page *********************
/*
 *  /users: Select all USERS for /users on MySQL database
 *  
 */ 
server.get('/users', async (req, res, next) => {
  console.log(`GET /users`);

  let con = await db.checkConnection()
  const sql = `SELECT * from user`

  con.query(sql, function (err, result) {
    if (err) throw err;
    res.send({ users: result })
    next()
  });
}); // ******************** end of /users server calls *********************

// ******************** All server calls related to AUTHENTICATION *********************
// Select the user details/accessibility for the current user (logged in)
server.get('/currentUser', auth, async (req, res, next) => {
  console.log(`GET /currentUser`);

  let userIdentity = req.payload.userIdentity
  console.log(`userIdentity is:::`, userIdentity)
  let con = await db.checkConnection()
  const sql = `SELECT * FROM user WHERE user.id =?`
  const params = [ userIdentity ]

  con.query(sql, params, function (err, result) {
    if (err) throw err;
    res.send({ user: result })
    next()
  });
}); // ******************** end of AUTHENTICATION server calls *********************

// ******************** All server calls related to /config page *********************
/*
 *  /config: Select VARIABLES for dependencies/deployable on /config from MySQL db
 *  ~~ This section is recursive ~~
 *
 */
async function getVariables(deployable) {
  console.log(`   -------------\ngetVariables(${deployable})`)
  // return null
  let con = await db.checkConnection()

  return new Promise(function(resolve, reject) {
    const sql = `SELECT * from variable where deployable=?`
    const params = [ deployable ]

    con.query(sql, params, function (err, result) {
      if (err) return reject(err);
      // console.log(`Got variables for ${deployable}:`, result)
      return resolve(result)
    })
  });//- promise
}

async function getDependencies(deployable) {
  console.log(`   -------------\ngetDependencies(${deployable})`)
  // return null
  let con = await db.checkConnection()

  return new Promise(function(resolve, reject) {
    const sql = `SELECT * from dependency where parent=?`
    const params = [ deployable ]

    con.query(sql, params, function (err, result) {
      if (err) return reject(err);
      console.log(`Got dependencies for ${deployable}:`, result)
      return resolve(result)
    })
  });//- promise
}

async function getAllVariables_recursive(deployable, prefix, array) {
  console.log(`----------------\ngetAllVariables_recursive(${deployable}, ${prefix})`)

  // Step 1: Select the variables for this deployable
  let variables = await getVariables(deployable)
  variables.forEach(variable => {
    array.push({
      variableName: `${prefix}${variable.name}`,
      value: '',
      type: 'text'
    })
  })

  // Select dependencies with SQL 
  let dependencies = await getDependencies(deployable)
  for (let i = 0; i < dependencies.length; i++) {
    let dep = dependencies[i]
    console.log(`  parent=${deployable}, child=${dep.child}`)
    let prefix = dep.prefix ? `${dep.prefix}_` : ``
    await getAllVariables_recursive(dep.child, prefix, array)
  }
};

server.get('/variablesConfig', (req, res, next) => {
  let deployable = req.query.deployable
  console.log(`deployable is ${deployable}`)

  let array = [ ]
  getAllVariables_recursive(deployable, '', array)

  .then(response => {
    console.log(`RESPONSE IS: `, response)
    console.log(`array is `, array)
    res.send(array)
    next()
  })
  .catch (error => {
    console.log(`Error`, error)
  })
}) // ------------ END OF THE VARIABLE/DEPENDENCY CONFIG -------------

/*
 *  /config: Show details of ENVIRONMENT on /config from MySQL db
 *
 */
server.get('/environmentIndex', async (req, res, next) => {
  console.log(`GET /environmentIndex`);

  let environmentName = req.query.environmentName;
  let con = await db.checkConnection()
  const sql = `SELECT * FROM environment WHERE name=?`
  const params = [ environmentName ]

  con.query(sql, params, function (err, result) {
    if (err) throw err;
    console.log("Result: " + result);

    res.send({ record: result[0] })
    next()
  });
});
// ******************** end of /config server calls *********************

// ******************** All server calls related to /newDeployable page *********************
/*
*  /newDeployable: Add NEW DEPLOYABLE from /newDeployable on MySQL db
*  ~~ This adds to db deployable ~~
*/
server.use(restify.plugins.queryParser({
  mapParams: true
}));
server.use(restify.plugins.bodyParser({
  mapParams: true
}));
server.use(restify.plugins.acceptParser(server.acceptable));

// server.post('/newDeployable', async (req, res, next) => {
//   console.log(`POST /newDeployable`)

//   let con = await db.checkConnection()
//   const sql = `INSERT INTO deployable SET ?`
//   const newDeployable = {name: req.params.name, is_project: req.params.is_project, product_owner: req.params.product_owner, description: req.params.description}

//   con.query(sql, newDeployable, (err, result) => {
//     if (err) throw err;
//     console.log("Result: NEW Name- " + req.params.name + " Owner- " + req.params.product_owner + " Description- " + req.params.description + " Is project- " + req.params.is_project) 
//     return next();
//   }) 
// }); // ******************** end of /newDeployable server calls *********************

// ******************** All server calls related to /newEnvironment page *********************
/*
*  /newEnvironment: Add NEW ENVIRONMENT from /newEnvironment on MySQL db
*  ~~ This adds to db environment ~~
*/
server.use(restify.plugins.queryParser({
  mapParams: true
}));
server.use(restify.plugins.bodyParser({
  mapParams: true
}));
server.use(restify.plugins.acceptParser(server.acceptable));

// server.post('/newEnvironment', async (req, res, next) => {
//   console.log(`POST /newEnvironment`)

//   let con = await db.checkConnection()
//   const sql = `INSERT INTO environment SET ?`
//   const newEnvironment = {name: req.params.name, description: req.params.description, notes: req.params.notes, is_universal: req.params.is_universal}

//   con.query(sql, newEnvironment, (err, result) => {
//     if (err) throw err;
//     console.log("Result: NEW Name- " + req.params.name + " Notes- " + req.params.notes + " Description- " + req.params.description + " isuniversal -" + req.params.is_universal) 
//     return next();
//   })
// }); // ******************** end of /newEnvironment server calls ***********************

// ******************** All server calls related to /newUser page *********************
/*
*  /newUser: Add NEW USER from /newUser on MySQL db
*  ~~ This adds to db user ~~
*/
server.use(restify.plugins.queryParser({
  mapParams: true
}));
server.use(restify.plugins.bodyParser({
  mapParams: true
}));
server.use(restify.plugins.acceptParser(server.acceptable));

// server.post('/newUser', async (req, res, next) => {
//   console.log(`POST /newUser`)

//   let con = await db.checkConnection()
//   const userValues = {first_name: req.params.first_name, last_name: req.params.last_name, role: req.params.role, access: req.params.access, email: req.params.email}
//   let sql = `INSERT INTO user SET ?`
//   let params = [ userValues ]

//     const access = req.params.access;
//     const role = req.params.role;
//     const email = req.params.email;
//     const id = req.params.id;
//     const sql = `UPDATE user SET access =?, role =?, email =? Where id =?`
//     const params = [ access, role, email, id ]

//     con.query(sql, params, (err, result) => {
//         if (err) throw err;

//         console.log("Updated: " + req.params.access + ' ' + req.params.role + ' ' + req.params.email)
//         // con.end();

//         // Send a success reply
//         res.send({ status: 'ok' })
//         return next();
//       })
//   // })  
//   }); // End of section

  // Adding a new deployable to the DB
  server.use(restify.plugins.queryParser({
    mapParams: true
  }));
  server.use(restify.plugins.bodyParser({
    mapParams: true
  }));
  server.use(restify.plugins.acceptParser(server.acceptable));
  
  server.post('/newDeployable', auth, async (req, res, next) => {
    console.log('------------------------------')
    console.log(`POST /newDeployable`)
    // var con = mysql.createConnection({
    //       host: "localhost",
    //       port: 56911,
    //       database: "juice",
    //       user: "root",
    //       password: ""
    //    })
    let me = req.identity.username
  console.log(`I am ${me}`);

    // con.connect(function(err, result) {
    //   if (err) throw err;
    let con = await db.checkConnection()

    const sql = `INSERT INTO deployable SET ?`
    const newDeployable = {
      owner: me,
      name: req.params.name,
      is_project: req.params.is_project,
      product_owner: req.params.product_owner,
      description: req.params.description
    }
    console.log(`sql=${sql}`);
    console.log(`params=`, newDeployable);
    
    
      con.query(sql, newDeployable, (err, result) => {
          if (err) throw err;
  
          console.log("Result: NEW Name- " + req.params.name + " Owner- " + req.params.product_owner + " Description- " + req.params.description + " Is project- " + req.params.is_project) 
          console.log(`result=`, result);
          
          // con.end();
          res.send({ ok: 'ok'})
          return next();
      })
    // })  
  }); // End of section

  // Adding a new environment to the DB
  server.use(restify.plugins.queryParser({
    mapParams: true
  }));
  server.use(restify.plugins.bodyParser({
    mapParams: true
  }));
  server.use(restify.plugins.acceptParser(server.acceptable));

  server.post('/newEnvironment', auth, async (req, res, next) => {
    console.log('------------------------------')
    console.log(`POST /newEnvironment`)

    // var con = mysql.createConnection({
    //   host: "localhost",
    //   port: 56911,
    //   database: "juice",
    //   user: "root",
    //   password: ""
    // })

    // con.connect(function(err, result) {
    //   if (err) throw err;
    let con = await db.checkConnection()
    const sql = `INSERT INTO environment SET ?`
      const newEnvironment = {
        owner: req.identity.username,
        name: req.params.name,
        description: req.params.description,
        notes: req.params.notes,
        is_universal: req.params.is_universal
      }
      console.log(`sql=${sql}`);
      console.log(`newEnv=`, newEnvironment);
      
      
      con.query(sql, newEnvironment, (err, result) => {
          if (err) throw err;

          console.log("Result: NEW Name- " + req.params.name + " Notes- " + req.params.notes + " Description- " + req.params.description + " isuniversal -" + req.params.is_universal) 
        // con.end();
        res.send({ ok: 'ok'})
        return next();
      })
      // })  
  }); // End of section

  // Adding a new user to the DB
  server.use(restify.plugins.queryParser({
    mapParams: true
  }));
  server.use(restify.plugins.bodyParser({
    mapParams: true
  }));
  server.use(restify.plugins.acceptParser(server.acceptable));

  server.post('/newUser', async (req, res, next) => {
    console.log(`POST /newUser`)

    // var con = mysql.createConnection({
    //   host: "localhost",
    //   port: 56911,
    //   database: "juice",
    //   user: "root",
    //   password: ""
    // })

    // con.connect(function(err, result) {
    //   if (err) throw err;
    let con = await db.checkConnection()

      const userValues = {first_name: req.params.first_name, last_name: req.params.last_name, role: req.params.role, access: req.params.access, email: req.params.email}

      let sql = `INSERT INTO user SET ?`
      let params = [ userValues ]

      con.query(sql, params, (err, result) => {
        if (err) throw err;
        console.log("Result: NEW user- " + req.params.first_name + ' ' + req.params.last_name +  " role- " + req.params.role + " access- " + req.params.access) 
      // con.end();

      // Send reply
      res.send({ status: 'ok' })
      return next();
    })
    // })  
  }); // End of section

  // Adding a new project user to the DB
  server.use(restify.plugins.queryParser({
    mapParams: true
  }));
  server.use(restify.plugins.bodyParser({
    mapParams: true
  }));
  server.use(restify.plugins.acceptParser(server.acceptable));
  server.post('/newProjectUser', async (req, res, next) => {
    console.log(`POST /newProjectUser`)

    let con = await db.checkConnection()
      const userValues = {user_id: req.params.id, project: req.params.project, access: req.params.access}
      let sql = `INSERT INTO project_user SET ?`
      let params = [ userValues ]

      con.query( sql, params, (err, result) => {
        if (err) throw err;

        console.log("Result: NEW project user- " + req.params.name + ' project- ' + req.params.project + " access- " + req.params.access) 
        // con.end();

        // Send reply
        res.send({ status: 'ok' })
        return next();
        })
    // })  
  }); // End of section

  // Adding a new environment user to the DB (_environmentName)
  // server.use(restify.plugins.queryParser({
  //   mapParams: true
  // }));
  // server.use(restify.plugins.bodyParser({
  //   mapParams: true
  // }));
  // server.use(restify.plugins.acceptParser(server.acceptable));

  // server.post('/newEnvironmentUser', async (req, res, next) => {
  //   console.log(`POST /newEnvironmentUser`)

  //   let con = await db.checkConnection()

  //     const userValues = {user_id: req.params.id, environment: req.params.environment, access: req.params.access}

  //     let sql = `INSERT INTO environment_user SET ?`
  //     let params = [ userValues ]

  //     con.query( sql, params, (err, result) => {
  //         if (err) throw err;

  //         console.log("Result: NEW environment user- " + req.params.id + ' environment- ' + req.params.environment + " access- " + req.params.access) 
  //         // con.end();

  //         // Send reply
  //         res.send({ status: 'ok' })
  //         return next();
  //         })
  //   // })  
  // }); // End of section

  // Adding a new variable to the DB
  // server.use(restify.plugins.queryParser({
  //   mapParams: true
  // }));
  // server.use(restify.plugins.bodyParser({
  //   mapParams: true
  // }));
  // server.use(restify.plugins.acceptParser(server.acceptable));
  // server.post('/newVariable', async (req, res, next) => {
  //   console.log(`POST /newVariable`)
  //   // var con = mysql.createConnection({
  //   //       host: "localhost",
  //   //       port: 56911,
  //   //       database: "juice",
  //   //       user: "root",
  //   //       password: ""
  //   //   })

  //   // con.connect(function(err, result) {
  //   //   if (err) throw err;
  //   let con = await db.checkConnection()

  //     const variableValues = {name: req.params.name, description: req.params.description, type: req.params.type, mandatory: req.params.mandatory, deployable: req.params.deployable, is_external: req.params.external}

  //     let sql = `INSERT INTO variable SET ?`
  //     let params = [ variableValues ]

  //     con.query( sql, params, (err, result) => {
  //         if (err) throw err;

  //         console.log("Result: NEW variable- " + req.params.name + " deployable- " + req.params.deployable + " Description- " + req.params.description) 
  //         // con.end();

  //         // Send reply
  //         res.send({ status: 'ok' })
  //         return next();
  //         })
  //   // })  
  //   }); // End of section

  // // Adding a new deployment to the DB
  // server.use(restify.plugins.queryParser({
  //   mapParams: true
  // }));
  // server.use(restify.plugins.bodyParser({
  //   mapParams: true
  // }));
  // server.use(restify.plugins.acceptParser(server.acceptable));
  // server.post('/newDeployment', async (req, res, next) => {
  //   console.log(`POST /newDeployment`)

  //   // var con = mysql.createConnection({
  //   //       host: "localhost",
  //   //       port: 56911,
  //   //       database: "juice",
  //   //       user: "root",
  //   //       password: ""
  //   //   })

  //   // con.connect(function(err, result) {
  //   //   if (err) throw err;
  //   let con = await db.checkConnection()

  //     const deploymentValues = {notes: req.params.notes, deployable: req.params.deployable, environment: req.params.environment}

  //     let sql = `INSERT INTO deployments SET ?`
  //     let params = [ deploymentValues ]

  //     con.query( sql, params, (err, result) => {
  //         if (err) throw err;

  //         console.log("Result: NEW deployment " + req.params.deployable + " environment- " + req.params.environment + " notes- " + req.params.notes) 
  //       // con.end();

  //       // Send reply
  //       res.send({ status: 'ok' })
  //       return next();
  //     })
  //   // })  
  //   }); // End of section

  // // Adding a new dependency to the DB
  // server.use(restify.plugins.queryParser({
  //   mapParams: true
  // }));
  // server.use(restify.plugins.bodyParser({
  //   mapParams: true
  // }));
  // server.use(restify.plugins.acceptParser(server.acceptable));
  // server.post('/newDependency', async (req, res, next) => {
  //   console.log(`POST /newDependency`)

  //   // var con = mysql.createConnection({
  //   //       host: "localhost",
  //   //       port: 56911,
  //   //       database: "juice",
  //   //       user: "root",
  //   //       password: ""
  //   //   })

  //   // con.connect(function(err, result) {
  //   //   if (err) throw err;
  //   let con = await db.checkConnection()

  //     const dependencyValues = {parent: req.params.deployable, child: req.params.child, prefix: req.params.prefix, version: req.params.version}

  //     let sql = `INSERT INTO dependency SET ?`
  //     let params = [ dependencyValues ]

  //     con.query( sql, params, (err, result) => {
  //         if (err) throw err;

  //         console.log("Result: NEW dependency " + req.params.deployable + " child- " + req.params.child + " prefix- " + req.params.prefix) 
  //         // con.end();

  //         // Send reply
  //         res.send({ status: 'ok' })
  //         return next();
  //         })
  //   // })  
  //   }); // End of section

  // Editing a variable on the DB
  // server.use(restify.plugins.queryParser({
  //   mapParams: true
  // }));
  // server.use(restify.plugins.bodyParser({
  //   mapParams: true
  // }));
  // server.use(restify.plugins.acceptParser(server.acceptable));

  // server.post('/variable', async (req, res, next) => {
  //   console.log(`POST /variable`)

  //   // var con = mysql.createConnection({
  //   //       host: "localhost",
  //   //       port: 56911,
  //   //       database: "juice",
  //   //       user: "root",
  //   //       password: ""
  //   //   })

  //   // con.connect(function(err, result) {
  //   //   if (err) throw err;
  //   let con = await db.checkConnection()
      
  //     const deployable = req.params.deployable;
  //     const name = req.params.name;
  //     const description = req.params.description;
  //     const type = req.params.type;
  //     const mandatory = req.params.mandatory;
  //     const is_external = req.params.external;
 
  //     let sql = `UPDATE variable SET type=?, description =?, mandatory=?, is_external=? WHERE name=? AND deployable=?`
  //     let params = [ type, description, mandatory, is_external, name, deployable ]
  //     console.log(`sql=${sql}`)
  //     console.log(`params=`, params)

  //     con.query(sql, params, (err, result) => {
  //       if (err) throw err;

  //       console.log("Result: ", result)
  //       // con.end();

  //       // Send a success reply
  //       res.send({ status: 'ok' })
  //       return next();
  //       })
  //   // })  
  // }); // End of section

  // // Editing a user on the project_user DB
  // server.use(restify.plugins.queryParser({
  //   mapParams: true
  // }));
  // server.use(restify.plugins.bodyParser({
  //   mapParams: true
  // }));
  // server.use(restify.plugins.acceptParser(server.acceptable));

  // server.post('/editUser', async (req, res, next) => {
  //   console.log(`POST /editUser`)

  //   // var con = mysql.createConnection({
  //   //       host: "localhost",
  //   //       port: 56911,
  //   //       database: "juice",
  //   //       user: "root",
  //   //       password: ""
  //   //   })

  //   // con.connect(function(err, result) {
  //   //   if (err) throw err;
  //   let con = await db.checkConnection()
      
  //     const id = req.params.id;
  //     const access = req.params.access;
  //     const project = req.params.project;
 
  //     let sql = `UPDATE project_user SET access=? WHERE user_id=? AND project=?`
  //     let params = [ access, id, project ]
  //     console.log(`sql=${sql}`)
  //     console.log(`params=`, params)

  //     con.query(sql, params, (err, result) => {
  //       if (err) throw err;

  //       console.log("Result: ", result)
  //       // con.end();

  //       // Send a success reply
  //       res.send({ status: 'ok' })
  //       return next();
  //       })
  //   // })  
  // }); // End of section

  // // Editing a user on the environment_user DB
  // server.use(restify.plugins.queryParser({
  //   mapParams: true
  // }));
  // server.use(restify.plugins.bodyParser({
  //   mapParams: true
  // }));
  // server.use(restify.plugins.acceptParser(server.acceptable));

  // server.post('/editEnvUser', async (req, res, next) => {
  //   console.log(`POST /editEnvUser`)

  //   // var con = mysql.createConnection({
  //   //       host: "localhost",
  //   //       port: 56911,
  //   //       database: "juice",
  //   //       user: "root",
  //   //       password: ""
  //   //   })

  //   // con.connect(function(err, result) {
  //   //   if (err) throw err;
  //   let con = await db.checkConnection()

  //     const id = req.params.id;
  //     const access = req.params.access;
  //     const environment = req.params.environment;
 
  //     let sql = `UPDATE environment_user SET access=? WHERE user_id=? AND environment=?`
  //     let params = [ access, id, environment ]
  //     console.log(`sql=${sql}`)
  //     console.log(`params=`, params)

  //     con.query(sql, params, (err, result) => {
  //       if (err) throw err;

  //       console.log("Result: ", result)
  //       // con.end();

  //       // Send a success reply
  //       res.send({ status: 'ok' })
  //       return next();
  //     })
  //   // })  
  // }); // End of section

// =======
//   con.query(sql, params, (err, result) => {
//     if (err) throw err;
//     console.log("Result: NEW user- " + req.params.first_name + ' ' + req.params.last_name +  " role- " + req.params.role + " access- " + req.params.access) 

//     // Send reply
//     res.send({ status: 'ok' })
//     return next();
//   })
// }); // ******************** end of /newUser server calls *********************
// >>>>>>> b358488128689c398a8de1ef6e727f3a03c99cfc

/*
*       Display a nice banner.
*       See https://www.npmjs.com/package/figlet
*/
console.log();
console.log(figlet.textSync('juice-api', {
  horizontalLayout: 'fitted'
}));
console.log();

server.listen(4000, function() {
  console.log('%s listening at %s', server.name, server.url);
});
