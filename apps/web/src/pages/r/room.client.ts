// apps/web/src/pages/r/room.client.ts

document.addEventListener("DOMContentLoaded", () => {
  const ghostArea = document.getElementById("ghost-area");
  const ghostTilter = document.getElementById("ghost-tilter");
  const ghostBody = document.getElementById("ghost-character");
  const eyeRight = document.getElementById("ghost-eye-right") as HTMLImageElement;
  const eyeLeft = document.getElementById("ghost-eye-left") as HTMLImageElement;
  const armRight = document.getElementById("ghost-arm-right");
  const armLeft = document.getElementById("ghost-arm-left");
  const statusBtn = document.getElementById("matching-status-btn");
  const statusBtnArea = document.getElementById("status-btn-area");
  const uploadForm = document.getElementById("upload-form");

  const zzzEffect = document.getElementById('zzz-effect');

  const playNotice = () => {
    ghostBody?.classList.remove("is-noticing");
    void ghostBody?.offsetWidth;
    ghostBody?.classList.add("is-noticing");
  };

  const handleMouseMove = (e: MouseEvent) => {
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
    const transformStyle = `translate(${moveX}px, ${moveY}px)`;

    eyeRight.style.transform = transformStyle;
    eyeLeft.style.transform = transformStyle;
  };

  setTimeout(() => {
    if (zzzEffect) {
      zzzEffect.style.opacity = '0';
      setTimeout(() => {
        zzzEffect.style.display = 'none';
      }, 300);
    }
  }, 2700);


  setTimeout(() => {
    if (statusBtn) statusBtn.textContent = "マッチング成功";
    if (eyeRight && eyeLeft) {
      eyeRight.src = "/images/room/right_sleep.svg";
      eyeLeft.src = "/images/room/wakeup.svg";
    }
    playNotice();

    setTimeout(() => {
      if (statusBtnArea) {
        statusBtnArea.style.opacity = "0";
        statusBtnArea.style.pointerEvents = "none";

        setTimeout(() => {
          statusBtnArea.style.visibility = "hidden";
        }, 300);
      }

      ghostArea?.classList.add("is-moved-left");
      ghostTilter?.classList.add("is-tilting");
      armRight?.classList.add("is-arms-back");
      armLeft?.classList.add("is-arms-back");

      setTimeout(() => {
        ghostTilter?.classList.remove("is-tilting");
        armRight?.classList.remove("is-arms-back");
        armLeft?.classList.remove("is-arms-back");

        uploadForm?.classList.add("is-visible");

        setTimeout(() => {
          if (eyeLeft && eyeRight) {
            eyeLeft.src = "/images/home/left_eye.svg";
            eyeRight.src = "/images/home/right_eye.svg";
          }

          armLeft?.classList.add("is-presenting-left");

          eyeRight?.classList.add("is-looking-right");
          eyeLeft?.classList.add("is-looking-right");

          const onFirstMouseMove = (e: MouseEvent) => {
            eyeRight?.classList.remove("is-looking-right");
            eyeLeft?.classList.remove("is-looking-right");
            document.removeEventListener("mousemove", onFirstMouseMove);
            document.addEventListener("mousemove", handleMouseMove);
            handleMouseMove(e);
          };
          document.addEventListener("mousemove", onFirstMouseMove);
        }, 2000);
      }, 800);
    }, 1500);
  }, 3000);
});
