/* eslint-env node, mocha */
/* eslint no-underscore-dangle: 0 */
const assert = require('assert');
const runnerHelpers = require('../src/runner_helpers');
const createBrowser = require('./lib/mock_browser');

describe('runner helpers', () => {
  let mockBrowser;

  const validateOutput = (elementId, content, done) => (err, output) => {
    const { lastElementById } = mockBrowser._inspect();
    assert.ok(!err);
    assert.equal(content, output);
    assert.equal(lastElementById, elementId);
    done();
  };

  beforeEach(() => {
    mockBrowser = createBrowser();
  });

  it('provides expected helpers', () => {
    const helpers = runnerHelpers();
    const hasFunction = (obj, name) => typeof obj[name] === 'function';
    assert.ok(hasFunction(helpers, 'getConsoleOutput'));
    assert.ok(hasFunction(helpers, 'getUncaughtErrors'));
  });

  describe('console output', () => {
    it('gets content of output container', done => {
      const elementId = 'output';
      const consoleOutput = `hello world ${new Date().getTime()}`;

      const validator = validateOutput(elementId, consoleOutput, done);
      mockBrowser._setElementText(consoleOutput);

      const helpers = runnerHelpers(mockBrowser);

      helpers.getConsoleOutput(validator);
    });
  });

  describe('error output', () => {
    it('gets content of error container', done => {
      const elementId = 'errors';
      const consoleOutput = `uncaught errors ${new Date().getTime()}`;

      const validator = validateOutput(elementId, consoleOutput, done);
      mockBrowser._setElementText(consoleOutput);

      const helpers = runnerHelpers(mockBrowser);

      helpers.getUncaughtErrors(validator);
    });
  });
});
