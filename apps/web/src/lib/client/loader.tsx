import { mountComponents } from "@/lib/client/registry";
import "@/pages/router";

// レジストリを読み込み済みの状態で初期化
function init() {
  mountComponents();
}

// DOMContentLoadedで自動的にマウント
if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
}
