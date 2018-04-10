/* eslint-env node, mocha */
/* eslint no-underscore-dangle: 0 */
import assert from 'assert';
import openConnection from '../src/open_connection.mjs';
import di from '../src/di.mjs';
import mockHttp, { getActiveServer } from './lib/mock_http.mjs';
import createBrowser from './lib/mock_browser.mjs';

const mockServeScript = () => Symbol('serve script');

describe('open connection', () => {
  let mockBrowser;

  beforeEach(() => {
    di.replace('serveScript', mockServeScript);
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
    it('closes the server and browser instances', () => {
      return openConnection(mockBrowser, '').then(closeConnection => {
        // server and browser should be active
        assert.equal(getActiveServer()._inspect().state, 'active');
        assert.equal(mockBrowser._inspect().state, 'active');

        return closeConnection().then(() => {
          assert.equal(getActiveServer()._inspect().state, 'inactive');
          assert.equal(mockBrowser._inspect().state, 'inactive');
        });
      });
    });
  });
});
