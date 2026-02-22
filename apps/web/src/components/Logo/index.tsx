import { css } from "hono/css";

export const LogoIcon = () => {
  const logoAreaClass = css`
    display: flex;
    justify-content: center;
    width: 100%;
    margin-top: clamp(0.55rem, 2.2vw, 1.6rem);
    transition: margin-top 0.3s ease;

    @media (max-width: 640px) {
      margin-top: 0.5rem;
    }
  `;

  const logoImgClass = css`
    height: clamp(4.2rem, 14vw, 8.2rem);
    width: auto;
    max-width: min(88vw, 24rem);
    object-fit: contain;
    transition: height 0.3s ease;
  `;

  return (
    <div class={logoAreaClass}>
      <img src="/images/logo.PNG" alt="Gost" class={logoImgClass} />
    </div>
  );
};
