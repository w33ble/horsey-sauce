const getOutputById = (browser, elementId, cb) => {
  browser.elementById(elementId, (err, el) => {
    if (err) {
      cb(err);
      return;
    }

    el.text((err2, text) => {
      if (err2) cb(err2);
      else cb(null, text);
    });
  });
};

function getHelpers(browser) {
  return {
    getConsoleOutput(cb) {
      getOutputById(browser, 'output', cb);
    },
    getUncaughtErrors(cb) {
      getOutputById(browser, 'errors', cb);
    },
  };
}

module.exports = getHelpers;
