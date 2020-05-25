import db from './database-mysql';
import auth from './auth';
import restify from 'restify';

export default {
	register (server) {
        // Selects the all deployables that are PROJECTS from MySQL db
        server.get('/api/deployables', auth, async (req, res, next) => {
            console.log(`GET /deployables`);
        
            // Check if owner matches the username for private accounts
            let me = req.identity.username

            console.log(`I am ${me}`);
            
            const sql = `SELECT * FROM deployable WHERE owner =? OR name IN (SELECT project FROM project_user WHERE username =?)`

            const params = [ me, me ] 
        
            let con = await db.checkConnection()
            con.query(sql, params, function (err, result) {
                if (err) throw err;
                res.send({ deployables: result })
                next()
            });
        }); // End of section
        
        // Selects all DEPLOYABLES from MySQL db
        server.get('/api/showDeployables', async (req, res, next) => {
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
        server.post('/api/newDeployable', auth, async (req, res, next) => {
            console.log(`POST /newDeployable`)

            let me = req.identity.username
            console.log(`I am ${me}`);
            let con = await db.checkConnection()

            const sql = `INSERT INTO deployable SET ?`
            const newDeployable = {
                owner: me,
                name: req.params.name,
                type: req.params.type,
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

        // Dynamically select the PROJECTS for /_userName from MySQL database
        server.get('/api/projectAccess', async (req, res, next) => {
            console.log(`GET /projectAccess`);
        
            let userName = req.query.username
            console.log('userName === ', userName)
            let con = await db.checkConnection()
            const sql = `SELECT * from project_user where username=?`
            const params = [ userName ]

        
            con.query(sql, params, function (err, result) {
                if (err) throw err;
                console.log("Result: " + result);
                res.send({ records: result })
                next()
            });
        }); // End of section
    }
}