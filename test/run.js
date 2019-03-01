/* eslint-env node, mocha */
const assert = require('assert');
const createRunner = require('../');
const di = require('../src/di');
const rejects = require('./lib/rejects');
const createCallTracker = require('./lib/call_tracker');

const noop = () => {};

describe('tunnel', () => {
  afterEach(() => {
    di.restore();
  });

  it('throws on tunnel failure', () => {
    const runner = createRunner();

    di.replace('getTunnel', () => Promise.reject(new Error('tunnel failed')));

    return rejects(() => runner.run(), new RegExp('tunnel failed'));
  });

  it('passes sauce info', () => {
    const user = 'username';
    const key = '98o8wh4l8y4r';
    const runner = createRunner(user, key);

    di.replace('getTunnel', (tunnelUser, tunnelKey) => {
      assert.equal(tunnelUser, user);
      assert.equal(tunnelKey, key);
      return Promise.reject(new Error('tunnel failed'));
    });

    return rejects(() => runner.run(), new RegExp('tunnel failed'));
  });

  it('passes runner tunnel id', () => {
    const runner = createRunner();

    di.replace('getTunnel', (tunnelUser, tunnelKey, tunnelId) => {
      assert.ok(typeof tunnelId === 'string');
      return Promise.reject(new Error('tunnel failed'));
    });

    return rejects(() => runner.run(), new RegExp('tunnel failed'));
  });
});

describe('browser', () => {
  let tunnelId;

  beforeEach(() => {
    di.replace('getTunnel', (user, key, id) => {
      tunnelId = id;
      return Promise.resolve('mockTunnel');
    });
  });

  afterEach(() => {
    di.restore();
  });

  it('throws on browser failure', () => {
    const runner = createRunner();

    di.replace('getBrowser', () => Promise.reject(new Error('browser failed')));

    return rejects(() => runner.run(), new RegExp('browser failed'));
  });

  it('passes sauce details and browser capabilities', () => {
    const user = 'username';
    const key = '98o8wh4l8y4r';
    const capabilities = { browserName: 'chrome' };

    const runner = createRunner(user, key);

    di.replace('getBrowser', (browserUser, browserKey, browserCapabilities) => {
      assert.equal(browserUser, user);
      assert.equal(browserKey, key);
      assert.equal(browserCapabilities, capabilities);
      return Promise.reject(new Error('browser failed'));
    });

    return rejects(() => runner.run('', noop, capabilities), new RegExp('browser failed'));
  });

  it('passes tunnel id', () => {
    const runner = createRunner();

    di.replace('getBrowser', (browserUser, browserKey, browserCapabilities, id) => {
      assert.equal(id, tunnelId);
      return Promise.reject(new Error('browser failed'));
    });

    return rejects(() => runner.run(), new RegExp('browser failed'));
  });
});

describe('open connection', () => {
  let mockBrowser;

  beforeEach(() => {
    mockBrowser = Symbol('mock browser');
    di.replace('getTunnel', () => Promise.resolve('mockTunnel'));
    di.replace('getBrowser', () => Promise.resolve(mockBrowser));
  });

  afterEach(() => {
    di.restore();
  });

  it('throws on connection failure', () => {
    di.replace('openConnection', () => Promise.reject(new Error('connection failed')));

    const runner = createRunner();

    return rejects(() => runner.run(), new RegExp('connection failed'));
  });

  it('is passed the source code and browser instance', () => {
    const src = { src: 'src code' };

    di.replace('openConnection', (connectionBrowser, connectionSrc) => {
      assert.equal(connectionSrc, src);
      assert.equal(connectionBrowser, mockBrowser);
      return Promise.reject(new Error('connection failed'));
    });

    const runner = createRunner();

    return rejects(() => runner.run(src), new RegExp('connection failed'));
  });
});

describe('remote exec', () => {
  let mockBrowser;

  beforeEach(() => {
    mockBrowser = Symbol('mock browser');
    di.replace('getTunnel', () => Promise.resolve('mockTunnel'));
    di.replace('getBrowser', () => Promise.resolve(mockBrowser));
    di.replace('openConnection', () => {
      const closeConnection = () => Promise.resolve('connection closed');
      return Promise.resolve(closeConnection);
    });
  });

  afterEach(() => {
    di.restore();
  });

  it('throws on runner exec error', () => {
    // throws: SyntaxError: Unexpected token o in JSON at position 1
    const remoteRunner = () => JSON.parse('nope');

    const runner = createRunner();

    return rejects(() => runner.run('', remoteRunner), new RegExp('Unexpected token'));
  });

  it('throws on runner error', () => {
    const remoteRunner = (browser, cb) => cb(new Error('runner error'));

    const runner = createRunner();

    return rejects(() => runner.run('', remoteRunner), new RegExp('runner error'));
  });

  it('resolves with runner data', () => {
    const mockData = Symbol('runner data');
    const remoteRunner = (browser, cb) => cb(null, mockData);

    const runner = createRunner();

    return runner.run('', remoteRunner).then(data => assert.equal(data, mockData));
  });

  it('gets helpers with 3 arguments', () => {
    const mockHelpers = Symbol('mock helpers');
    di.replace('runnerHelpers', () => mockHelpers);
    const remoteRunner = (browser, helpers, cb) => {
      assert.equal(helpers, mockHelpers, 'got expected helpers');
      cb(null);
    };

    const runner = createRunner();

    return runner.run('', remoteRunner);
  });
});

describe('events', () => {
  let mockBrowser;
  let mockData;
  let remoteRunner;
  let runner;

  beforeEach(() => {
    mockBrowser = Symbol('mock browser');
    mockData = Symbol('runner data');
    remoteRunner = (browser, cb) => cb(null, mockData);

    di.replace('getTunnel', () => Promise.resolve({ close: () => Promise.resolve() }));
    di.replace('getBrowser', () => Promise.resolve(mockBrowser));
    di.replace('openConnection', () => {
      const closeConnection = () => Promise.resolve('connection closed');
      return Promise.resolve(closeConnection);
    });

    runner = createRunner();
  });

  afterEach(() => {
    di.restore();
    runner.reset(); // clean up event listeners
  });

  it('emits tunnel event with tunnel id', done => {
    let tunnelId;
    const eventName = 'tunnel-ready';
    const callTracker = createCallTracker();

    di.replace('getTunnel', (user, key, id) => {
      assert.equal(callTracker.callCount, 0); // event not called yet
      tunnelId = id; // keep track of the tunnel id
      return Promise.resolve({
        close: () => Promise.resolve(),
      });
    });

    // wait for tunnel event
    runner.on(eventName, id => {
      callTracker();
      done(assert.equal(id, tunnelId));
    });

    runner.run('', remoteRunner);
  });

  it('emits browser ready event', () => {
    const eventName = 'browser-ready';
    const callTracker = createCallTracker();

    di.replace('getBrowser', () => {
      assert.equal(callTracker.callCount, 0); // event not called yet
      return Promise.resolve(mockBrowser);
    });

    runner.on(eventName, callTracker);

    return runner.run('', remoteRunner).then(() => {
      assert.equal(callTracker.callCount, 1);
    });
  });

  it('emits runner start event', () => {
    const eventName = 'runner-start';
    const callTracker = createCallTracker();

    di.replace('openConnection', () => {
      assert.equal(callTracker.callCount, 0); // event not called yet
      const closeConnection = () => Promise.resolve('connection closed');
      return Promise.resolve(closeConnection);
    });

    runner.on(eventName, callTracker);

    return runner.run('', remoteRunner).then(() => {
      assert.equal(callTracker.callCount, 1);
    });
  });

  it('emits runner end event with data', () => {
    const eventName = 'runner-end';
    const callTracker = createCallTracker();

    di.replace('remoteExec', () => {
      assert.equal(callTracker.callCount, 0);
      return Promise.resolve(mockData);
    });

    runner.on(eventName, data => {
      assert.equal(data, mockData);
      callTracker();
    });

    return runner.run().then(() => {
      assert.equal(callTracker.callCount, 1);
    });
  });
});
