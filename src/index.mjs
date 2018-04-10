import http from 'http';
import wadsworth from 'wadsworth';
import di from './di.mjs';
import getTunnel from './get_tunnel.mjs';
import getBrowser from './get_browser.mjs';
import openConnection from './open_connection.mjs';
import runnerHelpers from './runner_helpers.mjs';
import createRunner from './create_runner.mjs';
import remoteExec from './remote_exec.mjs';

// add dependencies to di service
di.add('getTunnel', getTunnel);
di.add('getBrowser', getBrowser);
di.add('openConnection', openConnection);
di.add('runnerHelpers', runnerHelpers);
di.add('remoteExec', remoteExec);
di.add('http', http);
di.add('wadsworth', wadsworth);

export default createRunner;
