import fs from 'fs';
import util from 'util';

export const readFileAsync = util.promisify(fs.readFile);

export function catchErrors(fn) {
  return (req, res, next) => fn(req, res, next).catch(next);
}
