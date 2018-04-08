const dependencies = new Map();
const mockPrefix = '%MOCK&';

const validateName = name => {
  if (typeof name !== 'string') throw new Error('Dependency name should be a string');
};
const mockName = name => `${mockPrefix}${name}`;
const originalName = name => name.replace(mockPrefix, '');
const isMock = name => new RegExp(`^${mockPrefix}`).test(name);
const restoreDependency = n => {
  if (!dependencies.has(n)) return;
  const payload = dependencies.get(n);
  dependencies.set(originalName(n), payload);
  dependencies.delete(n);
};

export function add(name, payload) {
  validateName(name);
  dependencies.set(name, payload);
}

export function get(name) {
  return dependencies.get(name);
}

export function replace(name, payload) {
  if (!dependencies.get(name)) throw new Error(`Can not replace undefined dependency: ${name}`);

  // keep a copy of the original value
  const mName = mockName(name);
  if (!dependencies.has(mName)) dependencies.set(mName, dependencies.get(name));
  dependencies.set(name, payload);
}

export function restore(name) {
  validateName(name);
  if (name != null) {
    restoreDependency(mockName(name));
    return;
  }

  // restore all mocked dependencies
  dependencies.forEach((val, n) => {
    if (isMock(n)) restoreDependency(n);
  });
}
