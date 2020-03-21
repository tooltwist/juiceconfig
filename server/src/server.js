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

  const sql = `(SELECT deployable.name, deployable.is_project, deployable.product_owner, deployable.description FROM deployable INNER JOIN project_user ON deployable.name = project_user.project AND project_user.user_id =?) UNION (SELECT * FROM deployable WHERE deployable.is_project = 'no')`
  const params = [ userIdentity ]
  console.log(`SQL IS ${sql}`)

  let con = await db.checkConnection()
  con.query(sql, params, function (err, result) {
    if (err) throw err;
    res.send({ list: result })
    // con.end()
    next()
  });
});

/*
 *  /deployables: Selects all DEPLOYABLES from MySQL db
 *  
 */
server.get('/showDeployables', async (req, res, next) => {
  console.log('------------------------------')
  console.log(`GET /showDeployables`);

  // var con = mysql.createConnection({
  //   host: "localhost",
  //   port: 56911,
  //   database: "juice",
  //   user: "root",
  //   password: ""
  // });

  // con.connect(function(err) {
  //   if (err) throw err;
  //   console.log("Connected!");
  let con = await db.checkConnection()

    const sql = `(SELECT * FROM deployable)`

    console.log(`SQL IS ${sql}`)
    con.query(sql, function (err, result) {
      if (err) throw err;
      res.send({ list: result })
      // con.end()
      next()
    });
  // });
}); // ******************** end of /deployables server calls *********************

// ********************** All server calls related to /_deployableNAME page **********************
/*
 *  /_deployableNAME: Dynamically select the DEPLOYABLE for /_deployableNAME from MySQL db
 *  
 */
server.get('/deployable', async (req, res, next) => {
  console.log(`GET /deployable`);

  // console.log(`PAERAMS IS `, req.query)
  let deployableName = req.query.deployableName

  // var con = mysql.createConnection({
  //   host: "localhost",
  //   port: 56991,
  //   database: "juice",
  //   user: "root",
  //   password: ""
  // });

  // con.connect(function(err) {
  //   if (err) throw err;
  //   console.log("Connected!");
    let con = await db.checkConnection()

    const sql = `SELECT * from deployable where name=?`
    const params = [ deployableName ]
    // console.log(`SQL IS ${sql}`)
    // console.log(`PARAMS IS`, params)
    con.query(sql, params, function (err, result) {
      if (err) throw err;
      console.log("Result: " + result);
      console.log(`result[0]=`, result[0]);
      res.send({ record: result[0] })
      // con.end()
      next()
    });
  // });
});

/*
 *  /_deployableNAME: Dynamically select the ENVIRONMENT for /_deployableNAME from MySQL db
 *  
 */
server.get('/envDeployments', async (req, res, next) => {
  console.log(`GET /envDeployments`);

  // console.log(`PAERAMS IS `, req.query)
  let deployableName = req.query.deployableName

  // var con = mysql.createConnection({
  //   host: "localhost",
  //   port: 56911,
  //   database: "juice",
  //   user: "root",
  //   password: ""
  // });

  // con.connect(function(err) {
  //   if (err) throw err;
  //   console.log("Connected!");
  let con = await db.checkConnection()

    const sql = `SELECT * from deployments where deployable =?`
    const params = [ deployableName ];
    
    // console.log(`sql=${sql}`)
    // console.log(`params=`, params)
    con.query(sql, params, function (err, result) {
      if (err) throw err;
      console.log("Result: " + result);
      res.send({ deployments: result })
      // con.end()
      next()
    });
  // });
});

/*
 *  /_deployableNAME: Dynamically select the USERS for /_deployableNAME from MySQL db
 *  
 */
server.get('/project_users', async (req, res, next) => {
  console.log(`GET /project_users`);

  let deployableName = req.query.deployableName

  // var con = mysql.createConnection({
  //   host: "localhost",
  //   port: 56911,
  //   database: "juice",
  //   user: "root",
  //   password: ""
  // })

  // con.connect(function(err) {
  //   if (err) throw err;
  //   console.log(`Connected!`);
  let con = await db.checkConnection()

    const sql = `SELECT PU.project, PU.user_id, PU.access, U.first_name, U.last_name FROM project_user PU left outer join user U on PU.user_id = U.id WHERE PU.project=?`
    let params = [ deployableName ]
    con.query(sql, params, function (err, result) {
      if (err) throw err;
      res.send({ users: result })
      // con.end()
      next()
    })
  // })
})

/*
 *  /_deployableNAME: Dynamically select ALL DEPENDENCIES from MySQL db
 *  
 */
server.get('/dependencies', async (req, res, next) => {
  console.log(`GET /dependencies`);

  // var con = mysql.createConnection({
  //   host: "localhost",
  //   port: 56911,
  //   database: "juice",
  //   user: "root",
  //   password: ""
  // });

  // con.connect(function(err) {
  //   if (err) throw err;
  //   console.log("Connected!");
  let con = await db.checkConnection()

    const sql = `SELECT * from dependency`
    con.query(sql, function (err, result) {
      if (err) throw err;
      res.send({ dependencies: result })
      // con.end()
      next()
    });
  // });
});

/*
 *  /_deployableNAME: Dynamically select DEPENDENCIES for /_deployableNAME from MySQL db
 *  
 */
server.get('/dependencies1', async (req, res, next) => {
  console.log(`GET /dependencies1`);

  // console.log(`PARAMS IS `, req.query)
  let deployableName = req.query.deployableName

  // var con = mysql.createConnection({
  //   host: "localhost",
  //   port: 56911,
  //   database: "juice",
  //   user: "root",
  //   password: ""
  // });

  // con.connect(function(err) {
  //   if (err) throw err;
  //   console.log("Connected!");
  let con = await db.checkConnection()

    const sql = `SELECT * from dependency where parent=?`
    const params = [ deployableName ]
    con.query(sql, params, function (err, result) {
      if (err) throw err;
      res.send({ dependencies: result })
      // con.end()
      next()
    });
  // });
});

/*
 *  /_deployableNAME: Dynamically select ALL VARIABLES from MySQL db
 *  
 */  
server.get('/variablesAll', async (req, res, next) => {
  console.log(`GET /variablesAll`);

  // var con = mysql.createConnection({
  //   host: "localhost",
  //   port: 56911,
  //   database: "juice",
  //   user: "root",
  //   password: ""
  // });

  // con.connect(function(err) {
  //   if (err) throw err;
  //   console.log("Connected!");
  let con = await db.checkConnection()

    const sql = `SELECT * FROM variable`
    console.log(`sql=${sql}`)
    con.query(sql, function (err, result) {
      if (err) throw err;
      console.log("Result: " + result);
      console.log(`result[0]=`, result[0]);
      res.send({ variables: result })
      // con.end()
      next()
    });
  // });
});

/*
 *  /_deployableNAME: Dynamically select VARIABLES for /_deployableNAME from MySQL db
 *  
 */
server.get('/variables', async (req, res, next) => {
  console.log(`GET /variables`);

  // console.log(`PAERAMS IS `, req.query)
  let deployableName = req.query.deployableName

  // var con = mysql.createConnection({
  //   host: "localhost",
  //   port: 56911,
  //   database: "juice",
  //   user: "root",
  //   password: ""
  // });

  // con.connect(function(err) {
  //   if (err) throw err;
  //   console.log("Connected!");
  let con = await db.checkConnection()

    const sql = `SELECT * from variable where deployable=?`
    const params = [ deployableName ]
    console.log(`sql=${sql}`)
    console.log(`params=`, params)
    con.query(sql, params, function (err, result) {
      if (err) throw err;
      console.log("Result: " + result);
      console.log(`result[0]=`, result[0]);
      res.send({ variables: result })
      // con.end()
      next()
    });
  // });
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

  // var con = mysql.createConnection({
  //       host: "localhost",
  //       port: 56911,
  //       database: "juice",
  //       user: "root",
  //       password: ""
  //    })

  // con.connect(function(err, result) {
  //   if (err) throw err;
  let con = await db.checkConnection()
    
    const product_owner = req.params.product_owner;
    const description = req.params.description;
    const is_project = req.params.is_project;
    const name = req.params.name;
    const sql = `UPDATE deployable SET product_owner =?, description =?, is_project =? Where name =?`
    const params = [ product_owner, description, is_project, name ]
    con.query(sql, params, (err, res) => {
        if (err) throw err;
        console.log("Result: " + req.params.product_owner + ' ' + req.params.description + ' ' + req.params.is_project)
    // con.end();

    // Send a success reply
      res.send({ status: 'ok' })
      return next();
    })
  // })
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
server.post('/newProjectUser', async (req, res, next) => {
  console.log(`POST /newProjectUser`)

  // var con = mysql.createConnection({
  //       host: "localhost",
  //       port: 56911,
  //       database: "juice",
  //       user: "root",
  //       password: ""
  //   })

  // con.connect(function(err, result) {
  //   if (err) throw err;
  let con = await db.checkConnection()

    const userValues = {user_id: req.params.id, project: req.params.project, access: req.params.access}

    let sql = `INSERT INTO project_user SET ?`
    let params = [ userValues ]

    con.query( sql, params, (err, res) => {
      if (err) throw err;

      console.log("Result: NEW project user- " + req.params.name + ' project- ' + req.params.project + " access- " + req.params.access) 
      // con.end();

      // Send reply
      res.send({ status: 'ok' })
      return next();
      })
  // })  
}); // End of section

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
  // var con = mysql.createConnection({
  //       host: "localhost",
  //       port: 56911,
  //       database: "juice",
  //       user: "root",
  //       password: ""
  //   })

  // con.connect(function(err, result) {
  //   if (err) throw err;
  let con = await db.checkConnection()

    const variableValues = {name: req.params.name, description: req.params.description, type: req.params.type, mandatory: req.params.mandatory, deployable: req.params.deployable, is_external: req.params.external}

    let sql = `INSERT INTO variable SET ?`
    let params = [ variableValues ]

    con.query( sql, params, (err, res) => {
        if (err) throw err;

        console.log("Result: NEW variable- " + req.params.name + " deployable- " + req.params.deployable + " Description- " + req.params.description) 
        // con.end();

        // Send reply
        res.send({ status: 'ok' })
        return next();
        })
  // })  
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

  // var con = mysql.createConnection({
  //       host: "localhost",
  //       port: 56911,
  //       database: "juice",
  //       user: "root",
  //       password: ""
  //   })

  // con.connect(function(err, result) {
  //   if (err) throw err;
  let con = await db.checkConnection()
    
    const deployable = req.params.deployable;
    const name = req.params.name;
    const description = req.params.description;
    const type = req.params.type;
    const mandatory = req.params.mandatory;
    const is_external = req.params.external;

    let sql = `UPDATE variable SET type=?, description =?, mandatory=?, is_external=? WHERE name=? AND deployable=?`
    let params = [ type, description, mandatory, is_external, name, deployable ]
    console.log(`sql=${sql}`)
    console.log(`params=`, params)

    con.query(sql, params, (err, res) => {
      if (err) throw err;

      console.log("Result: ", res)
      // con.end();

      // Send a success reply
      res.send({ status: 'ok' })
      return next();
      })
  // })  
}); // End of section

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

  // var con = mysql.createConnection({
  //       host: "localhost",
  //       port: 56911,
  //       database: "juice",
  //       user: "root",
  //       password: ""
  //   })

  // con.connect(function(err, result) {
  //   if (err) throw err;
  let con = await db.checkConnection()

    const dependencyValues = {parent: req.params.deployable, child: req.params.child, prefix: req.params.prefix, version: req.params.version}

    let sql = `INSERT INTO dependency SET ?`
    let params = [ dependencyValues ]

    con.query( sql, params, (err, res) => {
        if (err) throw err;

        console.log("Result: NEW dependency " + req.params.deployable + " child- " + req.params.child + " prefix- " + req.params.prefix) 
        // con.end();

        // Send reply
        res.send({ status: 'ok' })
        return next();
        })
  // })  
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

  // var con = mysql.createConnection({
  //       host: "localhost",
  //       port: 56911,
  //       database: "juice",
  //       user: "root",
  //       password: ""
  //   })

  // con.connect(function(err, result) {
  //   if (err) throw err;
  let con = await db.checkConnection()
    
    const id = req.params.id;
    const access = req.params.access;
    const project = req.params.project;

    let sql = `UPDATE project_user SET access=? WHERE user_id=? AND project=?`
    let params = [ access, id, project ]
    console.log(`sql=${sql}`)
    console.log(`params=`, params)

    con.query(sql, params, (err, res) => {
      if (err) throw err;

      console.log("Result: ", res)
      // con.end();

      // Send a success reply
      res.send({ status: 'ok' })
      return next();
      })
  // })  
}); // ******************** end of /_deployableNAME server calls *********************

// ********************** All server calls related to /_userNAME page **********************
/*
 *  _userName: Dynamically select the USER for /_userName from MySQL database
 *  (See https://www.w3schools.com/nodejs/nodejs_mysql.asp)
 */
server.get('/userName', async (req, res, next) => {
  console.log(`GET /userName`);

  // console.log(`PAERAMS IS `, req.query)
  let userID = req.query.userID

  // var con = mysql.createConnection({
  //   host: "localhost",
  //   port: 56911,
  //   database: "juice",
  //   user: "root",
  //   password: ""
  // });

  // con.connect(function(err) {
  //   if (err) throw err;
  //   console.log("Connected!");

    let con = await db.checkConnection()


    const sql = `SELECT * from user where id=?`
    const params = [ userID ]
    // console.log(`SQL IS ${sql}`)
    // console.log(`PARAMS IS`, params)
    con.query(sql, params, function (err, result) {
      if (err) throw err;
      console.log("Result: " + result);
      console.log(`result[0]=`, result[0]);
      res.send({ record: result[0] })
      // con.end()
      next()
    });
  // });
});

/*
 *  _userName: Dynamically select the PROJECTS for /_userName from MySQL database
 *  
 */
server.get('/usersProjects', async (req, res, next) => {
  console.log(`GET /usersProjects`);

  // console.log(`PAERAMS IS `, req.query)
  let userID = req.query.userID

  // var con = mysql.createConnection({
  //   host: "localhost",
  //   port: 56911,
  //   database: "juice",
  //   user: "root",
  //   password: ""
  // });

  // con.connect(function(err) {
  //   if (err) throw err;
  //   console.log("Connected!");
  let con = await db.checkConnection()
  
    const sql = `SELECT * from project_user where user_id=?`
    const params = [ userID ]
    console.log(`SQL IS ${sql}`)
    console.log(`PARAMS IS`, params)
    con.query(sql, params, function (err, result) {
      if (err) throw err;
      console.log("Result: " + result);
      res.send({ records: result })
      // con.end()
      next()
    });
  // });
});

/*
 *  _userName: Dynamically select the ENVIRONMENTS for /_userName from MySQL database
 *  
 */
server.get('/usersEnvironments', async (req, res, next) => {
  console.log(`GET /usersEnvironments`);

  // console.log(`PAERAMS IS `, req.query)
  let userID = req.query.userID

  // var con = mysql.createConnection({
  //   host: "localhost",
  //   port: 56911,
  //   database: "juice",
  //   user: "root",
  //   password: ""
  // });

  // con.connect(function(err) {
  //   if (err) throw err;
  //   console.log("Connected!");
  let con = await db.checkConnection()

    const sql = `SELECT * from environment_user where user_id=?`
    const params = [ userID ]
    con.query(sql, params, function (err, result) {
      if (err) throw err;
      console.log("Result: " + result);
      res.send({ records: result })
      // con.end()
      next()
    });
  // });
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

  // var con = mysql.createConnection({
  //       host: "localhost",
  //       port: 56911,
  //       database: "juice",
  //       user: "root",
  //       password: ""
  //    })

  // con.connect(function(err, result) {
  //   if (err) throw err;
  let con = await db.checkConnection()

    const access = req.params.access;
    const role = req.params.role;
    const email = req.params.email;
    const id = req.params.id;
    const sql = `UPDATE user SET access =?, role =?, email =? Where id =?`
    const params = [ access, role, email, id ]

    con.query(sql, params, (err, res) => {
        if (err) throw err;

        console.log("Updated: " + req.params.access + ' ' + req.params.role + ' ' + req.params.email)
        // con.end();

        // Send a success reply
        res.send({ status: 'ok' })
        return next();
      })
  // })  
  }); // - end of call
  
/*
 *  _userName: Select ENVIRONMENTS for /_userName on MySQL database
 *  ~~ This uses an innerjoin bt db's environment and environment_user ~~
 */
server.get('/environments', auth, async (req, res, next) => {
  console.log(`-----------------`);
  console.log(`GET /environments`);

  let userIdentity = req.payload.userIdentity
  console.log(`userIdentity is:::`, userIdentity)

  // var con = mysql.createConnection({
  //   host: "localhost",
  //   port: 56911,
  //   database: "juice",
  //   user: "root",
  //   password: ""
  // });

  // con.connect(function(err) {
  //   if (err) throw err;
  //   console.log("Connected!");
  let con = await db.checkConnection()

    const sql = `(SELECT environment.name, environment.description, environment.notes, environment.is_universal FROM environment INNER JOIN environment_user ON environment.name = environment_user.environment AND environment_user.user_id =?) UNION (SELECT environment.name, environment.description, environment.notes, environment.is_universal FROM environment WHERE environment.is_universal = 'yes')`
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
}); // ******************** end of /_userNAME server calls *********************

// ******************** All server calls related to /environment page *********************
/*
 *  /environment: Select ALL ENVIRONMENTS from MySQL database
 *  (See https://www.w3schools.com/nodejs/nodejs_mysql.asp)
 */
server.get('/showEnvironments', async (req, res, next) => {
  console.log(`GET /showEnvironments`);

  // var con = mysql.createConnection({
  //   host: "localhost",
  //   port: 56911,
  //   database: "juice",
  //   user: "root",
  //   password: ""
  // });

  // con.connect(function(err) {
  //   if (err) throw err;
  //   console.log("Connected!");
  let con = await db.checkConnection()

    const sql = `SELECT * FROM environment`
    
    console.log(`SQL IS ${sql}`)
    con.query(sql, function (err, result) {
      if (err) throw err;
      // console.log("Result: " + result);
      // console.log(`result[0]=`, result[0]);
      res.send({ environments: result })
      // con.end()
      next()
    });
  // });
}); // ******************** end of /environment server calls *********************

// ******************** All server calls related to /_environmentNAME page *********************
/*
 *  /_environmentNAME: Select ENVIRONMENT values for /_environmentNAME on MySQL database
 *  
 */
server.get('/environment', async (req, res, next) => {
  console.log(`GET /environment`);

  let environmentName = req.query.environmentName;

  // var con = mysql.createConnection({
  //   host: "localhost",
  //   port: 56911,
  //   database: "juice",
  //   user: "root",
  //   password: ""
  // });

  // con.connect(function(err) {
  //   if (err) throw err;
  //   console.log("Connected!");
  let con = await db.checkConnection()

    const sql = `SELECT * from environment where name=?`
    const params = [ environmentName ]
    con.query(sql, params, function (err, result) {
      if (err) throw err;
      console.log("Result: " + result);
      // console.log(`result[0]=`, result[0]);
      // res.send({ environments: result })
      res.send({ record: result[0] })
      // con.end()
      next()
    });
  // });
});

/*
 *  /_environmentNAME: Select DEPLOYMENTS for /_environmentNAME on MySQL database
 *  
 */
server.get('/deployments', async (req, res, next) => {
  console.log(`GET /deployments`);

  // console.log(`PAERAMS IS `, req.query)
  let environmentName = req.query.environmentName

  // var con = mysql.createConnection({
  //   host: "localhost",
  //   port: 56911,
  //   database: "juice",
  //   user: "root",
  //   password: ""
  // });

  // con.connect(function(err) {
  //   if (err) throw err;
  //   console.log("Connected!");
  let con = await db.checkConnection()

    const sql = `SELECT * from deployments where environment =?`
    const params = [ environmentName ];
    
    console.log(`sql=${sql}`)
    console.log(`params=`, params)
    con.query(sql, params, function (err, result) {
      if (err) throw err;
      console.log("Result: " + result);
      res.send({ deployments: result })
      // con.end()
      next()
    });
  // });
});

/*
 *  /_environmentNAME: Select USERS for /_environmentNAME on MySQL database
 *  
 */
server.get('/environments_users', async (req, res, next) => {
  console.log(`GET /environments_users`);
  
  let environmentName = req.query.environmentName

  // var con = mysql.createConnection({
  //   host: "localhost",
  //   port: 56911,
  //   database: "juice",
  //   user: "root",
  //   password: ""
  // })

  // con.connect(function(err) {
  //   if (err) throw err;
  //   console.log(`Connected!`);
  let con = await db.checkConnection()

    const sql = `SELECT EU.environment, EU.user_id, EU.access, U.first_name, U.last_name FROM environment_user EU left outer join user U on EU.user_id = U.id WHERE EU.environment=?`
    let params = [ environmentName ]
    con.query(sql, params, function (err, result) {
      if (err) throw err;
      res.send({ users: result })
      // con.end()
      next()
    })
  // })
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

  // var con = mysql.createConnection({
  //       host: "localhost",
  //       port: 56911,
  //       database: "juice",
  //       user: "root",
  //       password: ""
  //    })

  // con.connect(function(err, result) {
  //   if (err) throw err;
  let con = await db.checkConnection()

    const name = req.params.name;
    const description = req.params.description;
    const notes = req.params.notes;

    const sql = `UPDATE environment SET description =?, notes =? WHERE name =?`
    const params = [ description, notes, name ]
    con.query(sql, params, (err, res) => {
        if (err) throw err;

        console.log("Result: " + req.params.name + ' ' + req.params.description + ' ' + req.params.notes)
      // con.end();

      // Send a success reply
      res.send({ status: 'ok' })
      return next();
      })
  // })  
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

  // var con = mysql.createConnection({
  //       host: "localhost",
  //       port: 56911,
  //       database: "juice",
  //       user: "root",
  //       password: ""
  //   })

  // con.connect(function(err, result) {
  //   if (err) throw err;
  let con = await db.checkConnection()

    const userValues = {user_id: req.params.id, environment: req.params.environment, access: req.params.access}

    let sql = `INSERT INTO environment_user SET ?`
    let params = [ userValues ]

    con.query( sql, params, (err, res) => {
        if (err) throw err;

        console.log("Result: NEW environment user- " + req.params.id + ' environment- ' + req.params.environment + " access- " + req.params.access) 
        // con.end();

        // Send reply
        res.send({ status: 'ok' })
        return next();
        })
  // })  
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

  // var con = mysql.createConnection({
  //       host: "localhost",
  //       port: 56911,
  //       database: "juice",
  //       user: "root",
  //       password: ""
  //   })

  // con.connect(function(err, result) {
  //   if (err) throw err;
  let con = await db.checkConnection()

    const id = req.params.id;
    const access = req.params.access;
    const environment = req.params.environment;

    let sql = `UPDATE environment_user SET access=? WHERE user_id=? AND environment=?`
    let params = [ access, id, environment ]
    console.log(`sql=${sql}`)
    console.log(`params=`, params)

    con.query(sql, params, (err, res) => {
      if (err) throw err;

      console.log("Result: ", res)
      // con.end();

      // Send a success reply
      res.send({ status: 'ok' })
      return next();
    })
  // })  
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
server.post('/newDeployment', async (req, res, next) => {
  console.log(`POST /newDeployment`)

  // var con = mysql.createConnection({
  //       host: "localhost",
  //       port: 56911,
  //       database: "juice",
  //       user: "root",
  //       password: ""
  //   })

  // con.connect(function(err, result) {
  //   if (err) throw err;
  let con = await db.checkConnection()

    const deploymentValues = {notes: req.params.notes, deployable: req.params.deployable, environment: req.params.environment}

    let sql = `INSERT INTO deployments SET ?`
    let params = [ deploymentValues ]

    con.query( sql, params, (err, res) => {
        if (err) throw err;

        console.log("Result: NEW deployment " + req.params.deployable + " environment- " + req.params.environment + " notes- " + req.params.notes) 
      // con.end();

      // Send reply
      res.send({ status: 'ok' })
      return next();
    })
  // })  
}); // ******************** end of /_environmentNAME server calls *********************

// ******************** All server calls related to /users page *********************
/*
 *  /users: Select all USERS for /users on MySQL database
 *  
 */ 
server.get('/users', async (req, res, next) => {
  console.log(`----------`);
  console.log(`GET /users`);

  // var con = mysql.createConnection({
  //   host: "localhost",
  //   port: 56911,
  //   database: "juice",
  //   user: "root",
  //   password: ""
  // });

  // con.connect(function(err) {
  //   if (err) throw err;
  //   console.log("Connected!");
  let con = await db.checkConnection()

    const sql = `SELECT * from user`
    con.query(sql, function (err, result) {
      if (err) throw err;
      res.send({ users: result })
      // con.end()
      next()
    });
  // });
}); // ******************** end of /users server calls *********************

// ******************** All server calls related to AUTHENTICATION *********************
// Select the user details/accessibility for the current user (logged in)
server.get('/currentUser', auth, async (req, res, next) => {
  console.log(`GET /currentUser`);

  let userIdentity = req.payload.userIdentity
  console.log(`userIdentity is:::`, userIdentity)

  // var con = mysql.createConnection({
  //   host: "localhost",
  //   port: 56911,
  //   database: "juice",
  //   user: "root",
  //   password: ""
  // });

  // con.connect(function(err) {
  //   if (err) throw err;
  //   console.log("Connected!");
  let con = await db.checkConnection()

    const sql = `SELECT * FROM user WHERE user.id =?`
    const params = [ userIdentity ]
    con.query(sql, params, function (err, result) {
      if (err) throw err;
      res.send({ user: result })
      // con.end()
      next()
    });
  // });
}); // ******************** end of AUTHENTICATION server calls *********************


// ******************** All server calls related to /config page *********************
/*
 *  /config: Select VARIABLES for dependencies/deployable on /config from MySQL db
 *  ~~ This section is recursive ~~
 *
 */
async function getVariables(deployable) {
  console.log(`   -------------\ngtVariables(${deployable})`)
  // return null
  let con = await db.checkConnection()

  return new Promise(function(resolve, reject) {

    // const con = mysql.createConnection({
    //   host: "localhost",
    //   port: 56911,
    //   database: "juice",
    //   user: "root",
    //   password: ""
    // });
    const sql = `SELECT * from variable where deployable=?`
    const params = [ deployable ]
    console.log(`sql=${sql}`)
    console.log(`params=`, params)
    con.query(sql, params, function (err, result) {
      // con.end()
      if (err) return reject(err);
      console.log(`Got variables for ${deployable}:`, result)
      return resolve(result)
    })
  });//- promise
}

async function getDependencies(deployable) {
  console.log(`   -------------\ngetDependencies(${deployable})`)
  // return null
  let con = await db.checkConnection()

  return new Promise(function(resolve, reject) {
    // const con = mysql.createConnection({
    //   host: "localhost",
    //   port: 56911,
    //   database: "juice",
    //   user: "root",
    //   password: ""
    // });
    const sql = `SELECT * from dependency where parent=?`
    const params = [ deployable ]
    console.log(`sql=${sql}`)
    console.log(`params=`, params)
    con.query(sql, params, function (err, result) {
      // con.end()
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

  // // Select dependencies with SQL 
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
    // con.end()
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

  // var con = mysql.createConnection({
  //   host: "localhost",
  //   port: 56911,
  //   database: "juice",
  //   user: "root",
  //   password: ""
  // });

  // con.connect(function(err) {
  //   if (err) throw err;
  //   console.log("Connected!");
  let con = await db.checkConnection()

    const sql = `SELECT * FROM environment WHERE name=?`
    const params = [ environmentName ]
    con.query(sql, params, function (err, result) {
      if (err) throw err;
      console.log("Result: " + result);
      // console.log(`result[0]=`, result[0]);
      // res.send({ environments: result })
      res.send({ record: result[0] })
      // con.end()
      next()
    });
  // });
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

server.post('/newDeployable', async (req, res, next) => {
  console.log(`POST /newDeployable`)
  // var con = mysql.createConnection({
  //       host: "localhost",
  //       port: 56911,
  //       database: "juice",
  //       user: "root",
  //       password: ""
  //    })

  // con.connect(function(err, result) {
  //   if (err) throw err;
  let con = await db.checkConnection()

  const sql = `INSERT INTO deployable SET ?`
  const newDeployable = {name: req.params.name, is_project: req.params.is_project, product_owner: req.params.product_owner, description: req.params.description}

    con.query(sql, newDeployable, (err, res) => {
        if (err) throw err;

        console.log("Result: NEW Name- " + req.params.name + " Owner- " + req.params.product_owner + " Description- " + req.params.description + " Is project- " + req.params.is_project) 
        // con.end();
        return next();
    })
  // })  
}); // ******************** end of /newDeployable server calls *********************

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

server.post('/newEnvironment', async (req, res, next) => {
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
    const newEnvironment = {name: req.params.name, description: req.params.description, notes: req.params.notes, is_universal: req.params.is_universal}

    con.query(sql, newEnvironment, (err, res) => {
        if (err) throw err;

        console.log("Result: NEW Name- " + req.params.name + " Notes- " + req.params.notes + " Description- " + req.params.description + " isuniversal -" + req.params.is_universal) 
      // con.end();
      return next();
    })
    // })  
}); // ******************** end of /newEnvironment server calls *********************

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

    con.query(sql, params, (err, res) => {
      if (err) throw err;
      console.log("Result: NEW user- " + req.params.first_name + ' ' + req.params.last_name +  " role- " + req.params.role + " access- " + req.params.access) 
    // con.end();

    // Send reply
    res.send({ status: 'ok' })
    return next();
  })
  // })  
}); // ******************** end of /newUser server calls *********************

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
