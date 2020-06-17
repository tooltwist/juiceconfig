import restify from 'restify';
import db from './database-mysql';
import auth from './auth'
import misc from './misc'

export default {
	register (server) {
        // Remove user of selected deployable from project_user db table
        server.del('/api/removeUser/:deployable/:username', async (req, res, next) => {
            console.log(`DELETE /removeUser`);

            let con = await db.checkConnection();
            const project = req.params.deployable;
            const username = req.params.username;

            console.log('project =', project);
            console.log('username =', username);

            const sql = `DELETE FROM project_user WHERE project =? AND username =?`
            const params = [project, username]

            console.log('params = ', params)

            con.query( sql, params, (err, result) => {
                if (err) throw err;
            
                // Send reply
                res.send({ status: 'ok' })
                return next();
            }) 
        });

        // Update edited DEPLOYABLE details
        server.put('/api/deployable', async (req, res, next) => {
            console.log(`PUT /deployable`)
        
            let con = await db.checkConnection()

            const product_owner = req.params.product_owner;
            const description = req.params.description;
            const type = req.params.type;
            const is_global = req.params.is_global;
            const name = req.params.name;
            const sql = `UPDATE deployable SET product_owner =?, description =?, is_global =?, type =? WHERE name =?`
            const params = [ product_owner, description, is_global, type, name ]
            
            con.query( sql, params, (err, result) => {
                if (err) throw err;
            
                // Send reply
                res.send({ status: 'ok' })
                return next();
            }) 
        });

        // Dynamically select the DEPLOYABLE for /_deployableNAME from MySQL db
        server.get('/api/deployable', async (req, res, next) => {
            console.log(`GET /deployable`);
        
            let deployableOwner = req.query.deployableOwner
            let deployableName = req.query.deployableName
            let con = await db.checkConnection()
            const sql = `SELECT * from deployable where owner=? AND name=?`
            const params = [ deployableOwner, deployableName ]
            console.log(`  sql=${sql}`);
            console.log(`  params=`, params);
            con.query(sql, params, function (err, result) {
                if (err) throw err;
                console.log("Result: " + result);
                console.log(`result[0]=`, result[0]);
                res.send({ record: result[0] })
                next()
            });
        });
        
        //Dynamically select the ENVIRONMENT for /_deployableNAME from MySQL db
        server.get('/api/envDeployments', async (req, res, next) => {
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
        server.get('/api/project_users', async (req, res, next) => {
            console.log(`GET /project_users`);
        
            let deployableName = req.query.deployableName
            let con = await db.checkConnection()
            const sql = `SELECT PU.project, PU.username, PU.user_id, PU.access, U.first_name, U.last_name FROM project_user PU left outer join user U on PU.user_id = U.id WHERE PU.project=?`
            let params = [ deployableName ]
        
            con.query(sql, params, function (err, result) {
                if (err) throw err;
                res.send({ users: result })
                next()
            })
        })
        
        // Dynamically select ALL DEPENDENCIES from MySQL db
        server.get('/api/dependencies', async (req, res, next) => {
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
        server.get('/api/deployable/:deployable/dependancies', async (req, res, next) => {
            console.log(`GET /deployable/:deployable/dependancies`);
        
            //let { owner:parentOwner, name:parentName } = misc.splitOwnerName(req.params.deployable)  
            //console.log(`owner=`, owner);
            //console.log(`name=`, name);
            
            console.log(`query=`, req.query);
            console.log(`params=`, req.params);

            let deployableName = req.query.deployableName;
            let ownerName = req.query.deployableOwner;
            let con = await db.checkConnection()
            const sql = `SELECT * FROM dependency WHERE parent_owner=? AND parent_name=?`
            const params = [ ownerName, deployableName ]
        
            con.query(sql, params, function (err, result) {
                if (err) throw err;
                res.send({ dependencies: result })
                next()
            });
        });

        // Dynamically select VERSIONS for /_deployableNAME from MySQL db
        server.get('/api/versions', async (req, res, next) => {
            console.log(`GET /versions`);
        
            let deployableName = req.query.deployableName
            let con = await db.checkConnection()
            const sql = `SELECT * from deployable_version where deployable_name=?`
            const params = [ deployableName ]
        
            con.query(sql, params, function (err, result) {
                if (err) throw err;
                res.send({ versions: result })
                next()
            });
        });

        // Dynamically select TOKENS for /_deployableNAME from MySQL db
        server.get('/api/tokens/:deployable', async (req, res, next) => {
            console.log(`GET /api/tokens:deployable`);

            console.log(`deployable=`, req.params.deployable);

            let { owner:deployableOwner, name:deployableName } = misc.splitOwnerName(req.params.deployable)
        
            // let deployableName = req.query.deployableName
            let con = await db.checkConnection()
            const sql = `SELECT * FROM token WHERE deployable_owner=? AND deployable_name=?`
            const params = [ deployableOwner, deployableName ]
        
            con.query(sql, params, function (err, result) {
                if (err) throw err;
                res.send({ tokens: result })
                next()
            });
        });

        // Create a randomly generated token 
        const {performance} = require('perf_hooks');
        function generateUUID () {
            var d = new Date().getTime()
            if (performance && typeof performance.now === "function") {
              d += performance.now()
            }
            
            var uuid = 'xxxxxxxx-xxxx-4xxx'.replace(/[xy]/g, function (c) { 
              var r = (d + Math.random() * 16) % 16 | 0
              d = Math.floor(d / 16)
              return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16)
            })

            return uuid;
        }

        // Add a NEW TOKEN to the db token from /_deployableNAME
        server.post('/api/token', async (req, res, next) => {
            console.log(`POST /token`)

            const id = generateUUID();
        
            const tokenValues = {
                id: id,
                token_type: req.params.token_type,
                deployable_name: req.params.deployable_name,
                deployable_owner: req.params.deployable_owner,
            }
            if (req.params.target_environment_owner) {
                target_environment_owner: req.params.target_environment_owner
            }
            if (req.params.target_environment_name) {
                target_environment_name: req.params.target_environment_name
            }
            if (req.params.target_application_name) {
                target_application_name: req.params.target_application_name
            }
            
            let sql = `INSERT INTO token SET ?`
            let params = [ tokenValues ]
            let con = await db.checkConnection()
            con.query( sql, params, (err, result) => {
                if (err) throw err;

                // Send reply
                res.send({ status: 'ok' })
                return next();
            })
        }); // End of section

        // Add a NEW VERSION to the db deployable_version from /_deployableNAME
        server.post('/api/newVersion', async (req, res, next) => {
            console.log(`POST /newVersion`)
        
            let con = await db.checkConnection()
            const versionValues = {version: req.params.version, build_no: req.params.build_no, registration_source: req.params.registration_source, registered_by: req.params.registered_by, deployable_name: req.params.deployable_name, deployable_owner: req.params.deployable_owner}
            let sql = `INSERT INTO deployable_version SET ?`
            let params = [ versionValues ]
        
            con.query( sql, params, (err, result) => {
                if (err) throw err;

                // Send reply
                res.send({ status: 'ok' })
                return next();
            })
        }); // End of section

        
        // Dynamically select ALL VARIABLES from MySQL db
        server.get('/api/variablesAll', async (req, res, next) => {
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
        server.get('/api/variables', async (req, res, next) => {
            console.log(`GET /variables`);
        
            let deployableOwner = req.query.deployableOwner
            let deployableName = req.query.deployableName
            let con = await db.checkConnection()
            const sql = `SELECT * FROM variable WHERE deployable_owner=? AND deployable_name=?`
            const params = [ deployableOwner, deployableName ]
            console.log(`  sql=${sql}`);
            console.log(`  params=`, params);

            con.query(sql, params, function (err, result) {
                if (err) throw err;
                console.log("Result: " + result);
                console.log(`result[0]=`, result[0]);
                res.send({ variables: result })
                next()
            });
        });
        
        /*// Edit the DEPLOYABLE values for /_deployableNAME on MySQL db        
        server.post('/api/deployable', async (req, res, next) => {
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
        }); // End of section*/
        
        // Variables
        server.get('/api/deployment/:environment/:applicationName/variableValues', async (req, res, next) => {
            console.log(`GET /deployment/:env/:app/variableValues`);
        
            // console.log(`query=`, req.query);
            // console.log(`params=`, req.params);
            let { owner:environmentOwner, name:environmentName } = misc.splitOwnerName(req.params.environment)

            // let environmentOwner = req.query.environmentOwner
            // let environment = req.query.environment
            let applicationName = req.params.applicationName
            console.log(`environmentOwner=${environmentOwner}`);
            console.log(`environmentName=${environmentName}`);
            console.log(`applicationName=${applicationName}`);
        
            let con = await db.checkConnection()
            const sql = `SELECT * FROM variable_value WHERE environment_owner=? AND environment_name=? AND application_name=?`
            const params = [ environmentOwner, environmentName, applicationName ]
        
            con.query(sql, params, function (err, result) {
                if (err) throw err;
                console.log("Result: ", result);
                res.send({ variableValues: result })
                next()
            });
        });
        
        server.post('/api/variableValues', auth, async (req, res, next) => {
            console.log(`POST /variableValues`);
            console.log(`rec.params=`, req.params);
        
            // See what variables we currently have in th DB
            let environmentOwner = req.params.environmentOwner
            let environmentName = req.params.environmentName
            let applicationName = req.params.applicationName
            let variableValues = req.params.variableValues
        
            let con = await db.checkConnection()
            const sql = `SELECT * FROM variable_value WHERE environment_owner=? AND environment_name=? AND application_name=?`
            const params = [ environmentOwner, environmentName, applicationName ]
        
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
console.log(`yarp 1`);
                deleteVariableValues(con, environmentOwner, environmentName, applicationName, toDelete, (err) => {
console.log(`yarp 2`);
                    if (err) throw err
console.log(`yarp 3`);
                    addVariableValues(con, environmentOwner, environmentName, applicationName, toAdd, (err) => {
console.log(`yarp 4`);
                        if (err) throw err
console.log(`yarp 5`);
                        updateVariableValues(con, environmentOwner, environmentName, applicationName, toUpdate, err => {
console.log(`yarp 6`);
                            if (err) throw err
console.log(`yarp 7`);
                
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
            let sql = `DELETE FROM variable_value WHERE environment_owner=? AND environment_name=? AND application_name=? AND (`
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
                environment_name: environment,
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
        
        async function updateVariableValues(connection, environmentOwner, environmentName, applicationName, array, cb) {
            console.log(`updateVariableValues()`, array);
        
            let doUpdate = (index) => {
                if (index >= array.length) {
                    return cb(null)
                }
            
                let sql = `UPDATE variable_value SET value=? WHERE environment_owner=? AND environment_name=? AND application_name=? AND variable_name=?`
                let params = [
                    array[index].value,
                    environmentOwner,
                    environmentName,
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
        server.post('/api/newVariable', async (req, res, next) => {
            console.log(`POST /newVariable`)
        
            let con = await db.checkConnection()
            const variableValues = {
                deployable_owner: req.params.deployable_owner,
                deployable_name: req.params.deployable_name,
                name: req.params.name,
                description: req.params.description,
                type: req.params.type,
                mandatory: req.params.mandatory,
                is_external: req.params.external,
                is_sensitive: req.params.sensitive,
                // example: req.params.example,
            }
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
        server.post('/api/variable', async (req, res, next) => {
            console.log(`POST /variable`)
        
            let con = await db.checkConnection()
            const deployable_owner = req.params.deployable_owner;
            const deployable_name = req.params.deployable_name;
            const name = req.params.name;
            const description = req.params.description;
            const type = req.params.type;
            const mandatory = req.params.mandatory;
            const is_external = req.params.is_external;
            const is_sensitive = req.params.is_sensitive;
            const example = req.params.example;
            let sql = `UPDATE variable SET type=?, description =?, mandatory=?, is_external=?, is_sensitive=?, example=? WHERE deployable_owner=? AND deployable_name=? AND name=?`
            let params = [ type, description, mandatory, is_external, is_sensitive, example, deployable_owner, deployable_name, name ]
            console.log(`sql=${sql}`);
            console.log(`params=`, params);
            con.query(sql, params, (err, result) => {
                if (err) throw err;
                console.log("Result: ", result)
            
                // Send a success reply
                res.send({ status: 'ok' })
                return next();
            })
        }); // End of section

        // Add a new VARIABLE for /_deployableNAME on MySQL db
        server.del('/api/variable/:deployable/:name', async (req, res, next) => {
            console.log(`DEL /variable`, req.params)
        
            let con = await db.checkConnection()
            const { owner:deployableOwner, name:deployableName } = misc.splitOwnerName(req.params.deployable)
            const name = req.params.name
            const sql = `DELETE FROM variable WHERE deployable_owner=? AND deployable_name=? AND name=?`
            const params = [ deployableOwner, deployableName, name ]
            console.log(`  sql=${sql}`)
            console.log(`  params=`, params)
            con.query( sql, params, (err, result) => {
                if (err) throw err;
                // console.log("Result: NEW variable- " + req.params.name + " deployable- " + req.params.deployable + " Description- " + req.params.description) 
                res.send({ status: 'ok' })
                return next();
            })
        }); // End of section
     
        // Add a new DEPENDENCY for /_deployableNAME on MySQL db        
        server.post('/api/newDependency', async (req, res, next) => {
            console.log(`POST /newDependency`)
        
            let con = await db.checkConnection()
            const dependencyValues = {parent_name: req.params.deployable, parent_owner: req.params.parent_owner, child_name: req.params.child_name, child_owner: req.params.child_owner, prefix: req.params.prefix, version: req.params.version}
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
        server.post('/api/editUser', async (req, res, next) => {
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