import db from './database-mysql';
import auth from './auth'




export default {
	register (server) {
    console.log(`REGISTERING DEPLOYMENT SERVICES!!!! YAY!!!`);
    

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
    })//- GET /deployment

  // server.put('/deployment', auth, async (req, res, next) => {

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
    })//- POST /deployment

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
    })//- PUT /deployment
  }//- register

};
  