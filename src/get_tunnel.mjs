import sauceConnect from 'sauce-connect-launcher';

export default function getTunnel(user, key, tunnelId) {
  // see https://wiki.saucelabs.com/display/DOCS/Test+Configuration+Options#TestConfigurationOptions-RequiredAppiumTestConfigurationSettings
  const config = {
    username: user,
    accessKey: key,
    tunnelIdentifier: tunnelId,
  };

  return new Promise((resolve, reject) =>
    sauceConnect(config, (err, sauceConnectProcess) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(sauceConnectProcess);
    })
  );
}
