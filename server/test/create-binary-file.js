const fs = require('fs');
const path = require('path');


const data2 = [

  // hello
  0x68,
  0x65,
  0x6c,
  0x6c,
  0x6f,
  0x0a,

  // binary stuff
  0x01,
  0x02,
  0x03,
  0xe1,
  0xf2,
  0xff,
  0x0a,

  // port: $JUICE{db.port}
  0x70,
  0x6f,
  0x72,
  0x74,
  0x3a,
  0x20,
  0x24,
  0x4a,
  0x55,
  0x49,
  0x43,
  0x45,
  0x7b,
  0x64,
  0x62,
  0x2e,
  0x70,
  0x6f,
  0x72,
  0x74,
  0x7d,
  0x0a
]

// Save binary data to a file called "binary.txt" in the current
// directory. Again, the operation will be completed in background.
var buffer = new Buffer(data2);
fs.writeFile('binary.txt', buffer, function(err) {
  // If an error occurred, show it and return
  if(err) return console.error(err);
  // Successfully wrote binary contents to the file!
});

// process.stdout.write(Buffer.from(data))
