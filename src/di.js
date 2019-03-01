const Carafe = require('carafe');

const allowReplace = process.env.NODE_ENV === 'test';
module.exports = new Carafe(allowReplace);
