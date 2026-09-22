/* eslint-disable @typescript-eslint/no-require-imports -- CommonJS loader tests the TypeScript source without a test build. */
// Regression checks for translated rendering without changing submitted or user data.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const root = path.resolve(__dirname, '..');
let locale = 'zh';
const originalLoad = Module._load;
for (const extension of ['.ts', '.tsx']) {
  Module._extensions[extension] = (module, filename) => module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  }).outputText, filename);
}
Module._load = function(id, parent, ...args) {
  if (id.endsWith('PreferencesProvider')) return {
    usePreferences: () => ({ locale, theme: 'light' }),
    useTranslate: () => text => translate(text, locale),
  };
  if (id === 'next/navigation') return { useRouter: () => ({}) };
  if (id.startsWith('@/')) id = path.join(root, id.slice(2));
  return originalLoad.call(this, id, parent, ...args);
};
const { translate, validLocale } = require('../lib/i18n');
const { Localized } = require('../components/preferences/Localized');
const { CreateUnitForm } = require('../components/admin/CreateUnitForm');
const { EditUnitForm } = require('../components/admin/EditUnitForm');
const { dayLabel, slotRange } = require('../lib/viewing-times');
assert.equal(validLocale(undefined), 'en');
assert.equal(validLocale('unsupported'), 'en');
assert.equal(translate('Book a viewing', 'en'), 'Book a viewing');
assert.notEqual(translate('Book a viewing', 'zh'), 'Book a viewing');
assert.notEqual(translate('Book a viewing', 'ms'), 'Book a viewing');
assert.equal(translate('Desa Aman', 'zh'), 'Desa Aman');
assert.equal(translate('RM 750/mo', 'zh'), 'RM 750/月');
assert.match(translate('View photo 1: Warm evening lighting in U1', 'zh'), /查看照片 1/);
assert.equal(renderToStaticMarkup(React.createElement(Localized, null, React.createElement('span', null, 'Room'))), '<span>Room</span>', 'Never traverse arbitrary child/user content');
const create = renderToStaticMarkup(React.createElement(CreateUnitForm));
assert.match(create, /value="landed">有地住宅<\/option>/, 'Translate labels, preserve enum payload');
const edit = renderToStaticMarkup(React.createElement(EditUnitForm, {unit:{id:'fixture',title:'Room',property_type:'landed',city:'City',address:'Address',description:'Our homes',is_published:true}}));
assert.match(edit, /value="Room"/);
assert.match(edit, /value="City"/);
assert.match(edit, />Our homes<\/textarea>/, 'Never translate entered descriptions');
assert.notEqual(dayLabel('2026-09-24','zh-CN'),dayLabel('2026-09-24','en-MY'));
assert.match(slotRange('2026-09-24T01:00:00Z','2026-09-24T01:30:00Z','en-MY'), /9:00/);
assert.equal(dayLabel(''), '');
locale='ms';
assert.match(renderToStaticMarkup(React.createElement(CreateUnitForm)), /value="landed">Rumah bertanah<\/option>/);
console.log('Preferences regression checks passed: default English, three languages, text isolation, form values, Malaysian dates.');
