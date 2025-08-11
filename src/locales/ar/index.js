import { general } from './general.js';
import { data } from './data.js';
import { modules } from './modules.js';
import { communication } from './communication.js';

export const ar = {
  ...general,
  ...data,
  ...modules,
  ...communication
};