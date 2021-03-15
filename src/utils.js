import fs from 'fs';
import util from 'util';

export const readFileAsync = util.promisify(fs.readFile);
