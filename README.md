# horsey-sauce

A SauceLabs Connect Runner.

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://raw.githubusercontent.com/w33ble/horsey-sauce/master/LICENSE)
[![npm](https://img.shields.io/npm/v/horsey-sauce.svg)](https://www.npmjs.com/package/horsey-sauce)
[![Project Status](https://img.shields.io/badge/status-experimental-orange.svg)](https://nodejs.org/api/documentation.html#documentation_stability_index)

Props to [sauce-tap-runner](https://github.com/conradz/sauce-tap-runner), the inspiration behind this module. It's basically a modern version of that module, but not focused on running tap tests.

## Usage

```js
import HorseySauce from 'horsey-sauce';

const runner = new HorseySauce(process.env.SAUCE_USER, process.env.SAUCE_KEY);

const src = `
  console.log('hello world');
  console.log('window:', typeof window);
  console.log('typeof Object.assign:', typeof Object.assign);
`;

const sauceCapabilities = { browserName: 'internet explorer' };

// execute the runner
runner.run(src, remoteRunner, sauceCapabilities)
.then(data => console.log(data))
.catch(err => console.error(err));

// the code to run on the remote host
function remoteRunner(browser, callback) {
  // execute code on the remote browser
  // browser is the webdriver instance
  // when you done, use callback(err, data)
  // any console.log in the src will end up on the #output element in the DOM

  browser.elementById('output', function(err, el) {
    if (err) cb(err);
    else {
      el.text(function(err2, text) {
        if (err2) cb(err2);
        else cb(null, 'output text: ' + text);
      });
    }
  });
}
```

#### License

MIT © [w33ble](https://github.com/w33ble)