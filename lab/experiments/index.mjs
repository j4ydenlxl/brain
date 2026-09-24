// lab/experiments/index.mjs : the shipped experiments, by name. Every one of them states a
// hypothesis with a bar before it is run, runs a treatment and a control over the same seeded
// input stream, and writes its verdict to lab/verdicts/. Lazy imports, so listing the
// experiments does not pay for loading the cell kinds any single one of them needs.
export const EXPERIMENTS = Object.freeze({
  'learning-rule': {
    file: './learning-rule.mjs',
    metric: 'nextSymbolAccuracy',
    what: 'a new learning mechanism: the predictive rule in place of the hebbian rule, on a sequence task',
    load: () => import('./learning-rule.mjs'),
  },
  'phasor-memory': {
    file: './phasor-memory.mjs',
    metric: 'recall',
    what: 'a new memory structure: the phasor superposition store in place of the bipolar list store, at equal dimension',
    load: () => import('./phasor-memory.mjs'),
  },
  'goal-routing': {
    file: './goal-routing.mjs',
    metric: 'relevantShare',
    what: 'a new routing policy: attention goal gating in place of an ungated scheduler, on a distractor task',
    load: () => import('./goal-routing.mjs'),
  },
});

export const EXPERIMENT_NAMES = Object.freeze(Object.keys(EXPERIMENTS));

/** @param {string} name @returns {Promise<object>} the defined experiment */
export async function loadExperiment(name) {
  const entry = EXPERIMENTS[name];
  if (!entry) throw new Error('lab: no experiment named ' + name + '. known: ' + EXPERIMENT_NAMES.join(', '));
  const mod = await entry.load();
  return mod.experiment || mod.default;
}

/** Every shipped experiment, loaded. @returns {Promise<object[]>} */
export async function loadAll() {
  const out = [];
  for (const name of EXPERIMENT_NAMES) out.push(await loadExperiment(name));
  return out;
}
