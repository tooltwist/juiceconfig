const util = require('util')
const exec = require('child_process').exec;
const assert = require('assert');
const fs = require('fs');

const DIRNAME = 'yarp'

module.exports.prepareOutputDirectory = async function prepareOutputDirectory(suffix) {
  const directory = `/tmp/${DIRNAME}.${suffix}`
  let cmd = `rm -rf ${directory}`
  // console.log(`\t- ${cmd}`);

  return new Promise(function (resolve, reject) {
    exec(cmd, function callback(error, stdout, stderr) {
        if (error) {
          if (!ignoreErrorOutput) {
            console.log(`error:`, error);
            console.log(`stdout:`, stdout);
            console.log(`stderr:`, stderr);
          }
          return reject()
        } else {
          return resolve(directory)
        }
    });
  })
}



module.exports.install = async function install(from, to, ignoreErrorOutput) {
  let cmd = `node ../bin/juice-cli.js install ${from} ${to}`
  // console.log(`\t- ${cmd}`);

  return new Promise(function (resolve, reject) {
    exec(cmd, function callback(error, stdout, stderr) {
        if (error) {
          if (!ignoreErrorOutput) {
            console.log(`error:`, error);
            console.log(`stdout:`, stdout);
            console.log(`stderr:`, stderr);
          }
          return resolve(false)
        } else {
          return resolve(true)
        }
    });
  })
}


module.exports.assertFileContainsString = function install(path, pattern) {
  let rawdata = fs.readFileSync(path, 'utf8');
  if (!rawdata.match(pattern)) {
    assert.fail('Expected pattern not found')
  }
}


module.exports.assertBinaryFileContainsBytes = function install(path, bytes) {
  let rawdata = fs.readFileSync(path);
  bytes = Buffer.from(bytes)
  let pos = rawdata.indexOf(bytes, 'binary')
  // console.log(`pos = ${pos}`);
  if (pos < 0) {
    assert.fail('Expected bytes not found')
  }
}


module.exports.assertSameSizeFiles = function install(path1, path2) {
  const size1 = fs.lstatSync(path1).size
  const size2 = fs.lstatSync(path2).size
  // console.log(`${size1} versus ${size2}`);

  if (size1 !== size2) {
    assert.fail('File sizes not the same')
  }
}


module.exports.assertFileExists = function install(path) {
  // console.log(`assertFileExists(${path})`);
  if (!fs.existsSync(path)) {
    console.log(`File should exist`);
    assert.fail('File should exist')
  }
}


module.exports.assertFileDoesNotExist = function install(path) {
  // console.log(`assertFileDoesNotExist(${path})`);
  if (fs.existsSync(path)) {
    console.log(`File exists`);
    assert.fail('File should not exist')
  }
}
