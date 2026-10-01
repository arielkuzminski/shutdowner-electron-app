import { app, BrowserWindow, dialog, ipcMain, Menu, powerSaveBlocker } from 'electron';
import { release } from 'node:os';
import path from 'node:path';
import type { AppInfo } from './api.ts';
import { formatCommand, getShutdownCommand, runShutdown } from './shutdown.ts';
import { createTimer, type TimerState } from './timer.ts';

const dryRun = process.argv.includes('--dry-run');
const command = getShutdownCommand(process.platform, release());

let win: BrowserWindow | null = null;
let sleepBlocker: number | null = null;

const timer = createTimer({
  onChange: (state) => {
    win?.webContents.send('state', state);
    updateSleepBlocker(state);
  },
  onDone: () => void shutdown(),
});

/** Keep the system awake while counting down, otherwise sleep would postpone the shutdown. */
function updateSleepBlocker(state: TimerState): void {
  const wanted = state.status === 'running';
  if (wanted && sleepBlocker === null) {
    sleepBlocker = powerSaveBlocker.start('prevent-app-suspension');
  } else if (!wanted && sleepBlocker !== null) {
    powerSaveBlocker.stop(sleepBlocker);
    sleepBlocker = null;
  }
}

async function shutdown(): Promise<void> {
  if (!command) return;
  if (dryRun) {
    await showMessage('info', 'Tryb próbny', `Wykonałbym: ${formatCommand(command)}`);
    timer.cancel();
    return;
  }
  try {
    await runShutdown(command);
  } catch (err) {
    await showMessage(
      'error',
      'Błąd',
      `Nie udało się wyłączyć komputera (${formatCommand(command)}):\n${(err as Error).message}`,
    );
    timer.cancel();
  }
}

async function showMessage(type: 'info' | 'error', title: string, message: string): Promise<void> {
  const options = { type, title, message };
  await (win ? dialog.showMessageBox(win, options) : dialog.showMessageBox(options));
}

function createWindow(): void {
  win = new BrowserWindow({
    width: 420,
    height: 440,
    resizable: false,
    title: 'Shutdowner',
    webPreferences: {
      preload: path.join(import.meta.dirname, 'preload.cjs'),
      contextIsolation: true,
      sandbox: true,
      nodeIntegration: false,
    },
  });

  win.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  win.webContents.on('will-navigate', (event) => event.preventDefault());

  win.on('close', (event) => {
    const { status } = timer.getState();
    if (status !== 'running' && status !== 'paused') return;
    const choice = dialog.showMessageBoxSync(win!, {
      type: 'question',
      buttons: ['Zamknij i anuluj', 'Nie zamykaj'],
      defaultId: 1,
      cancelId: 1,
      message: 'Odliczanie trwa. Zamknięcie aplikacji anuluje wyłączenie komputera.',
    });
    if (choice === 1) event.preventDefault();
    else timer.cancel();
  });
  win.on('closed', () => (win = null));

  void win.loadFile(path.join(import.meta.dirname, '..', 'static', 'index.html'));
}

ipcMain.handle('info', (): AppInfo => ({ dryRun, command: command && formatCommand(command) }));

ipcMain.handle('start', (_event, totalSeconds: unknown): string | null => {
  if (!command) return `Nieobsługiwany system: ${process.platform}.`;
  if (typeof totalSeconds !== 'number' || !Number.isInteger(totalSeconds) || totalSeconds <= 0) {
    return 'Podaj czas większy od zera.';
  }
  timer.start(totalSeconds);
  return null;
});
ipcMain.handle('pause', () => timer.pause());
ipcMain.handle('resume', () => timer.resume());
ipcMain.handle('cancel', () => timer.cancel());

// A second instance would run its own, independent countdown; focus the existing window instead.
if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (win?.isMinimized()) win.restore();
    win?.focus();
  });

  Menu.setApplicationMenu(null);
  void app.whenReady().then(() => {
    createWindow();
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
  });
}
