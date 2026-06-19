/**
 * verifyEnv.js
 *
 * Standalone diagnostic — run with:
 *   node src/utils/verifyEnv.js
 *
 * Loads .env exactly the way index.js does, then prints exactly what was
 * parsed for every sheet-related variable. Does NOT start Express, Chrome,
 * or any sync — pure env inspection, runs in under a second.
 *
 * Use this whenever sheet sync seems to silently skip — it tells you
 * definitively whether the problem is .env parsing or something downstream
 * (sheet sharing permissions, wrong tab name, etc).
 */

require('dotenv').config();
const path = require('path');
const fs   = require('fs');

function trimEnv(key, defaultVal = '') {
  const val = process.env[key];
  return val !== undefined ? String(val).trim() : defaultVal;
}

function check(label, key, opts = {}) {
  const raw     = process.env[key];
  const trimmed = trimEnv(key);
  const present = raw !== undefined && trimmed !== '';

  console.log(`\n${label}  (${key})`);
  console.log(`  raw value      : ${raw === undefined ? '<undefined — key not in .env at all>' : JSON.stringify(raw)}`);
  console.log(`  trimmed value  : "${trimmed}"`);
  console.log(`  status         : ${present ? '✅ SET' : '❌ MISSING / EMPTY'}`);

  if (opts.expectPath) {
    const resolved = path.isAbsolute(trimmed) ? trimmed : path.resolve(process.cwd(), trimmed);
    const exists   = fs.existsSync(resolved);
    console.log(`  resolved path  : ${resolved}`);
    console.log(`  file exists    : ${exists ? '✅ YES' : '❌ NOT FOUND'}`);
  }

  return present;
}

console.log('═'.repeat(70));
console.log(' ENV DIAGNOSTIC — run from inside the backend/ folder');
console.log(' Working directory (process.cwd()):', process.cwd());
console.log(' .env file expected at:', path.resolve(process.cwd(), '.env'));
console.log(' .env file exists:', fs.existsSync(path.resolve(process.cwd(), '.env')) ? '✅ YES' : '❌ NOT FOUND — dotenv has nothing to load!');
console.log('═'.repeat(70));

check('Service Account Key', 'GOOGLE_SERVICE_ACCOUNT_KEY', { expectPath: true });

console.log('\n' + '─'.repeat(70));
console.log(' EXISTING (invoice / vehicle) — should already be working');
console.log('─'.repeat(70));
check('Invoice Sheet ID',  'INVOICE_SHEET_ID');
check('Invoice Sheet Tab', 'INVOICE_SHEET_TAB');
check('Vehicle Sheet ID',  'VEHICLE_SHEET_ID');
check('Vehicle Sheet Tab', 'VEHICLE_SHEET_TAB');

console.log('\n' + '─'.repeat(70));
console.log(' NEW (route / hierarchy) — the ones we are debugging');
console.log('─'.repeat(70));
const routeOk     = check('Route Sheet ID',     'ROUTE_SHEET_ID');
const routeTabOk   = check('Route Sheet Tab',     'ROUTE_SHEET_TAB');
const hierOk       = check('Hierarchy Sheet ID',  'HIERARCHY_SHEET_ID');
const hierTabOk     = check('Hierarchy Sheet Tab', 'HIERARCHY_SHEET_TAB');

console.log('\n' + '═'.repeat(70));
if (routeOk && hierOk) {
  console.log(' ✅ Both ROUTE_SHEET_ID and HIERARCHY_SHEET_ID are being read correctly.');
  console.log('    If sync still fails after `npm start`, the issue is NOT .env —');
  console.log('    it is likely one of:');
  console.log('      1. The sheet is not shared with the service account email');
  console.log('      2. The tab name does not exactly match a real tab in the sheet');
  console.log('      3. The header row does not contain recognizable column names');
} else {
  console.log(' ❌ One or both sheet IDs are still not being read.');
  console.log('    Things to check:');
  console.log('      1. Is there more than one .env file? (e.g. backend/.env vs');
  console.log('         a stray .env in the project root or frontend/)');
  console.log('      2. Did you save the file after editing? Some editors keep');
  console.log('         an unsaved buffer open.');
  console.log('      3. Are you running `npm start` from inside backend/ ?');
  console.log('         (process.cwd() above must point at the backend folder)');
  console.log('      4. Open .env in a hex/plain viewer — invisible characters');
  console.log('         (BOM, smart quotes from copy-paste) can break a line');
  console.log('         silently. Try retyping the ROUTE_SHEET_ID line by hand.');
}
console.log('═'.repeat(70) + '\n');
