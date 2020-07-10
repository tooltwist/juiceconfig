import db from './database-mysql';
import auth from './auth';
import restify from 'restify';

export default {
	register (server) {
        // Select all USERS for /users on MySQL database
        server.get('/api/users', async (req, res, next) => {
           console.log(`GET /users`);
         
           let con = await db.checkConnection()
           const sql = `SELECT * from user`
         
           con.query(sql, function (err, result) {
                if (err) throw err;
                res.send({ users: result })
                next()
           });
        }); // End of section

        // Select all USERS for /users on MySQL database
        server.get('/api/orgUsers', async (req, res, next) => {
            console.log(`GET /orgUsers`);

            let org_username = req.params.org_username;

            console.log('org_username', org_username)
            
            let con = await db.checkConnection()
            const sql = `SELECT * from org_user WHERE org_username =?`
            let params = [ org_username ]
            
            con.query(sql, params, function (err, result) {
                if (err) throw err;
                console.log(result)
                res.send({ org_users: result })
                next()
            });
        }); // End of section
         
        // Adding a new user to the DB       
        server.post('/api/newUser', async (req, res, next) => {
            console.log(`POST /newUser`)
       
            let con = await db.checkConnection()
            const userValues = {first_name: req.params.first_name, last_name: req.params.last_name, role: req.params.role, access: req.params.access, email: req.params.email}
            let sql = `INSERT INTO user SET ?`
            let params = [ userValues ]
    
            con.query(sql, params, (err, result) => {
                if (err) throw err;

                // Send reply
                res.send({ status: 'ok' })
                return next();
           })
         }); // End of section

        // Adding a new organisation to the user DB table
        server.post('/api/newOrg', async (req, res, next) => {
            console.log(`POST /newOrg`)
       
            let con = await db.checkConnection()
            const userValues = {username: req.params.username, type: req.params.type, email: req.params.email}
            let sql = `INSERT INTO user SET ?`
            let params = [ userValues ]
    
            con.query(sql, params, (err, result) => {
                if (err) throw err;

                // Send reply
                res.send({ status: 'ok' })
                return next();
           })
        }); // End of section

        // Adding a new org_user record to DB table
        server.post('/api/newOrgUser', async (req, res, next) => {
            console.log(`POST /newOrgUser`)
        
            let con = await db.checkConnection()
            const userValues = {user_username: req.params.user_username, org_username: req.params.org_username, role: req.params.role, status: req.params.status}
            let sql = `INSERT INTO org_user SET ?`
            let params = [ userValues ]
    
            con.query(sql, params, (err, result) => {
                if (err) throw err;

                // Send reply
                res.send({ status: 'ok' })
                return next();
            })
        }); // End of section
       
        // Adding a new project user to the DB
        server.post('/api/newProjectUser', async (req, res, next) => {
           console.log(`POST /newProjectUser`)
       
            let con = await db.checkConnection()
            const userValues = {user_id: req.params.id, username: req.params.username, project: req.params.project, access: req.params.access}
            let sql = `INSERT INTO project_user SET ?`
            let params = [ userValues ]
    
            con.query( sql, params, (err, result) => {
                if (err) throw err;
        
                // Send reply
                res.send({ status: 'ok' })
                return next();
            }) 
        }); // End of section
    }
}