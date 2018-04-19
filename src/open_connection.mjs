import http from 'http';
import wadsworth from 'wadsworth';
import di from './di.mjs';

di.register('http', http);
di.register('wadsworth', wadsworth);

function startServer(src, port) {
  const app = di.get('wadsworth')({ src });
  const server = di.get('http').createServer(app);

  return new Promise((resolve, reject) => {
    server.listen(port, err => {
      if (err) reject(err);
      else resolve({ server, port: server.address().port });
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

export default function openConnection(browser, src, options = {}) {
  const config = Object.assign(
    {
      port: 8000,
    },
    options
  );

  return startServer(src, config.port).then(({ server, port }) =>
    initRemote(port, browser).then(
      () =>
        // return a method to clean up connections
        function closeConnection() {
          return new Promise(resolve => {
            server.close(() => browser.quit(() => resolve()));
          });
        }
    )
  );
}
