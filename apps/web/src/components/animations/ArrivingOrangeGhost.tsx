// apps/web/src/components/animations/ArrivingOrangeGhost.tsx
import { css, keyframes } from "hono/css";
import { useEffect, useState } from "hono/jsx";
import { OrangeGhostParts } from "../../pages/test/OrangeGhostParts";
import { EyeTracker } from "./EyeTracker";
import { InteractionController } from "./InteractionController";

const float = keyframes`0%, 100% { transform: translateY(0); } 50% { transform: translateY(-15px); }`;
const shadowPulse = keyframes`0%, 100% { transform: scale(1); opacity: 0.25; } 50% { transform: scale(0.85); opacity: 0.1; }`;
const slideIn = keyframes`0% { right: -100%; } 100% { right: 5%; }`;
const waveRight = keyframes`0%, 100% { transform: rotate(0deg); } 50% { transform: rotate(40deg); }`;
const waveLeft = keyframes`0%, 100% { transform: rotate(0deg); } 50% { transform: rotate(-40deg); }`;

const destContainerClass = css`
  position: absolute; z-index: 10; bottom: 50px; right: 5%;
  transform: scale(0.45); transform-origin: bottom center;
  transition: right 1.5s cubic-bezier(0.5, 0, 0.2, 1);

  @media (max-width: 600px) { right: 5%; transform: scale(0.4); bottom: 30px; }

  /* 登場：右からスライドイン */
  &.is-arriving { animation: ${slideIn} 1.5s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
  &.is-arriving .ghost-tilter { transform: rotate(-15deg); }
  &.is-arriving #ghost-arm-right { transform: translateX(12rem) scaleX(-1) rotate(20deg) !important; }
  &.is-arriving #ghost-arm-left { transform: translateX(2rem) translateY(-1rem) rotate(-30deg) !important; }

  /* 退場：左へナルト走り（isMovingがtrueのとき） */
  &.is-moving-out { 
    right: 120%; 
    pointer-events: none; 
    @media (max-width: 600px) { right: 150%; } 
  }
  &.is-moving-out .ghost-tilter { transform: rotate(-15deg); }
  &.is-moving-out #ghost-arm-right { transform: translateX(12rem) scaleX(-1) rotate(20deg) !important; }
  &.is-moving-out #ghost-arm-left { transform: translateX(2rem) translateY(-1rem) rotate(-30deg) !important; }

  /* 到着後：通常状態 */
  &.has-arrived { right: 5%; }
  &.has-arrived .ghost-tilter { transform: rotate(0deg); transition: transform 0.4s ease-out; }

  .ghost-tilter { position: relative; display: flex; flex-direction: column; align-items: center; transform-origin: bottom center; }
  .ghost-body { position: relative; z-index: 10; width: 25rem; height: 30rem; animation: ${float} 3s ease-in-out infinite; cursor: pointer; }
  .ghost-eye { transition: transform 0.1s ease-out; }
  .ghost-part { position: absolute; object-fit: contain; pointer-events: none; }
  
  .cheek {
    position: absolute; width: 3.5rem; height: 1.5rem; background-color: #ffb6c1;
    border-radius: 50%; filter: blur(5px); opacity: 0; transition: opacity 0.3s ease;
    z-index: 25; top: 40%;
  }
  .cheek-left { left: 32%; } .cheek-right { right: 28%; }
  .is-blushing .cheek { opacity: 0.8; }
  
  .is-waving-right { animation: ${waveRight} 0.4s ease-in-out infinite; }
  .is-waving-left { animation: ${waveLeft} 0.4s ease-in-out infinite; }
  .ghost-shadow { position: absolute; bottom: 0rem; width: 16rem; height: 2rem; background-color: #6a7566; border-radius: 50%; filter: blur(3px); animation: ${shadowPulse} 3s ease-in-out infinite; }
`;

type Props = {
  isMoving: boolean; // index.tsx側から制御
};

export const ArrivingOrangeGhost = ({ isMoving }: Props) => {
  const [arrivingState, setArrivingState] = useState<"is-arriving" | "has-arrived">("is-arriving");
  const bodyId = "arriving-orange-body";

  useEffect(() => {
    // 最初の登場アニメーション完了（1.5秒）で通常状態へ
    const timer = setTimeout(() => setArrivingState("has-arrived"), 1500);
    return () => clearTimeout(timer);
  }, []);

  // 退場中なら is-moving-out を、そうでなければ登場/待機状態を適用
  const stateClass = isMoving ? "is-moving-out" : arrivingState;

  return (
    <div class={`${destContainerClass} ${stateClass}`}>
      <EyeTracker bodyId={bodyId} />
      <InteractionController bodyId={bodyId} />
      <div class="ghost-tilter">
        <div class="ghost-body" id={bodyId}>
          <OrangeGhostParts />
        </div>
        <div class="ghost-shadow" />
      </div>
    </div>
  );
};
