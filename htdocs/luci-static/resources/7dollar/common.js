'use strict';
'require baseclass';
'require rpc';
'require fs';
'require ui';

/*
 * Shared helpers for the 7Dollar theme: menu grouping, settings storage,
 * formatting and the device list used by the home and devices pages.
 */

const ZH = /^zh/i.test(document.documentElement.getAttribute('lang') || '');
const T = (zh, en) => ZH ? zh : en;
const MEDIA = (L.env.media || '/luci-static/7dollar');
const SPRITE = '/luci-static/7dollar/icons.svg';

const callUciGet = rpc.declare({ object: 'uci', method: 'get', params: [ 'config', 'section' ], expect: { values: {} } });
const callUciGetType = rpc.declare({ object: 'uci', method: 'get', params: [ 'config', 'type' ], expect: { values: {} } });
const callUciSet = rpc.declare({ object: 'uci', method: 'set', params: [ 'config', 'section', 'values' ] });
const callUciAdd = rpc.declare({ object: 'uci', method: 'add', params: [ 'config', 'type', 'name', 'values' ] });
const callUciDelete = rpc.declare({ object: 'uci', method: 'delete', params: [ 'config', 'section', 'options' ] });
const callUciCommit = rpc.declare({ object: 'uci', method: 'commit', params: [ 'config' ] });
const callLeases = rpc.declare({ object: 'luci-rpc', method: 'getDHCPLeases', expect: { '': {} } });
const callHints = rpc.declare({ object: 'luci-rpc', method: 'getHostHints', expect: { '': {} } });
const callWireless = rpc.declare({ object: 'luci-rpc', method: 'getWirelessDevices', expect: { '': {} } });
const callAssoc = rpc.declare({ object: 'iwinfo', method: 'assoclist', params: [ 'device' ], expect: { results: [] } });
const callIfDump = rpc.declare({ object: 'network.interface', method: 'dump', expect: { interface: [] } });
const callBoard = rpc.declare({ object: 'system', method: 'board' });
const callInfo = rpc.declare({ object: 'system', method: 'info' });

const DEFAULTS = { palette: 'clay', mode: 'auto', hidden_cards: '', plugin_openclash: '0' };

const PALETTES = [
	[ 'clay',     T('陶土', 'Clay'),     T('温暖 · 默认', 'Warm · default') ],
	[ 'celadon',  T('青瓷', 'Celadon'),  T('安静 · 清爽', 'Calm · fresh') ],
	[ 'mist',     T('雾蓝', 'Mist'),     T('冷静 · 专注', 'Cool · focused') ],
	[ 'dusk',     T('暮紫', 'Dusk'),     T('柔和 · 雅致', 'Soft · refined') ],
	[ 'graphite', T('石墨', 'Graphite'), T('中性 · 极简', 'Neutral · minimal') ]
];

/* Menu regrouping: native LuCI pages -> seven plain-language sections. */
const GROUPS = [
	{ id: 'home', icon: 'home', label: T('总览', 'Overview'), pages: [ 'admin/home' ] },
	{ id: 'devices', icon: 'devices', label: T('设备', 'Devices'), pages: [ 'admin/clients' ] },
	{ id: 'wifi', icon: 'wifi', label: 'Wi‑Fi', pages: [ 'admin/network/wireless', 'admin/status/channel_analysis' ] },
	{ id: 'internet', icon: 'globe', label: T('上网', 'Internet'),
	  pages: [ 'admin/network/network', 'admin/network/dhcp', 'admin/network/diagnostics', 'admin/network/routes', 'admin/status/routes', 'admin/network/switch' ],
	  prefix: [ 'admin/network' ] },
	{ id: 'security', icon: 'shield', label: T('安全', 'Security'), mob: false,
	  pages: [ 'admin/network/firewall', 'admin/status/nftables', 'admin/status/iptables', 'admin/system/admin' ] },
	{ id: 'apps', icon: 'grid', label: T('应用', 'Apps'), mob: false, pages: [ 'admin/apps' ],
	  prefix: [ 'admin/services', 'admin/vpn', 'admin/nas', 'admin/docker', 'admin/statistics' ] },
	{ id: 'system', icon: 'gear', label: T('系统', 'System'), short: T('更多', 'More'),
	  pages: [ 'admin/system/system', 'admin/system/appearance', 'admin/status/overview', 'admin/status/realtime', 'admin/status/logs',
	           'admin/system/package-manager', 'admin/system/flash', 'admin/system/crontab', 'admin/system/startup', 'admin/status/processes',
	           'admin/system/mounts', 'admin/system/leds', 'admin/system/reboot' ],
	  prefix: [ 'admin/system', 'admin/status' ] }
];

const LABELS = {
	'admin/home': T('总览', 'Overview'),
	'admin/clients': T('设备', 'Devices'),
	'admin/apps': T('全部应用', 'All apps'),
	'admin/network/wireless': T('无线网络', 'Wireless'),
	'admin/status/channel_analysis': T('信道分析', 'Channel analysis'),
	'admin/network/network': T('网络接口', 'Interfaces'),
	'admin/network/dhcp': T('DHCP 与 DNS', 'DHCP & DNS'),
	'admin/network/diagnostics': T('网络诊断', 'Diagnostics'),
	'admin/network/routes': T('静态路由', 'Static routes'),
	'admin/status/routes': T('路由表', 'Routing table'),
	'admin/network/switch': T('交换机', 'Switch'),
	'admin/network/firewall': T('防火墙', 'Firewall'),
	'admin/status/nftables': T('防火墙规则', 'Firewall status'),
	'admin/status/iptables': T('防火墙规则', 'Firewall status'),
	'admin/system/admin': T('管理员', 'Administration'),
	'admin/system/system': T('通用', 'General'),
	'admin/system/appearance': T('外观与首页', 'Appearance'),
	'admin/status/overview': T('运行状态', 'Status'),
	'admin/status/realtime': T('实时监控', 'Realtime'),
	'admin/status/logs': T('日志', 'Logs'),
	'admin/status/processes': T('进程', 'Processes'),
	'admin/system/package-manager': T('软件包', 'Software'),
	'admin/system/flash': T('备份与升级', 'Backup & upgrade'),
	'admin/system/startup': T('启动项', 'Startup'),
	'admin/system/crontab': T('计划任务', 'Scheduled tasks'),
	'admin/system/mounts': T('挂载点', 'Mount points'),
	'admin/system/leds': T('指示灯', 'LEDs'),
	'admin/system/reboot': T('重启', 'Reboot'),
	'admin/services/openclash': 'OpenClash',
	'admin/services/ksmbd': T('文件共享', 'File sharing')
};

const APP_ICONS = [
	[ /clash|passwall|homeproxy|ssr|v2ray|xray|sing|mihomo|proxy|nikki|daed/i, 'route' ],
	[ /smb|samba|ksmbd|nfs|ftp|disk|share|alist|aria|transmission|qbit|minidlna/i, 'folder' ],
	[ /vpn|wireguard|openvpn|zerotier|tailscale|frp|ipsec/i, 'vpn' ],
	[ /ddns|dns|adguard|mosdns|smartdns/i, 'globe' ],
	[ /docker|dockerman/i, 'box' ],
	[ /stat|nlbw|bandwidth|netdata/i, 'pulse' ],
	[ /upnp|qos|sqm|eqos/i, 'sliders' ],
	[ /wol|wake/i, 'power' ],
	[ /cron|sched|time/i, 'clock' ]
];

function esc(s) {
	return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
}

function icon(id, cls) {
	return `<svg class="i${cls ? ' ' + cls : ''}" aria-hidden="true"><use href="${SPRITE}#${id}"></use></svg>`;
}

function html(s) {
	const t = document.createElement('template');
	t.innerHTML = s.trim();
	return t.content.childNodes.length == 1 ? t.content.firstChild : t.content;
}

function title(path, node) {
	if (LABELS[path])
		return LABELS[path];
	return node && node.title ? _(node.title) : path.split('/').pop();
}

function flatten(tree) {
	/* Returns [{ path, node, title, group }] for every navigable page. */
	const admin = tree && tree.children && tree.children.admin;
	const out = [];

	if (!admin)
		return out;

	ui.menu.getChildren(admin).forEach(top => {
		if (top.name == 'logout')
			return;

		const tpath = 'admin/' + top.name;
		const kids = ui.menu.getChildren(top);

		if (!kids.length)
			out.push({ path: tpath, node: top });
		else
			kids.forEach(k => out.push({ path: tpath + '/' + k.name, node: k }));
	});

	out.forEach(p => {
		p.title = title(p.path, p.node);
		p.group = groupOf(p.path);
	});

	return out;
}

function groupOf(path) {
	for (const g of GROUPS)
		if (g.pages.indexOf(path) > -1)
			return g.id;

	for (const g of GROUPS)
		for (const pre of (g.prefix || []))
			if (path == pre || path.indexOf(pre + '/') == 0)
				return g.id;

	return 'apps';
}

function grouped(pages) {
	return GROUPS.map(g => {
		const list = pages.filter(p => p.group == g.id);
		list.sort((a, b) => {
			const ia = g.pages.indexOf(a.path), ib = g.pages.indexOf(b.path);
			return (ia < 0 ? 999 : ia) - (ib < 0 ? 999 : ib);
		});
		return Object.assign({}, g, { list: list });
	}).filter(g => g.list.length);
}

function appIcon(path) {
	for (const [ re, id ] of APP_ICONS)
		if (re.test(path))
			return id;
	return 'grid';
}

/* ---------------- settings (stored in /etc/config/7dollar) ---------------- */

function loadSettings() {
	return L.resolveDefault(callUciGet('7dollar', 'main'), {}).then(v => Object.assign({}, DEFAULTS, v || {}));
}

function saveSettings(values) {
	const set = {}, del = [];

	for (const k in values) {
		if (values[k] === '' || values[k] == null)
			del.push(k);
		else
			set[k] = String(values[k]);
	}

	return L.resolveDefault(callUciGet('7dollar', 'main'), null).then(exists => {
		const steps = [];

		if (exists == null || !Object.keys(exists).length)
			steps.push(() => callUciAdd('7dollar', 'theme', 'main', set));
		else if (Object.keys(set).length)
			steps.push(() => callUciSet('7dollar', 'main', set));

		if (del.length)
			steps.push(() => L.resolveDefault(callUciDelete('7dollar', 'main', del), null));

		steps.push(() => callUciCommit('7dollar'));

		return steps.reduce((p, fn) => p.then(fn), Promise.resolve());
	});
}

function applyLook(s) {
	const r = document.documentElement;
	const dark = s.mode == 'auto' ? matchMedia('(prefers-color-scheme: dark)').matches : s.mode == 'dark';

	r.setAttribute('data-palette', s.palette);
	r.setAttribute('data-mode', s.mode);
	r.setAttribute('data-theme', dark ? 'dark' : 'light');
	r.setAttribute('data-darkmode', dark ? 'true' : 'false');
	document.dispatchEvent(new CustomEvent('td-look', { detail: s }));
}

let toastTimer;
function toast(msg) {
	let t = document.querySelector('.td-toast');
	if (!t) {
		t = E('div', { 'class': 'td-toast', 'role': 'status' });
		document.body.appendChild(t);
	}
	t.textContent = msg;
	t.style.display = '';
	clearTimeout(toastTimer);
	toastTimer = setTimeout(() => { t.style.display = 'none' }, 1800);
}

/* ---------------- formatting ---------------- */

function rate(bytesPerSec) {
	const bits = Math.max(0, bytesPerSec * 8);
	if (bits >= 1e9) return [ (bits / 1e9).toFixed(2), 'Gbps' ];
	if (bits >= 1e6) return [ (bits / 1e6).toFixed(bits >= 1e8 ? 0 : 1), 'Mbps' ];
	if (bits >= 1e3) return [ (bits / 1e3).toFixed(0), 'Kbps' ];
	return [ bits.toFixed(0), 'bps' ];
}

function bytes(n) {
	n = +n || 0;
	if (n >= 1099511627776) return (n / 1099511627776).toFixed(1) + ' TB';
	if (n >= 1073741824) return (n / 1073741824).toFixed(1) + ' GB';
	if (n >= 1048576) return (n / 1048576).toFixed(0) + ' MB';
	if (n >= 1024) return (n / 1024).toFixed(0) + ' KB';
	return n + ' B';
}

function duration(sec) {
	sec = Math.max(0, Math.floor(sec || 0));
	const d = Math.floor(sec / 86400), h = Math.floor(sec % 86400 / 3600), m = Math.floor(sec % 3600 / 60);
	if (ZH) {
		if (d) return `${d} 天 ${h} 小时`;
		if (h) return `${h} 小时 ${m} 分钟`;
		return `${Math.max(m, 1)} 分钟`;
	}
	if (d) return `${d}d ${h}h`;
	if (h) return `${h}h ${m}m`;
	return `${Math.max(m, 1)}m`;
}

function signal(dbm) {
	if (dbm == null || dbm == 0) return [ T('未知', 'Unknown'), 0 ];
	if (dbm >= -55) return [ T('信号很好', 'Excellent'), 4 ];
	if (dbm >= -65) return [ T('信号良好', 'Good'), 3 ];
	if (dbm >= -75) return [ T('信号一般', 'Fair'), 2 ];
	return [ T('信号较弱', 'Weak'), 1 ];
}

function quality(dbm) {
	if (!dbm) return 0;
	return Math.max(4, Math.min(100, Math.round((dbm + 92) / 50 * 100)));
}

function bandName(b) {
	return ({ '2g': '2.4 GHz', '5g': '5 GHz', '6g': '6 GHz', '60g': '60 GHz' })[b] || b || 'Wi‑Fi';
}

function kind(name) {
	name = name || '';
	if (/watch/i.test(name)) return 'watch';
	if (/ipad|pad|tab|kindle/i.test(name)) return 'tablet';
	if (/iphone|pixel|android|phone|oppo|vivo|xiaomi|redmi|huawei|honor|galaxy|oneplus|realme|meizu|nokia|mi-/i.test(name)) return 'phone';
	if (/tv|roku|chromecast|firestick|shield|box/i.test(name)) return 'tv';
	if (/macbook|laptop|notebook|thinkpad|surface/i.test(name)) return 'laptop';
	if (/mac|imac|mini|pc|desktop|win|ubuntu|linux|nas|server/i.test(name)) return 'desktop';
	return 'devices';
}

function pretty(name) {
	if (!name) return '';
	return name.replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim();
}

/* ---------------- data ---------------- */

function readFile(path) {
	return L.resolveDefault(fs.read(path), null);
}

function wifiInfo() {
	return L.resolveDefault(callWireless(), {}).then(radios => {
		const aps = [];

		Object.keys(radios || {}).sort().forEach(rname => {
			const r = radios[rname] || {};
			(r.interfaces || []).forEach(i => {
				if ((i.config || {}).mode == 'ap' && i.ifname)
					aps.push({ radio: rname, band: (r.config || {}).band, ifname: i.ifname, ssid: (i.iwinfo || {}).ssid || (i.config || {}).ssid,
					           network: (i.config || {}).network || [], up: !!r.up && !(i.config || {}).disabled });
			});
		});

		return Promise.all(aps.map(ap => ap.up ? L.resolveDefault(callAssoc(ap.ifname), []) : Promise.resolve([])))
			.then(lists => {
				aps.forEach((ap, i) => ap.stations = lists[i] || []);
				return { radios: radios || {}, aps: aps };
			});
	});
}

function clients(wifi) {
	return Promise.all([
		L.resolveDefault(callLeases(), {}),
		L.resolveDefault(callHints(), {}),
		wifi ? Promise.resolve(wifi) : wifiInfo(),
		readFile('/proc/net/arp')
	]).then(([ leases, hints, wi, arp ]) => {
		const byMac = {};
		const get = mac => {
			mac = String(mac).toUpperCase();
			return byMac[mac] || (byMac[mac] = { mac: mac, online: false });
		};

		(leases.dhcp_leases || []).forEach(l => {
			if (!l.macaddr) return;
			const c = get(l.macaddr);
			c.name = c.name || l.hostname;
			c.ip = l.ipaddr;
			c.expires = l.expires;
			c.lease = true;
		});

		for (const mac in (hints || {})) {
			const h = hints[mac], c = byMac[mac.toUpperCase()];
			if (c) {
				c.name = c.name || h.name;
				c.ip = c.ip || (h.ipaddrs || h.ipv4 || [])[0];
			}
		}

		const wifiMacs = {};

		(wi.aps || []).forEach(ap => ap.stations.forEach(s => {
			const c = get(s.mac);
			const h = (hints || {})[c.mac] || {};
			c.online = true;
			c.conn = 'wifi';
			c.band = ap.band;
			c.ssid = ap.ssid;
			c.signal = s.signal;
			c.link = Math.max((s.tx || {}).rate || 0, (s.rx || {}).rate || 0) / 1000;
			c.since = s.connected_time;
			c.name = c.name || h.name;
			c.ip = c.ip || (h.ipaddrs || [])[0];
			wifiMacs[c.mac] = true;
		}));

		String(arp || '').split('\n').slice(1).forEach(line => {
			const f = line.trim().split(/\s+/);
			if (f.length < 6 || f[2] != '0x2' || !/^br-|^lan|^eth/.test(f[5]))
				return;
			const mac = f[3].toUpperCase();
			const c = byMac[mac];
			if (!c || wifiMacs[mac] || !/^br-lan|^lan/.test(f[5]))
				return;
			c.online = true;
			c.conn = 'wired';
			c.ip = c.ip || f[0];
		});

		const list = Object.values(byMac).map(c => {
			c.display = pretty(c.name) || c.ip || c.mac;
			c.kind = kind(c.name);
			return c;
		});

		list.sort((a, b) => (b.online - a.online) || ((b.link || 0) - (a.link || 0)) || a.display.localeCompare(b.display));

		return list;
	});
}

function wan() {
	return L.resolveDefault(callIfDump(), []).then(ifs => {
		let best = null;

		(ifs || []).forEach(i => {
			if (!i.up) return;
			const def = (i.route || []).find(r => r.target == '0.0.0.0' && r.mask == 0);
			if (def && (!best || (def.metric || 0) < best.metric))
				best = { iface: i, metric: def.metric || 0, gw: def.nexthop };
		});

		if (!best) {
			const w = (ifs || []).find(i => i.interface == 'wan');
			return w ? { up: false, name: 'wan', proto: w.proto, device: w.l3_device || w.device } : null;
		}

		const i = best.iface;

		return {
			up: true,
			name: i.interface,
			proto: i.proto,
			device: i.l3_device || i.device,
			ip: ((i['ipv4-address'] || [])[0] || {}).address,
			ip6: ((i['ipv6-address'] || [])[0] || {}).address,
			gw: best.gw,
			dns: i['dns-server'] || [],
			uptime: i.uptime
		};
	});
}

const DNS_NAMES = {
	'223.5.5.5': T('阿里', 'AliDNS'), '223.6.6.6': T('阿里', 'AliDNS'),
	'119.29.29.29': T('腾讯', 'DNSPod'), '119.28.28.28': T('腾讯', 'DNSPod'), '182.254.116.116': T('腾讯', 'DNSPod'),
	'114.114.114.114': '114DNS', '114.114.115.115': '114DNS',
	'180.76.76.76': T('百度', 'Baidu'), '1.1.1.1': 'Cloudflare', '1.0.0.1': 'Cloudflare',
	'8.8.8.8': 'Google', '8.8.4.4': 'Google', '9.9.9.9': 'Quad9'
};

function dnsName(list, gw) {
	const names = [];
	(list || []).forEach(ip => {
		const n = DNS_NAMES[ip] || (ip == gw ? T('上级路由', 'Upstream') : ip);
		if (names.indexOf(n) < 0) names.push(n);
	});
	return names.slice(0, 2).join(' · ') || '—';
}

function netdev(text) {
	const out = {};
	String(text || '').split('\n').slice(2).forEach(line => {
		const m = line.match(/^\s*([^:]+):\s*(.*)$/);
		if (!m) return;
		const f = m[2].trim().split(/\s+/).map(Number);
		out[m[1]] = { rx: f[0], tx: f[8] };
	});
	return out;
}

function cpuStat(text) {
	const f = String(text || '').split('\n')[0].trim().split(/\s+/).slice(1).map(Number);
	if (f.length < 4) return null;
	const idle = f[3] + (f[4] || 0);
	return { idle: idle, total: f.reduce((a, b) => a + b, 0) };
}

return baseclass.extend({
	ZH: ZH, T: T, media: MEDIA, sprite: SPRITE,
	active: /\/7dollar$/.test(L.env.media || ''),
	PALETTES: PALETTES, GROUPS: GROUPS, DEFAULTS: DEFAULTS,
	esc: esc, icon: icon, html: html,
	flatten: flatten, grouped: grouped, groupOf: groupOf, title: title, appIcon: appIcon,
	loadSettings: loadSettings, saveSettings: saveSettings, applyLook: applyLook, toast: toast,
	rate: rate, bytes: bytes, duration: duration, signal: signal, quality: quality, bandName: bandName, kind: kind, pretty: pretty,
	readFile: readFile, wifiInfo: wifiInfo, clients: clients, wan: wan, dnsName: dnsName, netdev: netdev, cpuStat: cpuStat,
	board: () => L.resolveDefault(callBoard(), {}),
	sysinfo: () => L.resolveDefault(callInfo(), {}),
	uciType: (config, type) => L.resolveDefault(callUciGetType(config, type), {}),
	uciSection: (config, section) => L.resolveDefault(callUciGet(config, section), {}),
	uciSet: (config, section, values) => callUciSet(config, section, values).then(() => callUciCommit(config))
});
