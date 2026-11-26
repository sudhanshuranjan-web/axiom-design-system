# AXIOM origins

AXIOM keeps its rules. AtomGo v3.2 supplies the look. The layer lives in `tokens/axiom-brand.css`, and `<html data-brand="axiom">` turns it on. The showcase (`index.html`) runs AtomGo only: `data-brand="axiom"` is fixed on the page. AXIOM's original values stay in `tokens/tokens.css` as the base layer the brand sits on.

## What comes from AtomGo

| Area | AXIOM default | AtomGo value now applied |
| --- | --- | --- |
| Canvas / raised / sunken | Paper `#F2EFE9` / white / sand | `neutral-50` / white / `neutral-100` |
| Ink | `#1E1E1E`, `#474747`, `#707070` | `#000`, `neutral-700`, `neutral-500` |
| Primary action | Sky blue `#44B1FF` with dark text | Indigo-600 `#4f46e5` with white text (6.3:1), hover and pressed 700, in Light and Dark. Not 500: white on `#6366f1` is 4.47:1, under the 4.5:1 rule |
| Secondary action | Sand fill | White surface, 1px hairline and `shadow-xs` (`--ax-btn-ring`) |
| Links / focus line | Dark blue / ink | Indigo-600 (`cobalt`) |
| Danger | `#F2545B` | Red-600 |
| Status | Green, orange, yellow, blue | Green-600, orange-600, amber-500, blue-600 |
| Type | Inter + JetBrains Mono, weights 400/600 | Geist + Geist Mono, weights 400/500 |
| Type sizes | h1 36, h2 28, h3 20, body 14, label 14, caption 12 | h1 28, h2 22, h3 18, body-lg 15, body 14, label 13, caption 12, code 12 |
| CTA curve | Pill (`radius/round`) | 4px on anything you click (`--ax-radius-control`) |
| Containers | Fields 12, cards 16, dialogs 32 | Fields 4, cards 6, dialogs and panels 8 |
| Surfaces at rest | No outline | 1px hairline (`--ax-card-ring`), still no shadow |
| Chart series 1–6 | Blue, violet, teal, yellow, pink, orange | Indigo, emerald, violet, amber, sky, rose (600s for the light hues in Dark) |
| Elevation | Soft ink shadows | AtomGo `shadow-xs` / `shadow-pop` |
| Motion curves | standard `(0.2,0,0,1)`, enter `(0,0,0,1)`, exit `(0.3,0,1,1)` | ease-out-quart `(0.25,1,0.5,1)`, ease-out-expo `(0.16,1,0.3,1)`, ease-in `(0.5,0,0.75,0)`; press 90 ms, exit 150 ms, sheet 260 ms |

## What stays AXIOM

- **Token roles and pairs.** Screens still use `surface/*`, `text/*`, `line/*`, `action/*`, `status/*` and `tone/<hue>/*`. Only the values change, so a screen built for one brand works in the other.
- **One primary action per view.**
- **Meaning by tone.** Blue is info, green success, orange warning, red critical. Field errors stay orange, calmer than red (`text/negative`, `line/negative`).
- **Ten tone names.** They map onto AtomGo's ramps: pink → rose, yellow → amber, lime → emerald, teal → sky, violet → indigo, clay → neutral.
- **Focus is a thicker line (1.5px),** so it never depends on colour.
- **Charts:** six series at most, in a fixed order that never cycles. One accent bar per chart, and bars start at zero.
- **Spacing roles, component sizes and density:** buttons are 48/40/32 and fields 48.
- **Motion:** the decision framework (keyboard actions never animate, UI stays under 300 ms, exit is faster than enter) and the reduced-motion behaviour.

## Adding another brand

1. Copy `tokens/axiom-brand.css` to `tokens/brand-<name>.css` and change the selector to `html[data-brand="<name>"]`.
2. Set the AXIOM roles to your values in the light block and in both dark blocks.
3. Set the brand hooks:
   - `--ax-w-strong`
   - `--ax-radius-control`
   - `--ax-radius-panel`
   - `--ax-btn-ring`
   - `--ax-card-ring`
   - `--ax-chart-1…6`
4. Never add roles or change component structure in a brand file.
