// tools/schedule-ladder.mjs: the daily 04:00 ladder, as a Windows scheduled task.
//
// WITH NO FLAG IT REGISTERS NOTHING. It prints the exact schtasks command that would run
// node bench/ladder.mjs every day at 04:00 from this tree, with the transcript under
// bench/verdicts/ladder/<date>.log, and stops there. Registering a task is a change to the
// machine, not a computation, so it is his call and not this file's: he runs --register.
//
//   node tools/schedule-ladder.mjs              print the command, register nothing
//   node tools/schedule-ladder.mjs --register   run that exact command
//   node tools/schedule-ladder.mjs --remove     delete the task
//   node tools/schedule-ladder.mjs --status     query THIS ONE task, never the whole list
//
// The log is written by the ladder itself, from --log, rather than by a shell redirect: the
// file name carries the date, and cmd has no portable way to format one.
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const TREE = path.resolve(HERE, '..');
export const TASK_NAME = 'BrainLadder';
export const AT = '04:00';
export const LOG_DIR = path.join('bench', 'verdicts', 'ladder');

/**
 * The command, as its argv. One place, so what is printed and what --register runs cannot
 * drift apart: --register spawns exactly this.
 * @returns {string[]}
 */
export function createArgv() {
  return [
    '/create', '/tn', TASK_NAME,
    '/tr', 'cmd /c cd /d ' + TREE + ' && node ' + path.join('bench', 'ladder.mjs') + ' --log',
    '/sc', 'daily', '/st', AT, '/f',
  ];
}

export const removeArgv = () => ['/delete', '/tn', TASK_NAME, '/f'];
export const statusArgv = () => ['/query', '/tn', TASK_NAME, '/fo', 'LIST'];

/** One argv as a line a person can paste, with the values that hold a space quoted. */
export function asLine(argv) {
  return 'schtasks ' + argv.map((a) => (/[ &]/.test(a) ? '"' + a + '"' : a)).join(' ');
}

function runSchtasks(argv) {
  const r = spawnSync('schtasks', argv, { encoding: 'utf8', windowsHide: true });
  if (r.error) return { status: -1, out: '', err: String(r.error.message) };
  return { status: r.status, out: String(r.stdout || '').trim(), err: String(r.stderr || '').trim() };
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const flags = new Set(process.argv.slice(2).filter((a) => a.startsWith('--')));
  const logPath = path.join(LOG_DIR, '<date>.log');

  if (flags.has('--register')) {
    const r = runSchtasks(createArgv());
    console.log(asLine(createArgv()));
    console.log(r.out || r.err);
    console.log('schtasks exited ' + r.status);
    if (r.status !== 0) process.exitCode = 1;
  } else if (flags.has('--remove')) {
    const r = runSchtasks(removeArgv());
    console.log(asLine(removeArgv()));
    console.log(r.out || r.err);
    console.log('schtasks exited ' + r.status);
    if (r.status !== 0) process.exitCode = 1;
  } else if (flags.has('--status')) {
    // One task name, never a dump of every task on the machine.
    const r = runSchtasks(statusArgv());
    console.log(asLine(statusArgv()));
    console.log(r.status === 0 ? r.out : 'not registered (schtasks exited ' + r.status + (r.err ? ': ' + r.err : '') + ')');
  } else {
    console.log('THE DAILY LADDER, 04:00, registered by nobody but him.');
    console.log('');
    console.log('This would run it:');
    console.log('  ' + asLine(createArgv()));
    console.log('');
    console.log('  task    ' + TASK_NAME);
    console.log('  tree    ' + TREE);
    console.log('  runs    node ' + path.join('bench', 'ladder.mjs') + ' --log  (node on the PATH of the account the task runs as)');
    console.log('  log     ' + logPath + ' (appended by the ladder, one file per day)');
    console.log('  daily   at ' + AT);
    console.log('');
    console.log('NOTHING WAS REGISTERED. node tools/schedule-ladder.mjs --register runs the line above,');
    console.log('--status queries that one task name, and --remove deletes it.');
  }
}
