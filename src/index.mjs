import { add } from './di.mjs';
import getTunnel from './get_tunnel.mjs';
import getBrowser from './get_browser.mjs';
import openConnection from './open_connection.mjs';
import createRunner from './create_runner.mjs';

// add dependencies to di service
add('getTunnel', getTunnel);
add('getBrowser', getBrowser);
add('openConnection', openConnection);

export default createRunner;
