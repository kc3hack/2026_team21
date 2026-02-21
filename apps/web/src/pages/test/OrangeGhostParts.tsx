// apps/web/src/pages/test/OrangeGhostParts.tsx

export const OrangeGhostParts = () => {
  return (
    <>
      <img src="/images/correct/body2.svg" alt="body" class="ghost-part" />
      <img src="/images/home/head.svg" alt="head" class="ghost-part" />

      {/* IDを追加: EyeTracker用 */}
      <img id="ghost-eye-right" src="/images/home/right_eye.svg" class="ghost-part eye-right ghost-eye" alt="" />
      <img id="ghost-eye-left" src="/images/home/left_eye.svg" class="ghost-part eye-left ghost-eye" alt="" />

      {/* IDを変更: InteractionController用 (緑と共通のIDにする) */}
      <img id="ghost-arm-right" src="/images/correct/right2.svg" class="ghost-part arm-right" alt="" />
      <img id="ghost-arm-left" src="/images/correct/left2.svg" class="ghost-part arm-left" alt="" />

      <div class="cheek cheek-left" />
      <div class="cheek cheek-right" />
    </>
  );
};
