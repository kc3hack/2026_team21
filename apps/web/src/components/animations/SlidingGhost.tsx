import { css, keyframes } from "hono/css";
import { GhostParts } from "../../pages/test/GhostParts";
import { EyeTracker } from "./EyeTracker";
import { GhostMusicNotes } from "./GhostMusicNotes";
import { InteractionController } from "./InteractionController";

const float = keyframes`0%, 100% { transform: translateY(0); } 50% { transform: translateY(-15px); }`;
const shadowPulse = keyframes`0%, 100% { transform: scale(1); opacity: 0.25; } 50% { transform: scale(0.85); opacity: 0.1; }`;
const waveRight = keyframes`0%, 100% { transform: rotate(0deg); } 50% { transform: rotate(40deg); }`;
const waveLeft = keyframes`0%, 100% { transform: rotate(0deg); } 50% { transform: rotate(-40deg); }`;
const slideInFromRight = keyframes`0% { right: -52%; } 100% { right: 4%; }`;
const slideInFromRightMobile = keyframes`0% { right: -80%; } 100% { right: 50%; }`;
const slideInFromLeft = keyframes`0% { right: 120%; } 100% { right: 0%; }`;
const slideInFromLeftMobile = keyframes`0% { right: 170%; } 100% { right: 50%; }`;

const ghostContainerClass = css`
  position: absolute;
  z-index: 40;
  bottom: 44px;
  right: 0%;
  transform: scale(0.45);
  transform-origin: bottom center;
  transition: right 1.5s cubic-bezier(0.5, 0, 0.2, 1);

  @media (max-width: 600px) {
    right: 50%;
    transform: translateX(50%) scale(0.4);
    bottom: 16px;
  }

  @media (max-width: 600px) {
    &.mobile-middle {
      top: 66%;
      bottom: auto;
      transform: translateX(50%) translateY(-50%) scale(0.46);
    }
  }

  &.is-entering {
    animation: ${slideInFromRight} 1.2s cubic-bezier(0.22, 0.9, 0.22, 1) both;
  }

  @media (max-width: 600px) {
    &.is-entering {
      animation: ${slideInFromRightMobile} 1.2s cubic-bezier(0.22, 0.9, 0.22, 1) both;
    }
  }

  &.is-entering-left {
    animation: ${slideInFromLeft} 4.5s linear both;
  }

  @media (max-width: 600px) {
    &.is-entering-left {
      animation: ${slideInFromLeftMobile} 4.5s linear both;
    }
  }

  &.is-moving {
    right: 120%;
    pointer-events: none;

    @media (max-width: 600px) {
      right: 150%;
    }
  }

  &.is-moving.is-moving-slow {
    transition-duration: 3.4s;
  }

  &.is-sleeping {
    pointer-events: none;
  }

  &.is-sleeping .ghost-tilter {
    transform: rotate(8deg);
  }

  &.is-sleeping #ghost-arm-right {
    transform: rotate(14deg);
  }

  &.is-sleeping #ghost-arm-left {
    transform: rotate(-14deg);
  }

  &.is-sleeping .ghost-eye {
    opacity: 0;
  }

  &.is-sleeping .sleep-eye {
    opacity: 1;
  }

  &.is-moving.use-wake-eye .ghost-eye {
    opacity: 0;
  }

  &.is-moving.use-wake-eye .wake-eye {
    opacity: 1;
  }

  &.is-moving .ghost-tilter {
    transform: rotate(-15deg);
  }

  &.is-moving #ghost-arm-right {
    transform: translateX(12rem) scaleX(-1) rotate(20deg) !important;
  }

  &.is-moving #ghost-arm-left {
    transform: translateX(2rem) translateY(-1rem) rotate(-30deg) !important;
  }

  .ghost-tilter {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    transform-origin: bottom center;
    transition: transform 0.4s ease-out;
  }

  .ghost-body {
    position: relative;
    z-index: 10;
    width: 25rem;
    height: 30rem;
    animation: ${float} 3s ease-in-out infinite;
    cursor: pointer;
  }

  .ghost-eye {
    transition: transform 0.1s ease-out, opacity 0.2s ease;
  }

  .ghost-part {
    position: absolute;
    object-fit: contain;
    pointer-events: none;
  }

  .cheek {
    position: absolute;
    width: 3.5rem;
    height: 1.5rem;
    background-color: #ffb6c1;
    border-radius: 50%;
    filter: blur(5px);
    opacity: 0;
    transition: opacity 0.3s ease;
    z-index: 25;
    top: 40%;
  }

  .cheek-left {
    left: 32%;
  }

  .cheek-right {
    right: 28%;
  }

  .is-blushing .cheek {
    opacity: 0.8;
  }

  .is-waving-right {
    animation: ${waveRight} 0.4s ease-in-out infinite;
  }

  .is-waving-left {
    animation: ${waveLeft} 0.4s ease-in-out infinite;
  }

  img[alt="body"] {
    width: 39%;
    bottom: 5%;
    left: 0;
    right: 0;
    margin: auto;
  }

  img[alt="head"] {
    width: 44%;
    top: 20%;
    left: 0;
    right: 0;
    margin: auto;
  }

  .eye-right {
    width: 8%;
    top: 32%;
    left: 37%;
    z-index: 20;
  }

  .eye-left {
    width: 8%;
    top: 32%;
    right: 37%;
    z-index: 20;
  }

  #ghost-eye-right {
    left: 37% !important;
  }

  #ghost-eye-left {
    right: 37% !important;
  }

  .sleep-eye,
  .wake-eye {
    position: absolute;
    z-index: 28;
    opacity: 0;
    transition: opacity 0.2s ease;
    pointer-events: none;
  }

  .sleep-eye-right,
  .wake-eye-right {
    width: 10%;
    top: 35%;
    left: 34.5%;
  }

  .sleep-eye-left,
  .wake-eye-left {
    width: 10%;
    top: 35%;
    right: 34.5%;
  }

  .wake-eye-right,
  .wake-eye-left {
    width: 11%;
    top: 33%;
  }

  .wake-eye-left {
    right: 34.5%;
  }

  .wake-eye-right {
    left: 34.5%;
  }

  .arm-right {
    width: 17%;
    top: 58%;
    left: 9%;
    z-index: 20;
    transform-origin: top center;
    transition: transform 0.4s ease;
  }

  .arm-left {
    width: 17%;
    top: 58%;
    right: 9%;
    z-index: 20;
    transform-origin: top center;
    transition: transform 0.4s ease;
  }

  .ghost-shadow {
    position: absolute;
    bottom: 0;
    width: 16rem;
    height: 2rem;
    background-color: #6a7566;
    border-radius: 50%;
    filter: blur(3px);
    animation: ${shadowPulse} 3s ease-in-out infinite;
  }
`;

type Props = {
  isMoving?: boolean;
  isSleeping?: boolean;
  showNotes?: boolean;
  enteringFromRight?: boolean;
  enteringFromLeft?: boolean;
  wakeEyesOnMove?: boolean;
  slowMove?: boolean;
  mobilePlacement?: "bottom" | "button";
};

export const SlidingGhost = ({
  isMoving = false,
  isSleeping = false,
  showNotes = false,
  enteringFromRight = false,
  enteringFromLeft = false,
  wakeEyesOnMove = true,
  slowMove = false,
  mobilePlacement = "bottom",
}: Props) => {
  const bodyId = "sliding-ghost-body";
  const isInteractive = !isMoving && !isSleeping;
  const className = `${ghostContainerClass} ${isMoving ? "is-moving" : ""} ${isSleeping ? "is-sleeping" : ""} ${
    enteringFromRight ? "is-entering" : ""
  } ${enteringFromLeft ? "is-entering-left" : ""} ${wakeEyesOnMove ? "use-wake-eye" : ""} ${
    slowMove ? "is-moving-slow" : ""
  } ${mobilePlacement === "button" ? "mobile-middle" : ""}`;

  return (
    <div class={className}>
      {showNotes && <GhostMusicNotes />}
      {isInteractive && <EyeTracker bodyId={bodyId} />}
      {isInteractive && <InteractionController bodyId={bodyId} />}

      <div class="ghost-tilter">
        <div class="ghost-body" id={bodyId}>
          <GhostParts />
          <img src="/images/room/right_sleep.svg" alt="" class="sleep-eye sleep-eye-right" />
          <img src="/images/room/left_sleep.svg" alt="" class="sleep-eye sleep-eye-left" />
          <img src="/images/room/wakeup.svg" alt="" class="wake-eye wake-eye-right" />
          <img src="/images/room/wakeup.svg" alt="" class="wake-eye wake-eye-left" />
        </div>
        <div class="ghost-shadow" />
      </div>
    </div>
  );
};
