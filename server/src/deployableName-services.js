import restify from 'restify';
import db from './database-mysql';
import auth from './auth'

export default {
	register (server) {
        // Dynamically select the DEPLOYABLE for /_deployableNAME from MySQL db
        server.get('/deployable', async (req, res, next) => {
            console.log(`GET /deployable`);
        
            let deployableName = req.query.deployableName
            let con = await db.checkConnection()
            const sql = `SELECT * from deployable where name=?`
            const params = [ deployableName ]
        
            con.query(sql, params, function (err, result) {
                if (err) throw err;
                console.log("Result: " + result);
                console.log(`result[0]=`, result[0]);
                res.send({ record: result[0] })
                next()
            });
        });
        
        //Dynamically select the ENVIRONMENT for /_deployableNAME from MySQL db
        server.get('/envDeployments', async (req, res, next) => {
            console.log(`GET /envDeployments`);
        
            let deployableName = req.query.deployableName
            let con = await db.checkConnection()
            const sql = `SELECT * from deployments where deployable =?`
            const params = [ deployableName ];
            
            con.query(sql, params, function (err, result) {
                if (err) throw err;
                console.log("Result: " + result);
                res.send({ deployments: result })
                next()
            });
        });
        
        // Dynamically select the USERS for /_deployableNAME from MySQL db
        server.get('/project_users', async (req, res, next) => {
            console.log(`GET /project_users`);
        
            let deployableName = req.query.deployableName
            let con = await db.checkConnection()
            const sql = `SELECT PU.project, PU.user_id, PU.access, U.first_name, U.last_name FROM project_user PU left outer join user U on PU.user_id = U.id WHERE PU.project=?`
            let params = [ deployableName ]
        
            con.query(sql, params, function (err, result) {
                if (err) throw err;
                res.send({ users: result })
                next()
            })
        })
        
        // Dynamically select ALL DEPENDENCIES from MySQL db
        server.get('/dependencies', async (req, res, next) => {
            console.log(`GET /dependencies`);
        
            let con = await db.checkConnection()
            const sql = `SELECT * from dependency`
        
            con.query(sql, function (err, result) {
                if (err) throw err;
                res.send({ dependencies: result })
                next()
            });
        });
        
        // Dynamically select DEPENDENCIES for /_deployableNAME from MySQL db
        server.get('/dependencies1', async (req, res, next) => {
            console.log(`GET /dependencies1`);
        
            let deployableName = req.query.deployableName
            let con = await db.checkConnection()
            const sql = `SELECT * from dependency where parent=?`
            const params = [ deployableName ]
        
            con.query(sql, params, function (err, result) {
                if (err) throw err;
                res.send({ dependencies: result })
                next()
            });
        });
        
        // Dynamically select ALL VARIABLES from MySQL db
        server.get('/variablesAll', async (req, res, next) => {
            console.log(`GET /variablesAll`);
        
            let con = await db.checkConnection()
            const sql = `SELECT * FROM variable`
        
            con.query(sql, function (err, result) {
                if (err) throw err;
                console.log("Result: " + result);
                res.send({ variables: result })
                next()
            });
        });
        
        // Dynamically select VARIABLES for /_deployableNAME from MySQL db
        server.get('/variables', async (req, res, next) => {
            console.log(`GET /variables`);
        
            let deployableName = req.query.deployableName
            let con = await db.checkConnection()
            const sql = `SELECT * FROM variable WHERE deployable=?`
            const params = [ deployableName ]
        
            con.query(sql, params, function (err, result) {
                if (err) throw err;
                console.log("Result: " + result);
                console.log(`result[0]=`, result[0]);
                res.send({ variables: result })
                next()
            });
        });
        
        // Edit the DEPLOYABLE values for /_deployableNAME on MySQL db        
        server.post('/deployable', async (req, res, next) => {
            console.log(`POST /deployable`)
        
            let con = await db.checkConnection()
            const product_owner = req.params.product_owner;
            const description = req.params.description;
            const is_project = req.params.is_project;
            const name = req.params.name;
            const sql = `UPDATE deployable SET product_owner =?, description =?, is_project =? WHERE name =?`
            const params = [ product_owner, description, is_project, name ]
        
            con.query(sql, params, (err, result) => {
                if (err) throw err;
                console.log("Result: " + req.params.product_owner + ' ' + req.params.description + ' ' + req.params.is_project)
            
                // Send a success reply
                res.send({ status: 'ok' });
                return next();
            })
        }); // End of section
        
        // Variables
        server.get('/variableValues', async (req, res, next) => {
            console.log(`GET /variableValues`);
        
            let environmentOwner = req.query.environmentOwner
            let environment = req.query.environment
            let applicationName = req.query.applicationName
        
            let con = await db.checkConnection()
            const sql = `SELECT * FROM variable_value WHERE environment_owner=? AND environment=? AND application_name=?`
            const params = [ environmentOwner, environment, applicationName ]
        
            con.query(sql, params, function (err, result) {
                if (err) throw err;
                console.log("Result: ", result);
                res.send({ variableValues: result })
                next()
            });
        });
        
        server.post('/variableValues', auth, async (req, res, next) => {
            console.log(`POST /variableValues`);
            console.log(`rec.params=`, req.params);
        
            // See what variables we currently have in th DB
            let environmentOwner = req.params.environmentOwner
            let environment = req.params.environment
            let applicationName = req.params.applicationName
            let variableValues = req.params.variableValues
        
            let con = await db.checkConnection()
            const sql = `SELECT * FROM variable_value WHERE environment_owner=? AND environment=? AND application_name=?`
            const params = [ environmentOwner, environment, applicationName ]
        
            let toAdd = []
            let toUpdate = []
            let toDelete = []
            
            con.query(sql, params, function (err, result) {
                if (err) throw err;
            
                // See what we have in the database that can be deleted.
                let dbIndex = { } // Hash of variables and values in the DB
                result.forEach(row => {
                    let variableName = row.variable_name
                    dbIndex[variableName] = row.value
                    if (typeof(variableValues[variableName]) === 'undefined') {
                        // console.log(`  -> delete ${variableName}`);
                        toDelete.push(variableName)
                    }
                })
            
                // See what we're received that can be added or updated
                for (let variableName in variableValues) {
                    let newValue = variableValues[variableName]
                    // console.log(`check ${variableName}`);
                    let oldValue = dbIndex[variableName]
                    if (typeof(oldValue) === 'undefined') {
                        // console.log(`  -> add ${variableName} (${newValue})`);
                        toAdd.push({ variableName, value: newValue })
                    } else if (oldValue !== newValue) {
                        // console.log(`  -> update ${variableName} (${newValue})`);        
                        toUpdate.push({ variableName, value: newValue })
                    }
                }
            
                deleteVariableValues(con, environmentOwner, environment, applicationName, toDelete, (err) => {
                    if (err) throw err
                    addVariableValues(con, environmentOwner, environment, applicationName, toAdd, (err) => {
                    if (err) throw err
                        updateVariableValues(con, environmentOwner, environment, applicationName, toUpdate, err => {
                            if (err) throw err
                
                            // Seems all worked.
                            res.send({ status: 'ok' })
                            next()
                        })
                    })  
                })
            });
        });
        
        async function deleteVariableValues(connection, environmentOwner, environment, applicationName, array, cb) {
            console.log(`deleteVariableValues()`, array);
        
            if (array.length === 0) {
                return cb(null)
            }
            let sql = `DELETE FROM variable_value WHERE environment_owner=? AND environment=? AND application_name=? AND (`
            let params = [ environmentOwner, environment, applicationName ]
            let sep = ''
            array.forEach(variableName => {
                sql += `${sep}variable_name=?`
                params.push(variableName)
                sep = ' OR '
            })
            sql += ')'
        
            console.log(`sql=${sql}`);
            console.log(`params=`, params);
            connection.query(sql, params, function (err, result) {
                if (err) throw err;
                return cb(null)
            })
        }
        
        async function addVariableValues(connection, environmentOwner, environment, applicationName, array, cb) {
            console.log(`addVariableValues()`, array);
        
            let doAdd = (index) => {
            if (index >= array.length) {
                return cb(null)
            }
        
            let sql = `INSERT INTO variable_value SET ?`
            let params = {
                environment_owner: environmentOwner,
                environment: environment,
                application_name: applicationName,
                variable_name: array[index].variableName,
                value: array[index].value
            }
            console.log(`sql=${sql}`);
            console.log(`params=`, params);
            connection.query(sql, params, function (err, result) {
                if (err) throw err;            
                // We use setTimeout so the stack does not overflow
                setTimeout(()=> {
                    doAdd(index + 1)
                }, 0)
            })
            }
            doAdd(0)
        }
        
        async function updateVariableValues(connection, environmentOwner, environment, applicationName, array, cb) {
            console.log(`updateVariableValues()`, array);
        
            let doUpdate = (index) => {
                if (index >= array.length) {
                    return cb(null)
                }
            
                let sql = `UPDATE variable_value SET value=? WHERE environment_owner=? AND environment=? AND application_name=? AND variable_name=?`
                let params = [
                    array[index].value,
                    environmentOwner,
                    environment,
                    applicationName,
                    array[index].variableName
                ]
                console.log(`sql=${sql}`);
                console.log(`params=`, params);
            
                connection.query(sql, params, function (err, result) {
                    if (err) throw err;
                
                    // We use setTimeout so the stack does not overflow
                    setTimeout(()=> {
                        doUpdate(index + 1)
                    }, 0)
                })
            }
            doUpdate(0)
        } // End of section
        
        // Add a new VARIABLE for /_deployableNAME on MySQL db
        server.post('/newVariable', async (req, res, next) => {
            console.log(`POST /newVariable`)
        
            let con = await db.checkConnection()
            const variableValues = {name: req.params.name, description: req.params.description, type: req.params.type, mandatory: req.params.mandatory, deployable: req.params.deployable, is_external: req.params.external}
            let sql = `INSERT INTO variable SET ?`
            let params = [ variableValues ]
        
            con.query( sql, params, (err, result) => {
                if (err) throw err;
                console.log("Result: NEW variable- " + req.params.name + " deployable- " + req.params.deployable + " Description- " + req.params.description) 
            
                // Send reply
                res.send({ status: 'ok' })
                return next();
            })
        }); // End of section
        
        // Edit a VARIABLE for /_deployableNAME on MySQL db        
        server.post('/variable', async (req, res, next) => {
            console.log(`POST /variable`)
        
            let con = await db.checkConnection()
            const deployable = req.params.deployable;
            const name = req.params.name;
            const description = req.params.description;
            const type = req.params.type;
            const mandatory = req.params.mandatory;
            const is_external = req.params.external;
            let sql = `UPDATE variable SET type=?, description =?, mandatory=?, is_external=? WHERE name=? AND deployable=?`
            let params = [ type, description, mandatory, is_external, name, deployable ]
        
            con.query(sql, params, (err, result) => {
                if (err) throw err;
                console.log("Result: ", result)
            
                // Send a success reply
                res.send({ status: 'ok' })
                return next();
            })
        }); // End of section
        
        // Add a new DEPENDENCY for /_deployableNAME on MySQL db        
        server.post('/newDependency', async (req, res, next) => {
            console.log(`POST /newDependency`)
        
            let con = await db.checkConnection()
            const dependencyValues = {parent: req.params.deployable, child: req.params.child, prefix: req.params.prefix, version: req.params.version}
            let sql = `INSERT INTO dependency SET ?`
            let params = [ dependencyValues ]
        
            con.query( sql, params, (err, result) => {
                if (err) throw err;
                console.log("Result: NEW dependency " + req.params.deployable + " child- " + req.params.child + " prefix- " + req.params.prefix) 
            
                // Send reply
                res.send({ status: 'ok' })
                return next();
            })
        }); // End of section
        
        // Edit a USER in /_deployableNAME on MySQL db
        server.post('/editUser', async (req, res, next) => {
            console.log(`POST /editUser`)
        
            let con = await db.checkConnection()
            const id = req.params.id;
            const access = req.params.access;
            const project = req.params.project;
            let sql = `UPDATE project_user SET access=? WHERE user_id=? AND project=?`
            let params = [ access, id, project ]
        
            con.query(sql, params, (err, result) => {
                if (err) throw err;
                console.log("Result: ", result)
            
                // Send a success reply
                res.send({ status: 'ok' });
                return next();
            })
        }); // End of section
    }
}