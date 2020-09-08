import db from './database-mysql';
import auth from './auth';
import restify from 'restify';

export default {
	register (server) {

        // Select organisation from user MySQL database
        server.get('/api/organisation', async (req, res, next) => {
            console.log(`GET /organisation`);

            let organisation = req.params.organisationName
            console.log('Org username', organisation)

            let con = await db.checkConnection()
            const sql = `SELECT * FROM user WHERE username =?`
            const params = [ organisation ];
            
            con.query(sql, params, function (err, result) {
                if (err) throw err;
                res.send({ organisation: result })
                next()
            });
        }); // End of section

        // Select org_users from org_user MySQL database
        server.get('/api/organisationUsers', async (req, res, next) => {
            console.log(`GET /organisationUsers`);

            let organisation = req.params.organisationName
            console.log('Org username', organisation)

            let con = await db.checkConnection()
            const sql = `SELECT * FROM org_user WHERE org_username =?`
            const params = [ organisation ];
            
            con.query(sql, params, function (err, result) {
                if (err) throw err;
                res.send({ organisationUsers: result })
                next()
            });
        }); // End of section

        // Select pending requests from org_user MySQL database
        server.get('/api/orgRequests', async (req, res, next) => {
            console.log(`GET /orgRequests`);

            let username = req.params.userName;
            let status = 'pending';

            let con = await db.checkConnection()
            const sql = `SELECT * FROM org_user WHERE user_username =? AND status =?`
            const params = [ username, status ];
            
            con.query(sql, params, function (err, result) {
                if (err) throw err;
                console.log("Requests: ", result)
                res.send({ requests: result })
                next()
            });
        }); // End of section

        // Update status of an existing org_user record
        server.post('/api/orgStatusUpdate', async (req, res, next) => {
            console.log(`POST /orgStatusUpdate`);

            let member = req.params.member;
            let status = req.params.status;
            console.log(status)
            let org = req.params.org;

            let con = await db.checkConnection();
            const sql = `UPDATE org_user SET status =? WHERE org_username =? AND user_username =?`
            const params = [ status, org, member ]

            con.query(sql, params, (err, result) => {
                if (err) throw err;
            
                // Send a success reply
                res.send({ status: 'ok' })
                return next();
            }) 
        })

        // Update user role of an existing org_user record
        server.post('/api/orgRoleUpdate', async (req, res, next) => {
            console.log(`POST /orgRoleUpdate`);

            let org = req.params.org;
            let member = req.params.username;
            let role = req.params.role;

            let con = await db.checkConnection();
            const sql = `UPDATE org_user SET role =? WHERE org_username =? AND user_username =?`
            const params = [ role, org, member ]

            con.query(sql, params, (err, result) => {
                if (err) throw err;
            
                // Send a success reply
                res.send({ status: 'ok' })
                return next();
            }) 
        })

        // Delete an org_user record
        server.del('/api/deleteOrgUser', async (req, res, next) => {
            console.log(`DELETE /deleteOrgUser`);

            let con = await db.checkConnection();
            const member = req.params.member;
            const org = req.params.org;
            const status = req.params.status;

            const sql = `DELETE FROM org_user WHERE user_username =? AND org_username =? AND status =?`
            const params = [member, org, status]

            con.query( sql, params, (err, result) => {
                if (err) throw err;
            
                // Send reply
                res.send({ status: 'ok' })
                return next();
            }) 
        });
    }
}