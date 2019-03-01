const sauceConnect = require('sauce-connect-launcher');

function getTunnel(user, key, tunnelId) {
  // see https://wiki.saucelabs.com/display/DOCS/Test+Configuration+Options#TestConfigurationOptions-RequiredAppiumTestConfigurationSettings
  const config = {
    username: user,
    accessKey: key,
    tunnelIdentifier: tunnelId,
  };

  return new Promise((resolve, reject) =>
    sauceConnect(config, (err, sauceConnectProcess) => {
      if (err) reject(err);
      else resolve(sauceConnectProcess);
    })
  );
}

module.exports = getTunnel;
