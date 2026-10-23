# Instalacja i uruchomienie — Code Vault (Zepp OS)

Aplikacja na zegarek Amazfit Active 2 (Round, 466×466, Zepp OS / API 4.x):
lista kodów QR / 1D / 2D na zegarku, kodami zarządzasz z aplikacji Zepp na telefonie.

## Wymagania

- Node.js 18+ (Zeus CLI wspiera 14+, testowane na Node 24).
- Konto Zepp (to samo w aplikacji Zepp na telefonie i w `zeus login`).
- Do instalacji na prawdziwym zegarku: aplikacja Zepp na telefonie + sparowany zegarek.
- Do podglądu bez zegarka: Zepp OS Simulator.

Instalacja narzędzia Zeus CLI (jeśli nie masz):

```powershell
npm install -g @zeppos/zeus-cli
zeus --version
```

Zamiast globalnej instalacji możesz używać `npx @zeppos/zeus-cli <komenda>`.

## 1. Przygotowanie projektu

W katalogu projektu:

```powershell
npm install
npm test        # 51/51 typów kodów + layout
npm run build   # pakiet produkcyjny w dist/*.zab
```

`npm install` / `npm test` / `npm run build` automatycznie uruchamiają
`scripts/patch-etiket.mjs`, który usuwa `BigInt` z biblioteki `etiket`
(QuickJS w Zepp OS nie ma `bignum`, więc bez patcha kompilacja QJSC się nie uda).

> Jeśli uruchamiasz `zeus` bezpośrednio (nie przez `npm run`), najpierw wykonaj
> `node scripts/patch-etiket.mjs`.

## 2. Podgląd w symulatorze

1. Zainstaluj i uruchom Zepp OS Simulator, włącz w nim „Device Simulator”.
2. Sprawdź połączenie:

   ```powershell
   zeus status
   ```

   Powinno pokazać `simulator connect status: connected`.

3. Uruchom tryb deweloperski (auto-reload przy zmianach w kodzie):

   ```powershell
   npm run dev
   ```

   Podczas pierwszego uruchomienia wybierz z listy profil zbliżony do
   466×466 round (np. `Amazfit Active 2 (Round)`).

## 3. Instalacja na prawdziwym zegarku (preview przez QR)

1. Zaloguj CLI do swojego konta Zepp:

   ```powershell
   zeus login
   ```

2. W aplikacji Zepp na telefonie włącz tryb deweloperski:
   - Profil → Ustawienia → „O nas”/„About” → stuknij ikonę Zepp 7 razy,
     aż pojawi się potwierdzenie.

3. Wygeneruj kod QR do instalacji:

   ```powershell
   npm run preview
   ```

   lub wskaż urządzenie wprost (nazwa z listy Zeus):

   ```powershell
   zeus preview -t "Amazfit Active 2 (Round)"
   ```

   W terminalu pojawi się kod QR.

4. W aplikacji Zepp: Profil → sparowane urządzenie → przewiń na dół →
   „Tryb deweloperski” → ikona skanowania → zeskanuj QR z terminala → Zainstaluj.

5. Aplikacja „Code Vault” pojawi się na zegarku.

> Wymagania: ten sam account w Zepp i w `zeus login`, aplikacja Zepp 6.6+,
> włączony tryb deweloperski. Kody QR/1D działają od razu (domyślnie są 2 demo).

## 4. Ustawienia kodów na telefonie

Aplikacja Zepp → Profil → sparowane urządzenie → „Aplikacje”/„Mini Programy” →
**Code Vault** → ustawienia (ikona zębatki). Tam dodajesz, edytujesz i usuwasz kody.

- Lista kodów jest przechowywana w `settingsStorage` na telefonie i synchronizowana
  z zegarkiem (`app-side`), a zegarek trzyma kopię w `localStorage`.
- Bez połączenia zegarek pokazuje ostatnią zapisaną kopię (albo 2 kody demo).

## 5. Pakiet produkcyjny (`dist/*.zab`)

`npm run build` tworzy `dist/<appId>-<nazwa>-<wersja>-<data>.zab`. To pakiet do
dystrybucji/publikacji (konsola Zepp OS). Do prywatnej instalacji na własnym
zegarku służy `zeus preview` z kroku 3.

## Rozwiązywanie problemów

- **`QJSC ... invalid number literal` / `unsupported feature: bignum`** —
  nie uruchomiono patcha `etiket`. Wykonaj `node scripts/patch-etiket.mjs`
  i użyj `npm run build` / `npm run preview`.
- **`zeus preview` wymaga logowania** — uruchom `zeus login` (ten sam account co w Zepp).
- **„... is not a valid device, it must be one of [...]”** — użyj dokładnej nazwy
  z listy, np. `"Amazfit Active 2 (Round)"` albo `"Amazfit Active 2 NFC (Round)"`.
- **Symulator: `disconnected`** — uruchom Zepp OS Simulator i włącz w nim
  „Device Simulator” (domyślnie `127.0.0.1:7650`), potem `zeus status`.
- **Zmiana `appId`/`vender`** — obecne `20001`/`local` wystarczają do lokalnego
  podglądu. Do publikacji w sklepie utwórz aplikację w konsoli Zepp OS,
  a jej `appId` i `vender` wpisz w `app.json` (`app.appId`, `app.vender`).

## Ograniczenia

- Projektowany pod ekran okrągły **466×466** (Active 2). Na innych rozmiarach
  układ nadal się uruchomi, ale może być ciasny.
- `runtime.apiVersion.minVersion = 4.0`, więc wymagany Zepp OS z API 4.x
  (Active 2 ma 4.2).
- Wspierane jest 51 typów kodów (13× 2D + 38× 1D); MaxiCode/JAB/Postal/Composite
  nie są obsługiwane.
