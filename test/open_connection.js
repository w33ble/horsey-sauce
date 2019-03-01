/* eslint-env node, mocha */
/* eslint no-underscore-dangle: 0 */
const assert = require('assert');
const openConnection = require('../src/open_connection');
const di = require('../src/di');
const { mockHttp, getActiveServer } = require('./lib/mock_http');
const createBrowser = require('./lib/mock_browser');

const mockWadsworth = () => Symbol('mock wadsworth');

describe('open connection', () => {
  let mockBrowser;

  beforeEach(() => {
    di.replace('wadsworth', mockWadsworth);
    di.replace('http', mockHttp);
    mockBrowser = createBrowser();
  });

  afterEach(() => {
    di.restore();
  });

  it('loads the default port', () => {
    const defaultPort = 8000;

    return openConnection(mockBrowser, '').then(() => {
      const { url } = mockBrowser._inspect();
      const serverPort = url.match(/:([0-9]+)/)[1];
      assert.equal(serverPort, defaultPort);
    });
  });

  it('loads configured port', () => {
    const customPort = 8080;

    return openConnection(mockBrowser, '', { port: customPort }).then(() => {
      const { url } = mockBrowser._inspect();
      const serverPort = url.match(/:([0-9]+)/)[1];
      assert.equal(serverPort, getActiveServer()._inspect().port);
      assert.equal(serverPort, customPort);
    });
  });

  describe('close connection', () => {
    it('closes the server and browser instances', () =>
      openConnection(mockBrowser, '').then(closeConnection => {
        // server and browser should be active
        assert.equal(getActiveServer()._inspect().state, 'active');
        assert.equal(mockBrowser._inspect().state, 'active');

        return closeConnection().then(() => {
          assert.equal(getActiveServer()._inspect().state, 'inactive');
          assert.equal(mockBrowser._inspect().state, 'inactive');
        });
      }));
  });
});
