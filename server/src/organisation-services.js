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

    }
}