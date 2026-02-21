import { Hono } from "hono";
import { GhostMoveTest } from "./GhostMoveTest";
import { HandoverTest } from "./HandoverTest";
import { Layout } from "./layout";
import { TrackMoveTest } from "./TrackMoveTest";
import { TransitionDestinationTest } from "./TransitionDestinationTest";

const app = new Hono();

// 【/test】遷移元（緑のお化けが走り去る画面）
app.get("/", (c) => {
  return c.render(
    <Layout>
      <GhostMoveTest />
      {/* 開発中に他のテストも同時に見たい場合は以下も並べる */}
      <TrackMoveTest />
      <HandoverTest />
    </Layout>,
  );
});

// 【/test/test2】遷移先（オレンジのお化けが駆け込んでくる画面）
app.get("/test2", (c) => {
  return c.render(
    <Layout>
      <TransitionDestinationTest />
    </Layout>,
  );
});

export const AnimationTestPage = app;
