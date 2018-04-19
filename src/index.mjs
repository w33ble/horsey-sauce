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
di.register('getTunnel', getTunnel);
di.register('getBrowser', getBrowser);
di.register('openConnection', openConnection);
di.register('runnerHelpers', runnerHelpers);
di.register('remoteExec', remoteExec);
di.register('http', http);
di.register('wadsworth', wadsworth);

export default createRunner;
