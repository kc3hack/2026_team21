// ページロード時にオレンジが右から走ってくる

import { css, keyframes, Style } from "hono/css";
import { OrangeGhostParts } from "./OrangeGhostParts";

export const TransitionDestinationTest = () => {
  const float = keyframes`0%, 100% { transform: translateY(0); } 50% { transform: translateY(-15px); }`;
  const shadowPulse = keyframes`0%, 100% { transform: scale(1); opacity: 0.25; } 50% { transform: scale(0.85); opacity: 0.1; }`;
  const slideIn = keyframes`0% { right: -50%; } 100% { right: 50px; }`;

  const destContainerClass = css`
    position: absolute; top: 0; left: 0; width: 100vw; height: 100vh; overflow: hidden; background: #fcf8e3;

    .ghost-wrapper {
      position: absolute; bottom: 50px; right: -50%;
      transform: scale(0.45); transform-origin: bottom center;
    }
    @media (max-width: 600px) { .ghost-wrapper { bottom: 30px; transform: scale(0.4); } }

    &.is-arriving .ghost-wrapper {
      animation: ${slideIn} 1.5s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
    }
    &.is-arriving .ghost-tilter { transform: rotate(-15deg); transition: transform 0.4s ease-out; }

    &.is-arriving #orange-arm-right { 
      transform: translateX(15rem) scaleX(-1) rotate(20deg) !important; 
    }
    &.is-arriving #orange-arm-left { 
      transform: translateX(0rem) translateY(-1rem) rotate(-30deg) !important; 
    }

    &.has-arrived .ghost-wrapper { right: 50px; }
    &.has-arrived .ghost-tilter { transform: rotate(0deg); }

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
    .cheek { display: none; }
  `;

  return (
    <div style="width: 100vw; height: 100vh; position: absolute; top: 0; left: 0;">
      <Style />
      <div style="padding: 20px; position: absolute; top: 20px; left: 0; z-index: 9999;">
        <button
          onclick="window.location.href='/test'"
          type="button"
          style="background: #e8a76c; color: white; border: none; border-radius: 4px; font-size: 1rem; padding: 10px 20px; cursor: pointer;"
        >
          ← 最初の画面（緑のお化け）に戻る
        </button>
      </div>
      <div class={destContainerClass} id="destination-area">
        <div class="ghost-wrapper">
          <div class="ghost-tilter">
            <div class="ghost-body">
              <OrangeGhostParts />
            </div>
            <div class="ghost-shadow" />
          </div>
        </div>
      </div>
      <script type="module" src="/src/pages/test/destination.client.ts"></script>
    </div>
  );
};
