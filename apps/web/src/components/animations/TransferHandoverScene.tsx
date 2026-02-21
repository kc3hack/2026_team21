import { css, keyframes } from "hono/css";

const float = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-12px); }
`;

const shadowPulse = keyframes`
  0%, 100% { transform: scale(1); opacity: 0.24; }
  50% { transform: scale(0.84); opacity: 0.12; }
`;

const orangeArrival = keyframes`
  from {
    opacity: 0;
    transform: translateX(40%) scale(0.44);
  }
  to {
    opacity: 1;
    transform: translateX(0) scale(0.44);
  }
`;

const letterAppear = keyframes`
  from {
    opacity: 0;
    transform: translateY(16px) scale(0.76) rotate(0deg);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(0.74) rotate(-9deg);
  }
`;

const handoverClass = css`
  position: absolute;
  inset: 0;
  overflow: hidden;
  z-index: 25;
  pointer-events: none;

  .ghost-wrap {
    position: absolute;
    bottom: 2.4rem;
    transform-origin: bottom center;
  }

  .ghost-tilter {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .ghost-body {
    position: relative;
    width: 25rem;
    height: 30rem;
    animation: ${float} 3s ease-in-out infinite;
  }

  .ghost-part {
    position: absolute;
    object-fit: contain;
  }

  .ghost-body img[alt="body"] {
    width: 39%;
    bottom: 5%;
    left: 0;
    right: 0;
    margin: auto;
  }

  .ghost-body img[alt="head"] {
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

  .arm-right,
  .arm-left {
    width: 17%;
    top: 58%;
    z-index: 20;
    transform-origin: top center;
    transition: transform 0.45s ease;
  }

  .arm-right {
    left: 9%;
  }

  .arm-left {
    right: 9%;
  }

  .cheek {
    position: absolute;
    top: 41%;
    width: 3.2rem;
    height: 1.3rem;
    border-radius: 9999px;
    background: #ffb6c1;
    filter: blur(5px);
    opacity: 0;
    transition: opacity 0.3s ease;
    z-index: 25;
  }

  .cheek-left {
    left: 31%;
  }

  .cheek-right {
    right: 28%;
  }

  .ghost-shadow {
    width: 16rem;
    height: 2rem;
    border-radius: 9999px;
    background: #6a7566;
    filter: blur(3px);
    animation: ${shadowPulse} 3s ease-in-out infinite;
  }

  .green-ghost {
    left: -48%;
    transform: scale(0.44);
    transition: left 2.6s linear;
  }

  .orange-ghost {
    right: 11%;
    opacity: 0;
    transform: translateX(40%) scale(0.44);
  }

  .letter-item {
    position: absolute;
    width: 14rem;
    top: 45%;
    right: -20%;
    opacity: 0;
    transform: translateY(18px) scale(0.8);
    z-index: 30;
  }

  &.is-active .green-ghost {
    left: 13%;
  }

  &.is-active .orange-ghost {
    animation: ${orangeArrival} 2.6s linear forwards;
  }

  &.is-active .green-arm-left {
    transform: rotate(-73deg) translate(10px, 22px);
    transition-delay: 2.6s;
    transition-duration: 0.8s;
    transition-timing-function: linear;
  }

  &.is-active .orange-arm-right {
    transform: rotate(58deg) translate(16px, -10px);
    transition-delay: 3.4s;
    transition-duration: 0.8s;
    transition-timing-function: linear;
  }

  &.is-active .orange-arm-left {
    transform: rotate(-58deg) translate(-16px, -10px);
    transition-delay: 3.4s;
    transition-duration: 0.8s;
    transition-timing-function: linear;
  }

  &.is-active .letter-item {
    animation: ${letterAppear} 0.8s linear 2.6s forwards;
  }

  &.is-active .orange-ghost .cheek {
    opacity: 0.78;
    transition-delay: 3.4s;
  }

  @media (max-width: 600px) {
    .ghost-wrap {
      bottom: 1.6rem;
    }

    .green-ghost {
      transform: scale(0.34);
    }

    .orange-ghost {
      right: 2%;
      transform: translateX(40%) scale(0.34);
    }

    &.is-active .green-ghost {
      left: -2%;
    }
  }
`;

type Props = {
  active: boolean;
};

export const TransferHandoverScene = ({ active }: Props) => {
  if (!active) {
    return null;
  }

  return (
    <div class={`${handoverClass} ${active ? "is-active" : ""}`} aria-hidden="true">
      <div class="ghost-wrap green-ghost">
        <div class="ghost-tilter">
          <div class="ghost-body">
            <img src="/images/home/body.svg" alt="body" class="ghost-part" />
            <img src="/images/home/head.svg" alt="head" class="ghost-part" />
            <img src="/images/home/right.svg" alt="" class="ghost-part arm-right green-arm-right" />
            <img src="/images/home/left.svg" alt="" class="ghost-part arm-left green-arm-left" />
            <img src="/images/home/right_eye.svg" alt="" class="ghost-part eye-right" />
            <img src="/images/home/left_eye.svg" alt="" class="ghost-part eye-left" />
            <img src="/images/correct/letter.svg" alt="letter" class="letter-item" />
          </div>
          <div class="ghost-shadow" />
        </div>
      </div>

      <div class="ghost-wrap orange-ghost">
        <div class="ghost-tilter">
          <div class="ghost-body">
            <img src="/images/correct/body2.svg" alt="body" class="ghost-part" />
            <img src="/images/home/head.svg" alt="head" class="ghost-part" />
            <img src="/images/correct/right2.svg" alt="" class="ghost-part arm-right orange-arm-right" />
            <img src="/images/correct/left2.svg" alt="" class="ghost-part arm-left orange-arm-left" />
            <img src="/images/home/right_eye.svg" alt="" class="ghost-part eye-right" />
            <img src="/images/home/left_eye.svg" alt="" class="ghost-part eye-left" />
            <div class="cheek cheek-left" />
            <div class="cheek cheek-right" />
          </div>
          <div class="ghost-shadow" />
        </div>
      </div>
    </div>
  );
};
