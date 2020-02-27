const	mysql = require('mysql');
import juice from '@tooltwist/juice-client';

/*
 *	This is the database connection.
 *
 *	If the connection drops out, this will be reset to null,
 *	and set again on the next call to checkConnection().
 */
let CURRENT_CONNECTION = null;

// Display debug messages
var VERBOSE = false;


exports.checkConnection = checkConnection;
async function checkConnection() {
	if (VERBOSE) console.log('database-mysql.checkConnection()')

	return new Promise(async (resolve, reject) => {


		// If the current connection is working, use it.
		if (CURRENT_CONNECTION) {
			if (VERBOSE) console.log('Already connected.')
			return resolve (CURRENT_CONNECTION);
		}

		const config = {
			host: await juice.string('db.host', juice.MANDATORY),
			port: await juice.integer('db.port', juice.MANDATORY),
			database: await juice.string('db.database', juice.MANDATORY),
			user: await juice.string('db.user', juice.MANDATORY),
			password: await juice.string('db.password', juice.MANDATORY)
		}
		// console.log(`config=`, config);


		// We either haven't connected to the database yet, or the
		// connection has dropped out and been reset. Connect now.
		if (VERBOSE) console.log('Connecting...')
		var connection = mysql.createConnection(config);
		// var connection = mysql.createConnection(config.mysqlConnectionOptions);

		// Handle the connection failing or dropping out.
		connection.on("error", function (error) {
			if (VERBOSE) console.log('Connection error', error)
			//		console.log('connection error event', error)
			if (error instanceof Error) {
				if (error.code === "PROTOCOL_CONNECTION_LOST") {
					console.error(error.stack);
					console.log("Lost connection. Reconnecting...");
					// Will cause reconnect on next API call.
					// Hopefully the disconnect has occurred between API calls.
					// destroy unused connection
					connection.destroy()
					// reconnect - try and get connection again.
					checkConnection()
						.then((connection) => resolve(connection))
						.catch((err) => reject(err))
				} else if (error.fatal) {
					// Not sure how to handle this
					throw error;
				}
			}
		});

		// Do the connect and return this connection
		connection.connect(function(err) {
			if (err) return reject(err);
			CURRENT_CONNECTION = connection;
			return resolve(connection);
		});

	})
}
