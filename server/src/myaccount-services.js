import db from './database-mysql';
import auth from './auth'

export default {
	register (server) {
        // Select USER details from MySQL database
        server.get('/api/myaccount', async (req, res, next) => {
            console.log(`GET /myaccount`);
        
            let username = req.query.userName;
            let con = await db.checkConnection()
            const sql = `SELECT * FROM user WHERE username =?`
            const params = [ username ]
            
            con.query(sql, params, function (err, result) {
                if (err) throw err;
                console.log("Result: " + result);
                res.send({ record: result[0] })
                next()
            });
        }); // End of section
        
        // Select deployables for /myaccount on MySQL database
        server.get('/api/usersDeployables', async (req, res, next) => {
            console.log(`GET /usersDeployables`);
            
            let userID = req.query.userID
            let con = await db.checkConnection()
            const sql = `SELECT D.name, D.owner, D.product_owner, D.description, PU.access FROM deployable D left outer join project_user PU on D.name = PU.project WHERE PU.user_id=?`
            let params = [ userID ]
        
            con.query(sql, params, function (err, result) {
                if (err) throw err;
                res.send({ deployables: result })
                next()
            })
        }) // End of section
        
        // Select environments for /myaccount on MySQL database
        server.get('/api/accountEnvironments', async (req, res, next) => {
            console.log(`GET /accountEnvironments`);
            
            let userID = req.query.userID
            let con = await db.checkConnection()
            const sql = `SELECT E.name, E.owner, E.type, E.description, E.notes, EU.access FROM environment E left outer join environment_user EU on E.name = EU.environment WHERE EU.user_id=?`
            let params = [ userID ]
        
            con.query(sql, params, function (err, result) {
                if (err) throw err;
                res.send({ environments: result })
                next()
            })
        }) // End of section

        // Edit user account details for /myaccount on MySQL database
        server.post('/api/editAccount', async (req, res, next) => {
            console.log(`POST /editAccount`)
        
            let con = await db.checkConnection()
            let first_name = req.params.first_name;
            let last_name = req.params.last_name;
            let role = req.params.role;
            let email = req.params.email;
            let id = req.params.id;
            const sql = `UPDATE user SET first_name =?, last_name =?, role =?, email =? Where id =?`
            let params = [ first_name, last_name, role, email, id ]
        
            con.query(sql, params, (err, result) => {
                if (err) throw err;
            
                // Send a success reply
                res.send({ status: 'ok' })
                return next();
            }) 
        }); // - end of call
    }
}