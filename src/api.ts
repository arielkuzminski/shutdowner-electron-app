import type { TimerState } from './timer.ts';

export interface AppInfo {
  dryRun: boolean;
  /** Shutdown command for this platform, or null if unsupported. */
  command: string | null;
}

/** What the preload script exposes to the page as `window.shutdowner`. */
export interface ShutdownerApi {
  info: () => Promise<AppInfo>;
  /** Resolves to an error message, or null on success. */
  start: (totalSeconds: number) => Promise<string | null>;
  pause: () => Promise<void>;
  resume: () => Promise<void>;
  cancel: () => Promise<void>;
  onState: (listener: (state: TimerState) => void) => void;
}
