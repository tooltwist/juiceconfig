import db from './database-mysql';
import auth from './auth';
import restify from 'restify';

export default {
	register (server) {
        // Selects the all deployables that are PROJECTS from MySQL db
        server.get('/deployables', auth, async (req, res, next) => {
            console.log(`GET /deployables`);
        
            let userIdentity = req.payload.userIdentity
            let me = req.identity.username
            console.log(`I am ${me}`);
            
            const sql = `SELECT owner, name, type, is_project, product_owner, description FROM deployable`
            const params = [ userIdentity ]
        
            let con = await db.checkConnection()
            con.query(sql, params, function (err, result) {
                if (err) throw err;
                res.send({ deployables: result })
                next()
            });
        }); // End of section
        
        // Selects all DEPLOYABLES from MySQL db
        server.get('/showDeployables', async (req, res, next) => {
            console.log(`GET /showDeployables`);
        
            let con = await db.checkConnection()
            const sql = `(SELECT * FROM deployable)`
        
            con.query(sql, function (err, result) {
            if (err) throw err;
            res.send({ list: result })
            next()
            });
        }); // End of section

        // Adding a new deployable to the DB        
        server.post('/newDeployable', auth, async (req, res, next) => {
            console.log(`POST /newDeployable`)

            let me = req.identity.username
            console.log(`I am ${me}`);
            let con = await db.checkConnection()

            const sql = `INSERT INTO deployable SET ?`
            const newDeployable = {
                owner: me,
                name: req.params.name,
                is_project: req.params.is_project,
                product_owner: req.params.product_owner,
                description: req.params.description
            }
            
            con.query(sql, newDeployable, (err, result) => {
                if (err) throw err;
                
                // con.end();
                res.send({ ok: 'ok'})
                return next();
            })
        }); // End of section
    }
}