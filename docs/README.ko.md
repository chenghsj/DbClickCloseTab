# Double Middle-Click Close Tab

[English](../README.md) · [繁體中文](README.zh-TW.md) · [简体中文](README.zh-CN.md) · [日本語](README.ja.md) · 한국어

웹페이지에서 마우스 가운데 버튼(일반적으로 휠 버튼)을 두 번 클릭하면 현재 탭을 닫을 수 있습니다.

[![Chrome Web Store](assets/chrome.svg)](https://chromewebstore.google.com/detail/double-middle-click-close/meepebiimbmfopmaempaogpnnigjjcjg)
[![Microsoft Edge Add-ons](assets/edge.svg)](https://microsoftedge.microsoft.com/addons/detail/double-middleclick-close/apalhnbfahnnddopdjjoinfccnlkobgm)

## 기능

- 확장 프로그램 팝업이나 설정 페이지에서 제스처를 켜거나 일시 중지할 수 있습니다.
- 두 번 클릭 인식 간격을 100~1000밀리초로 설정할 수 있습니다. 기본값은 400밀리초입니다.
- 테마 아이콘을 클릭하여 밝은 테마와 어두운 테마를 전환할 수 있습니다. 초기에는 시스템 설정을 따릅니다.
- 설정은 브라우저의 확장 프로그램 동기화 저장소에 자동으로 저장됩니다.

## 사용 방법

1. 위 링크를 통해 Chrome 웹 스토어 또는 Microsoft Edge 추가 기능에서 설치합니다.
2. 사용할 웹페이지를 열거나 새로고침합니다.
3. 설정한 간격 안에 웹페이지에서 마우스 가운데 버튼을 두 번 클릭하면 해당 탭이 닫힙니다.
4. 확장 프로그램 팝업에서 제스처를 일시 중지하거나 간격을 변경할 수 있습니다. 상단 탐색 영역의 아이콘으로 테마와 언어를 변경할 수 있습니다. 전체 설정 페이지도 사용할 수 있습니다.

테마 아이콘을 처음 클릭하기 전에는 시스템 설정을 따릅니다. 클릭하면 반대 테마로 전환하고 선택을 저장합니다. 업그레이드해도 기존에 저장한 밝은 테마나 어두운 테마 설정은 유지됩니다. 기존 자동 설정은 직접 전환할 때까지 시스템 설정을 따릅니다.

간격을 늘리면 두 번의 클릭 사이에 더 많은 시간이 허용됩니다. 간격을 줄이면 더 빠르게 두 번 클릭해야 합니다. 변경 사항은 자동으로 저장됩니다. 값을 직접 입력하거나 **두 번 클릭 간격** 라벨을 좌우로 드래그하여 조정할 수 있습니다.

제스처는 브라우저에서 확장 프로그램 실행을 허용하는 웹페이지에서 사용할 수 있습니다. 브라우저 설정 페이지 등 실행이 제한된 페이지에서는 사용할 수 없습니다.

화면은 기본적으로 브라우저 언어를 따릅니다. 영어, 번체 중국어, 간체 중국어, 일본어, 한국어를 지원하며 그 외의 언어는 영어로 표시됩니다. 언어 아이콘에서 언어를 지정하거나 ‘브라우저 언어’로 되돌릴 수 있습니다. 선택은 자동으로 저장됩니다. 스토어 등록에 사용할 [다국어 소개 문구](store-descriptions.md)도 제공합니다.

## 개발

TypeScript, React, Vite, Tailwind CSS, shadcn/ui로 개발되었습니다. Node.js 22.12 이상이 필요합니다.

```bash
npm install
npm run check
```

`npm run check`는 엄격한 TypeScript 타입 검사, 테스트, 프로덕션 빌드를 실행합니다. 빌드 결과는 `dist/`에 생성됩니다. Chromium 기반 브라우저에서 이 디렉터리를 압축 해제된 확장 프로그램으로 로드할 수 있습니다.
