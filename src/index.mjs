import events from 'events';
import getTunnel from './get_tunnel.mjs';
import getBrowser from './get_browser.mjs';
import openConnection from './open_connection.mjs';

const randNum = len => parseInt(String(Math.random()).substr(2, len), 10);

export default class HorseySauce extends events.EventEmitter {
  constructor(sauceUser, sauceKey) {
    super();

    this.sauceUser = sauceUser;
    this.sauceKey = sauceKey;
    this.isRunning = false;
    this.tunnel = null;
    this.tunnelId = `horsey-sauce-${Date.now()}-${randNum(4)}-${randNum(6)}`;
  }

  // for capabilities, see https://saucelabs.com/docs/additional-config
  run(src, runner, capabilities = {}) {
    // only allow one running process at a time
    if (this.isRunning) return Promise.reject(new Error('Another test is currently running'));

    this.isRunning = true;

    // create the sauce connect tunnel
    this.emit('tunnel-connect');
    return Promise.resolve(
      this.tunnel || getTunnel(this.sauceUser, this.sauceKey, this.tunnelId)
    ).then(
      tunnel => {
        this.tunnel = tunnel;
        this.emit('tunnel-connected');

        return getBrowser(this.sauceUser, this.sauceKey, capabilities, this.tunnelId).then(
          browser => {
            this.isRunning = false;
            this.emit('browser-ready');

            // do things in the browser
            return openConnection(src, browser).then(
              closeConnection =>
                new Promise((resolve, reject) => {
                  this.emit('runner-start');
                  runner(browser, (err, data) => {
                    closeConnection().then(() => {
                      if (err) {
                        this.emit('runner-error', err);
                        reject(err);
                      } else {
                        this.emit('runner-complete', data);
                        resolve(data);
                      }
                    });
                  });
                })
            );
          },
          err => {
            this.isRunning = false;
            this.emit('browser-error', err);
            throw err;
          }
        );
      },
      err => {
        this.emit('tunnel-error', err);
        throw err;
      }
    );
  }

  close() {
    if (this.isRunning) return Promise.reject(new Error('Tests are still running'));
    if (!this.tunnel) return Promise.reject(new Error('No tunner created'));

    return new Promise(resolve =>
      this.tunnel.close(() => {
        this.emit('close');
        resolve();
      })
    );
  }
}
