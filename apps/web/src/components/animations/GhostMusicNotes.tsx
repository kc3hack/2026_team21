import { css, keyframes } from "hono/css";

const floatAndFade = keyframes`
  0% {
    opacity: 0;
    transform: translateY(0) scale(0.8) rotate(-10deg);
  }
  6% {
    opacity: 1;
    transform: translateY(-20px) scale(1) rotate(0deg);
  }
  12% {
    opacity: 0;
    transform: translateY(-55px) scale(1.1) rotate(8deg);
  }
  100% {
    opacity: 0;
    transform: translateY(-55px) scale(1.1) rotate(8deg);
  }
`;

const notesClass = css`
  position: absolute;
  top: 32%;
  left: 4%;
  z-index: 60;
  pointer-events: none;

  .note {
    position: absolute;
    font-size: 1.8rem;
    color: #5e7359;
    opacity: 0;
    text-shadow: 0 4px 12px rgba(94, 115, 89, 0.24);
    animation: ${floatAndFade} 10s linear infinite;
  }

  .note-1 {
    left: 0;
    animation-delay: 0s;
  }

  .note-2 {
    left: 1.7rem;
    top: 0.7rem;
    animation-delay: 0.6s;
  }

  .note-3 {
    left: 3.2rem;
    top: -0.1rem;
    animation-delay: 1.2s;
  }
`;

type Props = {
  visible?: boolean;
};

export const GhostMusicNotes = ({ visible = true }: Props) => {
  if (!visible) {
    return null;
  }

  return (
    <div class={notesClass} aria-hidden="true">
      <span class="note note-1">♪</span>
      <span class="note note-2">♬</span>
      <span class="note note-3">♫</span>
    </div>
  );
};
