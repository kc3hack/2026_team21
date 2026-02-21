import { css, keyframes, Style } from "hono/css";
import { GhostParts } from "./GhostParts";

export const GhostMoveTest = () => {
  const float = keyframes`0%, 100% { transform: translateY(0); } 50% { transform: translateY(-15px); }`;
  const shadowPulse = keyframes`0%, 100% { transform: scale(1); opacity: 0.25; } 50% { transform: scale(0.85); opacity: 0.1; }`;

  const ghostContainerClass = css`
    position: absolute;
    z-index: 10;
    bottom: 50px;
    right: 15%;
    transform: scale(0.45);
    transform-origin: bottom center;
    transition: right 1.5s cubic-bezier(0.5, 0, 0.2, 1);

    @media (max-width: 600px) {
      right: 50%;
      transform: translateX(50%) scale(0.4);
      bottom: 30px;
    }

    &.is-moving {
      right: 120%;
      @media (max-width: 600px) { right: 150%; }
    }

    &.is-moving .ghost-tilter { transform: rotate(-15deg); }
    &.is-moving #ghost-arm-right { transform: translateX(12rem) scaleX(-1) rotate(20deg) !important; }
    &.is-moving #ghost-arm-left { transform: translateX(2rem) translateY(-1rem) rotate(-30deg) !important; }

    /* 基本構造 */
    .ghost-tilter { position: relative; display: flex; flex-direction: column; align-items: center; transform-origin: bottom center; }
    .ghost-body { position: relative; z-index: 10; width: 25rem; height: 30rem; animation: ${float} 3s ease-in-out infinite; pointer-events: none; }
    .ghost-part { position: absolute; object-fit: contain; }
    img[alt="body"] { width: 39%; bottom: 5%; left: 0; right: 0; margin: auto; }
    img[alt="head"] { width: 44%; top: 20%; left: 0; right: 0; margin: auto; }
    .eye-right { width: 8%; top: 32%; left: 38%; z-index: 20; }
    .eye-left { width: 8%; top: 32%; right: 33%; z-index: 20; }
    .arm-right { width: 17%; top: 58%; left: 9%; z-index: 20; transform-origin: top center; transition: transform 0.4s ease; }
    .arm-left { width: 17%; top: 58%; right: 9%; z-index: 20; transform-origin: top center; transition: transform 0.4s ease; }
    .ghost-shadow { position: absolute; bottom: 0rem; width: 16rem; height: 2rem; background-color: #6a7566; border-radius: 50%; filter: blur(3px); animation: ${shadowPulse} 3s ease-in-out infinite; }
  `;

  return (
    <div style="width: 100vw; height: 100vh; overflow: hidden; position: relative; background: #fcf8e3;">
      <Style />
      <div style="padding: 20px; display: flex; gap: 10px; position: relative; z-index: 9999;">
        {/* ボタン押下で source.client.ts の処理を発火 */}
        <button
          id="source-start-btn"
          type="button"
          style="background: #758e6f; color: white; border: none; border-radius: 4px; font-size: 1rem; padding: 10px 20px; cursor: pointer;"
        >
          転送開始（別ページへ遷移）
        </button>
      </div>

      <div class={ghostContainerClass} id="source-area">
        <div class="ghost-tilter">
          <div class="ghost-body">
            <GhostParts />
          </div>
          <div class="ghost-shadow" />
        </div>
      </div>

      {/* 以前作った遷移用のクライアントスクリプトを再利用 */}
      <script type="module" src="/src/pages/test/source.client.ts"></script>
    </div>
  );
};
