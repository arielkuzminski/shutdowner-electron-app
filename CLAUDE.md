# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Electron GUI that counts down and then powers off the machine. It is the windowed sibling of `~/repos/node-shutdowner` (the CLI). It is unrelated to the Glofox project described in the parent `../CLAUDE.md`; those business rules do not apply here.

## Commands

```bash
npm run start:dry                # build + run with --dry-run (shows the command instead of shutting down)
npm test                         # node:test on test/*.test.ts, runs src/ directly via Node type stripping (no build)
node --test test/timer.test.ts   # single file
npm run typecheck                # tsc --noEmit over src + test
npm run lint                     # eslint
npm run format                   # prettier --write
npm run dist                     # build + electron-builder → electron/output/shutdowner_portable.exe (works from Linux/WSL)
```

**Never run `npm start` or the built exe without `--dry-run`.** When the countdown ends it really shuts the machine down (from WSL: the Windows host).

## Architecture

- **The countdown lives in the main process**, not the renderer. Chromium throttles timers in minimized windows, and that used to delay the shutdown. Do not move timing logic into the page.
- `src/timer.ts` is pure (no electron import) so it can be unit-tested. It is a state machine (`idle | running | paused | done`) driven by a wall-clock deadline. Ticks are scheduled on whole-second boundaries of the remaining time, and `onDone` fires once.
- `src/main.ts` wires the timer to IPC (`info`, `start`, `pause`, `resume`, `cancel` via `ipcMain.handle`) and pushes every state change to the page on the `state` channel. It also handles:
  - the sleep blocker,
  - the close confirmation,
  - single-instance lock,
  - `--dry-run`.
- `src/preload.cts` is CommonJS on purpose: sandboxed preloads can't be ESM. It exposes `window.shutdowner` (typed in `src/api.ts`) via `contextBridge`. The window runs with `contextIsolation` + `sandbox`, no `nodeIntegration`, and strict CSP.
- `src/renderer/renderer.ts` only renders state and forwards button clicks. `static/index.html` loads the compiled `../dist/renderer/renderer.js`.
- `src/shutdown.ts` is a copy of `node-shutdowner/src/shutdown.ts`, and `src/format.ts` is derived from its `countdown.ts`. Keep the two repos in sync when changing shutdown commands or Polish plural rules.
- Imports use `.ts` extensions. `rewriteRelativeImportExtensions` turns them into `.js` in `dist/`, so the same sources run under `node --test` without a build.
- Tests mock `setTimeout` + `Date` with `t.mock.timers`. Advance them at most one second per `tick()`, because a multi-second tick moves `Date` to the end before the callbacks run.
- User-facing strings are in Polish.
