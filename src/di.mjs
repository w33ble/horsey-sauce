import Carafe from 'carafe';

const allowReplace = process.env.NODE_ENV === 'test';
const container = new Carafe(allowReplace);

export default container;
