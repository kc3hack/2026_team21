// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from "electron";

// レンダラープロセスにAPIを公開
contextBridge.exposeInMainWorld("electronAPI", {
  onAddComment: (callback: (data: { text: string; duration: number }) => void) => {
    ipcRenderer.on("add-comment", (_event, data) => callback(data));
  },
});
