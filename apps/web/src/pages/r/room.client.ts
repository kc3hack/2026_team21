// apps/web/src/pages/r/room.client.ts
import { createQRCode } from "../../lib/qrcode/index";

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

  const zzzEffect = document.getElementById("zzz-effect");
  const qrContainer = document.getElementById("qr-container");
  const qrImageCanvas = document.getElementById("qr-image-canvas");
  const mockMatchBtn = document.getElementById("mock-match-btn");

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

  // === 1. ページ読み込み時の処理（QRコードの生成と表示） ===
  const roomUrl = window.location.href; // 現在のルームURLを取得
  const qrCode = createQRCode(roomUrl);
  if (qrImageCanvas) {
    qrCode.append(qrImageCanvas);
  }

  // 画面を開いて0.5秒後に、QRコードをフワッと下からスライドインさせる
  setTimeout(() => {
    qrContainer?.classList.add("is-visible");
  }, 500);

  // === 2. マッチング成功時の処理（自動ではなく、QRが読まれた時に発火する） ===
  // === 2. マッチング成功時の処理（テストボタンを押した時） ===
  const onMatchSuccess = () => {
    // 1. まずQRコードを下にスライドして隠す
    qrContainer?.classList.remove("is-visible");

    // 2. 【2秒経過】QRが消えてから2秒後に目を覚ます！
    setTimeout(() => {
      // zzzエフェクトを即座に消す
      if (zzzEffect) {
        zzzEffect.style.opacity = "0";
        setTimeout(() => {
          zzzEffect.style.display = "none";
        }, 300);
      }

      // ビックリして起きるモーション
      if (statusBtn) statusBtn.textContent = "マッチング成功";
      if (eyeRight && eyeLeft) {
        eyeRight.src = "/images/home/right_eye.svg"; // 右目はパッチリ開ける
        eyeLeft.src = "/images/room/wakeup.svg"; // 左目はビックリ目
      }
      playNotice();

      // その後のスライド移動とフォーム表示モーション
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
    }, 2000); // ← ここが「QRが消えてから目を覚ますまでの2秒間」の待機設定です
  };

  // テストボタンを押したときにマッチング成功処理を実行！
  mockMatchBtn?.addEventListener("click", onMatchSuccess);
});
