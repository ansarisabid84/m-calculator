# Google Play Store Listing — Calc (com.sabid.calculator)

## Main store listing (English – United States, en-US)

**App name** (max 30)
```
Calc: Scientific & Converter
```

**Short description** (max 80)
```
Calculator, scientific mode, unit & currency converter, health and money tools.
```

**Full description** (max 4000)
```
Calc is a beautiful, fast calculator that does a lot more than add numbers. Standard and scientific modes, a live unit and currency converter, health calculators and everyday money tools — all in one clean, modern app. No ads. No sign-up. No clutter.

CALCULATE YOUR WAY
• See the answer as you type, before you even press equals
• Tap any calculation to edit it. Move the caret, fix a number in the middle, and the answer updates live
• Swipe the display or long-press backspace to delete quickly
• Memory keys (MC, MR, M+, M−, MS) that remember between sessions
• Calculation history: reuse a result, edit the original expression, or copy it
• Your unfinished calculation is still there when you come back
• One-tap copy and paste of results and expressions

FULL SCIENTIFIC MODE
Switch between Standard and Scientific with one tap — your calculation comes with you.
• sin, cos, tan and their inverses, plus hyperbolic sinh, cosh and tanh
• log, ln, 10ˣ, eˣ, square and cube roots, powers, factorial
• Permutations (nPr), combinations (nCr), modulo, absolute value, reciprocal
• π, e and τ constants, Ans (last answer), parentheses
• Degrees or radians
• Smart parsing: 2(3+4), 3π and 2sin30 all just work

CONVERT ANYTHING
• Length, weight, temperature, area, volume, speed, data and time
• Live currency conversion for 30 currencies, with offline fallback rates
• Number bases: decimal, hex, binary and octal
• Swap units instantly

HEALTH CALCULATORS
• BMI with a clear visual gauge and category
• Daily calorie needs (BMR and TDEE)
• Ideal weight, daily water intake, pregnancy due date
• Running pace and sleep-cycle planner

EVERYDAY TOOLS
• Tip and bill splitter
• Discount and sale price
• Loan EMI with total interest
• GST / VAT: add or remove
• Compound interest and SIP (monthly investment) calculator
• Profit margin, fuel cost, electricity bill, unit-price comparison
• Percentage calculator in every direction
• Statistics: sum, average, median, min, max, range, standard deviation
• Fraction simplifier, time add/subtract, date add/subtract
• Age calculator, date difference, speed-distance-time, Roman numerals

DESIGNED TO FEEL GREAT
• Modern liquid-glass design with smooth animations
• Light, dark or automatic theme
• Large, comfortable keys that fill your screen — phones and tablets
• Optional haptic feedback on every key press
• Choose your decimal places and thousands separator

PRIVATE BY DESIGN
• No account, no ads, no tracking
• Your history and settings stay on your device
• The only network request is fetching public exchange rates for the currency converter

Calc is the one calculator app you'll keep on your home screen. Download it and see.
```

## Store settings

| Field | Value |
|---|---|
| App type | App |
| Category | Tools (alternative: Productivity) |
| Tags (pick up to 5) | Calculator, Unit converter, Finance tools, Health & fitness tools, Productivity |
| Pricing | Free |
| Contains ads | No |
| In-app purchases | No |
| Contact email | *(add your support email)* |
| Website | *(optional)* |
| Privacy policy URL | *(required — see "Privacy policy" below)* |

## What's new (max 500) — v1.0
```
Brand new liquid-glass design.
• Edit any calculation: tap the expression to change it in place
• Scientific mode now lives inside Calc, with nPr, nCr, mod, hyperbolic functions and more
• Live answer preview, memory keys, copy/paste, swipe to delete
• New tools: statistics, fractions, time and date calculators
• Choose decimal places and thousands separator in Settings
```

## Graphic assets (this folder)

| Play Console field | File | Size |
|---|---|---|
| App icon | `icon/app_icon_512.png` | 512 × 512 |
| Feature graphic | `feature_graphic/feature_graphic.png` | 1024 × 500 |
| Phone screenshots (8) | `phone/01_calc.png … 08_history.png` | 1080 × 1920 |
| 7-inch tablet screenshots (8) | `tablet_7inch/…` | 1080 × 1920 |
| 10-inch tablet screenshots (8) | `tablet_10inch/…` | 1080 × 1920 |

Screenshot order and captions:
1. `01_calc` — A calculator that feels brilliant
2. `02_edit` — Tap to edit any calculation
3. `03_scientific` — Full scientific mode
4. `04_convert` — Live currency & unit converter
5. `05_health` — Health numbers in a tap
6. `06_tools` — Loan, tip, GST & more tools
7. `07_stats` — Stats, fractions, dates & time
8. `08_history` — History you can reuse

Regenerate everything with `node resources/make_store_v2.mjs` (see header of that file).

## App content answers

**Privacy policy** — Required by Play even for apps that collect nothing. Host a short page stating: Calc does not collect, store on a server, or share personal data; calculation history and settings are stored only on the device; the currency converter requests public exchange rates from open.er-api.com, which receives the device's IP address like any web request.

**Data safety form**
- Does your app collect or share any required user data types? **No**
- Is all data encrypted in transit? **Yes** (HTTPS)
- Can users request data deletion? Not applicable — no data is collected
- Note: the exchange-rate request (open.er-api.com) sends no user-provided data.

**Ads:** No. **Target audience:** 13+ / general (not designed for children — pick 18+ if you want to avoid the Families policy requirements). **News app:** No. **COVID-19 app:** No. **Government app:** No. **Financial features:** No (calculators only; no loans offered, no money movement). **Health apps declaration:** Select "Fitness / health information tools only — not a medical device"; add in-app/description note that BMI, calorie and pregnancy results are informational and not medical advice.

**Content rating questionnaire (IARC):** Category "Utility, Productivity, Communication or Other". Violence: No. Sexual content: No. Profanity: No. Controlled substances: No. User-generated content / sharing: No. Location sharing: No. Digital purchases: No. Expected rating: **Everyone / PEGI 3**.

**Permissions used:** `INTERNET` (exchange rates), `VIBRATE` (haptic feedback). No sensitive permissions.

**App access:** All functionality available without login.

## Release checklist
1. `npm run build && npx cap sync android`, then build a signed **AAB** in Android Studio (Build → Generate Signed Bundle) using `keystore/keystore.jks`. Keep the keystore and its passwords backed up safely and never commit them.
2. Bump `versionCode` / `versionName` in `android/app/build.gradle` for each upload.
3. Play Console → Create app → fill Main store listing with the text above and upload the assets.
4. Complete App content (privacy policy, Data safety, Content rating, Target audience, Ads, Health declaration).
5. New personal developer accounts must run a **closed test (12+ testers, 14 days)** before requesting Production access.
6. Create a release on Closed/Production track, upload the AAB, paste the "What's new" text, submit for review.

## Translations (optional, localized short descriptions)
- **hi-IN:** कैलकुलेटर, साइंटिफिक मोड, यूनिट व करेंसी कन्वर्टर, हेल्थ और मनी टूल्स।
- **es-ES:** Calculadora, modo científico, conversor de unidades y divisas, salud y finanzas.
- **fr-FR:** Calculatrice, mode scientifique, convertisseur d'unités et devises, santé et finances.
