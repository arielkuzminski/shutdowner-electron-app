# Shutdowner (Electron)

Okienkowa wersja [node-shutdowner](https://github.com/arielkuzminski/node-shutdowner): odlicza podany czas i wyłącza komputer. Ma pauzę, wznawianie i anulowanie.

```bash
npm install
npm run start:dry     # tryb próbny: odlicza, ale zamiast wyłączać pokazuje komendę
npm start             # na serio
npm run dist          # buduje instalator electron/output/shutdowner-setup-<wersja>.exe
```

Instalator buduje się pod Windowsem (PowerShell). Na Linuksie/WSL electron-builder potrzebuje do NSIS `wine`.

Instalacja jest jednoklikowa, na konto użytkownika, bez uprawnień administratora. Aplikacja trafia do menu Start. Uruchomienie w trybie próbnym: `Shutdowner.exe --dry-run`.

Zamiast pojedynczego pliku portable jest instalator, bo portable przy każdym starcie rozpakowuje Electrona. Zmierzony start: ok. 4 s dla portable, 0,2 s po instalacji.

- Odliczanie działa w procesie głównym i jest liczone od zegara, więc zminimalizowane okno go nie spowalnia.
- W trakcie odliczania aplikacja nie pozwala systemowi przejść w uśpienie.
- Zamknięcie okna w trakcie odliczania wymaga potwierdzenia i anuluje wyłączenie.

| System  | Komenda                                                |
| ------- | ------------------------------------------------------ |
| Windows | `shutdown /s /t 0`                                     |
| WSL     | `shutdown.exe /s /t 0` (wyłącza hosta Windows)         |
| Linux   | `systemctl poweroff`                                   |
| macOS   | `osascript -e 'tell app "System Events" to shut down'` |
