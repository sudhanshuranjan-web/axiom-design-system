/* ==========================================================================
   AXIOM — behaviour layer v1.0 (no dependencies)
   Auto-initialises everything marked up with the classes / data attributes
   documented in index.html. Call Axiom.init(root) after inserting markup.
   Public API: Axiom.init, Axiom.toast, Axiom.open, Axiom.close, Axiom.place,
               Axiom.count, Axiom.reducedMotion
   ========================================================================== */
(function () {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const on = (el, ev, fn, o) => el && el.addEventListener(ev, fn, o);
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const icons = (root) => { if (window.lucide) window.lucide.createIcons({ attrs: { "aria-hidden": "true" }, root }); };
  const reducedMotion = () => {
    const m = document.documentElement.dataset.motion;
    if (m === "reduced") return true;
    if (m === "full") return false;
    return matchMedia("(prefers-reduced-motion: reduce)").matches;
  };
  const motionScale = () => parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--axiom-motion-scale")) || 1;
  const once = (el, attr) => { if (el.dataset[attr]) return false; el.dataset[attr] = "1"; return true; };

  /* ---------------- Escape / dismiss stack ---------------- */
  const stack = [];
  function pushLayer(layer) { stack.push(layer); }
  function popLayer(layer) { const i = stack.indexOf(layer); if (i > -1) stack.splice(i, 1); }
  on(document, "keydown", (e) => {
    if (e.key === "Escape" && stack.length) { e.preventDefault(); stack[stack.length - 1].close(); }
  });

  /* ---------------- Positioning ---------------- */
  function place(float, anchor, placement = "bottom-start", offset = 8) {
    const r = anchor.getBoundingClientRect();
    const fw = float.offsetWidth, fh = float.offsetHeight;
    const vw = innerWidth, vh = innerHeight, m = 8;
    let [side, align = "start"] = placement.split("-");
    if (side === "bottom" && r.bottom + offset + fh > vh - m && r.top - offset - fh > m) side = "top";
    if (side === "top" && r.top - offset - fh < m && r.bottom + offset + fh < vh - m) side = "bottom";
    if (side === "right" && r.right + offset + fw > vw - m) side = "left";
    let x, y, ox, oy;
    if (side === "bottom" || side === "top") {
      y = side === "bottom" ? r.bottom + offset : r.top - offset - fh;
      x = align === "end" ? r.right - fw : align === "center" ? r.left + r.width / 2 - fw / 2 : r.left;
      x = clamp(x, m, vw - fw - m);
      ox = clamp(r.left + r.width / 2 - x, 0, fw) + "px";
      oy = side === "bottom" ? "top" : "bottom";
    } else {
      x = side === "right" ? r.right + offset : r.left - offset - fw;
      y = align === "end" ? r.bottom - fh : align === "center" ? r.top + r.height / 2 - fh / 2 : r.top;
      y = clamp(y, m, vh - fh - m);
      ox = side === "right" ? "left" : "right";
      oy = clamp(r.top + r.height / 2 - y, 0, fh) + "px";
    }
    float.style.left = Math.round(x) + "px";
    float.style.top = Math.round(y) + "px";
    float.style.setProperty("--origin", side === "bottom" || side === "top" ? `${ox} ${oy}` : `${ox} ${oy}`);
    float.dataset.side = side;
  }

  /* ---------------- Floating surfaces: menu / popover / dropdown ---------------- */
  const openFloats = new Map();
  function openFloat(float, trigger) {
    if (openFloats.has(float)) return;
    closeAllFloats(float);
    if (float.parentElement !== document.body && !float.dataset.inplace) document.body.appendChild(float);
    place(float, trigger, float.dataset.placement || "bottom-start", +(float.dataset.offset || 8));
    float.dataset.state = "open";
    trigger.setAttribute("aria-expanded", "true");
    const layer = { close: () => closeFloat(float, true) };
    const reposition = () => place(float, trigger, float.dataset.placement || "bottom-start", +(float.dataset.offset || 8));
    const outside = (e) => { if (!float.contains(e.target) && !trigger.contains(e.target)) closeFloat(float); };
    setTimeout(() => on(document, "pointerdown", outside), 0);
    on(window, "resize", reposition); on(window, "scroll", reposition, true);
    openFloats.set(float, { trigger, layer, outside, reposition });
    pushLayer(layer);
    const first = float.querySelector("[role=menuitem], [role=menuitemradio], .ax-item, input, [role=option]");
    if (float.matches(".ax-menu") && first && trigger.dataset.kb) first.focus();
    float.dispatchEvent(new CustomEvent("axiom:open"));
  }
  function closeFloat(float, returnFocus) {
    const s = openFloats.get(float); if (!s) return;
    float.dataset.state = "closed";
    s.trigger.setAttribute("aria-expanded", "false");
    document.removeEventListener("pointerdown", s.outside);
    removeEventListener("resize", s.reposition); removeEventListener("scroll", s.reposition, true);
    popLayer(s.layer); openFloats.delete(float);
    if (returnFocus) s.trigger.focus();
    float.dispatchEvent(new CustomEvent("axiom:close"));
  }
  function closeAllFloats(except) { for (const f of [...openFloats.keys()]) if (f !== except && !f.contains(except)) closeFloat(f); }

  function initTriggers(root) {
    $$("[data-ax-trigger]", root).forEach((t) => {
      if (!once(t, "axTriggerInit")) return;
      const float = document.getElementById(t.dataset.axTrigger); if (!float) return;
      t.setAttribute("aria-haspopup", float.matches(".ax-menu") ? "menu" : "dialog");
      t.setAttribute("aria-expanded", "false");
      on(t, "click", () => (openFloats.has(float) ? closeFloat(float) : openFloat(float, t)));
      on(t, "keydown", (e) => { if (e.key === "ArrowDown" && float.matches(".ax-menu")) { e.preventDefault(); t.dataset.kb = "1"; openFloat(float, t); delete t.dataset.kb; } });
      if (float.matches(".ax-menu")) {
        on(float, "click", (e) => { const it = e.target.closest(".ax-item"); if (it && !it.dataset.keepOpen && !it.disabled) closeFloat(float, true); });
        on(float, "keydown", (e) => {
          const items = $$(".ax-item:not(:disabled)", float); const i = items.indexOf(document.activeElement);
          if (e.key === "ArrowDown") { e.preventDefault(); items[(i + 1) % items.length].focus(); }
          if (e.key === "ArrowUp") { e.preventDefault(); items[(i - 1 + items.length) % items.length].focus(); }
          if (e.key === "Tab") closeFloat(float);
        });
      }
    });
    $$("[data-ax-dismiss]", root).forEach((b) => { if (once(b, "axDismissInit")) on(b, "click", () => { const f = b.closest(".ax-float"); if (f) closeFloat(f, true); }); });
  }

  /* ---------------- Tooltip (delay first, instant after) ---------------- */
  let tip, tipTimer, tipHideTimer, lastHide = 0;
  function tooltipEl() {
    if (!tip) { tip = document.createElement("div"); tip.className = "ax-tooltip"; tip.setAttribute("role", "tooltip"); tip.id = "ax-tooltip"; document.body.appendChild(tip); }
    return tip;
  }
  function showTip(el, immediate) {
    const t = tooltipEl();
    clearTimeout(tipTimer); clearTimeout(tipHideTimer);
    const warm = immediate || Date.now() - lastHide < 400 || t.dataset.state === "open";
    const go = () => {
      t.textContent = el.dataset.tooltip;
      if (el.dataset.tooltipKbd) { const k = document.createElement("span"); k.className = "ax-kbd"; k.textContent = el.dataset.tooltipKbd; t.appendChild(k); }
      if (warm) t.setAttribute("data-instant", ""); else t.removeAttribute("data-instant");
      const side = el.dataset.tooltipSide || "top";
      place(t, el, side + "-center", 6);
      requestAnimationFrame(() => { t.dataset.state = "open"; });
      el.setAttribute("aria-describedby", "ax-tooltip");
    };
    if (warm) go(); else tipTimer = setTimeout(go, 500);
  }
  function hideTip(el) {
    clearTimeout(tipTimer);
    if (!tip || tip.dataset.state !== "open") return;
    tipHideTimer = setTimeout(() => { tip.dataset.state = "closed"; lastHide = Date.now(); }, 60);
    el && el.removeAttribute("aria-describedby");
  }
  function initTooltips(root) {
    $$("[data-tooltip]", root).forEach((el) => {
      if (!once(el, "axTipInit")) return;
      if (!el.getAttribute("aria-label") && !el.textContent.trim()) el.setAttribute("aria-label", el.dataset.tooltip);
      on(el, "pointerenter", (e) => { if (e.pointerType === "mouse") showTip(el); });
      on(el, "pointerleave", () => hideTip(el));
      on(el, "focus", () => { if (el.matches(":focus-visible")) showTip(el, true); });
      on(el, "blur", () => hideTip(el));
      on(el, "pointerdown", () => hideTip(el));
    });
  }
  on(window, "scroll", () => hideTip(), true);

  /* ---------------- Overlays: Window / Drawer / Sheet ---------------- */
  const overlays = new Map();
  function focusables(el) { return $$('a[href], button:not(:disabled), input:not(:disabled), select, textarea, [tabindex]:not([tabindex="-1"])', el).filter((x) => x.offsetParent !== null); }
  function open(id, opener) {
    const ov = typeof id === "string" ? document.getElementById(id) : id;
    if (!ov || overlays.has(ov)) return;
    if (ov.parentElement !== document.body) document.body.appendChild(ov);
    const prev = opener || document.activeElement;
    const layer = { close: () => close(ov) };
    const trap = (e) => {
      if (e.key !== "Tab") return;
      const f = focusables(ov); if (!f.length) return;
      const a = f[0], z = f[f.length - 1];
      if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); }
      else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
    };
    overlays.set(ov, { prev, layer, trap });
    pushLayer(layer);
    ov.dataset.state = "open";
    document.documentElement.style.overflow = "hidden";
    on(ov, "keydown", trap);
    const panel = ov.querySelector(".ax-window, .ax-drawer, .ax-sheet, .ax-palette");
    const target = ov.querySelector("[autofocus]") || focusables(panel || ov)[0];
    setTimeout(() => target && target.focus({ preventScroll: true }), ov.matches(".ax-overlay--palette") ? 0 : 30);
    ov.dispatchEvent(new CustomEvent("axiom:open"));
  }
  function close(id) {
    const ov = typeof id === "string" ? document.getElementById(id) : id;
    const s = overlays.get(ov); if (!s) return;
    ov.dataset.state = "closed";
    ov.removeEventListener("keydown", s.trap);
    popLayer(s.layer); overlays.delete(ov);
    if (!overlays.size) document.documentElement.style.overflow = "";
    const sheet = ov.querySelector(".ax-sheet"); if (sheet) sheet.style.removeProperty("--drag");
    if (s.prev && s.prev.focus) s.prev.focus({ preventScroll: true });
    ov.dispatchEvent(new CustomEvent("axiom:close"));
  }
  function initOverlays(root) {
    $$("[data-ax-open]", root).forEach((b) => { if (once(b, "axOpenInit")) on(b, "click", () => open(b.dataset.axOpen, b)); });
    $$(".ax-overlay", root).forEach((ov) => {
      if (!once(ov, "axOvInit")) return;
      ov.setAttribute("aria-hidden", "false");
      on(ov, "click", (e) => { if (e.target.closest("[data-ax-close]") || e.target.classList.contains("ax-scrim")) close(ov); });
      const sheet = $(".ax-sheet", ov); if (sheet) initSheetDrag(ov, sheet);
    });
  }
  /* Bottom sheet: velocity-based dismissal, damping when pulled up */
  function initSheetDrag(ov, sheet) {
    let startY = 0, startT = 0, dy = 0, dragging = false, pid = null;
    on(sheet, "pointerdown", (e) => {
      if (dragging || e.target.closest("button, input, a, textarea")) return;
      dragging = true; pid = e.pointerId; startY = e.clientY; startT = performance.now(); dy = 0;
      sheet.setPointerCapture(pid); sheet.classList.add("is-dragging");
    });
    on(sheet, "pointermove", (e) => {
      if (!dragging || e.pointerId !== pid) return;
      const raw = e.clientY - startY;
      dy = raw < 0 ? -Math.sqrt(-raw) * 2 : raw; // friction upward instead of a wall
      sheet.style.setProperty("--drag", dy + "px");
    });
    const end = (e) => {
      if (!dragging || e.pointerId !== pid) return;
      dragging = false; sheet.classList.remove("is-dragging");
      const v = Math.abs(dy) / (performance.now() - startT);
      if (dy > sheet.offsetHeight * 0.35 || (dy > 10 && v > 0.11)) close(ov);
      else sheet.style.setProperty("--drag", "0px");
    };
    on(sheet, "pointerup", end); on(sheet, "pointercancel", end);
  }

  /* ---------------- Toasts (Snackbar) ---------------- */
  let toaster, toasts = [], hovering = false;
  const ICON = { default: "check-circle-2", negative: "alert-circle", info: "info" };
  function layoutToasts() {
    const gap = 8; let y = 0; const visible = toasts.filter((t) => t.state !== "leaving").slice(-3).reverse();
    toasts.forEach((t) => { if (!visible.includes(t) && t.state !== "leaving") t.el.style.setProperty("--o", 0); });
    visible.forEach((t, i) => {
      const h = t.el.offsetHeight;
      if (hovering) { t.el.style.setProperty("--y", -y + "px"); t.el.style.setProperty("--s", 1); y += h + gap; }
      else { t.el.style.setProperty("--y", -i * 10 + "px"); t.el.style.setProperty("--s", 1 - i * 0.05); }
      t.el.style.setProperty("--o", 1); t.el.style.zIndex = 10 - i;
    });
    if (toaster) toaster.style.setProperty("--stack-h", (hovering ? y : (visible[0]?.el.offsetHeight || 0) + 20) + "px");
  }
  function removeToast(t, how = "leaving") {
    if (t.state === "leaving") return; t.state = "leaving"; clearTimeout(t.timer);
    t.el.dataset.state = how;
    setTimeout(() => { t.el.remove(); toasts = toasts.filter((x) => x !== t); layoutToasts(); }, 400 * motionScale());
    layoutToasts();
  }
  function startTimer(t) { clearTimeout(t.timer); t.started = Date.now(); t.timer = setTimeout(() => removeToast(t), t.remaining); }
  function pauseTimer(t) { clearTimeout(t.timer); t.remaining -= Date.now() - t.started; }
  function toast(opts) {
    if (typeof opts === "string") opts = { message: opts };
    if (!toaster) {
      toaster = document.createElement("section"); toaster.className = "ax-toaster"; toaster.setAttribute("aria-live", "polite"); toaster.setAttribute("aria-label", "Notifications");
      document.body.appendChild(toaster);
      on(toaster, "pointerenter", () => { hovering = true; toasts.forEach(pauseTimer); layoutToasts(); });
      on(toaster, "pointerleave", () => { hovering = false; toasts.forEach((t) => t.state !== "leaving" && startTimer(t)); layoutToasts(); });
      on(document, "visibilitychange", () => toasts.forEach((t) => (document.hidden ? pauseTimer(t) : startTimer(t))));
    }
    const el = document.createElement("div");
    el.className = "ax-snackbar" + (opts.tone === "negative" ? " ax-snackbar--negative" : "");
    el.setAttribute("role", opts.tone === "negative" ? "alert" : "status");
    el.dataset.state = "entering";
    el.innerHTML = `<i data-lucide="${opts.icon || ICON[opts.tone || "default"]}"></i><span class="ax-snackbar__msg"></span>${opts.action ? `<button class="ax-btn ax-btn--sm" type="button"></button>` : ""}<button class="ax-btn ax-btn--sm ax-btn--icon" type="button" aria-label="Dismiss"><i data-lucide="x"></i></button>`;
    el.querySelector(".ax-snackbar__msg").textContent = opts.message;
    toaster.appendChild(el); icons(el);
    const t = { el, state: "visible", remaining: opts.duration || 5000 };
    if (opts.action) { const b = el.querySelector(".ax-btn:not(.ax-btn--icon)"); b.textContent = opts.action.label; on(b, "click", () => { opts.action.onClick && opts.action.onClick(); removeToast(t); }); }
    on(el.querySelector(".ax-btn--icon"), "click", () => removeToast(t));
    // swipe sideways to dismiss (momentum counts, not just distance)
    let sx = 0, st = 0, dx = 0, drag = false;
    on(el, "pointerdown", (e) => { if (e.target.closest("button")) return; drag = true; sx = e.clientX; st = performance.now(); el.setPointerCapture(e.pointerId); el.style.transition = "none"; });
    on(el, "pointermove", (e) => { if (!drag) return; dx = e.clientX - sx; el.style.transform = `translateX(${dx}px)`; el.style.opacity = String(1 - Math.min(Math.abs(dx) / 240, 0.6)); });
    on(el, "pointerup", () => { if (!drag) return; drag = false; el.style.transition = ""; el.style.transform = ""; el.style.opacity = ""; const v = Math.abs(dx) / (performance.now() - st); if (Math.abs(dx) > 100 || v > 0.11 && Math.abs(dx) > 8) { el.style.setProperty("--sx", (dx > 0 ? 110 : -110) + "%"); removeToast(t, "swiped"); } dx = 0; });
    toasts.push(t);
    requestAnimationFrame(() => requestAnimationFrame(() => { el.dataset.state = "visible"; layoutToasts(); }));
    if (!hovering) startTimer(t);
    return { dismiss: () => removeToast(t) };
  }

  /* Measured parts (tab indicators, segmented thumbs) re-measure on refresh(): fonts loading, brand switches */
  const refreshers = new Set();
  function refresh() { refreshers.forEach((f) => f()); }
  if (document.fonts) document.fonts.ready.then(refresh);

  /* ---------------- Tabs ---------------- */
  function moveIndicator(list, tab, instant) {
    const ind = list.querySelector(".ax-tabs__indicator"); if (!ind || !tab) return;
    if (instant) list.classList.add("is-instant");
    ind.style.setProperty("--x", tab.offsetLeft + "px"); ind.style.setProperty("--w", tab.offsetWidth);
    if (instant) requestAnimationFrame(() => list.classList.remove("is-instant"));
  }
  function initTabs(root) {
    $$(".ax-tabs", root).forEach((list) => {
      if (!once(list, "axTabsInit")) return;
      list.setAttribute("role", "tablist");
      if (!list.querySelector(".ax-tabs__indicator")) { const i = document.createElement("span"); i.className = "ax-tabs__indicator"; list.appendChild(i); }
      const tabs = $$(".ax-tab", list);
      const select = (tab, focus) => {
        tabs.forEach((t) => { const sel = t === tab; t.setAttribute("aria-selected", sel); t.tabIndex = sel ? 0 : -1; const p = t.getAttribute("aria-controls") && document.getElementById(t.getAttribute("aria-controls")); if (p) p.hidden = !sel; });
        moveIndicator(list, tab); if (focus) tab.focus();
        list.dispatchEvent(new CustomEvent("axiom:change", { detail: { tab } }));
      };
      tabs.forEach((t) => { t.setAttribute("role", "tab"); on(t, "click", () => !t.disabled && select(t)); });
      on(list, "keydown", (e) => {
        const en = tabs.filter((t) => !t.disabled); const i = en.indexOf(document.activeElement);
        if (e.key === "ArrowRight") { e.preventDefault(); select(en[(i + 1) % en.length], true); }
        if (e.key === "ArrowLeft") { e.preventDefault(); select(en[(i - 1 + en.length) % en.length], true); }
      });
      const cur = tabs.find((t) => t.getAttribute("aria-selected") === "true") || tabs[0];
      tabs.forEach((t) => (t.tabIndex = t === cur ? 0 : -1));
      requestAnimationFrame(() => moveIndicator(list, cur, true));
      const re = () => moveIndicator(list, tabs.find((t) => t.getAttribute("aria-selected") === "true"), true);
      new ResizeObserver(re).observe(list); refreshers.add(re);
    });
  }

  /* ---------------- Segmented control ---------------- */
  function initSegmented(root) {
    $$(".ax-segmented", root).forEach((seg) => {
      if (!once(seg, "axSegInit")) return;
      seg.setAttribute("role", "radiogroup");
      let thumb = seg.querySelector(".ax-segmented__thumb");
      if (!thumb) { thumb = document.createElement("span"); thumb.className = "ax-segmented__thumb"; seg.prepend(thumb); }
      const btns = $$("button", seg);
      const sync = (instant) => {
        const b = btns.find((x) => x.getAttribute("aria-checked") === "true") || btns[0];
        if (instant) seg.classList.add("is-instant");
        seg.style.setProperty("--x", b.offsetLeft + "px"); seg.style.setProperty("--w", b.offsetWidth + "px");
        if (instant) requestAnimationFrame(() => seg.classList.remove("is-instant"));
      };
      btns.forEach((b) => {
        b.setAttribute("role", "radio"); if (!b.hasAttribute("aria-checked")) b.setAttribute("aria-checked", "false");
        on(b, "click", () => { btns.forEach((x) => { x.setAttribute("aria-checked", x === b); x.tabIndex = x === b ? 0 : -1; }); sync(); seg.dispatchEvent(new CustomEvent("axiom:change", { detail: { value: b.dataset.value || b.textContent.trim(), button: b } })); });
      });
      on(seg, "keydown", (e) => {
        const i = btns.findIndex((x) => x.getAttribute("aria-checked") === "true");
        const n = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0; if (!n) return;
        e.preventDefault(); const nb = btns[(i + n + btns.length) % btns.length]; nb.click(); nb.focus();
      });
      btns.forEach((x) => (x.tabIndex = x.getAttribute("aria-checked") === "true" ? 0 : -1));
      requestAnimationFrame(() => sync(true));
      new ResizeObserver(() => sync(true)).observe(seg); refreshers.add(() => sync(true));
    });
  }

  /* ---------------- Small toggles ---------------- */
  function initToggles(root) {
    $$(".ax-chip[aria-pressed], .ax-tool[aria-pressed], .ax-slot[aria-pressed]:not([data-group]), .ax-btn-group [aria-pressed]", root).forEach((b) => {
      if (!once(b, "axToggleInit")) return;
      on(b, "click", () => {
        if (b.closest("[data-single]")) { $$("[aria-pressed]", b.closest("[data-single]")).forEach((x) => x.setAttribute("aria-pressed", x === b)); return; }
        b.setAttribute("aria-pressed", b.getAttribute("aria-pressed") !== "true");
      });
    });
    $$(".ax-acc__head", root).forEach((h) => {
      if (!once(h, "axAccInit")) return;
      on(h, "click", () => {
        const open = h.getAttribute("aria-expanded") === "true";
        const group = h.closest("[data-single]");
        if (group && !open) $$(".ax-acc__head[aria-expanded=true]", group).forEach((o) => o.setAttribute("aria-expanded", "false"));
        h.setAttribute("aria-expanded", !open);
      });
    });
    $$(".ax-tree", root).forEach((tree) => {
      if (!once(tree, "axTreeInit")) return;
      on(tree, "click", (e) => {
        const chev = e.target.closest(".ax-tree__chev"); const item = e.target.closest(".ax-tree__item"); if (!item) return;
        const li = item.parentElement;
        if (chev) { li.setAttribute("aria-expanded", li.getAttribute("aria-expanded") !== "true"); return; }
        $$(".ax-tree__item[aria-selected=true]", tree).forEach((x) => x.setAttribute("aria-selected", "false"));
        item.setAttribute("aria-selected", "true");
      });
    });
    $$(".ax-alert__close", root).forEach((b) => { if (once(b, "axAlertInit")) on(b, "click", () => { const d = b.closest(".ax-dismissable"); if (d) d.classList.add("is-gone"); else b.closest(".ax-alert").remove(); }); });
    $$("[data-ax-collapse]", root).forEach((b) => { if (once(b, "axColInit")) on(b, "click", () => { const s = document.getElementById(b.dataset.axCollapse); s.classList.toggle("is-collapsed"); b.setAttribute("aria-expanded", !s.classList.contains("is-collapsed")); }); });
    $$("[data-ax-nav]", root).forEach((nav) => { if (once(nav, "axNavInit")) on(nav, "click", (e) => { const it = e.target.closest("[data-nav-item]"); if (!it) return; e.preventDefault(); $$("[data-nav-item]", nav).forEach((x) => x.removeAttribute("aria-current")); it.setAttribute("aria-current", "page"); }); });
    $$(".ax-notif", root).forEach((n) => { if (once(n, "axNotifInit")) on(n, "click", () => { n.classList.remove("is-unread"); const p = n.closest("[data-notif-panel]"); if (p) { const c = document.querySelector(p.dataset.notifPanel); const left = $$(".ax-notif.is-unread", p).length; if (c) { c.textContent = left; c.hidden = !left; } } }); });
  }

  /* ---------------- Fields: clear, count, number, code, phone ---------------- */
  function initFields(root) {
    // A click anywhere on a field (icon, padding, prefix) focuses its input, caret at the end
    $$(".ax-control, .ax-composer", root).forEach((c) => {
      if (c.matches(".ax-select") || !once(c, "axClickInit")) return;
      on(c, "pointerdown", (e) => {
        if (e.button > 0 || e.target.closest("input, textarea, button, a, select, [contenteditable]")) return;
        const field = c.querySelector("input:not([type=hidden]):not(:disabled), textarea:not(:disabled)"); if (!field) return;
        e.preventDefault(); field.focus();
        try { const n = field.value.length; field.setSelectionRange(n, n); } catch (er) { /* number and email inputs have no selection API */ }
      });
    });
    $$(".ax-rte", root).forEach((r) => {
      if (!once(r, "cRteClick")) return;
      on(r, "pointerdown", (e) => { if (e.target === r) { e.preventDefault(); r.querySelector(".ax-rte__body").focus(); } });
    });
    $$(".ax-control", root).forEach((c) => {
      if (!once(c, "axCtlInit")) return;
      const input = c.querySelector(".ax-input"); const clear = c.querySelector(".ax-clear");
      if (input && clear) {
        const sync = () => { clear.dataset.hidden = !input.value; c.classList.toggle("is-filled", !!input.value); };
        on(input, "input", sync); on(clear, "click", () => { input.value = ""; sync(); input.focus(); input.dispatchEvent(new Event("input", { bubbles: true })); }); sync();
      }
    });
    $$("[maxlength]", root).forEach((inp) => {
      if (!once(inp, "axCountInit")) return;
      const count = inp.closest(".ax-field")?.querySelector(".ax-count"); if (!count) return;
      const sync = () => { count.textContent = `${inp.value.length}/${inp.maxLength}`; count.classList.toggle("is-over", inp.value.length >= inp.maxLength); };
      on(inp, "input", sync); sync();
    });
    $$("[data-ax-number]", root).forEach((w) => {
      if (!once(w, "axNumInit")) return;
      const inp = w.querySelector("input"); const [dec, inc] = $$(".ax-btn", w); const min = +(inp.min || -Infinity), max = +(inp.max || Infinity);
      const set = (v) => { inp.value = clamp(v, min, max); dec.disabled = +inp.value <= min; inc.disabled = +inp.value >= max; };
      on(dec, "click", () => set(+inp.value - 1)); on(inc, "click", () => set(+inp.value + 1)); on(inp, "change", () => set(+inp.value || 0)); set(+inp.value);
    });
    $$(".ax-code", root).forEach((g) => {
      if (!once(g, "axCodeInit")) return;
      const cells = $$(".ax-code__cell", g);
      const done = () => {
        const v = cells.map((c) => c.value).join("");
        g.classList.remove("is-error", "is-success");
        if (v.length === cells.length) {
          const ok = !g.dataset.expect || v === g.dataset.expect;
          const help = g.parentElement.querySelector(".ax-help");
          g.classList.add(ok ? "is-success" : "is-error");
          if (help) { help.className = "ax-help " + (ok ? "ax-help--success" : "ax-help--error"); help.dataset.anim = ""; help.textContent = ok ? "Code accepted" : "That code didn't match. Check the latest SMS and try again."; void help.offsetWidth; }
          if (!ok) { g.querySelectorAll(".ax-code__cell").forEach((c) => { c.classList.remove("is-nudge"); }); g.animate([{ transform: "translateX(0)" }, { transform: "translateX(-4px)" }, { transform: "translateX(4px)" }, { transform: "translateX(0)" }], { duration: 280 * motionScale(), easing: "cubic-bezier(0.2,0,0,1)" }); }
        }
      };
      cells.forEach((c, i) => {
        c.setAttribute("inputmode", "numeric"); c.setAttribute("maxlength", "1"); c.setAttribute("aria-label", `Digit ${i + 1}`);
        on(c, "input", () => { c.value = c.value.replace(/\D/g, "").slice(-1); c.classList.toggle("is-filled", !!c.value); if (c.value && cells[i + 1]) cells[i + 1].focus(); done(); });
        on(c, "keydown", (e) => { if (e.key === "Backspace" && !c.value && cells[i - 1]) { cells[i - 1].focus(); cells[i - 1].value = ""; cells[i - 1].classList.remove("is-filled"); } if (e.key === "ArrowLeft" && cells[i - 1]) cells[i - 1].focus(); if (e.key === "ArrowRight" && cells[i + 1]) cells[i + 1].focus(); });
        on(c, "paste", (e) => { e.preventDefault(); const d = (e.clipboardData.getData("text") || "").replace(/\D/g, "").slice(0, cells.length); d.split("").forEach((ch, j) => { cells[j].value = ch; cells[j].classList.add("is-filled"); }); (cells[d.length] || cells[cells.length - 1]).focus(); done(); });
        on(c, "focus", () => c.select());
      });
    });
    $$("[data-ax-validate]", root).forEach((form) => {
      if (!once(form, "axValInit")) return;
      on(form, "submit", (e) => {
        e.preventDefault(); let ok = true;
        $$("[data-rule]", form).forEach((inp) => {
          const ctl = inp.closest(".ax-control"); const help = inp.closest(".ax-field").querySelector(".ax-help");
          const bad = inp.dataset.rule === "email" ? !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(inp.value) : !inp.value.trim();
          ctl.classList.toggle("is-error", bad);
          if (help) { help.className = "ax-help" + (bad ? " ax-help--error" : ""); help.innerHTML = bad ? `<i data-lucide="alert-circle"></i>${inp.dataset.msg}` : help.dataset.default || ""; if (bad) help.dataset.anim = ""; icons(help); }
          if (bad) { ok = false; ctl.classList.remove("is-nudge"); void ctl.offsetWidth; ctl.classList.add("is-nudge"); }
        });
        const btn = form.querySelector("[type=submit]");
        if (ok && btn) morph(btn, "Saving…", "Saved", () => toast({ message: "Profile saved" }));
        else form.querySelector(".is-error input")?.focus();
      });
      $$("[data-rule]", form).forEach((inp) => on(inp, "input", () => { const ctl = inp.closest(".ax-control"); if (ctl.classList.contains("is-error")) { ctl.classList.remove("is-error"); const help = inp.closest(".ax-field").querySelector(".ax-help"); if (help) { help.className = "ax-help"; help.textContent = help.dataset.default || ""; } } }));
    });
  }

  /* ---------------- Button morph / hold ---------------- */
  function setLabel(btn, html) {
    const l = btn.querySelector(".ax-btn__label"); if (!l) return;
    const w0 = btn.offsetWidth; btn.classList.add("is-morphing");
    setTimeout(() => {
      btn.style.width = w0 + "px"; l.innerHTML = html; icons(l);
      btn.style.width = ""; const w1 = btn.offsetWidth; btn.style.width = w0 + "px";
      btn.animate([{ width: w0 + "px" }, { width: w1 + "px" }], { duration: 220 * motionScale(), easing: "cubic-bezier(0.2,0,0,1)" }).onfinish = () => (btn.style.width = "");
      btn.style.width = "";
      btn.classList.remove("is-morphing");
    }, 140 * motionScale());
  }
  function morph(btn, busy, doneText, cb) {
    if (btn.classList.contains("is-busy")) return;
    const original = btn.querySelector(".ax-btn__label")?.innerHTML;
    btn.classList.add("is-busy"); btn.setAttribute("aria-busy", "true");
    setLabel(btn, `<span class="ax-spinner ax-spinner--sm" style="border-color:color-mix(in srgb,currentColor 25%,transparent);border-top-color:currentColor"></span>${busy}`);
    setTimeout(() => { setLabel(btn, `<i data-lucide="check"></i>${doneText}`); cb && cb(); }, 1200 * motionScale());
    setTimeout(() => { setLabel(btn, original); btn.classList.remove("is-busy"); btn.removeAttribute("aria-busy"); }, 2800 * motionScale());
  }
  function initButtons(root) {
    $$("[data-ax-morph]", root).forEach((b) => { if (once(b, "axMorphInit")) on(b, "click", () => { const [busy, done] = b.dataset.axMorph.split("|"); morph(b, busy, done, () => b.dataset.toast && toast({ message: b.dataset.toast })); }); });
    $$(".ax-btn--hold", root).forEach((b) => {
      if (!once(b, "axHoldInit")) return;
      let t; const ms = () => 1600 * motionScale();
      const start = (e) => { if (e.button > 0) return; b.classList.add("is-holding"); t = setTimeout(() => { b.classList.remove("is-holding"); toast({ message: b.dataset.holdDone || "Deleted", tone: "negative", icon: "trash-2", action: { label: "Undo" } }); }, ms()); };
      const stop = () => { clearTimeout(t); b.classList.remove("is-holding"); };
      on(b, "pointerdown", start); on(b, "pointerup", stop); on(b, "pointerleave", stop); on(b, "pointercancel", stop);
      on(b, "keydown", (e) => { if ((e.key === " " || e.key === "Enter") && !e.repeat) start(e); }); on(b, "keyup", stop);
    });
    $$("[data-ax-toast]", root).forEach((b) => { if (once(b, "axToastInit")) on(b, "click", () => toast({ message: b.dataset.axToast, tone: b.dataset.tone, action: b.dataset.action ? { label: b.dataset.action } : null })); });
  }

  /* ---------------- Select / Multi / Autocomplete ---------------- */
  function listNav(list, input, onPick) {
    on(input, "keydown", (e) => {
      const opts = $$(".ax-option:not([hidden])", list); if (!opts.length) return;
      let i = opts.findIndex((o) => o.classList.contains("is-active"));
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault(); if (list.dataset.state !== "open") { input.click(); return; }
        i = e.key === "ArrowDown" ? (i + 1) % opts.length : (i - 1 + opts.length) % opts.length;
        opts.forEach((o) => o.classList.toggle("is-active", o === opts[i])); opts[i].scrollIntoView({ block: "nearest" });
        input.setAttribute("aria-activedescendant", opts[i].id);
      }
      if (e.key === "Enter" && i > -1 && list.dataset.state === "open") { e.preventDefault(); onPick(opts[i]); }
    });
    on(list, "pointermove", (e) => { const o = e.target.closest(".ax-option"); if (o) $$(".ax-option", list).forEach((x) => x.classList.toggle("is-active", x === o)); });
  }
  let uid = 0;
  function initSelects(root) {
    $$("[data-ax-select]", root).forEach((btn) => {
      if (!once(btn, "axSelInit")) return;
      const list = document.getElementById(btn.dataset.axSelect); const val = btn.querySelector(".ax-select__value");
      list.setAttribute("role", "listbox"); btn.setAttribute("aria-haspopup", "listbox"); btn.setAttribute("aria-expanded", "false");
      list.style.width = btn.offsetWidth ? btn.offsetWidth + "px" : "";
      $$(".ax-option", list).forEach((o) => { o.id = o.id || "ax-opt-" + ++uid; o.setAttribute("role", "option"); if (!o.querySelector("svg, i")) o.insertAdjacentHTML("beforeend", '<i data-lucide="check"></i>'); });
      icons(list);
      const pick = (o) => { $$(".ax-option", list).forEach((x) => x.setAttribute("aria-selected", x === o)); val.textContent = o.dataset.label || o.textContent.trim(); val.classList.remove("is-placeholder"); closeFloat(list, true); btn.dispatchEvent(new CustomEvent("axiom:change", { detail: { value: o.dataset.value || val.textContent } })); };
      on(btn, "click", () => { list.style.width = btn.offsetWidth + "px"; if (openFloats.has(list)) closeFloat(list); else { openFloat(list, btn); const s = list.querySelector("[aria-selected=true]") || list.querySelector(".ax-option"); $$(".ax-option", list).forEach((x) => x.classList.toggle("is-active", x === s)); } });
      on(list, "click", (e) => { const o = e.target.closest(".ax-option"); if (o) pick(o); });
      listNav(list, btn, pick);
    });
    $$("[data-ax-multi]", root).forEach((box) => {
      if (!once(box, "axMultiInit")) return;
      const list = document.getElementById(box.dataset.axMulti); const input = box.querySelector(".ax-input");
      list.setAttribute("role", "listbox"); list.setAttribute("aria-multiselectable", "true");
      $$(".ax-option", list).forEach((o) => { o.id = o.id || "ax-opt-" + ++uid; o.setAttribute("role", "option"); if (!o.querySelector("svg, i")) o.insertAdjacentHTML("beforeend", '<i data-lucide="check"></i>'); });
      icons(list);
      const render = () => {
        $$(".ax-tag", box).forEach((t) => t.remove());
        $$(".ax-option[aria-selected=true]", list).forEach((o) => {
          const tag = document.createElement("span"); tag.className = "ax-tag tone-blue"; tag.innerHTML = `<span></span><button type="button" aria-label="Remove ${o.textContent.trim()}"><i data-lucide="x"></i></button>`;
          tag.firstChild.textContent = o.textContent.trim(); on(tag.querySelector("button"), "click", (e) => { e.stopPropagation(); o.setAttribute("aria-selected", "false"); render(); });
          box.insertBefore(tag, input);
        });
        icons(box); if (openFloats.has(list)) place(list, box, "bottom-start", 6);
      };
      const pick = (o) => { o.setAttribute("aria-selected", o.getAttribute("aria-selected") !== "true"); input.value = ""; filter(); render(); input.focus(); };
      const filter = () => { const q = input.value.toLowerCase(); $$(".ax-option", list).forEach((o) => (o.hidden = !o.textContent.toLowerCase().includes(q))); };
      on(box, "click", () => { input.focus(); list.style.width = box.offsetWidth + "px"; openFloat(list, box); });
      on(input, "input", () => { filter(); if (!openFloats.has(list)) openFloat(list, box); });
      on(input, "keydown", (e) => { if (e.key === "Backspace" && !input.value) { const last = $$(".ax-option[aria-selected=true]", list).pop(); if (last) { last.setAttribute("aria-selected", "false"); render(); } } });
      on(list, "click", (e) => { const o = e.target.closest(".ax-option"); if (o) pick(o); });
      listNav(list, input, pick); render();
    });
    $$("[data-ax-autocomplete]", root).forEach((input) => {
      if (!once(input, "axAcInit")) return;
      const list = document.getElementById(input.dataset.axAutocomplete); const anchor = input.closest(".ax-control");
      list.setAttribute("role", "listbox"); input.setAttribute("role", "combobox"); input.setAttribute("aria-autocomplete", "list");
      $$(".ax-option", list).forEach((o) => { o.id = o.id || "ax-opt-" + ++uid; o.setAttribute("role", "option"); });
      const filter = () => {
        const q = input.value.trim().toLowerCase(); let n = 0;
        $$(".ax-option", list).forEach((o) => { const label = o.dataset.label || o.textContent; const hit = q && label.toLowerCase().includes(q); o.hidden = !hit || n >= 6; if (hit) n++;
          const t = o.querySelector(".ax-ac__t"); if (t) { const i = label.toLowerCase().indexOf(q); t.innerHTML = hit ? `${esc(label.slice(0, i))}<b>${esc(label.slice(i, i + q.length))}</b>${esc(label.slice(i + q.length))}` : esc(label); } });
        const empty = list.querySelector(".ax-ac__empty"); if (empty) empty.hidden = !!n || !q;
        if (q) { list.style.width = anchor.offsetWidth + "px"; openFloat(list, anchor); } else closeFloat(list);
        $$(".ax-option", list).forEach((o, i) => o.classList.toggle("is-active", false));
      };
      on(input, "input", filter);
      const pick = (o) => { input.value = o.dataset.label || o.textContent.trim(); closeFloat(list); input.dispatchEvent(new Event("input")); closeFloat(list); };
      on(list, "click", (e) => { const o = e.target.closest(".ax-option"); if (o) pick(o); });
      listNav(list, input, pick);
    });
  }
  const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  /* ---------------- Slider (two thumbs, never cross) ---------------- */
  function initSliders(root) {
    $$(".ax-slider", root).forEach((s) => {
      if (!once(s, "axSliderInit")) return;
      const [a, b] = $$("input[type=range]", s); const out = s.querySelector(".ax-slider__value"); const fmt = s.dataset.format || "$";
      const min = +a.min, max = +a.max;
      const sync = (e) => {
        if (+a.value > +b.value - (+s.dataset.gap || 0)) { if (e && e.target === a) a.value = +b.value - (+s.dataset.gap || 0); else b.value = +a.value + (+s.dataset.gap || 0); }
        s.style.setProperty("--a", ((a.value - min) / (max - min)) * 100 + "%"); s.style.setProperty("--b", ((b.value - min) / (max - min)) * 100 + "%");
        if (out) out.textContent = `${fmt}${a.value} – ${fmt}${b.value}`;
        a.setAttribute("aria-valuetext", fmt + a.value); b.setAttribute("aria-valuetext", fmt + b.value);
      };
      on(a, "input", sync); on(b, "input", sync); sync();
    });
  }

  /* ---------------- Color picker & swatches ---------------- */
  function hsvToHex(h, s, v) {
    const f = (n, k = (n + h / 60) % 6) => v - v * s * Math.max(Math.min(k, 4 - k, 1), 0);
    return "#" + [f(5), f(3), f(1)].map((x) => Math.round(x * 255).toString(16).padStart(2, "0")).join("").toUpperCase();
  }
  function hexToHsv(hex) {
    const m = hex.replace("#", "").match(/^([0-9a-f]{6})$/i); if (!m) return null;
    const n = parseInt(m[1], 16); const r = (n >> 16) / 255, g = ((n >> 8) & 255) / 255, b = (n & 255) / 255;
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn; let h = 0;
    if (d) h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
    return [(h * 60 + 360) % 360, mx ? d / mx : 0, mx];
  }
  function initColor(root) {
    $$(".ax-color", root).forEach((c) => {
      if (!once(c, "axColorInit")) return;
      const area = c.querySelector(".ax-color__area"), hue = c.querySelector(".ax-color__hue"), hex = c.querySelector(".ax-input"), prev = c.querySelector(".ax-color__preview");
      let [h, s, v] = hexToHsv(hex.value) || [205, 0.73, 1];
      const render = (skipHex) => { const col = hsvToHex(h, s, v); c.style.setProperty("--hue", h); area.style.setProperty("--sx", s * 100 + "%"); area.style.setProperty("--sy", (1 - v) * 100 + "%"); prev.style.setProperty("--c", col); hue.value = h; if (!skipHex) hex.value = col; area.setAttribute("aria-valuetext", `Saturation ${Math.round(s * 100)}%, brightness ${Math.round(v * 100)}%`); };
      const fromPointer = (e) => { const r = area.getBoundingClientRect(); s = clamp((e.clientX - r.left) / r.width, 0, 1); v = 1 - clamp((e.clientY - r.top) / r.height, 0, 1); render(); };
      let down = false;
      on(area, "pointerdown", (e) => { down = true; area.setPointerCapture(e.pointerId); fromPointer(e); });
      on(area, "pointermove", (e) => down && fromPointer(e));
      on(area, "pointerup", () => (down = false));
      area.tabIndex = 0; area.setAttribute("role", "slider"); area.setAttribute("aria-label", "Saturation and brightness");
      on(area, "keydown", (e) => { const st = 0.02; if (e.key === "ArrowRight") s = clamp(s + st, 0, 1); else if (e.key === "ArrowLeft") s = clamp(s - st, 0, 1); else if (e.key === "ArrowUp") v = clamp(v + st, 0, 1); else if (e.key === "ArrowDown") v = clamp(v - st, 0, 1); else return; e.preventDefault(); render(); });
      on(hue, "input", () => { h = +hue.value; render(); });
      on(hex, "input", () => { const x = hexToHsv(hex.value.startsWith("#") ? hex.value : "#" + hex.value); if (x) { [h, s, v] = x; render(true); } });
      render();
    });
    $$(".ax-swatches", root).forEach((g) => {
      if (!once(g, "axSwInit")) return;
      g.setAttribute("role", "radiogroup");
      $$(".ax-swatch", g).forEach((b) => { b.setAttribute("role", "radio"); on(b, "click", () => { $$(".ax-swatch", g).forEach((x) => x.setAttribute("aria-checked", x === b)); g.dispatchEvent(new CustomEvent("axiom:change", { detail: { value: b.getAttribute("aria-label") } })); }); });
    });
  }

  /* ---------------- Upload ---------------- */
  function fileRow(name, size, fail) {
    const row = document.createElement("div"); row.className = "ax-file";
    row.innerHTML = `<span class="ax-file__icon"><i data-lucide="${/\.(png|jpe?g|gif|webp)$/i.test(name) ? "image" : "file-text"}"></i></span>
      <div class="ax-file__body"><span class="ax-file__name"></span><span class="ax-file__meta">Uploading… 0%</span><div class="ax-progress"><div class="ax-progress__fill"></div></div></div>
      <button class="ax-btn ax-btn--ghost ax-btn--sm ax-btn--icon" type="button" aria-label="Cancel upload"><i data-lucide="x"></i></button>`;
    row.querySelector(".ax-file__name").textContent = name;
    let p = 0; const meta = row.querySelector(".ax-file__meta"), fill = row.querySelector(".ax-progress__fill"), prog = row.querySelector(".ax-progress");
    const kb = Math.max(1, Math.round(size / 1024));
    const tick = setInterval(() => {
      p = Math.min(100, p + 8 + Math.random() * 18);
      if (fail && p > 55) { clearInterval(tick); row.classList.add("is-error"); prog.remove(); meta.innerHTML = '<span class="tx-neg">Upload failed. The file is over 10 MB — compress it and try again.</span>'; const b = row.querySelector(".ax-btn"); b.setAttribute("aria-label", "Retry"); b.innerHTML = '<i data-lucide="rotate-cw"></i>'; icons(b); return; }
      fill.style.setProperty("--v", p / 100); meta.textContent = `Uploading… ${Math.round(p)}%`;
      if (p >= 100) { clearInterval(tick); setTimeout(() => { prog.style.transition = "opacity .2s"; prog.style.opacity = 0; setTimeout(() => prog.remove(), 200); meta.textContent = `${kb > 1024 ? (kb / 1024).toFixed(1) + " MB" : kb + " KB"} · Uploaded`; const b = row.querySelector(".ax-btn"); b.setAttribute("aria-label", "Remove file"); b.innerHTML = '<i data-lucide="trash-2"></i>'; icons(b); }, 250); }
    }, 220 * motionScale());
    on(row.querySelector(".ax-btn"), "click", () => { clearInterval(tick); row.animate([{ opacity: 1 }, { opacity: 0, transform: "scale(.98)" }], { duration: 150 }).onfinish = () => row.remove(); });
    icons(row); return row;
  }
  function initUpload(root) {
    $$(".ax-upload", root).forEach((z) => {
      if (!once(z, "axUpInit")) return;
      const input = z.querySelector("input[type=file]"); const list = document.getElementById(z.dataset.list);
      const add = (files) => [...files].forEach((f, i) => list.prepend(fileRow(f.name, f.size, f.size > 10 * 1024 * 1024)));
      z.tabIndex = 0; z.setAttribute("role", "button");
      on(z, "click", () => input.click()); on(z, "keydown", (e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), input.click()));
      on(input, "change", () => add(input.files));
      ["dragenter", "dragover"].forEach((ev) => on(z, ev, (e) => { e.preventDefault(); z.classList.add("is-over"); }));
      ["dragleave", "drop"].forEach((ev) => on(z, ev, (e) => { e.preventDefault(); z.classList.remove("is-over"); }));
      on(z, "drop", (e) => add(e.dataTransfer.files));
    });
  }
  window.AxiomFileRow = fileRow;

  /* ---------------- Date picker & time slots ---------------- */
  function initDatepickers(root) {
    $$("[data-ax-datepicker]", root).forEach((dp) => {
      if (!once(dp, "axDpInit")) return;
      const today = new Date(); let view = new Date(today.getFullYear(), today.getMonth(), 1); let sel = null;
      const range = dp.dataset.axDatepicker === "range"; let rs = null, re = null;
      const title = dp.querySelector(".ax-datepicker__title"), grid = dp.querySelector(".ax-datepicker__grid"); const [prev, next] = $$(".ax-datepicker__head .ax-btn", dp);
      const out = dp.dataset.output && document.getElementById(dp.dataset.output);
      const same = (a, b) => a && b && a.toDateString() === b.toDateString();
      const fmt = (d) => d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
      const render = (dir) => {
        title.textContent = view.toLocaleDateString("en-US", { month: "long", year: "numeric" });
        let html = "Mo Tu We Th Fr Sa Su".split(" ").map((d) => `<span class="ax-datepicker__dow" aria-hidden="true">${d}</span>`).join("");
        const start = new Date(view); start.setDate(1 - ((view.getDay() + 6) % 7));
        for (let i = 0; i < 42; i++) {
          const d = new Date(start); d.setDate(start.getDate() + i);
          if (i === 35 && d.getMonth() !== view.getMonth()) break;
          const cls = ["ax-date"]; if (same(d, today)) cls.push("is-today"); if (d.getMonth() !== view.getMonth()) cls.push("is-outside");
          if (range) { if (same(d, rs)) cls.push("is-start"); if (same(d, re)) cls.push("is-end"); if (rs && re && d > rs && d < re) cls.push("is-in-range"); }
          const dis = d.getDay() === 0 && dp.dataset.noSundays !== undefined;
          html += `<button type="button" class="${cls.join(" ")}" data-d="${d.toISOString()}" aria-label="${fmt(d)}" ${!range && same(d, sel) ? 'aria-selected="true"' : ""} ${dis ? "disabled" : ""}>${d.getDate()}</button>`;
        }
        grid.innerHTML = html;
        if (dir && !reducedMotion()) grid.animate([{ opacity: 0, transform: `translateX(${dir * 12}px)`, filter: "blur(2px)" }, { opacity: 1, transform: "none", filter: "blur(0)" }], { duration: 220 * motionScale(), easing: "cubic-bezier(0.23,1,0.32,1)" });
      };
      on(prev, "click", () => { view.setMonth(view.getMonth() - 1); render(-1); });
      on(next, "click", () => { view.setMonth(view.getMonth() + 1); render(1); });
      on(grid, "click", (e) => {
        const b = e.target.closest(".ax-date"); if (!b || b.disabled) return; const d = new Date(b.dataset.d);
        if (range) { if (!rs || re) { rs = d; re = null; } else if (d < rs) { re = rs; rs = d; } else re = d; if (out) out.textContent = rs && re ? `${fmt(rs)} – ${fmt(re)}` : `${fmt(rs)} – pick an end date`; }
        else { sel = d; if (out) out.textContent = fmt(d); }
        if (d.getMonth() !== view.getMonth()) { const dir = d > view ? 1 : -1; view = new Date(d.getFullYear(), d.getMonth(), 1); render(dir); } else render();
      });
      if (range) { rs = new Date(today.getFullYear(), today.getMonth(), Math.min(today.getDate() + 2, 25)); re = new Date(rs); re.setDate(rs.getDate() + 4); }
      else sel = new Date(today);
      render();
    });
    $$(".ax-time-slots", root).forEach((g) => { if (once(g, "axSlotsInit")) on(g, "click", (e) => { const b = e.target.closest(".ax-slot"); if (!b || b.disabled) return; $$(".ax-slot", g).forEach((x) => x.setAttribute("aria-pressed", x === b)); }); });
  }

  /* ---------------- Pagination ---------------- */
  function initPagination(root) {
    $$("[data-ax-pagination]", root).forEach((p) => {
      if (!once(p, "axPagInit")) return;
      const total = +p.dataset.total; let cur = +(p.dataset.current || 1);
      const lim = () => (p.closest(".ax-m-scope, .ax-screen") ? 440 : 360);   // mobile pages are 40 wide, so phones need more room
      const render = () => {
        const set = new Set([1, total, cur - 1, cur, cur + 1].filter((n) => n >= 1 && n <= total));
        if (cur <= 3) [2, 3, 4].forEach((n) => n < total && set.add(n)); if (cur >= total - 2) [total - 3, total - 2, total - 1].forEach((n) => n > 1 && set.add(n));
        let nums = [...set].sort((a, b) => a - b); while (nums.length > 5) nums.splice(cur <= total / 2 ? nums.length - 2 : 1, 1);
        if ((p.parentElement || p).clientWidth < lim()) nums = [...new Set([1, cur, total])].sort((a, b) => a - b);   // phones: first, current, last
        let html = `<button class="ax-page" type="button" aria-label="Previous page" ${cur === 1 ? "disabled" : ""} data-go="${cur - 1}"><i data-lucide="chevron-left"></i></button>`;
        nums.forEach((n, i) => { if (i && n - nums[i - 1] > 1) html += `<span class="ax-page ax-page--gap" aria-hidden="true">…</span>`; html += `<button class="ax-page" type="button" data-go="${n}" ${n === cur ? 'aria-current="page"' : ""} aria-label="Page ${n}">${n}</button>`; });
        html += `<button class="ax-page" type="button" aria-label="Next page" ${cur === total ? "disabled" : ""} data-go="${cur + 1}"><i data-lucide="chevron-right"></i></button>`;
        p.innerHTML = html; icons(p);
      };
      let narrow = null; new ResizeObserver(() => { const n = (p.parentElement || p).clientWidth < lim(); if (n !== narrow) { narrow = n; render(); } }).observe(p.parentElement || p);
      on(p, "click", (e) => { const b = e.target.closest("[data-go]"); if (!b || b.disabled) return; cur = +b.dataset.go; render(); p.querySelector(`[data-go="${cur}"][aria-current]`)?.focus(); const out = p.dataset.output && document.getElementById(p.dataset.output); if (out) out.textContent = `Showing ${(cur - 1) * 10 + 1}–${Math.min(cur * 10, total * 10 - 4)} of ${total * 10 - 4}`; });
      render();
    });
  }

  /* ---------------- Stepper ---------------- */
  function initSteppers(root) {
    $$("[data-ax-stepper]", root).forEach((st) => {
      if (!once(st, "axStepInit")) return;
      const steps = $$(".ax-step", st); let cur = steps.findIndex((s) => s.dataset.state === "current"); if (cur < 0) cur = 0;
      const render = () => steps.forEach((s, i) => { s.dataset.state = i < cur ? "done" : i === cur ? "current" : "upcoming"; if (i === cur) s.setAttribute("aria-current", "step"); else s.removeAttribute("aria-current"); });
      const ctl = document.querySelector(`[data-ax-stepper-for="${st.id}"]`);
      if (ctl) $$("[data-step]", ctl).forEach((b) => on(b, "click", () => { cur = clamp(cur + (b.dataset.step === "next" ? 1 : -1), 0, steps.length); render(); $$("[data-step=prev]", ctl).forEach((x) => (x.disabled = cur === 0)); $$("[data-step=next]", ctl).forEach((x) => (x.disabled = cur >= steps.length)); }));
      render();
    });
  }

  /* ---------------- Data table: sort + select + action bar ---------------- */
  function initTables(root) {
    $$("[data-ax-table]", root).forEach((wrap) => {
      if (!once(wrap, "axTblInit")) return;
      const tbody = wrap.querySelector("tbody"); const bar = wrap.querySelector(".ax-action-bar--floating"); const all = wrap.querySelector("thead input[type=checkbox]");
      const rows = () => $$("tbody tr:not(.ax-expand-row)", wrap);
      const sync = () => {
        const sel = rows().filter((r) => r.querySelector("input[type=checkbox]")?.checked);
        rows().forEach((r) => r.setAttribute("aria-selected", !!r.querySelector("input[type=checkbox]")?.checked));
        if (all) { all.checked = sel.length === rows().length; all.indeterminate = sel.length > 0 && sel.length < rows().length; }
        if (bar) { bar.dataset.state = sel.length ? "open" : "closed"; const l = bar.querySelector("[data-count]"); if (l && sel.length) l.textContent = `${sel.length} selected`; }
      };
      on(tbody, "change", sync);
      if (all) on(all, "change", () => { rows().forEach((r) => { const c = r.querySelector("input[type=checkbox]"); if (c) c.checked = all.checked; }); sync(); });
      if (bar) {
        on(bar.querySelector("[data-clear]"), "click", () => { rows().forEach((r) => { const c = r.querySelector("input[type=checkbox]"); if (c) c.checked = false; }); sync(); });
        $$("[data-bulk]", bar).forEach((b) => on(b, "click", () => { const n = rows().filter((r) => r.querySelector("input:checked")).length; toast({ message: `${n} ${n === 1 ? "invoice" : "invoices"} ${b.dataset.bulk}`, action: { label: "Undo" } }); rows().forEach((r) => { const c = r.querySelector("input[type=checkbox]"); if (c) c.checked = false; }); sync(); }));
      }
      $$(".ax-sort", wrap).forEach((btn, colIdx) => on(btn, "click", () => {
        const dir = btn.getAttribute("aria-sort") === "ascending" ? "descending" : "ascending";
        $$(".ax-sort", wrap).forEach((b) => b.removeAttribute("aria-sort")); btn.setAttribute("aria-sort", dir);
        const col = [...btn.closest("tr").children].indexOf(btn.closest("th"));
        const list = rows(); const first = new Map(list.map((r) => [r, r.getBoundingClientRect().top]));
        list.sort((a, b) => { const va = a.children[col].dataset.sort ?? a.children[col].textContent.trim(); const vb = b.children[col].dataset.sort ?? b.children[col].textContent.trim(); const na = parseFloat(va), nb = parseFloat(vb); const c = !isNaN(na) && !isNaN(nb) ? na - nb : va.localeCompare(vb); return dir === "ascending" ? c : -c; });
        list.forEach((r) => tbody.appendChild(r));
        if (!reducedMotion()) list.forEach((r) => { const d = first.get(r) - r.getBoundingClientRect().top; if (d) r.animate([{ transform: `translateY(${d}px)` }, { transform: "none" }], { duration: 260 * motionScale(), easing: "cubic-bezier(0.2,0,0,1)" }); });
      }));
      sync();
    });
  }

  /* ---------------- Kanban drag (grab offset, pointer capture, FLIP drop) ---------------- */
  function initKanban(root) {
    $$(".ax-kanban", root).forEach((board) => {
      if (!once(board, "axKanInit")) return;
      let drag = null;
      const counts = () => $$(".ax-kanban__col", board).forEach((col) => { const c = col.querySelector("[data-col-count]"); if (c) count(c, $$(".ax-kcard", col).length, 300); });
      on(board, "pointerdown", (e) => {
        const card = e.target.closest(".ax-kcard"); if (!card || drag || e.button > 0) return;
        const r = card.getBoundingClientRect();
        drag = { card, id: e.pointerId, ox: e.clientX - r.left, oy: e.clientY - r.top, sx: e.clientX, sy: e.clientY, started: false, w: r.width, h: r.height };
        card.setPointerCapture(e.pointerId);
      });
      on(board, "pointermove", (e) => {
        if (!drag || e.pointerId !== drag.id) return;
        const { card } = drag;
        if (!drag.started) {
          if (Math.hypot(e.clientX - drag.sx, e.clientY - drag.sy) < 4) return;
          drag.started = true;
          drag.slot = document.createElement("div"); drag.slot.className = "ax-kslot"; drag.slot.style.height = drag.h + "px";
          card.after(drag.slot);
          Object.assign(card.style, { position: "fixed", width: drag.w + "px", left: "0px", top: "0px", pointerEvents: "none" });
          card.classList.add("is-dragging"); document.body.appendChild(card);
        }
        card.style.transform = `translate(${e.clientX - drag.ox}px, ${e.clientY - drag.oy}px) rotate(1.5deg) scale(1.02)`;
        const col = document.elementsFromPoint(e.clientX, e.clientY).map((el) => el.closest && el.closest(".ax-kanban__col")).find((x) => x && board.contains(x));
        $$(".ax-kanban__col", board).forEach((c) => c.classList.toggle("is-over", c === col));
        if (col) {
          const cards = $$(".ax-kcard", col); const after = cards.find((c) => { const rr = c.getBoundingClientRect(); return e.clientY < rr.top + rr.height / 2; });
          const firstPos = new Map(cards.map((c) => [c, c.getBoundingClientRect().top]));
          if (after) { if (after.previousElementSibling !== drag.slot) col.insertBefore(drag.slot, after); } else if (col.lastElementChild !== drag.slot) col.appendChild(drag.slot);
          cards.forEach((c) => { const d = firstPos.get(c) - c.getBoundingClientRect().top; if (d && !reducedMotion()) c.animate([{ transform: `translateY(${d}px)` }, { transform: "none" }], { duration: 200 * motionScale(), easing: "cubic-bezier(0.2,0,0,1)" }); });
        }
      });
      const end = (e) => {
        if (!drag || e.pointerId !== drag.id) return;
        const { card, slot, started } = drag; drag = null;
        if (!started) return;
        const to = slot.getBoundingClientRect();
        card.style.transition = `transform ${220 * motionScale()}ms cubic-bezier(0.2,0,0,1), box-shadow 150ms ease`;
        card.style.transform = `translate(${to.left}px, ${to.top}px)`;
        setTimeout(() => { slot.replaceWith(card); card.removeAttribute("style"); card.classList.remove("is-dragging"); $$(".ax-kanban__col", board).forEach((c) => c.classList.remove("is-over")); counts(); board.dispatchEvent(new CustomEvent("axiom:move", { detail: { card } })); }, 220 * motionScale());
      };
      on(board, "pointerup", end); on(board, "pointercancel", end);
    });
  }

  /* ---------------- Number count (tween, tabular) ---------------- */
  function count(el, to, dur = 700, fmt) {
    const from = parseFloat(el.dataset.value ?? el.textContent.replace(/[^\d.-]/g, "")) || 0;
    el.dataset.value = to;
    const f = fmt || ((v) => Math.round(v).toLocaleString("en-US"));
    if (reducedMotion() || from === to) { el.textContent = f(to); return; }
    const t0 = performance.now(); const d = dur * motionScale();
    const step = (t) => { const p = Math.min(1, (t - t0) / d); const e = 1 - Math.pow(1 - p, 3); el.textContent = f(from + (to - from) * e); if (p < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }

  /* ---------------- Line chart scrub ---------------- */
  function initLineCharts(root) {
    $$("[data-ax-linechart]", root).forEach((ch) => {
      if (!once(ch, "axLineInit")) return;
      const data = JSON.parse(ch.dataset.axLinechart); const labels = (ch.dataset.labels || "").split(",");
      const svg = ch.querySelector("svg"); const W = 600, H = 200, P = 8; const max = Math.max(...data) * 1.1, min = 0;
      const pts = data.map((v, i) => [P + (i * (W - 2 * P)) / (data.length - 1), H - ((v - min) / (max - min)) * H]);
      const d = pts.map((p, i) => {
        if (!i) return `M${p[0]},${p[1]}`; const p0 = pts[i - 1]; const cx = (p0[0] + p[0]) / 2; return `C${cx},${p0[1]} ${cx},${p[1]} ${p[0]},${p[1]}`;
      }).join(" ");
      ch.querySelector(".ax-line-path").setAttribute("d", d);
      const area = ch.querySelector(".ax-line-area"); if (area) area.setAttribute("d", d + ` L${W - P},${H} L${P},${H} Z`);
      const scrub = ch.querySelector(".ax-scrub"), dot = ch.querySelector(".ax-scrub__dot"), tipEl = ch.querySelector(".ax-chart-tip"), head = ch.dataset.headline && document.getElementById(ch.dataset.headline);
      const show = (i) => {
        const box = svg.getBoundingClientRect(), cb = ch.getBoundingClientRect(); const sx = box.width / W, sy = box.height / H;
        const x = box.left - cb.left + pts[i][0] * sx; scrub.style.transform = `translateX(${x}px)`; scrub.style.left = "0px";
        dot.style.top = pts[i][1] * sy - 5 + "px"; tipEl.style.left = x + "px"; tipEl.style.top = pts[i][1] * sy - 12 + "px";
        tipEl.textContent = `${labels[i] || ""} · $${data[i].toLocaleString("en-US")}`;
        if (head) count(head, data[i], 260, (v) => "$" + Math.round(v).toLocaleString("en-US"));
      };
      on(ch, "pointermove", (e) => { const box = svg.getBoundingClientRect(); const rel = (e.clientX - box.left) / box.width; show(clamp(Math.round(rel * (data.length - 1)), 0, data.length - 1)); });
      on(ch, "pointerleave", () => { if (head) count(head, data[data.length - 1], 300, (v) => "$" + Math.round(v).toLocaleString("en-US")); });
      ch.tabIndex = 0; let ki = data.length - 1;
      on(ch, "keydown", (e) => { if (e.key === "ArrowRight" || e.key === "ArrowLeft") { e.preventDefault(); ki = clamp(ki + (e.key === "ArrowRight" ? 1 : -1), 0, data.length - 1); ch.classList.add("is-scrubbing"); show(ki); } });
      on(ch, "blur", () => ch.classList.remove("is-scrubbing"));
    });
  }

  /* ---------------- Reveal on view ---------------- */
  let io;
  function initReveal(root) {
    if (!io) io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-revealed"); e.target.dispatchEvent(new CustomEvent("axiom:reveal")); io.unobserve(e.target); } }), { rootMargin: "0px 0px -80px 0px" });
    $$("[data-reveal], .ax-stagger, .ax-clip-reveal", root).forEach((el) => { if (once(el, "axRevInit")) io.observe(el); });
  }

  /* ---------------- Code snippet copy ---------------- */
  function initCopy(root) {
    $$(".ax-code-snippet__copy", root).forEach((b) => {
      if (!once(b, "axCopyInit")) return;
      on(b, "click", async () => {
        const code = b.closest(".ax-code-snippet").querySelector("pre").innerText;
        try { await navigator.clipboard.writeText(code); } catch (e) { /* clipboard blocked: still confirm */ }
        const sw = b.querySelector(".ax-swap"); sw.classList.add("is-swapped"); clearTimeout(b._t); b._t = setTimeout(() => sw.classList.remove("is-swapped"), 1600);
      });
    });
  }

  /* ---------------- Rich text ---------------- */
  function initRte(root) {
    $$(".ax-rte", root).forEach((r) => {
      if (!once(r, "axRteInit")) return;
      const body = r.querySelector(".ax-rte__body");
      $$("[data-cmd]", r).forEach((b) => on(b, "mousedown", (e) => { e.preventDefault(); document.execCommand(b.dataset.cmd, false, null); sync(); }));
      const sync = () => $$("[data-cmd]", r).forEach((b) => { if (["bold", "italic", "underline", "strikeThrough", "insertUnorderedList", "insertOrderedList"].includes(b.dataset.cmd)) b.setAttribute("aria-pressed", document.queryCommandState(b.dataset.cmd)); });
      on(body, "keyup", sync); on(body, "mouseup", sync);
      const cnt = r.parentElement.querySelector(".ax-count"); if (cnt) on(body, "input", () => (cnt.textContent = body.innerText.trim().split(/\s+/).filter(Boolean).length + " words"));
    });
  }

  /* ---------------- Audio waveform ---------------- */
  function initWave(root) {
    $$(".ax-wave", root).forEach((w) => {
      if (!once(w, "axWaveInit")) return;
      const bars = w.querySelector(".ax-wave__bars"); const btn = w.querySelector(".ax-wave__play"); const time = w.querySelector("[data-time]");
      if (!bars.children.length) { let h = ""; for (let i = 0; i < 32; i++) h += `<i style="--h:${6 + Math.round(Math.abs(Math.sin(i * 1.7) * 14 + Math.cos(i * 0.6) * 6))}px"></i>`; bars.innerHTML = h; }
      let t = null, i = 0; const total = bars.children.length;
      const setIcon = (n) => { btn.innerHTML = `<i data-lucide="${n}"></i>`; icons(btn); };
      on(btn, "click", () => {
        if (t) { clearInterval(t); t = null; setIcon("play"); btn.setAttribute("aria-label", "Play"); return; }
        setIcon("pause"); btn.setAttribute("aria-label", "Pause");
        t = setInterval(() => { i++; [...bars.children].forEach((b, j) => b.classList.toggle("is-on", j < i)); if (time) time.textContent = `0:${String(Math.round((i / total) * 14)).padStart(2, "0")}`; if (i >= total) { clearInterval(t); t = null; i = 0; setIcon("play"); setTimeout(() => [...bars.children].forEach((b) => b.classList.remove("is-on")), 600); } }, 140);
      });
    });
  }

  /* ---------------- Nodes (drag, live connectors) ---------------- */
  function initNodes(root) {
    $$(".ax-nodes", root).forEach((canvas) => {
      if (!once(canvas, "axNodesInit")) return;
      const svg = canvas.querySelector(".ax-nodes__lines");
      const draw = () => {
        const cb = canvas.getBoundingClientRect();
        $$("path[data-from]", svg).forEach((p) => {
          const a = document.getElementById(p.dataset.from), b = document.getElementById(p.dataset.to); if (!a || !b) return;
          const ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect();
          const x1 = ra.right - cb.left + 1, y1 = ra.top + ra.height / 2 - cb.top, x2 = rb.left - cb.left - 1, y2 = rb.top + rb.height / 2 - cb.top;
          const dx = Math.max(40, (x2 - x1) / 2); p.setAttribute("d", `M${x1},${y1} C${x1 + dx},${y1} ${x2 - dx},${y2} ${x2},${y2}`);
        });
      };
      let drag = null;
      on(canvas, "pointerdown", (e) => {
        const n = e.target.closest(".ax-node"); if (!n) return;
        $$(".ax-node", canvas).forEach((x) => x.classList.toggle("is-selected", x === n));
        drag = { n, id: e.pointerId, sx: e.clientX, sy: e.clientY, l: n.offsetLeft, t: n.offsetTop }; n.setPointerCapture(e.pointerId); n.classList.add("is-dragging");
      });
      on(canvas, "pointermove", (e) => {
        if (!drag || drag.id !== e.pointerId) return;
        const g = 12; const x = Math.round((drag.l + e.clientX - drag.sx) / g) * g, y = Math.round((drag.t + e.clientY - drag.sy) / g) * g;
        drag.n.style.left = clamp(x, 8, canvas.clientWidth - drag.n.offsetWidth - 8) + "px"; drag.n.style.top = clamp(y, 8, canvas.clientHeight - drag.n.offsetHeight - 8) + "px"; draw();
      });
      const end = () => { if (drag) { drag.n.classList.remove("is-dragging"); drag = null; } };
      on(canvas, "pointerup", end); on(canvas, "pointercancel", end);
      new ResizeObserver(draw).observe(canvas); requestAnimationFrame(draw);
    });
  }

  /* ---------------- Command palette ---------------- */
  function initPalette(root) {
    $$("[data-ax-palette]", root).forEach((ov) => {
      if (!once(ov, "axPalInit")) return;
      const input = ov.querySelector("input"); const results = ov.querySelector(".ax-palette__results"); const empty = ov.querySelector(".ax-palette__empty");
      const items = () => $$(".ax-item", results).filter((i) => !i.hidden);
      const setActive = (it) => { $$(".ax-item", results).forEach((x) => x.classList.toggle("is-active", x === it)); if (it) { it.scrollIntoView({ block: "nearest" }); input.setAttribute("aria-activedescendant", it.id); } };
      $$(".ax-item", results).forEach((it) => { it.id = it.id || "ax-cmd-" + ++uid; it.setAttribute("role", "option"); it.tabIndex = -1; });
      const filter = () => {
        const q = input.value.trim().toLowerCase();
        $$(".ax-item", results).forEach((i) => (i.hidden = q && !i.textContent.toLowerCase().includes(q)));
        $$(".ax-menu__group", results).forEach((g) => { let n = g.nextElementSibling, any = false; while (n && !n.matches(".ax-menu__group")) { if (n.matches(".ax-item") && !n.hidden) any = true; n = n.nextElementSibling; } g.hidden = !any; });
        if (empty) empty.hidden = items().length > 0; setActive(items()[0]);
      };
      on(input, "input", filter);
      on(input, "keydown", (e) => {
        const list = items(); const i = list.findIndex((x) => x.classList.contains("is-active"));
        if (e.key === "ArrowDown") { e.preventDefault(); setActive(list[(i + 1) % list.length]); }
        if (e.key === "ArrowUp") { e.preventDefault(); setActive(list[(i - 1 + list.length) % list.length]); }
        if (e.key === "Enter" && list[i]) { e.preventDefault(); list[i].click(); }
      });
      on(results, "pointermove", (e) => { const it = e.target.closest(".ax-item"); if (it) setActive(it); });
      on(results, "click", (e) => { const it = e.target.closest(".ax-item"); if (!it) return; close(ov); if (it.dataset.action) ov.dispatchEvent(new CustomEvent("axiom:command", { detail: { action: it.dataset.action } })); else if (it.dataset.href) { const t = document.getElementById(it.dataset.href); if (t) t.scrollIntoView({ behavior: reducedMotion() ? "auto" : "smooth" }); history.replaceState(null, "", "#" + it.dataset.href); } else toast({ message: `Ran “${it.querySelector(".ax-item__label").textContent}”` }); });
      on(ov, "axiom:open", () => { input.value = ""; filter(); });
      on(document, "keydown", (e) => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); overlays.has(ov) ? close(ov) : open(ov); } });
    });
  }

  /* ---------------- Init ---------------- */
  function init(root = document) {
    initTriggers(root); initTooltips(root); initOverlays(root); initTabs(root); initSegmented(root); initToggles(root);
    initFields(root); initButtons(root); initSelects(root); initSliders(root); initColor(root); initUpload(root);
    initDatepickers(root); initPagination(root); initSteppers(root); initTables(root); initKanban(root); initLineCharts(root);
    initReveal(root); initCopy(root); initRte(root); initWave(root); initNodes(root); initPalette(root);
  }

  window.Axiom = { init, refresh, toast, open, close, place, count, reducedMotion, motionScale, icons, morph, openFloat, closeFloat };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => init()); else init();
})();
