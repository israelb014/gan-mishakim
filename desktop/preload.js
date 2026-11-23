/* Bridge between the game page and the desktop app (works for the live site and the bundled copy). */
'use strict';
const { contextBridge, ipcRenderer } = require('electron');

const info = ipcRenderer.sendSync('gan:info') || {};
contextBridge.exposeInMainWorld('ganDesktop', {
  isDesktop: true,
  version: info.version,
  source: () => (location.protocol === 'file:' ? 'bundled' : navigator.onLine ? 'online' : 'cache'),
  quit: () => ipcRenderer.send('gan:quit'),
  // progress: one JSON string per key, kept in the app's folder
  store: {
    get: (key) => ipcRenderer.sendSync('gan:store-get', String(key)),
    set: (key, value) => ipcRenderer.sendSync('gan:store-set', String(key), String(value)),
  },
  gallery: {
    list: (child) => ipcRenderer.invoke('gan:gallery-list', String(child)),
    get: (id) => ipcRenderer.invoke('gan:gallery-get', String(id)),
    put: (rec) => ipcRenderer.invoke('gan:gallery-put', rec),
    del: (id) => ipcRenderer.invoke('gan:gallery-del', String(id)),
  },
  savePicture: (name, dataURL) => ipcRenderer.send('gan:save-picture', String(name), String(dataURL)),
  migrated: () => ipcRenderer.send('gan:migrated'),
});
