import { useEffect, useRef, useState } from "hono/jsx";

export const RoomClient = ({ currentPath }: { currentPath: string }) => {
  // 状態管理
    const [statusText, setStatusText] = useState("待機中...");
    const [isStatusVisible, setIsStatusVisible] = useState(true);

    // 目のパーツ管理
    const [eyeRightSrc, setEyeRightSrc] = useState("/images/room/right.svg");
    const [eyeLeftSrc, setEyeLeftSrc] = useState("/images/room/left.svg");

    // アニメーション用のクラス管理
    const [isNoticing, setIsNoticing] = useState(false);
    const [isMovedLeft, setIsMovedLeft] = useState(false);
    const [isTilting, setIsTilting] = useState(false);
    const [isArmsBack, setIsArmsBack] = useState(false);
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [isPresentingLeft, setIsPresentingLeft] = useState(false);
    const [isLookingRight, setIsLookingRight] = useState(false);

    // マウス追従用
    const [eyeTransform, setEyeTransform] = useState("translate(0px, 0px)");
    const ghostRef = useRef<HTMLDivElement>(null);

    // びっくりエフェクト再生
    const playNotice = () => {
        setIsNoticing(false);
        setTimeout(() => setIsNoticing(true), 10);
    };

    // シーケンス制御
    useEffect(() => {
        // マウス追従の関数
        const handleMouseMove = (e: MouseEvent) => {
        if (!ghostRef.current) return;
        const rect = ghostRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const deltaX = e.clientX - centerX;
        const deltaY = e.clientY - centerY;
        const angle = Math.atan2(deltaY, deltaX);
        const maxDistance = 12;
        const distance = Math.min(maxDistance, Math.sqrt(deltaX ** 2 + deltaY ** 2) / 15);
        const moveX = Math.cos(angle) * distance;
        const moveY = Math.sin(angle) * distance;
        setEyeTransform(`translate(${moveX}px, ${moveY}px)`);
        };

        // マッチングアニメーションのシーケンス
        const timer = setTimeout(() => {
        setStatusText("マッチング成功");
        setEyeRightSrc("/images/room/right.svg");
        setEyeLeftSrc("/images/room/wakeup.svg");
        playNotice();

        setTimeout(() => {
            setIsStatusVisible(false);
            setIsMovedLeft(true);
            setIsTilting(true);
            setIsArmsBack(true);

            setTimeout(() => {
            setIsTilting(false);
            setIsArmsBack(false);
            setIsFormVisible(true);

            setTimeout(() => {
                setEyeLeftSrc("/images/home/left_eye.svg");
                setEyeRightSrc("/images/home/right_eye.svg");
                setIsPresentingLeft(true);
                setIsLookingRight(true);

                const onFirstMouseMove = (e: MouseEvent) => {
                setIsLookingRight(false);
                document.removeEventListener("mousemove", onFirstMouseMove);
                document.addEventListener("mousemove", handleMouseMove);
                handleMouseMove(e);
                };
                document.addEventListener("mousemove", onFirstMouseMove);
            }, 2000);
            }, 800);
        }, 1500);
        }, 3000);

        return () => clearTimeout(timer);
    }, []);

    return (
        <main class="home-container">
        <div class="logo-area">
            {/* biome-ignore lint/performance/noImgElement: Hono does not use Next.js Image */}
            <img src="/images/logo.PNG" alt="Gost" class="logo-img" />
        </div>

        {/* キャラクター パーツ */}
        <div class={`ghost-area ${isMovedLeft ? "is-moved-left" : ""}`}>
            <div class={`ghost-tilter ${isTilting ? "is-tilting" : ""}`}>
            <div class={`ghost-body ${isNoticing ? "is-noticing" : ""}`} ref={ghostRef}>
                <div class="exclamation-mark">!</div>

                {/* biome-ignore lint/performance/noImgElement: Hono does not use Next.js Image */}
                <img src="/images/home/body.svg" alt="body" class="ghost-part" />
                {/* biome-ignore lint/performance/noImgElement: Hono does not use Next.js Image */}
                <img src="/images/home/head.svg" alt="head" class="ghost-part" />
                
                {/* 腕パーツ */}
                {/* biome-ignore lint/performance/noImgElement: Hono does not use Next.js Image */}
                <img src="/images/home/right.svg" alt="right" class={`ghost-part ${isArmsBack ? "is-arms-back" : ""}`} />
                {/* biome-ignore lint/performance/noImgElement: Hono does not use Next.js Image */}
                <img src="/images/home/left.svg" alt="left" class={`ghost-part ${isArmsBack ? "is-arms-back" : ""} ${isPresentingLeft ? "is-presenting-left" : ""}`} />

                <div class="cheek cheek-left" />
                <div class="cheek cheek-right" />

                {/* 目パーツ */}
                {/* biome-ignore lint/performance/noImgElement: Hono does not use Next.js Image */}
                <img src={eyeRightSrc} alt="right_eye" class={`ghost-part ghost-eye ${isLookingRight ? "is-looking-right" : ""}`} style={{ transform: eyeTransform }} />
                {/* biome-ignore lint/performance/noImgElement: Hono does not use Next.js Image */}
                <img src={eyeLeftSrc} alt="left_eye" class={`ghost-part ghost-eye ${isLookingRight ? "is-looking-right" : ""}`} style={{ transform: eyeTransform }} />
            </div>
            <div class="ghost-shadow" />
            </div>
        </div>

        {/* 状態表示テキスト */}
        <div class="btn-area" style={`transition: opacity 0.3s ease; opacity: ${isStatusVisible ? 1 : 0};`}>
            <button type="button" class="create-btn" style="cursor: default;">
            {statusText}
            </button>
        </div>

        {/* ファイルアップロードフォーム */}
        <div class={`upload-form-area ${isFormVisible ? "is-visible" : ""}`}>
            <h2 style="color: #5E7359; margin-top: 0;">ファイルを送信</h2>
            <form action={currentPath} method="post" encType="multipart/form-data" style="width: 100%; display: flex; flex-direction: column; align-items: center; gap: 1rem;">
            <input type="file" name="file" id="file" class="file-input-box" />
            <input type="hidden" name="back_to" value={currentPath} />
            <button type="submit" class="create-btn" style="padding: 1rem 3rem; font-size: 1.25rem;">アップロード</button>
            </form>
        </div>
        </main>
    );
};
