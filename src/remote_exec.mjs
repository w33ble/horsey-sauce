export default function remoteExec(browser, runner, runnerHelpers, closeConnection) {
  // do things in the browser
  return new Promise((resolve, reject) => {
    const cb = (err, data) => {
      closeConnection().then(() => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    };

    try {
      // pass helpers to runner if given 3 args
      if (runner.length === 3) runner(browser, runnerHelpers(browser), cb);
      else runner(browser, cb);
    } catch (e) {
      reject(e);
    }
  });
}
