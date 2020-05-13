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
                group_name: req.params.group_name,
                notes: req.params.notes,
                is_universal: req.params.is_universal,
                is_aws: req.params.is_aws,
                is_secure_environment: req.params.is_secure_environment,
                aws_account: req.params.aws_account,
                aws_profile: req.params.aws_profile,
                aws_region: req.params.aws_region,
                aws_cf_stack: req.params.aws_cf_stack,
                aws_cluster_url: req.params.aws_cluster_url,
                aws_vpc_url: req.params.aws_vpc_url
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