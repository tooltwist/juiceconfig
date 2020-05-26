import db from './database-mysql';
import auth from './auth'


export default {
	register (server) {
    // Select DEPLOYMENTS for /applications 
    server.get('/api/applications', async (req, res, next) => {
      console.log(' GET /applications');

      // Check if owner matches the username for private accounts
      let me = req.query.username

      console.log(`I am ${me}`);
      
      const sql = `SELECT * FROM deployments WHERE environment_owner =? AND deployable_owner =? OR deployable_owner IN (SELECT project FROM project_user WHERE username =?)`
      const params = [ me, me, me ] 
  
      let con = await db.checkConnection()
      con.query(sql, params, function (err, result) {
          if (err) throw err;
          res.send({ applications: result })
          next()
      });
    });

    // Select DEPLOYMENTS for /_environmentNAME on MySQL database
    server.get('/api/deployments', async (req, res, next) => {
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

      let con = await db.checkConnection()
      let sql = `SELECT * from deployments`
      
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
        console.log("Result: ", result[0]);
        res.send({ deployments: result })
        next()
      });
    });//- GET /deployment

  // server.put('/api/deployment', auth, async (req, res, next) => {

    server.post('/api/newDeployment', auth, async (req, res, next) => {
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
    });//- POST /deployment

    server.put('/api/deployment', async (req, res, next) => {
      console.log(`PUT /deployment`)

      let con = await db.checkConnection()
      const deploymentValues = {
      }
      if (typeof(req.params.notes) !== 'undefined') {
        deploymentValues.notes = req.params.notes
      }
      if (typeof(req.params.healthcheck) !== 'undefined') {
        deploymentValues.healthcheck = req.params.healthcheck
      }
      if (typeof(req.params.website_url) !== 'undefined') {
        deploymentValues.website_url = req.params.website_url
      }
      if (typeof(req.params.aws_service) !== 'undefined') {
        deploymentValues.aws_service = req.params.aws_service
      }
      if (typeof(req.params.aws_loadbalancer) !== 'undefined') {
        deploymentValues.aws_loadbalancer = req.params.aws_loadbalancer
      }
      if (typeof(req.params.aws_targetgroup) !== 'undefined') {
        deploymentValues.aws_targetgroup = req.params.aws_targetgroup
      }
      if (typeof(req.params.aws_logfile_url) !== 'undefined') {
        deploymentValues.aws_logfile_url = req.params.aws_logfile_url
      }
      if (typeof(req.params.aws_secretsmanager_secret) !== 'undefined') {
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
    });//- PUT /deployment
  }//- register
};
  