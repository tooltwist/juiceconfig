import restify from 'restify';
import corsMiddleware from 'restify-cors-middleware';
import mysql from 'mysql';
import auth from './auth';

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

// Deployables
/*
 *  Select projects from MySQL database
 *  (See https://www.w3schools.com/nodejs/nodejs_mysql.asp)
 */
server.get('/deployables', auth, (req, res, next) => {
  console.log('------------------------------')
  console.log(`Getting deployables from MYSQL`);

  let userIdentity = req.payload.userIdentity
  console.log(`userIdentity is:::`, userIdentity)

  var con = mysql.createConnection({
    host: "localhost",
    port: 56911,
    database: "juice",
    user: "root",
    password: ""
  });

  con.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");

    const sql = `(SELECT deployable.name, deployable.is_project, deployable.product_owner, deployable.description FROM deployable INNER JOIN project_user ON deployable.name = project_user.project AND project_user.user_id =?) UNION (SELECT * FROM deployable WHERE deployable.is_project = 'no')`
    const params = [ userIdentity ]

    console.log(`SQL IS ${sql}`)
    con.query(sql, params, function (err, result) {
      if (err) throw err;
      res.send({ list: result })
      con.end()
      next()
    });
  });
});

// Show all Deployables
/*
 *  Select projects from MySQL database
 *  (See https://www.w3schools.com/nodejs/nodejs_mysql.asp)
 */
server.get('/showDeployables', (req, res, next) => {
  console.log('------------------------------')
  console.log(`Getting deployables from MYSQL`);

  var con = mysql.createConnection({
    host: "localhost",
    port: 56911,
    database: "juice",
    user: "root",
    password: ""
  });

  con.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");

    const sql = `(SELECT * FROM deployable)`

    console.log(`SQL IS ${sql}`)
    con.query(sql, function (err, result) {
      if (err) throw err;
      res.send({ list: result })
      con.end()
      next()
    });
  });
});

// _DeployableNAME - Select the deployable for _deployableName.vue
/*
 *  Select projects from MySQL database
 *  (See https://www.w3schools.com/nodejs/nodejs_mysql.asp)
 */
server.get('/deployable', (req, res, next) => {
  console.log(`Getting deployable from MYSQL`);

  console.log(`PAERAMS IS `, req.query)
  let deployableName = req.query.deployableName

  var con = mysql.createConnection({
    host: "localhost",
    port: 56911,
    database: "juice",
    user: "root",
    password: ""
  });

  con.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");

    const sql = `SELECT * from deployable where name=?`
    const params = [ deployableName ]
    console.log(`SQL IS ${sql}`)
    console.log(`PARAMS IS`, params)
    con.query(sql, params, function (err, result) {
      if (err) throw err;
      console.log("Result: " + result);
      console.log(`result[0]=`, result[0]);
      res.send({ record: result[0] })
      con.end()
      next()
    });
  });
});

// _userName - Select the user for _userName.vue
/*
 *  Select user from MySQL database
 *  (See https://www.w3schools.com/nodejs/nodejs_mysql.asp)
 */
server.get('/userName', (req, res, next) => {
  console.log(`Getting user from MYSQL`);

  console.log(`PAERAMS IS `, req.query)
  let userID = req.query.userID

  var con = mysql.createConnection({
    host: "localhost",
    port: 56911,
    database: "juice",
    user: "root",
    password: ""
  });

  con.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");

    const sql = `SELECT * from user where id=?`
    const params = [ userID ]
    console.log(`SQL IS ${sql}`)
    console.log(`PARAMS IS`, params)
    con.query(sql, params, function (err, result) {
      if (err) throw err;
      console.log("Result: " + result);
      console.log(`result[0]=`, result[0]);
      res.send({ record: result[0] })
      con.end()
      next()
    });
  });
});

// _userName - Select the projects for selected user 
server.get('/usersProjects', (req, res, next) => {
  console.log(`Getting user from MYSQL`);

  console.log(`PAERAMS IS `, req.query)
  let userID = req.query.userID

  //console.log(`PAERAMS IS `, req.query)

  var con = mysql.createConnection({
    host: "localhost",
    port: 56911,
    database: "juice",
    user: "root",
    password: ""
  });

  con.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");

    const sql = `SELECT * from project_user where user_id=?`
    const params = [ userID ]
    console.log(`SQL IS ${sql}`)
    console.log(`PARAMS IS`, params)
    con.query(sql, params, function (err, result) {
      if (err) throw err;
      console.log("Result: " + result);
      res.send({ records: result })
      con.end()
      next()
    });
  });
});

// _userName - Select the environments for selected user 
server.get('/usersEnvironments', (req, res, next) => {
  console.log(`Getting user from MYSQL`);

  console.log(`PAERAMS IS `, req.query)
  let userID = req.query.userID

  var con = mysql.createConnection({
    host: "localhost",
    port: 56911,
    database: "juice",
    user: "root",
    password: ""
  });

  con.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");

    const sql = `SELECT * from environment_user where user_id=?`
    const params = [ userID ]
    con.query(sql, params, function (err, result) {
      if (err) throw err;
      console.log("Result: " + result);
      res.send({ records: result })
      con.end()
      next()
    });
  });
});

// Environments for the selected deployable in _deployableName.vue
server.get('/envDeployments', (req, res, next) => {
  console.log(`Getting deployments from MYSQL`);

  console.log(`PAERAMS IS `, req.query)
  let deployableName = req.query.deployableName

  var con = mysql.createConnection({
    host: "localhost",
    port: 56911,
    database: "juice",
    user: "root",
    password: ""
  });

  con.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");

    const sql = `SELECT * from deployments where deployable =?`
    const params = [ deployableName ];
    
    console.log(`sql=${sql}`)
    console.log(`params=`, params)
    con.query(sql, params, function (err, result) {
      if (err) throw err;
      console.log("Result: " + result);
      res.send({ deployments: result })
      con.end()
      next()
    });
  });
});


// Deployments on the environment page
server.get('/deployments', (req, res, next) => {
  console.log(`Getting deployments from MYSQL`);

  console.log(`PAERAMS IS `, req.query)
  let environmentName = req.query.environmentName

  var con = mysql.createConnection({
    host: "localhost",
    port: 56911,
    database: "juice",
    user: "root",
    password: ""
  });

  con.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");

    const sql = `SELECT * from deployments where environment =?`
    const params = [ environmentName ];
    
    console.log(`sql=${sql}`)
    console.log(`params=`, params)
    con.query(sql, params, function (err, result) {
      if (err) throw err;
      console.log("Result: " + result);
      res.send({ deployments: result })
      con.end()
      next()
    });
  });
});

// Environments 
/*
 *  Select environments from MySQL database
 *  (See https://www.w3schools.com/nodejs/nodejs_mysql.asp)
 */
server.get('/environments', auth, (req, res, next) => {
  console.log(`Getting environments from MYSQL`);

  let userIdentity = req.payload.userIdentity
  console.log(`userIdentity is:::`, userIdentity)

  var con = mysql.createConnection({
    host: "localhost",
    port: 56911,
    database: "juice",
    user: "root",
    password: ""
  });

  con.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");

    const sql = `(SELECT environment.name, environment.description, environment.notes, environment.is_universal FROM environment INNER JOIN environment_user ON environment.name = environment_user.environment AND environment_user.user_id =?) UNION (SELECT environment.name, environment.description, environment.notes, environment.is_universal FROM environment WHERE environment.is_universal = 'yes')`
    const params = [ userIdentity ]
    
    console.log(`SQL IS ${sql}`)
    con.query(sql, params, function (err, result) {
      if (err) throw err;
      // console.log("Result: " + result);
      // console.log(`result[0]=`, result[0]);
      res.send({ environments: result })
      con.end()
      next()
    });
  });
});

// Show all the Environments 
/*
 *  Select environments from MySQL database
 *  (See https://www.w3schools.com/nodejs/nodejs_mysql.asp)
 */
server.get('/showEnvironments', (req, res, next) => {
  console.log(`Getting environments from MYSQL`);

  var con = mysql.createConnection({
    host: "localhost",
    port: 56911,
    database: "juice",
    user: "root",
    password: ""
  });

  con.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");

    const sql = `SELECT * FROM environment`
    
    console.log(`SQL IS ${sql}`)
    con.query(sql, function (err, result) {
      if (err) throw err;
      // console.log("Result: " + result);
      // console.log(`result[0]=`, result[0]);
      res.send({ environments: result })
      con.end()
      next()
    });
  });
});

// _environmentName.vue - Show details for the selected environment 
server.get('/environment', (req, res, next) => {
  console.log(`Getting environments from MYSQL`);

  let environmentName = req.query.environmentName;

  var con = mysql.createConnection({
    host: "localhost",
    port: 56911,
    database: "juice",
    user: "root",
    password: ""
  });

  con.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");

    const sql = `SELECT * from environment where name=?`
    const params = [ environmentName ]
    con.query(sql, params, function (err, result) {
      if (err) throw err;
      console.log("Result: " + result);
      // console.log(`result[0]=`, result[0]);
      // res.send({ environments: result })
      res.send({ record: result[0] })
      con.end()
      next()
    });
  });
});

// config/index.vue - Show details for the selected environment 
server.get('/environmentIndex', (req, res, next) => {
  console.log(`Getting environments from MYSQL`);

  let environmentName = req.query.environmentName;

  var con = mysql.createConnection({
    host: "localhost",
    port: 56911,
    database: "juice",
    user: "root",
    password: ""
  });

  con.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");

    const sql = `SELECT * FROM environment WHERE name=?`
    const params = [ environmentName ]
    con.query(sql, params, function (err, result) {
      if (err) throw err;
      console.log("Result: " + result);
      // console.log(`result[0]=`, result[0]);
      // res.send({ environments: result })
      res.send({ record: result[0] })
      con.end()
      next()
    });
  });
});

//Users 
server.get('/users', (req, res, next) => {
  console.log(`Getting users from MYSQL`);

  var con = mysql.createConnection({
    host: "localhost",
    port: 56911,
    database: "juice",
    user: "root",
    password: ""
  });

  con.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");

    const sql = `SELECT * from user`
    con.query(sql, function (err, result) {
      if (err) throw err;
      res.send({ users: result })
      con.end()
      next()
    });
  });
});

// Select the user details/accessibility for the current user (logged in)
server.get('/currentUser', auth, (req, res, next) => {
  console.log(`Getting current user information from MYSQL`);

  let userIdentity = req.payload.userIdentity
  console.log(`userIdentity is:::`, userIdentity)

  var con = mysql.createConnection({
    host: "localhost",
    port: 56911,
    database: "juice",
    user: "root",
    password: ""
  });

  con.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");

    const sql = `SELECT * FROM user WHERE user.id =?`
    const params = [ userIdentity ]
    con.query(sql, params, function (err, result) {
      if (err) throw err;
      res.send({ user: result })
      con.end()
      next()
    });
  });
});

// Users for the selected deployable
server.get('/project_users', (req, res, next) => {
  console.log(`Get project's users from MySQL`);

  let deployableName = req.query.deployableName

  var con = mysql.createConnection({
    host: "localhost",
    port: 56911,
    database: "juice",
    user: "root",
    password: ""
  })

  con.connect(function(err) {
    if (err) throw err;
    console.log(`Connected!`);

    const sql = `SELECT PU.project, PU.user_id, PU.access, U.first_name, U.last_name FROM project_user PU left outer join user U on PU.user_id = U.id WHERE PU.project=?`
    let params = [ deployableName ]
    con.query(sql, params, function (err, result) {
      if (err) throw err;
      res.send({ users: result })
      con.end()
      next()
    })
  })
})

// Users for the selected environment
server.get('/environments_users', (req, res, next) => {
  console.log(`Get environment's users from MySQL`);
  
  let environmentName = req.query.environmentName

  var con = mysql.createConnection({
    host: "localhost",
    port: 56911,
    database: "juice",
    user: "root",
    password: ""
  })

  con.connect(function(err) {
    if (err) throw err;
    console.log(`Connected!`);

    const sql = `SELECT EU.environment, EU.user_id, EU.access, U.first_name, U.last_name FROM environment_user EU left outer join user U on EU.user_id = U.id WHERE EU.environment=?`
    let params = [ environmentName ]
    con.query(sql, params, function (err, result) {
      if (err) throw err;
      res.send({ users: result })
      con.end()
      next()
    })
  })
})

// Dependencies 
server.get('/dependencies', (req, res, next) => {
  console.log(`Getting dependencies from MYSQL`);

  var con = mysql.createConnection({
    host: "localhost",
    port: 56911,
    database: "juice",
    user: "root",
    password: ""
  });

  con.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");

    const sql = `SELECT * from dependency`
    con.query(sql, function (err, result) {
      if (err) throw err;
      res.send({ dependencies: result })
      con.end()
      next()
    });
  });
});

// Dependencies for a selected deployable
server.get('/dependencies1', (req, res, next) => {
  console.log(`Getting dependencies from MYSQL`);

  console.log(`PARAMS IS `, req.query)
  let deployableName = req.query.deployableName

  var con = mysql.createConnection({
    host: "localhost",
    port: 56911,
    database: "juice",
    user: "root",
    password: ""
  });

  con.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");

    const sql = `SELECT * from dependency where parent=?`
    const params = [ deployableName ]
    con.query(sql, params, function (err, result) {
      if (err) throw err;
      res.send({ dependencies: result })
      con.end()
      next()
    });
  });
});


/*
 *
 *  Variables for dependencies/deployable on configuration page - This section is recursive
 *
 */
async function getVariables(deployable) {
  console.log(`   -------------\ngtVariables(${deployable})`)
  // return null

  return new Promise(function(resolve, reject) {
    const con = mysql.createConnection({
      host: "localhost",
      port: 56911,
      database: "juice",
      user: "root",
      password: ""
    });
    const sql = `SELECT * from variable where deployable=?`
    const params = [ deployable ]
    console.log(`sql=${sql}`)
    console.log(`params=`, params)
    con.query(sql, params, function (err, result) {
      con.end()
      if (err) return reject(err);
      console.log(`Got variables for ${deployable}:`, result)
      return resolve(result)
    })
  });//- promise
}

async function getDependencies(deployable) {
  console.log(`   -------------\ngetDependencies(${deployable})`)
  // return null

  return new Promise(function(resolve, reject) {
    const con = mysql.createConnection({
      host: "localhost",
      port: 56911,
      database: "juice",
      user: "root",
      password: ""
    });
    const sql = `SELECT * from dependency where parent=?`
    const params = [ deployable ]
    console.log(`sql=${sql}`)
    console.log(`params=`, params)
    con.query(sql, params, function (err, result) {
      con.end()
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
    con.end()
    next()
  })
  .catch (error => {
    console.log(`Error`, error)
  })
}) // ------------ END OF THE VARIABLE/DEPENDENCY CONFIG -------------------


// Variables - Show the variables for the selected deployable 
server.get('/variables', (req, res, next) => {
  console.log(`Getting variables from MYSQL`);

  console.log(`PAERAMS IS `, req.query)
  let deployableName = req.query.deployableName

  var con = mysql.createConnection({
    host: "localhost",
    port: 56911,
    database: "juice",
    user: "root",
    password: ""
  });

  con.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");

    const sql = `SELECT * from variable where deployable=?`
    const params = [ deployableName ]
    console.log(`sql=${sql}`)
    console.log(`params=`, params)
    con.query(sql, params, function (err, result) {
      if (err) throw err;
      console.log("Result: " + result);
      console.log(`result[0]=`, result[0]);
      res.send({ variables: result })
      con.end()
      next()
    });
  });
});

// Variables - Show all variables  
server.get('/variablesAll', (req, res, next) => {
  console.log(`Getting variables from MYSQL`);

  var con = mysql.createConnection({
    host: "localhost",
    port: 56911,
    database: "juice",
    user: "root",
    password: ""
  });

  con.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");

    const sql = `SELECT * FROM variable`
    console.log(`sql=${sql}`)
    con.query(sql, function (err, result) {
      if (err) throw err;
      console.log("Result: " + result);
      console.log(`result[0]=`, result[0]);
      res.send({ variables: result })
      con.end()
      next()
    });
  });
});

// Editing deployables on the DB
server.use(restify.plugins.queryParser({
  mapParams: true
}));
server.use(restify.plugins.bodyParser({
  mapParams: true
}));
server.use(restify.plugins.acceptParser(server.acceptable));

server.post('/deployable', function (req, res, next) {

  var con = mysql.createConnection({
        host: "localhost",
        port: 56911,
        database: "juice",
        user: "root",
        password: ""
     })

  con.connect(function(err, result) {
    if (err) throw err;
    
    const product_owner = req.params.product_owner;
    const description = req.params.description;
    const is_project = req.params.is_project;
    const name = req.params.name;

    con.query(
      `UPDATE deployable SET product_owner =?, description =?, is_project =? Where name =?`,
      [ product_owner, description, is_project, name ],

      (err, res) => {
        if (err) throw err;

        console.log("Result: " + req.params.product_owner + ' ' + req.params.description + ' ' + req.params.is_project)
      })
      con.end();

      // Send a success reply
      res.send({ status: 'ok' })
      return next();
  })  
}); // End of section

// Editing environment on the DB
server.use(restify.plugins.queryParser({
  mapParams: true
}));
server.use(restify.plugins.bodyParser({
  mapParams: true
}));
server.use(restify.plugins.acceptParser(server.acceptable));

server.post('/editedEnv', function (req, res, next) {

  var con = mysql.createConnection({
        host: "localhost",
        port: 56911,
        database: "juice",
        user: "root",
        password: ""
     })

  con.connect(function(err, result) {
    if (err) throw err;
    
    const name = req.params.name;
    const description = req.params.description;
    const notes = req.params.notes;

    con.query(
      `UPDATE environment SET description =?, notes =? WHERE name =?`,
      [ description, notes, name ],

      (err, res) => {
        if (err) throw err;

        console.log("Result: " + req.params.name + ' ' + req.params.description + ' ' + req.params.notes)
      })
      con.end();

      // Send a success reply
      res.send({ status: 'ok' })
      return next();
  })  
}); // End of section

// Editing user on the DB
server.use(restify.plugins.queryParser({
  mapParams: true
}));
server.use(restify.plugins.bodyParser({
  mapParams: true
}));
server.use(restify.plugins.acceptParser(server.acceptable));

server.post('/editUserAccount', function (req, res, next) {

  var con = mysql.createConnection({
        host: "localhost",
        port: 56911,
        database: "juice",
        user: "root",
        password: ""
     })

  con.connect(function(err, result) {
    if (err) throw err;
    
    const access = req.params.access;
    const role = req.params.role;
    const email = req.params.email;
    const id = req.params.id;

    con.query(
      `UPDATE user SET access =?, role =?, email =? Where id =?`,
      [ access, role, email, id ],

      (err, res) => {
        if (err) throw err;

        console.log("Updated: " + req.params.access + ' ' + req.params.role + ' ' + req.params.email)
      })
      con.end();

      // Send a success reply
      res.send({ status: 'ok' })
      return next();
  })  
  }); // End of section

  // Adding a new deployable to the DB
  server.use(restify.plugins.queryParser({
    mapParams: true
  }));
  server.use(restify.plugins.bodyParser({
    mapParams: true
  }));
  server.use(restify.plugins.acceptParser(server.acceptable));
  
  server.post('/newDeployable', function (req, res, next) {

    var con = mysql.createConnection({
          host: "localhost",
          port: 56911,
          database: "juice",
          user: "root",
          password: ""
       })
  
    con.connect(function(err, result) {
      if (err) throw err;
      const newDeployable = {name: req.params.name, is_project: req.params.is_project, product_owner: req.params.product_owner, description: req.params.description}

      con.query(
        `INSERT INTO deployable SET ?`, newDeployable, (err, res) => {
          if (err) throw err;
  
          console.log("Result: NEW Name- " + req.params.name + " Owner- " + req.params.product_owner + " Description- " + req.params.description + " Is project- " + req.params.is_project) 
        })
        con.end();
        return next();
    })  
    }); // End of section

  // Adding a new environment to the DB
  server.use(restify.plugins.queryParser({
    mapParams: true
  }));
  server.use(restify.plugins.bodyParser({
    mapParams: true
  }));
  server.use(restify.plugins.acceptParser(server.acceptable));

  server.post('/newEnvironment', function (req, res, next) {

    var con = mysql.createConnection({
      host: "localhost",
      port: 56911,
      database: "juice",
      user: "root",
      password: ""
    })

    con.connect(function(err, result) {
      if (err) throw err;
      const newEnvironment = {name: req.params.name, description: req.params.description, notes: req.params.notes, is_universal: req.params.is_universal}

      con.query(
        `INSERT INTO environment SET ?`, newEnvironment, (err, res) => {
          if (err) throw err;

          console.log("Result: NEW Name- " + req.params.name + " Notes- " + req.params.notes + " Description- " + req.params.description + " isuniversal -" + req.params.is_universal) 
        })
        con.end();
        return next();
    })  
    }); // End of section

  // Adding a new user to the DB
  server.use(restify.plugins.queryParser({
    mapParams: true
  }));
  server.use(restify.plugins.bodyParser({
    mapParams: true
  }));
  server.use(restify.plugins.acceptParser(server.acceptable));
  server.post('/newUser', function (req, res, next) {

    var con = mysql.createConnection({
      host: "localhost",
      port: 56911,
      database: "juice",
      user: "root",
      password: ""
    })

    con.connect(function(err, result) {
      if (err) throw err;

      const userValues = {first_name: req.params.first_name, last_name: req.params.last_name, role: req.params.role, access: req.params.access, email: req.params.email}

      let sql = `INSERT INTO user SET ?`
      let params = [ userValues ]

      con.query( sql, params, (err, res) => {
        if (err) throw err;
        console.log("Result: NEW user- " + req.params.first_name + ' ' + req.params.last_name +  " role- " + req.params.role + " access- " + req.params.access) 
      })
      con.end();

      // Send reply
      res.send({ status: 'ok' })
      return next();
    })  
  }); // End of section

  // Adding a new project user to the DB
  server.use(restify.plugins.queryParser({
    mapParams: true
  }));
  server.use(restify.plugins.bodyParser({
    mapParams: true
  }));
  server.use(restify.plugins.acceptParser(server.acceptable));
  server.post('/newProjectUser', function (req, res, next) {

    var con = mysql.createConnection({
          host: "localhost",
          port: 56911,
          database: "juice",
          user: "root",
          password: ""
      })

    con.connect(function(err, result) {
      if (err) throw err;

      const userValues = {user_id: req.params.id, project: req.params.project, access: req.params.access}

      let sql = `INSERT INTO project_user SET ?`
      let params = [ userValues ]

      con.query( sql, params, (err, res) => {
        if (err) throw err;

        console.log("Result: NEW project user- " + req.params.name + ' project- ' + req.params.project + " access- " + req.params.access) 
      })
      con.end();

      // Send reply
      res.send({ status: 'ok' })
      return next();
    })  
  }); // End of section

  // Adding a new environment user to the DB (_environmentName)
  server.use(restify.plugins.queryParser({
    mapParams: true
  }));
  server.use(restify.plugins.bodyParser({
    mapParams: true
  }));
  server.use(restify.plugins.acceptParser(server.acceptable));
  server.post('/newEnvironmentUser', function (req, res, next) {

    var con = mysql.createConnection({
          host: "localhost",
          port: 56911,
          database: "juice",
          user: "root",
          password: ""
      })

    con.connect(function(err, result) {
      if (err) throw err;

      const userValues = {user_id: req.params.id, environment: req.params.environment, access: req.params.access}

      let sql = `INSERT INTO environment_user SET ?`
      let params = [ userValues ]

      con.query( sql, params, (err, res) => {
          if (err) throw err;

          console.log("Result: NEW environment user- " + req.params.id + ' environment- ' + req.params.environment + " access- " + req.params.access) 
        })
        con.end();

        // Send reply
        res.send({ status: 'ok' })
        return next();
    })  
  }); // End of section

  // Adding a new variable to the DB
  server.use(restify.plugins.queryParser({
    mapParams: true
  }));
  server.use(restify.plugins.bodyParser({
    mapParams: true
  }));
  server.use(restify.plugins.acceptParser(server.acceptable));
  server.post('/newVariable', function (req, res, next) {

    var con = mysql.createConnection({
          host: "localhost",
          port: 56911,
          database: "juice",
          user: "root",
          password: ""
      })

    con.connect(function(err, result) {
      if (err) throw err;

      const variableValues = {name: req.params.name, description: req.params.description, type: req.params.type, mandatory: req.params.mandatory, deployable: req.params.deployable, is_external: req.params.external}

      let sql = `INSERT INTO variable SET ?`
      let params = [ variableValues ]

      con.query( sql, params, (err, res) => {
          if (err) throw err;

          console.log("Result: NEW variable- " + req.params.name + " deployable- " + req.params.deployable + " Description- " + req.params.description) 
        })
        con.end();

        // Send reply
        res.send({ status: 'ok' })
        return next();
    })  
    }); // End of section

  // Adding a new deployment to the DB
  server.use(restify.plugins.queryParser({
    mapParams: true
  }));
  server.use(restify.plugins.bodyParser({
    mapParams: true
  }));
  server.use(restify.plugins.acceptParser(server.acceptable));
  server.post('/newDeployment', function (req, res, next) {

    var con = mysql.createConnection({
          host: "localhost",
          port: 56911,
          database: "juice",
          user: "root",
          password: ""
      })

    con.connect(function(err, result) {
      if (err) throw err;

      const deploymentValues = {notes: req.params.notes, deployable: req.params.deployable, environment: req.params.environment}

      let sql = `INSERT INTO deployments SET ?`
      let params = [ deploymentValues ]

      con.query( sql, params, (err, res) => {
          if (err) throw err;

          console.log("Result: NEW deployment " + req.params.deployable + " environment- " + req.params.environment + " notes- " + req.params.notes) 
        })
        con.end();

        // Send reply
        res.send({ status: 'ok' })
        return next();
    })  
    }); // End of section

  // Adding a new dependency to the DB
  server.use(restify.plugins.queryParser({
    mapParams: true
  }));
  server.use(restify.plugins.bodyParser({
    mapParams: true
  }));
  server.use(restify.plugins.acceptParser(server.acceptable));
  server.post('/newDependency', function (req, res, next) {

    var con = mysql.createConnection({
          host: "localhost",
          port: 56911,
          database: "juice",
          user: "root",
          password: ""
      })

    con.connect(function(err, result) {
      if (err) throw err;

      const dependencyValues = {parent: req.params.deployable, child: req.params.child, prefix: req.params.prefix, version: req.params.version}

      let sql = `INSERT INTO dependency SET ?`
      let params = [ dependencyValues ]

      con.query( sql, params, (err, res) => {
          if (err) throw err;

          console.log("Result: NEW dependency " + req.params.deployable + " child- " + req.params.child + " prefix- " + req.params.prefix) 
        })
        con.end();

        // Send reply
        res.send({ status: 'ok' })
        return next();
    })  
    }); // End of section

  // Editing a variable on the DB
  server.use(restify.plugins.queryParser({
    mapParams: true
  }));
  server.use(restify.plugins.bodyParser({
    mapParams: true
  }));
  server.use(restify.plugins.acceptParser(server.acceptable));

  server.post('/variable', function (req, res, next) {

    var con = mysql.createConnection({
          host: "localhost",
          port: 56911,
          database: "juice",
          user: "root",
          password: ""
      })

    con.connect(function(err, result) {
      if (err) throw err;
      
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
      })
      con.end();

      // Send a success reply
      res.send({ status: 'ok' })
      return next();
    })  
  }); // End of section

  // Editing a user on the project_user DB
  server.use(restify.plugins.queryParser({
    mapParams: true
  }));
  server.use(restify.plugins.bodyParser({
    mapParams: true
  }));
  server.use(restify.plugins.acceptParser(server.acceptable));

  server.post('/editUser', function (req, res, next) {

    var con = mysql.createConnection({
          host: "localhost",
          port: 56911,
          database: "juice",
          user: "root",
          password: ""
      })

    con.connect(function(err, result) {
      if (err) throw err;
      
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
      })
      con.end();

      // Send a success reply
      res.send({ status: 'ok' })
      return next();
    })  
  }); // End of section

  // Editing a user on the environment_user DB
  server.use(restify.plugins.queryParser({
    mapParams: true
  }));
  server.use(restify.plugins.bodyParser({
    mapParams: true
  }));
  server.use(restify.plugins.acceptParser(server.acceptable));

  server.post('/editEnvUser', function (req, res, next) {

    var con = mysql.createConnection({
          host: "localhost",
          port: 56911,
          database: "juice",
          user: "root",
          password: ""
      })

    con.connect(function(err, result) {
      if (err) throw err;
      
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
      })
      con.end();

      // Send a success reply
      res.send({ status: 'ok' })
      return next();
    })  
  }); // End of section


server.listen(4000, function() {
  console.log('%s listening at %s', server.name, server.url);
});
