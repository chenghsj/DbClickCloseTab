# Double Middle-Click Close Tab

English · [繁體中文](docs/README.zh-TW.md) · [简体中文](docs/README.zh-CN.md) · [日本語](docs/README.ja.md) · [한국어](docs/README.ko.md)

Close the current browser tab by double-clicking the middle mouse button (usually
the scroll wheel) on the page.

[![Chrome Web Store](docs/assets/chrome.svg)](https://chromewebstore.google.com/detail/double-middle-click-close/meepebiimbmfopmaempaogpnnigjjcjg)
[![Microsoft Edge Add-ons](docs/assets/edge.svg)](https://microsoftedge.microsoft.com/addons/detail/double-middleclick-close/apalhnbfahnnddopdjjoinfccnlkobgm)

## Features

- Enable or pause the gesture from the extension popup or settings page.
- Set the double-click interval from 100 to 1000 milliseconds (default: 400 ms).
- Toggle between light and dark themes with one click. The initial appearance follows your system.
- Save settings automatically using the browser's extension sync storage.

## How to use

1. Install the extension from the Chrome Web Store or Microsoft Edge Add-ons using
   the links above.
2. Open or reload the webpage where you want to use it.
3. Double-click the middle mouse button on the page within the configured
   interval to close that tab.
4. Open the extension popup to pause the gesture or adjust the interval. Use the
   theme and language icons in the top navigation to change appearance or language.
   You can also use the extension's full settings page.

The theme follows your system until you click the theme icon. Each click switches
to the opposite appearance and saves that choice. Existing saved light or dark
preferences are preserved when upgrading; older automatic preferences continue
following the system until you toggle them.

A larger interval gives you more time between clicks; a smaller interval requires
a faster double-click. Changes save automatically. You can type an interval or
drag the **Double-click interval** label left or right to adjust it.

The gesture works on webpages where the browser allows extensions to run.
Browser settings pages and other restricted pages do not support it.

The interface follows the browser's language by default: English, Traditional
Chinese, Simplified Chinese, Japanese, or Korean. Other languages fall back to
English. Use the language icon to select a language or return to **Browser language**.
Your selection saves automatically. The language links above provide
translated documentation. [Multilingual store descriptions](docs/store-descriptions.md)
are also available for maintaining the store listings.

## Development

Built with TypeScript, React, Vite, Tailwind CSS, and shadcn/ui. Requires Node.js
22.12 or newer.

```bash
npm install
npm run check
```

`npm run check` runs strict TypeScript checking, tests, and the production build.
The production extension is generated in `dist/`. Load that directory as an
unpacked extension in a Chromium-based browser.

Translations live in `_locales/<locale>/messages.json` and are shared by the
manifest and automatic interface language through `chrome.i18n`. Manual interface
language selections use the same catalogs. Extension metadata follows the browser
language. The build includes all catalogs in
`dist/_locales/`. English (`en`) is the default locale and the fallback for local
previews without extension APIs. Reload the unpacked extension after rebuilding
to test the interface in your browser's language.
