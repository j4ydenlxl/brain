// lang/index.mjs: public surface of the text front-end for the sym language.
import { parse } from './parse.mjs';
import { print } from './print.mjs';
import { evalSym } from '../core/primitives.mjs';
import { ratToString } from '../core/signal.mjs';

export { parse, print };

// run(text, env) = evalSym(parse(text), env), returning both the exact rational value
// and its decimal string (ratToString: an integer string when the denominator is 1,
// otherwise "n/d", the same exact-string convention core/signal.mjs uses throughout).
export function run(text, env = {}) {
  const value = evalSym(parse(text), env);
  return { value, decimal: ratToString(value) };
}
