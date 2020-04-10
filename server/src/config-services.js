import db from './database-mysql';
import auth from './auth';
import restify from 'restify';

export default {
	register (server) {
        // Select VARIABLES for dependencies/deployable on /config from MySQL db -
        // This section is recursive
        async function getVariables(deployable) {
            console.log(`   -------------\ngetVariables(${deployable})`)
            // return null
            let con = await db.checkConnection()
        
            return new Promise(function(resolve, reject) {
                const sql = `SELECT * from variable where deployable=?`
                const params = [ deployable ]
            
                con.query(sql, params, function (err, result) {
                    if (err) return reject(err);
                    // console.log(`Got variables for ${deployable}:`, result)
                    return resolve(result)
                })
            });//- promise
        }
        
        async function getDependencies(deployable) {
            console.log(`   -------------\ngetDependencies(${deployable})`)
            // return null
            let con = await db.checkConnection()
        
            return new Promise(function(resolve, reject) {
                const sql = `SELECT * from dependency where parent=?`
                const params = [ deployable ]
            
                con.query(sql, params, function (err, result) {
                    if (err) return reject(err);
                    console.log(`Got dependencies for ${deployable}:`, result)
                    return resolve(result)
                })
            });//- promise
        }
        
        async function getAllVariables_recursive(deployable, prefix, array) {
            console.log(`----------------\ngetAllVariables_recursive(${deployable}, ${prefix})`)
        
            // Step 1: Select the variables for this deployable
            let variables = await getVariables(deployable)
            variables.forEach(variable => {
                array.push({
                    variableName: `${prefix}${variable.name}`,
                    value: '',
                    type: 'text'
                })
            })
        
            // Select dependencies with SQL 
            let dependencies = await getDependencies(deployable)
            for (let i = 0; i < dependencies.length; i++) {
                let dep = dependencies[i]
                console.log(`  parent=${deployable}, child=${dep.child}`)
                let prefix = dep.prefix ? `${dep.prefix}_` : ``
                await getAllVariables_recursive(dep.child, prefix, array)
            }
        };
        
        server.get('/api/variablesConfig', (req, res, next) => {
            let deployable = req.query.deployable
            console.log(`deployable is ${deployable}`)
        
            let array = [ ]
            getAllVariables_recursive(deployable, '', array)
        
            .then(response => {
                console.log(`RESPONSE IS: `, response)
                console.log(`array is `, array)
                res.send(array)
                next()
            })
            .catch (error => {
                console.log(`Error`, error)
            })
        }) // End of section
        
        // Show details of ENVIRONMENT on /config from MySQL db
        server.get('/api/environmentIndex', async (req, res, next) => {
            console.log(`GET /environmentIndex`);
        
            let environmentName = req.query.environmentName;
            let con = await db.checkConnection()
            const sql = `SELECT * FROM environment WHERE name=?`
            const params = [ environmentName ]
        
            con.query(sql, params, function (err, result) {
                if (err) throw err;
                console.log("Result: " + result);
            
                res.send({ record: result[0] })
                next()
            });
        }); // End of section
    }
}