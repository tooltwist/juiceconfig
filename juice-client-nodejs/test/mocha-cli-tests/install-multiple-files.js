// Mocha tests
const TestContext = require('./TestContext')
const assert = require('assert');
const fs = require('fs');

describe('Install multiple files', function() {
  let outputDirectoryOk

  let installSuceeded
  let source1
  let destination1
  let source2
  let destination2
  let source3
  let destination3
  let source4
  let destination4

  before(async function () {
    outputDirectoryOk = await TestContext.prepareOutputDirectory('multiple.ok')
    fs.mkdirSync(outputDirectoryOk, { recursive: true })
  });

  describe('# install binary, text, utf8 and zip file', async function() {
    before(async function () {
      source1 = 'template/junk.binary'
      destination1 = `${outputDirectoryOk}/junk.binary`

      source2 = 'template/junk.txt'
      destination2 = `${outputDirectoryOk}/junk.txt`

      source3 = 'template/junk.utf8'
      destination3 = `${outputDirectoryOk}/junk.utf8`

      source4 = 'template/junk.txt.zip'
      destination4 = `${outputDirectoryOk}/junk.txt.zip`

      let source = `${source1} ${source2} ${source3} ${source4}`
      installSuceeded = await TestContext.install(source, outputDirectoryOk)
    });

    it(`install should have suceeded`, function() {
      assert.equal(installSuceeded, true, 'Failed to install')
    });
    it(`binary file should contain port: 56911`, function() {
      let expected = [
        0x70, // p
        0x6f, // o
        0x72, // r
        0x74, // t
        0x3a, // :
        0x20, // space
        0x35, // 5
        0x36, // 6
        0x39, // 9
        0x31, // 1
        0x31, // 1
      ]
      TestContext.assertBinaryFileContainsBytes(destination1, expected)
    });
    it(`binary file should contain [0x01, 0x02, 0x03]`, function() {
      let expected = [
        0x01,
        0x02,
        0x03,
      ]
      TestContext.assertBinaryFileContainsBytes(destination1, expected)
    });

    // it(`should have installed txt file`, function() {
    //   assert.equal(installSuceeded2, true, 'Failed to install')
    // });
    it(`text file should contain "name": "juice"`, function() {
      TestContext.assertFileContainsString(destination2, /"name": "juice"/)
    });
    it(`text file should contain "port": "56911"`, function() {
      TestContext.assertFileContainsString(destination2, /"port": "56911"/)
    });

    // it(`should have installed utf8 file`, function() {
    //   assert.equal(installSuceeded3, true, 'Failed to install')
    // });
    it(`utf8 file should contain "name": "juice"`, function() {
      TestContext.assertFileContainsString(destination3, /"name": "juice"/)
    });
    it(`utf8 file should contain "port": "56911"`, function() {
      TestContext.assertFileContainsString(destination3, /"port": "56911"/)
    });

    // it(`should have installed zip file`, function() {
    //   assert.equal(installSuceeded4, true, 'Failed to install')
    // });
    it(`zip file should remain the same size`, function() {
      TestContext.assertSameSizeFiles(source4, destination4)
    });
  })
});
