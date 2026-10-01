import type { ShutdownerApi } from '../api.ts';
import { formatClock, formatRemaining } from '../format.ts';
import type { TimerState } from '../timer.ts';

declare global {
  interface Window {
    shutdowner: ShutdownerApi;
  }
}

const api = window.shutdowner;

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const form = $<HTMLFormElement>('form');
const amountInput = $<HTMLInputElement>('amount');
const unitSelect = $<HTMLSelectElement>('unit');
const startButton = $<HTMLButtonElement>('start');
const pauseButton = $<HTMLButtonElement>('pause');
const cancelButton = $<HTMLButtonElement>('cancel');
const clock = $('clock');
const caption = $('caption');
const progress = $<HTMLProgressElement>('progress');
const errorBox = $('error');
const dryRunBanner = $('dry-run');
const commandInfo = $('command');

let status: TimerState['status'] = 'idle';
let dryRun = false;

/** Whole seconds from the form, or null if the value is not a positive duration. */
function readSeconds(): number | null {
  const amount = amountInput.valueAsNumber;
  const seconds = Math.round(amount * (unitSelect.value === 'minutes' ? 60 : 1));
  return Number.isFinite(seconds) && seconds > 0 ? seconds : null;
}

function updateStartButton(): void {
  startButton.disabled = status !== 'idle' || readSeconds() === null;
}

function render(state: TimerState): void {
  status = state.status;
  const active = state.status !== 'idle';

  amountInput.disabled = active;
  unitSelect.disabled = active;
  pauseButton.disabled = state.status !== 'running' && state.status !== 'paused';
  pauseButton.textContent = state.status === 'paused' ? 'Wznów' : 'Pauza';
  cancelButton.disabled = state.status !== 'running' && state.status !== 'paused';
  updateStartButton();

  document.body.dataset.status = state.status;
  if (state.status === 'idle') {
    clock.textContent = '';
    caption.textContent = '';
    progress.value = 1;
    document.title = 'Shutdowner';
  } else if (state.status === 'done') {
    clock.textContent = formatClock(0);
    caption.textContent = dryRun ? 'Koniec odliczania (tryb próbny)' : 'Wyłączanie…';
    progress.value = 0;
    document.title = 'Shutdowner';
  } else {
    clock.textContent = formatClock(state.remaining);
    caption.textContent =
      state.status === 'paused' ? `Wstrzymano — zostało ${formatRemaining(state.remaining)}` : 'do wyłączenia';
    progress.value = state.remaining / state.total;
    document.title = `${formatClock(state.remaining)} — Shutdowner`;
  }
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const seconds = readSeconds();
  if (seconds === null) return;
  errorBox.textContent = (await api.start(seconds)) ?? '';
});
amountInput.addEventListener('input', updateStartButton);
unitSelect.addEventListener('change', updateStartButton);
pauseButton.addEventListener('click', () => void (status === 'paused' ? api.resume() : api.pause()));
cancelButton.addEventListener('click', () => void api.cancel());

api.onState(render);
render({ status: 'idle' });

const info = await api.info();
dryRun = info.dryRun;
dryRunBanner.hidden = !dryRun;
commandInfo.textContent = info.command
  ? `Po odliczeniu: ${info.command}`
  : 'Ten system nie jest obsługiwany — wyłączenie nie zadziała.';
