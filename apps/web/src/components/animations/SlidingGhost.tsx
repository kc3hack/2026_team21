import { css, keyframes } from "hono/css";
import { GhostParts } from "../../pages/test/GhostParts";
import { EyeTracker } from "./EyeTracker";
import { InteractionController } from "./InteractionController";

const float = keyframes`0%, 100% { transform: translateY(0); } 50% { transform: translateY(-15px); }`;
const shadowPulse = keyframes`0%, 100% { transform: scale(1); opacity: 0.25; } 50% { transform: scale(0.85); opacity: 0.1; }`;
const waveRight = keyframes`0%, 100% { transform: rotate(0deg); } 50% { transform: rotate(40deg); }`;
const waveLeft = keyframes`0%, 100% { transform: rotate(0deg); } 50% { transform: rotate(-40deg); }`;

const ghostContainerClass = css`
  position: absolute;
  z-index: 10;
  bottom: 50px;
  right: 5%;
  transform: scale(0.45);
  transform-origin: bottom center;
  transition: right 1.5s cubic-bezier(0.5, 0, 0.2, 1);

  @media (max-width: 600px) {
    right: 5%;
    transform: scale(0.4);
    bottom: 30px;
  }

  /* 左にスライドアウト（ナルト走り） */
  &.is-moving {
    right: 120%;
    pointer-events: none;
    @media (max-width: 600px) { right: 150%; }
  }

  &.is-moving .ghost-tilter { transform: rotate(-15deg); }
  &.is-moving #ghost-arm-right { transform: translateX(12rem) scaleX(-1) rotate(20deg) !important; }
  &.is-moving #ghost-arm-left { transform: translateX(2rem) translateY(-1rem) rotate(-30deg) !important; }

  .ghost-tilter { position: relative; display: flex; flex-direction: column; align-items: center; transform-origin: bottom center; transition: transform 0.4s ease-out; }
  .ghost-body { position: relative; z-index: 10; width: 25rem; height: 30rem; animation: ${float} 3s ease-in-out infinite; cursor: pointer; }
  .ghost-eye { transition: transform 0.1s ease-out; }
  .ghost-part { position: absolute; object-fit: contain; pointer-events: none; }
  .cheek { position: absolute; width: 3.5rem; height: 1.5rem; background-color: #ffb6c1; border-radius: 50%; filter: blur(5px); opacity: 0; transition: opacity 0.3s ease; z-index: 25; top: 40%; }
  .cheek-left { left: 32%; } .cheek-right { right: 28%; }
  .is-blushing .cheek { opacity: 0.8; }
  .is-waving-right { animation: ${waveRight} 0.4s ease-in-out infinite; }
  .is-waving-left { animation: ${waveLeft} 0.4s ease-in-out infinite; }
  img[alt="body"] { width: 39%; bottom: 5%; left: 0; right: 0; margin: auto; }
  img[alt="head"] { width: 44%; top: 20%; left: 0; right: 0; margin: auto; }
  .eye-right { width: 8%; top: 32%; left: 38%; z-index: 20; }
  .eye-left { width: 8%; top: 32%; right: 33%; z-index: 20; }
  .arm-right { width: 17%; top: 58%; left: 9%; z-index: 20; transform-origin: top center; transition: transform 0.4s ease; }
  .arm-left { width: 17%; top: 58%; right: 9%; z-index: 20; transform-origin: top center; transition: transform 0.4s ease; }
  .ghost-shadow { position: absolute; bottom: 0rem; width: 16rem; height: 2rem; background-color: #6a7566; border-radius: 50%; filter: blur(3px); animation: ${shadowPulse} 3s ease-in-out infinite; }
`;

type Props = {
  isMoving: boolean;
};

export const SlidingGhost = ({ isMoving }: Props) => {
  const bodyId = "sliding-ghost-body";
  return (
    <div class={`${ghostContainerClass} ${isMoving ? "is-moving" : ""}`}>
      <EyeTracker bodyId={bodyId} />
      <InteractionController bodyId={bodyId} />
      <div class="ghost-tilter">
        <div class="ghost-body" id={bodyId}>
          <GhostParts />
        </div>
        <div class="ghost-shadow" />
      </div>
    </div>
  );
};
