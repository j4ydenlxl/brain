// tools/deploy.mjs: publish a static directory to the Vercel project "dilation" (aliased to
// dilation.dev). The CLI credential was created once by device login on 2026-09-16.
// Prints every command before running it and never hides an exit code.
// Run: node tools/deploy.mjs [dir=web/dist] [--preview]
import { spawnSync } from 'node:child_process';
import { existsSync, statSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const TEAM = 'team_rpkst3dLcE7Nc9xFoEqNi9pp';
const PROJECT = 'dilation';
const DOMAIN = 'dilation.dev';
const argv = process.argv.slice(2);
const preview = argv.includes('--preview');
const DIR = path.resolve(ROOT, argv.find(a => !a.startsWith('--')) || path.join('web', 'dist'));

function run(args, { allowFail = false } = {}) {
  console.log('> npx vercel@latest ' + args.join(' '));
  const r = spawnSync(process.platform === 'win32' ? 'npx.cmd' : 'npx', ['-y', 'vercel@latest', ...args], { cwd: DIR, encoding: 'utf8', shell: process.platform === 'win32' });
  const out = (r.stdout || '') + (r.stderr || '');
  process.stdout.write(out.split('\n').filter(l => !l.startsWith('npm ')).join('\n'));
  if (r.status !== 0 && !allowFail) { console.log('exit ' + r.status); process.exit(r.status || 1); }
  return out;
}

if (!existsSync(DIR)) { console.log('no such directory: ' + DIR); process.exit(2); }
let bytes = 0, files = 0;
for (const f of readdirSync(DIR, { recursive: true })) { const p = path.join(DIR, f); if (statSync(p).isFile()) { bytes += statSync(p).size; files++; } }
console.log(`${path.relative(ROOT, DIR)}: ${files} files, ${bytes} bytes`);

const who = run(['whoami'], { allowFail: true });
if (/loggedIn":\s*false|login_required/.test(who)) { console.log('Vercel CLI is not logged in. Run once: npx vercel@latest login'); process.exit(3); }
run(['link', '--yes', '--project', PROJECT, '--scope', TEAM]);
const out = run(['deploy', preview ? '' : '--prod', '--yes', '--archive=tgz'].filter(Boolean));
const url = (out.match(/https:\/\/[^\s"]+vercel\.app/) || [])[0];
console.log('\ndeployed: ' + (url || '(url not found in output)') + (preview ? '' : '\nproduction alias: https://' + DOMAIN));
