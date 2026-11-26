# Calmy — AI-Ready Design System

Thank you for choosing Calmy. This package has everything you need to design with Calmy in Figma, hand it to developers and let AI agents build real screens with it.

Version 1.0

---

## What's in the package

| File | What it is |
| --- | --- |
| `Calmy.fig` | The Figma file: foundations, components, documentation and example screens. |
| `README.md` | This guide. Start here. |
| `AI-GUIDE.md` | Rules for AI agents: principles, build order, token roles, styles. Add it to your AI tool's project rules. |
| `COMPONENTS.md` | Every component with when to use it, what to use instead, what never to do, and a short spec: properties, slots, tokens. |
| `tokens/tokens.json` | All 332 design tokens in the Design Tokens (DTCG) format, with Light and Dark values. |
| `tokens/tokens.css` | The same tokens as CSS variables. Light by default, Dark with one attribute. |

---

## What's inside the Figma file

- **120+ components with 674 variants.** All set up with variants, component properties, auto layout and slots.
- **332 variables in three collections:**
  - **Primitives (138):** raw values for colour, spacing, radius, type, borders and motion.
  - **Semantic (97):** roles like `surface/canvas`, `text/primary` or `action/primary`. Each has a Light and a Dark value.
  - **Component (97):** per-component sizes, density, breakpoints and grid.
- **15 text styles and 5 effect styles,** all built on Inter and JetBrains Mono.
- **800+ icons and 198 brand logos.** Icons share one stroke on a 24 px grid.
- **169 example screens on desktop and mobile, each with a Dark copy.** Nine products: AI finance, AI Transcriber, Vibe coding, Health, Tutor service, Lamp store, Mail, Task manager, AI notes. Plus 22 overlays shown over real screens.
- **Documentation on every component page:** Overview, Anatomy, types and states, Properties tables, Do and don't, Guidelines and a block written for AI agents.

---

## How the file is organised

Pages go from the base up. The empty pages with a dot are dividers.

1. **How to start:** an overview, a map of the file and how to build a screen in five steps.
2. **Foundations:** Colors, Typography, Icons and logo, Layout and shape.
3. **Components**, grouped as in the page list:
   - **Actions:** Buttons, Menu, Action bar, Toolbar.
   - **Inputs:** Text fields, Search, Selectors, Date picker, File upload, Checkbox & Radio, Switch, Segmented control, Slider, Color picker, Chips & Tags.
   - **Navigation:** App bar, Sidebar, Navigation bar, Page header, Tabs, Mega menu, Breadcrumbs, Pagination, Footer.
   - **Data display:** Card, List item, Table, Tree view, Accordion, Timeline, Chat message, Charts, Logo wall, QR code, Map pin, Nodes, Avatar, Badge, Kbd, Divider, Code snippet.
   - **Feedback & overlays:** Alerts & notifications, Progress, Skeleton, Empty state, Tooltip, Popover, Window, Command palette.
4. **Examples:** nine product examples and an Overlays page. Every screen has a Dark copy below it, and its frame name ends with " · Dark".

Every component page has three columns, left to right:

- **Component:** the main components with all variants. Change something here and every instance follows.
- **Docs & Examples:** anatomy, states, properties, rules, do and don't, and the component in real use.
- **For AI agents:** when to use the component, what to use instead, and a YAML spec an agent can read.

---

## Getting started

1. **Install the fonts:** [Inter](https://fonts.google.com/specimen/Inter) and [JetBrains Mono](https://fonts.google.com/specimen/JetBrains+Mono). Both are free.
2. **Open `Calmy.fig` in Figma** (drag it into the file browser, or use Import).
3. **Use it as a library:** publish it from the Assets panel. Then turn it on in your product files.
4. **Read the How to start page,** then the page of each component you plan to use.

### Build a screen in five steps

1. **Start with a frame** filled with `surface/canvas`. Put cards and panels on it with `surface/raised`.
2. **Take components from the Assets panel.** Don't copy pieces out of the docs and don't redraw them.
3. **Set everything through properties:** state, texts, icons, optional parts. Don't detach instances.
4. **Use tokens for anything of your own:**
   - colours from Semantic;
   - text from the typography styles;
   - spacing and radius from the space and radius tokens.
5. **Check Dark mode:** select the top frame and switch the Semantic collection to Dark. Nothing else should need a change.

---

## Light and Dark

Every Semantic token has a Light and a Dark value. To see a screen in Dark, select its frame and set the **Semantic** collection to **Dark** in the right panel.

> **Figma plan.** More than one variable mode needs a paid Figma plan (Professional or higher). On the free plan the file opens in Light, and switching to Dark is not available.

---

## Working with AI agents

Calmy is written so that AI tools pick the same components and tokens a designer would.

**What makes it AI-ready**

- **"For AI agents" block on every component page:** when to use the component, what to use instead, hard rules and a YAML spec with properties, slots and tokens.
- **Descriptions everywhere:** every component and every variable has a short one, so the reason behind a choice is in the file.
- **Clear names in English:** `surface/raised`, `text/secondary`, `Buttons / Type=Primary`.

**Set it up**

1. Add `AI-GUIDE.md` to your AI tool's project rules:
   - **Claude Code:** paste it into `CLAUDE.md` or keep it in the repository and reference it.
   - **Cursor:** add it to `.cursor/rules`.
   - **Claude or ChatGPT projects:** add it to the project files.
2. Add `COMPONENTS.md` next to it. It holds the full specs of all components.
3. To let the agent read and build inside Figma, connect the **Figma MCP server**: see Figma's guide on MCP for your tool. Point the agent at your copy of `Calmy.fig`.

**Prompts that work well**

- "Read the How to start page and the For AI agents column of Buttons, Text fields and Window. Then build a sign-in dialog from Calmy components."
- "Build a settings page for a mail app: List item with Switch, Segmented control for the tone, Rich text editor for the signature. Use only Calmy components and Semantic tokens."
- "Check this screen against AI-GUIDE.md: list every hex colour, detached instance and second primary button."

---

## Using the tokens in code

`tokens/tokens.css` defines every token as a CSS variable with the `--calmy-` prefix. Light is the default.

```html
<link rel="stylesheet" href="tokens/tokens.css">
<html data-theme="dark"> <!-- or "light"; without it the system setting decides -->
```

```css
.card {
  background: var(--calmy-surface-raised);
  color: var(--calmy-text-primary);
  border: var(--calmy-border-divider) solid var(--calmy-line-subtle);
  border-radius: var(--calmy-radius-card);
  padding: var(--calmy-space-inset);
}
```

`tokens/tokens.json` follows the Design Tokens Community Group format:

- **References:** tokens refer to each other, for example `{primitives.color.paper.100}`.
- **Dark values:** they sit under `$extensions["com.calmy.modes"]`.
- **Tools:** it works with Style Dictionary and Tokens Studio.

---

## Rules worth remembering

- **Tokens only:** no hex values or Primitives in a screen.
- **One primary action per view:** one `action/primary` button.
- **Instances, not copies:** never detach a component to change it.
- **Dark mode is a mode switch,** not a separate set of tokens.
- **Colour never carries meaning alone:** focus and errors also change shape or text.

---

## Credits

- **Fonts:** Inter and JetBrains Mono, both under the SIL Open Font License.
- **Brand logos:** they belong to their owners. They are included only to show integrations and social proof in your designs. Check each brand's guidelines before using them in a real product.

Version 1.0
