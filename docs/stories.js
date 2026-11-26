/* Product stories — faux product UI built from AXIOM components, played by a
   scripted cursor. Each story: 3–5 beats, a payoff that holds, a reset with a
   visible cause, a poster frame (payoff) for reduced motion and thumbnails.
   Plays only while in view; a button pauses it (WCAG 2.2.2). */
(function () {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const ABORT = Symbol("abort"), STOP = Symbol("poster");
  // Fire-and-forget steps (a roll, a label swap) are cancelled when a story stops; that is expected, not an error.
  window.addEventListener("unhandledrejection", (e) => { if (e.reason === ABORT || e.reason === STOP) e.preventDefault(); });
  const TRAVEL = "cubic-bezier(0.45, 0, 0.1, 1)";
  const STD = "cubic-bezier(0.2, 0, 0, 1)";
  const OUT = "cubic-bezier(0.23, 1, 0.32, 1)";
  const scale = () => (window.Axiom ? Axiom.motionScale() : 1);
  const reduced = () => (window.Axiom ? Axiom.reducedMotion() : false);
  const LOGO = `<svg class="ax-logo__mark" viewBox="0 0 28 28" aria-hidden="true"><circle cx="14" cy="14" r="14" fill="var(--axiom-action-primary)"/><path d="M8.5 15.5c1.8 2.6 3.6 3.9 5.5 3.9s3.7-1.3 5.5-3.9" stroke="#1E1E1E" stroke-width="2.2" fill="none" stroke-linecap="round"/></svg>`;
  const CURSOR = `<svg viewBox="0 0 22 26" aria-hidden="true">
    <path class="ss-arrow" d="M3 2.5v17.2l4.6-4.3 3.3 7.3 3-1.4-3.3-7.1h6.4z" fill="#1E1E1E" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/>
    <g class="ss-hand" transform="translate(-1 1) scale(.95)" fill="#fff" stroke="#1E1E1E" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M17 11.5V9a2 2 0 0 0-4 0v1.4M13 10V8a2 2 0 0 0-4 0v2M9 9.9V9a2 2 0 0 0-4 0v5M17 11a2 2 0 1 1 4 0v3a8 8 0 0 1-8 8h-2a7 7 0 0 1-6-3.5L3 15a2 2 0 0 1 3-2.6"/></g>
  </svg>`;

  const extraCSS = document.createElement("style");
  extraCSS.textContent = `
    .ss-cell{display:grid;place-items:center;position:relative}
    .ss-cell.is-focus{border-color:var(--axiom-line-focus);box-shadow:inset 0 0 0 .5px var(--axiom-line-focus)}
    .ss-cell.is-focus:empty::after{content:"";width:1.5px;height:22px;background:var(--axiom-action-primary);animation:ss-caret 1s steps(1) infinite}
    @keyframes ss-caret{50%{opacity:0}}
    .ss-slot{border-radius:14px;border:1.5px dashed var(--axiom-line-strong);flex:none;overflow:hidden}
    .ss-lift{position:absolute!important;z-index:30;box-shadow:var(--axiom-elevation-floating);margin:0}
    .ss-snack{position:absolute;left:50%;bottom:28px;width:340px;transform:translate(-50%,calc(100% + 40px));opacity:0;transition:transform 400ms ease,opacity 400ms ease;z-index:20}
    .ss-snack.is-on{transform:translate(-50%,0);opacity:1}
    .ss-roll{display:inline-grid;overflow:hidden;vertical-align:top}
    .ss-roll>span{grid-area:1/1}
    .ss-thread{position:absolute;inset:0;padding:20px 24px;display:flex;flex-direction:column;gap:12px}
    .ss-thread>*{flex:none}
    .ss-think{display:inline-flex;align-items:center;gap:10px;color:var(--axiom-text-tertiary);font-size:14px}
    .ss-shimmer{background:linear-gradient(90deg,var(--axiom-text-tertiary) 0%,var(--axiom-text-primary) 50%,var(--axiom-text-tertiary) 100%);background-size:200% 100%;-webkit-background-clip:text;background-clip:text;color:transparent;animation:ss-sh 1.6s linear infinite}
    @keyframes ss-sh{from{background-position:100% 0}to{background-position:-100% 0}}
    .ss-composer-text{flex:1;font-size:14px;line-height:20px;white-space:nowrap;overflow:hidden;color:var(--axiom-text-primary)}
    .ss-composer-text:empty::before{content:attr(data-ph);color:var(--axiom-text-tertiary)}
    .ss-composer-text.is-typing::after{content:"";display:inline-block;width:1.5px;height:16px;margin-left:1px;vertical-align:-4px;background:var(--axiom-action-primary);animation:ss-caret 1s steps(1) infinite}
    .ss-cursor--text .ss-arrow,.ss-cursor--text .ss-hand{display:none}
    .ss-ibeam{display:none}.ss-cursor--text .ss-ibeam{display:block}
    .ss-collapse{display:grid;grid-template-rows:1fr;transition:grid-template-rows 320ms cubic-bezier(.2,0,0,1),opacity 200ms ease}
    .ss-collapse>*{min-height:0;overflow:hidden}
    .ss-collapse.is-closed{grid-template-rows:0fr;opacity:0}
  `;
  document.head.appendChild(extraCSS);

  /* ---------------- Stage engine ---------------- */
  class Stage {
    constructor(wrap, def) {
      this.wrap = wrap; this.def = def; this.token = 0; this.playing = false; this.paused = false; this.inView = false;
      wrap.innerHTML = `<div class="ss-scaler"><div class="ss-stage" role="img"></div></div><button class="ax-btn ax-btn--sm ax-btn--icon ax-btn--on-canvas ss-play" type="button" aria-label="Pause animation"><i data-lucide="pause"></i></button>`;
      this.scaler = $(".ss-scaler", wrap); this.stage = $(".ss-stage", wrap); this.btn = $(".ss-play", wrap);
      const meta = wrap.parentElement.querySelector(":scope > .ss-meta") || (wrap.nextElementSibling && wrap.nextElementSibling.classList.contains("ss-meta") ? wrap.nextElementSibling : null);
      if (meta) meta.appendChild(this.btn);
      this.stage.setAttribute("aria-label", def.label);
      this.btn.addEventListener("click", () => { this.paused = !this.paused; this.sync(); });
      new ResizeObserver(() => this.resize()).observe(wrap);
      new IntersectionObserver(([e]) => { this.inView = e.isIntersecting; this.sync(); }, { threshold: 0.3 }).observe(wrap);
      document.addEventListener("axiom:motion", () => { this.stop(); this.sync(); });
      document.addEventListener("visibilitychange", () => this.sync());
      this.resize(true);
    }
    resize(force) {
      const w = this.wrap.clientWidth || 800; const compact = !!this.def.compact && w < 600;
      if (force || compact !== this.compact) { this.compact = compact; const d = compact ? this.def.compact : this.def; this.W = d.W; this.H = d.H; this.wrap.style.setProperty("--W", this.W); this.wrap.style.setProperty("--H", this.H); this.stop(); this.build(); this.poster(); }
      this.k = w / this.W; this.wrap.style.setProperty("--k", this.k);
    }
    build() {
      this.stage.innerHTML = this.def.build(this.compact) + `<div class="ss-cursor">${CURSOR}<svg class="ss-ibeam" viewBox="0 0 22 26" style="position:absolute;inset:0"><path d="M7 3h2.5c1 0 1.5.5 1.5 1.5S11.5 3 12.5 3H15M11 4.5v17M7 23h2.5c1 0 1.5-.5 1.5-1.5s.5 1.5 1.5 1.5H15" stroke="#1E1E1E" stroke-width="1.6" fill="none" stroke-linecap="round"/></svg></div>`;
      this.cursor = $(".ss-cursor", this.stage);
      const [cx, cy] = this.def.rest(this.compact); this.cx = cx; this.cy = cy; this.placeCursor();
      if (window.Axiom) Axiom.icons(this.stage); else if (window.lucide) lucide.createIcons({ root: this.stage });
    }
    placeCursor() { this.cursor.style.setProperty("--cx", this.cx + "px"); this.cursor.style.setProperty("--cy", this.cy + "px"); }
    sync() {
      const want = this.inView && !this.paused && !reduced() && !document.hidden;
      this.btn.hidden = reduced();
      this.btn.innerHTML = this.paused ? `<i data-lucide="play"></i>` : `<i data-lucide="pause"></i>`; this.btn.setAttribute("aria-label", this.paused ? "Play animation" : "Pause animation"); this.btn.dataset.tooltip = this.paused ? "Play" : "Pause";
      if (window.Axiom) Axiom.icons(this.btn);
      if (want && !this.playing) this.play();
      else if (!want && this.playing) { this.stop(); this.build(); this.poster(); }
    }
    stop() { this.token++; this.playing = false; }
    async play() {
      const token = ++this.token; this.playing = true;
      try {
        for (;;) { this.build(); await new Promise((r) => requestAnimationFrame(r)); await this.def.script(this.act(token, false), this.compact); if (token !== this.token) return; }
      } catch (e) { if (e !== ABORT) console.error(e); }
    }
    async poster() {
      const token = ++this.token; this.stage.classList.add("ss-instant");
      try { await this.def.script(this.act(token, true), this.compact); } catch (e) { if (e !== STOP && e !== ABORT) console.error(e); }
      requestAnimationFrame(() => requestAnimationFrame(() => this.stage.classList.remove("ss-instant")));
    }
    act(token, instant) {
      const S = this; const live = () => { if (token !== S.token) throw ABORT; };
      const q = (sel) => (typeof sel === "string" ? $(sel, S.stage) : sel);
      const pos = (el, ox = 0.5, oy = 0.5) => { const r = q(el).getBoundingClientRect(), s = S.stage.getBoundingClientRect(); return [(r.left - s.left) / S.k + (r.width / S.k) * ox, (r.top - s.top) / S.k + (r.height / S.k) * oy]; };
      const a = {
        instant, stage: S.stage, q, pos, compact: S.compact,
        wait(ms) { live(); if (instant) return Promise.resolve(); return new Promise((res, rej) => setTimeout(() => (token === S.token ? res() : rej(ABORT)), ms * scale())); },
        anim(el, kf, o) { live(); el = q(el); const an = el.animate(kf, { ...o, duration: instant ? 0 : (o.duration || 300) * scale(), delay: instant ? 0 : (o.delay || 0) * scale() }); return an.finished.catch(() => {}); },
        async move(target, o = {}) {
          live(); const [x, y] = Array.isArray(target) ? target : pos(target, o.ox ?? 0.5, o.oy ?? 0.5);
          const dur = o.duration || Math.min(1000, 420 + Math.hypot(x - S.cx, y - S.cy) * 0.9);
          const from = `translate(${S.cx}px, ${S.cy}px)`, to = `translate(${x}px, ${y}px)`;
          const follow = o.carry;
          const runs = [a.anim(S.cursor, [{ transform: from }, { transform: to }], { duration: dur, easing: TRAVEL })];
          if (follow) { const fx = parseFloat(follow.style.left), fy = parseFloat(follow.style.top); const dx = x - S.cx, dy = y - S.cy; runs.push(a.anim(follow, [{ transform: follow.style.transform || "none" }, { transform: `translate(${dx}px, ${dy}px) ${follow.dataset.tilt || ""}` }], { duration: dur, easing: TRAVEL })); follow._dx = dx; follow._dy = dy; follow.dataset.fx = fx; }
          S.cx = x; S.cy = y; S.placeCursor();
          await Promise.all(runs); live();
          if (follow) { follow.style.left = parseFloat(follow.style.left) + follow._dx + "px"; follow.style.top = parseFloat(follow.style.top) + follow._dy + "px"; follow.style.transform = follow.dataset.tilt || ""; }
        },
        async press(el) { live(); S.cursor.classList.add("is-down"); if (el) q(el).classList.add("is-pressed"); await a.wait(130); S.cursor.classList.remove("is-down"); if (el) q(el).classList.remove("is-pressed"); },
        async click(el, o) { await a.move(el, o); await a.press(el); },
        kind(k) { S.cursor.classList.toggle("ss-cursor--grab", k === "grab"); S.cursor.classList.toggle("ss-cursor--text", k === "text"); },
        async type(el, text, cps = 22) { el = q(el); for (const ch of text) { el.textContent += ch; await a.wait(1000 / cps + (Math.random() * 30 - 10)); } },
        mark() { if (instant) throw STOP; },
        async roll(el, text) {
          el = q(el); const old = el.querySelector("span"); if (old && old.textContent === String(text)) return;
          const n = document.createElement("span"); n.textContent = text; el.appendChild(n);
          if (!old) return;
          await Promise.all([a.anim(old, [{ transform: "none", opacity: 1 }, { transform: "translateY(-100%)", opacity: 0 }], { duration: 260, easing: STD, fill: "forwards" }), a.anim(n, [{ transform: "translateY(100%)", opacity: 0 }, { transform: "none", opacity: 1 }], { duration: 260, easing: STD })]);
          old.remove();
        },
        async swapLabel(el, html) {
          el = q(el); await a.anim(el, [{ filter: "blur(0)", opacity: 1 }, { filter: "blur(2px)", opacity: 0 }], { duration: 120, easing: "ease", fill: "forwards" });
          el.innerHTML = html; if (window.Axiom) Axiom.icons(el);
          await a.anim(el, [{ filter: "blur(2px)", opacity: 0 }, { filter: "blur(0)", opacity: 1 }], { duration: 180, easing: "ease" });
          el.getAnimations().forEach((x) => x.cancel());
        },
      };
      return a;
    }
  }
  const roll = (v) => `<span class="ss-roll"><span>${v}</span></span>`;
  const bar = (w, extra = "") => `<span class="ss-bar" style="width:${w}px;${extra}"></span>`;

  /* ================= Story 1: Task manager ================= */
  const fillerCard = (tone, w1, w2, av, done) => `<div class="ax-kcard" style="cursor:default">${bar(40, `height:14px;border-radius:6px;opacity:1;background:var(--axiom-tone-${tone}-soft)`)}<div class="ds-stack" style="gap:6px">${bar(w1, "height:10px" + (done ? ";opacity:.45" : ""))}${bar(w2, "height:10px" + (done ? ";opacity:.45" : ""))}</div><div class="ax-kcard__foot">${done ? `<i data-lucide="check-circle-2" style="width:16px;height:16px;color:var(--axiom-text-positive)"></i>` : bar(36, "height:8px")}<span class="ax-avatar ax-avatar--sm tone-${av}" style="--size:22px">&nbsp;</span></div></div>`;
  const kanban = {
    label: "Task manager: a card is dragged from In progress to Done, the column counts update and a snackbar offers Undo.",
    W: 1040, H: 560, compact: { W: 520, H: 600 },
    rest: (c) => (c ? [300, 520] : [760, 500]),
    build(c) {
      const sidebar = c ? "" : `<aside class="ax-sidebar" style="width:208px;border-right:1px solid var(--axiom-line-subtle);flex:none">
          <div class="ax-sidebar__head"><span class="ax-logo" style="font-size:16px">AXIOM</span></div>
          <span class="ax-side-item"><i data-lucide="home"></i><span class="ax-side-item__label">Home</span></span>
          <span class="ax-side-item"><i data-lucide="inbox"></i><span class="ax-side-item__label">Inbox</span><span class="ax-badge">3</span></span>
          <span class="ax-side-item" aria-current="page"><i data-lucide="check-square"></i><span class="ax-side-item__label">My tasks</span></span>
          <span class="ax-side-item"><i data-lucide="calendar"></i><span class="ax-side-item__label">Calendar</span></span>
          <span class="ax-side-item"><i data-lucide="bar-chart-3"></i><span class="ax-side-item__label">Reports</span></span>
          <div class="ax-sidebar__section">Projects</div>
          <span class="ax-side-item"><i data-lucide="folder"></i>${bar(96)}</span><span class="ax-side-item"><i data-lucide="folder"></i>${bar(72)}</span>
        </aside>`;
      const todo = c ? "" : `<div class="ax-kanban__col"><div class="ax-kanban__head">To do <span class="ax-badge ax-badge--neutral">3</span></div>${fillerCard("pink", 150, 96, "orange")}${fillerCard("teal", 130, 0, "blue")}${fillerCard("yellow", 160, 110, "yellow")}</div>`;
      return `<div class="ss-window" style="left:${c ? 24 : 48}px;top:${c ? 24 : 40}px;width:${c ? 472 : 944}px;height:${c ? 616 : 560}px">
        ${c ? "" : `<div class="ss-chrome"><i></i><i></i><i></i><span class="ss-chrome__url">axiom.app/tasks/sprint-14</span></div>`}
        <div style="display:flex;flex:1;min-height:0">${sidebar}
          <div style="flex:1;min-width:0;padding:${c ? "20px 20px" : "24px 28px"};display:flex;flex-direction:column;gap:20px;position:relative">
            <div style="display:flex;align-items:center;justify-content:space-between;gap:12px">
              <div><div class="t-h2-m">Sprint 14</div><div style="margin-top:6px">${bar(150)}</div></div>
              <div class="ds-row" style="gap:10px;flex-wrap:nowrap">${c ? "" : `<span class="ax-avatar-group"><span class="ax-avatar ax-avatar--sm tone-orange" style="--size:28px">M</span><span class="ax-avatar ax-avatar--sm tone-blue" style="--size:28px">J</span><span class="ax-avatar ax-avatar--sm tone-teal" style="--size:28px">D</span></span><span class="ax-btn ax-btn--sm"><i data-lucide="share-2"></i>Share</span>`}<span class="ax-btn ax-btn--primary ax-btn--sm"><i data-lucide="plus"></i>New task</span></div>
            </div>
            <div class="ax-kanban" style="grid-template-columns:repeat(${c ? 2 : 3},minmax(0,1fr));align-items:start">
              ${todo}
              <div class="ax-kanban__col" data-col="progress"><div class="ax-kanban__head">In progress <span class="ax-badge ax-badge--neutral" data-count="progress">${roll(2)}</span></div>
                <div class="ax-kcard" data-focal style="cursor:default"><span class="ax-tag tone-violet" style="align-self:flex-start">Design</span><span class="ax-kcard__title">Onboarding flow</span><div class="ax-kcard__foot"><span data-status><span class="ax-tag"><i data-lucide="clock"></i>Due today</span></span><span class="ax-avatar ax-avatar--sm tone-teal" style="--size:22px">D</span></div></div>
                ${fillerCard("blue", 140, 90, "blue")}
              </div>
              <div class="ax-kanban__col" data-col="done"><div class="ax-kanban__head">Done <span class="ax-badge ax-badge--neutral" data-count="done">${roll(2)}</span></div><div data-done-list style="display:flex;flex-direction:column;gap:8px">${fillerCard("lime", 120, 80, "yellow", true)}${fillerCard("pink", 150, 0, "orange", true)}</div></div>
            </div>
            <div class="ax-snackbar ss-snack" data-snack><i data-lucide="check-circle-2"></i><span class="ax-snackbar__msg">Moved to Done</span><span class="ax-btn ax-btn--sm" data-undo>Undo</span></div>
          </div>
        </div>
      </div>`;
    },
    async script(a) {
      const card = a.q("[data-focal]"), stage = a.stage;
      await a.wait(900);
      // 1. reach for the card, press, lift
      await a.move(card, { ox: 0.78, oy: 0.2 });
      a.kind("grab"); await a.press();
      const sr = stage.getBoundingClientRect(), cr = card.getBoundingClientRect(), k = sr.width / stage.offsetWidth;
      const h = cr.height / k, w = cr.width / k;
      const slot = document.createElement("div"); slot.className = "ss-slot"; slot.style.height = h + "px";
      card.replaceWith(slot); stage.appendChild(card);
      card.classList.add("ss-lift"); Object.assign(card.style, { left: (cr.left - sr.left) / k + "px", top: (cr.top - sr.top) / k + "px", width: w + "px" });
      card.dataset.tilt = "rotate(2deg) scale(1.03)";
      await a.anim(card, [{ transform: "none" }, { transform: card.dataset.tilt }], { duration: 180, easing: OUT });
      card.style.transform = card.dataset.tilt;
      // 2. carry it to Done: the old place closes, the new one opens and pushes the column down
      const list = a.q("[data-done-list]"); const target = document.createElement("div"); target.className = "ss-slot"; target.style.height = "0px"; target.style.borderWidth = "0"; list.prepend(target);
      const [tx, ty] = a.pos(list, 0.78, 0); const dest = [tx, ty + h * 0.2];
      const moving = a.move(dest, { carry: card, duration: 1100 });
      await a.wait(380);
      a.anim(slot, [{ height: h + "px", opacity: 1 }, { height: "0px", opacity: 0, marginBottom: "-8px" }], { duration: 320, easing: STD, fill: "forwards" });
      a.roll("[data-count=progress] .ss-roll", 1);
      await a.wait(260);
      target.style.borderWidth = ""; await a.anim(target, [{ height: "0px" }, { height: h + "px" }], { duration: 320, easing: STD, fill: "forwards" }); target.style.height = h + "px";
      await moving;
      // 3. drop into the slot
      const to = a.pos(target, 0, 0); const from = [parseFloat(card.style.left), parseFloat(card.style.top)];
      await a.anim(card, [{ transform: card.style.transform }, { transform: `translate(${to[0] - from[0]}px, ${to[1] - from[1]}px)` }], { duration: 220, easing: STD, fill: "forwards" });
      card.getAnimations().forEach((x) => x.cancel()); slot.remove(); target.replaceWith(card); card.classList.remove("ss-lift"); card.removeAttribute("style"); card.style.cursor = "default"; delete card.dataset.tilt;
      a.kind("arrow");
      a.roll("[data-count=done] .ss-roll", 3);
      await a.wait(120);
      a.swapLabel(card.querySelector("[data-status]"), `<span class="ax-tag tone-green"><i data-lucide="check"></i>Done</span>`);
      await a.move([a.pos(card)[0] + 90, a.pos(card)[1] + 120], { duration: 600 });
      a.q("[data-snack]").classList.add("is-on");
      await a.wait(420);
      a.mark("poster");
      await a.wait(2000);
      // 4. reset with a seen cause: Undo
      const undo = a.q("[data-undo]");
      await a.click(undo);
      a.q("[data-snack]").classList.remove("is-on");
      const back = a.q("[data-col=progress] .ax-kanban__head");
      const r0 = card.getBoundingClientRect(); const ghost = document.createElement("div"); ghost.className = "ss-slot"; ghost.style.cssText = "height:0px;border-width:0";
      back.after(ghost);
      a.anim(ghost, [{ height: "0px" }, { height: r0.height / k + "px" }], { duration: 420, easing: STD, fill: "forwards" });
      const p0 = a.pos(card, 0, 0); stage.appendChild(card); card.classList.add("ss-lift"); Object.assign(card.style, { left: p0[0] + "px", top: p0[1] + "px", width: w + "px" });
      const doneList = a.q("[data-done-list]");
      a.roll("[data-count=done] .ss-roll", 2); a.roll("[data-count=progress] .ss-roll", 2);
      a.swapLabel(card.querySelector("[data-status]"), `<span class="ax-tag"><i data-lucide="clock"></i>Due today</span>`);
      const p1 = a.pos(ghost, 0, 0);
      doneList.animate([{ transform: `translateY(${h + 8}px)` }, { transform: "none" }], { duration: instantDur(a, 420), easing: STD });
      await a.anim(card, [{ transform: "none" }, { transform: `translate(${p1[0] - p0[0]}px, ${p1[1] - p0[1]}px)` }], { duration: 560, easing: TRAVEL, fill: "forwards" });
      card.getAnimations().forEach((x) => x.cancel()); ghost.replaceWith(card); card.classList.remove("ss-lift"); card.removeAttribute("style"); card.style.cursor = "default";
      await a.move(this.rest(a.compact), { duration: 800 });
      await a.wait(700);
    },
  };
  const instantDur = (a, ms) => (a.instant ? 0 : ms * scale());

  /* ================= Story 2: AI finance ================= */
  const ai = {
    label: "AI finance assistant: a question about October travel spend is sent, the answer streams in with a chart and its sources.",
    W: 640, H: 520, compact: { W: 420, H: 560 },
    rest: (c) => (c ? [330, 300] : [520, 300]),
    build(c) {
      return `<div class="ss-window" style="left:${c ? 20 : 32}px;top:${c ? 20 : 32}px;width:${c ? 380 : 576}px;height:${c ? 540 : 488}px;background:var(--axiom-surface-raised)">
        <div style="display:flex;align-items:center;gap:10px;height:56px;padding:0 16px 0 20px;border-bottom:1px solid var(--axiom-line-subtle);flex:none">
          <span class="ax-logo" style="font-size:16px">AXIOM<span class="tx-3" style="font-weight:400;letter-spacing:0">Assistant</span></span><span class="ax-tag tone-blue" style="height:22px">Finance</span><span style="flex:1"></span>
          <span class="ax-btn ax-btn--ghost ax-btn--sm" data-new><i data-lucide="square-pen"></i>New chat</span>
        </div>
        <div style="position:relative;flex:1;min-height:0;overflow:hidden" data-pane><div class="ss-thread" data-thread>
          <div class="ax-msg ax-msg--in" style="max-width:88%"><span class="ax-avatar" style="--size:28px;background:var(--axiom-surface-selected);color:var(--axiom-text-link)"><i data-lucide="message-square-text" style="width:16px;height:16px"></i></span><div class="ax-msg__stack"><div class="ax-bubble">Hi Dana — your October summary is ready. Ask me anything about where the money went.</div></div></div>
          <div class="ss-collapse" data-chips><div><div class="ds-row" style="gap:8px;padding-left:36px"><span class="ax-chip" style="height:30px;font-size:14px">Biggest expense</span><span class="ax-chip" style="height:30px;font-size:14px">Compare to September</span></div></div></div>
        </div></div>
        <div style="padding:12px 16px 16px;flex:none"><div class="ax-composer" data-composer><span class="ax-btn ax-btn--ghost ax-btn--sm ax-btn--icon"><i data-lucide="paperclip"></i></span><span class="ss-composer-text" data-text data-ph="Ask about your money"></span><span class="ax-btn ax-btn--primary ax-btn--sm ax-btn--icon" data-send aria-disabled="true"><i data-lucide="arrow-up"></i></span></div></div>
      </div>`;
    },
    async script(a) {
      const thread = a.q("[data-thread]"), pane = a.q("[data-pane]"), text = a.q("[data-text]"), send = a.q("[data-send]");
      const follow = async () => { const over = thread.scrollHeight - pane.clientHeight; const cur = thread._y || 0; const y = Math.max(0, over); if (y !== cur) { await a.anim(thread, [{ transform: `translateY(${-cur}px)` }, { transform: `translateY(${-y}px)` }], { duration: 420, easing: STD, fill: "forwards" }); thread.style.transform = `translateY(${-y}px)`; thread.getAnimations().forEach((x) => x.cancel()); thread._y = y; } };
      await a.wait(800);
      // 1. type the question
      await a.move(text, { ox: 0.3 }); a.kind("text"); await a.press();
      a.q("[data-composer]").style.borderColor = "var(--axiom-line-focus)"; text.classList.add("is-typing");
      await a.type(text, "How much did I spend on travel in October?", a.instant ? 1000 : 24);
      send.removeAttribute("aria-disabled");
      // 2. send
      a.kind("arrow"); await a.click(send);
      const q = text.textContent; text.textContent = ""; text.classList.remove("is-typing"); send.setAttribute("aria-disabled", "true"); a.q("[data-composer]").style.borderColor = "";
      a.q("[data-chips]").classList.add("is-closed");
      thread.insertAdjacentHTML("beforeend", `<div class="ax-msg ax-msg--out"><div class="ax-msg__stack"><div class="ax-bubble is-new">${q}</div></div></div>`);
      a.move(a.compact ? [340, 250] : [560, 250], { duration: 700 });
      await a.wait(380);
      // 3. thinking, then the answer streams with its height
      thread.insertAdjacentHTML("beforeend", `<div class="ax-msg ax-msg--in" style="max-width:88%" data-answer><span class="ax-avatar" style="--size:28px;background:var(--axiom-surface-selected);color:var(--axiom-text-link)"><i data-lucide="message-square-text" style="width:16px;height:16px"></i></span><div class="ax-msg__stack" style="gap:8px"><div class="ax-bubble is-new" data-bubble><span class="ss-think"><span class="ax-spinner ax-spinner--sm"></span><span class="ss-shimmer">Reading 42 transactions…</span></span></div></div></div>`);
      if (window.Axiom) Axiom.icons(thread);
      await follow(); await a.wait(1400);
      const bubble = a.q("[data-bubble]"); bubble.innerHTML = ""; const span = document.createElement("span"); bubble.appendChild(span);
      const words = ["You", "spent", "<b>$1,284</b>", "on", "travel", "in", "October", "—", "32%", "more", "than", "September.", "Most", "of", "it", "was", "the", "Lisbon", "offsite."];
      for (const w of words) { span.innerHTML += (span.innerHTML ? " " : "") + w; await a.wait(55); }
      // 4. the chart that backs it, then sources
      const stack = a.q("[data-answer] .ax-msg__stack");
      stack.insertAdjacentHTML("beforeend", `<div class="ax-card ax-card--outlined is-new ax-bubble" style="background:var(--axiom-surface-raised);padding:14px 16px;gap:8px;border-radius:16px;width:${a.compact ? 280 : 320}px" data-chart>
        <div class="ds-row" style="justify-content:space-between"><span class="t-caption tx-2">Travel · last 4 months</span><span class="t-caption-strong tx-pos">+32%</span></div>
        <div class="ax-bars" data-reveal style="height:96px;gap:10px"><div class="ax-bar" style="--i:0"><div class="ax-bar__fill" style="--v:46%"></div><span class="ax-bar__label">Jul</span></div><div class="ax-bar" style="--i:1"><div class="ax-bar__fill" style="--v:66%"></div><span class="ax-bar__label">Aug</span></div><div class="ax-bar" style="--i:2"><div class="ax-bar__fill" style="--v:70%"></div><span class="ax-bar__label">Sep</span></div><div class="ax-bar ax-bar--accent" style="--i:3"><div class="ax-bar__fill" style="--v:94%"></div><span class="ax-bar__label">Oct</span></div></div>
      </div>`);
      await follow();
      await a.wait(120); a.q("[data-chart] .ax-bars").classList.add("is-revealed");
      await a.wait(700);
      stack.insertAdjacentHTML("beforeend", `<div class="ds-row is-new ax-bubble" style="gap:6px;background:none;padding:0"><span class="ax-tag ax-tag--subtle"><i data-lucide="receipt"></i>3 receipts</span><span class="ax-tag ax-tag--subtle"><i data-lucide="landmark"></i>Bank · Oct</span></div>`);
      if (window.Axiom) Axiom.icons(stack);
      await follow();
      await a.wait(300);
      a.mark("poster");
      await a.wait(2200);
      // 5. reset with a seen cause: New chat
      await a.click("[data-new]");
      await a.anim(thread, [{ opacity: 1 }, { opacity: 0, filter: "blur(2px)" }], { duration: 240, easing: "ease", fill: "forwards" });
      await a.move(this.rest(a.compact), { duration: 700 });
      await a.wait(200);
    },
  };

  /* ================= Story 3: Sign-in code ================= */
  const code = {
    label: "Two-step sign-in: a wrong digit shows an error under the code, fixing the digit clears it and the button confirms Verified.",
    W: 480, H: 520,
    rest: () => [380, 470],
    build() {
      const cells = [0, 1, 2, 3, 4, 5].map((i) => `<div class="ax-code__cell ss-cell" data-cell="${i}"></div>${i === 2 ? '<span class="ax-code__sep"></span>' : ""}`).join("");
      return `<div class="ss-window" style="left:30px;top:36px;width:420px;height:520px;background:var(--axiom-surface-raised);padding:32px;gap:0">
        <span class="ax-logo" style="font-size:16px">AXIOM</span>
        <div style="margin-top:32px" class="t-h3">Check your phone</div>
        <div class="t-body tx-2" style="margin-top:6px">We sent a 6-digit code to •••• 0123.</div>
        <div class="ax-code" data-code style="margin-top:24px">${cells}</div>
        <div style="margin-top:8px;min-height:16px" data-help-wrap><span class="ax-help" data-help>Enter the code to continue.</span></div>
        <span class="ax-btn ax-btn--primary ax-btn--lg ax-btn--block" data-verify style="margin-top:24px"><span data-label>Verify</span></span>
        <div class="ds-row" style="justify-content:space-between;margin-top:16px"><span class="ax-link t-body" data-resend>Resend code</span>${bar(64)}</div>
      </div>`;
    },
    async script(a) {
      const cells = $$("[data-cell]", a.stage), group = a.q("[data-code]"), help = a.q("[data-help]");
      const setHelp = (cls, html) => { help.className = "ax-help " + cls; help.innerHTML = html; if (window.Axiom) Axiom.icons(help); a.anim(help, [{ opacity: 0, transform: "translateY(-4px)" }, { opacity: 1, transform: "none" }], { duration: 220, easing: OUT }); };
      const typeDigits = async (from, digits) => { for (let i = 0; i < digits.length; i++) { const c = cells[from + i]; cells.forEach((x) => x.classList.remove("is-focus")); c.textContent = digits[i]; a.anim(c, [{ transform: "scale(0.92)" }, { transform: "none" }], { duration: 160, easing: OUT }); const n = cells[from + i + 1]; if (n) n.classList.add("is-focus"); await a.wait(150); } cells.forEach((x) => x.classList.remove("is-focus")); };
      await a.wait(700);
      // 1. type a code with one wrong digit
      await a.click(cells[0]); cells[0].classList.add("is-focus");
      await a.move([a.pos(cells[2])[0] + 30, a.pos(cells[0])[1] + 60], { duration: 500 });
      await typeDigits(0, "482917");
      // 2. the error lands on the field that caused it
      group.classList.add("is-error");
      a.anim(group, [{ transform: "translateX(0)" }, { transform: "translateX(-4px)" }, { transform: "translateX(4px)" }, { transform: "translateX(-2px)" }, { transform: "none" }], { duration: 300, easing: STD });
      setHelp("ax-help--error", `<i data-lucide="alert-circle"></i>That code didn't match. Check the last digit.`);
      await a.wait(1100);
      // 3. fixing it clears the error
      await a.click(cells[5]); cells[5].textContent = ""; cells[5].classList.add("is-focus");
      group.classList.remove("is-error"); setHelp("", "Enter the code to continue.");
      await a.wait(260);
      cells[5].textContent = "3"; cells[5].classList.remove("is-focus"); a.anim(cells[5], [{ transform: "scale(0.92)" }, { transform: "none" }], { duration: 160, easing: OUT });
      await a.wait(120);
      group.classList.add("is-success"); setHelp("ax-help--success", `<i data-lucide="check-circle-2"></i>Code accepted`);
      // 4. the button confirms on itself
      await a.click("[data-verify]", { ox: 0.62 });
      const label = a.q("[data-label]");
      await a.swapLabel(label, `<span class="ds-row" style="gap:8px"><span class="ax-spinner ax-spinner--sm" style="border-color:rgb(30 30 30 / .2);border-top-color:#1E1E1E"></span>Verifying…</span>`);
      await a.wait(900);
      await a.swapLabel(label, `<span class="ds-row" style="gap:8px"><i data-lucide="check" style="width:22px;height:22px"></i>Verified</span>`);
      a.move(this.rest(), { duration: 700 });
      await a.wait(200);
      a.mark("poster");
      await a.wait(2200);
      // 5. reset with a seen cause: Resend code
      await a.click("[data-resend]", { ox: 0.4 });
      group.classList.remove("is-success");
      for (let i = 5; i >= 0; i--) { cells[i].textContent = ""; await a.wait(60); }
      setHelp("", `New code sent.`);
      a.swapLabel(label, "Verify");
      await a.move(this.rest(), { duration: 600 });
      await a.wait(900);
    },
  };

  function boot() {
    const k = document.getElementById("story-kanban"), i = document.getElementById("story-ai"), c = document.getElementById("story-code");
    if (k) new Stage(k, kanban); if (i) new Stage(i, ai); if (c) new Stage(c, code);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();
