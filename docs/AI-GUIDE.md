# Calmy — guide for AI agents

Give this file to any AI tool that builds or reviews screens with Calmy: Claude Code (`CLAUDE.md`), Cursor (`.cursor/rules`), Claude or ChatGPT projects. Specs of every component are in `COMPONENTS.md`. Token values for code are in `tokens/tokens.css` and `tokens/tokens.json`.

Calmy is a calm, general-purpose design system for web and mobile products: apps, dashboards and tools. Warm paper canvas, white raised surfaces, near-black ink, one bright blue for actions and ten soft hues for tags, alerts, avatars and charts. Inter for UI, JetBrains Mono for code.

---

## Read first

1. The **How to start** page of the Figma file, then the four Foundation pages: Colors, Typography, Icons and logo, Layout and shape.
2. For every component you plan to use: its page, the **For AI agents** column and the YAML spec at its end. The same specs are in `COMPONENTS.md`.
3. Component descriptions and variable descriptions say the same in short. Read them when a choice is unclear.

## Build order

1. Frame on `surface/canvas`. Cards and panels on it with `surface/raised`.
2. Layout with the space tokens: `space/inline` 8, `space/stack` 12, `space/section` 24, `space/inset` 24.
3. Component instances from the library. Search the Assets panel by name before drawing anything.
4. Set states, texts, icons and optional parts through component properties.
5. Texts last. English, sentence case, verbs on buttons.
6. Check Dark: switch the Semantic collection of the top frame to Dark. Nothing else should need a change.

## Never

- Hex values, Primitives or raw numbers in a screen or a component.
- Detached instances or states set by hand.
- New colours, sizes, radii, line weights or text styles.
- A second `action/primary` button in one view.
- Colour as the only sign of focus, an error or a status.
- A look-alike built from frames when a component exists. When nothing fits, say so.
- Texts or layer names in a language other than English.

## Principles

- **Calm by default.** Warm paper and white surfaces, no shadows at rest. Colour appears only where it means something: an action, a status or a tone.
- **One clear next step.** Every view has a single primary action. People should never wonder what to press.
- **Colour carries meaning, not decoration.** Tones label categories, statuses and people. The same hue always means the same thing inside a product.
- **Readable first.** Text roles pass 4.5:1. Focus is shown by a thicker line, not by colour alone. Motion respects reduced-motion settings.
- **Built for people and machines.** Every token has a role name and a description, so designers, developers and AI tools pick the same token for the same job.

---

## Variables

| Collection | Count | Modes | Use |
| --- | --- | --- | --- |
| Primitives | 138 | one | Raw values. Reference only, never in screens. |
| Semantic | 97 | Light, Dark | Roles. Use these for every fill, stroke, text, radius and gap. |
| Component | 97 | one | Per-component sizes, density, breakpoints and grid. |

## Colour: how to pick

- Fill of a layer → `surface/*`. Page: `canvas`. Card or field: `raised`. Menu or popover: `floating`. Recessed block inside a card: `sunken`.
- Text or icon → `text/*`. Outline → `line/*`.
- Button or selected control → `action/*`.
- Meaning → `status/*` for dots and icons; `text/positive` and `text/negative` for words and numbers.
- Tag, alert, avatar, chart → `tone/<hue>/soft` fill with `tone/<hue>/on-soft` text; `tone/<hue>/solid` for dots and chart series.
- Icons take the same token as the text next to them.

Pairs that always go together:

| Fill | Text and icons on it |
| --- | --- |
| `action/primary` | `text/on-action` |
| `action/danger` | `text/on-action` |
| `surface/inverse` | `text/on-inverse` |
| `tone/<hue>/soft` | `tone/<hue>/on-soft` |
| `action/disabled` | `text/disabled` |
| `surface/code` | `text/code`, `text/code-muted` |

Tone hues: blue, green, orange, pink, yellow, lime, teal, violet, red, clay. One meaning per hue inside a product: blue info, green success, orange warning, red error. Field errors are the exception: `line/negative`, `text/negative` and `status/negative` are orange, calmer than red; red is for critical statuses and `action/danger`.

### Semantic colour tokens

| Token | Light | Dark | Use |
| --- | --- | --- | --- |
| `surface/canvas` | #F2EFE9 | #141312 | Page background behind everything. |
| `surface/raised` | #FFFFFF | #1F1D1B | Cards, fields, dialogs: anything that sits on the canvas. |
| `surface/floating` | #FFFFFF | #292624 | Dropdowns, menus, popovers: layers above raised surfaces. |
| `surface/sunken` | #EDE9E2 | #181715 | Recessed areas inside a raised surface: filled fields, selected rows, quiet blocks. |
| `surface/disabled` | #F2EFE9 | #292624 | Disabled fields and controls, skeletons. |
| `surface/hover` | #F2EFE9 | #2E2B28 | Hover of list items, menu rows and ghost buttons. |
| `surface/scrim` | #1E1E1E 60% | #000000 70% | Dim layer behind dialogs. |
| `surface/inverse` | #474747 | #E9E5DE | Dark surface on light UI: tooltips, toasts. |
| `surface/track` | #DDD6CA | #433E39 | Unfilled part of a measure: empty rating shapes, progress and slider tracks. |
| `surface/selected` | #EAF5FE | #16293A | Selected row or item, and the bar with actions for the selection: a light wash of the action colour. |
| `surface/shimmer` | #FFFFFF | #38342F | Moving highlight of skeleton placeholders: lighter than surface/disabled in both themes. |
| `surface/code` | #1F1D1B | #292624 | Code blocks: always dark in both themes, a step lighter in Dark so it stands off raised cards. |
| `text/primary` | #1E1E1E | #F4F1EC | Titles, body text, icons. |
| `text/secondary` | #474747 | #CFC9C0 | Descriptions and supporting text. |
| `text/tertiary` | #707070 | #A39D94 | Placeholders, captions, meta, disabled text. |
| `text/on-action` | #1E1E1E | #1E1E1E | Text and icons on action/primary: dark ink, 7.1:1 on the brand blue. |
| `text/on-inverse` | #FFFFFF | #1E1E1E | Text and icons on surface/inverse. |
| `text/negative` | #B8441A | #FF7647 | Error message under a field. Darker than the orange outline so it passes 4.5:1 on raised and canvas. |
| `text/link` | #0A6BB8 | #6BC1FF | Links and text buttons. Darker than action/primary so it passes 4.5:1 on raised and canvas. |
| `text/disabled` | #1E1E1E 38% | #F4F1EC 38% | Text and icons of disabled controls. |
| `text/positive` | #157033 | #A6E8BC | Money in, gains and other good numbers in text. status/positive is for dots and icons. |
| `text/code` | #F4F1EC | #F4F1EC | Code text on surface/code. Same in both themes. |
| `text/code-muted` | #A39D94 | #A39D94 | Language label, Copy action and comments on surface/code. |
| `line/subtle` | #1E1E1E 12% | #F4F1EC 12% | Card outlines and dividers: 12% ink. |
| `line/field` | #1E1E1E 12% | #F4F1EC 16% | Field outline at rest. |
| `line/strong` | #707070 | #A39D94 | Outline of a hovered field or a selected card. |
| `line/focus` | #1E1E1E | #F4F1EC | Outline of a focused field or control. |
| `line/negative` | #FF7647 | #FF7647 | Outline of a field with an error. |
| `action/primary` | #44B1FF | #44B1FF | Main action: primary button, selected control, progress, slider. |
| `action/primary-hover` | #1E9BF0 | #6BC1FF | action/primary under the cursor. |
| `action/primary-pressed` | #0F86D6 | #1E9BF0 | action/primary while pressed. |
| `action/secondary` | #F2EFE9 | #2E2B28 | Secondary button fill. |
| `action/secondary-hover` | #E8E3DA | #38342F | action/secondary under the cursor. |
| `action/secondary-pressed` | #DDD6CA | #433E39 | action/secondary while pressed. |
| `action/disabled` | #F2EFE9 | #292624 | Fill of any disabled action; its text uses text/disabled. |
| `action/danger` | #F2545B | #F2545B | Fill of a destructive action: delete, remove, revoke. |
| `action/danger-hover` | #E0444B | #F7777C | Destructive action under the pointer. |
| `action/danger-pressed` | #CC363D | #E0444B | Destructive action while pressed. |
| `status/positive` | #65DC8D | #65DC8D | Done, online, saved. |
| `status/negative` | #FF7647 | #FF7647 | Errors and destructive actions. Orange, not red. |
| `status/warning` | #FFC93C | #FFC93C | Needs attention, not an error. |
| `status/info` | #44B1FF | #44B1FF | Neutral information. |
| `tone/blue/soft` | #A2D1F1 | #173247 | Blue block: info alert, tag, chat bubble, avatar. |
| `tone/blue/on-soft` | #1D4F73 | #A9D8FA | Text on tone/blue/soft. |
| `tone/blue/solid` | #44B1FF | #44B1FF | Blue: chart series, dots, icons. |
| `tone/green/soft` | #B9E9C5 | #173A25 | Green block: success alert, tag, avatar. |
| `tone/green/on-soft` | #157033 | #A6E8BC | Text on tone/green/soft. |
| `tone/green/solid` | #65DC8D | #65DC8D | Green: chart series, dots, icons. |
| `tone/orange/soft` | #FFD0AD | #4A2617 | Orange block: warning alert, chat bubble, tag. |
| `tone/orange/on-soft` | #82450D | #FFC2A1 | Text on tone/orange/soft. |
| `tone/orange/solid` | #FF7647 | #FF7647 | Orange: chart series, dots, icons. |
| `tone/pink/soft` | #E7C9F1 | #3A2445 | Pink block: alert, tag, avatar. |
| `tone/pink/on-soft` | #4A265A | #ECC6FF | Text on tone/pink/soft. |
| `tone/pink/solid` | #E4ACFF | #E4ACFF | Pink: decorative marks, chart series. |
| `tone/yellow/soft` | #FFE7A3 | #42340F | Yellow block: notice, tag, avatar. |
| `tone/yellow/on-soft` | #7A5600 | #FFDF85 | Text on tone/yellow/soft. |
| `tone/yellow/solid` | #FFC93C | #FFC93C | Yellow: ratings, highlights, chart series. |
| `tone/lime/soft` | #DDF3B4 | #2C3A14 | Lime block: tag, avatar. |
| `tone/lime/on-soft` | #3F6212 | #CDEB98 | Text on tone/lime/soft. |
| `tone/lime/solid` | #A8E04B | #A8E04B | Lime: chart series, dots. |
| `tone/teal/soft` | #AEE9E2 | #123A36 | Teal block: tag, avatar. |
| `tone/teal/on-soft` | #0F5E57 | #94E3D9 | Text on tone/teal/soft. |
| `tone/teal/solid` | #2EC4B6 | #2EC4B6 | Teal: chart series, dots. |
| `tone/violet/soft` | #D3CCFF | #2A2556 | Violet block: tag, avatar, premium marks. |
| `tone/violet/on-soft` | #3B2F8F | #C9C0FF | Text on tone/violet/soft. |
| `tone/violet/solid` | #8B7BFF | #8B7BFF | Violet: chart series, dots. |
| `tone/red/soft` | #FFC2C4 | #4A1B1E | Red block: critical alert, tag. |
| `tone/red/on-soft` | #8F1D22 | #FFB3B6 | Text on tone/red/soft. |
| `tone/red/solid` | #F2545B | #F2545B | Red: critical marks, chart series. |
| `tone/clay/soft` | #EBD3C0 | #3B2A1E | Clay block: tag, avatar. |
| `tone/clay/on-soft` | #6B4022 | #E6C4A9 | Text on tone/clay/soft. |
| `tone/clay/solid` | #C98B5E | #C98B5E | Clay: warm neutral accent, chart series. |

### Semantic size, border and motion tokens

| Token | Value | Use |
| --- | --- | --- |
| `radius/tight` | 4 | Checkbox, small tags. |
| `radius/inner` | 8 | Elements nested in a field or row. Rule: inner = outer − inset, never larger than the parent. |
| `radius/field` | 12 | Fields, selects, search, dropdown rows. |
| `radius/card` | 16 | Cards, dialogs, dropdown lists, alerts. |
| `radius/round` | full | Buttons, chips, avatars, tracks. |
| `space/inline` | 8 | Between neighbours in a row: icon and label, label and field. |
| `space/stack` | 12 | Between fields and groups inside a card. |
| `space/section` | 24 | Between sections on a page. |
| `space/inset` | 24 | Inner padding of cards and dialogs. |
| `space/gutter` | 24 | Page side padding. |
| `border/divider` | 1 | Dividers and card outlines. |
| `border/field` | 1 | Field and control outline at rest. |
| `border/focus` | 1.5 | Outline of a focused field or control: thicker so focus does not rely on colour alone. |
| `border/selected` | 1.5 | Selected card, option or tile. |
| `border/emphasis` | 2 | Rare strong outline: drop zones, active step. |
| `motion/duration/tooltip` | 80 ms | Tooltips and small hints: appear almost at once. |
| `motion/duration/feedback` | 150 ms | Hover, press, toggles, checkbox ticks. |
| `motion/duration/transition` | 220 ms | Tabs, accordions, content swaps, dropdowns. |
| `motion/duration/overlay` | 320 ms | Dialogs, bottom sheets, page-level panels. |
| `motion/easing/standard` | `cubic-bezier(0.2, 0, 0, 1)` | Default curve for anything that moves or resizes on screen. |
| `motion/easing/enter` | `cubic-bezier(0, 0, 0, 1)` | Elements appearing: decelerate into place. |
| `motion/easing/exit` | `cubic-bezier(0.3, 0, 1, 1)` | Elements leaving: accelerate away. |
| `motion/distance/nudge` | 4 | Small shift on hover or press. |
| `motion/distance/enter` | 8 | Dropdowns and toasts slide in by this much. |
| `motion/distance/sheet` | 16 | Dialogs and sheets rise by this much. |

---

## Typography

Use the text styles; never set a size, line height or weight by hand. Weights: Regular, Medium (only `caption-medium`), Semi Bold.

| Style | Font | Size / line | Use |
| --- | --- | --- | --- |
| `typography/display` | Inter Semi Bold | 32/40 | Big figures: stat values, chart totals. |
| `typography/h1` | Inter Semi Bold | 36/44 | Page title, desktop. One per page. |
| `typography/h2` | Inter Semi Bold | 28/36 | Section title, desktop. |
| `typography/h3` | Inter Semi Bold | 20/28 | Card or dialog title, desktop. |
| `typography/h1-mobile` | Inter Semi Bold | 24/32 | Page title, mobile (below 768). |
| `typography/h2-mobile` | Inter Semi Bold | 20/28 | Section title, mobile. |
| `typography/h3-mobile` | Inter Semi Bold | 16/22 | Card title, mobile. |
| `typography/body-lg` | Inter Regular | 16/24 | Lead text, chat messages, field values. |
| `typography/body-lg-strong` | Inter Semi Bold | 16/24 | Names, prices, emphasis in lead text. |
| `typography/body` | Inter Regular | 14/20 | Default UI text: list rows, descriptions. |
| `typography/label` | Inter Semi Bold | 14/20 | Buttons, tabs, emphasis in UI text. |
| `typography/caption` | Inter Regular | 12/16 | Field labels, helper and error text, meta. |
| `typography/caption-strong` | Inter Semi Bold | 12/16 | Small labels and counters. |
| `typography/caption-medium` | Inter Medium | 12/16 | Tags. |
| `typography/code` | JetBrains Mono Regular | 13/20 | Code, commands and token names. |

Text colour: titles and body `text/primary`, descriptions `text/secondary`, hints and meta `text/tertiary`, links `text/link`, errors `text/negative`.

## Elevation

| Effect style | Shadow | Use |
| --- | --- | --- |
| `elevation/flat` | none | Cards and content at rest. |
| `elevation/lifted` | 0 2 8, ink 6% | A card under the cursor or being dragged. |
| `elevation/floating` | 0 4 16, ink 8% | Dropdowns, tooltips, popovers. |
| `elevation/modal` | 0 12 32, ink 14% | Dialogs. |
| `focus/ring` | 1 px spread, ink | Keyboard focus. Never as decoration. |

## Layout, shape and motion

```yaml
space: { inline: 8, stack: 12, section: 24, inset: 24, gutter: 24 }
scale: [2, 4, 6, 8, 10, 12, 14, 16, 20, 24, 32, 40, 48, 64, 80]
radius: { tight: 4, inner: 8, field: 12, card: 16, round: full }
nested_radius: inner = outer - inset, never larger than the parent; one rounded layer inside a card at most
border: { divider: 1, field: 1, focus: 1.5, selected: 1.5, emphasis: 2 }
motion:
  duration: { tooltip: 80, feedback: 150, transition: 220, overlay: 320 }   # ms
  easing: { standard: "cubic-bezier(0.2, 0, 0, 1)", enter: "cubic-bezier(0, 0, 0, 1)", exit: "cubic-bezier(0.3, 0, 1, 1)" }
  distance: { nudge: 4, enter: 8, sheet: 16 }
grid:
  mobile:  { from: 390,  columns: 4,  gutter: 16, margin: 16 }
  tablet:  { from: 768,  columns: 8,  gutter: 20, margin: 32 }
  desktop: { from: 1280, columns: 12, gutter: 24, margin: 40 }
  container: { max: 1200, reading: 720, panel: 360, dialog: 480 }
density:
  default: { rowHeight: 56, controlHeight: 44, controlPadX: 16, listGap: 12 }
  compact: { rowHeight: 44, controlHeight: 36, controlPadX: 12, listGap: 8 }
```

## Icons and logo

- Icons are components named `category/name`: `actions/close`, `arrows/chevron`, `finance/card-05`. Default size 24, 20 in dense controls, 16 inside small text.
- Swap icons through the component's icon property. Never paste a vector or detach an icon.
- An icon takes the same `text/*` token as its label. An icon without a label needs a tooltip and an accessible name.
- `brand/*` logos keep their own colours.
- The Calmy logo is the `Logo` component: Type Full or Mark, Colour Default on light and Inverse on dark, Plate On over busy backgrounds.

## Composition patterns

- Calm surfaces: content sits on white `surface/raised` blocks over `surface/canvas`, with radius 20–28. No outlines or shadows at rest.
- Inside a card, zones are split by a thin `line/subtle` line, not by nested frames.
- Little content → a narrow centred column of 600–900 on a 1440 canvas. Wide content → full container, about 1200.
- One main action per screen. Primary buttons are blue pills, Secondary sand pills; a Secondary on `surface/canvas` gets a white fill.
- Pastel tones are rare accents: one or two per screen.
- Popups are `Window` over `surface/scrim`; on phones, `Bottom sheet`.
- Loading → a Skeleton of the same structure as the real card.
- People are shown with photo avatars, one letter when there is no photo.

---

## Components

- **Actions:** Buttons (+ Action button, Button group, Link), Menu (+ Action list), Action bar, Toolbar.
- **Inputs:** Text fields (Inputs, Text areas, Label, Help text, Number input, Phone input, Code input, Rich text editor), Search (+ Autocomplete, Filter input), Selectors (+ Multi selector, Dropdown), Date picker (+ Date cell, Date option, Time picker), File upload (Upload zone, File item), Checkbox & Radio (+ Radio selector), Switch, Segmented control, Slider, Color picker, Chips & Tags.
- **Navigation:** App bar, Sidebar, Navigation bar, Page header, Tabs, Mega menu, Breadcrumbs, Pagination, Footer.
- **Data display:** Card (+ Stat, Order, Subscription, Kanban, Activity, Integration, Pricing, Payment cards), List item, Table (Data table and its parts), Tree view, Accordion, Timeline, Chat message (+ bubble, composer, widget), Charts (14 chart components), Logo wall, QR code, Map pin, Nodes, Avatar (+ Avatar group), Badge, Kbd, Divider, Code snippet.
- **Feedback & overlays:** Alerts & notifications (Alert, Inline message, Snackbar, Notification, Notification panel), Progress (Progress bar, Progress indicator, Stepper), Skeleton, Empty state, Tooltip, Popover, Window (+ Drawer, Bottom sheet), Command palette.

**Pick fast**

| Need | Component |
| --- | --- |
| Start an action | Buttons. Icon only: Action button. Navigation: Link. |
| One value from 5+ options | Selectors. 2–4 options: Segmented control or Radio. Long list: Autocomplete. |
| On/off that applies at once | Switch. Applied on Save: Checkbox. |
| Read-only status or category | Tag. Interactive filter: Chip. Count: Badge. |
| Many objects with the same fields | Data table. Name plus one fact: List item. |
| Result of an action | Snackbar. Page state: Alert. While away: Notification. |
| Decision that blocks the flow | Window. Details next to a list: Drawer. Phones: Bottom sheet. |
| Short task tied to a trigger | Popover. Only actions: Menu. Read-only hint: Tooltip. |
| Loading | Skeleton for a known layout, Progress bar for a known amount, Progress indicator otherwise. |

Full specs: `COMPONENTS.md`.
