export const GhostCharacter = () => {
  return (
    <div class="ghost-tilter">
      <div class="ghost-body" id="ghost-character">
        <div class="exclamation-mark">!</div>

        <img src="/images/home/body.svg" alt="body" class="ghost-part" />
        <img src="/images/home/head.svg" alt="head" class="ghost-part" />

        <img id="ghost-arm-right" src="/images/home/right.svg" alt="right" class="ghost-part" />
        <img id="ghost-arm-left" src="/images/home/left.svg" alt="left" class="ghost-part" />

        <div class="cheek cheek-left" />
        <div class="cheek cheek-right" />

        <img id="ghost-eye-right" src="/images/home/right_eye.svg" alt="right_eye" class="ghost-part ghost-eye" />
        <img id="ghost-eye-left" src="/images/home/left_eye.svg" alt="left_eye" class="ghost-part ghost-eye" />
      </div>
      <div class="ghost-shadow" />
    </div>
  );
};

export const GhostWithArea = () => {
  return (
    <div class="ghost-area">
      <GhostCharacter />
    </div>
  );
};
