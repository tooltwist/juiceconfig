#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
// const detectCharacterEncoding = require('detect-character-encoding');
const { isText, isBinary, getEncoding } = require('istextorbinary');

const juice = require('../lib/juice-client');


console.log(`We are running. Yay!`)



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
  // console.log(`-----------------------------------`);
  // console.log(`# cp ${sourceFile}, ${targetFile}`);

  // console.log(`  isText: ${isText(sourceFile)}`);
  // console.log(`  isBinary: ${isBinary(sourceFile)}`);
  // console.log(`  getEncoding: ${getEncoding(sourceFile)}`);

  let variables = await juice.flattenConfig()

  // Check that the directory exists.
  const dir = path.dirname(targetFile)
  // console.log(`Checking directory ${dir}`);
  fs.mkdirSync(dir, { recursive: true })


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
    // console.log(`INPUT:\n`, data);
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
      // console.log(`OUTPUT:\n`, data);
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
            // console.log(`copy file to file`);
            let errors = await copySingleFile(source, destination)
            return errors
            // } else if (destinationEntry.isFile()) {
            //   fatal(`Not a file (${destination})`)
          } else if (destinationEntry.isDirectory()) {
            // console.log(`dest ${destination} is directory`);
            // install source_file target_directory
            // console.log(`copy file to directory`);
            let basename = path.basename(source)
            destination = `${destination}/${basename}`
            // console.log(`New destination is ${destination}`);
            let errors = await copySingleFile(source, destination)
            return errors
          } else {
            fatal(`${destination} is not file or directory`);
          }
        } else { // destination does not exist
          // (2)
          // console.log(`destination does not exist`);
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

    } else {
      // Source fie does not exist
      fatal(`Source does not exist: ${source}`)

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
