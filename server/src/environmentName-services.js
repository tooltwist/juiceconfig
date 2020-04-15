import db from './database-mysql';

export default {
	register (server) {
        // Select ENVIRONMENT values for /_environmentNAME on MySQL database
        server.get('/api/environment', async (req, res, next) => {
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

        // Select USERS for /_environmentNAME on MySQL database
        server.get('/api/environments_users', async (req, res, next) => {
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
        
        // Edit ENVIRONMENT values for /_environmentNAME on MySQL database
        server.post('/api/editedEnv', async (req, res, next) => {
            console.log(`POST /editedEnv`)
        
            let con = await db.checkConnection()
            const name = req.params.name;
            const description = req.params.description;
            const notes = req.params.notes;
            const sql = `UPDATE environment SET description =?, notes =? WHERE name =?`
            const params = [ description, notes, name ]
        
            con.query(sql, params, (err, result) => {
                if (err) throw err;
                
                // Send a success reply
                res.send({ status: 'ok' })
                return next();
            }) 
        }); // End of section
  
        // Add a NEW USER for /_environmentNAME on MySQL database
        server.post('/api/newEnvironmentUser', async (req, res, next) => {
            console.log(`POST /newEnvironmentUser`)
        
            let con = await db.checkConnection()
            const userValues = {user_id: req.params.id, environment: req.params.environment, access: req.params.access}
            let sql = `INSERT INTO environment_user SET ?`
            let params = [ userValues ]
        
            con.query( sql, params, (err, result) => {
                if (err) throw err;
            
                // Send reply
                res.send({ status: 'ok' })
                return next();
            })
        }); // End of section
        
        // Edit a USER for /_environmentNAME on MySQL database  
        server.post('/api/editEnvUser', async (req, res, next) => {
            console.log(`POST /editEnvUser`)
        
            let con = await db.checkConnection()
            const id = req.params.id;
            const access = req.params.access;
            const environment = req.params.environment;
            let sql = `UPDATE environment_user SET access=? WHERE user_id=? AND environment=?`
            let params = [ access, id, environment ]
        
            con.query(sql, params, (err, result) => {
                if (err) throw err;
            
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
        server.put('/api/environment', async (req, res, next) => {
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
            if (typeof(req.params.aws_account) != 'undefined') {
                record.aws_account = req.params.aws_account
            }
            if (typeof(req.params.aws_profile) != 'undefined') {
                record.aws_profile = req.params.aws_profile
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
            
            con.query( sql, params, (err, result) => {
                if (err) throw err;
            
                // Send reply
                res.send({ status: 'ok' })
                return next();
            }) 
        }); // ******************** end of PUT /environment *********************
    }
}