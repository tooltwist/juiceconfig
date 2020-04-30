import db from './database-mysql';
import auth from './auth';
import restify from 'restify';

export default {
	register (server) {
        // Select ALL ENVIRONMENTS from MySQL database
        server.get('/api/showEnvironments', async (req, res, next) => {
            console.log(`GET /showEnvironments`);
        
            let con = await db.checkConnection()
            const sql = `SELECT * FROM environment`
            
            con.query(sql, function (err, result) {
                if (err) throw err;
                res.send({ environments: result })
                next()
            });
        }); // End of section

        // Select ALL GROUPS from MySQL database
        server.get('/api/groups', async (req, res, next) => {
            console.log(`GET /groups`);
        
            let con = await db.checkConnection()
            const sql = `SELECT * FROM environment_group`
            
            con.query(sql, function (err, result) {
                if (err) throw err;
                res.send({ groups: result })
                next()
            });
        }); // End of section

        // Adding a new environment to the DB
        server.post('/api/newEnvironment', auth, async (req, res, next) => {
            console.log(`POST /newEnvironment`)

            let con = await db.checkConnection()
            const sql = `INSERT INTO environment SET ?`
            const newEnvironment = {
                owner: req.identity.username,
                name: req.params.name,
                description: req.params.description,
                notes: req.params.notes,
                is_universal: req.params.is_universal
            }
            console.log(`sql=${sql}`);
            console.log(`newEnv=`, newEnvironment);
            
            con.query(sql, newEnvironment, (err, result) => {
                if (err) throw err;

                res.send({ ok: 'ok'})
                return next();
            })
        }); // End of section
    }
}