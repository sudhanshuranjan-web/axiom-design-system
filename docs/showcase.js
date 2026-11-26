/* Showcase page wiring. Runs before axiom.js so code snippets capture the
   authored markup (not the runtime DOM), then renders Lucide icons. */
(function () {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const root = document.documentElement;
  const store = { get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }, set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} } };
  const scale = () => (window.Axiom ? Axiom.motionScale() : 1);
  const reduced = () => (window.Axiom ? Axiom.reducedMotion() : matchMedia("(prefers-reduced-motion: reduce)").matches);

  /* ---------- 1. Code snippets (captured before anything mutates the DOM) ---------- */
  const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  function dedent(src) {
    const lines = src.replace(/\t/g, "  ").split("\n");
    while (lines.length && !lines[0].trim()) lines.shift();
    while (lines.length && !lines[lines.length - 1].trim()) lines.pop();
    const min = Math.min(...lines.filter((l) => l.trim()).map((l) => l.match(/^ */)[0].length));
    return lines.map((l) => l.slice(min)).join("\n");
  }
  function highlight(html) {
    let s = esc(html);
    s = s.replace(/ ([a-z][a-z0-9-:]*)=(&quot;.*?&quot;)/gi, ' <span class="tk-a">$1</span>=<span class="tk-s">$2</span>');
    s = s.replace(/(&lt;\/?)([a-z][a-z0-9-]*)/gi, '<span class="tk-k">$1$2</span>').replace(/(\/?&gt;)/g, '<span class="tk-k">$1</span>');
    s = s.replace(/(&lt;!--.*?--&gt;)/g, '<span class="tk-c">$1</span>');
    return s;
  }
  let snipId = 0;
  $$("[data-snippet]").forEach((demo) => {
    const code = dedent(demo.innerHTML.replace(/ data-snippet=""/g, ""));
    const id = "snip-" + ++snipId;
    const bar = document.createElement("div");
    bar.className = "ds-block__foot";
    bar.innerHTML = `<span></span><button class="ax-btn ax-btn--ghost ax-btn--sm" type="button" aria-expanded="false" aria-controls="${id}"><i data-lucide="code-2"></i><span class="ax-btn__label">Show code</span></button>`;
    const box = document.createElement("div");
    box.className = "ds-code"; box.id = id; box.hidden = true;
    box.innerHTML = `<div class="ax-code-snippet"><div class="ax-code-snippet__head"><span>HTML</span><button class="ax-code-snippet__copy" type="button"><span class="ax-swap"><span><i data-lucide="copy"></i>Copy</span><span><i data-lucide="check"></i>Copied</span></span></button></div><pre>${highlight(code)}</pre></div>`;
    const btn = bar.querySelector("button");
    btn.addEventListener("click", () => {
      const open = btn.getAttribute("aria-expanded") !== "true";
      btn.setAttribute("aria-expanded", open); box.hidden = !open;
      btn.querySelector(".ax-btn__label").textContent = open ? "Hide code" : "Show code";
      if (open && !reduced()) box.animate([{ opacity: 0, transform: "translateY(-4px)" }, { opacity: 1, transform: "none" }], { duration: 200 * scale(), easing: "cubic-bezier(0.23,1,0.32,1)" });
    });
    const wrap = document.createElement("div"); wrap.className = "ds-snip";
    demo.before(wrap); wrap.append(demo, bar, box);
  });

  /* ---------- 2. Navigation, palette and scrollspy ---------- */
  const GROUP_ICON = { Start: "compass", Foundations: "swatch-book", Actions: "mouse-pointer-click", Inputs: "text-cursor-input", Navigation: "navigation", "Data display": "table-2", "Feedback & overlays": "message-square", Resources: "folder" };
  const entries = [];
  $$(".ds-section[data-group]").forEach((sec) => {
    const group = sec.dataset.group;
    if (sec.id) entries.push({ id: sec.id, title: sec.dataset.title, group });
    $$(".ds-block[id]", sec).forEach((b) => entries.push({ id: b.id, title: b.querySelector("h3").textContent.trim(), group }));
  });
  const navLinks = $("#ds-nav-links");
  let lastGroup = "", navHtml = "";
  entries.forEach((e) => {
    if (e.group !== lastGroup) { navHtml += `<div class="ds-nav__group" data-g="${e.group}">${e.group}</div>`; lastGroup = e.group; }
    navHtml += `<a class="ax-side-item" href="#${e.id}" data-g="${e.group}"><span class="ax-side-item__label">${esc(e.title)}</span></a>`;
  });
  navLinks.innerHTML = navHtml;
  const filter = $("#ds-filter");
  filter.addEventListener("input", () => {
    const q = filter.value.trim().toLowerCase(); let any = false;
    $$("a.ax-side-item", navLinks).forEach((a) => { const hit = !q || a.textContent.toLowerCase().includes(q) || a.dataset.g.toLowerCase().includes(q); a.hidden = !hit; any = any || hit; });
    $$(".ds-nav__group", navLinks).forEach((g) => (g.hidden = !$$(`a.ax-side-item[data-g="${g.dataset.g}"]:not([hidden])`, navLinks).length));
    $("#ds-nav-empty").hidden = any;
  });
  filter.addEventListener("keydown", (e) => { if (e.key === "Enter") { const a = $("a.ax-side-item:not([hidden])", navLinks); if (a) { a.click(); filter.blur(); } } });
  document.addEventListener("keydown", (e) => {
    if (e.key === "/" && !/input|textarea|select/i.test(document.activeElement.tagName) && !document.activeElement.isContentEditable) { e.preventDefault(); if (innerWidth <= 900) openNav(); filter.focus(); }
  });
  // mobile nav
  const nav = $("#ds-nav"), scrim = $("#ds-nav-scrim"), menuBtn = $("#ds-menu");
  function openNav() { nav.classList.add("is-open"); scrim.classList.add("is-open"); menuBtn.setAttribute("aria-expanded", "true"); }
  function closeNav() { nav.classList.remove("is-open"); scrim.classList.remove("is-open"); menuBtn.setAttribute("aria-expanded", "false"); }
  menuBtn.addEventListener("click", openNav); scrim.addEventListener("click", closeNav);
  navLinks.addEventListener("click", (e) => { if (e.target.closest("a")) closeNav(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && nav.classList.contains("is-open")) closeNav(); });
  // scrollspy
  const current = $("#ds-current");
  const spy = new IntersectionObserver((list) => {
    list.forEach((en) => {
      if (!en.isIntersecting) return;
      const e = entries.find((x) => x.id === en.target.id); if (!e) return;
      $$("a.ax-side-item", navLinks).forEach((a) => a.toggleAttribute("aria-current", a.getAttribute("href") === "#" + e.id));
      const a = $(`a[href="#${e.id}"]`, navLinks); if (a && !nav.matches(":hover")) a.scrollIntoView({ block: "nearest" });
      current.innerHTML = `${e.group} <span>/ ${esc(e.title)}</span>`;
    });
  }, { rootMargin: "-72px 0px -70% 0px" });
  entries.forEach((e) => { const el = document.getElementById(e.id); if (el) spy.observe(el); });
  $$("a.ax-side-item", navLinks).forEach((a) => a.setAttribute("aria-current", "false"));
  $$("a.ax-side-item", navLinks).forEach((a) => a.removeAttribute("aria-current"));
  // command palette results
  const pal = $("#palette-results");
  let palHtml = ""; lastGroup = "";
  entries.forEach((e) => {
    if (e.group !== lastGroup) { palHtml += `<div class="ax-menu__group">${e.group}</div>`; lastGroup = e.group; }
    palHtml += `<button class="ax-item" type="button" data-href="${e.id}"><i data-lucide="${GROUP_ICON[e.group] || "hash"}"></i><span class="ax-item__label">${esc(e.title)}</span><span class="ax-item__meta">Jump to</span></button>`;
  });
  palHtml += `<div class="ax-menu__group">Actions</div>
    <button class="ax-item" type="button" data-action="theme"><i data-lucide="moon"></i><span class="ax-item__label">Toggle dark mode</span></button>
    <button class="ax-item" type="button" data-action="motion"><i data-lucide="accessibility"></i><span class="ax-item__label">Toggle reduced motion</span></button>
    <button class="ax-item" type="button" data-action="toast"><i data-lucide="bell-ring"></i><span class="ax-item__label">Show a snackbar</span></button>`;
  pal.innerHTML = palHtml;
  $("#palette").addEventListener("axiom:command", (e) => {
    const a = e.detail.action;
    if (a === "theme") setTheme(effectiveDark() ? "light" : "dark", true);
    if (a === "motion") { const r = $("#ds-reduce"); r.checked = !r.checked; r.dispatchEvent(new Event("change")); }
    if (a === "toast") Axiom.toast({ message: "Hello from the command palette" });
  });

  /* ---------- 3. Theme and reduced motion ---------- */
  const mq = matchMedia("(prefers-color-scheme: dark)");
  const effectiveDark = () => root.dataset.theme === "dark" || (!root.dataset.theme && mq.matches);
  function setTheme(v, syncSeg) {
    if (v === "system") delete root.dataset.theme; else root.dataset.theme = v;
    store.set("axiom-theme", v);
    if (syncSeg) { const b = $(`#ds-theme [data-value="${v}"]`); if (b) b.click(); }
    requestAnimationFrame(() => { renderSwatchValues(); renderCurves(); });
  }
  const savedTheme = store.get("axiom-theme") || "system";
  $$("#ds-theme button").forEach((b) => b.setAttribute("aria-checked", b.dataset.value === savedTheme));
  $("#ds-theme").addEventListener("axiom:change", (e) => setTheme(e.detail.value));
  mq.addEventListener("change", () => requestAnimationFrame(renderSwatchValues));
  // brand: values change, roles and rules stay
  const savedBrand = root.dataset.brand || "axiom";
  $$("#ds-brand button").forEach((b) => b.setAttribute("aria-checked", b.dataset.value === savedBrand));
  $("#ds-brand")?.addEventListener("axiom:change", (e) => {
    root.dataset.brand = e.detail.value; store.set("axiom-brand", e.detail.value);
    requestAnimationFrame(() => { renderSwatchValues(); renderCurves(); renderTypeSpecs(); Axiom.refresh(); document.dispatchEvent(new CustomEvent("axiom:brand")); });
    if (document.fonts) document.fonts.ready.then(() => { Axiom.refresh(); renderTypeSpecs(); });
  });
  // view: show every component demo as web (default) or as mobile. Mobile adds .ax-m-scope, which swaps in
  // the mobile size scale and the app shapes; web frames, the structure demo and phones keep their own.
  function setView(v) {
    root.dataset.view = v; store.set("axiom-view", v);
    $$(".ds-demo").forEach((d) => { if (!d.closest(".ex-frame, .ds-structure, .ds-phone")) d.classList.toggle("ax-m-scope", v === "mobile"); });
    requestAnimationFrame(() => { Axiom.refresh(); window.dispatchEvent(new Event("resize")); });
  }
  const savedView = store.get("axiom-view") || "web";
  $$("#ds-view button").forEach((b) => b.setAttribute("aria-checked", b.dataset.value === savedView));
  if (savedView === "mobile") setView("mobile");
  $("#ds-view")?.addEventListener("axiom:change", (e) => setView(e.detail.value));
  const reduce = $("#ds-reduce");
  reduce.checked = root.dataset.motion === "reduced" || (!root.dataset.motion && matchMedia("(prefers-reduced-motion: reduce)").matches);
  reduce.addEventListener("change", () => { root.dataset.motion = reduce.checked ? "reduced" : "full"; store.set("axiom-motion", root.dataset.motion); document.dispatchEvent(new CustomEvent("axiom:motion")); });

  /* ---------- 4. Colour swatches ---------- */
  const TOKENS = {
    surface: [["canvas", "Page background behind everything"], ["raised", "Cards, fields, dialogs"], ["floating", "Menus, popovers"], ["sunken", "Recessed blocks, selected rows"], ["disabled", "Disabled fields, skeletons"], ["hover", "Hover of rows and ghost buttons"], ["scrim", "Dim layer behind dialogs"], ["inverse", "Tooltips, snackbars"], ["track", "Empty part of a measure"], ["selected", "Selected row, selection bar"], ["shimmer", "Skeleton highlight"], ["code", "Code blocks, both themes"]],
    text: [["primary", "Titles, body, icons"], ["secondary", "Descriptions"], ["tertiary", "Placeholders, meta"], ["on-action", "On action/primary"], ["on-inverse", "On surface/inverse"], ["negative", "Error message under a field"], ["link", "Links, text buttons"], ["disabled", "Disabled controls"], ["positive", "Money in, gains"], ["code", "Code text"], ["code-muted", "Comments, labels in code"]],
    line: [["subtle", "Card outlines, dividers"], ["field", "Field outline at rest"], ["strong", "Hovered field, selected card"], ["focus", "Focused field or control"], ["negative", "Field with an error"]],
    action: [["primary", "Main action"], ["primary-hover", "Primary under the cursor"], ["primary-pressed", "Primary while pressed"], ["secondary", "Secondary fill"], ["secondary-hover", "Secondary under the cursor"], ["secondary-pressed", "Secondary while pressed"], ["disabled", "Any disabled action"], ["danger", "Destructive action"], ["danger-hover", "Destructive under the pointer"], ["danger-pressed", "Destructive while pressed"]],
    status: [["positive", "Done, online, saved"], ["negative", "Errors (orange, not red)"], ["warning", "Needs attention"], ["info", "Neutral information"]],
    chart: [["1", "First series, single-hue charts"], ["2", "Second series"], ["3", "Third series"], ["4", "Fourth series"], ["5", "Fifth series"], ["6", "Sixth series, never cycled"]],
  };
  const probe = document.createElement("span"); probe.style.cssText = "position:absolute;visibility:hidden"; document.body.appendChild(probe);
  function cssToHex(c) {
    const m = c.match(/rgba?\(([^)]+)\)/); if (!m) return c;
    const [r, g, b, a] = m[1].split(/[ ,/]+/).filter(Boolean).map(Number);
    const hex = "#" + [r, g, b].map((x) => Math.round(x).toString(16).padStart(2, "0")).join("").toUpperCase();
    return a !== undefined && a < 1 ? `${hex} · ${Math.round(a * 100)}%` : hex;
  }
  function readToken(name) { probe.style.color = `var(${name})`; return cssToHex(getComputedStyle(probe).color); }
  // Ramps: every hue 50-700, neutral adds 800-950 for dark surfaces. Steps the roles use are ringed.
  const ROLE_STEPS = { light: [50, 100, 500, 600, 700], dark: [300, 400] };
  function drawRamps() {
    $$("[data-ramps]").forEach((wrap) => {
      const cs = getComputedStyle(document.documentElement), dark = document.documentElement.dataset.theme === "dark";
      const steps = [50, 100, 200, 300, 400, 500, 600, 700];
      const lum = (hex) => { const m = hex.replace("#", "").match(/../g); if (!m) return 1; const [r, g, b] = m.map((x) => { const v = parseInt(x, 16) / 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
      const cell = (hue, st) => { const v = cs.getPropertyValue(`--axp-${hue}-${st}`).trim(); if (!v) return ""; const ink = lum(v) > 0.42 ? "#171717" : "#ffffff"; const role = hue !== "n" && (dark ? ROLE_STEPS.dark : ROLE_STEPS.light).includes(st); return `<button type="button" class="ds-ramp__cell${role ? " is-role" : ""}" style="background:${v};color:${ink}" data-copy="var(--axp-${hue}-${st})" title="--axp-${hue}-${st} ${v}">${st}<small>${v}</small></button>`; };
      const head = `<div class="ds-ramp"><span></span>${steps.map((s) => `<span class="ds-ramp__cell ds-ramp__head">${s}</span>`).join("")}<span class="ds-ramp__extra" style="border:0"><span class="ds-ramp__cell ds-ramp__head" style="width:152px">dark surfaces only</span></span></div>`;
      wrap.innerHTML = head + wrap.dataset.ramps.split(" ").map((name) => { const hue = name === "neutral" ? "n" : name; return `<div class="ds-ramp"><span class="ds-ramp__name">${name}</span>${steps.map((s) => cell(hue, s)).join("")}${hue === "n" ? `<span class="ds-ramp__extra">${[800, 900, 950].map((s) => cell(hue, s)).join("")}</span>` : "<span></span>"}</div>`; }).join("");
      $$(".ds-ramp__cell[data-copy]", wrap).forEach((b) => b.addEventListener("click", () => { navigator.clipboard && navigator.clipboard.writeText(b.dataset.copy).catch(() => {}); window.Axiom && Axiom.toast && Axiom.toast({ message: "Copied " + b.dataset.copy }); }));
    });
  }
  drawRamps();
  new MutationObserver(drawRamps).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme", "data-brand"] });
  $$("[data-swatches]").forEach((wrap) => {
    const g = wrap.dataset.swatches;
    wrap.innerHTML = TOKENS[g].map(([n, use]) => {
      const v = g === "chart" ? `--ax-chart-${n}` : `--axiom-${g}-${n}`;
      let chip;
      if (g === "text") {
        const bg = n === "on-action" ? "var(--axiom-action-primary)" : n === "on-inverse" ? "var(--axiom-surface-inverse)" : n.startsWith("code") ? "var(--axiom-surface-code)" : "var(--axiom-surface-raised)";
        chip = `<span class="ds-swatch__chip" style="background:${bg};color:var(${v});display:grid;place-items:center;font:600 22px/1 var(--ax-sans)">Aa</span>`;
      } else if (g === "line") chip = `<span class="ds-swatch__chip" style="background:var(--axiom-surface-raised);display:grid;place-items:center"><span style="width:70%;height:28px;border-radius:10px;border:2px solid var(${v})"></span></span>`;
      else chip = `<span class="ds-swatch__chip" style="background:var(${v})"></span>`;
      return `<button class="ds-swatch" type="button" data-var="${v}" aria-label="Copy ${v}">${chip}<span class="ds-swatch__meta"><span class="ds-swatch__name">${g}/${n}</span><span class="ds-swatch__val" data-val="${v}"></span><span class="ds-swatch__use">${use}</span></span></button>`;
    }).join("");
  });
  function renderSwatchValues() { $$("[data-val]").forEach((el) => (el.textContent = readToken(el.dataset.val))); }
  renderSwatchValues();
  document.addEventListener("click", async (e) => {
    const sw = e.target.closest(".ds-swatch"); if (!sw) return;
    try { await navigator.clipboard.writeText(`var(${sw.dataset.var})`); } catch (er) {}
    Axiom.toast({ message: `Copied var(${sw.dataset.var})`, icon: "clipboard-check", duration: 2500 });
  });
  const TONES = [["blue", "Info, new"], ["green", "Success, paid"], ["orange", "Warning, pending"], ["red", "Critical, failed"], ["pink", "Notice, category"], ["yellow", "Ratings, highlights"], ["lime", "Category"], ["teal", "Category"], ["violet", "Premium, avatars"], ["clay", "Warm neutral"]];
  $("#ds-tones").innerHTML = TONES.map(([t, use]) => `<div class="ds-tone tone-${t}"><div class="ds-tone__head">${t}<span class="ax-tag ax-tag--solid tone-${t}">Solid</span></div><div class="ds-tone__use">${use}</div><div class="ds-tone__solid"></div></div>`).join("");

  /* ---------- 5. Spacing scale ---------- */
  const SPACE = [["space-0-5", 2], ["space-1", 4], ["space-1-5", 6], ["space-2", 8, "inline"], ["space-2-5", 10], ["space-3", 12, "stack"], ["space-3-5", 14], ["space-4", 16], ["space-5", 20], ["space-6", 24, "section · inset · gutter"], ["space-8", 32], ["space-10", 40], ["space-12", 48], ["space-16", 64], ["space-20", 80]];
  $("#ds-space").innerHTML = SPACE.map(([n, v, role]) => `<div class="ds-space__row"><span class="t-code" style="font-size:12px">${n}</span><span class="t-caption-strong ax-num">${v}</span><span style="display:flex;align-items:center;gap:8px"><span class="ds-space__bar" style="--w:${v * 2.4}px"></span>${role ? `<span class="t-caption tx-3">${role}</span>` : ""}</span></div>`).join("");

  /* ---------- 6. Icons ---------- */
  const ICONS = "actions/plus actions/minus actions/x actions/check actions/search actions/pencil actions/trash-2 actions/copy actions/share-2 actions/download actions/upload actions/settings actions/filter actions/more-horizontal actions/log-out arrows/chevron-down arrows/chevron-right arrows/arrow-up arrows/arrow-right arrows/undo-2 arrows/refresh-cw communication/mail communication/message-circle communication/bell communication/send communication/phone communication/at-sign files/file-text files/folder files/image files/paperclip files/archive finance/credit-card finance/wallet finance/landmark finance/receipt finance/trending-up finance/piggy-bank health/heart-pulse health/activity health/moon health/droplet commerce/shopping-bag commerce/lamp commerce/package commerce/truck commerce/tag time/calendar time/clock time/alarm-clock time/history people/user people/users people/user-plus editor/bold editor/italic editor/list editor/link editor/type editor/code-2 media/play media/pause media/mic media/headphones navigation/home navigation/menu navigation/compass navigation/map-pin status/info status/alert-triangle status/check-circle-2 status/lock status/eye ai/brain ai/bot ai/wand-2 devices/laptop devices/smartphone devices/monitor".split(" ");
  $("#ds-icons").innerHTML = ICONS.map((n) => `<button class="ds-icon" type="button" data-name="${n}" aria-label="Copy ${n}"><i data-lucide="${n.split("/")[1]}"></i><span>${n}</span></button>`).join("");
  $("#ds-icons").addEventListener("click", async (e) => { const b = e.target.closest(".ds-icon"); if (!b) return; try { await navigator.clipboard.writeText(b.dataset.name); } catch (er) {} Axiom.toast({ message: `Copied ${b.dataset.name}`, icon: "clipboard-check", duration: 2500 }); });
  $("#ds-icon-filter").addEventListener("input", (e) => { const q = e.target.value.toLowerCase(); $$(".ds-icon").forEach((b) => (b.hidden = !b.dataset.name.includes(q))); });

  /* ---------- 7. Motion lab ---------- */
  // Curves are read from the live tokens, so the active brand's values show
  const CURVES = [["Standard", "--axiom-motion-easing-standard", "Default for anything that moves on screen"], ["Enter", "--axiom-motion-easing-enter", "Elements appearing: decelerate into place"], ["Exit", "--axiom-motion-easing-exit", "Elements leaving: accelerate away"], ["Strong ease-out", "--axiom-ease-out", "Menus, popovers, tooltips, press"], ["Strong ease-in-out", "--axiom-ease-in-out", "Charts drawing, clip reveals"], ["Drawer", "--axiom-ease-drawer", "Drawers and bottom sheets"]];
  function renderCurves() {
    const cs = getComputedStyle(root);
    $("#ds-curves").innerHTML = CURVES.map(([name, tok, use]) => {
      const raw = cs.getPropertyValue(tok).trim(); const inside = (raw.match(/\(([^)]+)\)/) || [])[1]; const p = inside ? inside.split(",").map((x) => parseFloat(x)) : [0.2, 0, 0, 1];
      return `<button class="ds-curve" type="button" data-curve="${p.join(",")}"><svg viewBox="-4 -4 108 108" aria-hidden="true"><line class="axis" x1="0" y1="100" x2="100" y2="100"/><line class="axis" x1="0" y1="0" x2="0" y2="100"/><path class="curve" d="M0,100 C${p[0] * 100},${100 - p[1] * 100} ${p[2] * 100},${100 - p[3] * 100} 100,0"/></svg><div><b>${name}</b><br><code>${tok}</code><br><code>cubic-bezier(${p.join(", ")})</code><br><span class="t-caption tx-3">${use}</span></div><div class="ds-curve__track"><span class="ds-curve__ball"></span></div></button>`;
    }).join("");
  }
  renderCurves();
  // Typography specimen specs follow the active brand
  function renderTypeSpecs() {
    $$(".ds-type__row").forEach((r) => {
      const sample = $(".ds-type__sample", r), spec = $(".ds-type__spec", r); const el = sample.firstElementChild || sample;
      const cs = getComputedStyle(el); const fam = cs.fontFamily.split(",")[0].replace(/"/g, "");
      const w = { 400: "Regular", 500: "Medium", 600: "Semi Bold", 700: "Bold" }[cs.fontWeight] || cs.fontWeight;
      spec.textContent = `${fam} ${w} ${parseFloat(cs.fontSize)}/${parseFloat(cs.lineHeight) || "–"}`;
    });
  }
  document.fonts && document.fonts.ready.then(renderTypeSpecs); renderTypeSpecs();
  $("#ds-curves").addEventListener("click", (e) => {
    const c = e.target.closest(".ds-curve"); if (!c) return;
    const ball = $(".ds-curve__ball", c), track = $(".ds-curve__track", c); const dist = track.clientWidth - 20;
    ball.animate([{ transform: "translateX(0)" }, { transform: `translateX(${dist}px)` }], { duration: 900 * scale(), easing: `cubic-bezier(${c.dataset.curve})`, fill: "forwards" });
  });
  $("#ds-durations").addEventListener("click", (e) => {
    const r = e.target.closest(".ds-dur"); if (!r) return;
    const ball = $(".ds-dur__ball", r), track = $(".ds-dur__track", r); const dist = track.clientWidth - 24;
    const at = ball.dataset.at === "1"; ball.dataset.at = at ? "0" : "1";
    ball.animate([{ transform: `translateX(${at ? dist : 0}px)` }, { transform: `translateX(${at ? 0 : dist}px)` }], { duration: +r.dataset.ms * scale(), easing: "cubic-bezier(0.2,0,0,1)", fill: "forwards" });
  });
  $$(".ds-dur").forEach((r) => { r.tabIndex = 0; r.setAttribute("role", "button"); r.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); r.click(); } }); });
  // enter / exit
  const ee = $("#rec-ee");
  $("#rec-ee-btn").addEventListener("click", () => { ee.dataset.state = ee.dataset.state === "open" ? "closed" : "open"; });
  // origin demo B: force centre origin
  $("#rec-pop-b").addEventListener("axiom:open", (e) => e.target.style.setProperty("--origin", "center"));
  // stagger replay
  $("#rec-stagger-btn").addEventListener("click", () => { const s = $("#rec-stagger"); s.classList.remove("is-revealed"); void s.offsetWidth; requestAnimationFrame(() => s.classList.add("is-revealed")); });
  // clip replay
  $("#rec-clip-btn").addEventListener("click", () => { const s = $("#rec-clip"); s.style.transition = "none"; s.classList.remove("is-revealed"); void s.offsetWidth; s.style.transition = ""; requestAnimationFrame(() => s.classList.add("is-revealed")); });
  // interruptible
  $("#rec-int-btn").addEventListener("click", () => { $("#rec-int-t").classList.toggle("is-right"); const k = $("#rec-int-k"); k.classList.toggle("is-right"); });
  // spring
  (function spring() {
    const ball = $("#rec-spring"); let x = 0, y = 0, vx = 0, vy = 0, drag = false, sx = 0, sy = 0, lx = 0, ly = 0, lt = 0, raf = 0;
    const set = () => (ball.style.transform = `translate(${x}px, ${y}px)`);
    ball.addEventListener("pointerdown", (e) => { drag = true; cancelAnimationFrame(raf); ball.setPointerCapture(e.pointerId); sx = e.clientX - x; sy = e.clientY - y; lx = e.clientX; ly = e.clientY; lt = performance.now(); vx = vy = 0; });
    ball.addEventListener("pointermove", (e) => { if (!drag) return; const t = performance.now(), dt = Math.max(1, t - lt); vx = ((e.clientX - lx) / dt) * 1000; vy = ((e.clientY - ly) / dt) * 1000; lx = e.clientX; ly = e.clientY; lt = t; const lim = 90; x = Math.max(-lim * 1.6, Math.min(lim * 1.6, e.clientX - sx)); y = Math.max(-lim * 0.7, Math.min(lim * 0.7, e.clientY - sy)); set(); });
    const release = () => {
      if (!drag) return; drag = false;
      if (reduced()) { x = y = 0; set(); return; }
      const k = 170 / scale() / scale(), c = 16 / scale(); let last = performance.now();
      const step = (t) => { const dt = Math.min(0.032, (t - last) / 1000); last = t; vx += (-k * x - c * vx) * dt; vy += (-k * y - c * vy) * dt; x += vx * dt; y += vy * dt; set(); if (Math.abs(x) + Math.abs(y) + Math.abs(vx) / 50 + Math.abs(vy) / 50 > 0.2) raf = requestAnimationFrame(step); else { x = y = 0; set(); } };
      raf = requestAnimationFrame(step);
    };
    ball.addEventListener("pointerup", release); ball.addEventListener("pointercancel", release);
  })();

  /* ---------- 8. Demo wiring ---------- */
  // counters on reveal
  function countUp(el) { const to = +el.dataset.countTo, pre = el.dataset.prefix || ""; el.dataset.value = 0; Axiom.count(el, to, 1100, (v) => pre + Math.round(v).toLocaleString("en-US")); }
  document.addEventListener("axiom:reveal", (e) => { $$("[data-count-to]", e.target).forEach(countUp); $$("[data-ring]", e.target).forEach((r) => r.style.setProperty("--p", r.dataset.ring)); $$("[data-donut]", e.target).forEach(drawDonut); }, true);
  // donut
  function drawDonut(svg) {
    const parts = svg.dataset.donut.split(",").map(Number); const C = 2 * Math.PI * 48; let acc = 0;
    $$(".ax-donut__seg", svg).forEach((seg, i) => { const len = (parts[i] / 100) * C - 2; seg.style.strokeDasharray = `0 ${C}`; seg.style.strokeDashoffset = -acc; acc += (parts[i] / 100) * C; requestAnimationFrame(() => requestAnimationFrame(() => (seg.style.strokeDasharray = `${len} ${C}`))); });
  }
  // heatmap
  const hm = $("#heatmap"); let h = "";
  for (let i = 0; i < 126; i++) { const v = Math.abs(Math.sin(i * 12.9898) * 43758.5453) % 1; const l = v > 0.82 ? 4 : v > 0.62 ? 3 : v > 0.42 ? 2 : v > 0.24 ? 1 : 0; h += `<i data-l="${l}" style="--i:${i}"></i>`; }
  hm.innerHTML = h;
  // QR
  if (window.qrcode) { const q = qrcode(0, "M"); q.addData("https://axiom.com/join/2048"); q.make(); $("#qr-demo").innerHTML = q.createSvgTag({ cellSize: 4, margin: 0, scalable: false }); }
  // map pins
  $("#map-demo").addEventListener("click", (e) => { const p = e.target.closest("button.ax-pin"); if (!p) return; $$("#map-demo .ax-pin").forEach((x) => x.classList.toggle("is-selected", x === p)); });
  // filter chips count
  const fd = $("#filter-demo");
  const fsync = () => { const n = $$(".ax-chip[aria-pressed=true]", fd).length; const b = $("#filter-count"); b.textContent = n; b.hidden = !n; $("#filter-clear").hidden = !n; };
  fd.addEventListener("click", (e) => { if (e.target.closest("#filter-clear")) $$(".ax-chip", fd).forEach((c) => c.setAttribute("aria-pressed", "false")); setTimeout(fsync); });
  // upload simulate
  $("#upload-sim").addEventListener("click", () => $("#upload-list").prepend(AxiomFileRow("Moodboard-final.png", 1.8 * 1024 * 1024)));
  $("#upload-sim-fail").addEventListener("click", () => $("#upload-list").prepend(AxiomFileRow("Launch-video.mov", 14 * 1024 * 1024, true)));
  // chat
  const ci = $("#chat-input"), cf = $("#chat-form"), send = $("button[type=submit]", cf), thread = $("#chat-thread");
  ci.addEventListener("input", () => (send.disabled = !ci.value.trim()));
  cf.addEventListener("submit", (e) => {
    e.preventDefault(); const text = ci.value.trim(); if (!text) return;
    const now = new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
    const m = document.createElement("div"); m.className = "ax-msg ax-msg--out"; m.innerHTML = `<div class="ax-msg__stack"><div class="ax-bubble is-new"><span></span><span class="ax-bubble__meta">${now}<i data-lucide="check"></i></span></div></div>`;
    m.querySelector(".ax-bubble span").textContent = text; thread.appendChild(m); Axiom.icons(m); ci.value = ""; send.disabled = true;
    setTimeout(() => {
      const meta = m.querySelector(".ax-bubble__meta"); meta.innerHTML = `${now}<i data-lucide="check-check"></i>`; Axiom.icons(meta);
      const t = document.createElement("div"); t.className = "ax-msg ax-msg--in"; t.innerHTML = `<span class="ax-avatar ax-avatar--sm tone-orange">M</span><div class="ax-msg__stack"><div class="ax-typing is-new ax-bubble" style="padding:14px 16px" aria-label="Mara is typing"><i></i><i></i><i></i></div></div>`;
      thread.appendChild(t);
      setTimeout(() => { const s = t.querySelector(".ax-msg__stack"); s.innerHTML = `<div class="ax-bubble is-new">Perfect, thanks! 🙌</div>`; }, 1600 * scale());
    }, 700 * scale());
  });
  // toast burst
  $("#toast-burst").addEventListener("click", () => { ["Invoice #0147 sent", "Reminder scheduled", "Client notified"].forEach((m, i) => setTimeout(() => Axiom.toast({ message: m }), i * 180)); });
  // skeleton → content (crossfade, same geometry)
  const sk = $("#skel-demo"), skBtn = $("#skel-toggle"), skHtml = sk.innerHTML;
  skBtn.addEventListener("click", () => {
    const loaded = sk.getAttribute("aria-busy") === "false";
    sk.setAttribute("aria-busy", loaded ? "true" : "false");
    sk.innerHTML = loaded ? skHtml : `<div class="ds-row" style="flex-wrap:nowrap"><span class="ax-avatar ax-avatar--lg tone-orange">M</span><div class="ds-stack" style="flex:1;gap:2px"><b class="t-label">Mara Okafor</b><span class="t-caption tx-3">Shared a moodboard · 2 min ago</span></div></div><div style="height:120px;border-radius:14px;background:linear-gradient(135deg,var(--axiom-tone-yellow-soft),var(--axiom-tone-pink-soft) 60%,var(--axiom-tone-violet-soft))"></div><div class="ds-row"><span class="ax-tag tone-pink">Brand</span><span class="ax-tag tone-yellow">Moodboard</span></div>`;
    if (!reduced()) $$(":scope > *", sk).forEach((c, i) => c.animate([{ opacity: 0, filter: "blur(2px)" }, { opacity: 1, filter: "blur(0)" }], { duration: 260 * scale(), delay: i * 50 * scale(), easing: "ease", fill: "backwards" }));
    skBtn.textContent = loaded ? "Load content" : "Show skeleton";
  });
  // progress bar loop
  const pb = $("#prog-bar"), pl = $("#prog-label"); let pv = 0;
  setInterval(() => { if (document.hidden) return; pv = pv >= 100 ? 0 : Math.min(100, pv + 7 + Math.round(Math.random() * 9)); pb.querySelector(".ax-progress__fill").style.setProperty("--v", pv / 100); pb.setAttribute("aria-valuenow", pv); pl.textContent = pv + "%"; }, 700);
  // badge bump
  $("#badge-btn").addEventListener("click", () => { const b = $("#badge-demo"); const n = +b.textContent + 1; b.textContent = n > 99 ? "99+" : n; b.classList.remove("is-bump"); void b.offsetWidth; b.classList.add("is-bump"); $("#badge-btn").setAttribute("aria-label", `Inbox, ${n} unread`); });

  /* ---------- 8b. Structure frame: scale to fit, toggle regions ---------- */
  const sFrame = $("#structure-frame");
  if (sFrame) {
    const sWrap = sFrame.parentElement;
    const fitS = () => sWrap.style.setProperty("--k", (sWrap.clientWidth / 1280).toFixed(4));
    new ResizeObserver(fitS).observe(sWrap); fitS();
    $("#structure-regions").addEventListener("click", (e) => { const b = e.currentTarget, on = b.getAttribute("aria-pressed") !== "true"; b.setAttribute("aria-pressed", on); sFrame.classList.toggle("is-annotated", on); });
  }

  /* ---------- 8c. Dimensions inspector ---------- */
  // Measures what is rendered: size, padding, gap and radius of every component in a block,
  // plus the same component re-measured in a mobile scope (.ax-m-scope) for the web/mobile table.
  const ATOMS = ".ds-icon,.ax-btn,.ax-control,.ax-chip,.ax-tag,.ax-badge,.ax-segmented,.ax-tab,.ax-item,.ax-option,.ax-row,.ax-mrow,.ax-side-item,.ax-appbar-link,.ax-tool,.ax-avatar,.ax-kbd,.ax-switch__track,.ax-check__box,.ax-date,.ax-slot,.ax-page,.ax-code__cell,.ax-snackbar,.ax-alert,.ax-tabbar__item,.ax-fab,.ax-icon-btn,.ax-back,.ax-crumb,.ax-close,.ax-msearch__field,.ax-acc__head,.ax-tree__item,.ax-composer,.ax-card,.ax-kcard,.ax-file,.ax-notif,.ax-mtopbar,.ax-tabbar,.ax-shell__sidebar,.ax-shell__topbar,.ax-shell__page,.ax-asheet__item,.ax-th,.ax-action-bar,.ax-toolbar,.ax-pagination,.ax-datepicker,.ax-color,.ax-upload";
  const CONTAINERS = ".ax-card,.ax-kcard,.ax-alert,.ax-snackbar,.ax-mtopbar,.ax-tabbar,.ax-shell__sidebar,.ax-shell__topbar,.ax-shell__page,.ax-composer,.ax-notif,.ax-file,.ax-action-bar,.ax-toolbar,.ax-pagination,.ax-datepicker,.ax-color,.ax-upload,.ax-mrow,.ax-row";
  const NAMES = { "ax-btn": "Button", "ax-control": "Field", "ax-chip": "Chip", "ax-tag": "Tag", "ax-badge": "Badge", "ax-segmented": "Segmented", "ax-tab": "Tab", "ax-item": "Menu item", "ax-option": "Option", "ax-row": "List row", "ax-mrow": "Mobile row", "ax-side-item": "Sidebar item", "ax-appbar-link": "App bar link", "ax-tool": "Tool button", "ax-avatar": "Avatar", "ax-kbd": "Kbd", "ax-switch__track": "Switch", "ax-check__box": "Checkbox", "ax-date": "Date cell", "ax-slot": "Time slot", "ax-page": "Page cell", "ax-code__cell": "Code cell", "ax-snackbar": "Snackbar", "ax-alert": "Alert", "ax-tabbar__item": "Tab bar item", "ax-fab": "FAB", "ax-icon-btn": "Icon button", "ax-back": "Back button", "ax-crumb": "Breadcrumb", "ax-close": "Close", "ax-msearch__field": "Search field", "ax-acc__head": "Accordion row", "ax-tree__item": "Tree row", "ax-composer": "Composer", "ax-card": "Card", "ax-kcard": "Kanban card", "ax-file": "File row", "ax-notif": "Notification", "ax-mtopbar": "Top bar", "ax-tabbar": "Tab bar", "ax-shell__sidebar": "Sidebar", "ax-shell__topbar": "Top bar", "ax-shell__page": "Page", "ax-asheet__item": "Action sheet item", "ax-th": "Table header", "ds-icon": "Icon tile", "ax-action-bar": "Action bar", "ax-toolbar": "Toolbar", "ax-pagination": "Pagination", "ax-datepicker": "Date picker", "ax-color": "Colour picker", "ax-upload": "Upload zone" };
  const px = (v) => Math.round(parseFloat(v) * 10) / 10 || 0;
  const sig = (el) => { const c = [...el.classList]; const base = c.find((k) => NAMES[k]); const pick = (re) => c.find((k) => base && k.startsWith(base + "--") && re.test(k)); const parts = [pick(/--(sm|lg|m|icon|md|xl)$/), pick(/--(primary|ghost|danger|square|outlined|elevated|sunken)$/)].filter(Boolean).map((k) => k.split("--")[1]); const mod = parts.join(" · "); return { base, mod, key: base + "|" + mod }; };
  let scope = null;
  function mobileClone(el) {
    if (!scope) { scope = document.createElement("div"); scope.className = "ax-m-scope ds-m-scope"; scope.style.cssText = "position:fixed;left:-9999px;top:0;width:360px;visibility:hidden;pointer-events:none"; document.body.appendChild(scope); }
    const c = el.cloneNode(true); c.removeAttribute("id"); scope.replaceChildren(c);
    const cs = getComputedStyle(c), r = c.getBoundingClientRect();
    return { h: Math.round(r.height), pad: `${px(cs.paddingTop)} ${px(cs.paddingRight)}`, font: px(cs.fontSize) };
  }
  // Redlines, drawn in the root's own (unscaled) pixels so they line up inside scaled phones and frames.
  // AXIOM rule: every dimension is a multiple of 2, so any odd height, padding, gap, radius or icon is flagged.
  const odd = (n) => Math.round(n) % 2 !== 0 && Math.abs(n - Math.round(n)) < 0.2;
  function painter(layer) {
    const el = (cls, box, label) => {
      const d = document.createElement("div"); d.className = cls;
      for (const k in box) d.style[k] = box[k] + "px";
      if (label != null) { const t = document.createElement("span"); t.textContent = label; if (/^\d+$/.test(label) && odd(+label)) t.className = "is-odd"; d.appendChild(t); }
      layer.appendChild(d); return d;
    };
    return {
      v: (x, y1, y2, label, side = "l") => el("rl rl--v rl--" + side, { left: x, top: y1, height: Math.max(1, y2 - y1) }, label),
      h: (x1, x2, y, label, side = "t") => el("rl rl--h rl--" + side, { left: x1, top: y, width: Math.max(1, x2 - x1) }, label),
      box: (b, cls, label) => el("rl-box " + cls, { left: b.x, top: b.y, width: b.w, height: b.h }, label),
      fill: (cls, x, y, w, h, label) => el(cls, { left: x, top: y, width: w, height: h }, label),
    };
  }
  const geom = (root) => { const rr = root.getBoundingClientRect(), k = rr.width / (root.offsetWidth || 1) || 1; return { k, rel: (el) => { const r = el.getBoundingClientRect(); return { x: (r.left - rr.left) / k, y: (r.top - rr.top) / k, w: r.width / k, h: r.height / k }; } }; };
  const r1 = (n) => Math.round(n * 10) / 10;
  function measure(root) {
    const { rel } = geom(root);
    const layer = document.createElement("div"); layer.className = "ds-measure"; layer.setAttribute("aria-hidden", "true");
    const P = painter(layer), found = [];
    let lastRow = null;
    $$(ATOMS, root).forEach((el) => {
      if (found.length > (root.matches(".ds-icons") ? 5 : 70) || (!el.offsetParent && getComputedStyle(el).position !== "fixed")) return;
      const anc = el.parentElement.closest(ATOMS); if (anc && root.contains(anc) && !anc.matches(CONTAINERS)) return;
      const b = rel(el); if (b.w < 6 || b.h < 6 || b.x > root.offsetWidth || b.y > root.offsetHeight || b.x + b.w < 0 || b.y + b.h < 0) return;
      found.push(el);
      const cs = getComputedStyle(el), container = el.matches(CONTAINERS) && b.h > 72;
      P.box(b, container ? "rl-box--wrap" : "rl-box--el");
      const row = { y: Math.round(b.y), h: Math.round(b.h), x: b.x + b.w };
      if (!container && !(lastRow && Math.abs(lastRow.y - row.y) < 3 && lastRow.h === row.h && b.x >= lastRow.x - 2)) P.v(b.x - 6, b.y, b.y + b.h, String(Math.round(b.h)), "l");
      lastRow = row;
      const pt = px(cs.paddingTop), pr = px(cs.paddingRight), pb = px(cs.paddingBottom), pl = px(cs.paddingLeft);
      if (pl >= 2) P.fill("rl-pad", b.x, b.y, pl, b.h, pl >= 8 ? String(r1(pl)) : null);
      if (pr >= 2) P.fill("rl-pad", b.x + b.w - pr, b.y, pr, b.h, null);
      if (container) { if (pt >= 2) P.fill("rl-pad", b.x + pl, b.y, b.w - pl - pr, pt, pt >= 10 ? String(r1(pt)) : null); if (pb >= 2) P.fill("rl-pad", b.x + pl, b.y + b.h - pb, b.w - pl - pr, pb, null); }
      let iconLabelled = false;
      $$("svg.lucide", el).forEach((ic) => {
        if (ic.closest(ATOMS) !== el) return;
        const ib = rel(ic); if (ib.w < 4) return;
        P.box(ib, "rl-box--icon", iconLabelled ? null : String(Math.round(ib.w))); iconLabelled = true;
      });
      const gap = px(cs.columnGap || cs.gap), rowGap = px(cs.rowGap || cs.gap);
      if (/flex|grid/.test(cs.display) && (gap || rowGap)) {
        const kids = [...el.children].filter((c) => c.getClientRects().length && c.getBoundingClientRect().width > 0).map(rel);
        let labelled = false;
        for (let i = 1; i < kids.length; i++) {
          const a = kids[i - 1], c = kids[i];
          if (Math.abs((c.y + c.h / 2) - (a.y + a.h / 2)) < Math.max(a.h, c.h) / 2 && c.x > a.x + a.w - 1) { const gx = a.x + a.w, gw = c.x - gx; if (gw > 0.5) { P.fill("rl-gap", gx, Math.min(a.y, c.y), gw, Math.max(a.h, c.h), labelled ? null : String(Math.round(gw))); labelled = true; } }
          else if (c.y > a.y + a.h - 1 && rowGap) { const gy = a.y + a.h, gh = c.y - gy; if (gh > 0.5) { P.fill("rl-gap rl-gap--row", Math.min(a.x, c.x), gy, Math.max(a.w, c.w), gh, labelled ? null : String(Math.round(gh))); labelled = true; } }
        }
      }
    });
    root.appendChild(layer);
    const hover = document.createElement("div"); hover.className = "ds-measure ds-measure--hover"; hover.setAttribute("aria-hidden", "true"); root.appendChild(hover);
    const HP = painter(hover);
    const area = (f) => { const r = f.getBoundingClientRect(); return r.width * r.height; };
    const onMove = (e) => {
      const hit = found.filter((f) => { const r = f.getBoundingClientRect(); return e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom; }).sort((a, c) => area(a) - area(c))[0];
      if (hit === hover._el) return;
      hover._el = hit; hover.replaceChildren(); if (!hit) return;
      const b = geom(root).rel(hit), cs = getComputedStyle(hit);
      HP.box(b, "rl-box--focus");
      HP.h(b.x, b.x + b.w, b.y - 10, String(Math.round(b.w)), "t");
      HP.v(b.x + b.w + 10, b.y, b.y + b.h, String(Math.round(b.h)), "r");
      const pt = px(cs.paddingTop), pr = px(cs.paddingRight), pb = px(cs.paddingBottom), pl = px(cs.paddingLeft);
      if (pl) HP.h(b.x, b.x + pl, b.y + b.h / 2, String(r1(pl)), "c");
      if (pr) HP.h(b.x + b.w - pr, b.x + b.w, b.y + b.h / 2, String(r1(pr)), "c");
      if (pt) HP.v(b.x + b.w / 2, b.y, b.y + pt, String(r1(pt)), "c");
      if (pb) HP.v(b.x + b.w / 2, b.y + b.h - pb, b.y + b.h, String(r1(pb)), "c");
      const rad = px(cs.borderTopLeftRadius);
      if (rad) HP.fill("rl-radius", b.x, b.y, Math.min(rad, 24), Math.min(rad, 24), "r " + (rad >= 999 ? "full" : r1(rad)));
      const s = sig(hit);
      HP.fill("rl-spec", b.x, b.y + b.h + 8, 0, 0, `${NAMES[s.base] || ""}${s.mod ? " · " + s.mod : ""} · ${Math.round(b.w)}×${Math.round(b.h)} · type ${r1(px(cs.fontSize))}/${r1(px(cs.lineHeight)) || "–"} ${cs.fontWeight}`);
    };
    const onLeave = () => { hover._el = null; hover.replaceChildren(); };
    root.addEventListener("pointermove", onMove); root.addEventListener("pointerleave", onLeave);
    layer._off = () => { root.removeEventListener("pointermove", onMove); root.removeEventListener("pointerleave", onLeave); hover.parentNode && hover.parentNode.removeChild(hover); };
    return found;
  }
  function dimsTable(block, els) {
    const rows = new Map();
    els.forEach((el) => {
      const s = sig(el); if (!s.base || rows.has(s.key) || rows.size > 16) return;
      const inMobile = !!el.closest(".ax-screen"), cs = getComputedStyle(el), h = Math.round(el.getBoundingClientRect().height / ((el.closest(".ax-screen")?.getBoundingClientRect().width || 1) / (el.closest(".ax-screen")?.offsetWidth || 1)));
      const own = { h, pad: `${px(cs.paddingTop)} ${px(cs.paddingRight)}`, font: px(cs.fontSize) };
      let other = null; try { if (!el.closest("table")) other = inMobile ? null : mobileClone(el); } catch (e) {}
      rows.set(s.key, { name: (NAMES[s.base] || s.base) + (s.mod ? " · " + s.mod : ""), web: inMobile ? null : own, mob: inMobile ? own : other, radius: px(cs.borderTopLeftRadius) >= 999 ? "full" : px(cs.borderTopLeftRadius), gap: px(cs.columnGap || cs.gap) || "—" });
    });
    if (!rows.size) return null;
    const box = document.createElement("div"); box.className = "ds-dims";
    box.innerHTML = `<div class="ds-dims__legend"><span><i style="border-left:1px solid #f43f5e;width:1px;height:12px"></i>Height · width</span><span><i style="background:rgb(16 185 129/.35)"></i>Padding</span><span><i style="background:rgb(139 92 246/.45)"></i>Gap</span><span><i style="outline:1px dashed #0ea5e9"></i>Icon</span><span><i style="background:#f97316"></i>Odd value (breaks the 2px rule)</span><span class="tx-3">Hover any part for its full redline. Mobile values re-measured inside .ax-m-scope.</span></div>
      <div class="ds-dims__scroll"><table class="ds-table"><thead><tr><th>Component</th><th>Web height</th><th>Mobile height</th><th>Padding (top right) web → mobile</th><th>Font web → mobile</th><th>Gap</th><th>Radius</th></tr></thead><tbody>${[...rows.values()].map((r) => `<tr><td>${r.name}</td><td>${r.web ? r.web.h : "—"}</td><td>${r.mob ? r.mob.h : "—"}</td><td><code>${r.web ? r.web.pad : "—"}</code> → <code>${r.mob ? r.mob.pad : "—"}</code></td><td>${r.web ? r.web.font : "—"} → ${r.mob ? r.mob.font : "—"}</td><td>${r.gap}</td><td>${r.radius}</td></tr>`).join("")}</tbody></table></div>`;
    return box;
  }
  $$(".ds-block").forEach((block) => {
    const roots = () => $$(".ds-demo, .ds-phone__screen, .ds-structure, .ds-icon-anatomy, .ds-icons", block);
    if (!roots().length) return;
    const head = $(".ds-block__head > div", block); if (!head) return;
    const btn = document.createElement("button");
    btn.type = "button"; btn.className = "ax-btn ax-btn--sm ds-dim-btn"; btn.setAttribute("aria-pressed", "false"); btn.style.marginTop = "12px";
    btn.innerHTML = '<i data-lucide="ruler"></i>Dimensions';
    head.appendChild(btn);
    let panel = null;
    const clear = () => { $$(".ds-measure", block).forEach((m) => { if (m._off) m._off(); if (m.parentNode) m.parentNode.removeChild(m); }); if (panel) { panel.remove(); panel = null; } };
    const run = () => { clear(); const all = []; roots().forEach((r) => all.push(...measure(r))); panel = dimsTable(block, all); if (panel) $(".ds-block__head", block).after(panel); };
    btn.addEventListener("click", () => { const on = btn.getAttribute("aria-pressed") !== "true"; btn.setAttribute("aria-pressed", on); btn.innerHTML = on ? '<i data-lucide="ruler"></i>Hide dimensions' : '<i data-lucide="ruler"></i>Dimensions'; if (window.Axiom) Axiom.icons(btn); else if (window.lucide) lucide.createIcons(); on ? run() : clear(); });
    let t; new ResizeObserver(() => { if (btn.getAttribute("aria-pressed") === "true") { clearTimeout(t); t = setTimeout(run, 200); } }).observe(block);
  });

  /* ---------- 9. Icons last ---------- */
  if (window.lucide) lucide.createIcons({ attrs: { "aria-hidden": "true" } });
  else document.documentElement.classList.add("no-icons");
})();
