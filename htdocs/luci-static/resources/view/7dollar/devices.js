'use strict';
'require view';
'require poll';
'require 7dollar.common as td';

/* All devices: online (Wi-Fi + wired) and recently seen DHCP clients. */

const T = td.T, icon = td.icon, esc = td.esc;

return view.extend({
	load() {
		if (!td.active) {
			location.replace(L.url('admin/status/overview'));
			return new Promise(() => {});
		}
		return td.clients();
	},

	render(list) {
		const root = td.html(`<div class="td-devices">
			<div class="td-head"><div>
				<p class="td-eyebrow">${esc(T('设备', 'Devices'))}</p>
				<h1 class="td-serif">${esc(T('谁在用网络', 'Who is online'))}</h1>
				<p class="td-sub" id="td-dsum">&nbsp;</p>
			</div>
			<a class="btn" href="${L.url('admin/network/dhcp')}">${icon('lock')}${esc(T('给设备固定 IP', 'Reserve an IP'))}</a></div>
			<div class="td-stats" id="td-dstats"></div>
			<section class="td-card"><div class="td-card-h"><h3>${esc(T('在线', 'Online'))}</h3></div><div class="td-devlist" id="td-on"></div></section>
			<section class="td-card" style="margin-top:18px" id="td-off-card"><div class="td-card-h"><h3>${esc(T('最近连接过', 'Recently seen'))}</h3><span class="td-muted">${esc(T('有 IP 租约，当前离线', 'Leased, currently offline'))}</span></div><div class="td-devlist" id="td-off"></div></section>
		</div>`);

		this.root = root;
		this.paint(list);
		poll.add(() => td.clients().then(l => this.paint(l)), 5);
		return root;
	},

	row(c) {
		const meta = [];
		if (c.ip) meta.push(`<span>${esc(c.ip)}</span>`);
		meta.push(`<span>${esc(c.mac)}</span>`);

		let sub;
		if (!c.online) sub = c.expires > 0 ? T('租约剩余 ', 'Lease ') + td.duration(c.expires) : T('离线', 'Offline');
		else if (c.conn == 'wifi') {
			const [ s ] = td.signal(c.signal);
			sub = `Wi‑Fi ${td.bandName(c.band)} · ${s}${c.signal ? ` (${c.signal} dBm)` : ''}`;
			if (c.link) meta.unshift(`<span><b>${Math.round(c.link)} Mbps</b></span>`);
			if (c.since) meta.push(`<span>${esc(T('已连接 ', 'Connected ') + td.duration(c.since))}</span>`);
		}
		else sub = T('有线连接', 'Wired');

		return `<div class="td-dev"><div class="td-av">${icon(c.kind)}</div><div class="nm"><b>${esc(c.display)}</b><small>${esc(sub)}</small></div><div class="meta">${meta.join('')}</div></div>`;
	},

	paint(list) {
		const on = list.filter(c => c.online), off = list.filter(c => !c.online);
		const wifi = on.filter(c => c.conn == 'wifi').length;
		const $ = id => this.root.querySelector('#' + id);

		$('td-dsum').textContent = on.length
			? T(`现在有 ${on.length} 台设备在线。名字来自设备自己上报的主机名。`, `${on.length} device${on.length == 1 ? '' : 's'} online right now.`)
			: T('现在没有设备在线。', 'No devices online right now.');

		$('td-dstats').innerHTML = [
			[ T('在线', 'Online'), on.length ], [ 'Wi‑Fi', wifi ], [ T('有线', 'Wired'), on.length - wifi ], [ T('最近连接过', 'Recently seen'), off.length ]
		].map(([ k, v ]) => `<div class="td-stat"><small>${esc(k)}</small><b>${v}</b></div>`).join('');

		$('td-on').innerHTML = on.length ? on.map(c => this.row(c)).join('') : `<div class="td-empty-row">${esc(T('现在没有设备在线', 'No devices online'))}</div>`;
		$('td-off').innerHTML = off.map(c => this.row(c)).join('');
		$('td-off-card').hidden = !off.length;
	},

	handleSave: null,
	handleSaveApply: null,
	handleReset: null
});
