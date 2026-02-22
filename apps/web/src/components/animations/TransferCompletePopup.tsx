import { css, keyframes } from "hono/css";

const popIn = keyframes`
  0% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.84);
  }
  100% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
`;

const popupClass = css`
  position: fixed;
  inset: 0;
  z-index: 10000;
  background: rgba(47, 58, 45, 0.35);

  .popup-card {
    position: absolute;
    top: 50%;
    left: 50%;
    width: min(90vw, 28rem);
    padding: 1.7rem 1.5rem;
    border-radius: 22px;
    background: #fff;
    border: 5px solid #f6ad49;
    box-shadow: 0 20px 42px rgba(0, 0, 0, 0.22);
    transform: translate(-50%, -50%);
    animation: ${popIn} 0.28s cubic-bezier(0.18, 0.9, 0.32, 1) both;
    text-align: center;
  }

  .popup-title {
    margin: 0;
    color: #5e7359;
    font-size: 1.4rem;
    font-weight: 900;
  }

  .popup-message {
    margin: 0.85rem 0 0;
    color: #344031;
    font-size: 1.02rem;
    font-weight: 700;
    line-height: 1.6;
  }

  .popup-invite {
    margin: 0.8rem 0 0;
    color: #f6ad49;
    font-size: 0.96rem;
    font-weight: 900;
    line-height: 1.45;
  }

  .popup-ok {
    margin-top: 1.25rem;
    border: none;
    border-radius: 9999px;
    background: #758e6f;
    color: #fff;
    font-size: 1rem;
    font-weight: 900;
    padding: 0.76rem 2.35rem;
    cursor: pointer;
    transition: transform 0.1s ease, background 0.2s ease;
  }

  .popup-ok:hover {
    background: #5e7359;
  }

  .popup-ok:active {
    transform: scale(0.97);
  }

  .popup-actions {
    margin-top: 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    width: 100%;
  }

  .popup-action-btn {
    border: none;
    border-radius: 9999px;
    color: #fff;
    font-size: 0.98rem;
    font-weight: 900;
    padding: 0.76rem 1.5rem;
    cursor: pointer;
    transition: transform 0.1s ease, background 0.2s ease;
    width: 100%;
  }

  .popup-action-btn.primary {
    background: #f6ad49;
  }

  .popup-action-btn.primary:hover {
    background: #e59a38;
  }

  .popup-action-btn.secondary {
    background: #758e6f;
  }

  .popup-action-btn.secondary:hover {
    background: #5e7359;
  }

  .popup-action-btn.tertiary {
    background: #9ba89a;
  }

  .popup-action-btn.tertiary:hover {
    background: #7d8a7c;
  }

  .popup-action-btn:active {
    transform: scale(0.97);
  }

  @media (max-width: 600px) {
    .popup-card {
      width: min(92vw, 22rem);
      padding: 1.4rem 1.2rem;
    }

    .popup-title {
      font-size: 1.2rem;
    }

    .popup-message {
      font-size: 0.96rem;
    }

    .popup-action-btn {
      font-size: 0.92rem;
      padding: 0.68rem 1.2rem;
    }
  }
`;

type ActionButton = {
  label: string;
  onClick: () => void;
  variant: "primary" | "secondary" | "tertiary";
};

type Props = {
  open: boolean;
  title: string;
  message: string;
  onOk?: () => void;
  showInviteText?: boolean;
  actions?: ActionButton[];
};

export const TransferCompletePopup = ({ open, title, message, onOk, showInviteText = false, actions }: Props) => {
  if (!open) {
    return null;
  }

  return (
    <div class={popupClass}>
      <div class="popup-card" role="dialog" aria-modal="true">
        <h2 class="popup-title">{title}</h2>
        <p class="popup-message">{message}</p>
        {showInviteText && <p class="popup-invite">あなたもこのアプリを使ってみませんか</p>}
        {actions && actions.length > 0 ? (
          <div class="popup-actions">
            {actions.map((action) => (
              <button
                type="button"
                class={`popup-action-btn ${action.variant}`}
                onClick={action.onClick}
                key={action.label}
              >
                {action.label}
              </button>
            ))}
          </div>
        ) : (
          onOk && (
            <button type="button" class="popup-ok" onClick={onOk}>
              OK
            </button>
          )
        )}
      </div>
    </div>
  );
};
