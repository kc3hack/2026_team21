import { useState } from "hono/jsx";

export const CounterPage = () => {
  const [count, setCount] = useState(0);

  return (
    <main style="min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
      <div style="background: white; border-radius: 16px; box-shadow: 0 10px 40px rgba(0,0,0,0.2); padding: 2rem; max-width: 600px; width: 90%;">
        <h1 style="text-align: center; color: #333; margin-bottom: 1.5rem;">🎯 Hono JSX Client Component Demo</h1>

        <div style="padding: 2rem; text-align: center;">
          <h2 style="color: #5E7359; margin-bottom: 1rem;">Hono JSX Client Component Sample</h2>
          <div style="background: #f0f4f0; border-radius: 8px; padding: 2rem; margin: 1rem auto; max-width: 400px;">
            <p style="font-size: 3rem; margin: 1rem 0; font-weight: bold; color: #333;">{count}</p>
            <div style="display: flex; gap: 1rem; justify-content: center;">
              <button
                type="button"
                onClick={() => setCount(count - 1)}
                style="padding: 0.75rem 1.5rem; font-size: 1.25rem; background: #ff6b6b; color: white; border: none; border-radius: 4px; cursor: pointer;"
              >
                -
              </button>
              <button
                type="button"
                onClick={() => setCount(0)}
                style="padding: 0.75rem 1.5rem; font-size: 1.25rem; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer;"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => setCount(count + 1)}
                style="padding: 0.75rem 1.5rem; font-size: 1.25rem; background: #51cf66; color: white; border: none; border-radius: 4px; cursor: pointer;"
              >
                +
              </button>
            </div>
          </div>
          <p style="color: #666; margin-top: 1rem;">
            このカウンターは <code>useState</code> を使用したClient Componentです
          </p>
        </div>
        <div style="margin-top: 2rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #667eea;">
          <h3 style="margin-top: 0; color: #667eea;">💡 ポイント</h3>
          <ul style="margin: 0.5rem 0; padding-left: 1.5rem; color: #555;">
            <li>
              <code>useState</code> でReactライクな状態管理
            </li>
            <li>
              <code>onClick</code> などのイベントハンドラが使える
            </li>
            <li>サーバーサイドレンダリング + クライアントハイドレーション</li>
            <li>
              <code>&lt;ClientMount id="counter" /&gt;</code> だけで簡単に使える！
            </li>
          </ul>
        </div>

        <div style="margin-top: 1rem; text-align: center;">
          <a href="/" style="color: #667eea; text-decoration: none;">
            ← ホームに戻る
          </a>
        </div>
      </div>
    </main>
  );
};
