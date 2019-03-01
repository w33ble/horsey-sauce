let activeServer;

const mockHttp = {
  createServer(app) {
    let port;
    let state = 'active';

    const server = {
      listen(p, cb) {
        port = p;
        setImmediate(cb);
      },
      address() {
        return { port };
      },
      close(cb) {
        state = 'inactive';
        setImmediate(cb);
      },
      _inspect() {
        return { app, port, state };
      },
    };

    activeServer = server;
    return server;
  },
};

const getActiveServer = () => activeServer;

exports.mockHttp = mockHttp;
exports.getActiveServer = getActiveServer;
