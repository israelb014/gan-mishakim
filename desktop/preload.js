/* Exposes the tiny desktop bridge the web app checks for (see DESKTOP in js/app.js). */
'use strict';
const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('ganDesktop', {
  isDesktop: true,
  quit: () => ipcRenderer.send('gan:quit'),
});
