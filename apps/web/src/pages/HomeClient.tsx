export const HomeClient = () => {
  return (
    <main class="home-container">
      <div class="logo-area">
        <img src="/images/logo.PNG" alt="Gost" class="logo-img" />
      </div>

      {/* キャラクター パーツ */}
      <div class="ghost-area">
        <div class="ghost-tilter">
          <div class="ghost-body" id="ghost-character">
            <div class="exclamation-mark">!</div>

            <img src="/images/home/body.svg" alt="body" class="ghost-part" />
            <img src="/images/home/head.svg" alt="head" class="ghost-part" />

            <img id="ghost-arm-right" src="/images/home/right.svg" alt="right" class="ghost-part" />
            <img id="ghost-arm-left" src="/images/home/left.svg" alt="left" class="ghost-part" />

            <div class="cheek cheek-left" />
            <div class="cheek cheek-right" />

            <img id="ghost-eye-right" src="/images/home/right_eye.svg" alt="right_eye" class="ghost-part ghost-eye" />
            <img id="ghost-eye-left" src="/images/home/left_eye.svg" alt="left_eye" class="ghost-part ghost-eye" />
          </div>
          <div class="ghost-shadow" />
        </div>
      </div>

      {/* ボタンエリア */}
      <div class="btn-area">
        <button type="button" class="create-btn" id="create-room-btn">
          ROOM 作成
        </button>
      </div>

      {/* QRコード表示エリア */}
      <div id="qr-container" class="qr-container">
        <p class="qr-text">QRコードを読み取ってもらいましょう</p>
        <div class="qr-image-canvas" id="qr-image-canvas"></div>
        <a href="/room/test1234" class="mock-qr-btn">
          【テスト】QRを読んだことにして進む
        </a>
      </div>

      {/* Viteの機能を使ってTSファイルを直接ブラウザで読み込む */}
      <script type="module" src="/src/pages/home.client.ts"></script>
    </main>
  );
};
