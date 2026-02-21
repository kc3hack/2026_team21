import { GreenButton } from "@/components/button";
import { ButtonList } from "@/components/button/list";
import { GhostWithArea } from "@/components/ghost";
import { LogoIcon } from "@/components/Logo";

export const HomePage = () => {
  return (
    <main class="home-container">
      <LogoIcon />

      {/* キャラクター パーツ */}
      <GhostWithArea />

      {/* ボタンエリア */}
      <ButtonList>
        <GreenButton text="ルームを作成" />
      </ButtonList>

      {/* Viteの機能を使ってTSファイルを直接ブラウザで読み込む */}
      <script type="module" src="/src/pages/home.client.ts"></script>
    </main>
  );
};
