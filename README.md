<p align="center">
  <img src="docs/logo.svg" width="84" alt="7Dollar">
</p>

<h1 align="center">7Dollar</h1>

<p align="center">
  一个安静、优雅、轻巧的 OpenWrt 主题。<br>
  <sub>A calm, elegant and lightweight theme for OpenWrt LuCI.</sub>
</p>

<p align="center">
  <img alt="OpenWrt" src="https://img.shields.io/badge/OpenWrt-23.05%20%7C%2024.10-D97757?style=flat-square">
  <img alt="Size" src="https://img.shields.io/badge/%E5%AE%89%E8%A3%85%E5%8C%85-44%20KB-8A7F72?style=flat-square">
  <img alt="Palettes" src="https://img.shields.io/badge/%E9%85%8D%E8%89%B2-5%20%C3%97%202-4F8F7A?style=flat-square">
  <img alt="License" src="https://img.shields.io/badge/license-Apache--2.0-5B6F9A?style=flat-square">
</p>

<p align="center">
  <a href="#-三分钟装好">安装</a> ·
  <a href="#-用起来">使用</a> ·
  <a href="#-换回原来的样子">卸载</a> ·
  <a href="#-english">English</a>
</p>

<br>

<p align="center">
  <img src="docs/home-light.webp" alt="7Dollar 首页" width="100%">
</p>

<br>

## 为什么叫 7Dollar

因为做它一共花了 **7 美元**。

从第一张草图、每一种配色，到最后一行 CSS，这个主题是和 AI 一起一点点聊出来的。结账的时候，Token 账单上是 7 美元。好像没有比这个更诚实的名字了。

> 一杯咖啡的钱，换一个每天都愿意打开的路由器后台。

<br>

## 它想解决什么

OpenWrt 很强大，但它的界面一直很“工程师”：密密麻麻的表格，满屏的参数，找一个设置要在好几层菜单里翻来翻去。

7Dollar 换了一个思路：**先想清楚你打开后台是来做什么的，再决定页面长什么样。**

- **一眼看懂**：首页先告诉你“一切都好吗”。网络通不通、延迟多少、几台设备在线、路由器累不累，用一句话和几张卡片讲清楚。
- **信息一样都不少**：原生 LuCI 的每一个页面、每一个选项都还在，只是排得更舒服。
- **按“想做的事”找功能**：把几十个菜单重新整理成 7 组：总览、设备、Wi‑Fi、上网、安全、应用、系统。实在找不到，按 <kbd>⌘</kbd> <kbd>K</kbd>（Windows 上是 <kbd>Ctrl</kbd> <kbd>K</kbd>）直接搜。
- **轻**：不带字体、不带图片、不连外网。CSS 压缩后只有 15 KB，整个安装包 44 KB。

<br>

## 看一看

### 五种配色，各有深浅

陶土、青瓷、雾蓝、暮紫、石墨。每一种都有浅色和深色两个版本，也可以跟随系统自动切换。

<p align="center"><img src="docs/palettes.png" alt="五种配色" width="100%"></p>

### 深色模式，以及可选的插件卡片

首页默认**不显示**任何代理软件的信息。毕竟不是每个人都装了 OpenClash。
如果你装了，可以在设置里打开它的卡片：运行状态、代理流量和规则模式一眼可见，还能一键切换模式。

<p align="center"><img src="docs/home-dark.webp" alt="深色模式与 OpenClash 卡片" width="100%"></p>

### 手机上也好用

窄屏时侧边栏变成底部标签栏，表格变成卡片，按钮变大。页面放大到 200%、300% 也会重新排版，不会挤成一团。

<p align="center"><img src="docs/mobile.png" alt="手机界面" width="88%"></p>

<table>
  <tr>
    <td width="50%"><img src="docs/login.webp" alt="登录页"><p align="center"><sub>登录页：只需要输入密码</sub></p></td>
    <td width="50%"><img src="docs/search.webp" alt="搜索"><p align="center"><sub>⌘K 搜索任何设置</sub></p></td>
  </tr>
  <tr>
    <td width="50%"><img src="docs/appearance.webp" alt="外观设置"><p align="center"><sub>系统 → 外观与首页</sub></p></td>
    <td width="50%"><img src="docs/native.webp" alt="原生页面"><p align="center"><sub>原生页面也一起变好看（雾蓝 · 深色）</sub></p></td>
  </tr>
</table>

<br>

## 🌿 三分钟装好

> **先确认一下**：你的路由器系统是 **OpenWrt 23.05 或更新版本**（在后台首页或“状态 → 概览”里能看到版本号）。
> 不确定也没关系，直接装。装不上会有提示，不会把路由器弄坏。

### 方法一：在网页上点几下（最简单，推荐）

不需要命令行，全程鼠标操作。适合 OpenWrt 23.05 和 24.10。

1. **下载安装包**
   点这里下载 👉 [luci-theme-7dollar_1.0.0-r1_all.ipk](https://github.com/itsmaiGe/luci-theme-7dollar/raw/main/dist/luci-theme-7dollar_1.0.0-r1_all.ipk)，存到电脑上。

2. **登录路由器后台**
   在浏览器地址栏输入路由器地址（通常是 `192.168.1.1`），输入密码登录。

3. **上传并安装**
   依次点击 **系统 → 软件包**，点 **上传软件包…**，选择刚才下载的文件，再点 **上传**，最后点 **安装**。

4. **刷新页面**
   按一下 <kbd>F5</kbd>（Mac 上是 <kbd>⌘</kbd> <kbd>R</kbd>），就能看到 7Dollar 了。

> 如果刷新后还是原来的样子：打开 **系统 → 系统 → 语言和界面**，把 **主题** 改成 **7Dollar**，点 **保存并应用**。

### 方法二：复制一行命令

适合所有 23.05 以上的版本，包括使用 `apk` 的 OpenWrt 25.x。

1. **打开终端**
   - Mac：打开“启动台”，搜索 **终端**。
   - Windows：在开始菜单搜索 **PowerShell**。

2. **连上路由器**（把 `192.168.1.1` 换成你的路由器地址）

   ```sh
   ssh root@192.168.1.1
   ```

   第一次连接会问 `yes/no`，输入 `yes` 回车。接着输入路由器密码（输入时屏幕上不会显示，这是正常的），再回车。

3. **粘贴这一行，回车**

   ```sh
   wget -qO- https://raw.githubusercontent.com/itsmaiGe/luci-theme-7dollar/main/install.sh | sh
   ```

   看到“完成！”就好了，回到浏览器刷新页面。

<details>
<summary><b>下载失败？</b>（国内网络访问 GitHub 不稳定时）</summary>

<br>

用方法一，在电脑上下载好安装包再上传，最省心。

也可以在命令前面套一个 GitHub 加速代理（把 `<代理地址>` 换成你常用的那个）：

```sh
wget -qO- <代理地址>/https://raw.githubusercontent.com/itsmaiGe/luci-theme-7dollar/main/install.sh | PROXY=<代理地址>/ sh
```
</details>

<details>
<summary><b>开发者：自己编译</b></summary>

<br>

把这个仓库放进 OpenWrt 源码或 SDK 的 `feeds/luci/themes/`（或 `package/`）目录：

```sh
git clone https://github.com/itsmaiGe/luci-theme-7dollar.git feeds/luci/themes/luci-theme-7dollar
./scripts/feeds update -i && ./scripts/feeds install luci-theme-7dollar
make menuconfig   # LuCI → Themes → luci-theme-7dollar
make package/luci-theme-7dollar/compile V=s
```

不想装 SDK，也可以在 macOS 或 Linux 上直接打出 ipk：`./scripts/build-ipk.sh`，生成的文件在 `dist/`。
</details>

<br>

## ✨ 用起来

| 想做的事 | 去哪里 |
| --- | --- |
| 换配色、深浅色 | **系统 → 外观与首页**，或点左下角的 🌙 快速切换深浅色 |
| 首页上只留自己关心的卡片 | **系统 → 外观与首页 → 首页卡片** |
| 在首页显示 OpenClash | **系统 → 外观与首页 → 插件卡片**，打开 OpenClash |
| 看看谁连着网 | 侧边栏 **设备** |
| 找某个设置 | 按 <kbd>⌘</kbd> <kbd>K</kbd> / <kbd>Ctrl</kbd> <kbd>K</kbd> / <kbd>/</kbd>，输入关键字 |
| 打开装过的插件 | 侧边栏 **应用** |

所有偏好都保存在路由器的 `/etc/config/7dollar` 里，换电脑、换手机打开都是同一套样子。这些设置只影响界面显示，不会动到任何网络配置。

<br>

## 🍂 换回原来的样子

**只是想换回别的主题**：打开 **系统 → 系统 → 语言和界面**，把 **主题** 改回 **Bootstrap**（或你原来用的），点 **保存并应用**。

**彻底卸载**：打开 **系统 → 软件包 → 已安装**，搜索 `7dollar`，点 **移除**。卸载后会自动切回 Bootstrap。

也可以用命令卸载：

```sh
wget -qO- https://raw.githubusercontent.com/itsmaiGe/luci-theme-7dollar/main/uninstall.sh | sh
```

<details>
<summary><b>万一后台打不开了</b></summary>

<br>

用方法二里的步骤 SSH 登录路由器，执行这一行，就会立刻切回默认主题：

```sh
uci set luci.main.mediaurlbase=/luci-static/bootstrap && uci commit luci
```
</details>

<br>

## 兼容性

| | |
| --- | --- |
| **OpenWrt** | 23.05、24.10（ucode 版 LuCI）。25.x 请用一行命令安装。22.03 及更早的版本不支持。 |
| **浏览器** | 近两年的 Chrome、Edge、Safari、Firefox，以及手机自带浏览器 |
| **已实测** | Cudy TR3000 · OpenWrt 24.10.5 · MT7981B |
| **共存** | 可以和 Bootstrap、Argon 等主题同时安装，随时切换 |

<br>

## 仓库里有什么

```
htdocs/luci-static/7dollar/      样式、图标、Logo
htdocs/luci-static/resources/    导航、首页、设备页、外观设置（JavaScript）
ucode/template/themes/7dollar/   页面框架和登录页
root/                            默认设置、菜单、权限
dist/                            打好的 ipk 安装包
install.sh / uninstall.sh        一行命令安装 / 卸载
```

<br>

## 致谢

- [OpenWrt LuCI](https://github.com/openwrt/luci)：7Dollar 站在它的肩膀上，所有原生页面都由它提供。
- 多套配色的想法来自 [zashboard](https://github.com/Zephyruso/zashboard)。默认的陶土色向 Claude 温暖的橙色致敬。

<br>

## 📮 English

**7Dollar** is a calm, card-based LuCI theme for OpenWrt 23.05+ (ucode LuCI). It is named after its build cost: the whole thing was designed and written with an AI pair, and the token bill came to **$7**.

- A friendly home dashboard: connection status, live throughput, online devices, Wi‑Fi and router health at a glance.
- Menus regrouped by intent (Home, Devices, Wi‑Fi, Internet, Security, Apps, System), plus <kbd>⌘K</kbd> search.
- 5 palettes (Clay, Celadon, Mist, Dusk, Graphite), each with a light and a dark variant, or follow the system.
- Proxy plugins are **opt-in**: the OpenClash card only appears if you enable it under *System → Appearance*.
- Reflows cleanly on phones and when the page is zoomed. No web fonts, images or external requests. 15 KB of gzipped CSS, 44 KB in total.

**Install.** Either upload [the ipk](https://github.com/itsmaiGe/luci-theme-7dollar/raw/main/dist/luci-theme-7dollar_1.0.0-r1_all.ipk) under *System → Software → Upload Package*, or run this over SSH:

```sh
wget -qO- https://raw.githubusercontent.com/itsmaiGe/luci-theme-7dollar/main/install.sh | sh
```

**Uninstall** with `opkg remove luci-theme-7dollar` or the `uninstall.sh` one-liner. Either way, LuCI switches back to Bootstrap.

<br>

## License

[Apache-2.0](LICENSE) © itsmaiGe

<p align="center"><sub>Made with care, and exactly seven dollars.</sub></p>
