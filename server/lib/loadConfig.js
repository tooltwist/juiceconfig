
var firstTime = true;

exports.require = function(relativePath) {
	var path = exports.getPath(relativePath);
	return require(path);
}

exports.getPath = function(relativePath) {

	// Check we have environment variable CURIA_HOME set
	var home = process.env['SERVER_HOME'];
	if (home == undefined) {
		console.log('')
		console.log('')
		console.log('')
		console.log('-----------------------------------------------------------------------------')
		console.log('ERROR ERROR ERROR ERROR ERROR ERROR ERROR ERROR ERROR ERROR ERROR ERROR ERROR')
		console.log('')
		console.log('')
		console.log('     FATAL ERROR:');
		console.log('     Environment variable SERVER_HOME is not defined. Shutting down...');
		console.log('')
		console.log('')
		console.log('ERROR ERROR ERROR ERROR ERROR ERROR ERROR ERROR ERROR ERROR ERROR ERROR ERROR')
		console.log('-----------------------------------------------------------------------------')
		console.log('')
		console.log('')
		console.log('')
		process.exit(1);
		return;
	}

	// Now add on the file we are after.
	var path = home + '/' + relativePath;
	if (firstTime) {
		console.log('\n\nSERVER_HOME = ' + home + '\n\n');
		firstTime = false;
	}
	// console.log('path is ' + path);
	return path;
}
