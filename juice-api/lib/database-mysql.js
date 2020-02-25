var SERVER_HOME = require('./SERVER_HOME'),
		config = SERVER_HOME.require('config/serverConfig.js'),
		mysql = require('mysql');
		errors = require('restify-errors'),	// https://github.com/restify/errors
		moment = require('moment');

// var MAX_ROWS = 200;
var VERBOSE = false;


/*
 *	This is the database connection.
 *
 *	If the connection drops out, this will be reset to null,
 *	and set again on the next call to checkConnection().
 */
var CURRENT_CONNECTION = null;


exports.getCurrentConnection = function(callback) {
	if (CURRENT_CONNECTION) {
		// console.log('- already connected')
		return callback(null, CURRENT_CONNECTION);
	} else {
		checkConnection(function(err, connection){
			if (err) {
				callback(err, null)
			} else {
				callback(null, connection)
			}
		})
	}
}

exports.checkConnection = function(callback/*(err, connection)*/) {
	checkConnection(function(err, connection){
		if (err) {
			callback(err, null)
		} else {
			callback(null, connection)
		}
	})
}

function checkConnection(callback) {
	//console.log('database-mysql.checkConnection()')

	// If the current connection is working, use it.
	if (CURRENT_CONNECTION) {
		// console.log('- already connected')
		return callback(null, CURRENT_CONNECTION);
	}

	// We either haven't connected to the database yet, or the
	// connection has dropped out and been reset. Connect now.
	console.log('Connecting...')
	var connection = mysql.createConnection(config.mysqlConnectionOptions);

	// Handle the connection failing or dropping out.
	connection.on("error", function (error) {
		console.log('Connection error', error)
		//		console.log('connection error event', error)
		if (error instanceof Error) {
			if (error.code === "PROTOCOL_CONNECTION_LOST") {
				console.error(error.stack);
				console.log("Lost connection. Will need to reconnect...");
				// Will cause reconnect on next API call.
				// Hopefully the disconnect has occurred between API calls.
				// destroy unused connection
				connection.destroy()
				// reconnect
				checkConnection(function(err, connection){
					// try and get connection again
				})
			} else if (error.fatal) {
				// Not sure how to handle this
				throw error;
			}
		}
	});

	// Do the connect and return this connection
	connection.connect(function(err) {
		if (err) return callback(err);
		CURRENT_CONNECTION = connection;
		return callback(null, connection);
	});
}
