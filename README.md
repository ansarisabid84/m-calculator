# Calc — Precision Toolkit

A modern, single-codebase calculator for **Android + iOS** (and the web), built with
**Vite + React 18 + Capacitor 6**. App ID: `com.sabid.calculator`.

## What's inside

Five modes via the bottom tab bar:

| Mode | Features |
|------|----------|
| **Calc** | Standard arithmetic + an *Advanced* toggle (parentheses, power, √, %). Live result preview, calculation history (tap to reuse). |
| **Science** | Full scientific keypad — trig (DEG/RAD), inverse trig via `2nd`, log/ln/eˣ/10ˣ, powers, roots, factorial, π/e, constants, `Ans`. |
| **Convert** | Length, Weight, Temperature, Area, Volume, Speed, Data, Time, and **live Currency** (30 currencies, offline fallback rates + one-tap refresh). |
| **Health** | **BMI** with a visual gauge + category, daily **Calories** (BMR/TDEE, Mifflin–St Jeor), **Ideal weight** (Devine). |
| **Tools** | **Tip** splitter, **Discount**, **Loan EMI**, **GST/VAT** (add or remove), **Age** calculator, **Date difference**. |

Plus: light/dark theme (persisted, syncs the native status bar), haptic key feedback on device,
safe-area handling for notches/home indicators, and a custom app icon.

## Design

A "precision-instrument" identity: graphite surfaces, a single warm amber accent (a nod to
vintage display backlights), and a monospace **readout** styled like a real instrument screen.
Type: Space Grotesk (display) / Inter (UI) / IBM Plex Mono (numbers).

## The math engine

`src/lib/evaluate.js` is a dependency-free recursive-descent parser — no `eval`, no `math.js`.
It handles operator precedence, right-associative powers, unary minus, factorial, percent,
implicit multiplication (`2(3+1)`, `3π`, `2sin30`), scientific notation, and DEG/RAD trig.

## Run it

```bash
npm install
npm run dev          # web dev server at http://localhost:5173
```

## Build for mobile

First time only — add the native platforms:

```bash
npm run build
npx cap add android
npx cap add ios       # macOS only
```

Then to build + open the native projects:

```bash
npm run android       # build, sync, open Android Studio
npm run ios           # build, sync, open Xcode (macOS)
```

`npm run sync` rebuilds the web bundle and copies it into both native projects.

### App icons

Icons are generated into `public/` by:

```bash
python3 resources/make_icons.py
```

For native launcher icons, point `@capacitor/assets` (or Android Studio's Image Asset / Xcode's
asset catalog) at `public/icon-1024.png`.

### iOS notes (from past setup)

If `npx cap open ios` or the pod install step fails, the usual culprits are the Xcode command-line
tools path and CocoaPods:

```bash
sudo xcode-select -s /Applications/Xcode.app/Contents/Developer
sudo gem install cocoapods            # or: brew install cocoapods
cd ios/App && pod install && cd ../..
```

## Currency rates

Offline fallback rates ship in `src/lib/currency.js` so the converter always works. When online,
the app fetches live rates from `open.er-api.com` (no API key) and caches them via the storage
layer. The "Refresh" button forces an update.

## Project layout

```
src/
  lib/         evaluate, format, converters, currency, tools, storage, native, history
  components/  Header, TabBar, Display, Keypad, Field, Theme
  screens/     Calc, Scientific, Convert, Health, Tools
  styles/      tokens.css (theme), global.css (layout)
```
