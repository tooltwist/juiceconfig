
// const path = require('path');
const fs = require('fs');
// const path = require('path');
// // const detectCharacterEncoding = require('detect-character-encoding');
// const { isText, isBinary, getEncoding } = require('istextorbinary');
const AWS = require('aws-sdk')
//     region = "ap-southeast-1",
//     secretName = "PHILTEST",
//     secret,
//     decodedBinarySecret;


exports.flattenConfig = flattenConfig
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
  // console.log(`findValue(${name}) => ${value} (${typeof(value)})`);
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
