import restify from 'restify';
import corsMiddleware from 'restify-cors-middleware';
import db from './database-mysql';
import auth from './auth';
import figlet from 'figlet';
import deploymentServices from './deployment-services';
import deployableNameServices from './deployableName-services';
import deployablesServices from './deployables-services';
import userNameServices from './userName-services';
import myaccountServices from './myaccount-services';
import environmentServices from './environment-services';
import environmentNameServices from './environmentName-services';
import configServices from './config-services';
import userServices from './user-services';

/*
 *  Initialise Restify.
 *  (See http://restify.com/docs/plugins-api/)
 *  - parse the ?a=b stuff in the URL
 *  - parse a BODY sent in the request (e.g. JSON data in a POST request)
 *  - ZIP the response if possible, so the reply is small/faster.
 */
var server = restify.createServer();

server.use(restify.plugins.queryParser({ mapParams: true }));
server.use(restify.plugins.bodyParser({
  mapParams: true,
  mapFiles: true
}));
server.use(restify.plugins.gzipResponse());

/*
 *	Support CORS (Cross-Origin Resource Sharing) to allow cross domain access.
 *  Normally a browser cannot call an API at a different domain to the website.
 *  (For example a web page at http://aaa.com cannot call an API at http://bbb.com)
 *  See https://github.com/TabDigital/restify-cors-middleware
 */
const cors = corsMiddleware({
  preflightMaxAge: 5, // Optional
  origins: ['*'],
  allowHeaders: ['Authorization'],
  exposeHeaders: ['*'],
});
server.pre(cors.preflight);
server.use(cors.actual);

function respond(req, res, next) {
  res.send('hello ' + req.params.name);
  next();
}
server.get('/hello/:name', respond);
server.head('/hello/:name', respond);

// Healthcheck, so the load balancer can check the API is operational
server.get('/healthcheck', async (req, res, next) => {
  console.log(`GET /healthcheck`);

  res.send({
    status: 'ok',
    version: '___INSERT_VERSION_HERE___',
    buildNo: '___INSERT_BUILD_NUMBER_HERE___',
    commitMsg: '___INSERT_COMMITMSG_HERE___',
    identifier: 'Snarglefish'
  })
  next()
});

deploymentServices.register(server)

deployableNameServices.register(server)

deployablesServices.register(server)

userNameServices.register(server)

myaccountServices.register(server)

environmentServices.register(server)

environmentNameServices.register(server)

configServices.register(server)

userServices.register(server)


// Authentication: Select the user details/accessibility for the current user (logged in)
server.get('/currentUser', auth, async (req, res, next) => {
  console.log(`GET /currentUser`);

  let userIdentity = req.payload.userIdentity
  let con = await db.checkConnection()
  const sql = `SELECT * FROM user WHERE user.id =?`
  const params = [ userIdentity ]

  con.query(sql, params, function (err, result) {
    if (err) throw err;
    res.send({ user: result })
    next()
  });
}); // End of section

// >>>>>>> b358488128689c398a8de1ef6e727f3a03c99cfc

/*
*       Display a nice banner.
*       See https://www.npmjs.com/package/figlet
*/
console.log();
console.log(figlet.textSync('juice-api', {
  horizontalLayout: 'fitted'
}));
console.log();

server.listen(4000, function() {
  console.log('%s listening at %s', server.name, server.url);
});
