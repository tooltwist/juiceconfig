// Mocha tests
const TestContext = require('./TestContext')
const assert = require('assert');
const fs = require('fs');
const juice = require('../../lib/juice-client')

describe('Test client', function() {

  // before(async function () {
  // });

  describe('# boolean - true values', async function() {
    // before(async function () {
    // });

    it(`boolean value: "true"`, async function() {
      const value = await juice.boolean('tests.boolean.true1', juice.MANDATORY)
      // console.log(`-> ${typeof(value)}, ${value}  `);
      assert.equal(value, true)
      assert.equal(typeof(value), 'boolean')
    });
    it(`boolean value: "t"`, async function() {
      const value = await juice.boolean('tests.boolean.true2', juice.MANDATORY)
      assert.equal(value, true)
      assert.equal(typeof(value), 'boolean')
    });
    it(`boolean value: "yes"`, async function() {
      const value = await juice.boolean('tests.boolean.true3', juice.MANDATORY)
      assert.equal(value, true)
      assert.equal(typeof(value), 'boolean')
    });
    it(`boolean value: "y"`, async function() {
      const value = await juice.boolean('tests.boolean.true4', juice.MANDATORY)
      assert.equal(value, true)
      assert.equal(typeof(value), 'boolean')
    });
    it(`boolean value: true`, async function() {
      const value = await juice.boolean('tests.boolean.true5', juice.MANDATORY)
      assert.equal(value, true)
      assert.equal(typeof(value), 'boolean')
    });
    it(`boolean value: 1`, async function() {
      const value = await juice.boolean('tests.boolean.true6', juice.MANDATORY)
      assert.equal(value, true)
      assert.equal(typeof(value), 'boolean')
    });
  });

  describe('# boolean - false values', async function() {
    it(`boolean value: "false"`, async function() {
      const value = await juice.boolean('tests.boolean.false1', juice.MANDATORY)
      // console.log(`-> ${typeof(value)}, ${value}  `);
      assert.equal(value, false)
      assert.equal(typeof(value), 'boolean')
    });
    it(`boolean value: "f"`, async function() {
      const value = await juice.boolean('tests.boolean.false2', juice.MANDATORY)
      assert.equal(value, false)
      assert.equal(typeof(value), 'boolean')
    });
    it(`boolean value: "no"`, async function() {
      const value = await juice.boolean('tests.boolean.false3', juice.MANDATORY)
      assert.equal(value, false)
      assert.equal(typeof(value), 'boolean')
    });
    it(`boolean value: "n"`, async function() {
      const value = await juice.boolean('tests.boolean.false4', juice.MANDATORY)
      assert.equal(value, false)
      assert.equal(typeof(value), 'boolean')
    });
    it(`boolean value: "FALSE"`, async function() {
      const value = await juice.boolean('tests.boolean.false5', juice.MANDATORY)
      // console.log(`-> ${typeof(value)}, ${value}  `);
      assert.equal(value, false)
      assert.equal(typeof(value), 'boolean')
    });
    it(`boolean value: "F"`, async function() {
      const value = await juice.boolean('tests.boolean.false6', juice.MANDATORY)
      assert.equal(value, false)
      assert.equal(typeof(value), 'boolean')
    });
    it(`boolean value: "NO"`, async function() {
      const value = await juice.boolean('tests.boolean.false7', juice.MANDATORY)
      assert.equal(value, false)
      assert.equal(typeof(value), 'boolean')
    });
    it(`boolean value: "N"`, async function() {
      const value = await juice.boolean('tests.boolean.false8', juice.MANDATORY)
      assert.equal(value, false)
      assert.equal(typeof(value), 'boolean')
    });
    it(`boolean value: false`, async function() {
      const value = await juice.boolean('tests.boolean.false9', juice.MANDATORY)
      assert.equal(value, false)
      assert.equal(typeof(value), 'boolean')
    });
    it(`boolean value: 1`, async function() {
      const value = await juice.boolean('tests.boolean.false10', juice.MANDATORY)
      assert.equal(value, false)
      assert.equal(typeof(value), 'boolean')
    });
  })


  describe('# boolean - default values', async function() {
    it(`default boolean value: true`, async function() {
      const value = await juice.boolean('tests.boolean.missing', true)
      // console.log(`-> ${typeof(value)}, ${value}  `);
      assert.equal(value, true)
      assert.equal(typeof(value), 'boolean')
    });
    it(`default boolean value: false`, async function() {
      const value = await juice.boolean('tests.boolean.missing', false)
      // console.log(`-> ${typeof(value)}, ${value}  `);
      assert.equal(value, false)
      assert.equal(typeof(value), 'boolean')
    });
  })

  describe('# boolean - invalid values', async function() {

    it(`invalid boolean value: 123`, async function() {
      await assert.rejects(
        async () => {
          await juice.boolean('tests.boolean.dud1', juice.MANDATORY)
        },
        {
          name: /Error/,
          message: /Non-boolean value/
        }
      );
    });
    it(`invalid boolean value: "unknown"`, async function() {
      // const value = await juice.boolean('tests.boolean.dud2', juice.MANDATORY)
      await assert.rejects(
        async () => {
          await juice.boolean('tests.boolean.dud2', juice.MANDATORY)
        },
        {
          name: /Error/,
          message: /Non-boolean value/
        }
      );
    });
    it(`invalid boolean value: object`, async function() {
      // const value = await juice.boolean('tests.boolean.dud3', juice.MANDATORY)
      await assert.rejects(
        async () => {
          await juice.boolean('tests.boolean.dud3', juice.MANDATORY)
        },
        {
          name: /Error/,
          message: /Non-boolean value/
        }
      );
    });
  })
});
