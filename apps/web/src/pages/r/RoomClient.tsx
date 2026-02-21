export const RoomClient = ({ currentPath }: { currentPath: string }) => {
  return (
    <main class="home-container">
      <div class="logo-area">
        <img src="/images/logo.PNG" alt="Gost" class="logo-img" />
      </div>

      {/* キャラクター パーツ */}
      <div class="ghost-area" id="ghost-area">
        <div class="ghost-tilter" id="ghost-tilter">
          <div class="ghost-body" id="ghost-character">
            <div class="exclamation-mark">!</div>

            <img src="/images/home/body.svg" alt="body" class="ghost-part" />
            <img src="/images/home/head.svg" alt="head" class="ghost-part" />

            <div class="zzz-container" id="zzz-effect">
              <span class="zzz-text z1">z</span>
              <span class="zzz-text z2">z</span>
              <span class="zzz-text z3">z</span>
            </div>

            {/* 腕パーツ */}
            <img id="ghost-arm-right" src="/images/home/right.svg" alt="right" class="ghost-part" />
            <img id="ghost-arm-left" src="/images/home/left.svg" alt="left" class="ghost-part" />

            <div class="cheek cheek-left" />
            <div class="cheek cheek-right" />

            {/* 目パーツ */}
            <img id="ghost-eye-right" src="/images/room/right_sleep.svg" alt="right_eye" class="ghost-part ghost-eye" />
            <img id="ghost-eye-left" src="/images/room/left_sleep.svg" alt="left_eye" class="ghost-part ghost-eye" />
          </div>
          <div class="ghost-shadow" />
        </div>
      </div>

      {/* 状態表示テキスト */}
      <div class="btn-area" id="status-btn-area" style="transition: opacity 0.3s ease; opacity: 1;">
        <button type="button" id="matching-status-btn" class="create-btn" style="cursor: default;">
          待機中...
        </button>
      </div>

      {/* ファイルアップロードフォーム */}
      <div class="upload-form-area" id="upload-form">
        <h2 style="color: #5E7359; margin-top: 0;">ファイルを送信</h2>
        <form
          action={currentPath}
          method="post"
          encType="multipart/form-data"
          style="width: 100%; display: flex; flex-direction: column; align-items: center; gap: 1rem;"
        >
          <input type="file" name="file" id="file" class="file-input-box" />
          <input type="hidden" name="back_to" value={currentPath} />
          <button type="submit" class="create-btn" style="padding: 1rem 3rem; font-size: 1.25rem;">
            アップロード
          </button>
        </form>
      </div>

      <div id="qr-container" class="qr-container">
        <p class="qr-text">QRコードを読み取ってもらいましょう</p>
        <div class="qr-image-canvas" id="qr-image-canvas"></div>
        <button type="button" class="mock-qr-btn" id="mock-match-btn">
          【テスト】QRを読んだことにして進む
        </button>
      </div>

      {/* Viteの機能を使ってTSファイルを直接ブラウザで読み込む */}
      <script type="module" src="/src/pages/r/room.client.ts"></script>
    </main>
  );
};
