// 受け取り側へファイルを渡す時のアニメーション

import { css, keyframes, Style } from "hono/css";
import { GhostParts } from "./GhostParts";
import { OrangeGhostParts } from "./OrangeGhostParts";

export const HandoverTest = () => {
  const float = keyframes`
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-15px); }
  `;

  const shadowPulse = keyframes`
    0%, 100% { transform: scale(1); opacity: 0.25; }
    50% { transform: scale(0.85); opacity: 0.1; }
  `;

  const handoverContainerClass = css`
    position: absolute;
    top: 0; left: 0;
    width: 100vw; height: 100vh;
    overflow: hidden;

    .ghost-wrapper {
      position: absolute;
      bottom: 50px;
      transform: scale(0.45);
      transform-origin: bottom center;
    }

    .green-ghost {
      left: -50%;
      transition: left 1s cubic-bezier(0.25, 1, 0.5, 1);
    }

    .orange-ghost {
      right: 15%;
    }

    @media (max-width: 600px) {
      .ghost-wrapper { bottom: 30px; transform: scale(0.4); }
      .orange-ghost { right: 10%; }
    }


    &.is-active .green-ghost {
      left: 15%;
      @media (max-width: 600px) { left: 5%; }
    }

    &.is-active .green-ghost #ghost-arm-left {
      transform: rotate(-73deg) translate(10px, 20px) !important;
      transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) 1s;
    }

    &.is-active .letter-item {
      opacity: 1;
      transform: translateY(0) scale(0.7) rotate(-10deg);
      transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) 1.1s;
    }

    &.is-active .orange-ghost .cheek {
      opacity: 1;
      transition: opacity 0.3s ease 1.4s;
    }
    &.is-active .orange-ghost #orange-arm-right {
      transform: rotate(60deg) translate(20px, -10px) !important;
      transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) 1.4s;
    }
    &.is-active .orange-ghost #orange-arm-left {
      transform: rotate(-60deg) translate(-20px, -10px) !important;
      transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) 1.4s;
    }

    .ghost-tilter {
      position: relative; display: flex; flex-direction: column; align-items: center;
    }
    .ghost-body {
      position: relative; z-index: 10; width: 25rem; height: 30rem;
      animation: ${float} 3s ease-in-out infinite;
    }
    .ghost-part { position: absolute; object-fit: contain; }

    img[alt="body"] { width: 39%; bottom: 5%; left: 0; right: 0; margin: auto; }
    img[alt="head"] { width: 44%; top: 20%; left: 0; right: 0; margin: auto; }
    .eye-right { width: 8%; top: 32%; left: 38%; z-index: 20; }
    .eye-left { width: 8%; top: 32%; right: 33%; z-index: 20; }
    
    .arm-right { width: 17%; top: 58%; left: 9%; z-index: 20; transform-origin: top center; transition: transform 0.4s ease; }
    .arm-left { width: 17%; top: 58%; right: 9%; z-index: 20; transform-origin: top center; transition: transform 0.4s ease; }

    .orange-ghost .eye-right { transform: translateX(-15px); }
    .orange-ghost .eye-left { transform: translateX(-15px); }

    .cheek {
      position: absolute; width: 3.5rem; height: 1.5rem; background-color: #ff9999; border-radius: 50%;
      top: 42%; z-index: 25; filter: blur(2px); opacity: 0;
    }
    .cheek-left { left: 25%; }
    .cheek-right { right: 27%; }

    .letter-item {
      position: absolute;
      width: 14rem;
      top: 45%;
      right: -25%; 
      z-index: 30;
      opacity: 0;
      transform: translateY(20px) scale(0.8);
    }

    .ghost-shadow {
      position: absolute; bottom: 0rem; width: 16rem; height: 2rem; background-color: #6a7566;
      border-radius: 50%; filter: blur(3px); animation: ${shadowPulse} 3s ease-in-out infinite;
    }
  `;

  return (
    <div style="width: 100vw; height: 100vh; position: absolute; top: 0; left: 0; pointer-events: none;">
      <Style />

      <div style="padding: 20px; display: flex; gap: 10px; position: absolute; top: 140px; left: 0; z-index: 9999; pointer-events: auto;">
        <button
          type="button"
          onclick="document.getElementById('handover-area').classList.add('is-active')"
          style="background: #e8a76c; color: white; border: none; border-radius: 4px; font-size: 1rem; padding: 10px 20px; cursor: pointer;"
        >
          手紙を渡す（スライドイン）
        </button>
        <button
          type="button"
          onclick="document.getElementById('handover-area').classList.remove('is-active')"
          style="background: #e8a76c; color: white; border: none; border-radius: 4px; font-size: 1rem; padding: 10px 20px; cursor: pointer;"
        >
          リセット
        </button>
      </div>

      <div class={handoverContainerClass} id="handover-area">
        <div class="ghost-wrapper green-ghost">
          <div class="ghost-tilter">
            <div class="ghost-body">
              <GhostParts />
              <img src="/images/correct/letter.svg" alt="letter" class="letter-item" />
            </div>
            <div class="ghost-shadow" />
          </div>
        </div>

        <div class="ghost-wrapper orange-ghost">
          <div class="ghost-tilter">
            <div class="ghost-body">
              <OrangeGhostParts />
            </div>
            <div class="ghost-shadow" />
          </div>
        </div>
      </div>
    </div>
  );
};
