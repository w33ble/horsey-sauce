import http from 'http';
import serve from 'serve-script';

function startServer(server, port) {
  return new Promise((resolve, reject) => {
    server.listen(port, err => {
      if (err) reject(err);
      else resolve(server.address().port);
    });
  });
}

function initRemote(port, browser) {
  return new Promise((resolve, reject) => {
    const url = `http://localhost:${port}/`;

    browser.get(url, err => {
      if (err) reject(err);
      else resolve();
    });
  });
}

export default function openConnection(src, browser, options = {}) {
  const config = Object.assign(
    {
      port: 8000,
    },
    options
  );

  const app = serve({ src });
  const server = http.createServer(app);

  return startServer(server, config.port)
    .then(port => initRemote(port, browser))
    .then(
      () =>
        function closeConnection() {
          return new Promise(resolve => {
            server.close(() => browser.quit(() => resolve()));
          });
        }
    );
}
