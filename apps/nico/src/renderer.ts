/**
 * This file will automatically be loaded by vite and run in the "renderer" context.
 * To learn more about the differences between the "main" and the "renderer" context in
 * Electron, visit:
 *
 * https://electronjs.org/docs/tutorial/process-model
 *
 * By default, Node.js integration in this file is disabled. When enabling Node.js integration
 * in a renderer process, please be aware of potential security implications. You can read
 * more about security risks here:
 *
 * https://electronjs.org/docs/tutorial/security
 *
 * To enable Node.js integration in this file, open up `main.ts` and enable the `nodeIntegration`
 * flag:
 *
 * ```
 *  // Create the browser window.
 *  mainWindow = new BrowserWindow({
 *    width: 800,
 *    height: 600,
 *    webPreferences: {
 *      nodeIntegration: true
 *    }
 *  });
 * ```
 */

import "./index.css";

console.log('👋 This message is being logged by "renderer.ts", included via Vite');

// ニコニコ風コメントシステム
class NiconicoCommentSystem {
  private container: HTMLElement;
  private usedLanes: Set<number> = new Set();
  private readonly laneHeight = 40; // 各レーンの高さ（px）
  private readonly maxLanes = 15; // 最大レーン数

  constructor(containerId: string) {
    const element = document.getElementById(containerId);
    if (!element) {
      throw new Error(`Container with id "${containerId}" not found`);
    }
    this.container = element;
  }

  /**
   * コメントを画面に流す
   * @param text コメントテキスト
   * @param duration アニメーション時間（ミリ秒）デフォルト5秒
   */
  addComment(text: string, duration = 5000): void {
    const comment = document.createElement("div");
    comment.className = "niconico-comment";
    comment.textContent = text;

    // 空いているレーンを探す
    const lane = this.findAvailableLane();
    const top = lane * this.laneHeight;

    comment.style.top = `${top}px`;
    comment.style.animationDuration = `${duration}ms`;

    this.container.appendChild(comment);

    // レーンを使用中としてマーク
    this.usedLanes.add(lane);

    // アニメーション終了後に要素を削除してレーンを解放
    comment.addEventListener("animationend", () => {
      comment.remove();
      this.usedLanes.delete(lane);
    });
  }

  /**
   * 利用可能なレーンを探す
   */
  private findAvailableLane(): number {
    for (let i = 0; i < this.maxLanes; i++) {
      if (!this.usedLanes.has(i)) {
        return i;
      }
    }
    // 全レーンが使用中の場合はランダムに選択
    return Math.floor(Math.random() * this.maxLanes);
  }
}

// グローバルに公開
const commentSystem = new NiconicoCommentSystem("comment-container");

// テスト用：自動的にコメントを流す
const testMessages = [
  "AIが頑張ってます！",
  "コード書いてます〜",
  "ビルド中...",
  "デバッグしてるよ！",
  "もうすぐ完成！",
  "エラー修正中...",
  "リファクタリング中",
  "テスト実行中",
  "データベース接続中...",
  "API叩いてます！",
];

// 3秒ごとにランダムなコメントを流す
setInterval(() => {
  const randomMessage = testMessages[Math.floor(Math.random() * testMessages.length)];
  commentSystem.addComment(randomMessage);
}, 3000);

// 起動時に1つ流す
setTimeout(() => {
  commentSystem.addComment("ニコニココメントシステム起動！");
}, 1000);

// グローバルに公開して外部から使えるようにする
declare global {
  interface Window {
    addNiconicoComment: (text: string, duration?: number) => void;
  }
}

window.addNiconicoComment = (text: string, duration?: number) => {
  commentSystem.addComment(text, duration);
};
