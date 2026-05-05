# フレタン

英語フレーズを学習カード、4択、穴埋め、瞬間英作文で覚える無料PWAプロトタイプです。

## 無料公開の方法

GitHub Pages か Cloudflare Pages に、このフォルダの中身をそのまま置くと公開できます。

- `index.html`
- `styles.css`
- `app.js`
- `manifest.webmanifest`
- `sw.js`
- `icon.svg`
- `icon-192.png`
- `icon-512.png`

公開後のURLをスマホで開き、ブラウザの共有メニューから「ホーム画面に追加」を選ぶとアプリ風に使えます。

## 注意

`file://` で開いている間はブラウザ仕様によりService Workerは登録されません。GitHub PagesやCloudflare Pagesなどの `https://` URLで公開すると、オフラインキャッシュが有効になります。
