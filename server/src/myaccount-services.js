import db from './database-mysql';
import auth from './auth'

export default {
	register (server) {
        server.get('/api/pendingRequests', async (req, res, next) => {
            console.log(`GET /pendingRequests`);

            let user_username = req.query.username;
            let status_pending = 'pending';
            
            let con = await db.checkConnection()
            const sql = `SELECT * from org_user WHERE user_username =? AND status =?`
            let params = [ user_username, status_pending ]
            
            con.query(sql, params, function (err, result) {
                if (err) throw err;
                console.log(result)
                res.send({ pendingRequests: result })
                next()
            });
        })

        

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

        // Select all orgs for /myAccount on MySQL database
        server.get('/api/organisations', async (req, res, next) => {
            console.log(`GET /organisations`);

            let user_username = req.params.userName;

            console.log('******** ACCESSING ORGANISATIONS **********');
            console.log('user_username', user_username)

            let status_confirmed = 'confirmed';
            let status_pending = 'pending';
            
            let con = await db.checkConnection()
            const sql = `SELECT * from org_user WHERE user_username =? AND (status =? OR status =?)`
            let params = [ user_username, status_confirmed, status_pending ]
            
            con.query(sql, params, function (err, result) {
                if (err) throw err;
                console.log(result)
                res.send({ organisations: result })
                next()
            });
        }); // End of section
        
        // Edit user account details for /myaccount on MySQL database
        server.post('/api/editAccount', async (req, res, next) => {
            console.log(`POST /editAccount`)
        
            let con = await db.checkConnection()
            let first_name = req.params.first_name;
            let last_name = req.params.last_name;
            let email = req.params.email;
            let username = req.params.userName;
            const sql = `UPDATE user SET first_name =?, last_name =?, email =? WHERE username =?`
            let params = [ first_name, last_name, email, username ]
        
            con.query(sql, params, (err, result) => {
                if (err) throw err;
            
                // Send a success reply
                res.send({ status: 'ok' })
                return next();
            }) 
        }); // - end of call

        // Edit org_user status for /myaccount
        server.post('/api/orgUserRes', async (req, res, next) => {
            console.log(`POST /orgUserRes`)
        
            let con = await db.checkConnection()
            let org_username = req.params.org_username;
            let user_username = req.params.user_username;
            let status = req.params.status;

            const sql = `UPDATE org_user SET status =? WHERE org_username =? AND user_username =?`
            let params = [ status, org_username, user_username ]
        
            con.query(sql, params, (err, result) => {
                if (err) throw err;
            
                // Send a success reply
                res.send({ status: 'ok' })
                return next();
            }) 
        }); // - end of call
    }
}