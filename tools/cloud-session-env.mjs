#!/usr/bin/env node
// tools/cloud-session-env.mjs: item 0 of docs/CLOUD-SESSION.md. Measures the sandbox a cloud
// session runs in and writes bench/verdicts/cloud-session/env.json. Every later item reads this
// file before it starts: an item whose recorded peakRssMb exceeds ramMb is not attempted there.
import { cpus, totalmem, freemem, platform, release } from 'node:os';
import { mkdirSync, writeFileSync, statfsSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';

const sh = (c) => { try { return execSync(c, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], timeout: 5000 }).trim(); } catch { return 'absent'; } };
let diskFreeMb = null;
try { const s = statfsSync('.'); diskFreeMb = Math.round((s.bavail * s.bsize) / 1048576); } catch {}
const env = {
  at: new Date().toISOString(),
  command: 'node tools/cloud-session-env.mjs',
  node: process.version,
  platform: `${platform()} ${release()}`,
  cpus: cpus().length,
  cpuModel: cpus()[0] ? cpus()[0].model : 'unknown',
  ramMb: Math.round(totalmem() / 1048576),
  freeMb: Math.round(freemem() / 1048576),
  diskFreeMb,
  heapFlagMb: Math.max(512, Math.floor((totalmem() / 1048576) * 0.7)),
  ollama: sh('ollama --version'),
  gpu: sh('nvidia-smi --query-gpu=name --format=csv,noheader'),
  git: sh('git rev-parse --short HEAD'),
  stateDirPresent: existsSync('state'),
};
mkdirSync('bench/verdicts/cloud-session', { recursive: true });
writeFileSync('bench/verdicts/cloud-session/env.json', JSON.stringify(env, null, 2) + '\n');
console.log(`ENV node ${env.node} cpus ${env.cpus} ramMb ${env.ramMb} diskFreeMb ${env.diskFreeMb} heapFlagMb ${env.heapFlagMb} ollama ${env.ollama} gpu ${env.gpu}`);
