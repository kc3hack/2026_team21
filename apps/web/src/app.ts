// TODO: 後で new Hono しているところを new Hono<WorkerEnv>() にする。
// 現時点で Worker の Bindigns を利用するハンドラーがないが、
// 将来的に利用するだろうから Hono インスタンスの作成は Factory パターンにしておきたい。
export type WorkerEnv = {
  Env: Cloudflare.Env;
  Bindings: CloudflareBindings;
};
