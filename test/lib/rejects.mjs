import assert from 'assert';

export default (fn, expected) => {
  if (expected != null && typeof expected !== 'function' && !(expected instanceof RegExp)) {
    return Promise.reject(new Error('Assertion should be a RegExp or function instance'));
  }

  return fn()
    .then(() => {
      assert.fail('Function did not reject');
    })
    .catch(e => {
      if (expected == null) {
        assert.ok(true, 'Function rejected');
      } else if (expected instanceof RegExp) {
        assert.ok(expected.test(e.message), `Unexpected Error ->  ${e}`);
      } else if (typeof expected === 'function') {
        assert.ok(
          e instanceof expected,
          e.constructor ? `Error is type of ${e.constructor}` : 'Error is correct instance'
        );
      }
    });
};
