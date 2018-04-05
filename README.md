# horsey-sauce

A Sauce Labs Connect Runner.

![](logo.png)

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://raw.githubusercontent.com/w33ble/horsey-sauce/master/LICENSE)
[![npm](https://img.shields.io/npm/v/horsey-sauce.svg)](https://www.npmjs.com/package/horsey-sauce)
[![Project Status](https://img.shields.io/badge/status-experimental-orange.svg)](https://nodejs.org/api/documentation.html#documentation_stability_index)

Props to [sauce-tap-runner](https://github.com/conradz/sauce-tap-runner), the inspiration behind this module. It's basically a modern version of that module, but not focused on running tap tests.

## Usage

```js
import createRunner from 'horsey-sauce';

const runner = createRunner(process.env.SAUCE_USER, process.env.SAUCE_KEY);

// the code to run on the remote host
const src = `
  console.log('hello world');
  console.log('window:', typeof window);
  console.log('typeof Object.assign:', typeof Object.assign);
`;

function browserRunner(browser, callback) {
  // this code runs in the node instance
  // browser is the webdriver instance
  // when done, use callback(err, data)
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

// alternatively, you can use helper functions by using a middle arguments
function browserRunnerWithHelpers(browser, helpers, callback) {
  helpers.getConsoleOutput(cb);
}

const capabilities = { browserName: 'internet explorer' };

// execute the runner
runner.run(src, browserRunner, capabilities)
.then(data => console.log(data))
.catch(err => console.error(err));
```

## API

### `horseySauce(sauceUser, sauceKey)`

Creates a new test runner. A single test runner maintains a single Sauce Connect tunnel. Using a single runner for all your tests will improve speed as it takes time to setup the tunnel. A tunnel will only be created when you run the tests.

`sauceUser` and `sauceKey` must be your Sauce Labs username and key.

### `#run(src, exec, [capabilities])`

Runs the tests in a new browser, returns a Promise that will resolve when the runner is finished. It will create a new WebDriver connection to the browser and run the JS tests provided. It is not able to run tests in parallel; you must wait till one test is completed before running the next.

`src` is a string containing the JS code to execute. Any calls to `console.log` in the code will end up as text in the `#output` element in the browser instance.

`exec(browser, [helpers], callback)` is a function that will take which will be passed the web-driver insance, some helpers if you opt into them, and a callback to use when you're done. Use the `browser` instance to interact with the remote browser. See [the wd package](https://www.npmjs.com/package/wd) for details.

`capabilities` is an optional object containing the options for the web-driver instance. See the [selenium docs](https://github.com/SeleniumHQ/selenium/wiki/DesiredCapabilities) for valid options. You'll almost certainly want to include a `browserName` property here, otherwise you won't know browser will be used.

### `#on(name, handler)`

Attaches an event listener that will be call `handler` when the matching `name` event is emitted. Returns a function that can be used to detach the listener.

### `#once(name, handler)`

Like `on()`, but the handler will only be called once.

### `#close()`

Closes the Sauce Connect tunnel, returns a Promise that will resolve when everything is closed. All tests must be finished before closing.

### `#reset()`

Returns the instance to its initial state, closing the Sauce Connect tunnel and removes any event handlers. Returns a Promise that will resolve when everything is reset. All tests must be finished before resetting.

## Events

Event Name | Description
---------- | -----------
tunnel-ready | Called when the Sauce Connect tunnel is ready, handler will be passed the tunnel id.
browser-ready | Called when the web-driver instance is ready.
runner-start | Called before the `src` is executed in remote browser.
runner-end | Called when the `exec` function calls the callback function. Only emitted when the runner executes successfully.

#### License

MIT © [w33ble](https://github.com/w33ble)

#### Thanks

Cross-browser Testing Platform and Open Source <3 Provided by [Sauce Labs](https://saucelabs.com)

[![Testing Provided by Sauce Labs](sauce.png)](https://saucelabs.com/)