// @flow
import "./setup";
import { app, Menu, ipcMain } from "electron";
import menu from "./menu";
import { createMainWindow, getMainWindow } from "./window-lifecycle";
import "./internal-lifecycle";

const gotLock = app.requestSingleInstanceLock();

if (!gotLock) {
  app.quit();
} else {
  app.on("second-instance", (event, commandLine, workingDirectory) => {
    const w = getMainWindow();
    if (w) {
      if (w.isMinimized()) {
        w.restore();
      }
      w.focus();
    }
  });
}

const showTimeout = setTimeout(() => {
  const w = getMainWindow();
  if (w) show(w);
}, 5000);

app.on("window-all-closed", () => {
  app.quit();
});

app.on("activate", () => {
  const w = getMainWindow();
  if (w) {
    w.focus();
  }
});

app.on("ready", async () => {
  if (__DEV__) {
    await installExtensions();
  }

  Menu.setApplicationMenu(menu);

  const w = await createMainWindow();

  await clearSessionCache(w.webContents.session);
});

ipcMain.on("ready-to-show", () => {
  const w = getMainWindow();
  if (w) {
    clearTimeout(showTimeout);
    show(w);
  }
});

async function installExtensions() {
  const installer = require("electron-devtools-installer");
  const forceDownload = true; // process.env.UPGRADE_EXTENSIONS
  const extensions = ["REACT_DEVELOPER_TOOLS", "REDUX_DEVTOOLS"];
  return Promise.all(
    extensions.map(name => installer.default(installer[name], forceDownload)),
  ).catch(console.log);
}

function clearSessionCache(session) {
  return new Promise(resolve => {
    session.clearCache(resolve);
  });
}

function show(win) {
  win.show();
  setImmediate(() => win.focus());
}
