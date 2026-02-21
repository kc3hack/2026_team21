// apps/web/src/components/animations/EyeTracker.tsx
import { useEffect } from "hono/jsx";

type Props = {
  bodyId: string;
};

export const EyeTracker = ({ bodyId }: Props) => {
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const ghostBody = document.getElementById(bodyId);
      // GhostParts.tsx で定義されている ID を取得
      const eyeRight = document.getElementById("ghost-eye-right");
      const eyeLeft = document.getElementById("ghost-eye-left");

      if (!ghostBody || !eyeRight || !eyeLeft) return;

      const rect = ghostBody.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const deltaX = e.clientX - centerX;
      const deltaY = e.clientY - centerY;
      const angle = Math.atan2(deltaY, deltaX);

      // 目の可動範囲の計算
      const maxDistance = 12;
      const distance = Math.min(maxDistance, Math.sqrt(deltaX ** 2 + deltaY ** 2) / 15);

      const moveX = Math.cos(angle) * distance;
      const moveY = Math.sin(angle) * distance;

      // 直接スタイルを更新して追従させる
      eyeRight.style.transform = `translate(${moveX}px, ${moveY}px)`;
      eyeLeft.style.transform = `translate(${moveX}px, ${moveY}px)`;
    };

    document.addEventListener("mousemove", handleMouseMove);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, [bodyId]);

  return null;
};
