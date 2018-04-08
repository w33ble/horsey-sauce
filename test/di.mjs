/* eslint-env node, mocha */
import assert from 'assert';
import * as di from '../src/di.mjs';

describe('di service', () => {
  describe('using dependencies', () => {
    it('throws getting undefined dependencies', () => {
      assert.throws(() => di.get('nada'));
    });

    it('throws adding non-string dependencies', () => {
      assert.throws(() => di.add({}), new RegExp('Dependency name must be a string'));
      assert.throws(() => di.add([]), new RegExp('Dependency name must be a string'));
      assert.throws(() => di.add(() => {}), new RegExp('Dependency name must be a string'));
      assert.doesNotThrow(() => di.add('string'));
    });

    it('throws adding a dependency twice', () => {
      assert.doesNotThrow(() => di.add('string2'));
      assert.throws(() => di.add('string2'), new RegExp('Dependency already defined'));
    });

    it('adds and gets dependencies', () => {
      const name = 'test';
      const expected = 'test output';
      di.add(name, () => expected);
      assert.equal(di.get(name)(), expected);
    });
  });

  describe('replacing dependencies', () => {
    const name = 'replacable';
    const expected = 'replacable output';

    it('throws on undefined dependencies', () => {
      assert.throws(
        () => di.replace('yoyoy ma', () => expected),
        new RegExp('Can not replace undefined dependency')
      );
    });

    it('does not throw on unreplaced dependencies', () => {
      assert.doesNotThrow(() => di.restore('has not been replaced'));
    });

    it('replaces dependency', () => {
      const expectedReplacement = 'replacement output';
      di.add(name, () => expected);
      assert.equal(di.get(name)(), expected);

      di.replace(name, () => expectedReplacement);
      assert.equal(di.get(name)(), expectedReplacement);
    });

    it('restores dependency by name', () => {
      di.restore(name);
      assert.equal(di.get(name)(), expected);
    });

    it('restores all dependencies', () => {
      di.add('_one_', () => '_one_');
      di.add('_two_', () => '_two_');
      di.add('_three_', () => '_three_');

      // replace all dependencies
      di.replace('_one_', () => 'replaced _one_');
      di.replace('_two_', () => 'replaced _two_');
      di.replace('_three_', () => 'replaced _three_');

      // check replaced output
      assert.equal(di.get('_one_')(), 'replaced _one_');
      assert.equal(di.get('_two_')(), 'replaced _two_');
      assert.equal(di.get('_three_')(), 'replaced _three_');

      // restore all dependencies
      di.restore();

      // check original values
      assert.equal(di.get('_one_')(), '_one_');
      assert.equal(di.get('_two_')(), '_two_');
      assert.equal(di.get('_three_')(), '_three_');
    });

    it('works with multiple replace calls', () => {
      di.add('replace me', () => 'replace me');
      di.replace('replace me', () => 'replace me 1');
      di.replace('replace me', () => 'replace me 2');
      di.replace('replace me', () => 'replace me 3');

      // check for the latest replacement value
      assert.equal(di.get('replace me')(), 'replace me 3');

      di.restore();
      assert.equal(di.get('replace me')(), 'replace me');
    });
  });
});
