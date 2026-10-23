# Code Vault

**A QR / 1D / 2D code wallet for the Amazfit Active 2 (Zepp OS 5).**

Code Vault stores code definitions on your phone and displays them offline on the watch. It does not scan codes — it generates a QR, barcode, or 2D code image from the content you provide and shows it on the watch screen.

> **Vibe-coded from start to finish.**
> The entire application layer — UI, sync logic, code renderer, scripts, and tests — was built iteratively in a vibe-coding workflow with AI assistance. This is not corporate, reviewed production code. It was tested where possible, but it has not undergone a security audit or testing across multiple watch models.

| | |
|---|---|
| Platform | Zepp OS 5 / API 4.0 |
| Target device | Amazfit Active 2 Round, 466×466 |
| UI language | English |
| Documentation | English / [Polski](README.pl.md) |
| Tests | `npm test` — 51/51 code types |
| Status | hobby project / prototype |

---

## What the app actually does

- Creates, edits, and deletes QR, 1D, and 2D codes in the app settings inside Zepp App.
- Syncs the code list to the watch through an app-side service.
- Shows a scrollable code list on the watch — no pagination, no navigation buttons.
- Opens a generated code screen when you tap the code name or type.
- Uses the native `QRCODE` widget for plain QR codes.
- Renders every other format on a canvas: black modules or bars on a white background.
- Automatically rotates 1D codes when a vertical orientation produces a larger scale.
- Lets you assign a HEX color to each code (white by default).
- Works offline — codes are generated locally on the watch.
- **Does not scan codes, send data to the internet, or include telemetry.**

---

## Features

- **51 code formats** — 13 2D types and 38 1D types.
- **One scrollable `SCROLL_LIST`** on the home screen, with no pagination.
- **Colored card borders** based on the color assigned to each code.
- **A color dot** on every code card in the Settings app.
- **Quick add and edit** — name, type, HEX color, and content.
- **Input validation** — content length, color format, and per-type requirements.
- **Offline mode** — a copy of the code list in the watch's `localStorage`.
- **A `DENSE` warning** for very dense codes that may be difficult to scan.
- **Gesture navigation** — swipe right to leave a code screen.
- **No on-screen BACK/CLOSE buttons** on the watch.
- **Default demo codes** on first launch: `Sample QR` and `Sample Code 128`.

---

## How to use it

1. Install the app on the watch through Zepp App (developer mode + the QR from `zeus preview`).
2. In Zepp App, open the app settings: **Device → Apps → Code Vault**.
3. Add a code: name, type, HEX color, and content.
4. Save — the app will push the changes to the watch on the next sync.
5. On the watch, tap the **name or type** of a code to open it.
6. Go back with a **swipe right**.

Tapping the card background intentionally does nothing — only the name and type are clickable.

---

## How it works

```text
┌──────────────────────────────┐
│ Zepp App / Settings App      │
│ setting/index.js             │
│ - add / edit / delete        │
│ - write to storage: "codes"  │
└──────────────┬───────────────┘
               │ settingsLib
               ▼
┌──────────────────────────────┐
│ App-side service (ZML)       │
│ app-side/index.js            │
│ - GET_CODES                  │
│ - push "CODES" on change     │
└──────────────┬───────────────┘
               │ ZML request / call
               ▼
┌──────────────────────────────┐
│ Watch / Zepp OS              │
│ page/home → code list        │
│ page/qr   → native QRCODE    │
│ page/view → canvas for rest  │
│ localStorage → cache         │
└──────────────────────────────┘
```

### Synchronization

- The Settings app writes the code array under the `codes` key.
- The app-side service listens for storage changes and sends them to the watch as `CODES`.
- The watch stores a copy in `localStorage`.
- The home screen reads the cache first, then requests fresh data through `GET_CODES`.
- The last write wins — there is no conflict merging or versioning.

### Code rendering

1. `shared/encode.js` selects an encoder from the `etiket` library.
2. The result becomes a 2D matrix or a list of 1D bar widths.
3. `shared/draw.js` calculates scale, quiet zones, and screen position.
4. For 1D codes, it picks the better orientation: horizontal or rotated.
5. `utils/render.js` paints a white background and black modules on a `CANVAS`.
6. Plain QR codes do not use the canvas — they use the native `QRCODE` widget.

### Card colors

The color is stored as HEX, for example `#FF6B3D`. Legacy codes without a color default to white.

`SCROLL_LIST` has no native border, so the border is a workaround:

- `item_bg_color` is set to the user's color.
- A dark, rounded `assets/gt.r/card-inner.png` image is drawn on top, inset by 3 px.
- The result is a 3-pixel colored border around the card.

This works, but it is a hack that depends on the firmware's layer drawing order.

### Stability

The app includes several pragmatic safeguards against race conditions and rendering too early:

- Code screens read the cache first and skip the request when the code is already available.
- Rendering is delayed and performed only once.
- The code is not redrawn when it has not changed.
- Code screens do not write to the cache.
- Widgets are cleared when leaving a screen.
- Navigation from the list has a short time guard.
- The list respects `onPause` / `onResume`.

This is not a guaranteed root-cause fix — it is a set of practical workarounds.

---

## Supported formats

<details>
<summary><strong>2D — 13 types</strong></summary>

- QR Code
- Micro QR
- rMQR
- Data Matrix
- GS1 Data Matrix
- PDF417
- MicroPDF417
- Aztec Code
- Aztec Rune
- DotCode
- Han Xin
- Codablock F
- Code 16K

</details>

<details>
<summary><strong>1D — 38 types</strong></summary>

- Code 128
- GS1-128
- EAN-13
- EAN-8
- UPC-A
- UPC-E
- EAN-2 (add-on)
- EAN-5 (add-on)
- Code 39
- Code 39 Extended
- Code 93
- Code 93 Extended
- ITF (Interleaved 2 of 5)
- ITF-14
- GS1 EAN-14
- SSCC-18
- Codabar
- MSI Plessey
- Code 11
- Plessey
- Pharmacode
- ISBN
- ISSN
- ISMN
- Code 32 (Italian Pharmacode)
- PZN
- PZN8
- Identcode (DP)
- Leitcode (DP)
- GS1 DataBar Omnidirectional
- GS1 DataBar Limited
- GS1 DataBar Expanded
- GS1 DataBar Truncated
- Industrial 2 of 5
- IATA 2 of 5
- Matrix 2 of 5
- COOP 2 of 5
- Datalogic 2 of 5

</details>

---

## Tech stack

| Layer | Technology |
|---|---|
| Runtime | Zepp OS 5, JavaScript ES Modules, QuickJS |
| Watch UI | `@zos/ui`, `SCROLL_LIST`, `CANVAS`, `QRCODE`, `TEXT` |
| Navigation | `@zos/router`, `@zos/interaction` |
| Sync | `@zeppos/zml` — `BasePage`, `BaseSideService` |
| Storage | Zepp Settings Storage + `@zos/storage` |
| Encoding | [`etiket`](https://www.npmjs.com/package/etiket) |
| Phone settings | Zepp App Settings API (`View`, `Text`, `TextInput`, `Button`) |
| Tooling | Zeus CLI, Node.js, npm |
| Tests | Custom Node runner (`test/run.mjs`) |
| Editor types | `jsconfig.json` + `global.d.ts` (no TypeScript at runtime) |

---

## Repository structure

```text
.
├── app.js                       # app entry point
├── app.json                     # Zepp OS config, pages, permissions
├── page/
│   ├── home/index.page.js       # code list, SCROLL_LIST, colors
│   ├── qr/index.page.js         # native QRCODE widget
│   └── view/index.page.js       # canvas for 1D and other 2D codes
├── setting/index.js             # Settings app inside Zepp App
├── app-side/index.js            # app-side service, GET_CODES and push
├── shared/
│   ├── catalog.js               # definitions for all 51 code types
│   ├── encode.js                # encoding through etiket
│   ├── draw.js                  # matrices, bars, scale, rotation
│   ├── defaults.js              # default codes, color validation
│   └── polyfills.js             # QuickJS polyfills
├── utils/
│   ├── cache.js                 # code cache in localStorage
│   └── render.js                # canvas layout and painting
├── assets/
│   ├── gt.r/                    # icons and card-inner.png
│   └── gt.s/
├── scripts/patch-etiket.mjs     # patches etiket for QuickJS
├── test/run.mjs                 # encoding and layout tests
└── dist/                        # build output (gitignored)
```

---

## Quick start

### Requirements

- Node.js 18+
- npm
- Zeus CLI
- Zepp account / logged-in `zeus login`
- Zepp App with developer mode enabled
- Amazfit Active 2 Round

### Install

```bash
git clone https://github.com/seythegamer/CodeVault-zeppos.git
cd CodeVault-zeppos
npm install
npx zeus login
```

`npm install` runs `scripts/patch-etiket.mjs`, which prepares the `etiket` library for QuickJS (including removing its `BigInt` dependency). If the patch does not run:

```bash
node scripts/patch-etiket.mjs
```

### Tests

```bash
npm test
```

The test verifies encoding and layout for all 51 code types. It does not test scanning with a physical reader.

### Preview on the watch

```bash
npm run preview -- -t "Amazfit Active 2 (Round)"
```

Or directly:

```bash
npx zeus preview -t "Amazfit Active 2 (Round)"
```

Then scan the QR code in Zepp App and install the app. Preview QR codes expire after a few days.

### Build

```bash
npm run build
```

The resulting `.zab` file appears in `dist/`. The `dist/` directory is gitignored.

---

## Tests

```text
npm test
```

Coverage:

- 51/51 code types pass encoding,
- matrix and bar layout is checked,
- minimum scale and quiet zones are checked.

What is **not** covered:

- testing on a physical watch,
- scanning with a physical reader,
- CI,
- visual regression tests,
- firmware regression tests.

---

## Where we took shortcuts

This is a conscious list of trade-offs, not an attempt to hide problems.

1. **Vibe-coding instead of a traditional process.**  
   The code was built in a dialogue with AI, iteratively. There is no code review history, ADRs, or team process here. Tests and manual checks on available hardware were the only quality gate.

2. **`etiket` is patched inside `node_modules`.**  
   `scripts/patch-etiket.mjs` modifies files after `npm install`. It is fast, but fragile: updating `etiket` may break the patch. The proper solution is to pin an exact version and vendor the patched encoders.

3. **No native border in `SCROLL_LIST`.**  
   The colored border is implemented with `item_bg_color` plus an inner PNG. It is a hack and may behave differently on other firmware versions.

4. **Stability through delays and flags.**  
   Delayed rendering, cache-first reads, and navigation guards reduce the risk of crashes, but they do not remove the underlying firmware issue.

5. **QR is native; everything else is custom-rendered.**  
   Only plain QR uses `QRCODE`. The other 50 formats use a custom canvas layout — more control, but also more room for visual bugs.

6. **Tests do not scan codes.**  
   The tests confirm that the encoder and layout finish successfully. They do not confirm that every code can be read by a phone or scanner.

7. **No encryption.**  
   Codes are stored as plain text in Zepp App storage and in the watch's `localStorage`. This is not a password vault.

8. **Layout for one screen.**  
   The UI is tuned for a round 466×466 display. Other screen sizes may require adjustments.

9. **App identity is local.**  
   `appId: 20001` and `vender: "local"` are preview values. Publishing to the Zepp store requires replacing them with your own details.

10. **No CI and no license.**  
    The repository has no pipeline and no `LICENSE` file. Before publishing as open source, add both.

---

## Security and privacy

- The app makes no network requests.
- There is no analytics, telemetry, or tracking SDK.
- `app.json` declares no network permissions.
- Codes stay on the phone and the watch.
- The repository contains no GitHub, Zepp/Amazfit, or Zeus credentials.
- **Codes are not encrypted.** Do not store passwords, tokens, or other secrets in them.

---

## Project status and roadmap

The project is functional, but still a hobby project. The biggest gaps:

- [ ] Testing on more firmware versions and watch models
- [ ] Verifying all 51 formats with a physical scanner
- [ ] Screenshots for the README
- [ ] CI running `npm test`
- [ ] Pinning `etiket` and vendoring the patch instead of modifying `node_modules`
- [ ] Adaptive layout for other resolutions
- [ ] Optional encryption
- [ ] A `LICENSE` file

---

## License

There is no `LICENSE` file. If you want to publish this as open source, add a license of your choice — for example, MIT.

---

## Credits

- [Zepp OS Developers Documentation](https://docs.zepp.com/)
- [`etiket`](https://www.npmjs.com/package/etiket) for QR / 1D / 2D encoding
- The Zepp OS community
- AI as a vibe-coding partner

---

## Disclaimer

Hobby project, not affiliated with Zepp Health or Amazfit. Use at your own risk. Codes may not work with every scanner — test the specific format and device before relying on it in practice.













# Code Vault

**Portfel kodów QR / 1D / 2D na zegarek Amazfit Active 2 (Zepp OS 5).**

Code Vault przechowuje definicje kodów na telefonie i wyświetla je offline na zegarku. Aplikacja nie skanuje kodów — generuje ich obraz z podanego tekstu i pokazuje go na ekranie zegarka.

> **Vibe-coded od początku do końca.**
> Cała autorska warstwa aplikacji — UI, logika synchronizacji, renderer kodów, skrypty i testy — powstała iteracyjnie w trybie vibe-codingu z pomocą AI. To nie jest korporacyjny, recenzowany kod produkcyjny. Został przetestowany tam, gdzie było to możliwe, ale nie przeszedł audytu bezpieczeństwa ani testów na wielu modelach zegarków.

| | |
|---|---|
| Platforma | Zepp OS 5 / API 4.0 |
| Sprzęt docelowy | Amazfit Active 2 Round, 466×466 |
| Język UI | angielski |
| Dokumentacja | polski |
| Testy | `npm test` — 51/51 typów |
| Status | projekt hobbystyczny / prototyp |

---

## Co dokładnie robi aplikacja?

- Tworzy, edytuje i usuwa kody QR, 1D oraz 2D w ustawieniach aplikacji w Zepp App.
- Synchronizuje listę kodów z zegarkiem przez usługę app-side.
- Pokazuje przewijaną listę kodów na zegarku — bez paginacji i bez przycisków nawigacyjnych.
- Po dotknięciu nazwy lub typu kodu otwiera ekran z wygenerowanym kodem.
- Dla zwykłego QR używa natywnego widgetu `QRCODE`.
- Dla pozostałych formatów renderuje kod na canvasie: czarne moduły lub kreski na białym tle.
- Automatycznie obraca kody 1D, jeśli w pionie da się uzyskać większą skalę.
- Pozwala nadać każdemu kodowi własny kolor HEX (domyślnie biały).
- Działa offline — kody są generowane lokalnie na zegarku.
- **Nie skanuje kodów, nie wysyła danych do internetu i nie zawiera telemetrii.**

---

## Funkcje

- **51 formatów kodów** — 13 typów 2D i 38 typów 1D.
- **Jeden przewijany `SCROLL_LIST`** na ekranie głównym, bez paginacji.
- **Kolorowe obramowanie kart** na podstawie koloru przypisanego do kodu.
- **Kolorowa kropka** przy każdym kodzie w Settings App.
- **Szybkie dodawanie i edycja** — nazwa, typ, kolor HEX, treść.
- **Walidacja danych** — m.in. długość treści, poprawność koloru i wymagania konkretnych formatów.
- **Tryb offline** — kopia kodów w `localStorage` zegarka.
- **Ostrzeżenie `DENSE`** dla bardzo gęstych kodów, które mogą być trudne do zeskanowania.
- **Obsługa gestów** — swipe w prawo wraca z ekranu kodu.
- **Brak przycisków BACK/CLOSE** na ekranie zegarka.
- **Domyślne kody demo** przy pierwszym uruchomieniu: `Sample QR` i `Sample Code 128`.

---

## Jak używać

1. Zainstaluj aplikację na zegarku przez Zepp App (tryb deweloperski + QR z `zeus preview`).
2. W Zepp App wejdź w ustawienia aplikacji: **Urządzenie → Aplikacje → Code Vault**.
3. Dodaj kod: nazwa, typ, kolor HEX i treść.
4. Zapisz — aplikacja przekaże zmiany do zegarka przy najbliższej synchronizacji.
5. Na zegarku dotknij **nazwy lub typu** kodu, żeby go otworzyć.
6. Wróć gestem **swipe w prawo**.

Dotknięcie tła karty celowo nic nie robi — klikalne są tylko nazwa i typ.

---

## Jak to działa

```text
┌──────────────────────────────┐
│ Zepp App / Settings App      │
│ setting/index.js             │
│ - dodaj / edytuj / usuń      │
│ - zapis do storage: "codes"  │
└──────────────┬───────────────┘
               │ settingsLib
               ▼
┌──────────────────────────────┐
│ App-side service (ZML)       │
│ app-side/index.js            │
│ - GET_CODES                  │
│ - push "CODES" po zmianie    │
└──────────────┬───────────────┘
               │ ZML request / call
               ▼
┌──────────────────────────────┐
│ Zegarek / Zepp OS            │
│ page/home → lista kodów      │
│ page/qr   → natywny QRCODE   │
│ page/view → canvas dla reszty│
│ localStorage → cache         │
└──────────────────────────────┘
```

### Synchronizacja

- Settings App zapisuje tablicę kodów pod kluczem `codes`.
- Usługa app-side nasłuchuje zmian w storage i wysyła je do zegarka jako `CODES`.
- Zegarek zapisuje kopię w `localStorage`.
- Ekran główny najpierw czyta cache, a potem pobiera świeże dane przez `GET_CODES`.
- Ostatni zapis wygrywa — nie ma merge'owania konfliktów ani wersjonowania.

### Renderowanie kodów

1. `shared/encode.js` wybiera encoder z biblioteki `etiket`.
2. Wynik jest zamieniany na macierz 2D albo listę szerokości kresek 1D.
3. `shared/draw.js` liczy skalę, marginesy ciszy i pozycję na ekranie.
4. Dla 1D wybierany jest lepszy wariant: poziomy lub obrócony.
5. `utils/render.js` rysuje białe tło i czarne moduły na `CANVAS`.
6. Zwykły QR nie idzie przez canvas — używa natywnego `QRCODE`.

### Kolory kart

Kolor jest zapisany jako HEX, np. `#FF6B3D`. Stare kody bez koloru dostają biały.

`SCROLL_LIST` nie ma natywnej ramki, więc obramowanie jest zrobione obejściem:

- `item_bg_color` = kolor użytkownika,
- na wierzchu rysowany jest zaokrąglony, ciemny `assets/gt.r/card-inner.png` inset 3 px,
- dzięki temu kolor widać jako 3-pikselową ramkę.

To działa, ale jest to hack zależny od kolejności rysowania warstw w firmware.

### Stabilność

Aplikacja ma kilka pragmatycznych zabezpieczeń przed race condition i zbyt wczesnym renderowaniem:

- ekrany kodów najpierw czytają cache i nie wysyłają requestu, jeśli kod już jest,
- render jest opóźniony i wykonywany tylko raz,
- nie ma ponownego rysowania, jeśli kod się nie zmienił,
- ekrany kodów nie zapisują cache,
- widżety są czyszczone przy wyjściu,
- nawigacja z listy ma krótki guard czasowy,
- lista respektuje `onPause` / `onResume`.

To nie jest gwarantowana naprawa root cause — to praktyczne obejścia.

---

## Obsługiwane formaty

<details>
<summary><strong>2D — 13 typów</strong></summary>

- QR Code
- Micro QR
- rMQR
- Data Matrix
- GS1 Data Matrix
- PDF417
- MicroPDF417
- Aztec Code
- Aztec Rune
- DotCode
- Han Xin
- Codablock F
- Code 16K

</details>

<details>
<summary><strong>1D — 38 typów</strong></summary>

- Code 128
- GS1-128
- EAN-13
- EAN-8
- UPC-A
- UPC-E
- EAN-2 (dodatek)
- EAN-5 (dodatek)
- Code 39
- Code 39 Extended
- Code 93
- Code 93 Extended
- ITF (Interleaved 2 of 5)
- ITF-14
- GS1 EAN-14
- SSCC-18
- Codabar
- MSI Plessey
- Code 11
- Plessey
- Pharmacode
- ISBN
- ISSN
- ISMN
- Code 32 (Italian Pharmacode)
- PZN
- PZN8
- Identcode (DP)
- Leitcode (DP)
- GS1 DataBar Omnidirectional
- GS1 DataBar Limited
- GS1 DataBar Expanded
- GS1 DataBar Truncated
- Industrial 2 of 5
- IATA 2 of 5
- Matrix 2 of 5
- COOP 2 of 5
- Datalogic 2 of 5

</details>

---

## Stack technologiczny

| Warstwa | Technologia |
|---|---|
| Runtime | Zepp OS 5, JavaScript ES Modules, QuickJS |
| UI zegarka | `@zos/ui`, `SCROLL_LIST`, `CANVAS`, `QRCODE`, `TEXT` |
| Nawigacja | `@zos/router`, `@zos/interaction` |
| Synchronizacja | `@zeppos/zml` — `BasePage`, `BaseSideService` |
| Storage | Zepp Settings Storage + `@zos/storage` |
| Kodowanie | [`etiket`](https://www.npmjs.com/package/etiket) |
| Ustawienia telefonu | Zepp App Settings API (`View`, `Text`, `TextInput`, `Button`) |
| Narzędzia | Zeus CLI, Node.js, npm |
| Testy | własny runner Node (`test/run.mjs`) |
| Typy w edytorze | `jsconfig.json` + `global.d.ts` (bez TypeScript w runtime) |

---

## Struktura repozytorium

```text
.
├── app.js                       # punkt wejścia aplikacji
├── app.json                     # konfiguracja Zepp OS, strony, uprawnienia
├── page/
│   ├── home/index.page.js       # lista kodów, SCROLL_LIST, kolory
│   ├── qr/index.page.js         # natywny widget QRCODE
│   └── view/index.page.js       # canvas dla 1D i pozostałych 2D
├── setting/index.js             # Settings App w Zepp App
├── app-side/index.js            # usługa app-side, GET_CODES i push zmian
├── shared/
│   ├── catalog.js               # definicje 51 typów kodów
│   ├── encode.js                # enkodowanie przez etiket
│   ├── draw.js                  # macierze, kreski, skala, obrót
│   ├── defaults.js              # domyślne kody, walidacja kolorów
│   └── polyfills.js             # polyfille pod QuickJS
├── utils/
│   ├── cache.js                 # cache kodów w localStorage
│   └── render.js                # layout i rysowanie na canvasie
├── assets/
│   ├── gt.r/                    # ikony i card-inner.png
│   └── gt.s/
├── scripts/patch-etiket.mjs     # patchowanie etiket pod QuickJS
├── test/run.mjs                 # testy kodowania i layoutu
└── dist/                        # buildy (ignorowane przez git)
```

---

## Szybki start

### Wymagania

- Node.js 18+
- npm
- Zeus CLI
- konto Zepp / zalogowany `zeus login`
- Zepp App z trybem deweloperskim
- Amazfit Active 2 Round

### Instalacja

```bash
git clone https://github.com/seythegamer/CodeVault-zeppos.git
cd CodeVault-zeppos
npm install
npx zeus login
```

`npm install` uruchamia `scripts/patch-etiket.mjs`, który przygotowuje bibliotekę `etiket` do działania w QuickJS (m.in. usuwa zależność od `BigInt`). Jeśli patch się nie wykona:

```bash
node scripts/patch-etiket.mjs
```

### Testy

```bash
npm test
```

Test sprawdza kodowanie i layout wszystkich 51 typów. Nie testuje skanowania fizycznym czytnikiem.

### Preview na zegarku

```bash
npm run preview -- -t "Amazfit Active 2 (Round)"
```

Albo bezpośrednio:

```bash
npx zeus preview -t "Amazfit Active 2 (Round)"
```

Następnie zeskanuj QR w Zepp App i zainstaluj aplikację. Kod QR preview wygasa po kilku dniach.

### Build

```bash
npm run build
```

Gotowy plik `.zab` pojawi się w `dist/`. Katalog `dist/` jest ignorowany przez git.

---

## Testy

```text
npm test
```

Zakres:

- 51/51 typów przechodzi enkodowanie,
- sprawdzany jest layout macierzy i kresek,
- sprawdzana jest minimalna skala i marginesy.

Czego **nie** ma:

- testów na prawdziwym zegarku,
- testów skanowania fizycznym czytnikiem,
- CI,
- testów wizualnych,
- testów regresji firmware.

---

## Gdzie poszliśmy na skróty

To jest świadoma lista kompromisów, nie ukrywanie problemów.

1. **Vibe-coding zamiast klasycznego procesu.**  
   Kod powstał w dialogu z AI, iteracyjnie. Nie ma tu historii code review, ADR-ów ani zespołowego procesu. Testy i ręczne sprawdzanie na dostępnym sprzęcie były jedyną bramką jakości.

2. **`etiket` jest patchowany w `node_modules`.**  
   `scripts/patch-etiket.mjs` modyfikuje pliki po `npm install`. To szybkie, ale kruche: aktualizacja `etiket` może zepsuć patch. Docelowo trzeba przypiąć dokładną wersję i vendorować poprawki.

3. **Brak natywnej ramki w `SCROLL_LIST`.**  
   Kolorowe obramowanie jest zrobione przez `item_bg_color` + wewnętrzny PNG. To hack, który może się różnie zachowywać na innych firmware'ach.

4. **Stabilność przez opóźnienia i flagi.**  
   Opoźniony render, cache-first i guardy nawigacji zmniejszają ryzyko crasha, ale nie usuwają przyczyny problemu w firmware.

5. **QR jest natywny, reszta rysowana ręcznie.**  
   Tylko zwykły QR korzysta z `QRCODE`. Pozostałe 50 formatów to własny layout na canvasie — większa kontrola, ale też większe ryzyko błędów wizualnych.

6. **Testy nie skanują kodów.**  
   Testy potwierdzają, że encoder i layout kończą się sukcesem. Nie potwierdzają, że każdy kod odczyta telefon lub skaner.

7. **Brak szyfrowania.**  
   Kody są zapisane jawnym tekstem w storage Zepp App i w `localStorage` zegarka. To nie jest sejf na hasła.

8. **Layout pod jeden ekran.**  
   UI jest strojone pod okrągłe 466×466. Na innych rozmiarach może wymagać poprawek.

9. **Tożsamość aplikacji jest lokalna.**  
   `appId: 20001` i `vender: "local"` to wartości do preview. Do publikacji w sklepie Zepp trzeba podmienić je na własne dane.

10. **Brak CI i brak licencji.**  
    Repozytorium nie ma pipeline'u ani pliku `LICENSE`. Przed publikacją jako open source warto dodać jedno i drugie.

---

## Bezpieczeństwo i prywatność

- Aplikacja nie wykonuje requestów sieciowych.
- Nie ma analityki, telemetrii ani zewnętrznych SDK.
- `app.json` nie deklaruje uprawnień sieciowych.
- Kody pozostają na telefonie i zegarku.
- W repozytorium nie ma danych logowania do GitHub, Zepp/Amazfit ani Zeusa.
- **Kody nie są szyfrowane.** Nie przechowuj w nich haseł, tokenów ani innych sekretów.

---

## Status projektu i roadmapa

Projekt jest funkcjonalny, ale nadal hobbystyczny. Największe braki:

- [ ] Testy na większej liczbie firmware'ów i modeli zegarków
- [ ] Weryfikacja wszystkich 51 formatów fizycznym skanerem
- [ ] Screenshoty do README
- [ ] CI z `npm test`
- [ ] Przypięcie `etiket` i vendorowanie patcha zamiast modyfikowania `node_modules`
- [ ] Adaptacyjny layout dla innych rozdzielczości
- [ ] Opcjonalne szyfrowanie danych
- [ ] Plik `LICENSE`

---

## Licencja

Brak pliku `LICENSE`. Jeśli chcesz udostępnić projekt jako open source, dodaj wybraną licencję — np. MIT.

---

## Podziękowania

- [Zepp OS Developers Documentation](https://docs.zepp.com/)
- Biblioteka [`etiket`](https://www.npmjs.com/package/etiket) do kodowania QR / 1D / 2D
- Społeczność Zepp OS
- AI jako partner w vibe-codingu

---

## Disclaimer

Projekt hobbystyczny, niepowiązany z Zepp Health ani Amazfit. Używaj na własną odpowiedzialność. Kody mogą nie działać z każdym czytnikiem — przed użyciem w praktyce przetestuj konkretny format i konkretne urządzenie.

