import restify from 'restify';
import db from './database-mysql';
import auth from './auth'

export default {
	register (server) {
        // Dynamically select the USER for /_userName from MySQL database
        server.get('/api/userName', async (req, res, next) => {
            console.log(`GET /userName`);
        
            let userID = req.query.userID
            let con = await db.checkConnection()
            const sql = `SELECT * from user where id=?`
            const params = [ userID ]
        
            con.query(sql, params, function (err, result) {
                if (err) throw err;
                console.log(`result[0]=`, result[0]);
                res.send({ record: result[0] })
                next()
            });
        }); // End of section
        
        // Dynamically select the PROJECTS for /_userName from MySQL database
        server.get('/api/usersProjects', async (req, res, next) => {
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
        }); // End of section
        
        // Dynamically select the ENVIRONMENTS for /_userName from MySQL database
        server.get('/api/usersEnvironments', async (req, res, next) => {
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
        
        // Edit values for /_userName on MySQL database
        server.post('/api/editUserAccount', async (req, res, next) => {
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
            
        // Select ENVIRONMENTS for /_userName on MySQL database
        server.get('/api/environments', auth, async (req, res, next) => {
            console.log(`GET /environments`);
        
            let userIdentity = req.payload.userIdentity
            let me = req.identity.username
            console.log(`I am ${me}`);
        
            let con = await db.checkConnection()
            const sql = `(SELECT environment.owner, environment.name, environment.description, environment.notes, environment.is_universal FROM environment)`
            const params = [ userIdentity ]
            
            console.log(`SQL IS ${sql}`)
            con.query(sql, params, function (err, result) {
                if (err) throw err;
                res.send({ environments: result })
                next()
            });
        }); // End of section
    }
}