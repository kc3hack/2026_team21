// 緑キャラのパーツ構成

export const GhostParts = () => {
  return (
    <>
      <img src="/images/home/body.svg" alt="body" class="ghost-part" />
      <img src="/images/home/head.svg" alt="head" class="ghost-part" />

      <img id="ghost-arm-right" src="/images/home/right.svg" alt="right" class="ghost-part arm-right" />
      <img id="ghost-arm-left" src="/images/home/left.svg" alt="left" class="ghost-part arm-left" />

      <div class="cheek cheek-left" />
      <div class="cheek cheek-right" />

      <img id="ghost-eye-right" src="/images/home/right_eye.svg" alt="right_eye" class="ghost-part ghost-eye eye-right" />
      <img id="ghost-eye-left" src="/images/home/left_eye.svg" alt="left_eye" class="ghost-part ghost-eye eye-left" />
    </>
  );
};
