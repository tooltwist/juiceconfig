import errors from 'restify-errors';
import loginService from './loginservice-client';
import juice from '@tooltwist/juice-client'
import db from './database-mysql';

/**
 * Get the access token from the authorization header value
 * The format of the Authorization should be:
 * Bearer xxxxxxxxxxxx
 * @param {*} authorization can be provied by the request header
 */
function getJWTFromAuthorization(authorization) {
  const parts = authorization.split(' ');
  if (parts.length === 2) {
    const scheme = parts[0];
    const credentials = parts[1];
    const pattern = new RegExp('^Bearer$', 'i');
    // Test if the supplied header token type is valid
    // If valid, return the access token
    if (pattern.test(scheme)) {
      return credentials;
    }
  }
  return '';
}

/**
 * Check logged users role
 *  - if sent `roles` is empty, then will only check if logged in
 * @param {array} roles
 */
// export function isUserRole(roles = []) {
//   // will act as middleware
//   // check https://expressjs.com/en/guide/writing-middleware.html
//   // on the Configurable middleware --> Bottom area
//   return async (req, res, next) => {
//     const { payload } = req;

//     // if not logged in
//     try {
//       // check if logged in
//       if (!payload) {
//         throw new errors.UnauthorizedError('Authorization header is either missing or invalid!');
//       }

//       // if sent roles, then check if current user has any
//       // of the roles sent
//       if (roles && roles instanceof Array && roles.length) {
//         const { userId, userRoles } = payload;

//         // can add `SUPERUSER` privileges here.
//         // like anything is possible for this guy ^

//         // check if has any roles
//         const userHasRoles = roles.filter(role => userRoles.indexOf(role) > -1);

//         // if user do not have any of
//         // the sent `roles`, then not allowed
//         if (!userHasRoles.length) {
//             logger.error(`[Unauthorized access] User with id of ${userId} was not allowed to access service:
//                             * Path : ${req.path()}
//                             * Service Required Roles: ${roles.join(', ')}
//                             * User Roles: ${userRoles.join(', ')}
//                         `);
//           throw new errors.ForbiddenError(
//             // `Service is only available to users with role${
//             //   roles.length > 1 ? 's' : ''
//             // } of ${roles.join(', ')}!`,
//             'User is not authorized to access this resource!',
//           );
//         }
//       }
//     } catch (err) {
//       return next(err);
//     }
//     // move to next
//     return next();
//   };
// }

// export function checkRegistrationStatus() {
//   return async (req, res, next) => {
//     const { payload } = req;
//     try {
//       // check registration status
//       const registrationStatusExpired = await clientService.isRegistrationExpired(payload);
//       if (registrationStatusExpired) {
//         throw new errors.ForbiddenError('Registration already expired!');
//       }
//     } catch (err) {
//       return next(err);
//     }
//     // move to next
//     return next();
//   };
// }

// EXPORT Roles outside
// export const userRoles = ROLES;

function checkJuice(name, dflt, isInteger) {
  if (!isInteger) isInteger = false;
  console.log(`checkJuice(${name}, ${dflt}, ${typeof(dflt)}, ${isInteger})`);
  let defaultDesc = dflt
  if (dflt === juice.MANDATORY) {
    defaultDesc = 'MANDATORY'
  } else if (dflt === juice.OPTIONAL) {
    defaultDesc = 'OPTIONAL'
  } else if (!dflt) {
    defaultDesc = 'NULL'
  }
  // if (isInteger) {
  //   console.log(`checkJuice integer: (${name}, ${defaultDesc}, ${typeof(defaultDesc)})`);
  // } else {
  //   console.log(`Juice string: (${name}, ${defaultDesc}, ${typeof(dfltDesc)})`);
  // }

  try {
    if (isInteger) {
      let value = juice.intValue(name, dflt)
      console.log(`  - Juice integer: (${name}, ${defaultDesc}) -> ${value}`);
    } else {
      let value = juice.value(name, dflt)
      console.log(`  - Juice string: (${name}, ${defaultDesc}) -> ${value}`);
    }
  } catch (e) {
    console.log(`  - Juice error: (${name}, ${defaultDesc}) -> error ->`, e.message);
  }
}

export default async (req, res, next) => {
  try {

    console.log('In the auth middleware. YAY!!!')

// a
//     //ZZZZZZ
//     console.log(`STRINGS\n--------------------`);
//     checkJuice('db.host')
//     checkJuice('db.junk', 'abc')
//     checkJuice('db.junk', juice.MANDATORY)
//     checkJuice('db.junk', juice.OPTIONAL)
//     console.log(`INTEGERS\n--------------------`);
//     checkJuice('db.port', null, true)
//     checkJuice('db.host', null, true)
//     checkJuice('db.junk', 'abc', true)
//     checkJuice('db.junk', '123', true)
//     checkJuice('db.junk', 123, true)
//     checkJuice('db.junk', { abc: 'xyz' }, true)
//     checkJuice('db.junk', juice.MANDATORY, true)
//     checkJuice('db.junk', juice.OPTIONAL, true)
//     // let name = `db.host`
//     // let val = juice.value(name)
//     // console.log(`juice:${name} -> ${val}`);
//     throw new Error('happy bomb')


    // // Hack to allow testing without logging in first
    // const DEBUG_HACK = true;
    // if (DEBUG_HACK) {
    //   req.payload = {
    //     user_id: user_id,
    //     userRoles: [ 'AGENT', 'CLIENT_ADMIN', 'FORM_DESIGNER', 'TPM' ]
    //   };
    //   return next();
    // }


    // 1. Check if the request has authorization header
    const authorization = req.header('authorization');

    console.log(`(((`)
    console.log(`auth middleware`);
    console.log(`authorization=`, authorization);
    console.log(`)))`);
    // next()
    // return

    // 2. Throw an error 400 if no authorization is presented
    if (authorization) {
        // console.log(`auth: have authorization`);

        // 3. Get the JWT Token from the Authorization
        const token = getJWTFromAuthorization(authorization);
        // console.log(`auth: token is -->${token}<--`);

        // 4. Validate JWT Token if it is expired or invalid
        // Corresponding status error will be thrown depending on its type
        // console.log(`auth: before validating token`);
        await loginService.validateJWT(token);
        // console.log(`auth: after validating token`);

        // 5. Decode and attach the user details into the payload
        const { identity } = loginService.decodeJWT(token);
        // console.log(`auth: identity is`, identity);

        let externalID = identity.id
        console.log('externalID = ', externalID)

        req.identity = identity

        let username = identity.username


        // var con = mysql.createConnection({
        //     host: "localhost",
        //     port: 56911,
        //     database: "juice",
        //     user: "root",
        //     password: ""
        // });

        /*
         *  See if we have this user in our application database.
         */
        // const config = {
        //     host: await juice.string('db.host', juice.MANDATORY),
        //     port: await juice.integer('db.port', juice.MANDATORY),
        //     database: await juice.string('db.database', juice.MANDATORY),
        //     user: await juice.string('db.user', juice.MANDATORY),
        //     password: await juice.string('db.password', juice.MANDATORY)
        // }
        // console.log(`config=`, config);
        // var con = mysql.createConnection(config);
        // con.connect(function(err) {
        //     if (err) throw err;
        //     // console.log("Connected!");
        let con = await db.checkConnection()

            const sql = `SELECT * FROM user WHERE username=?`
            const params = [ username ]
            con.query(sql, params, function (err, result) {
                if (err) throw err;
                // console.log('result:::', result)
                if (result.length > 0) {
                  /*
                   *  User already in our DB.
                   */
                  // console.log(`Already have user`);
                  // console.log(`${result[0].email} vs ${identity.email}`)
                  // console.log(`${result[0].first_name} vs ${identity.first_name}`)
                  // console.log(`${result[0].last_name} vs ${identity.last_name}`)
                  const ourId = result[0].id
                  if (
                    result[0].external_id === identity.id
                    && result[0].email === identity.email
                    && result[0].first_name === identity.first_name
                    && result[0].last_name === identity.last_name
                  ) {
                    // Details are correct
                    // console.log(`user details correct`);
                    req.payload = { userIdentity: ourId }
                    return next()
                  }

                  // Need to update details
                  console.log(`updating user details`);
                  const sql = `UPDATE user SET external_id=?, email=?, first_name=?, last_name=? WHERE username=?`
                  const params = [
                    identity.id,
                    identity.email,
                    identity.first_name,
                    identity.last_name,
                    username
                  ]
                  con.query(sql, params, function (err, result) {
                    // con.end()
                    if (err) throw err;
                    // console.log(`result is`, result);
                    if (result.affectedRows !== 1) {
                      const msg = `Could not update user record`
                      console.error(msg, result);
                      throw new errors.ConflictError(msg)
                    }
                    req.payload = { userIdentity: ourId }
                    return next()
                  })//- update
                } else {
                  /*
                   *  We don't have this user in our database.
                   */
                  // console.log(`Add new user`);
                  const sql = `INSERT INTO user (username, external_id, email, first_name, last_name, role, access) VALUES (?,?,?,?,?,?,?)`
                  const params = [
                    username,
                    externalID,
                    identity.email,
                    identity.first_name,
                    identity.last_name,
                    '', // Role
                    '', // Access
                  ]
                  con.query(sql, params, function (err, result) {
                    // con.end()
                    if (err) throw err;
                    // console.log(`result is`, result);
                    if (result.affectedRows !== 1) {
                      const msg = `Could not insert user record`
                      console.error(msg, result);
                      throw new errors.ConflictError(msg)
                    }
                    req.payload = { userIdentity: result.insertId }
                    return next()
                  })//- insert
                }
            });
        // });
    } else {
      console.log(`auth: Do not have authorization`);
    }
  } catch (error) {
    console.log(`Error in auth.js:auth()`, error);
    res.send(error);
  }
};
