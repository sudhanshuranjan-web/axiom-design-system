# Calmy — components

Every component of Calmy: when to use it, what to use instead, what never to do, and a spec with properties, slots and tokens. The same text lives in the **For AI agents** column of each component page in the Figma file.

Property names match Figma. `↳ Name` is a nested property that appears when its boolean is on. Token names are Semantic or Component variables (see `AI-GUIDE.md`).

**Contents**

- **Actions:** [Buttons](#buttons) · [Menu](#menu) · [Action bar](#action-bar) · [Toolbar](#toolbar)
- **Inputs:**
  - [Text fields](#text-fields) · [Search](#search) · [Selectors](#selectors) · [Date picker](#date-picker) · [File upload](#file-upload)
  - [Checkbox & Radio](#checkbox--radio) · [Switch](#switch) · [Segmented control](#segmented-control) · [Slider](#slider) · [Color picker](#color-picker) · [Chips & Tags](#chips--tags)
- **Navigation:**
  - [App bar](#app-bar) · [Sidebar](#sidebar) · [Navigation bar](#navigation-bar) · [Page header](#page-header) · [Tabs](#tabs)
  - [Mega menu](#mega-menu) · [Breadcrumbs](#breadcrumbs) · [Pagination](#pagination) · [Footer](#footer)
- **Data display:**
  - [Card](#card) · [List item](#list-item) · [Table](#table) · [Tree view](#tree-view) · [Accordion](#accordion) · [Timeline](#timeline)
  - [Chat message](#chat-message) · [Charts](#charts) · [Logo wall](#logo-wall) · [QR code](#qr-code) · [Map pin](#map-pin) · [Nodes](#nodes)
  - [Avatar](#avatar) · [Badge](#badge) · [Kbd](#kbd) · [Divider](#divider) · [Code snippet](#code-snippet)
- **Feedback & overlays:**
  - [Alerts & notifications](#alerts--notifications) · [Progress](#progress) · [Skeleton](#skeleton) · [Empty state](#empty-state)
  - [Tooltip](#tooltip) · [Popover](#popover) · [Window](#window) · [Command palette](#command-palette)

---

# Actions

## Buttons

A button starts an action; a link takes people somewhere. Buttons has a label, Action button is an icon alone, Button group puts several in a row, Link lives inside text.

**Pick the type**
- The one main action → Type=Primary.
- Other actions → Type=Secondary.
- Cancel, dismiss, quiet actions → Type=Ghost.
- Navigation → Link, not a button.

**Pick the size**
- Forms and page actions → Size=Large.
- Dialogs, cards, toolbars → Size=Medium.
- Calendars, tables, filters → Size=Small.
- Keep one size inside one row.

**Never**
- Two Primary buttons in one view.
- A label without a verb: "OK", "Yes".
- An Action button without an accessible name.
- Restyle a button; set Type, Size, State.

```yaml
component: Buttons
figma: "Buttons / Buttons"
related: [Action button, Button group, Link]
props:
  Type: [Primary, Secondary, Ghost, Danger]
  Size: [Large, Medium, Small]          # 48, 40, 32
  State: [Default, Hover, Pressed, Disabled]
  Text: text                            # a verb: "Save changes"
  Icon: boolean                         # icon before the label, default off
  "↳ Icon": instance
tokens:
  radius: radius/round
  Primary: { fill: action/primary, hover: action/primary-hover, pressed: action/primary-pressed, text: text/on-action }
  Secondary: { fill: action/secondary, hover: action/secondary-hover, pressed: action/secondary-pressed, text: text/primary }
  Ghost: { fill: none, hover: surface/hover, pressed: action/secondary, text: text/primary }
  Danger: { fill: action/danger, hover: action/danger-hover, pressed: action/danger-pressed, text: text/on-action }   # irreversible actions, inside a confirmation
  Disabled: { fill: action/disabled, text: text/disabled }
  Large: { height: 48, padding: 24, text: typography/body-lg-strong, icon: 24 }
  Medium: { height: 40, padding: 20, text: typography/label, icon: 20 }
  Small: { height: 32, padding: 14, text: typography/label, icon: 16 }
icon_colour: same token as the label (text/on-action on Primary and Danger)
---
component: Action button      # icon only
props: { Type: [Primary, Secondary, Ghost], Size: [Large, Medium, Small] }
---
component: Button group       # 2-4 Secondary Buttons joined: gap 2, outer corners radius/round, inner corners radius/tight
props: { Size: [Small, Medium, Large] }
slots:
  Buttons: the middle buttons    # duplicate the button inside to add one, delete it for a group of two
---
component: Link
props: { State: [Default, Hover, Disabled], Label: text }
tokens: typography/body + text/link
rules:
  - one Type=Primary per view
  - navigation is a Link, an action is a button
```

## Menu

Menu is a floating list of actions for one object, opened from a button. Action list is the same list without the floating surface, for use inside a panel.

**Use Menu when**
- An object has three or more secondary actions.
- The actions fit under a "More" button.
- The list is short: up to seven items.

**Use something else when**
- Picking a value → Selectors.
- Main actions → Buttons.
- Navigation → Sidebar or Tabs.

**Never**
- A Menu inside a Menu deeper than one level.
- A destructive item first.
- Items with and without icons mixed.
- A Menu that stays open after a choice.

```yaml
component: Menu
figma: "Menu / Menu"
props:
  Type: [Default, Account]      # Account: header, shortcuts, submenu, groups
slots:
  Items: [Menu header | Action list item | Menu divider]
tokens: { fill: surface/floating, line: line/subtle, shape: padding 8, gap 2, corners 16 }
---
component: Action list          # Menu without the surface
slots: { Items: Action list item[] }
---
component: Action list item
props:
  Tone: [Default, Danger]
  State: [Default, Hover]
  Label: text                   # a verb
  Icon: instance                # 20, icon library
  Shortcut: boolean             # text in "↳ Shortcut": "⌘P"
  Chevron: boolean              # the item opens a submenu
tokens:
  text: text/primary + typography/body
  Hover: surface/hover
  shape: 40 high, padding 12, gap 12, corners 12, icon 20
---
component: Menu header          # for the slot
props: { Name: text, Email: text }
---
component: Menu divider         # a line with 6 above and below
submenu: a second Menu to the right of an item with Chevron, 4 away, aligned to its row; one level only
rules:
  - a header, if any, is first and is followed by a Menu divider
  - shortcuts sit right-aligned in a key chip
  - up to 7 items; a Divider before the Danger item, which is last
  - closes on choice, Esc or outside click
  - values for fields are Selectors, not Menu
```

## Action bar

Action bar appears when people select items in a list or table. It says how many are selected and offers the actions that apply to all of them.

**Use when**
- People select several items in a list or table.
- The same action applies to all selected items.

**Use something else when**
- A result message → Snackbar.
- Actions of the page → Page header.
- An action on one row → Menu in that row.

**Never**
- Visible with nothing selected.
- More than three actions in a row.
- A second bar for another list on the same screen.

```yaml
component: Action bar
parts: [Counter, Divider, Actions, Close]
props:
  Label: text                   # "3 selected"
layout: { direction: row, height: 56, padding: 8 20, gap: 8, position: floating, bottom centre }
tokens:
  fill: surface/inverse
  text: text/on-inverse + typography/label
  divider: line/subtle
  shape: radius/round
rules:
  - show only while at least one item is selected
  - at most 3 actions, verbs, destructive last
  - Close and Esc clear the selection
  - confirm the result with a Snackbar
```

## Toolbar

Toolbar groups the tools that change content in place: formatting in an editor, tools on a canvas, controls over a photo. Buttons are icons first, grouped by meaning and split by thin dividers.

**Use when**
- Tools edit content in place: text marks, lists, inserts.
- A canvas or board needs a tool rail.
- A text selection needs quick formatting.

**Use something else when**
- Actions for selected rows or files → Action bar.
- Page actions such as Save or Share → buttons in Page header.
- A long list of commands → Menu or Command palette.

**Never**
- Icon buttons without a Tooltip.
- Primary buttons inside a toolbar.
- Hiding tools that do not apply: disable them instead.

```yaml
component: Toolbar
figma: "Toolbar", "Toolbar button", "Toolbar divider"
props:
  Type: [Editor, Floating, Vertical]
slots: { Items: [Toolbar button | Toolbar divider] }
---
component: Toolbar button
props:
  State: [Default, Hover, Active, Disabled]
  Icon: instance
  Label: text                   # pickers only, with "Show label"
  Chevron: boolean              # opens a Menu
tokens:
  fill: surface/raised          # Floating: surface/floating + elevation/floating
  border: line/subtle
  radius: radius/field          # Floating: radius/round
  button: { size: 36, radius: radius/inner, active: surface/selected, hover: surface/hover }
a11y:
  container: role="toolbar", aria-label
  keys: arrow keys move focus, Tab leaves the toolbar
  toggles: aria-pressed
  every icon button: aria-label + Tooltip
```

---

# Inputs

## Text fields

Text fields let people type. Inputs takes one line, Text areas takes several. Label and Help text are the title and the message as separate parts, for controls that don't have them built in. Number input, Phone input, Code input and Rich text editor cover special cases.

**Use Inputs when**
- The answer fits one line: a name, an email, a phone, a number.
- The value is free text, not one of known options.

**Use Text areas when**
- The answer takes several lines: a comment, a description, a message.
- There is a length limit: turn on Footer and Count.

**Use something else when**
- One of known options → Selectors. Several → Multi selector.
- Looking for an item in a list → Search.
- 2–4 options → Segmented control or Radio.

**States**
- Default: empty, shows a hint like "name@calmy.com".
- Active: the cursor is in the field.
- Filled: has text, not in focus.
- Disabled: can't be edited; turn on Footer and say why in Message.

**Never**
- Restyle a field by hand; set State instead.
- Use the hint as the label; keep Title on.
- Show an error by a red outline alone; add Help text, Type=Error.
- Put a long text into Inputs; use Text areas.

```yaml
component: Inputs
figma: "Text fields / Inputs"
related: [Text areas, Label, Help text]
props:                      # Inputs and Text areas share them, except Icon
  State: [Default, Active, Filled, Disabled, Hover]
  Title: boolean            # label above the field, default on
  "↳ Title": text           # noun, sentence case: "Email"
  Content: boolean
  "↳ Content": text         # hint or typed text
  Icon: boolean             # Inputs only, default off
  "↳ Icon": instance
  Required: boolean         # red asterisk
  Footer: boolean           # row with Message and Count, default off (on in Text areas)
  Message: boolean
  "↳ Message": text         # help or error text
  Count: boolean
  "↳ Count": text           # typed/allowed: "7/64"
tokens:
  title: typography/body + text/primary
  field: surface/raised, input/border, input/radius (12), padding 12 x 16
  height: { Inputs: 48, Text areas: 144 }
  value: typography/body-lg, text/tertiary (hint) -> text/primary (text)
  active: input/borderFocus
  message: typography/caption + text/tertiary
label:
  component: Label          # Label: text, Required: [No, Yes]
  tokens: typography/caption + text/secondary, asterisk text/negative
help_text:
  component: Help text      # Type: [Default, Error, Success], Text: text
  tokens: { Default: text/tertiary, Error: text/negative, Success: tone/green/on-soft }
rules:
  error: State=Filled + Help text Type=Error under the field
  limit: Footer on, Count "typed/allowed"
---
component: Number input
props: { State: [Default, Active, Disabled], Title, Required, Value: text }
parts: [Title row, Field (Action button Ghost Small −, Value, Action button Ghost Small +)]
---
component: Phone input
props: { State: [Default, Active, Error, Disabled], Title, Required, Flag: emoji, Code: text, Message }
rules: [country cell opens a searchable list, format the number by country]
---
component: Code input
props: { Length: [4, 6], State: [Default, Error], Title, Required }
slots: { Cells: Code cell[] }       # Code cell State: [Empty, Filled, Active, Error], Digit
rules: [paste fills all cells, auto-submit on the last digit, 6 cells split 3 + 3]
---
component: Rich text editor
props:
  State: [Default, Active, Filled, Disabled]
  Toolbar: boolean
  Title: boolean + text
  Content: text
  Footer: boolean   # Message + Count
toolbar: Action button Ghost Small with editor/* icons; groups split by 1 px dividers; undo and redo at the right
```

## Search

Search finds an item in a long list or across the product. Search is the field, Autocomplete adds suggestions under it, Filter input narrows a list with chips.

**Use Search when** people look for something by a word: a project, a person, a file.
**Use Autocomplete when** people pick one item from a long list (30+) and know part of the name.
**Use Filter input when** a list on screen needs narrowing and several filters can be on at once.

**Use something else when**
- 5–30 known options → Selectors.
- Free text that is not a search → Inputs.
- Switching views → Tabs or Segmented control.

**Never**
- Write "Type here" as the hint.
- Hide applied filters: keep them as chips.

```yaml
component: Search
figma: "Search / Search"
related: [Autocomplete, Filter input]
props:
  State: [Default, Hover, Active, Filled, Disabled]
  Size: [Large, Medium]
  Text: text                # hint or query: "Search projects"
  Clear: boolean            # X button in Filled, clears the query, default on
tokens:
  field: 48 high (Large), padding 12 x 16, search/radius (full)
  fill: { Default: none, Hover/Active/Filled: surface/raised }
  line: { Default/Hover/Filled: line/subtle, Active: line/focus }
  text: typography/body-lg, text/tertiary (hint) -> text/primary (query)
  icon: actions/search, 24
autocomplete:
  field: Search, State=Active
  list: Dropdown (same as Selectors), 6 below the field
filter_input:
  button: action/secondary + Badge (count of applied filters)
  applied: Chip State=Selected
  clear: text/link "Clear all", only when something is applied
```

## Selectors

A selector is a form field that opens a list of known options. Selectors keeps one value. Multi selector keeps several and shows them as tags inside the field. Both open a Dropdown.

**Use Selectors when**
- The user picks exactly one value from 5 or more fixed options.
- The list is known in advance: country, language, size, time zone.

**Use Multi selector when** the user picks several values from one list and they must stay visible as tags.

**Use something else when**
- 2–4 options → Segmented control or Radio.
- Long or searchable list (30+) → Search / Autocomplete.
- Free text → Inputs.

**Never**
- Build the list from plain frames; use Dropdown and Dropdown option.
- Write an option longer than one line.

```yaml
component: Selectors
figma: "Selectors / Selectors"
related: [Multi selector, Dropdown, Dropdown option]
props:
  State: [Default, Active, Selected, Disabled, Hover]
  Title: boolean + "↳ Title": text
  Content: boolean + "↳ Content": text     # Selectors only: hint or chosen value
  Text: text                               # Multi selector only: the hint
  Chevron: boolean                         # "↳ Chevron": arrows/chevron Position=down
  Clear: boolean                           # X in Selected, resets the choice
  Required: boolean
  Footer: boolean + Message, Count
tokens:
  field: surface/raised, line/subtle, select/radius (12), 48 high
  value: typography/body-lg, text/tertiary (hint) -> text/primary (value)
  active: line/focus
dropdown:
  container: Dropdown     # show or hide option layers, 9 at most
  container_tokens: surface/raised, line/subtle, radius 12, padding 4, gap 2
  option: Dropdown option   # State: [Off, On], Text: text
  picked: State=On
  place: under the field while State=Active
rules:
  required field: Clear=false
  one value: Selectors, exactly one option On
  several values: Multi selector, values as tags
```

## Date picker

Date picker shows one month and lets people pick a day. It opens under a date field; each day is a Date cell with its own state. Time picker picks a time.

**Use when** people pick one date within a few months and need to see the weekday.

**Use something else when**
- A date far in the past, like a birthday → Inputs with a format hint.
- A period like "This week" → Segmented control.

**Never**
- A picker without the field above it.
- Disabled days that can still be focused.

```yaml
component: Date picker
figma: "Date picker / Date picker"
props:
  Type: [Date, Range, Week, Months, Years, Period]
types:
  Date: one day; header (month + arrows), weekdays, weeks of Date cell
  Range: Range start + In range + Range end in the grid
  Week: one week row, arrows move by a week
  Months / Years: 12 Date option
  Period: presets + two months + footer with two Inputs, "Cancel" and "Apply"
tokens:
  container: surface/floating, line/subtle, radius 16, padding 16, gap 8
  arrows: Action button, Size=Small
place: under the date field, 6 apart
---
component: Date cell
props:
  State: [Default, Today, Selected, Disabled, Outside, Range start, In range, Range end]
  Day: text
tokens:
  size: 40 x 40, radius full
  Today: line/focus outline
  Selected, Range start, Range end: action/primary + text/on-action
  In range: tone/blue/soft + tone/blue/on-soft
  Disabled: text/disabled
---
component: Date option            # months, years, time slots
props: { State: [Default, Current, Selected, Disabled], Label: text }
tokens: { size: 88 x 40, radius full, Current: line/focus outline, Selected: action/primary + text/on-action }
---
component: Time picker
props: { Type: [Columns, Slots], Header: text }
rules: [Selected = chosen time, Disabled = busy, always name the time zone in Slots]
```

## File upload

File upload lets people add files by dropping them on a zone or browsing. Each file then shows as a row with its progress, a result and a way to remove or retry it.

**Use when** people attach documents or images and the progress of each file matters.
**Use something else when** a single avatar image → Avatar with an edit menu; a link → Inputs.
**Never** hide which file types are allowed or remove a failed file without telling why.

```yaml
component: Upload zone
props: { State: [Default, Drag over, Disabled], Hint: text }
tokens: { line: line/strong dashed 6-4, 1.5px; Drag over: action/primary + surface/selected; corners 16; padding 32 24 }
---
component: File item
props: { State: [Uploading, Done, Error], Name: text, File icon: instance }
parts: [File icon 40, Name, Meta, Progress bar (Uploading), Action button Ghost Small]
tokens: { fill: surface/raised, line: line/subtle, Error line: line/negative, corners 12 }
rules:
  - upload starts on drop
  - each file has its own row and result
  - errors say what to do
```

## Checkbox & Radio

Checkbox picks any number of options, Radio picks exactly one. Radio selector wraps either control into a 48 high option row that is easy to hit.

**Use Checkbox when** any number of options can be on, or one yes/no applies on Save.
**Use Radio when** exactly one of 2–5 options, all visible, one on by default.
**Use something else when** 5+ options → Selectors; a setting that applies at once → Switch.
**Never** checkboxes for exclusive options, or a radio group with nothing selected.

```yaml
component: Checkbox
props:
  Type: [Radio, Checkbox]
  State: [Off, On, Hover, Disabled]
tokens: { off: line text/tertiary 1.5, on: text/primary, size: 24 (shape 18) }
---
component: Radio selector
props:
  State: [Default, Active, Selected, Disabled, Hover]
  Content: text            # option label
  Hint: boolean            # help icon on the right
tokens:
  field: surface/raised, 48 high, padding 12, radius 12
  line: { Default: line/subtle, Active/Selected: line/focus }
rules:
  several choices: Type=Checkbox
  one of 2-5: Type=Radio, one option always on
  choice as cards (plans, payment): List item Style=Card, Trailing=Radio
```

## Switch

Switch turns a single setting on or off, and the change applies at once. It sits on the right of a label that names the setting.

**Use when** one setting turns on or off and applies without Save.
**Use something else when** choices applied on Save → Checkbox; one of 2–4 options → Segmented control.
**Never** text inside the switch, a label like "Turn off…", or a switch that needs a Save button.

```yaml
component: Switch
props:
  State: [Off, On, Disabled]
tokens:
  track: 40 x 24, radius full, padding 2
  off: action/secondary-pressed
  on: action/primary
  disabled: action/disabled
  knob: 20, surface/raised
layout: label on the left, switch on the right, 16 apart
settings rows: List item Trailing=Switch
```

## Segmented control

Segmented control switches between 2–4 views or values in one row. Exactly one segment is on, and the change applies at once.

**Use when** 2–4 options, exactly one on, labels of one or two words.
**Use something else when** 5+ options → Selectors; separate sections → Tabs; on/off → Switch.
**Never** a row with nothing selected, or long labels that wrap.

```yaml
component: Segmented control
props:
  Selected: [1, 2, 3]
  Label 1: text
  Label 2: text
  Label 3: text
tokens:
  track: action/secondary, 48 high, padding 4, gap 4, radius full
  selected: surface/raised + text/primary
  segment: no fill + text/secondary
  label: typography/label
rules:
  - stretch to the full width of its container; segments share the width equally
```

## Slider

Slider picks a range on a scale by dragging two thumbs. Use it when the exact number matters less than the span: price, size, duration.

**Use when** people narrow a list by a span. Always show the values as text.
**Use something else when** exact number → Inputs; a few named steps → Segmented control.
**Never** a slider without visible values, or thumbs that can cross.

```yaml
component: Slider
props:
  State: [Default, Edited]     # full range or narrowed
tokens:
  track: line/subtle, 3 high
  range: line/focus, 3 high
  thumb: text/primary, 16 x 16, radius 4
pattern: label + value text ("$20 – $80") on one row, slider under it, 12 apart
```

## Color picker

Color picker lets people choose a colour: from a fixed set of tones for labels and calendars, or any colour for brand settings and design tools. It opens from a Color field, inside a Popover.

**Use when** a person sets a colour for a label, project or calendar, or brand settings need an exact colour.
**Use something else when** status and meaning → fixed tones; light or dark theme → Segmented control.
**Never** free colours for errors, success or warnings; a picker without a hex field in Full.

```yaml
component: Color picker
figma: "Color picker", "Color field", "Color swatch", "Color slider"
props:
  Type: [Full, Swatches]
  Hex: text
tokens:
  panel: { fill: surface/floating, radius: radius/card, shadow: elevation/floating }
  area: { radius: radius/field, height: 160 }
  swatch: { size: 32, ring: line/focus 2px }
  field: { height: 48, radius: radius/field, border: line/field }
a11y:
  area: role="slider" x2 (saturation, brightness), arrow keys
  swatches: role="radiogroup", each named ("Blue")
```

## Chips & Tags

They look alike and do different jobs. A chip is interactive: people turn it on, off or remove it. A tag only tells something: a status, a category, a count.

**Use Chip when** people turn a filter on and off, or a picked value can be removed.
**Use Tag when** the value only informs: status, category, mark. Status → Dot on and the tone of the state.

**Tone → meaning**
- Green: done, paid, online.
- Orange: waiting, pending.
- Red: failed, critical.
- Blue: new, info.
- Neutral: draft, inactive.
- Other hues: categories.

**Never**
- A clickable tag.
- A chip for a read-only status.
- A custom colour: pick a Tone.
- More than two solid tags in one view.

```yaml
component: Chip
props:
  State: [Default, Selected, Disabled, Hover]
  Label: text
tokens:
  Default: surface/sunken + text/primary
  Selected: tone/blue/soft + tone/blue/on-soft, check icon
  shape: 32 high, padding 6 x 12, radius round
---
component: Tag
props:
  Tone: [Neutral, Blue, Green, Orange, Pink, Yellow, Lime, Teal, Violet, Red, Clay]
  Style: [Soft, Solid, Outline, Subtle, Status]   # Subtle: Neutral only; Status: one big word in cards
  Label: text
  Dot: boolean
  Icon: boolean + "↳ Icon": instance
tokens:
  Soft: tone/<hue>/soft + tone/<hue>/on-soft, dot tone/<hue>/solid
  Solid: tone/<hue>/solid + text/on-action
  Outline: tone/<hue>/soft + 1px border tone/<hue>/solid + tone/<hue>/on-soft
  shape: 24 high, padding 8, gap 4, radius/inner, typography/caption-medium
status_word: Tag Style=Status, one word (Good, Fair, Attention, Excellent), next to the number it explains
rules:
  interactive: Chip
  read-only: Tag
  count: Badge
```

---

# Navigation

## App bar

App bar is the top bar of a product. It carries the logo and what belongs to the whole product: search, top-level links, language and currency, notifications and the account.

**Use when**
- A product needs global search and account access on every page.
- Language or currency can be changed: Type=Locale.
- There is no Sidebar and up to five sections: Type=Navigation.
- The visitor is not logged in: Type=Signed out.

**Use something else when** page title and actions → Page header; more than five sections → Sidebar; phones → Navigation bar.
**Never** two app bars on one screen, or page-specific buttons in the bar.

```yaml
component: App bar
props:
  Type: [Default, Navigation, Locale, Signed out]
  Device: [Desktop, Mobile]     # Mobile: 56 high, Menu icon first; links and search move into a Drawer
layout: { direction: row, height: 72, padding: 0 24, gap: 16 }
tokens: { fill: surface/raised, bottom line: line/subtle }
uses: [Logo, Search, Action button Ghost Medium, Avatar Large, Buttons Medium]
---
component: App bar link
props: { State: [Default, Hover, Selected], Label: text, Count: boolean }   # Count shows a Badge inside the pill
tokens:
  Default: text/secondary + typography/body
  Hover: surface/hover
  Selected: surface/sunken + typography/label
  shape: 36 high, padding 12, radius/round
---
component: App bar select       # language, currency, region
props: { State: [Default, Hover], Label: text, Icon: boolean }
rules:
  - at most 5 links and 3 icon actions; the avatar is last
  - below 768 wide: Device=Mobile
```

## Sidebar

Sidebar is the main navigation of a desktop product: the logo on top, a list of sections in the middle and the profile at the bottom.

**Use when** a desktop product has five or more top-level sections. Folders → Type=Tree. Tight space → Type=Collapsed.
**Use something else when** phones → Navigation bar; views of one page → Tabs.
**Never** two selected rows, or rows without icons next to rows with icons.

```yaml
component: Sidebar
props:
  Type: [Default, Search, Tree, Collapsed, Mobile, Floating]   # Floating: no fill, sits on surface/canvas
slots:
  Items: [Sidebar item | Sidebar section]
parts: [Logo, Search (Type=Search), Primary action (Type=Tree), Items, Divider, Sidebar profile]
layout: { width: 264, collapsed: 64, padding: 12, gap: 4 }
tokens: { fill: surface/raised, right line: line/subtle }
---
component: Sidebar item
props:
  State: [Default, Hover, Selected]
  Layout: [Full, Icon only]
  Label: text
  Icon: instance                # 20
  Counter: boolean              # a Badge
  Chevron: boolean              # tree rows
tokens:
  Default: text/secondary + typography/body
  Hover: surface/hover
  Selected: surface/sunken + typography/label
  shape: 40 high, padding 12, gap 12, corners 12
---
component: Sidebar section      # group heading
props: { Label: text }
---
component: Sidebar profile
props: { Layout: [Full, Icon only], Name: text, Email: text }
rules:
  - exactly one Selected row
  - below 1024 wide: Type=Mobile inside a Drawer
```

## Navigation bar

Navigation bar is the bottom bar of a mobile app. It holds three to five top-level sections and is visible on every main screen.

**Use when** a mobile app has 3–5 top-level sections.
**Never** fewer than three or more than five items, an item that runs an action, or icons without labels.

```yaml
component: Navigation bar
layout: { direction: row, height: 64, items: equal width, position: bottom }
tokens: { fill: surface/raised, top line: line/subtle }
---
component: Navigation item
props:
  State: [Default, Selected]
  Label: text                   # one word
  Icon: instance                # 24
tokens: { Default: text/tertiary, Selected: text/primary, text: typography/caption }
```

## Page header

Page header opens a page: where it is, what it is called and the main things people can do with it.

**Use when** a page needs a title. Views → Type=Tabs. Top-level → Type=Simple. Below 768 → Device=Mobile.
**Never** two page headers, two Primary buttons, or breadcrumbs on mobile.

```yaml
component: Page header
props:
  Type: [Default, Tabs, Simple]
  Device: [Desktop, Mobile]
  Title: text                   # a noun, one line
  Description: text             # one line of context
parts:
  Default: [Breadcrumbs | Back link (Mobile), Title, Description, Actions]
  Tabs: [Title, Description, Actions, Tabs]
  Simple: [Title, Primary action]
rules:
  - one per page; the title is the h1
  - at most two visible buttons, one Primary, more go into a Menu
```

## Tabs

Tabs switch between views of the same page without leaving it. One tab is always selected.

**Use when** two to six views of equal weight of the same page or object.
**Use something else when** product sections → Sidebar; a setting with 2–4 options → Segmented control.
**Never** tabs that wrap to two lines, or nested tabs.

```yaml
component: Tabs
layout: { direction: row, gap: 24, baseline: 1px line/subtle, stretch to the container width }
---
component: Tab
props:
  State: [Default, Hover, Selected, Disabled]
  Label: text
tokens: { Default: text/tertiary, Selected: text/primary + 2px indicator, text: typography/label }
```

## Mega menu

Mega menu opens from a top navigation link and shows a whole section at once: products, solutions or resources, each with an icon and one line of description.

**Use when** a marketing site needs to show a whole section at once.
**Use something else when** app navigation → Sidebar or App bar; fewer than 7 links → Menu.
**Never** opening on hover without a delay, or several feature cards in one menu.

```yaml
component: Mega menu
figma: "Mega menu", "Mega menu item"
style: Card Nested (sunken shell, white inner, rows on the shell)
props:
  Type: [Columns, Featured, Compact]
  Footer: boolean
  Footer text: text
slots: [Columns]
item: { Icon, Title, Description, Show icon, Show description }
tokens:
  shell: { fill: surface/sunken, radius: 22, padding: space/1_5, border: line/subtle, shadow: elevation/floating }
  inner: { fill: surface/floating, radius: radius/card }
  feature: { fill: tone/violet/soft, radius: radius/card }
size: { width: 960 (Columns, Featured), 640 (Compact) }
```

## Breadcrumbs

Breadcrumbs show where the page sits in the product and let people step back up one or more levels.

**Use when** the page is three or more levels deep.
**Use something else when** one level up → a "Back" Link; sibling views → Tabs.
**Never** a link on the current page, or more than one line.

```yaml
component: Breadcrumbs
slots:
  Levels: [Breadcrumb item, "/", Breadcrumb item, ...]
---
component: Breadcrumb item        # token-chip look
props:
  State: [Default, Hover, Current]
  Label: text
tokens:
  Default: surface/sunken + text/secondary
  Current: surface/sunken + text/primary       # not a link
  shape: padding 8 x 3, corners 6, typography/body
rules:
  - the last item is State=Current
  - collapse the middle of a long path into one "…" item
```

## Pagination

Pagination splits a long list into pages and moves between them. It is built like a Button group: joined cells.

**Use when** a list or table has a known number of pages.
**Use something else when** a feed → "Load more".
**Never** more than one Selected item, or more than seven cells.

```yaml
component: Pagination
parts: [Previous, Pages, Next]
slots:
  Pages: Pagination item[]
layout: { direction: row, gap: 2, height: 40 }
---
component: Pagination item
props:
  State: [Default, Hover, Selected]
  Page: text                    # a number or "…"
tokens:
  Default: action/secondary + text/primary
  Selected: action/primary + text/on-action
rules:
  - at most 7 cells: first, last, current and neighbours, "…" between
  - disable Previous on the first page and Next on the last
```

## Footer

Footer closes a page with the links people look for last: pricing, help, legal, company pages and social profiles. It is quiet: small text, one accent at most.

**Use when** a page needs legal, help and company links, or a marketing site needs a newsletter signup.
**Never** a footer without Privacy and Terms on public pages, or bright tone fills.

```yaml
component: Footer
figma: "Footer", "Footer column", "Footer link", "Social button"
props:
  Type: [Columns, Big logo, Capsule, Mobile]
  Size: [Large, Medium, Small]
  Color: [Light, Dark, Blue]
  Socials: boolean
  Newsletter: boolean
  Tagline: text
  Copyright: text
slots: [Columns, Links]
tokens:
  fill: Light surface/raised · Dark surface/inverse (pinned to Light mode) · Blue tone/blue/soft
  title: typography/caption-strong + text/tertiary
  link: text/secondary -> text/primary on hover
  social: { size: 36, fill: surface/sunken }
```

---

# Data display

## Card

A card holds one object or one topic and the actions for it. Card is the container with six shapes; the typed cards are ready-made layouts for the things products show most.

```yaml
component: Card
props:
  Shape: [Outlined, Elevated, Sunken, Nested, Banner, Stacked]
  Content: slot
  Header: slot                     # Shape=Nested: the row above the inner card
  Footer: slot                     # Shape=Nested: the row below the inner card
  Show header: boolean
  Show footer: boolean
tokens: { fill: surface/raised, line: card/border, radius: card/radius, padding: card/pad }
---
typed_cards:
  Stat card:         { Type: [Value, Progress, Breakdown, Gauge, Chart], Label, Value }
  Order card:        { Title, Status }
  Subscription card: { Banner: [None, Info, Negative], Title }
  Kanban card:       { State: [Default, Dragging], Title }
  Activity card:     { Type: [Message, Thread], Title }
  Integration card:  { State: [On, Off], Title, Description }
  Pricing card:      { State: [Current, Upgrade] }
  Payment card:      { Size: [Thumbnail, Large], Type: [Physical, Virtual], Number, Label }
choose:
  one number: Stat card
  plan to choose: Pricing card
  board item: Kanban card
  anything else: Card + Content slot
rules:
  - one primary action per card
  - one filled Tag (the status); other tags Style=Outline
  - nest once at most (Shape=Nested or a sunken block)
  - shadows only for Elevated and Dragging
  - cards in a row share a height
```

## List item

List item is one row of a list: a person, a file, a project. It shows who or what it is in two lines and opens the object on click.

**Use when** a vertical list of people, files or projects with a name and one line of facts.
**Use something else when** several comparable columns → Table; a picture and an action → Card.
**Never** three lines of text, buttons inside the row, or two Selected rows.

```yaml
component: List item
props:
  Trailing: [Chevron, Switch, Checkbox, Value, Tag, None, Radio]
  State: [Default, Hover, Selected, Disabled]
  Style: [Plain, Card]          # Card: a bordered option row, e.g. payment method with Radio
  Avatar: boolean
  Icon: boolean + "↳ Icon": instance
  Title: text
  Description: text
  Description2: boolean         # shows the description line
  Value: text                   # Trailing=Value
tokens:
  title: text/primary + typography/body
  description: text/tertiary + typography/caption
  Hover: surface/hover
  shape: 64 high, padding 12, gap 12, corners 12
rules:
  - the whole row is one target
  - Switch or Checkbox: a tap anywhere on the row toggles it
  - Style=Card on surface/canvas gets a white fill
```

## Table

A table shows many objects with the same set of fields, so people can scan a column, compare values and act on several rows.

**Use when** objects share fields, there are more than five rows, and people sort, filter or select.
**Use something else when** a name plus one fact → List item; a picture and an action → Card.
**Never** a table inside a table, two sorted columns, left-aligned numbers, or sideways scroll on a phone.

```yaml
component: Data table
props:
  Type: [Default, Pinned column, Expandable, Mobile]
  Toolbar: boolean
  Footer: boolean
  Rows: slot            # Table row | Table group row | Table row mobile
parts: [Table toolbar, Table header row, Rows, Table footer]
tokens: { fill: surface/raised, line: line/subtle, radius: 16 }
header: { fill: surface/canvas, radius: radius/sm, inset: 4 }   # a rounded bar
---
component: Table toolbar
props: { Type: [Default, Selection], Label: text }
---
component: Table header cell
props: { Sort: [None, Sortable, Ascending, Descending], Align: [Left, Right], Label: text }
---
component: Table row
props: { State: [Default, Hover, Selected, Expanded] }
selected: no fill; 1 px outline and a 2 px bar on the left edge
---
component: Table cell          # 56 high
props:
  Type: [Text, Two lines, Avatar, Avatar group, Tag, Tags, Number, Trend, Progress,
         Rating, Actions, Checkbox, Expand, Collapse, Card, Paragraph, Code, Swatch]
order: Checkbox > object (Avatar) > values > [Actions | Expand]
---
component: Table row mobile
props: { State: [Default, Expanded], Title, Caption, Value }
responsive:
  ">= 1024": Type=Default
  "600-1023": Type=Pinned column
  "< 600": Type=Mobile
rules:
  - columns are hidden, not squeezed: hide a column in the header and in every row
```

## Tree view

Tree view shows nested objects, such as folders and pages, and lets people open levels and pick one item.

**Use when** objects are nested and one item is selected at a time.
**Never** a chevron on an item without children, or a tree deeper than five levels.

```yaml
component: Tree view
slots: { Items: Tree item[] }
---
component: Tree item
props:
  Level: [1, 2]
  State: [Default, Selected]
  Label: text
  Icon: instance
tokens: { text: text/primary + typography/body, Selected: surface/sunken, shape: 36 high, corners 12 }
rules:
  - the chevron toggles the level, the label selects
```

## Accordion

Accordion hides secondary content under its heading. People open only the parts they need.

**Use when** FAQ, advanced settings, details of an order.
**Never** an accordion inside an accordion, or required fields hidden in a collapsed item.

```yaml
component: Accordion item
props:
  State: [Collapsed, Expanded]
  Title: text
tokens:
  title: text/primary + typography/body-lg
  content: text/secondary + typography/body
  divider: line/subtle (bottom)
rules:
  - stack items with no gap; each ends with a line
  - the whole heading row toggles the item
```

## Timeline

Timeline shows events in the order they happened: an activity feed, the history of an object, the stages of a delivery. Each event has a slot that takes any content.

**Use when** events have an order in time.
**Use something else when** steps people still have to take → Stepper.
**Never** a line after the last item, or events out of order.

```yaml
component: Timeline
slots: { Items: Timeline item[] }
---
component: Timeline item
props:
  Marker: [Dot, Icon, Avatar]
  Title: text
  Time: text
  Line: boolean                 # off on the last item
  Icon: instance
slots:
  Event: any                    # text, Card, List item, Alert, or empty
tokens:
  dot: action/primary
  line: line/subtle
  title: text/primary + typography/label
  time: text/tertiary + typography/caption
```

## Chat message

Chat message is one message in a conversation: a bubble with text, a voice note, photos or a file, the time, the sender's avatar and a read mark. Day dividers, a composer and a floating Chat widget complete the set.

**Use when** a conversation between people or with an assistant, or comments form a thread.
**Use something else when** one-off system news → Notification; history of changes → Timeline.
**Never** incoming and outgoing bubbles in the same colour, or Send active with an empty composer.

```yaml
component: Chat message
props: { Side: [Incoming, Outgoing], Name: text }
slots: { Bubbles: Message bubble[] }
---
component: Message bubble
props: { Side: [Incoming, Outgoing], Type: [Text, Audio, Image, Images, Gallery, File], Text, Time, Read: boolean }
tokens:
  Incoming: surface/sunken
  Outgoing: tone/blue/soft, read mark tone/blue/solid
  text: text/primary + typography/body
---
component: Audio waveform
props: { State: [Paused, Playing], Duration: text }
---
component: Chat composer
parts: [Action button Ghost (attach), Placeholder, Action button Ghost (emoji), Action button Primary (send)]
---
component: Chat widget
props: { State: [Closed, Open] }
placement: fixed, bottom-right, 24 px from the edges
rules:
  - group bubbles of one sender within a minute
  - avatar on the last bubble of a turn only
```

## Charts

Charts turn numbers into a shape people read at a glance: a trend, a share, a level. Calmy charts are quiet: one hue where one is enough, a fixed order of series colours, hairline grids.

**Use when** people need the shape of the numbers and there are at least five data points.
**Use something else when** one number → a stat; exact values to look up → Data table.
**Never** a bar chart that does not start at zero, more than six colours, or 3D and gradients.

```yaml
series_colours:
  one_hue: [Ink, Blue, Blue soft]
  categories: [Blue, Violet, Teal, Yellow, Pink, Orange]   # fixed order, max 6
  meaning: { good: Green, bad: Red, rest: Track }
tokens: { grid: line/subtle, axis_text: text/tertiary + typography/caption, track: surface/track, current: action/primary }
components:
  Bar chart:     { Type: [Single, Stacked, Stacked 100%, Forecast], Bars: slot }
  Chart bar:     { Tone: [Soft, Accent], Label, Show label }    # instance height = value
  Line chart:    { Type: [Line, Area, Multi], Point, Series 2 }
  Sparkline:     { Trend: [Up, Down, Flat] }
  Segment chart: { Columns: slot }
  Donut chart:   { Type: [Donut, Half], Value, Label }
  Share bars:    { Shares: slot }                               # Share bar width = share
  Radial gauge:  { Progress: [25, 50, 75, 100], Value, Label }
  Progress ring: { Value: [25, 50, 75, 100] }
  Meter:         { Progress: [25, 50, 75, 100], Label, Value }
  Range meter:   { Position: [Under, Optimal, Over], Start label, End label }
  Heatmap:       { Type: [Half year, Month, Week] }
  Chart legend item: { Tone, Label, Value }
  Chart tooltip: { Title }
choose:
  change over time: Line chart
  compare amounts: Bar chart
  parts of a total: [Bar chart Stacked, Donut chart]
  progress to a goal: [Radial gauge, Meter, Progress ring]
  activity by day: Heatmap
rules:
  - every bar, column, segment and share is a component: add one from Assets, never draw a rectangle
  - one Accent bar per chart
  - a chart fills the width of its card; never scale it as an image
```

## Logo wall

Logo wall shows the companies that use a product or the tools it connects to. Logos sit at one size and one weight.

**Never** logos of companies that are not customers or partners, different sizes to rank brands, or recoloured marks.

```yaml
component: Logo wall
props: { Layout: [Row, Grid], Title: text, Show title: boolean }
slots: [Logos]
tile: { Style: [Plain, Card], Logo: brand/*, Name, Show name }
layout: { row: 5-7 logos, grid: 4 per row, gap 16 }
```

## QR code

QR code moves a link from a screen to a phone: sign in on mobile, open a document, join a meeting, check in at an event.

**Never** coloured, inverted or gradient codes, or a code without the same link as text.

```yaml
component: QR code
props:
  Size: [Small, Medium, Large]   # 96, 160, 240
  Logo: [Off, On]
colours: { modules: "#1E1E1E", background: "#FFFFFF" }   # static, not themed, so any camera reads it
a11y: always show the link as text
```

## Map pin

Map pin marks a place on a map: an office, a listing with its price, a person, a group of results or your own position.

**Never** anchoring pins by their centre, or many overlapping pins without clustering.

```yaml
component: Map pin
props:
  Type: [Place, Price, Photo, Cluster, Location]
  State: [Default, Selected]
  Icon: instance        # Place
  Price: text           # Price
  Count: text           # Cluster
anchor: bottom-centre (tip) | centre for Cluster, Location
tokens:
  pin: surface/inverse -> action/primary selected, outline surface/raised 2px
  price: surface/raised + line/subtle -> surface/inverse selected
  shadow: elevation/lifted
```

## Nodes

Nodes build visual workflows: automations, AI pipelines, approval flows and data graphs. Each node is one step; ports show where lines connect; the colour of the icon tells the kind of step.

**Use when** people build automations or pipelines visually.
**Use something else when** a fixed linear process → Stepper; a hierarchy → Tree view.

```yaml
component: Node
figma: "Node", "Node port", "Node connector"
props:
  Type: [Trigger, Action, Condition, AI]
  State: [Default, Selected, Error]
  Input: boolean
  Output: boolean
  Body: boolean
tones: { Trigger: tone/green/*, Action: tone/blue/*, Condition: tone/orange/*, AI: tone/violet/* }   # soft fill + on-soft icon
---
component: Node port
props: { State: [Default, Connected] }
---
component: Node connector
props: { State: [Default, Active, Draft], Shape }
layout: left to right, column gap 56, grid 24
```

## Avatar

Avatar stands for a person or a team. It shows a photo or one letter on a soft colour and, when it matters, whether the person is online.

**Use when** a person or a team appears in a row, card or header.
**Never** more than one letter, an avatar for something that is not a person or a team, or different sizes in one list.

```yaml
component: Avatar
props:
  Size: [Small, Medium, Large, XLarge]   # 24, 32, 40, 56
  Shape: [Circle, Square]                # Square for teams and companies
  Status: [None, Online]
  Label: text                            # one letter
  Photo: boolean
  "↳ Photo": instance                    # Avatar photo / 01–20
tokens:
  fill: tone/violet/soft
  text: tone/violet/on-soft
  status: status/positive with a surface/raised ring
rules:
  - one letter only
  - prefer Photo for real people
  - one size per list
---
component: Avatar group
props: { Size: [Small, Medium, Large], More: boolean, "↳ More": text }
slots: { Avatars: Avatar[] }
rules: [at most 4 avatars, then +N]
```

## Badge

Badge marks that something is new: a number of unread things, or a dot when the number does not matter.

**Never** a badge with text, a badge showing 0, or more than one badge on one element.

```yaml
component: Badge
props:
  Type: [Count, Dot]
  Tone: [Accent, Negative, Neutral]
  Label: text                   # digits only, "99+" above 99
tokens: { Accent: action/primary, text: typography/caption-strong, shape: Count 20 high; Dot 8 }
```

## Kbd

Kbd shows a key or a shortcut: next to a menu item, in a tooltip, in help text. It never reacts to a click.

**Never** Kbd as the only way to reach an action, or Ctrl shown to macOS users.

```yaml
component: Kbd
props:
  Size: [Small, Medium]          # 20 / 28 high
  Key: text                      # ⌘K, Esc, Enter, ⇧
tokens: { fill: surface/raised, line: line/subtle, text: text/secondary, corners: 6 }
rules: [platform symbols: ⌘ on macOS, Ctrl on Windows; hide on touch devices]
```

## Divider

Divider is a 1 px line that separates groups of content. Use it where spacing alone does not make the groups clear.

**Never** two dividers in a row, a thicker or coloured divider, or a divider before the first item.

```yaml
component: Divider
props:
  Orientation: [Horizontal, Vertical]
tokens: { fill: line/subtle, size: 1 px, fills the container on the other axis }
```

## Code snippet

Code snippet shows a few lines of code that people read or copy: a token, a command, a piece of markup. It is always dark, in both themes.

**Never** a screenshot of code, wrapped lines, or a snippet without the language label.

```yaml
component: Code snippet
props:
  Code: text                    # keeps line breaks
parts: [Language, Copy, Code]
tokens:
  fill: surface/code            # always dark, both themes
  text: text/code
  label: text/code-muted
  code: typography/code
  shape: corners 16, header 36 high, code padding 16
```

---

# Feedback & overlays

## Alerts & notifications

Messages from the product to the person. An Alert is part of the page, an Inline message belongs to one field or block, a Snackbar reports an action and leaves, a Notification waits in a list until it is read.

**Choose**
- Page or section state → Alert.
- Note or error on one block → Inline message.
- Result of an action → Snackbar.
- Happened while away → Notification.
- Must decide now → Window.

**Never**
- A Snackbar for something people must not miss.
- An Alert with a timer.
- More than two Alerts on one page.
- Colour as the only difference.

```yaml
component: Alert
props:
  Color: [Blue, Green, Orange, Red, Pink]   # info, success, warning, error, notice
  Icon: boolean
  Close: boolean
  Title: boolean + "↳ Title": text
  Description: text
tokens: { fill: tone/<colour>/soft, text: text/primary, radius: alert/radius, padding: 12 16 }
---
component: Inline message
props: { Tone: [Info, Positive, Warning, Negative] }
---
component: Snackbar              # leaves after ~5 s
props: { Tone: [Default, Negative], Message: text }
tokens: { fill: surface/inverse, text: text/on-inverse }
---
component: Notification
props: { Type: [Person, System], State: [Unread, Read], Title, Text, Time }
tokens: { unread: surface/selected + Badge dot }
---
component: Notification panel
props: { Items: slot }
tokens: { fill: surface/floating, shadow: elevation/floating, radius: 16 }
```

## Progress

Progress components tell people that the product is working. Progress bar shows how much is done, Progress indicator spins when the amount is unknown, Stepper shows the named steps of a flow.

**Use when** something takes longer than 300 ms. Known amount → Progress bar. Unknown → Progress indicator. Loading a known layout → Skeleton.
**Never** a bar and a spinner for the same task, or a bar that jumps back.

```yaml
component: Progress bar
props: { Value: [0, 25, 50, 75, 100] }
tokens: { track: surface/track, fill: action/primary, shape: 8 high, radius/round }
---
component: Progress indicator   # spinner
props: { Size: [Small, Medium, Large] }   # 16, 24, 32
---
component: Stepper
props: { Orientation: [Horizontal, Vertical] }
slots: { Steps: Step[] }
---
component: Step
props:
  State: [Upcoming, Current, Done]   # outlined number · filled ink · green check
  Layout: [Stacked, Inline]          # Stacked for horizontal, Inline for vertical
  Label: text
  Number: text
  Line before: boolean
  Line after: boolean
tokens: { circle: 32, outline: line/field, current: surface/inverse, check: status/positive, line: line/subtle }
rules:
  - exactly one Current step; steps before it are Done
  - 3 to 6 steps, labels of one or two words
  - a horizontal stepper fills the width of its form
```

## Skeleton

Skeleton shows the shape of content before the data arrives, so nothing jumps when the real content loads.

**Use when** data is loading and the final layout is known.
**Never** a skeleton that does not match the real layout, or shimmer with reduced motion on.

```yaml
component: Skeleton
props:
  Shape: [Line, Title, Circle, Square, Block, Pill]
  Style: [Solid, Shimmer]   # Shimmer off when prefers-reduced-motion
---
component: Skeleton group
props: { Type: [List row, Card, Media, Table row, Paragraph] }
tokens: { fill: surface/disabled, highlight: surface/shimmer }
a11y: { container: aria-busy="true", announce: "Loading" once }
```

## Empty state

Empty state fills a place where there is no content yet. It says why it is empty and what to do next.

**Never** a blank area with no explanation, "No data" as the whole message, or an empty state while loading.

```yaml
component: Empty state
props:
  Title: text                   # what is missing
  Description: text             # why and what to do
  Icon: instance                # in a 64 circle
parts: [Icon, Title, Description, Buttons Primary Large]
rules:
  - one action, the main action of the page
  - empty search: no create button, offer to clear filters
```

## Tooltip

A tooltip is a short hint next to an element. It appears on hover or keyboard focus and never holds anything people need to finish a task.

**Use when** an icon-only control needs a name, or a term needs one more fact.
**Use something else when** the hint is needed to continue → Help text; there is an action inside → Popover.
**Never** buttons or links inside, or more than two sentences.

```yaml
component: Tooltip
props:
  Size: [Large, Small]            # Small: a few words; Large: 1-2 sentences, 240 wide
  Align: [Down, Up, Left, Right]  # the side the arrow points to
  Text: text
tokens: { fill: surface/inverse, text: text/on-inverse }
behaviour: { show: hover after ~500 ms, focus at once; hide: pointer leaves, Esc, scroll }
```

## Popover

Popover is a small panel that opens next to its trigger and keeps the page around it usable: share it, filter it, edit one value.

**Use when** a short interactive task belongs to one trigger.
**Use something else when** only a list of actions → Menu; a read-only hint → Tooltip; a blocking decision → Window.
**Never** opening on hover, a popover inside a popover, or more than one primary button.

```yaml
component: Popover
props:
  Placement: [Bottom, Top, Right, Left]
  Title: text
  Header: boolean
  Close: boolean
  Footer: boolean               # two Buttons
  Arrow: boolean
slots: [Content]
tokens: { fill: surface/floating, border: line/subtle, radius: radius/card, padding: 16, shadow: elevation/floating }
size: { width: 320, maxHeight: 480, offset: 8 }
a11y: { panel: role="dialog", focus moves in on open and returns on close, Esc closes }
```

## Window

Window is a dialog that opens over the page and asks for attention: a form, a confirmation, a set of settings. Drawer and Bottom sheet are side and bottom panels.

**Use Window when** a task must be finished or cancelled before going on. Short form → Type=Default. Irreversible step → Type=Alert. Settings with sections → Type=Side menu.
**Use Drawer when** details of a row open next to the list. On phones → Bottom sheet.
**Never** a window over a window (except an Alert to confirm), a Close icon in Type=Alert, more than two footer buttons, or "OK" and "Yes" as labels.

```yaml
component: Window
props:
  Type: [Default, Alert, Side menu]
  Tone: [Default, Danger]       # Danger: the primary button is Type=Danger
  Title: text
  Message: text                 # Type=Alert
slots:
  Content: any                  # Default, Side menu
  Menu: Action list item[]      # Side menu
size:
  Default: 540 wide, corners 32
  Alert: 320 wide, corners 24
  Side menu: 880 x 560, corners 32
tokens: { fill: surface/raised, backdrop: surface/scrim }
---
component: Drawer
props: { Title: text }
slots: { Content: any }
layout: { width: 400, side: right, padding: 24 }
---
component: Bottom sheet         # phones
props: { Title: text }
slots: { Content: any }
parts: [Handle, Title, Content, Buttons Large stacked]
rules:
  - one panel at a time
  - desktop: Drawer; phones: Bottom sheet
```

## Command palette

Command palette opens with ⌘K and lets people find a page, an object or an action by typing. Results are grouped; the keyboard does everything.

**Use when** a product has many actions and places, and power users act from the keyboard.
**Never** a palette without keyboard navigation, or results without groups when there are more than eight.

```yaml
component: Command palette
props: { Type: [Default, Empty] }
slots: { Results: [Group label, Action list item, Menu divider] }
parts: [Search (icon, query, Kbd Esc), Results, Footer (Kbd hints)]
layout: { width: 560, position: top third, centred, over surface/scrim }
rules:
  - opens with ⌘K, closes with Esc
  - arrows move, Enter runs the highlighted result
```
