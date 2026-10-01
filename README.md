# Shutdowner (Electron)

Okienkowa wersja [node-shutdowner](https://github.com/arielkuzminski/node-shutdowner): odlicza podany czas i wyłącza komputer. Ma pauzę, wznawianie i anulowanie.

```bash
npm install
npm run start:dry     # tryb próbny: odlicza, ale zamiast wyłączać pokazuje komendę
npm start             # na serio
npm run dist          # buduje electron/output/shutdowner_portable.exe (działa też z Linuksa/WSL)
```

Gotowy plik `.exe` też można uruchomić w trybie próbnym: `shutdowner_portable.exe --dry-run`.

- Odliczanie działa w procesie głównym i jest liczone od zegara, więc zminimalizowane okno go nie spowalnia.
- W trakcie odliczania aplikacja nie pozwala systemowi przejść w uśpienie.
- Zamknięcie okna w trakcie odliczania wymaga potwierdzenia i anuluje wyłączenie.

| System  | Komenda                                                |
| ------- | ------------------------------------------------------ |
| Windows | `shutdown /s /t 0`                                     |
| WSL     | `shutdown.exe /s /t 0` (wyłącza hosta Windows)         |
| Linux   | `systemctl poweroff`                                   |
| macOS   | `osascript -e 'tell app "System Events" to shut down'` |
