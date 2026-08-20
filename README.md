# dblMClickExt

Chrome extension of double middle click to close tab

[![Chrome Web Store](docs/assets/chrome.svg)](https://chromewebstore.google.com/detail/double-middle-click-close/meepebiimbmfopmaempaogpnnigjjcjg)
[![Microsoft Edge Add-ons](docs/assets/edge.svg)](https://microsoftedge.microsoft.com/addons/detail/double-middleclick-close/apalhnbfahnnddopdjjoinfccnlkobgm)

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
