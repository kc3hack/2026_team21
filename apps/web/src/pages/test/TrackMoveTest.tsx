// トラックを走らせる

import { css, keyframes, Style } from "hono/css";
import { TrackParts } from "./TrackParts";

export const TrackMoveTest = () => {
  const drive = keyframes`
    0% { transform: translateX(-150%); }
    100% { transform: translateX(150vw); }
  `;

  const bounce = keyframes`
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-3px); }
  `;

  const trackContainerClass = css`
    position: absolute;
    bottom: 50px;
    left: 0;
    z-index: 20;
    
    transform: scale(0.6);
    transform-origin: bottom left;

    &.is-driving {
      animation: ${drive} 3.5s linear infinite;
    }
    
    &.is-driving .track-wrapper {
      animation: ${bounce} 0.2s linear infinite;
    }

    @media (max-width: 600px) {
      bottom: 30px;
      transform: scale(0.5);
    }

    .track-wrapper {
      position: relative;
      width: 25rem; 
      height: 15rem; 
    }

    .track-part {
      position: absolute;
      object-fit: contain;
    }

    .track-body { 
      width: 100%; 
      top: 0; 
      left: 0; 
      z-index: 10;
    }

    .head-track { 
      width: 20%;       
      top: 16%;         
      right: 46%;       
      z-index: 15;
      transform: scale(8);
      transform-origin: center center; 
    }

    .tire {
      z-index: 20;
    }
    
    .back-tire { 
      width: 18%;
      bottom: 8%;
      left: 0%; 
    }
    .front-tire { 
      width: 22%;
      bottom: 8%;
      right: 40%; 
      transform: scale(5.5);
      transform-origin: center center;
      z-index: 9;
    }
  `;

  return (
    <div style="width: 100vw; height: 100vh; overflow: hidden; position: absolute; top: 0; left: 0; pointer-events: none;">
      <Style />

      <div style="padding: 20px; display: flex; gap: 10px; position: absolute; top: 80px; left: 0; z-index: 9999; pointer-events: auto;">
        <button
          type="button"
          onclick="document.getElementById('test-track-area').classList.add('is-driving')"
          style="background: #e8a76c; color: white; border: none; border-radius: 4px; font-size: 1rem; padding: 10px 20px; cursor: pointer;"
        >
          トラック発車
        </button>
        <button
          type="button"
          onclick="document.getElementById('test-track-area').classList.remove('is-driving')"
          style="background: #e8a76c; color: white; border: none; border-radius: 4px; font-size: 1rem; padding: 10px 20px; cursor: pointer;"
        >
          トラック停止
        </button>
      </div>

      <div class={trackContainerClass} id="test-track-area">
        <div class="track-wrapper">
          <TrackParts />
        </div>
      </div>
    </div>
  );
};
