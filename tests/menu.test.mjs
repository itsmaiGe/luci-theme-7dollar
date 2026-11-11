import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import test from 'node:test';

const root = process.env.SEVENDOLLAR_SOURCE_ROOT
	? pathToFileURL(process.env.SEVENDOLLAR_SOURCE_ROOT.replace(/[\\/]?$/, '/'))
	: new URL('../', import.meta.url);
const source = name => readFileSync(new URL(`htdocs/luci-static/resources/${name}.js`, root), 'utf8');
const load = (name, bindings) => new Function(...Object.keys(bindings), source(name))(...Object.values(bindings));
const page = (title, path, order = 1) => ({ title, order, satisfied: true, action: { type: 'view', path } });

function tree({ home = true, satisfied = true, homeView = '7dollar/home', dashboard = 'vantage/overview' } = {}) {
	const children = {
		status: { title: 'Status', order: 10, satisfied: true, children: {
			overview: page('Overview', 'status/index')
		} },
		system: { title: 'System', order: 20, satisfied: true, children: {
			system: page('System', 'system/system')
		} }
	};
	if (home) {
		children.home = { ...page('Home', homeView, 0), satisfied };
		children.clients = page('Devices', '7dollar/devices', 2);
		children.apps = page('Apps', '7dollar/apps', 39);
	}
	if (dashboard) children.dashboard = page('Dashboard', dashboard);
	return { children: { admin: { satisfied: true, children } } };
}

/* Match LuCI's session cache and in-memory menu promise, without starting a router or RPC service. */
function harness(cached, server, media = '/luci-static/7dollar') {
	let stored = structuredClone(cached);
	const counts = { requests: 0, flushes: 0 };
	const menu = {
		menu: null,
		load() {
			if (this.menu == null) this.menu = stored;
			if (this.menu == null) {
				counts.requests++;
				this.menu = Promise.resolve().then(() => (stored = structuredClone(server)));
			}
			return Promise.resolve(this.menu);
		},
		flushCache() { counts.flushes++; stored = null; },
		getChildren(node) {
			return Object.entries(node?.children || {})
				.filter(([, child]) => child.satisfied && Object.hasOwn(child, 'title'))
				.map(([name, child]) => Object.assign(child, { name }))
				.sort((a, b) => (a.order ?? 1000) - (b.order ?? 1000));
		}
	};
	const nav = { innerHTML: '', querySelector: () => null };
	const matchMedia = () => ({ matches: false });
	const bindings = {
		baseclass: { extend: members => members },
		view: { extend: members => members },
		rpc: { declare: () => async () => ({}) },
		fs: {}, ui: { menu }, poll: {}, request: {}, tidy: {},
		L: {
			env: { media, dispatchpath: [ 'admin', 'home' ] },
			url: (...parts) => `/cgi-bin/luci/${parts.join('/')}`,
			bind: (fn, self) => fn.bind(self),
			resolveDefault: (promise, fallback) => Promise.resolve(promise).catch(() => fallback)
		},
		document: {
			documentElement: { getAttribute: () => 'en' },
			getElementById: id => id === 'td-nav' ? nav : null
		},
		window: { matchMedia }, matchMedia, _: text => text
	};
	const td = load('7dollar/common', bindings);
	return { td, menu, counts, nav, bindings };
}

function navigation(h) {
	const nav = load('menu-7dollar', { ...h.bindings, td: h.td });
	const render = nav.render;
	const ready = new Promise((resolve, reject) => {
		nav.render = tree => {
			try { render.call(nav, tree); resolve(nav); }
			catch (error) { reject(error); }
		};
	});
	nav.bindKeys = nav.bindMode = nav.bindVisibility = () => {};
	nav.__init__();
	return ready;
}

test('a menu cached under Vantage recovers the 7Dollar Overview link', async () => {
	const h = harness(tree({ home: false }), tree());
	const nav = await navigation(h);
	assert.match(h.nav.innerHTML, /href="\/cgi-bin\/luci\/admin\/home" data-g="home"/);
	assert.equal(nav.groups.find(g => g.id === 'home').list.length, 1);
	assert.deepEqual(h.counts, { requests: 1, flushes: 1 });
});

test('fresh cached menus keep the cache and separate native and other-theme dashboards', async () => {
	const h = harness(tree(), tree());
	const nav = await navigation(h);
	assert.equal(nav.href(nav.groups.find(g => g.id === 'home')), '/cgi-bin/luci/admin/home');
	assert.equal(nav.pages.find(p => p.path === 'admin/dashboard').group, 'system');
	assert.equal(nav.pages.find(p => p.path === 'admin/status/overview').group, 'system');
	assert.deepEqual(h.counts, { requests: 0, flushes: 0 });
});

test('the optional native dashboard stays available outside Overview', async () => {
	const h = harness(tree({ dashboard: 'dashboard/index' }), tree());
	const nav = await navigation(h);
	assert.equal(nav.pages.find(p => p.path === 'admin/dashboard').group, 'system');
	assert.equal(nav.entries().find(p => p.path === 'admin/dashboard').group, 'System');
});

test('navigation and theme views share one refresh even when views load first', async () => {
	const h = harness(tree({ home: false }), tree());
	const td = { ...h.td,
		loadSettings: async () => ({}), board: async () => ({}), sysinfo: async () => ({}),
		wan: async () => null, uciType: async () => ({}), uciSection: async () => ({}), readFile: async () => ''
	};
	const views = { ...h.bindings, td };
	const apps = load('view/7dollar/apps', views).load();
	const appearance = load('view/7dollar/appearance', views).load();
	const home = load('view/7dollar/home', views).load();
	const [appTree, [, appearanceTree], [, , , , [homeTree]], nav] = await Promise.all([
		apps, appearance, home, navigation(h)
	]);
	assert.ok(appTree.children.admin.children.home.satisfied);
	assert.equal(appTree, appearanceTree);
	assert.equal(appTree, homeTree);
	assert.equal(nav.current.path, 'admin/home');
	assert.deepEqual(h.counts, { requests: 1, flushes: 1 });
});

test('a disabled home entry in an older theme menu is refreshed', async () => {
	const h = harness(tree({ satisfied: false }), tree());
	const refreshed = await h.td.loadMenu();
	assert.ok(refreshed.children.admin.children.home.satisfied);
	assert.deepEqual(h.counts, { requests: 1, flushes: 1 });
});

test('a stale home route owned by another view is refreshed', async () => {
	const h = harness(tree({ homeView: 'another/home' }), tree());
	assert.equal((await h.td.loadMenu()).children.admin.children.home.action.path, '7dollar/home');
	assert.deepEqual(h.counts, { requests: 1, flushes: 1 });
});

test('restricted users do not get an invented home link or a refresh loop', async () => {
	const h = harness(tree({ home: false }), tree({ home: false }));
	const nav = await navigation(h);
	assert.ok(!nav.groups.some(g => g.id === 'home'));
	assert.doesNotMatch(h.nav.innerHTML, /data-g="home"/);
	await h.td.loadMenu();
	assert.deepEqual(h.counts, { requests: 1, flushes: 1 });
});

test('opening theme preferences under another theme does not invalidate its menu', async () => {
	const h = harness(tree({ home: false }), tree(), '/luci-static/bootstrap');
	const original = await h.menu.load();
	assert.equal(await h.td.loadMenu(), original);
	assert.deepEqual(h.counts, { requests: 0, flushes: 0 });
});
