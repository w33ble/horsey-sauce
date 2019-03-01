const wd = require('wd');

const SAUCE_URL = 'ondemand.saucelabs.com';
const SAUCE_PORT = 80;

function getBrowser(sauceUser, sauceKey, capabilities, tunnelId) {
  // build the wd options based on capabilities and tunnelId
  const options = Object.assign({}, capabilities, { 'tunnel-identifier': tunnelId });

  const browser = wd.remote(SAUCE_URL, SAUCE_PORT, sauceUser, sauceKey);

  return new Promise((resolve, reject) => {
    browser.init(options, err => {
      if (err) {
        reject(err);
        return;
      }

      resolve(browser);
    });
  });
}

module.exports = getBrowser;
