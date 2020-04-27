import db from './database-mysql';
import auth from './auth';
import restify from 'restify';
import misc from './misc';

export default {
	register (server) {
        // Select VARIABLES for dependencies/deployable on /config from MySQL db -
        // This section is recursive
        async function getVariables(deployableOwner, deployableName) {
            console.log(`   -------------\ngetVariables(${deployableOwner}, ${deployableName})`)
            // return null
            let con = await db.checkConnection()
        
            return new Promise(function(resolve, reject) {
                const sql = `SELECT * from variable where deployable_owner=? AND deployable_name=?`
                const params = [ deployableOwner, deployableName ]
            
                con.query(sql, params, function (err, result) {
                    if (err) return reject(err);
                    // console.log(`Got variables for ${deployable}:`, result)
                    return resolve(result)
                })
            });//- promise
        }
        
        async function getDependencies(deployableOwner, deployableName) {
            console.log(`   -------------\ngetDependencies(${deployableOwner}, ${deployableName})`)
            // return null
            let con = await db.checkConnection()
        
            return new Promise(function(resolve, reject) {
                const sql = `SELECT * from dependency where parent_owner=? AND parent_name=?`
                const params = [ deployableOwner, deployableName ]
            
                con.query(sql, params, function (err, result) {
                    if (err) return reject(err);
                    console.log(`Got dependencies for ${deployableOwner}:${deployableName}:`, result)
                    return resolve(result)
                })
            });//- promise
        }
        
        // Ads variables to array
        async function getAllVariables_recursive(deployableOwner, deployableName, prefix, array) {
            console.log(`----------------\ngetAllVariables_recursive(${deployableOwner}, ${deployableName}, ${prefix})`)
        
            // Step 1: Select the variables for this deployable
            let variables = await getVariables(deployableOwner, deployableName)
            variables.forEach(variable => {
                array.push({
                    variableName: `${prefix}${variable.name}`,
                    value: '',
                    type: variable.type,
                    description: variable.description,
                    is_external: variable.is_external,
                    is_sensitive: variable.is_sensitive,
                    mandatory: variable.mandatory,
                    example: variable.example
                })
            })
        
            // Select dependencies with SQL 
            let dependencies = await getDependencies(deployableOwner, deployableName)
            for (let i = 0; i < dependencies.length; i++) {
                let dep = dependencies[i]
                console.log(`  parent=${deployableOwner}:${deployableName}, child=${dep.child}`)
                let prefix = dep.prefix ? `${dep.prefix}_` : ``
                await getAllVariables_recursive(dep.child_owner, dep.child_name, prefix, array)
            }
        };
        
        server.get('/api/deployable/:deployable/variablesConfig', (req, res, next) => {
            console.log(`GET /api/deployable/:dep/variablesConfig`);
            // let deployable = req.query.deployable
            let {owner:deployableOwner, name:deployableName} = misc.splitOwnerName(req.params.deployable)
            console.log(`deployable is ${deployableOwner}:${deployableName}`)
        
            let array = [ ]
            getAllVariables_recursive(deployableOwner, deployableName, '', array)
        
            .then(response => {
                // console.log(`RESPONSE IS: `, response)
                // console.log(`array is `, array)
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