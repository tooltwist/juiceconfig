// Mocha tests
const TestContext = require('./TestContext')
const assert = require('assert');
const fs = require('fs');

describe('Update single files, in-place', function() {
  let outputDirectory
  let installSuceeded
  let source
  let destination

  // before(async function () {
  //   outputDirectory = await TestContext.prepareOutputDirectory('inplace-single')
  // });

  describe('# binary file', async function() {
    before(async function () {
      // destination = `${outputDirectory}/junk.binary`
      // installSuceeded = await TestContext.install('template/junk.binary', destination)
    });
    // it(`should have installed file`, function() {
    //   assert.fail('Not available yet')
    //   // assert.equal(installSuceeded, true, 'Failed to install')
    // });



  //   it(`should contain port: 56911`, function() {
  //     let expected = [
  //       0x70, // p
  //       0x6f, // o
  //       0x72, // r
  //       0x74, // t
  //       0x3a, // :
  //       0x20, // space
  //       0x35, // 5
  //       0x36, // 6
  //       0x39, // 9
  //       0x31, // 1
  //       0x31, // 1
  //     ]
  //     TestContext.assertBinaryFileContainsBytes(destination, expected)
  //   });
  //   it(`should contain [0x01, 0x02, 0x03]`, function() {
  //     let expected = [
  //       0x01,
  //       0x02,
  //       0x03,
  //     ]
  //     TestContext.assertBinaryFileContainsBytes(destination, expected)
  //   });
  // })
  //
  // describe('# json file', async function() {
  //   before(async function () {
  //     destination = `${outputDirectory}/junk.json`
  //     installSuceeded = await TestContext.install('template/junk.json', destination)
  //   });
  //   it(`should have installed file`, function() {
  //     assert.equal(installSuceeded, true, 'Failed to install')
  //   });
  //   it(`should contain "name": "juice"`, function() {
  //     TestContext.assertFileContainsString(destination, /"name": "juice"/)
  //   });
  //   it(`should contain "port": "56911"`, function() {
  //     TestContext.assertFileContainsString(destination, /"port": "56911"/)
  //   });
  // })
  //
  // describe('# text file', async function() {
  //   before(async function () {
  //     destination = `${outputDirectory}/junk.txt`
  //     installSuceeded = await TestContext.install('template/junk.txt', destination)
  //   });
  //   it(`should have installed file`, function() {
  //     assert.equal(installSuceeded, true, 'Failed to install')
  //   });
  //   it(`should contain "name": "juice"`, function() {
  //     TestContext.assertFileContainsString(destination, /"name": "juice"/)
  //   });
  //   it(`should contain "port": "56911"`, function() {
  //     TestContext.assertFileContainsString(destination, /"port": "56911"/)
  //   });
  // }),
  //
  // describe('# zip file', async function() {
  //   before(async function () {
  //     source = 'template/junk.txt.zip'
  //     destination = `${outputDirectory}/junk.txt.zip`
  //     installSuceeded = await TestContext.install(source, destination)
  //   });
  //   it(`should have installed file`, function() {
  //     assert.equal(installSuceeded, true, 'Failed to install')
  //   });
  //   it(`should remain the same size`, function() {
  //     TestContext.assertSameSizeFiles(source, destination)
  //   });
  // })
  //
  // describe('# utf8 file', async function() {
  //   before(async function () {
  //     destination = `${outputDirectory}/junk.utf8`
  //     installSuceeded = await TestContext.install('template/junk.utf8', destination)
  //   });
  //   it(`should have installed file`, function() {
  //     assert.equal(installSuceeded, true, 'Failed to install')
  //   });
  //   it(`should contain "name": "juice"`, function() {
  //     TestContext.assertFileContainsString(destination, /"name": "juice"/)
  //   });
  //   it(`should contain "port": "56911"`, function() {
  //     TestContext.assertFileContainsString(destination, /"port": "56911"/)
  //   });
  // })
  //
  // describe('# broken file', async function() {
  //   before(async function () {
  //     destination = `${outputDirectory}/junk.broken`
  //     installSuceeded = await TestContext.install('template/junk.broken', destination, true)
  //   });
  //   it(`Do not install template with invalid values`, function() {
  //     if (installSuceeded) {
  //       assert.fail('Should have failed to install')
  //     }
  //   });
  })
});
