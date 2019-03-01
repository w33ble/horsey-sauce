function createCallTracker() {
  function noop() {
    noop.callCount += 1;
  }

  noop.callCount = 0;

  return noop;
}

module.exports = createCallTracker;
