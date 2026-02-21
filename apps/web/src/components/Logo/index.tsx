import { css } from "hono/css";

export const LogoIcon = () => {
  // コンポーネント固有のスタイル定義
  const logoAreaClass = css`
    display: flex;
    justify-content: center;
    /* デフォルト（PC）の余白 */
    margin-top: 2rem;
    transition: margin-top 0.3s ease;

    @media (max-width: 600px) {
      /* スマホでは画面上端に寄せる */
      margin-top: 0.5rem;
    }
  `;

  const logoImgClass = css`
    height: 9rem;
    width: auto;
    object-fit: contain;
    transition: height 0.3s ease;

    @media (max-width: 600px) {
      /* スマホではロゴを小さくする */
      height: 5rem;
    }
  `;

  return (
    <div class={logoAreaClass}>
      <img src="/images/logo.PNG" alt="Gost" class={logoImgClass} />
    </div>
  );
};
