# Double Middle-Click Close Tab

[English](../README.md) · 繁體中文 · [简体中文](README.zh-CN.md) · [日本語](README.ja.md) · [한국어](README.ko.md)

在網頁上連按兩下滑鼠中鍵（通常是滾輪按鍵），即可關閉目前分頁。

[![Chrome Web Store](assets/chrome.svg)](https://chromewebstore.google.com/detail/double-middle-click-close/meepebiimbmfopmaempaogpnnigjjcjg)
[![Microsoft Edge Add-ons](assets/edge.svg)](https://microsoftedge.microsoft.com/addons/detail/double-middleclick-close/apalhnbfahnnddopdjjoinfccnlkobgm)

## 功能

- 從擴充功能彈出視窗或設定頁啟用、暫停手勢。
- 自訂雙擊判定間隔：100～1000 毫秒，預設為 400 毫秒。
- 點擊主題圖示即可切換淺色與深色；初始外觀跟隨系統。
- 設定會自動儲存至瀏覽器的擴充功能同步儲存空間。

## 使用方式

1. 透過上方連結，從 Chrome 線上應用程式商店或 Microsoft Edge 附加元件安裝。
2. 開啟或重新整理要使用的網頁。
3. 在設定的間隔內，於網頁上連按兩下滑鼠中鍵，即可關閉該分頁。
4. 開啟擴充功能彈出視窗，即可暫停手勢與調整間隔。頂部導覽列的主題與語言圖示可切換外觀與語言，也可使用完整設定頁。

首次點擊主題圖示前，外觀會跟隨系統；點擊後會切換為相反的外觀並儲存選擇。升級時會保留舊版已儲存的淺色或深色設定，原本的自動設定則會持續跟隨系統，直到你手動切換。

間隔越大，兩次點擊之間允許的時間越長；間隔越小，則需要更快地雙擊。修改後會自動儲存。你可以直接輸入數值，也可以左右拖曳「**雙擊間隔**」標籤來調整。

手勢僅適用於瀏覽器允許執行擴充功能的網頁；瀏覽器設定頁等受限制頁面不適用。

介面預設跟隨瀏覽器語言，支援英文、繁體中文、簡體中文、日文與韓文；其他語言會顯示英文。可透過語言圖示指定語言，或選擇「跟隨瀏覽器」，選擇後會自動儲存。另提供[多國語言商店介紹](store-descriptions.md)，方便維護商店頁面。

## 開發

使用 TypeScript、React、Vite、Tailwind CSS 與 shadcn/ui 建置。需要 Node.js 22.12 或更新版本。

```bash
npm install
npm run check
```

`npm run check` 會執行嚴格的 TypeScript 型別檢查、測試與正式版建置。產物位於 `dist/`，可在 Chromium 系瀏覽器中以「載入未封裝項目」載入該目錄。
