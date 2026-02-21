// オレンジキャラのパーツ構成

export const OrangeGhostParts = () => {
  return (
    <>
      {/* 体はオレンジ専用 */}
      <img src="/images/correct/body2.svg" alt="body" class="ghost-part" />
      {/* 頭（顔の輪郭）は緑と共通 */}
      <img src="/images/home/head.svg" alt="head" class="ghost-part" />

      {/* 目は緑と共通 */}
      <img src="/images/home/right_eye.svg" class="ghost-part eye-right" alt="" />
      <img src="/images/home/left_eye.svg" class="ghost-part eye-left" alt="" />

      {/* 腕はオレンジ専用 */}
      <img id="orange-arm-right" src="/images/correct/right2.svg" class="ghost-part arm-right" alt="" />
      <img id="orange-arm-left" src="/images/correct/left2.svg" class="ghost-part arm-left" alt="" />

      {/* 喜ぶ時のチーク */}
      <div class="cheek cheek-left" />
      <div class="cheek cheek-right" />
    </>
  );
};
