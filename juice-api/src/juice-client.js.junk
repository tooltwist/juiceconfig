// const path = require('path');
const fs = require('fs');
const path = require('path');
// const detectCharacterEncoding = require('detect-character-encoding');
const { isText, isBinary, getEncoding } = require('istextorbinary');
const AWS = require('aws-sdk')
//     region = "ap-southeast-1",
//     secretName = "PHILTEST",
//     secret,
//     decodedBinarySecret;


exports.value = getStringValue
exports.stringValue = getStringValue
exports.intValue = getIntegerValue
exports.string = getStringValue
exports.int = getIntegerValue
exports.integer = getIntegerValue
exports.forceReload = getIntegerValue
exports.MANDATORY = 'juice-client-mandatory-value-8q568w657x515'
exports.OPTIONAL = 'juice-client-optional-value-8q568w657x515'

let configuration = null
let configLoadTime = 0
//const CACHE_INTERVAL = (1000 * 60 * 10) // 10 minutes
const CACHE_INTERVAL = (1000 * 60 * 60 * 24 * 1000) // 1000 days

async function loadConfigFile(path) {
  if (!fs.existsSync(path)) {
    console.error(`FATAL ERROR: Invalid environment variable JUICE_CONFIG (unknown file ${path})`)
    process.exit(1)
  }

  try {
    let rawdata = fs.readFileSync(path);
    let config = JSON.parse(rawdata);
    // console.log(config);
    configuration = config
  } catch (e) {
    console.error(`FATAL ERROR: Could not load config file ${path}:\n`, e)
    process.exit(1)
  }
}

function getConfigFromSecretsManager(region, secretName) {
  console.log(`getConfigFromSecretsManager(${region}, ${secretName})`);

  return new Promise(function(resolve, reject) {

    // Create a Secrets Manager client
    let client = new AWS.SecretsManager({
        region: region
    });
    // In this sample we only handle the specific exceptions for the 'GetSecretValue' API.
    // See https://docs.aws.amazon.com/secretsmanager/latest/apireference/API_GetSecretValue.html
    // We rethrow the exception by default.

    // console.log(`Getting secret ${secretName} from AWS`);
    client.getSecretValue({SecretId: secretName}, function(err, data) {
      console.log(`back`);
      if (err) {
        if (err.code === 'DecryptionFailureException')
            // Secrets Manager can't decrypt the protected secret text using the provided KMS key.
            // Deal with the exception here, and/or rethrow at your discretion.
            throw err;
        else if (err.code === 'InternalServiceErrorException')
            // An error occurred on the server side.
            // Deal with the exception here, and/or rethrow at your discretion.
            throw err;
        else if (err.code === 'InvalidParameterException')
            // You provided an invalid value for a parameter.
            // Deal with the exception here, and/or rethrow at your discretion.
            throw err;
        else if (err.code === 'InvalidRequestException')
            // You provided a parameter value that is not valid for the current state of the resource.
            // Deal with the exception here, and/or rethrow at your discretion.
            throw err;
        else if (err.code === 'ResourceNotFoundException')
            // We can't find the resource that you asked for.
            // Deal with the exception here, and/or rethrow at your discretion.
            throw err;
      }

      console.log(`Have secret`, data);
      // Decrypts secret using the associated KMS CMK.
      // Depending on whether the secret is a string or binary, one of these fields will be populated.
      let secret
      if ('SecretString' in data) {
          secret = data.SecretString;
      } else {
          let buff = new Buffer(data.SecretBinary, 'base64');
          let decodedBinarySecret = buff.toString('ascii');
          // console.log(`decodedBinarySecret=`, decodedBinarySecret);
          secret = decodedBinarySecret
      }
      // console.log(`Found secret ${secret}`);
      try {
        let config = JSON.parse(secret)
        // console.log(`parsed secret is `, config);
        configuration = config
      } catch (e) {
        console.error(`FATAL ERROR: Invalid JSON in secret ${secretName}\n`, e)
        process.exit(1)
      }
      resolve({})
    })//- getSecretValue
  })//- new promise
}

function forceReload() {
  configLoadTime = 0
}

async function checkConfigLoaded() {
  let now = Date.now()
  if (configLoadTime > 0 && (now - configLoadTime) < CACHE_INTERVAL) {
    // console.log(`Using cached config`);
    return
  }
  // console.log(`********************`);
  // console.log(` checkConfigLoaded()`);
  // console.log(`********************`);
  // console.log(`env=`, process.env);

  const juiceSource = process.env['JUICE_CONFIG']
  // console.log(`JUICE_CONFIG=${juiceSource}`);

  if (!juiceSource) {
    // We have no configuration. We cannot proceed.
    console.error(`FATAL ERROR: Missing environment variable JUICE_CONFIG`)
    process.exit(1)
  }

  const arr = juiceSource.split(':::')
  // console.log(`arr=`, arr);
  if (arr.length < 2) {
    console.error(`FATAL ERROR: Invalid environment variable JUICE_CONFIG (missing :::)`)
    process.exit(1)
  }

  switch (arr[0]) {
    case 'file':
      await loadConfigFile(arr[1])
      break

    case 'secrets_manager':
      await getConfigFromSecretsManager(arr[1], arr[2])
      break

    default:
      console.error(`FATAL ERROR: Invalid environment variable JUICE_CONFIG (unknown type ${arr[0]})`)
      process.exit(1)
  }

  configLoadTime = now
}

async function flattenConfig() {
  // console.log(`flattenConfig()`);
  await checkConfigLoaded()
  // console.log(`config is `, configuration);
  let lookup = { }
  addValues(lookup, '', configuration)
  return lookup
}

function addValues(lookup, name, thing) {
  // console.log(`addValues(lookup, ${name}, thing)`);
  if (typeof(thing) === 'object') {
    // console.log(`   ${name} - object`);
    for (key in thing) {
      // console.log(`    - ${key}`);
      let value = thing[key]
      let nname = name ? `${name}.${key}` : key
      addValues(lookup, nname, value)
    }
  } else {
    lookup[name] = thing
  }
}

function findValue(object, name) {
  // console.log(`findValue(object, ${name})`, object);
  if (typeof(object) !== 'object') {
    // console.log(`object is not an object`);
    return undefined
  }

  let value = object[name]
  if (typeof(value) !== 'undefined') {
    return value
  }

  // Not found. If name matches X.Y, then see if X is an object.
  let pos = name.indexOf('.')
  if (pos < 0) {
    // Nope, not a multi-part name.
    return undefined
  }

  let prefix = name.substring(0, pos)
  let suffix = name.substring(pos + 1)
  let childObject = object[prefix]
  switch (typeof(childObject)) {
    case 'object':
      return findValue(childObject, suffix)
    case 'undefined':
      return childObject
    default:
      // X is not an object, so cannot contain Y
      return undefined
  }
}


async function getStringValue(name, dflt) {
  if (!dflt) {
    dflt = exports.MANDATORY
  }

  // Check we have the configuration loaded
  await checkConfigLoaded()
  // if (!configuration || configLoadTime === 0) {
  //   throw new Error(`Call loadConfig() before getting values`)
  // }

  // Get the value from the config.
  let value = findValue(configuration, name)
  console.log(`findValue(${name}) => ${value} (${typeof(value)})`);
  if (typeof(value) !== 'undefined') {
    return value
  }

  // Value was not defined.
  if (dflt) {
    if (dflt === exports.MANDATORY) {
      throw new Error(`Missing mandatory config variable '${name}'`)
    } else if (dflt === exports.OPTIONAL) {
      return undefined
    } else {
      return dflt
    }
  }

  // Not found, and no default provided.
  throw new Error(`Missing mandatory config variable '${name}'`)
}

async function getIntegerValue(name, dflt) {
  if (!dflt) {
    dflt = exports.MANDATORY
  }

  // Get the string value of this variable
  let value = await getStringValue(name, exports.OPTIONAL)

  if (typeof(value) === 'undefined' || value === null || value === '') {
    // Value not found. Do we have a default?
    if (dflt === exports.MANDATORY) {
      throw new Error(`Missing mandatory config variable '${name}'`)
    } else if (dflt === exports.OPTIONAL) {
      return -1
    } else {
      if (typeof(dflt) === 'number') {
        return dflt
      }
      value = dflt
    }
  }

  // Convert to an integer
  try {
    let intValue = parseInt(value)
    if (isNaN(intValue)) {
      throw new Error(`Non-integer value for config variable '${name}' (${value})`)
    }
    return intValue
  } catch (e) {
    throw new Error(`Non-integer value for config variable '${name}' (${value})`)
  }
}

function usage() {
  // Uses same syntax as cp -R
  console.log(``);
  console.log(`usage: node ${process.argv[1]} install <source_file> <target_file>`);
  console.log(`       node ${process.argv[1]} install <source_file|source_directory> ... <target_directory>`);
  console.log(`       node ${process.argv[1]} inplace <config_file|config_directory> ...`);
  console.log();
  console.log(`Note: Usage is similar to 'cp -R'. If a source directory name ends with / then it's contents are copied.`);
  console.log();
  process.exit(1)
}

function convertFile(to, from) {
  console.log(`convertFile: ${from} ==> ${to}`);
}

function fatal(msg) {
  console.log(`Fatal error: ${msg}`);
  process.exit(1)
}

// /*
//  *  Get final part of path name.
//  */
// function basename(path) {
//   let pos = path.lastIndexOf('/')
//   // console.log(`basename(${path}) = ${pos}`);
//   if (pos <= 0) {
//     // console.log(` => ${path}`);
//     return path
//   }
//   // console.log(` => ${path.substring(pos + 1)}`);
//   return path.substring(pos + 1)
// }

async function copySingleFile(sourceFile, targetFile) {
  console.log(`-----------------------------------`);
  console.log(`# cp ${sourceFile}, ${targetFile}`);

  console.log(`  isText: ${isText(sourceFile)}`);
  console.log(`  isBinary: ${isBinary(sourceFile)}`);
  console.log(`  getEncoding: ${getEncoding(sourceFile)}`);

  let variables = await flattenConfig()
  // console.log(`variables=`, variables);
  // if (isText(sourceFile) || getEncoding(sourceFile) === 'utf8') {
  if (isBinary(sourceFile)) {
    console.log(`Not converting binary file: ${targetFile}`);
    let fileBuffer = fs.readFileSync(sourceFile);
    fs.writeFileSync(targetFile, fileBuffer)
  } else {
    // Text file (expect ASCII or UTF-8)
    // Read the file
    let data = fs.readFileSync(sourceFile, 'utf8')
    console.log(`INPUT:\n`, data);
    // Replace all known variables
    for (name in variables) {
      let value = variables[name]
      let pattern = `$JUICE{${name}}`
      // console.log(`  checking for ${pattern}`);
      for ( ; ; ) {
        let pos = data.indexOf(pattern)
        if (pos < 0) {
          break
        }
        // console.log(`   Replacing ${pattern} with ${value}`);
        let before = data.substring(0, pos)
        let after = data.substring(pos + pattern.length)
        data = `${before}${value}${after}`
      }
    }
    // See if we have unmatched variables
    let pattern2 = `$JUICE`
    let errors = 0
    let msg = `\nFile ${sourceFile} contains unknown variables:\n`
    for ( ; ; ) {
      // console.log(`----------\nchecking for leftover variables:\n${data}`);
      let pos = data.indexOf(pattern2)
      if (pos < 0) {
        // console.log(`none found`);
        break
      }
      data = data.substring(pos + pattern2.length)
      let match = data
      // console.log(`found. remainder is ${match}`);
      if (match.length > 40) {
        match = match.substring(0, 40)
      }
      pos = match.indexOf('\n')
      if (pos >= 0) {
        match = match.substring(0, pos)
      }
      pos = match.indexOf('}')
      if (pos >= 0) {
        match = match.substring(0, pos + 1)
      }
      msg += `  ${pattern2}${match}\n`
      errors++
    }
    if (errors > 0) {
      console.log(msg);
    } else {
      // Save to the target file.
      // console.log(`OUTPUT:\n`, data);
      console.log(`OUTPUT:\n`, data);
      fs.writeFileSync(targetFile, data)
    }
    return errors
  }//- text file

  // Read the source file into memory
  // let fileBuffer = fs.readFileSync(sourceFile);
  // let charsetMatch = detectCharacterEncoding(fileBuffer);
  //
  // console.log(charsetMatch);
}

async function copyFileOrDirectory(source, destinationDirectory) {
  let suffix = path.basename(source)
  // console.log(`Source suffix is ${suffix}`);
  let newPath = `${destinationDirectory}/${suffix}`

  // If the source is a directory, create it then copy it's contents.
  if (fs.lstatSync(source).isDirectory()) {
    console.log(`# mkdir ${newPath}`);
    let errCnt = await copyDirectoryContents(source, newPath)
    return errCnt
  } else {
    // console.log(`# cp ${source} ${newPath}`);
    let errCnt = await copySingleFile(source, newPath)
    return errCnt
  }
}

async function copyDirectoryContents(sourceDirectory, destinationDirectory) {
  if (sourceDirectory.endsWith('/')) {
    sourceDirectory = sourceDirectory.substring(0, sourceDirectory.length - 1)
  }
  console.log(`copyDirectoryContents(${sourceDirectory}, ${destinationDirectory})`);
  let files = fs.readdirSync(sourceDirectory)
  // console.log(`   files=`, files);
  let errors = 0
  for (let i = 0; i < files.length; i++) {
    let file = files[i]
    errors += await copyFileOrDirectory(`${sourceDirectory}/${file}`, destinationDirectory)
  }
  return errors
}

async function doInstall(files, destination) {
  // console.log(`doInstall(${files} => ${destination})`);

  // Resolve any symlinks
  if (fs.existsSync(destination)) {
    destination = fs.realpathSync(destination)
    // console.log(`Real destination is ${destination}`);
  }


  // Mode 1 (cp source_file target_file)
  //  Copy single file if...
  //  - only one source file, and
  //  - source_file is a file, and
  //  - target_file is a file (1), or does not exist (2)
  //
  // One special exception:
  //  Clone directory to new location if...
  //  - one source file, and
  //  - source_file is a directory, and
  //  - destination does not exist (3)
  //
  if (files.length === 1) {
    // console.log(`maybe mode 1`);
    let source = files[0]
    if (fs.existsSync(source)) {
      const sourceEntry = fs.lstatSync(source)
      // console.log(`Source ${source} is file: ${sourceEntry.isFile()}`);
      // console.log(`Source ${source} is directory: ${sourceEntry.isDirectory()}`);
      // console.log(`Destination exists: ${fs.existsSync(destination)}`)
      if (sourceEntry.isFile()) {
        if (fs.existsSync(destination)) {
          const destinationEntry = fs.lstatSync(destination)
          // console.log(`is link: ${destinationEntry.isSymbolicLink()}`);
          if (destinationEntry.isFile()) {
            // console.log(`dest ${destination} is file`);
            // (1)
            // install source_file target_file
            console.log(`copy file to file`);
            let errors = await copySingleFile(source, destination)
            return errors
            // } else if (destinationEntry.isFile()) {
            //   fatal(`Not a file (${destination})`)
          } else if (destinationEntry.isDirectory()) {
            console.log(`dest ${destination} is directory`);
            // install source_file target_directory
            console.log(`copy file to directory`);
            let basename = path.basename(source)
            destination = `${destination}/${basename}`
            console.log(`New destination is ${destination}`);
            let errors = await copySingleFile(source, destination)
            return errors
          } else {
            fatal(`${destination} is not file or directory`);
          }
        } else { // destination does not exist
          // (2)
          console.log(`destination does not exist`);
          let errors = await copySingleFile(files[0], destination)
          return errors
        }

      } else if (sourceEntry.isDirectory()) {
        console.log(`maybe special case?`);
        console.log(`yog 6`);
        if (!fs.existsSync(destination)) {
          console.log(`yog 7`);
          // (3)
          console.log(`Creating directory ${destination}`);
          fs.mkdirSync(destination, { recursive: true })
          // Carry on to mode 2
          // return copyDirectoryContents(source, destination)
        }
        console.log(`yog 8`);
      }

    }
  }
  console.log(`yog 9`);

  /*
   *  Mode 2 (cp source_file ... target_directory) otherwise
   */
  console.log(`Must be mode 2 (copy to target directory)`);

  // Check the destination directory exists
  if (!fs.existsSync(destination)) {
    fatal(`Destination does not exist: ${destination}`)
  }
  if (!fs.lstatSync(destination).isDirectory()) {
    fatal(`Destination is not a directory: ${destination}`)
  }

  // Check everything exists before starting
  let errors = 0
  for (let i = 0; i < files.length; i++) {
    let source = files[i]

    if (!fs.existsSync(source)) {
      fatal(`Unknown source ${source}`)
    }

    // If the file name ends with '/', we want to copy the
    // contents of the directory. Check it is a directory.
    if (source.endsWith('/') && !fs.lstatSync(source).isDirectory()) {
      fatal(`Not a directory: ${source}`)
    }
  }

  // Check everything exists before starting
  for (let i = 0; i < files.length; i++) {
    let source = files[i]

    // If the file name ends with '/', we want to copy
    // the contents of the directory.
    if (source.endsWith('/')) {
      errors += await copyDirectoryContents(source, destination)
    } else {
      errors += await copyFileOrDirectory(source, destination)
    }
  }
  return errors
}

async function main(argv) {
  // console.log(`main()`, argv);

  if (argv.length < 5) { usage() }
  const params = [...process.argv]
  // console.log(`1: params=`, params);
  params.shift()
  params.shift()
  const command = params.shift()
  // console.log(`2: params=`, params);
  // console.log(`2: params=`, params);
  // console.log(`command is ${command}`);
  let errors
  switch (command) {
    case 'install':
      const destination = params.pop()
      errors = await doInstall(params, destination)
      break

    case 'inplace':
      errors = await doInstall(params, null)
      break

    default:
      usage()
  }
  if (errors) {
    fatal(`Unreliable config file conversion.`)
  }
}

// console.log(`1: ${basename('abc')}`);
// console.log(`2: ${basename('abc/def')}`);
// console.log(`3: ${basename('abc/def/ghi')}`);

main(process.argv)
.then(() => {
  process.exit(0)
})
.catch(e => {
  fatal(e)
})
