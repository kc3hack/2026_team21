import { css, keyframes } from "hono/css";
import { TrackVehicleParts } from "./TrackVehicleParts";

const wheelSpin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const bounce = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-3px); }
`;

const truckProgressClass = css`
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 12.5rem;
  z-index: 30;
  pointer-events: none;

  .progress-road {
    position: absolute;
    left: 0;
    bottom: 2.6rem;
    width: 100%;
    height: 0.65rem;
    background: repeating-linear-gradient(
      90deg,
      rgba(63, 81, 65, 0.3) 0 24px,
      rgba(63, 81, 65, 0.12) 24px 48px
    );
  }

  .truck-anchor {
    position: absolute;
    bottom: 2.2rem;
    transform: translateX(-50%) scale(0.52);
    transform-origin: bottom center;
    transition: left 0.25s linear;
  }

  .truck-anchor.is-exiting {
    left: 118% !important;
    transition: left 0.75s cubic-bezier(0.2, 0.9, 0.2, 1);
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
    left: 0;
  }

  .front-tire {
    width: 22%;
    bottom: 47%;
    right: 40%;
    transform: scale(5.5);
    transform-origin: center center;
  }

  .truck-anchor.is-active .track-wrapper {
    animation: ${bounce} 0.18s linear infinite;
  }

  .truck-anchor.is-active .tire {
    animation: ${wheelSpin} 0.32s linear infinite;
  }

  .progress-shell {
    position: absolute;
    left: 10%;
    right: 10%;
    bottom: 0.45rem;
    height: 1rem;
    border-radius: 9999px;
    overflow: hidden;
    border: 3px solid #5e7359;
    background: rgba(255, 255, 255, 0.88);
  }

  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #f6ad49 0%, #ffbf66 100%);
    transition: width 0.25s linear;
  }

  .progress-percent {
    position: absolute;
    right: 10%;
    bottom: 1.85rem;
    font-size: 0.95rem;
    font-weight: 900;
    color: #5e7359;
  }

  @media (max-width: 600px) {
    height: 9.8rem;

    .truck-anchor {
      bottom: 1.8rem;
      transform: translateX(-50%) scale(0.38);
    }

    .progress-shell {
      left: 8%;
      right: 8%;
      height: 0.85rem;
    }

    .progress-percent {
      right: 8%;
      bottom: 1.55rem;
      font-size: 0.82rem;
    }
  }
`;

type Props = {
  progressPercent: number;
  active: boolean;
  exiting?: boolean;
  showProgressBar?: boolean;
};

export const TransferTruckProgress = ({ progressPercent, active, exiting = false, showProgressBar = true }: Props) => {
  const clampedProgress = Math.max(0, Math.min(100, progressPercent));
  const laneProgress = 4 + clampedProgress * 0.86;
  const truckClass = `truck-anchor ${active ? "is-active" : ""} ${exiting ? "is-exiting" : ""}`;

  return (
    <div class={truckProgressClass} aria-hidden="true">
      <div class="progress-road" />

      <div class={truckClass} style={`left: ${laneProgress}%;`}>
        <div class="track-wrapper">
          <TrackVehicleParts />
        </div>
      </div>

      {showProgressBar && (
        <>
          <div class="progress-shell">
            <div class="progress-fill" style={`width: ${clampedProgress}%;`} />
          </div>
          <div class="progress-percent">{Math.round(clampedProgress)}%</div>
        </>
      )}
    </div>
  );
};
