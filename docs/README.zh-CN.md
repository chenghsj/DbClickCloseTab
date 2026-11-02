# Double Middle-Click Close Tab

[English](../README.md) · [繁體中文](README.zh-TW.md) · 简体中文 · [日本語](README.ja.md) · [한국어](README.ko.md)

在网页上双击鼠标中键（通常是滚轮按键），即可关闭当前标签页。

[![Chrome Web Store](assets/chrome.svg)](https://chromewebstore.google.com/detail/double-middle-click-close/meepebiimbmfopmaempaogpnnigjjcjg)
[![Microsoft Edge Add-ons](assets/edge.svg)](https://microsoftedge.microsoft.com/addons/detail/double-middleclick-close/apalhnbfahnnddopdjjoinfccnlkobgm)

## 功能

- 从扩展程序弹出窗口或设置页启用、暂停手势。
- 自定义双击判定间隔：100～1000 毫秒，默认为 400 毫秒。
- 点击主题图标即可切换浅色和深色；初始外观跟随系统。
- 设置会自动保存到浏览器的扩展程序同步存储空间。

## 使用方法

1. 通过上方链接，从 Chrome 应用商店或 Microsoft Edge 加载项安装。
2. 打开或刷新要使用的网页。
3. 在设置的间隔内，于网页上双击鼠标中键，即可关闭该标签页。
4. 打开扩展程序弹出窗口，即可暂停手势和调整间隔。顶部导航栏的主题和语言图标可切换外观与语言，也可使用完整设置页。

首次点击主题图标前，外观会跟随系统；点击后会切换为相反的外观并保存选择。升级时会保留旧版已保存的浅色或深色设置，原来的自动设置则会持续跟随系统，直到你手动切换。

间隔越大，两次点击之间允许的时间越长；间隔越小，则需要更快地双击。修改后会自动保存。你可以直接输入数值，也可以左右拖动“**双击间隔**”标签来调整。

手势仅适用于浏览器允许扩展程序运行的网页；浏览器设置页等受限制页面不适用。

界面默认跟随浏览器语言，支持英文、繁体中文、简体中文、日文和韩文；其他语言会显示英文。可通过语言图标指定语言，或选择“跟随浏览器”，选择后会自动保存。另提供[多语言商店介绍](store-descriptions.md)，方便维护商店页面。

## 开发

使用 TypeScript、React、Vite、Tailwind CSS 和 shadcn/ui 构建。需要 Node.js 22.12 或更新版本。

```bash
npm install
npm run check
```

`npm run check` 会运行严格的 TypeScript 类型检查、测试和生产构建。构建产物位于 `dist/`，可在 Chromium 系浏览器中通过“加载已解压的扩展程序”加载该目录。
