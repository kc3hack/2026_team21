document.addEventListener("DOMContentLoaded", () => {
  const ghostBody = document.getElementById("ghost-character");
  const eyeRight = document.getElementById("ghost-eye-right");
  const eyeLeft = document.getElementById("ghost-eye-left");
  const armRight = document.getElementById("ghost-arm-right");
  const armLeft = document.getElementById("ghost-arm-left");
  const btn = document.getElementById("create-room-btn");
  const qrContainer = document.getElementById("qr-container");

  const playNotice = () => {
    ghostBody?.classList.remove("is-noticing");
    void ghostBody?.offsetWidth;
    ghostBody?.classList.add("is-noticing");
  };

  playNotice();

  document.addEventListener("mousemove", (e) => {
    if (!ghostBody || !eyeRight || !eyeLeft) return;
    const rect = ghostBody.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const deltaX = e.clientX - centerX;
    const deltaY = e.clientY - centerY;
    const angle = Math.atan2(deltaY, deltaX);
    const maxDistance = 12;
    const distance = Math.min(maxDistance, Math.sqrt(deltaX ** 2 + deltaY ** 2) / 15);
    const moveX = Math.cos(angle) * distance;
    const moveY = Math.sin(angle) * distance;

    eyeRight.style.transform = `translate(${moveX}px, ${moveY}px)`;
    eyeLeft.style.transform = `translate(${moveX}px, ${moveY}px)`;
  });

  let isHappy = false;
  ghostBody?.addEventListener("click", () => {
    if (isHappy) return;
    isHappy = true;
    ghostBody.classList.add("is-blushing");
    armRight?.classList.add("is-waving-right");
    armLeft?.classList.add("is-waving-left");

    setTimeout(() => {
      ghostBody.classList.remove("is-blushing");
      armRight?.classList.remove("is-waving-right");
      armLeft?.classList.remove("is-waving-left");
      isHappy = false;
    }, 1200);
  });

  let isWaiting = false;
  btn?.addEventListener("click", () => {
    if (isWaiting) return;
    isWaiting = true;
    btn.textContent = "待機中...";
    playNotice();
    qrContainer?.classList.add("is-visible");
  });
});
