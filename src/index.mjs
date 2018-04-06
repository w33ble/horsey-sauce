import events from 'events';
import crypto from 'crypto';
import getTunnel from './get_tunnel.mjs';
import getBrowser from './get_browser.mjs';
import openConnection from './open_connection.mjs';

const randString = len =>
  crypto
    .randomBytes(Math.ceil(len / 2))
    .toString('hex')
    .slice(0, len);

const getHelpers = browser => ({
  getConsoleOutput(cb) {
    browser.elementById('output', (err, el) => {
      if (err) cb(err);
      else {
        el.text((err2, text) => {
          if (err2) cb(err2);
          else cb(null, text);
        });
      }
    });
  },

  getUncaughtErrors(cb) {
    browser.elementById('errors', (err, el) => {
      if (err) cb(err);
      else {
        el.text((err2, text) => {
          if (err2) cb(err2);
          else cb(null, text);
        });
      }
    });
  },
});

export default function createRunner(sauceUser, sauceKey) {
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

  const getStateTunnel = () =>
    Promise.resolve(state.tunnel || getTunnel(sauceUser, sauceKey, state.tunnelId)).then(
      tunnel => {
        if (!state.tunnel) emitter.emit('tunnel-ready', state.tunnelId);
        state.tunnel = tunnel;
      },
      err => onError(err, this)
    );

  return {
    run(src, runner, capabilities = {}) {
      // only allow one running process at a time
      if (state.isRunning) return Promise.reject(new Error('Another test is currently running'));

      state.isRunning = true;

      // create the sauce connect tunnel
      return getStateTunnel()
        .then(() => getBrowser(sauceUser, sauceKey, capabilities, state.tunnelId))
        .then(
          browser => {
            emitter.emit('browser-ready');

            // do things in the browser
            return openConnection(src, browser).then(closeConnection => ({
              closeConnection,
              browser,
            }));
          },
          err => onError(err, this)
        )
        .then(
          ({ closeConnection, browser }) => {
            emitter.emit('runner-start');

            return new Promise((resolve, reject) => {
              const cb = (err, data) => {
                state.isRunning = false;
                closeConnection().then(() => {
                  if (err) {
                    reject(err);
                  } else {
                    emitter.emit('runner-end', data);
                    resolve(data);
                  }
                });
              };

              // pass helpers to runner if given 3 args
              if (runner.length === 3) runner(browser, getHelpers(browser), cb);
              else runner(browser, cb);
            });
          },
          err => onError(err, this)
        )
        .catch(err => {
          // final failsafe for any failures
          state.running = false;
          throw err;
        });
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
      if (!state.tunnel) return Promise.reject(new Error('No tunnel created'));

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
