// cells/index.mjs: importing this module registers every cell kind: the original
// library (basic.mjs) plus the expanded one (perception, dynamics, reasoning, stats)
// and the phasor kinds (fhrr.mjs), which carry the phv signal kind.
import './basic.mjs';
import './perception.mjs';
import './dynamics.mjs';
import './reasoning.mjs';
import './stats.mjs';
import './control.mjs';
import './sequence.mjs';
import './graph.mjs';
import './fhrr.mjs';
export { listKinds, hasKind, getKind } from '../core/cell.mjs';
