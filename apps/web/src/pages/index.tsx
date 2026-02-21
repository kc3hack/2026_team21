import { Hono } from "hono";
import { Layout } from "@/pages/layout";
import { renderer } from "@/pages/renderer";
import { RoomPage } from "@/pages/room";

const app = new Hono();

app.use(renderer);

app.get("/", (c) => {
  return c.render(
    <Layout>
      <main class="home-container">

        <div class="logo-area">
          <img src="/images/logo.PNG" alt="Gost" class="logo-img" />
        </div>

        {/* キャラクター パーツ */}
        <div class="ghost-area">
          <div class="ghost-body" id="ghost-character">

          <div class="exclamation-mark">!</div>
            
            {/* SVGパーツ群 */}
            <img src="/images/home/body.svg" alt="body" class="ghost-part" />
            <img src="/images/home/head.svg" alt="head" class="ghost-part" />
            
            {/* 腕パーツ アニメーション用にIDを付与*/}
            <img id="ghost-arm-right" src="/images/home/right.svg" alt="right" class="ghost-part" />
            <img id="ghost-arm-left" src="/images/home/left.svg" alt="left" class="ghost-part" />

            {/* クリックアニメーション時のやつ */}
            <div class="cheek cheek-left"></div>
            <div class="cheek cheek-right"></div>

            {/* 目パーツ */}
            <img id="ghost-eye-right" src="/images/home/right_eye.svg" alt="right_eye" class="ghost-part ghost-eye" />
            <img id="ghost-eye-left" src="/images/home/left_eye.svg" alt="left_eye" class="ghost-part ghost-eye" />
          </div>

          <div class="ghost-shadow"></div>
        </div>

        {/* ボタン */}
        <div class="btn-area">
          <button type="button" id="create-room-btn" class="create-btn">
            ROOM 作成
          </button>
        </div>
        
        {/* インタラクション */}
        <script dangerouslySetInnerHTML={{ __html: `
          document.addEventListener("DOMContentLoaded", () => {
            const ghostBody = document.getElementById('ghost-character');
            const eyeRight = document.getElementById('ghost-eye-right');
            const eyeLeft = document.getElementById('ghost-eye-left');
            const armRight = document.getElementById('ghost-arm-right');
            const armLeft = document.getElementById('ghost-arm-left');
            const btn = document.getElementById('create-room-btn');

            const playNotice = () => {
              ghostBody.classList.remove('is-noticing');
              void ghostBody.offsetWidth; // アニメーションをリセット
              ghostBody.classList.add('is-noticing');
            };

            playNotice();

            //視線追従
            document.addEventListener('mousemove', (e) => {
              if (!ghostBody || !eyeRight || !eyeLeft) return;
              const rect = ghostBody.getBoundingClientRect();
              const centerX = rect.left + rect.width / 2;
              const centerY = rect.top + rect.height / 2;
              const deltaX = e.clientX - centerX;
              const deltaY = e.clientY - centerY;
              const angle = Math.atan2(deltaY, deltaX);
              const maxDistance = 12; 
              const distance = Math.min(maxDistance, Math.sqrt(deltaX**2 + deltaY**2) / 15);
              const moveX = Math.cos(angle) * distance;
              const moveY = Math.sin(angle) * distance;
              const transformStyle = \`translate(\${moveX}px, \${moveY}px)\`;
              eyeRight.style.transform = transformStyle;
              eyeLeft.style.transform = transformStyle;
            });

            let isHappy = false;
            ghostBody.addEventListener('click', () => {
              if (isHappy) return; // 連打防止
              isHappy = true;

              ghostBody.classList.add('is-blushing');
              armRight.classList.add('is-waving-right');
              armLeft.classList.add('is-waving-left');

              // 約1.2秒後に赤面と腕振りを元に戻す
              setTimeout(() => {
                ghostBody.classList.remove('is-blushing');
                armRight.classList.remove('is-waving-right');
                armLeft.classList.remove('is-waving-left');
                isHappy = false;
              }, 1200);
            });

            let isWaiting = false;
            btn.addEventListener('click', () => {
              if (isWaiting) return; // 連打防止
              isWaiting = true;

              // ボタンの文字を変える
              btn.textContent = '待機中...';

              // ボタンを押した瞬間に！を出す
              playNotice();
            });
            
          });
        `}} />

      </main>
    </Layout>
  );
});

app.route("/room", RoomPage);

export default app;
