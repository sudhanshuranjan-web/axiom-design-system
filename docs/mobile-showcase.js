/* Mobile showcase: one product (AXIOM, an issue tracker) shown across every
   phone, so the patterns read as one coherent app. Builds rows from one
   dataset, adds phone chrome, and wires showcase-only reactions.
   Runs before showcase.js (icons, snippets) and axiom.js / axiom-mobile.js. */
(function () {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  /* ---------- Linear-style status and priority glyphs ---------- */
  const STATUS = {
    backlog: { label: "Backlog", svg: '<svg viewBox="0 0 14 14" width="14" height="14" aria-hidden="true"><circle cx="7" cy="7" r="5.5" fill="none" stroke="var(--axiom-text-tertiary)" stroke-width="1.5" stroke-dasharray="2 2"/></svg>' },
    todo: { label: "Todo", svg: '<svg viewBox="0 0 14 14" width="14" height="14" aria-hidden="true"><circle cx="7" cy="7" r="5.5" fill="none" stroke="var(--axiom-text-secondary)" stroke-width="1.5"/></svg>' },
    progress: { label: "In progress", svg: '<svg viewBox="0 0 14 14" width="14" height="14" aria-hidden="true"><circle cx="7" cy="7" r="5.5" fill="none" stroke="var(--ax-chart-4)" stroke-width="1.5"/><path d="M7 3.5a3.5 3.5 0 0 1 0 7z" fill="var(--ax-chart-4)"/></svg>' },
    review: { label: "In review", svg: '<svg viewBox="0 0 14 14" width="14" height="14" aria-hidden="true"><circle cx="7" cy="7" r="5.5" fill="none" stroke="var(--ax-chart-2)" stroke-width="1.5"/><path d="M7 3.5a3.5 3.5 0 1 1-3.03 1.75L7 7z" fill="var(--ax-chart-2)"/></svg>' },
    done: { label: "Done", svg: '<svg viewBox="0 0 14 14" width="14" height="14" aria-hidden="true"><circle cx="7" cy="7" r="6" fill="var(--axiom-action-primary)"/><path d="M4.5 7.2l1.7 1.7 3.4-3.6" fill="none" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>' },
  };
  const PRIORITY = {
    urgent: { label: "Urgent", svg: '<svg viewBox="0 0 14 14" width="14" height="14" aria-hidden="true"><rect x="1" y="1" width="12" height="12" rx="3" fill="var(--axiom-status-negative)"/><path d="M7 3.8v4M7 10h0" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/></svg>' },
    high: { label: "High", svg: '<svg viewBox="0 0 14 14" width="14" height="14" aria-hidden="true"><rect x="1.5" y="8" width="2.6" height="4" rx="1" fill="var(--axiom-text-secondary)"/><rect x="5.7" y="5" width="2.6" height="7" rx="1" fill="var(--axiom-text-secondary)"/><rect x="9.9" y="2" width="2.6" height="10" rx="1" fill="var(--axiom-text-secondary)"/></svg>' },
    medium: { label: "Medium", svg: '<svg viewBox="0 0 14 14" width="14" height="14" aria-hidden="true"><rect x="1.5" y="8" width="2.6" height="4" rx="1" fill="var(--axiom-text-secondary)"/><rect x="5.7" y="5" width="2.6" height="7" rx="1" fill="var(--axiom-text-secondary)"/><rect x="9.9" y="2" width="2.6" height="10" rx="1" fill="var(--axiom-surface-track)"/></svg>' },
    low: { label: "Low", svg: '<svg viewBox="0 0 14 14" width="14" height="14" aria-hidden="true"><rect x="1.5" y="8" width="2.6" height="4" rx="1" fill="var(--axiom-text-secondary)"/><rect x="5.7" y="5" width="2.6" height="7" rx="1" fill="var(--axiom-surface-track)"/><rect x="9.9" y="2" width="2.6" height="10" rx="1" fill="var(--axiom-surface-track)"/></svg>' },
  };
  const PEOPLE = { D: ["Dana Whitfield", "teal"], M: ["Mara Okafor", "orange"], J: ["Jonas Berg", "blue"], A: ["Ana Ruiz", "yellow"] };
  const ISSUES = [
    { id: "AX-142", title: "Polish onboarding flow", status: "progress", priority: "high", who: "D", project: "Mobile app 1.0", label: "Design" },
    { id: "AX-139", title: "Sheet detents feel sticky on Android", status: "progress", priority: "urgent", who: "M", project: "Mobile app 1.0", label: "Bug" },
    { id: "AX-158", title: "Swipe actions need a visible fallback", status: "review", priority: "medium", who: "J", project: "Design system", label: "A11y" },
    { id: "AX-151", title: "Keyboard shortcuts in command palette", status: "todo", priority: "medium", who: "J", project: "Design system", label: "Feature" },
    { id: "AX-148", title: "Dark mode contrast in charts", status: "todo", priority: "high", who: "D", project: "Design system", label: "Design" },
    { id: "AX-155", title: "Empty state for projects", status: "todo", priority: "low", who: "A", project: "Mobile app 1.0", label: "Design" },
    { id: "AX-120", title: "Migrate tokens to v1.1", status: "backlog", priority: "medium", who: "M", project: "Design system", label: "Chore" },
    { id: "AX-117", title: "Offline drafts for comments", status: "backlog", priority: "low", who: "A", project: "Mobile app 1.0", label: "Feature" },
  ];
  const INBOX = [
    { who: "M", text: "assigned you", issue: "AX-139", title: "Sheet detents feel sticky on Android", time: "2m", unread: true },
    { who: "J", text: "commented on", issue: "AX-142", title: "Looks great. Ship it after the copy pass.", time: "18m", unread: true },
    { who: "A", text: "mentioned you in", issue: "AX-155", title: "Can you check the empty state copy?", time: "1h", unread: true },
    { who: "D", text: "moved to Done", issue: "AX-160", title: "Snackbar overlaps the tab bar", time: "3h", unread: false },
    { who: "J", text: "changed priority on", issue: "AX-148", title: "Dark mode contrast in charts", time: "Yesterday", unread: false },
    { who: "M", text: "created", issue: "AX-161", title: "Haptics on long press", time: "Yesterday", unread: false },
  ];
  const av = (k, size = 22) => `<span class="ax-avatar tone-${PEOPLE[k][1]}" style="--size:${size}px" title="${PEOPLE[k][0]}">${k}</span>`;
  const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  function issueRow(it, push) {
    return `<button class="ax-mrow ax-issue" type="button" ${push ? `data-ax-push="${push}" data-issue="${it.id}"` : ""} data-ax-search-item style="--sep:44px">
      <span class="ax-issue__status" aria-label="${STATUS[it.status].label}">${STATUS[it.status].svg}</span>
      <span class="ax-mrow__text"><span class="ax-issue__meta">${it.id}</span><span class="ax-mrow__title">${esc(it.title)}</span></span>
      <span class="ax-issue__pri" aria-label="Priority ${PRIORITY[it.priority].label}">${PRIORITY[it.priority].svg}</span>${av(it.who)}
    </button>`;
  }
  function groups(push) {
    return ["progress", "review", "todo", "backlog"].map((st) => {
      const list = ISSUES.filter((i) => i.status === st); if (!list.length) return "";
      return `<div class="ax-issue-group"><div class="ax-issue-group__head">${STATUS[st].svg}<span>${STATUS[st].label}</span><span class="tx-3">${list.length}</span></div><div class="ax-mlist ax-mlist--flush">${list.map((i) => issueRow(i, push)).join("")}</div></div>`;
    }).join("");
  }
  function inboxRow(n, i) {
    const p = PEOPLE[n.who];
    return `<div class="ax-swipe">
      <div class="ax-swipe__actions"><button class="ax-swipe__action ax-swipe__action--archive" type="button" data-action="archive"><i data-lucide="archive"></i>Archive</button><button class="ax-swipe__action ax-swipe__action--flag" type="button" data-action="flag"><i data-lucide="flag"></i>Flag</button></div>
      <div class="ax-swipe__content"><div class="ax-mrow ax-inbox-row" tabindex="0" data-ax-longpress data-menu="m-ctx-menu" style="--sep:56px">
        ${n.unread ? '<span class="ax-unread" aria-label="Unread"></span>' : '<span style="width:10px;flex:none"></span>'}${av(n.who, 32)}
        <span class="ax-mrow__text"><span class="ax-mrow__title"><b style="font-weight:var(--ax-w-strong)">${p[0].split(" ")[0]}</b> ${n.text} <span class="t-code tx-3" style="font-size:12px">${n.issue}</span></span><span class="ax-mrow__sub">${esc(n.title)}</span></span>
        <span class="ax-mrow__meta">${n.time}</span>
        <button class="ax-icon-btn ax-inbox-more" type="button" data-ax-ctx-open aria-label="More actions" style="width:32px;height:32px;margin-right:-8px;color:var(--axiom-text-tertiary)"><i data-lucide="more-horizontal"></i></button>
      </div></div></div>`;
  }
  const PROJECTS = [["Mobile app 1.0", 68, 1, "Ships Dec 12", "rocket"], ["Design system", 82, 2, "Ships Dec 5", "component"], ["Billing revamp", 34, 4, "Ships Jan 20", "credit-card"]];
  function projectCards() {
    return PROJECTS.map(([n, p, c, d, ic]) => `<div class="ax-card ax-project-card"><div class="ds-row" style="justify-content:space-between"><span class="ax-mrow__icon" style="background:color-mix(in srgb,var(--ax-chart-${c}) 16%,transparent);color:var(--ax-chart-${c})"><i data-lucide="${ic}"></i></span><span class="ax-tag">${d}</span></div><b class="t-label" style="font-size:16px">${n}</b><div class="ax-meter"><div class="ax-meter__track"><div class="ax-meter__fill" style="--v:${p / 100};background:var(--ax-chart-${c})"></div></div><span class="t-caption tx-3">${p}% · ${Math.round(p / 6)} of 16 issues done</span></div></div>`).join("");
  }

  /* ---------- Fill the phones ---------- */
  $$("[data-fill]").forEach((el) => {
    const f = el.dataset.fill;
    if (f === "issues") el.innerHTML = groups(el.dataset.push);
    if (f === "inbox") el.innerHTML = INBOX.map(inboxRow).join("");
    if (f === "projects") el.innerHTML = projectCards();
    if (f === "search-items") el.innerHTML = ISSUES.map((i) => issueRow(i)).join("");
  });

  /* ---------- Phone chrome (status bar, island, home indicator) and scale ---------- */
  $$(".ds-phone__screen").forEach((s) => {
    s.insertAdjacentHTML("afterbegin", `<div class="ds-phone__status" aria-hidden="true"><span>9:41</span><span class="ds-phone__sys"><i data-lucide="signal"></i><i data-lucide="wifi"></i><i data-lucide="battery-full"></i></span></div><div class="ds-phone__island" aria-hidden="true"></div>`);
    s.insertAdjacentHTML("beforeend", `<div class="ds-phone__home" aria-hidden="true"></div>`);
  });
  const fit = () => $$(".ds-phone-wrap").forEach((w) => { const avail = w.parentElement.clientWidth; w.style.setProperty("--s", Math.min(0.74, avail / 406).toFixed(3)); });
  new ResizeObserver(fit).observe(document.body); fit();

  /* ---------- Showcase reactions ---------- */
  document.addEventListener("axiom:refresh", (e) => {
    const list = $(".ax-ptr__body [data-fill=inbox]", e.target) || $("[data-fill=inbox]", e.target); if (!list) return;
    const n = { who: "A", text: "commented on", issue: "AX-158", title: "Added a visible Archive button as the fallback.", time: "now", unread: true };
    list.insertAdjacentHTML("afterbegin", inboxRow(n)); const row = list.firstElementChild; row.classList.add("is-new-row");
    row.animate([{ opacity: 0, transform: "translateY(-10px)" }, { opacity: 1, transform: "none" }], { duration: 360, easing: "cubic-bezier(0.25,1,0.5,1)" });
    window.Axiom && Axiom.icons(row); window.AxiomMobile && AxiomMobile.init(row.parentElement);
    AxiomMobile.snack(row.closest(".ax-screen"), "1 new notification", { icon: "bell" });
  });
  // push: fill the detail page from the tapped issue
  document.addEventListener("axiom:push", (e) => {
    const t = e.detail.trigger, page = e.detail.page; const id = t && t.dataset.issue; if (!id) return;
    const it = ISSUES.find((x) => x.id === id) || ISSUES[0];
    $("[data-d=id]", page).textContent = it.id; $("[data-d=title]", page).textContent = it.title;
    $("[data-d=status]", page).innerHTML = STATUS[it.status].svg + STATUS[it.status].label;
    $("[data-d=priority]", page).innerHTML = PRIORITY[it.priority].svg + PRIORITY[it.priority].label;
    $("[data-d=who]", page).innerHTML = av(it.who, 20) + PEOPLE[it.who][0];
    $("[data-d=project]", page).textContent = it.project; $("[data-d=label]", page).textContent = it.label;
    $("[data-d=topid]", page).textContent = it.id;
  });
  // status sheet: pick a status, update the chip, close, confirm
  document.addEventListener("click", (e) => {
    const opt = e.target.closest("[data-set-status]"); if (!opt) return;
    const st = opt.dataset.setStatus, screen = opt.closest(".ax-screen");
    $$("[data-set-status]", screen).forEach((o) => o.setAttribute("aria-checked", o === opt));
    $$("[data-status-chip]", screen).forEach((c) => (c.innerHTML = STATUS[st].svg + STATUS[st].label));
    AxiomMobile.closeSheet(opt.closest(".ax-msheet-layer"));
    AxiomMobile.snack(screen, `Status set to ${STATUS[st].label}`, { icon: "circle-check", action: "Undo", duration: 3500 });
    e.preventDefault();
  });
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-m-create]"); if (!b) return;
    const screen = b.closest(".ax-screen"); const title = $("#m-new-title", screen).value.trim();
    if (!title) { const c = $("#m-new-title", screen).closest(".ax-control"); c.classList.add("is-error"); c.classList.remove("is-nudge"); void c.offsetWidth; c.classList.add("is-nudge"); $("#m-new-help", screen).hidden = false; $("#m-new-title", screen).focus(); return; }
    document.activeElement.blur(); AxiomMobile.snack(screen, `Created AX-162 “${title}”`, { icon: "circle-check" });
  });
  document.addEventListener("input", (e) => { if (e.target.id === "m-new-title") { e.target.closest(".ax-control").classList.remove("is-error"); const h = $("#m-new-help", e.target.closest(".ax-screen")); if (h) h.hidden = true; } });
  window.AxiomShowcaseData = { STATUS, PRIORITY, ISSUES };
})();
