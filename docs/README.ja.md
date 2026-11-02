# Double Middle-Click Close Tab

[English](../README.md) · [繁體中文](README.zh-TW.md) · [简体中文](README.zh-CN.md) · 日本語 · [한국어](README.ko.md)

Web ページ上でマウスの中ボタン（通常はホイールボタン）をダブルクリックすると、現在のタブを閉じられます。

[![Chrome Web Store](assets/chrome.svg)](https://chromewebstore.google.com/detail/double-middle-click-close/meepebiimbmfopmaempaogpnnigjjcjg)
[![Microsoft Edge Add-ons](assets/edge.svg)](https://microsoftedge.microsoft.com/addons/detail/double-middleclick-close/apalhnbfahnnddopdjjoinfccnlkobgm)

## 機能

- 拡張機能のポップアップまたは設定ページでジェスチャーを有効化・一時停止。
- ダブルクリックの判定間隔を 100～1000 ミリ秒に設定可能。初期値は 400 ミリ秒。
- テーマアイコンをクリックしてライト・ダークを切り替え。初期設定ではシステムの外観に従います。
- ブラウザーの拡張機能用同期ストレージに設定を自動保存。

## 使い方

1. 上のリンクから Chrome ウェブストアまたは Microsoft Edge アドオンを開き、インストールします。
2. 使用する Web ページを開くか、再読み込みします。
3. 設定した間隔内にページ上でマウスの中ボタンをダブルクリックすると、そのタブが閉じます。
4. 拡張機能のポップアップでジェスチャーの一時停止と間隔の変更ができます。上部ナビゲーションのアイコンからテーマと言語を変更できます。専用の設定ページも利用できます。

テーマアイコンを初めてクリックするまでは、システムの外観に従います。クリックすると反対の外観に切り替わり、選択が保存されます。アップグレード時も、保存済みのライト・ダーク設定は維持されます。従来の自動設定は、手動で切り替えるまでシステムに従います。

間隔を長くすると、2 回のクリックの間に余裕ができます。短くすると、より素早いダブルクリックが必要です。変更は自動保存されます。数値を直接入力するほか、「**ダブルクリック間隔**」ラベルを左右にドラッグして調整できます。

ジェスチャーは、ブラウザーが拡張機能の実行を許可している Web ページで利用できます。ブラウザーの設定ページなど、実行が制限されているページでは利用できません。

画面は初期設定でブラウザーの言語に合わせて表示されます。英語、繁体字中国語、簡体字中国語、日本語、韓国語に対応し、その他の言語では英語を表示します。言語アイコンから表示言語を指定するか、「ブラウザーの言語」に戻せます。選択は自動保存されます。ストア掲載用の[多言語紹介文](store-descriptions.md)もあります。

## 開発

TypeScript、React、Vite、Tailwind CSS、shadcn/ui を使用しています。Node.js 22.12 以降が必要です。

```bash
npm install
npm run check
```

`npm run check` は厳密な TypeScript 型チェック、テスト、本番ビルドを実行します。出力先は `dist/` です。Chromium ベースのブラウザーで、このディレクトリをパッケージ化されていない拡張機能として読み込んでください。
