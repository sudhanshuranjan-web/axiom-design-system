/* ==========================================================================
   AXIOM — mobile behaviour v1.1 (load after axiom.js)
   Everything is scoped to an .ax-screen. Gestures use pointer events with
   axis locking; pull to refresh also listens to touch so native scroll keeps
   working on phones. Public API: AxiomMobile.init, snack, openSheet, closeSheet.
   ========================================================================== */
(function () {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const on = (el, ev, fn, o) => el && el.addEventListener(ev, fn, o);
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const once = (el, k) => (el.dataset[k] ? false : (el.dataset[k] = "1"));
  const reduced = () => (window.Axiom ? Axiom.reducedMotion() : false);
  const ms = (n) => n * (window.Axiom ? Axiom.motionScale() : 1);
  const icons = (r) => window.Axiom && Axiom.icons(r);
  const screenOf = (el) => el.closest(".ax-screen");
  const scaleOf = (el) => { const s = screenOf(el) || el; return s.getBoundingClientRect().width / (s.offsetWidth || 1) || 1; };
  const haptic = () => { try { navigator.vibrate && navigator.vibrate(8); } catch (e) {} };

  /* ---------- Snackbar above the tab bar ---------- */
  function snack(screen, message, opts = {}) {
    let el = $(":scope > .ax-msnack", screen);
    if (!el) { el = document.createElement("div"); el.className = "ax-msnack"; el.setAttribute("role", "status"); screen.appendChild(el); }
    const hasTabbar = !!$(".ax-tabbar", screen) && !screen.querySelector(".ax-mpage[data-pos=top] .ax-mcta");
    el.style.setProperty("--snack-offset", hasTabbar ? "var(--ax-tabbar-h)" : "0px");
    el.innerHTML = `<div class="ax-snackbar"><i data-lucide="${opts.icon || "check-circle-2"}"></i><span class="ax-snackbar__msg"></span>${opts.action ? `<button class="ax-btn ax-btn--sm" type="button"></button>` : ""}</div>`;
    el.querySelector(".ax-snackbar__msg").textContent = message;
    if (opts.action) { const b = el.querySelector("button"); b.textContent = opts.action; b.onclick = () => { opts.onAction && opts.onAction(); hide(); }; }
    icons(el);
    requestAnimationFrame(() => el.classList.add("is-on"));
    clearTimeout(el._t); el._t = setTimeout(hide, opts.duration || 4000);
    function hide() { el.classList.remove("is-on"); }
  }

  /* ---------- Large title collapse + extended FAB ---------- */
  function initScroll(root) {
    $$(".ax-scroll", root).forEach((sc) => {
      if (!once(sc, "axScrollInit")) return;
      const scope = sc.closest(".ax-mpage, .ax-tabpanel-m, .ax-screen__content, .ax-screen");
      const bar = scope && $(":scope > .ax-mtopbar", scope), big = $(".ax-largetitle", sc), fab = scope && (scope.querySelector(".ax-fab[data-extended]") || screenOf(sc)?.querySelector(":scope .ax-fab[data-extended]"));
      let last = 0;
      on(sc, "scroll", () => {
        const y = sc.scrollTop;
        if (bar && big) bar.classList.toggle("is-collapsed", big.getBoundingClientRect().bottom < bar.getBoundingClientRect().bottom + 2);
        else if (bar) bar.classList.toggle("is-collapsed", y > 2);
        if (fab && Math.abs(y - last) > 4) { fab.classList.toggle("is-compact", y > last && y > 40); last = y; }
      }, { passive: true });
    });
  }

  /* ---------- Tab bar ---------- */
  function initTabbar(root) {
    $$(".ax-tabbar", root).forEach((bar) => {
      if (!once(bar, "axTabbarInit")) return;
      bar.setAttribute("role", "tablist");
      const items = $$(".ax-tabbar__item", bar);
      items.forEach((it) => {
        it.setAttribute("role", "tab");
        on(it, "click", () => {
          const panel = it.dataset.panel && document.getElementById(it.dataset.panel);
          if (it.getAttribute("aria-selected") === "true") { const sc = panel && $(".ax-scroll", panel); if (sc) sc.scrollTo({ top: 0, behavior: reduced() ? "auto" : "smooth" }); return; }   // re-tap: back to top
          items.forEach((x) => { x.setAttribute("aria-selected", x === it); const p = x.dataset.panel && document.getElementById(x.dataset.panel); if (p) p.hidden = x !== it; });
          haptic();
        });
      });
    });
  }

  /* ---------- Bottom sheet with detents ---------- */
  const sheets = new Map();
  function sheetGeom(layer) {
    const sheet = $(".ax-msheet", layer), screen = screenOf(layer);
    const H = sheet.offsetHeight, S = screen.offsetHeight;
    const detents = (layer.dataset.detents || "medium,large").split(",");
    const pos = { large: 0, medium: Math.max(0, H - S * 0.52), closed: H + 24 };
    return { sheet, screen, H, S, detents, pos };
  }
  function setSheet(layer, y, animate) {
    const g = sheetGeom(layer);
    layer.classList.toggle("is-dragging", !animate);
    g.sheet.style.setProperty("--y", y + "px");
    const p = 1 - clamp(y / (g.pos.closed || 1), 0, 1);
    layer.style.setProperty("--scrim", (p * (g.detents.length > 1 ? 1 : 0.9)).toFixed(3));
    const large = y < g.pos.medium * 0.5 && g.detents.includes("large") && g.detents.includes("medium");
    if (large) g.screen.dataset.sheet = "large"; else delete g.screen.dataset.sheet;
  }
  function openSheet(layer, detent) {
    layer = typeof layer === "string" ? document.getElementById(layer) : layer;
    const g = sheetGeom(layer); const d = detent || g.detents[0];
    layer.classList.add("is-open"); layer.setAttribute("aria-hidden", "false");
    setSheet(layer, g.pos.closed, false);
    requestAnimationFrame(() => requestAnimationFrame(() => { setSheet(layer, g.pos[d], true); layer.dataset.detent = d; }));
    if (reduced()) g.sheet.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200 });
    const esc = (e) => { if (e.key === "Escape") closeSheet(layer); };
    document.addEventListener("keydown", esc); sheets.set(layer, esc);
    const f = $("button, input, [tabindex]", g.sheet); setTimeout(() => f && f.focus({ preventScroll: true }), 60);
  }
  function closeSheet(layer) {
    layer = typeof layer === "string" ? document.getElementById(layer) : layer;
    const g = sheetGeom(layer);
    setSheet(layer, g.pos.closed, true); delete layer.dataset.detent;
    document.removeEventListener("keydown", sheets.get(layer) || (() => {})); sheets.delete(layer);
    setTimeout(() => { if (!layer.dataset.detent) { layer.classList.remove("is-open"); layer.setAttribute("aria-hidden", "true"); } }, ms(440));
  }
  function initSheets(root) {
    $$("[data-ax-sheet]", root).forEach((b) => { if (once(b, "axSheetBtn")) on(b, "click", () => openSheet(b.dataset.axSheet, b.dataset.detent)); });
    $$(".ax-msheet-layer", root).forEach((layer) => {
      if (!once(layer, "axSheetInit")) return;
      layer.setAttribute("aria-hidden", "true");
      on(layer, "click", (e) => { if (e.target.classList.contains("ax-msheet-scrim") || e.target.closest("[data-ax-sheet-close]")) closeSheet(layer); });
      let drag = null;
      const start = (e) => {
        if (drag || e.button > 0 || e.target.closest("button:not(.ax-msheet__grab), input, a")) return;
        const g = sheetGeom(layer); const cur = parseFloat(g.sheet.style.getPropertyValue("--y")) || 0;
        drag = { id: e.pointerId, y0: e.clientY, t0: performance.now(), cur, k: scaleOf(layer), last: e.clientY, lt: performance.now(), v: 0, g };
        e.currentTarget.setPointerCapture(e.pointerId);
      };
      const move = (e) => {
        if (!drag || e.pointerId !== drag.id) return;
        let y = drag.cur + (e.clientY - drag.y0) / drag.k;
        if (y < 0) y = -Math.sqrt(-y) * 3;          // rubber band above the top detent
        const t = performance.now(); drag.v = (e.clientY - drag.last) / drag.k / Math.max(1, t - drag.lt); drag.last = e.clientY; drag.lt = t;
        setSheet(layer, y, false);
      };
      const end = (e) => {
        if (!drag || e.pointerId !== drag.id) return;
        const g = drag.g, y = parseFloat(g.sheet.style.getPropertyValue("--y")) || 0, v = drag.v; drag = null;
        const stops = g.detents.map((d) => [d, g.pos[d]]).concat([["closed", g.pos.closed]]);
        let target;
        if (v > 0.5) target = stops.filter(([, p]) => p > y + 1)[0] || ["closed"];           // flick down: next stop below
        else if (v < -0.5) target = stops.filter(([, p]) => p < y - 1).pop() || stops[0];     // flick up: next stop above
        else target = stops.reduce((a, b) => (Math.abs(b[1] - y) < Math.abs(a[1] - y) ? b : a));
        if (target[0] === "closed") closeSheet(layer); else { setSheet(layer, g.pos[target[0]], true); layer.dataset.detent = target[0]; }
      };
      $$(".ax-msheet__grab, .ax-msheet__head", layer).forEach((h) => { on(h, "pointerdown", start); on(h, "pointermove", move); on(h, "pointerup", end); on(h, "pointercancel", end); });
      $$(".ax-msheet__grab", layer).forEach((g) => {
        g.tabIndex = 0; g.setAttribute("role", "button"); g.setAttribute("aria-label", "Resize sheet");
        on(g, "keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); const d = layer.dataset.detent === "large" ? "medium" : "large"; const gg = sheetGeom(layer); if (gg.detents.includes(d)) { setSheet(layer, gg.pos[d], true); layer.dataset.detent = d; } } });
      });
    });
  }

  /* ---------- Action sheet & alert ---------- */
  function initOverlays(root) {
    $$("[data-ax-moverlay]", root).forEach((b) => { if (once(b, "axMovBtn")) on(b, "click", () => openOverlay(document.getElementById(b.dataset.axMoverlay), b)); });
    $$(".ax-overlay-m", root).forEach((ov) => {
      if (!once(ov, "axMovInit")) return;
      on(ov, "click", (e) => {
        const item = e.target.closest(".ax-asheet__item"); const scrim = e.target.classList.contains("ax-scrim-m");
        if (!item && !scrim) return;
        closeOverlay(ov);
        if (item && item.dataset.then) { const next = document.getElementById(item.dataset.then); setTimeout(() => openOverlay(next, ov._opener), ms(260)); return; }
        if (item && item.dataset.snack) snack(screenOf(ov), item.dataset.snack, { icon: item.dataset.icon, action: item.dataset.undo ? "Undo" : null });
      });
      on(ov, "keydown", (e) => { if (e.key === "Escape") closeOverlay(ov); });
    });
  }
  function openOverlay(ov, opener) { ov._opener = opener; ov.classList.add("is-open"); haptic(); setTimeout(() => $(".ax-asheet__item, button", ov)?.focus({ preventScroll: true }), 50); }
  function closeOverlay(ov) { ov.classList.remove("is-open"); ov._opener && ov._opener.focus({ preventScroll: true }); }

  /* ---------- Swipe actions (axis-locked, velocity aware, full swipe) ---------- */
  function initSwipe(root) {
    $$(".ax-swipe", root).forEach((row) => {
      if (!once(row, "axSwipeInit")) return;
      const content = $(".ax-swipe__content", row), actions = $(".ax-swipe__actions", row);
      let d = null, x = 0;
      const set = (v) => { x = v; content.style.setProperty("--x", v + "px"); row.classList.toggle("is-full", v < -row.offsetWidth * 0.6); };
      const close = () => { set(0); row.classList.remove("is-open"); };
      row._close = close;
      on(content, "pointerdown", (e) => { if (e.button > 0 || d) return; d = { id: e.pointerId, x0: e.clientX, y0: e.clientY, base: x, axis: null, k: scaleOf(row), t: performance.now() }; });
      on(content, "pointermove", (e) => {
        if (!d || e.pointerId !== d.id) return;
        const dx = (e.clientX - d.x0) / d.k, dy = (e.clientY - d.y0) / d.k;
        if (!d.axis) { if (Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy)) { d.axis = "x"; content.setPointerCapture(e.pointerId); row.classList.add("is-dragging"); $$(".ax-swipe.is-open", screenOf(row) || document).forEach((r) => r !== row && r._close()); } else if (Math.abs(dy) > 8) { d = null; return; } else return; }
        const W = actions.offsetWidth; let v = d.base + dx;
        if (v > 0) v = v * 0.2;                                   // nothing on the leading edge: resist
        else if (v < -W) v = -W + (v + W) * 0.7;                  // past the actions: allow a full swipe
        set(v);
      });
      const end = (e) => {
        if (!d || e.pointerId !== d.id) return;
        const axis = d.axis, vel = ((e.clientX - d.x0) / d.k) / Math.max(1, performance.now() - d.t); d = null; row.classList.remove("is-dragging");
        if (axis !== "x") return;
        row._suppressClick = true; setTimeout(() => (row._suppressClick = false), 50);
        const W = actions.offsetWidth;
        if (row.classList.contains("is-full")) { haptic(); act(row, actions.firstElementChild.dataset.action); return; }
        if (x < -W / 2 || vel < -0.3) { set(-W); row.classList.add("is-open"); } else close();
      };
      on(content, "pointerup", end); on(content, "pointercancel", end);
      on(content, "click", (e) => { if (row._suppressClick || row.classList.contains("is-open")) { e.preventDefault(); e.stopPropagation(); close(); } }, true);
      on(actions, "click", (e) => { const b = e.target.closest(".ax-swipe__action"); if (b) act(row, b.dataset.action); });
    });
  }
  function act(row, action) {
    const screen = screenOf(row), title = $(".ax-mrow__title", row)?.textContent || "Item";
    if (action === "flag") { row.classList.toggle("is-flagged"); row._close(); snack(screen, row.classList.contains("is-flagged") ? `Flagged “${title}”` : "Flag removed", { icon: "flag" }); return; }
    const h = row.offsetHeight, parent = row.parentNode, next = row.nextSibling;
    row.style.height = h + "px"; row.classList.add("is-removing"); void row.offsetHeight;
    $(".ax-swipe__content", row).style.setProperty("--x", -row.offsetWidth + "px");
    requestAnimationFrame(() => { row.style.height = "0px"; row.style.opacity = "0"; });
    setTimeout(() => row.remove(), ms(280));
    snack(screen, action === "delete" ? `Deleted “${title}”` : `Archived “${title}”`, { icon: action === "delete" ? "trash-2" : "archive", action: "Undo", onAction: () => {
      row.classList.remove("is-removing", "is-full", "is-open"); row.style.height = ""; row.style.opacity = ""; $(".ax-swipe__content", row).style.setProperty("--x", "0px");
      parent.insertBefore(row, next && next.parentNode === parent ? next : null); row.classList.add("is-restored");
      row.animate([{ opacity: 0, transform: "translateY(-6px)" }, { opacity: 1, transform: "none" }], { duration: ms(260), easing: "cubic-bezier(0.25,1,0.5,1)" });
    } });
  }

  /* ---------- Pull to refresh ---------- */
  function initPTR(root) {
    $$(".ax-ptr", root).forEach((ptr) => {
      if (!once(ptr, "axPtrInit")) return;
      const body = $(".ax-ptr__body", ptr); let st = null, busy = false;
      const set = (p) => { ptr.style.setProperty("--pull", p + "px"); ptr.style.setProperty("--pull-o", clamp(p / 40, 0, 1)); ptr.style.setProperty("--arc", (1 - clamp(p / 72, 0, 1) * 0.8).toFixed(3)); };
      const begin = (y) => { if (busy || body.scrollTop > 0) return; st = { y0: y, k: scaleOf(ptr), p: 0, armed: false }; };
      const drag = (y, ev) => {
        if (!st) return false; const dy = (y - st.y0) / st.k;
        if (dy <= 0 && !st.p) { st = null; return false; }
        ev && ev.cancelable && ev.preventDefault();
        ptr.classList.add("is-pulling"); st.p = clamp(dy * 0.5, 0, 110); set(st.p);
        if (st.p >= 64 && !st.armed) { st.armed = true; haptic(); } return true;
      };
      const finish = () => {
        if (!st) return; const p = st.p; st = null; ptr.classList.remove("is-pulling");
        if (p >= 64) { busy = true; ptr.classList.add("is-refreshing"); set(56); setTimeout(() => { ptr.dispatchEvent(new CustomEvent("axiom:refresh", { bubbles: true })); ptr.classList.remove("is-refreshing"); set(0); busy = false; }, ms(1100)); }
        else set(0);
      };
      on(body, "pointerdown", (e) => { if (e.pointerType !== "touch" && e.button === 0) begin(e.clientY); });
      on(body, "pointermove", (e) => { if (e.pointerType === "touch" || !st) return; if (drag(e.clientY, e) && !body.hasPointerCapture(e.pointerId)) body.setPointerCapture(e.pointerId); });
      on(body, "pointerup", (e) => { if (e.pointerType !== "touch") finish(); }); on(body, "pointercancel", (e) => { if (e.pointerType !== "touch") finish(); });
      on(body, "touchstart", (e) => begin(e.touches[0].clientY), { passive: true });
      on(body, "touchmove", (e) => drag(e.touches[0].clientY, e), { passive: false });
      on(body, "touchend", finish);
    });
  }

  /* ---------- Long press (and its visible alternative) ---------- */
  function openContext(row) {
    const screen = screenOf(row), tpl = document.getElementById(row.dataset.menu); if (!screen || !tpl) return;
    const k = scaleOf(row), sr = screen.getBoundingClientRect(), rr = row.getBoundingClientRect();
    const top = (rr.top - sr.top) / k, left = (rr.left - sr.left) / k, w = rr.width / k, h = rr.height / k;
    const ctx = document.createElement("div"); ctx.className = "ax-ctx"; ctx.setAttribute("role", "dialog"); ctx.setAttribute("aria-label", "Actions");
    ctx.innerHTML = `<div class="ax-ctx__scrim"></div><div class="ax-ctx__lift"></div><div class="ax-ctx__menu" role="menu"></div>`;
    const lift = $(".ax-ctx__lift", ctx); lift.appendChild(row.cloneNode(true)); Object.assign(lift.style, { top: top + "px", left: left + "px", width: w + "px" });
    const menu = $(".ax-ctx__menu", ctx); menu.appendChild(tpl.content.cloneNode(true));
    screen.appendChild(ctx); icons(ctx);
    const mh = menu.offsetHeight, below = top + h + 8 + mh < screen.offsetHeight - 40;
    menu.style.top = (below ? top + h + 8 : Math.max(60, top - mh - 8)) + "px"; menu.style.left = clamp(left + 12, 12, screen.offsetWidth - 242) + "px";
    menu.style.setProperty("--origin", below ? "top left" : "bottom left");
    requestAnimationFrame(() => { ctx.classList.add("is-open"); lift.style.transform = "scale(1.03)"; });
    haptic();
    const close = () => { ctx.classList.remove("is-open"); lift.style.transform = ""; setTimeout(() => ctx.remove(), ms(220)); row.focus && row.focus({ preventScroll: true }); };
    on(ctx, "click", (e) => { const it = e.target.closest(".ax-item"); if (e.target.classList.contains("ax-ctx__scrim") || it) { close(); if (it) snack(screen, it.dataset.snack || it.textContent.trim(), { icon: it.dataset.icon }); } });
    on(ctx, "keydown", (e) => { if (e.key === "Escape") close(); });
    setTimeout(() => $(".ax-item", menu)?.focus({ preventScroll: true }), 60);
  }
  function initLongPress(root) {
    $$("[data-ax-longpress]", root).forEach((row) => {
      if (!once(row, "axLpInit")) return;
      let t = null, x0 = 0, y0 = 0;
      const cancel = () => { clearTimeout(t); t = null; row.classList.remove("is-pressing"); };
      on(row, "pointerdown", (e) => { if (e.button > 0) return; x0 = e.clientX; y0 = e.clientY; row.classList.add("is-pressing"); t = setTimeout(() => { t = null; row.classList.remove("is-pressing"); row._lp = true; openContext(row); }, 480); });
      on(row, "pointermove", (e) => { if (t && Math.hypot(e.clientX - x0, e.clientY - y0) > 8) cancel(); });
      on(row, "pointerup", cancel); on(row, "pointercancel", cancel); on(row, "pointerleave", cancel);
      on(row, "click", (e) => { if (row._lp) { e.preventDefault(); e.stopImmediatePropagation(); row._lp = false; } }, true);
      on(row, "contextmenu", (e) => { e.preventDefault(); cancel(); openContext(row); });
      const more = $("[data-ax-ctx-open]", row); if (more) on(more, "click", (e) => { e.stopPropagation(); openContext(row); });
    });
  }

  /* ---------- Search ---------- */
  function initSearch(root) {
    $$("[data-ax-msearch]", root).forEach((scope) => {
      if (!once(scope, "axMsearchInit")) return;
      const input = $(".ax-msearch input", scope), cancel = $(".ax-msearch__cancel", scope);
      const recents = $("[data-ax-search-recents]", scope), results = $("[data-ax-search-results]", scope), empty = $("[data-ax-search-empty]", scope);
      const items = $$("[data-ax-search-item]", scope);
      const esc = (s) => s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
      const render = () => {
        const q = input.value.trim().toLowerCase(); let n = 0;
        items.forEach((it) => { const t = $(".ax-mrow__title", it); const raw = t.dataset.raw || (t.dataset.raw = t.textContent); const i = raw.toLowerCase().indexOf(q); const hit = q && i > -1; it.hidden = !hit; if (hit) { n++; t.innerHTML = `${esc(raw.slice(0, i))}<mark class="ax-hl">${esc(raw.slice(i, i + q.length))}</mark>${esc(raw.slice(i + q.length))}`; } });
        if (recents) recents.hidden = !!q; if (results) results.hidden = !q; if (empty) empty.hidden = !q || n > 0;
      };
      on(input, "focus", () => scope.classList.add("is-searching"));
      on(input, "input", render);
      on(cancel, "click", () => { input.value = ""; render(); input.blur(); scope.classList.remove("is-searching"); });
      $$("[data-ax-recent]", scope).forEach((r) => on(r, "click", () => { input.value = r.dataset.axRecent; input.focus(); render(); }));
      render();
    });
  }

  /* ---------- Wheel picker ---------- */
  function initWheels(root) {
    $$(".ax-wheel", root).forEach((wheel) => {
      if (!once(wheel, "axWheelInit")) return;
      const out = wheel.dataset.output && document.getElementById(wheel.dataset.output);
      const cols = $$(".ax-wheel__col", wheel);
      cols.forEach((col) => {
        if (!col.children.length) {
          const vals = col.dataset.items ? col.dataset.items.split(",") : (() => { const [a, b, step = 1] = col.dataset.range.split("-").map(Number); const v = []; for (let i = a; i <= b; i += step) v.push(col.dataset.pad ? String(i).padStart(2, "0") : String(i)); return v; })();
          col.innerHTML = vals.map((v) => `<div class="ax-wheel__item">${v}</div>`).join("");
        }
        col.tabIndex = 0; col.setAttribute("role", "spinbutton"); col.setAttribute("aria-label", col.dataset.label || "Value");
        const items = Array.from(col.children); let raf = 0;
        const paint = () => { raf = 0; const f = col.scrollTop / 44; items.forEach((it, i) => { const d = Math.abs(i - f); it.style.setProperty("--o", Math.max(0.22, 1 - d * 0.32).toFixed(2)); it.style.setProperty("--s", (1 - Math.min(d, 3) * 0.05).toFixed(3)); }); const idx = clamp(Math.round(f), 0, items.length - 1); col.dataset.value = items[idx].textContent; col.setAttribute("aria-valuetext", items[idx].textContent); if (out) out.textContent = cols.map((c) => c.dataset.value).join(wheel.dataset.join || " ").replace(/ :/g, ":"); };
        on(col, "scroll", () => { if (!raf) raf = requestAnimationFrame(paint); }, { passive: true });
        on(col, "keydown", (e) => { if (e.key === "ArrowDown" || e.key === "ArrowUp") { e.preventDefault(); col.scrollBy({ top: e.key === "ArrowDown" ? 44 : -44, behavior: reduced() ? "auto" : "smooth" }); } });
        on(col, "click", (e) => { const it = e.target.closest(".ax-wheel__item"); if (it) col.scrollTo({ top: items.indexOf(it) * 44, behavior: reduced() ? "auto" : "smooth" }); });
        const start = items.findIndex((it) => it.textContent === col.dataset.value);
        requestAnimationFrame(() => { col.scrollTop = Math.max(0, start) * 44; paint(); });
      });
    });
  }

  /* ---------- Carousel dots ---------- */
  function initCarousels(root) {
    $$(".ax-carousel[data-dots]", root).forEach((c) => {
      if (!once(c, "axCarInit")) return;
      const dots = document.getElementById(c.dataset.dots); const n = c.children.length;
      dots.innerHTML = Array.from({ length: n }, (_, i) => `<button class="ax-dot" type="button" aria-label="Slide ${i + 1}" ${i ? "" : 'aria-current="true"'}></button>`).join("");
      const step = () => c.children[1] ? c.children[1].offsetLeft - c.children[0].offsetLeft : c.offsetWidth;
      on(c, "scroll", () => { const i = clamp(Math.round(c.scrollLeft / step()), 0, n - 1); $$(".ax-dot", dots).forEach((d, j) => d.toggleAttribute("aria-current", j === i) || d.setAttribute("aria-current", j === i)); }, { passive: true });
      $$(".ax-dot", dots).forEach((d, i) => on(d, "click", () => c.scrollTo({ left: i * step(), behavior: reduced() ? "auto" : "smooth" })));
    });
  }

  /* ---------- Keyboard avoidance (simulated keyboard on pointer devices) ---------- */
  function initKeyboard(root) {
    $$("[data-ax-keyboard]", root).forEach((screen) => {
      if (!once(screen, "axKbInit")) return;
      const kb = $(".ax-mkeyboard", screen); const simulate = matchMedia("(pointer: fine)").matches;
      on(screen, "focusin", (e) => {
        if (!e.target.matches("input:not([type=checkbox]):not([type=radio]), textarea")) return;
        if (simulate && kb) { kb.classList.add("is-open"); screen.style.setProperty("--kb", kb.offsetHeight + "px"); screen.style.setProperty("--kb-safe", "var(--ax-safe-bottom)"); }
        setTimeout(() => e.target.scrollIntoView({ block: "center", behavior: reduced() ? "auto" : "smooth" }), ms(120));
      });
      on(screen, "focusout", () => setTimeout(() => { if (!screen.contains(document.activeElement) || !document.activeElement.matches("input, textarea")) { kb && kb.classList.remove("is-open"); screen.style.setProperty("--kb", "0px"); screen.style.setProperty("--kb-safe", "0px"); } }, 0));
    });
  }

  /* ---------- Push navigation + interactive edge swipe back ---------- */
  function initStacks(root) {
    $$(".ax-stack", root).forEach((stack) => {
      if (!once(stack, "axStackInit")) return;
      const hist = [$(".ax-mpage[data-pos=top]", stack)];
      const push = (id, trigger) => {
        const next = document.getElementById(id); if (!next || hist.includes(next)) return;
        stack.dispatchEvent(new CustomEvent("axiom:push", { detail: { page: next, trigger } }));
        const cur = hist[hist.length - 1]; next.dataset.pos = "out"; void next.offsetWidth;
        cur.dataset.pos = "under"; next.dataset.pos = "top"; hist.push(next); cur.setAttribute("aria-hidden", "true"); next.removeAttribute("aria-hidden");
        setTimeout(() => $(".ax-back, h1, h2", next)?.focus?.({ preventScroll: true }), ms(420));
      };
      const pop = () => {
        if (hist.length < 2) return; const cur = hist.pop(), prev = hist[hist.length - 1];
        cur.dataset.pos = "out"; prev.dataset.pos = "top"; prev.removeAttribute("aria-hidden"); cur.setAttribute("aria-hidden", "true");
      };
      stack._push = push; stack._pop = pop;
      on(stack, "click", (e) => { const p = e.target.closest("[data-ax-push]"); if (p) { push(p.dataset.axPush, p); return; } if (e.target.closest("[data-ax-back]")) pop(); });
      let d = null;
      on(stack, "pointerdown", (e) => {
        if (hist.length < 2 || e.button > 0) return; const k = scaleOf(stack), r = stack.getBoundingClientRect();
        if ((e.clientX - r.left) / k > 24) return;
        d = { id: e.pointerId, x0: e.clientX, k, w: stack.offsetWidth, t: performance.now(), top: hist[hist.length - 1], under: hist[hist.length - 2] };
        stack.setPointerCapture(e.pointerId); stack.classList.add("is-dragging");
      });
      on(stack, "pointermove", (e) => {
        if (!d || e.pointerId !== d.id) return; const p = clamp((e.clientX - d.x0) / d.k / d.w, 0, 1);
        d.p = p; d.top.style.setProperty("--px", p * 100 + "%"); d.under.style.setProperty("--px", -30 + p * 30 + "%"); d.under.style.setProperty("--dim", (0.08 * (1 - p)).toFixed(3));
      });
      const end = (e) => {
        if (!d || e.pointerId !== d.id) return; const v = ((e.clientX - d.x0) / d.k) / Math.max(1, performance.now() - d.t); const go = (d.p || 0) > 0.4 || v > 0.35;
        stack.classList.remove("is-dragging"); [d.top, d.under].forEach((pg) => { pg.style.removeProperty("--px"); pg.style.removeProperty("--dim"); });
        if (go) pop(); d = null;
      };
      on(stack, "pointerup", end); on(stack, "pointercancel", end);
    });
  }

  function init(root = document) {
    initScroll(root); initTabbar(root); initSheets(root); initOverlays(root); initSwipe(root); initPTR(root);
    initLongPress(root); initSearch(root); initWheels(root); initCarousels(root); initKeyboard(root); initStacks(root);
  }
  window.AxiomMobile = { init, snack, openSheet, closeSheet };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => init()); else init();
})();
