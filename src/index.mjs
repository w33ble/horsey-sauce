import events from 'events';
import uuid from 'uuid/v4';
import getTunnel from './get_tunnel';
import getBrowser from './get_browser';
import runCode from './run_code';

export default class HorseySauce extends events.EventEmitter {
  constructor(sauceUser, sauceKey) {
    super();

    this.sauceUser = sauceUser;
    this.sauceKey = sauceKey;
    this.isRunning = false;
    this.tunnel = null;
    this.tunnelId = `horsey-sauce-${Date.now()}-${uuid()}`;
  }

  run(src, capabilities) {
    // only allow one running process at a time
    if (this.isRunning) return Promise.reject(new Error('Another test is currently running'));

    this.isRunning = true;

    // create the sauce connect tunnel
    this.emit('tunnel-connect');
    return Promise.resolve(this.tunnel || getTunnel()).then(
      tunnel => {
        this.tunnel = tunnel;
        this.emit('tunnel', tunnel);

        return getBrowser(this.sauceUser, this.sauceKey, capabilities, this.tunnelId)
          .then(browser => {
            this.isRunning = false;
            this.emit('browser', browser);

            // do things in the browser
            return runCode(src, browser).then(() => {
              browser.quit(() => {
                // ignore errors here
                // TODO: do any sort of post-processing...
              });
            });
          })
          .catch(() => {
            this.isRunning = false;
          });
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
