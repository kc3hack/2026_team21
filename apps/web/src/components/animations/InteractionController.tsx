import { useEffect } from "hono/jsx";

type Props = {
  bodyId: string;
};

export const InteractionController = ({ bodyId }: Props) => {
  useEffect(() => {
    const ghostBody = document.getElementById(bodyId);
    const armRight = document.getElementById("ghost-arm-right");
    const armLeft = document.getElementById("ghost-arm-left");

    const handleGhostClick = () => {
      if (!ghostBody || ghostBody.classList.contains("is-blushing")) return;

      // クラスを付与してアニメーション開始
      ghostBody.classList.add("is-blushing");
      armRight?.classList.add("is-waving-right");
      armLeft?.classList.add("is-waving-left");

      // 1.2秒後に元に戻す
      setTimeout(() => {
        ghostBody.classList.remove("is-blushing");
        armRight?.classList.remove("is-waving-right");
        armLeft?.classList.remove("is-waving-left");
      }, 1200);
    };

    ghostBody?.addEventListener("click", handleGhostClick);
    return () => {
      ghostBody?.removeEventListener("click", handleGhostClick);
    };
  }, [bodyId]);

  return null;
};
