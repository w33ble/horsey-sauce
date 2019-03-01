/* eslint-env node, mocha */
const dotenv = require('dotenv');
const assert = require('assert');
const createRunner = require('../');

dotenv.config();

describe('runner method', function slowTests() {
  this.timeout(0);

  let runner;

  before(() => {
    const { SAUCE_USER, SAUCE_KEY } = process.env;
    runner = createRunner(SAUCE_USER, SAUCE_KEY);
  });

  after(() =>
    // this.timeout(0);
    runner.close().then(() => {
      runner = null;
    })
  );

  describe('exec runner', () => {
    // helpers
    const exec = (browser, cb) => {
      browser.elementById('output', (err, el) => {
        if (err) cb(err);
        else {
          el.text((err2, text) => {
            if (err2) cb(err2);
            else cb(null, text);
          });
        }
      });
    };

    const execWithHelpers = (browser, { getConsoleOutput }, cb) => {
      getConsoleOutput(cb);
    };

    it('works without helpers', () => {
      // this.timeout(0);

      const text = 'hello world';
      const src = `console.log('${text}')`;
      const caps = { browserName: 'chrome' };

      return runner.run(src, exec, caps).then(output => {
        assert.equal(output, text);
      });
    });

    it('works with helpers', () => {
      // this.timeout(0);

      const text = 'hello world';
      const src = `console.log('${text}')`;
      const caps = { browserName: 'chrome' };

      return runner.run(src, execWithHelpers, caps).then(output => {
        assert.equal(output, text);
      });
    });
  });

  describe('error handling', () => {
    const getErrors = (browser, { getUncaughtErrors }, cb) => {
      getUncaughtErrors(cb);
    };

    it('resolves on runtime errors', () => {
      // this.timeout(0);

      // run es6 code in IE11
      const caps = { browserName: 'internet explorer' };
      const src = 'Object.assign({}, { one: 1 });';
      const expected = new RegExp(`Object doesn't support property or method 'assign'`);

      return runner.run(src, getErrors, caps).then(errors => {
        assert.ok(expected.test(errors));
      });
    });

    it('resolves on parse error', () => {
      // feed in invalid javascript code
      const caps = { browserName: 'chrome' };
      const src = 'i am not javascript';
      const expected = new RegExp(`Uncaught SyntaxError`);

      return runner.run(src, getErrors, caps).then(errors => {
        assert.ok(expected.test(errors));
      });
    });
  });
});
