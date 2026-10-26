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
assert.match(app, /onCreate=\{handleCreateClient\}/);
assert.match(app, /onRemove=\{handleRemoveClient\}/);

const api = read('src/services/api.js');
assert.match(api, /ENDPOINTS\.syncAll/);
assert.match(api, /x-api-key/);
assert.match(api, /fetchLogEvents/);
assert.match(api, /createManagedClient/);
assert.match(api, /removeManagedClient/);

const clientsTab = read('src/components/clients/ClientsTab.jsx');
assert.match(clientsTab, /AddClientPanel/);
assert.match(clientsTab, /onCreate/);
assert.match(clientsTab, /onRemove/);

const addClient = read('src/components/clients/AddClientPanel.jsx');
assert.match(addClient, /clientName/);
assert.match(addClient, /consultantNum/);
assert.match(addClient, /ghlApiToken/);
assert.match(addClient, /ghlLocationId/);

const row = read('src/components/clients/ClientRow.jsx');
assert.match(row, /Disable sync/);
assert.match(row, /Remove/);

console.log('frontend_contract_tests=PASS');
