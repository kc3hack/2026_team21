import path from "node:path";
import { serve } from "@hono/node-server";
import { app, BrowserWindow, ipcMain, screen } from "electron";
import started from "electron-squirrel-startup";
import { Hono } from "hono";

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

let mainWindow: BrowserWindow | null = null;

// コマンドライン引数をチェック
const isWindowMode = process.argv.includes("--window");

const createWindow = () => {
  const primaryDisplay = screen.getPrimaryDisplay();

  let windowConfig;

  if (isWindowMode) {
    // グリーンバックウィンドウモード
    windowConfig = {
      width: 1280,
      height: 720,
      transparent: false,
      frame: true,
      alwaysOnTop: false,
      hasShadow: true,
      resizable: true,
      movable: true,
      skipTaskbar: false,
      backgroundColor: "#00FF00", // グリーンバック
      webPreferences: {
        preload: path.join(__dirname, "preload.js"),
      },
    };
  } else {
    // 透過フルスクリーンモード（デフォルト）
    const { width, height } = primaryDisplay.bounds;
    windowConfig = {
      width: width,
      height: height,
      x: 0,
      y: 0,
      transparent: true,
      frame: false,
      alwaysOnTop: true,
      hasShadow: false,
      resizable: false,
      movable: false,
      skipTaskbar: true,
      webPreferences: {
        preload: path.join(__dirname, "preload.js"),
        backgroundThrottling: false,
      },
    };
  }

  // Create the browser window.
  mainWindow = new BrowserWindow(windowConfig);

  // 透過モードの場合のみクリックを透過
  if (!isWindowMode) {
    mainWindow.setIgnoreMouseEvents(true);
  }

  // and load the index.html of the app.
  const modeParam = isWindowMode ? "?mode=window" : "";
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL + modeParam);
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`), {
      query: isWindowMode ? { mode: "window" } : {},
    });
  }

  // DevToolsは透過の妨げになるのでコメントアウト
  // if (process.env.NODE_ENV === 'development') {
  //   mainWindow.webContents.openDevTools();
  // }
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

// Honoサーバーを起動
const honoApp = new Hono();

honoApp.post("/comment", async (c) => {
  const body = await c.req.json();
  const text = body.text || "コメントなし";
  const duration = body.duration || 5000;
  const fontSize = body.fontSize;

  // レンダラープロセスにコメントを送信
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send("add-comment", { text, duration, fontSize });
  }

  return c.json({ success: true, text });
});

honoApp.get("/", (c) => {
  return c.text("Niconico Comment Server is running!");
});

// サーバーを起動
const PORT = 3939;
serve({
  fetch: honoApp.fetch,
  port: PORT,
});

console.log(`🚀 Hono server running at http://localhost:${PORT}`);
