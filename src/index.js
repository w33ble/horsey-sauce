const events = require('events');
const crypto = require('crypto');
const di = require('./di');
const getTunnelDep = require('./get_tunnel');
const getBrowserDep = require('./get_browser');
const openConnectionDep = require('./open_connection');
const runnerHelpersDep = require('./runner_helpers');
const remoteExecDep = require('./remote_exec');

di.register('getTunnel', getTunnelDep);
di.register('getBrowser', getBrowserDep);
di.register('openConnection', openConnectionDep);
di.register('runnerHelpers', runnerHelpersDep);
di.register('remoteExec', remoteExecDep);

const randString = len =>
  crypto
    .randomBytes(Math.ceil(len / 2))
    .toString('hex')
    .slice(0, len);

function createRunner(sauceUser, sauceKey) {
  const emitter = new events.EventEmitter();
  const state = {
    isRunning: false,
    tunnel: null,
    tunnelId: `horsey-sauce-${Date.now()}-${randString(4)}-${randString(6)}`,
  };

  const onError = err => {
    state.isRunning = false;
    throw err;
  };

  const getTunnel = () =>
    Promise.resolve(state.tunnel || di.get('getTunnel')(sauceUser, sauceKey, state.tunnelId)).then(
      tunnel => {
        if (!state.tunnel) emitter.emit('tunnel-ready', state.tunnelId);
        state.tunnel = tunnel;
      },
      err => onError(err)
    );

  return {
    run(src, runner, capabilities = {}) {
      // only allow one running process at a time
      if (state.isRunning) return Promise.reject(new Error('Another test is currently running'));

      const getBrowser = di.get('getBrowser');
      const openConnection = di.get('openConnection');
      const runnerHelpers = di.get('runnerHelpers');
      const remoteExec = di.get('remoteExec');

      state.isRunning = true;

      // create the sauce connect tunnel
      return getTunnel()
        .then(() => getBrowser(sauceUser, sauceKey, capabilities, state.tunnelId))
        .then(browser => {
          emitter.emit('browser-ready');
          return openConnection(browser, src).then(closeConnection => {
            emitter.emit('runner-start');
            return remoteExec(browser, runner, runnerHelpers, closeConnection).then(data => {
              state.isRunning = false;
              emitter.emit('runner-end', data);
              return data;
            });
          });
        })
        .catch(err => onError(err)); // final failsafe for any failures
    },

    on(name, handler) {
      emitter.on(name, handler);
      return () => emitter.removeListener(name, handler);
    },

    once(name, handler) {
      emitter.once(name, handler);
      return () => emitter.removeListener(name, handler);
    },

    close() {
      if (state.isRunning) return Promise.reject(new Error('Tests are still running'));
      if (!state.tunnel) return Promise.resolve();

      return new Promise(resolve =>
        state.tunnel.close(() => {
          state.tunnel = null;
          state.isRunning = false;
          emitter.emit('close');
          resolve();
        })
      );
    },

    reset() {
      return this.close().then(() => {
        emitter.removeAllListeners();
      });
    },
  };
}

module.exports = createRunner;
