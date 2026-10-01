// Sandboxed preloads must be CommonJS, hence .cts.
import electron = require('electron');
import type { ShutdownerApi } from './api.ts';

const { contextBridge, ipcRenderer } = electron;

const api: ShutdownerApi = {
  info: () => ipcRenderer.invoke('info'),
  start: (totalSeconds) => ipcRenderer.invoke('start', totalSeconds),
  pause: () => ipcRenderer.invoke('pause'),
  resume: () => ipcRenderer.invoke('resume'),
  cancel: () => ipcRenderer.invoke('cancel'),
  onState: (listener) => {
    ipcRenderer.on('state', (_event, state) => listener(state));
  },
};

contextBridge.exposeInMainWorld('shutdowner', api);
