import { add } from './di.mjs';
import getTunnel from './get_tunnel.mjs';
import getBrowser from './get_browser.mjs';
import openConnection from './open_connection.mjs';
import runnerHelpers from './runner_helpers.mjs';
import createRunner from './create_runner.mjs';
import remoteExec from './remote_exec.mjs';

// add dependencies to di service
add('getTunnel', getTunnel);
add('getBrowser', getBrowser);
add('openConnection', openConnection);
add('runnerHelpers', runnerHelpers);
add('remoteExec', remoteExec);

export default createRunner;
