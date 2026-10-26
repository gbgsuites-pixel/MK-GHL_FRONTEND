const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

const quickActions = read('src/components/dashboard/QuickActions.jsx');
assert.match(quickActions, /function QuickActions\(\{[^}]*onSyncAll[^}]*\}\)/s);
assert.match(quickActions, /onClick=\{onSyncAll\}/);
assert.doesNotMatch(quickActions, /onClick=\{onTabChange\}/);

const dashboard = read('src/components/dashboard/DashboardTab.jsx');
assert.match(dashboard, /setScheduleForm,?/);
assert.match(dashboard, /setScheduleForm=\{setScheduleForm\}/);
assert.match(dashboard, /onSyncAll=\{onSyncAll\}/);
assert.doesNotMatch(dashboard, /updater\) => \{/);

const app = read('src/App.jsx');
assert.match(app, /setScheduleForm=\{schedule\.setScheduleForm\}/);
assert.match(app, /onSyncAll=\{handleSyncAll\}/);

const api = read('src/services/api.js');
assert.match(api, /ENDPOINTS\.syncAll/);
assert.match(api, /x-api-key/);
assert.match(api, /fetchLogEvents/);

console.log('frontend_contract_tests=PASS');
