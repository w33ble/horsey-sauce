function createBrowser() {
  let url;
  let state = 'active';
  let elementText = '';
  let lastElementById;

  return {
    get(u, cb) {
      url = u;
      setImmediate(cb);
    },
    quit(cb) {
      state = 'inactive';
      setImmediate(cb);
    },
    elementById(id, cb) {
      lastElementById = id;

      const el = {
        text(cb2) {
          cb2(null, elementText);
        },
      };

      return cb(null, el);
    },
    _setElementText(text) {
      elementText = text;
    },
    _inspect() {
      return { url, state, elementText, lastElementById };
    },
  };
}

module.exports = createBrowser;
