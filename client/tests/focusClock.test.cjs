const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const vm = require('node:vm');
const compiled = ts.transpileModule(fs.readFileSync('lib/focusClock.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
const context = { exports: {}, Date, Math, JSON, atob };
vm.runInNewContext(compiled, context);
const { remainingSeconds, focusStorageKey } = context.exports;
test('clock follows wall time across backgrounding and never goes negative', () => {
  assert.equal(remainingSeconds(61000, 1000), 60);
  assert.equal(remainingSeconds(61000, 31500), 30);
  assert.equal(remainingSeconds(61000, 70000), 0);
});
test('restored timers are scoped by account, never by a shared global key', () => {
  const token = sub => `header.${Buffer.from(JSON.stringify({ sub })).toString('base64url')}.signature`;
  assert.notEqual(focusStorageKey(token('one')), focusStorageKey(token('two')));
  assert.equal(focusStorageKey(null), null);
  assert.equal(focusStorageKey('malformed'), null);
});
