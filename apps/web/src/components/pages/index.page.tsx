import { useEffect, useState } from "hono/jsx";
import { GreenButton } from "@/components/button";
import { ButtonList } from "@/components/button/list";
import { GhostWithArea } from "@/components/ghost";
import { LogoIcon } from "@/components/Logo";

export const HomePage = () => {
  const [isHappy, setIsHappy] = useState(false);

  useEffect(() => {
    const ghostBody = document.getElementById("ghost-character");
    const eyeRight = document.getElementById("ghost-eye-right");
    const eyeLeft = document.getElementById("ghost-eye-left");
    const armRight = document.getElementById("ghost-arm-right");
    const armLeft = document.getElementById("ghost-arm-left");
    const createRoomBtn = document.getElementById("create-room-btn");

    const playNotice = () => {
      ghostBody?.classList.remove("is-noticing");
      void ghostBody?.offsetWidth;
      ghostBody?.classList.add("is-noticing");
    };

    playNotice();

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

      eyeRight.style.transform = `translate(${moveX}px, ${moveY}px)`;
      eyeLeft.style.transform = `translate(${moveX}px, ${moveY}px)`;
    };

    document.addEventListener("mousemove", handleMouseMove);

    const handleGhostClick = () => {
      if (isHappy) return;
      setIsHappy(true);
      ghostBody?.classList.add("is-blushing");
      armRight?.classList.add("is-waving-right");
      armLeft?.classList.add("is-waving-left");

      setTimeout(() => {
        ghostBody?.classList.remove("is-blushing");
        armRight?.classList.remove("is-waving-right");
        armLeft?.classList.remove("is-waving-left");
        setIsHappy(false);
      }, 1200);
    };

    ghostBody?.addEventListener("click", handleGhostClick);

    const handleCreateRoom = () => {
      void (async () => {
        const response = await fetch("/api/rooms", { method: "POST" });
        if (!response.ok) {
          throw new Error(`Failed to create room: ${response.status}`);
        }

        const payload = (await response.json()) as { id?: unknown };
        if (typeof payload.id !== "string" || payload.id.length === 0) {
          throw new Error("Invalid room id response");
        }

        window.location.href = `/r/${encodeURIComponent(payload.id)}`;
      })().catch((error) => {
        console.error(error);
      });
    };

    createRoomBtn?.addEventListener("click", handleCreateRoom);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      ghostBody?.removeEventListener("click", handleGhostClick);
      createRoomBtn?.removeEventListener("click", handleCreateRoom);
    };
  }, [isHappy]);

  return (
    <main class="home-container">
      <LogoIcon />

      {/* キャラクター パーツ */}
      <GhostWithArea />

      {/* ボタンエリア */}
      <ButtonList>
        <GreenButton text="ルームを作成" />
      </ButtonList>
    </main>
  );
};
