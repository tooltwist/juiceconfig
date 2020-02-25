// Mocha tests
const TestContext = require('./TestContext')
const assert = require('assert');
const fs = require('fs');

describe('Install multiple files, but with missing values', function() {
  let outputDirectory
  let installSuceeded
  let source1
  let destination1
  let source2
  let destination2
  let source3
  let destination3

  before(async function () {
    outputDirectory = await TestContext.prepareOutputDirectory('broken')
    fs.mkdirSync(outputDirectory, { recursive: true })
  });

  describe('# install binary, text and broken file', async function() {
    before(async function () {
      source1 = 'template/junk.binary'
      destination1 = `${outputDirectory}/junk.binary`

      source2 = 'template/junk.txt'
      destination2 = `${outputDirectory}/junk.txt`

      source3 = 'template/junk.broken'
      destination3 = `${outputDirectory}/junk.broken`

      let source = `${source1} ${source2} ${source3}`
      installSuceeded = await TestContext.install(source, outputDirectory, true)
    });

    it(`install should return error`, function() {
      assert.equal(installSuceeded, false, 'Should have returned an error')
    });

    it(`Should have installed binary file`, function() {
      TestContext.assertFileExists(destination1)
    });

    it(`Should have installed text file`, function() {
      TestContext.assertFileExists(destination2)
    });

    it(`Should not have installed template with invalid values`, function() {
      TestContext.assertFileDoesNotExist(destination3)
    });

  })
});
