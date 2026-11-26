/* Examples: AtomGo's ERP screens rebuilt with AXIOM components, and the charts
   enterprise software leans on. Everything is generated from small datasets
   into AXIOM markup, then axiom.js wires it like any other component.
   Runs before showcase.js (icons) and axiom.js (behaviour). */
(function () {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const I = (n, s = 16) => `<i data-lucide="${n}" style="width:${s}px;height:${s}px"></i>`;
  const inr = (n) => "₹" + n.toLocaleString("en-IN");
  const TONE = { Active: "tone-green", "At risk": "tone-orange", "On hold": "", Completed: "tone-blue", Paid: "tone-green", Overdue: "tone-red", Draft: "" };
  const tag = (s) => `<span class="ax-tag ${TONE[s] ?? ""}"><span class="ax-tag__dot"></span>${s}</span>`;
  const av = (i, t = "teal", size = 24) => `<span class="ax-avatar tone-${t}" style="--size:${size}px">${i}</span>`;

  /* ---------- Shared shell ---------- */
  const NAV = [
    [null, [["Overview", "chart-line"], ["Reports", "chart-column"]]],
    ["Inventory", [["Products", "package"], ["Warehouses", "warehouse"], ["Transfers", "arrow-left-right", 2], ["Stock counts", "clipboard-list", 1], ["Reorder", "refresh-cw", 4]]],
    ["Sales", [["Orders", "tag", 1], ["Invoices", "receipt"]]],
    ["Work", [["Projects", "folder-kanban"], ["Tasks", "list-checks", 6]]],
    ["Directory", [["Parties", "users"], ["Audit log", "history"], ["Settings", "settings"]]],
  ];
  const sidebar = (active) => `<aside class="ax-shell__sidebar">
    <div class="ax-sidebar__head" style="height:40px;margin:0 0 6px;padding:0 6px"><span class="ax-logo" style="font-size:16px">AXIOM</span><span class="t-mono-micro">KT-01</span></div>
    ${NAV.map(([g, items]) => (g ? `<div class="ax-sidebar__section">${g}</div>` : "") + items.map(([n, ic, c]) => `<span class="ax-side-item" ${n === active ? 'aria-current="page"' : ""}>${I(ic)}<span class="ax-side-item__label">${n}</span>${c ? `<span class="t-mono-micro">${c}</span>` : ""}</span>`).join("")).join("")}
    <div class="ax-sidebar__profile" style="margin-top:auto">${av("RK", "teal", 28)}<div style="min-width:0"><div class="t-label">Riya Kapoor</div><div class="t-caption tx-3">Kestrel Traders</div></div></div>
  </aside>`;
  const topbar = (crumbs) => `<header class="ax-shell__topbar"><nav class="ax-crumbs" aria-label="Breadcrumb">${crumbs.map((c, i) => `<span class="ax-crumb" ${i === crumbs.length - 1 ? 'aria-current="page"' : ""}>${c}</span>`).join("/")}</nav><span style="flex:1"></span><label class="ax-control ax-search ax-search--md" style="width:240px"><i data-lucide="search"></i><input class="ax-input" placeholder="Search or jump to" aria-label="Search"><span class="ax-kbd">⌘K</span></label><button class="ax-btn ax-btn--ghost ax-btn--icon" type="button" aria-label="Notifications">${I("bell")}</button></header>`;
  const shell = (active, crumbs, page) => `<div class="ax-shell">${sidebar(active)}<div class="ax-shell__main">${topbar(crumbs)}<div class="ax-shell__page">${page}</div></div></div>`;
  const header = (title, sub, actions, crumb) => `<div class="ax-page-header">${crumb ? `<span class="t-caption tx-3">${crumb}</span>` : ""}<div class="ax-page-header__row"><div><h4 class="t-h1" style="margin:0">${title}</h4>${sub ? `<p class="t-body tx-2" style="margin:4px 0 0">${sub}</p>` : ""}</div><div class="ax-page-header__actions">${actions}</div></div></div>`;
  const meter = (v, c = 1) => `<div class="ax-meter" data-reveal><div class="ax-meter__track"><div class="ax-meter__fill" style="--v:${v};background:var(--ax-chart-${c})"></div></div></div>`;

  const PROJECTS = [
    ["Website redesign", "PRJ-104", "Lumen Health", "RK", "Riya Kapoor", "teal", "Active", 480000, 65, "14 Nov"],
    ["Mobile onboarding flow", "PRJ-103", "Fernway Bank", "AM", "Arjun Mehta", "orange", "At risk", 260000, 93, "9 Oct"],
    ["Brand refresh", "PRJ-102", "Kestrel Coffee", "SQ", "Sana Qureshi", "violet", "Active", 180000, 36, "1 Dec"],
    ["Analytics dashboard", "PRJ-101", "Orbit Logistics", "VI", "Vikram Iyer", "blue", "On hold", 350000, 28, "20 Jan 2027"],
    ["Help centre content", "PRJ-099", "Lumen Health", "NJ", "Neha Joshi", "yellow", "Completed", 90000, 96, "18 Sep"],
    ["Warehouse barcode rollout", "PRJ-098", "Kestrel Traders", "RK", "Riya Kapoor", "teal", "Active", 620000, 51, "28 Nov"],
  ];

  /* ---------- Screen 1: Home ---------- */
  const home = () => shell("Overview", ["Workspace", "Home"], `
    ${header("Home", "Good morning, Riya. 6 things need you today.", `<button class="ax-btn" type="button">${I("calendar")}1 Oct – 5 Oct${I("chevron-down", 14)}</button><button class="ax-btn ax-btn--primary" type="button">${I("plus")}New project</button>`)}
    <div class="ax-card ax-card--outlined" style="gap:10px">
      <div class="ax-card__head"><div><b class="t-label">Set up your workspace</b><div class="t-caption tx-3">Four steps to your first invoice.</div></div><button class="ax-btn ax-btn--ghost ax-btn--sm ax-btn--icon" type="button" aria-label="Dismiss">${I("x")}</button></div>
      <div class="ax-progress"><div class="ax-progress__fill" style="--v:.5"></div></div><span class="t-caption tx-2">2 of 4 done</span>
      <div class="ex-steps">
        ${[["Name your workspace", 1], ["Create a project", 1], ["Invite your team", 0, "Everyone gets their own sign-in, so every change has a name on it."], ["Add a client", 0]].map(([t, d, open]) => `<div class="ex-step ${open ? "is-open" : ""}"><label class="ax-check"><input type="checkbox" ${d ? "checked" : ""}><span class="ax-check__box"><svg viewBox="0 0 14 14"><path d="M2.5 7.5l3 3 6-7" pathLength="1"/></svg></span>${t}</label>${open ? `<p class="t-body tx-2" style="margin:6px 0 8px 36px">${open}</p><button class="ax-btn ax-btn--primary ax-btn--sm" type="button" style="margin-left:36px">Invite people</button>` : ""}</div>`).join("")}
      </div>
    </div>
    <div class="ax-card ax-card--outlined ex-kpis">
      ${[["Tasks due this week", "list-checks", 1, "38", ".14", "24 done · 3 overdue"], ["Waiting for approval", "hourglass", 4, "7", ".57", "Designs 4 · Estimates 3"], ["Projects at risk", "circle-alert", 6, "3", ".37", "of 8 projects"], ["Unpaid invoices", "indian-rupee", 2, "₹2,84,000", ".7", "Due ₹2L · Overdue ₹88,000"]].map(([l, ic, c, v, m, cap]) => `<div class="ex-kpi"><div class="ds-row" style="gap:8px"><span class="ex-kpi__icon" style="color:var(--ax-chart-${c});background:color-mix(in srgb,var(--ax-chart-${c}) 12%,transparent)">${I(ic)}</span><span class="t-body tx-2">${l}</span></div><span class="t-display ax-num">${v}</span>${meter(m, c)}<span class="t-caption tx-3">${cap}</span></div>`).join("")}
    </div>
    <div class="ax-shell__split" style="grid-template-columns:minmax(0,1fr) 380px;margin-top:16px">
      <section><h5 class="t-h3" style="margin:0">Needs you today</h5><p class="t-caption tx-3" style="margin:2px 0 12px">6 items in two groups, the most urgent first</p>
        <div class="ax-card ax-card--outlined" style="padding:0;gap:0;overflow:hidden">
          <div class="ex-group-head"><span class="ex-kpi__icon" style="color:var(--ax-chart-4);background:color-mix(in srgb,var(--ax-chart-4) 12%,transparent)">${I("stamp")}</span><b class="t-label">To approve</b><span class="t-mono-micro">3</span><span style="flex:1"></span><a class="ax-link t-caption">All approvals</a></div>
          ${[["SQ", "violet", "Homepage hero, round 3", "PRJ-104", "Sana Qureshi · 4 files", "Due today", "Lumen Health", 1], ["AM", "orange", "Estimate for phase 2", "EST-031", "Arjun Mehta", "₹1,20,000", "Fernway Bank", 0], ["NJ", "yellow", "Help centre article set", "PRJ-099", "Neha Joshi · 12 articles", "Tomorrow", "Lumen Health", 0]].map(([i, t, ti, code, sub, right, client, urgent]) => `<div class="ax-row" style="border-radius:0;border-top:1px solid var(--axiom-line-subtle)">${av(i, t, 28)}<span class="ax-row__text"><span class="ax-row__title">${ti} <span class="t-mono-id" style="margin-left:6px">${code}</span></span><span class="ax-row__desc">${sub}</span></span><span style="text-align:right"><span class="t-body ax-num" style="display:block;${urgent ? "color:var(--axiom-text-negative)" : ""}">${right}</span><span class="t-caption tx-3">${client}</span></span>${I("chevron-right")}</div>`).join("")}
        </div></section>
      <aside><h5 class="t-h3" style="margin:0">This month</h5><p class="t-caption tx-3" style="margin:2px 0 12px">Money in and work done</p>
        <div class="ax-card ax-card--outlined" style="gap:6px"><div class="ds-row" style="gap:10px"><span class="ex-kpi__icon" style="color:var(--ax-chart-1);background:color-mix(in srgb,var(--ax-chart-1) 12%,transparent)">${I("trending-up")}</span><div><b class="t-label">Revenue</b><div class="t-caption tx-3">Last 30 days</div></div></div>
          <div class="ds-row" style="gap:8px;margin-top:6px"><span class="t-display ax-num">₹65,313</span><span class="ax-tag tone-green">${I("arrow-up", 12)}6.4%</span></div><span class="t-caption tx-2">Invoiced, all clients</span>
          ${area([42, 48, 45, 52, 50, 58, 55, 61, 59, 66, 63, 70], 340, 110)}
          <a class="ax-link t-caption" style="margin-top:4px">All invoices →</a></div></aside>
    </div>`);

  /* ---------- Screen 2: Projects list ---------- */
  const list = () => shell("Projects", ["Workspace", "Projects"], `
    ${header("Projects", "", `<button class="ax-btn" type="button">${I("upload")}Import projects</button><button class="ax-btn ax-btn--primary" type="button">${I("plus")}New project</button>`, "Workspace")}
    <div class="ds-row" style="gap:8px;flex-wrap:nowrap">
      <div class="ax-segmented ax-segmented--sm" style="flex:none">${[["All", 8], ["Active", 3], ["At risk", 1], ["On hold", 2], ["Completed", 2]].map(([l, n], i) => `<button type="button" aria-checked="${!i}">${l} <span class="t-mono-micro" style="margin-left:2px">${n}</span></button>`).join("")}</div>
      <label class="ax-control ax-search ax-search--md" style="width:260px"><i data-lucide="search"></i><input class="ax-input" placeholder="Name, code or client" aria-label="Search projects"></label>
      <button class="ax-btn" type="button">${I("list-filter")}Filter</button><span style="flex:1"></span><span class="t-caption tx-3">8 projects</span>
    </div>
    <div class="ax-table-wrap" data-ax-table>
      <table class="ax-table"><thead><tr>
        <th style="width:44px"><div class="ax-th"><label class="ax-check"><input type="checkbox" aria-label="Select all"><span class="ax-check__box"><svg viewBox="0 0 14 14"><path d="M2.5 7.5l3 3 6-7" pathLength="1"/></svg></span></label></div></th>
        <th><div class="ax-th"><button class="ax-sort" type="button">Project<i data-lucide="arrow-up"></i></button></div></th><th><div class="ax-th">Client</div></th><th><div class="ax-th">Owner</div></th><th><div class="ax-th">Status</div></th>
        <th class="is-num"><div class="ax-th"><button class="ax-sort" type="button">Budget<i data-lucide="arrow-up"></i></button></div></th><th class="is-num"><div class="ax-th"><button class="ax-sort" type="button" aria-sort="ascending">Due<i data-lucide="arrow-up"></i></button></div></th>
      </tr></thead><tbody>
        ${PROJECTS.map(([n, code, client, i, owner, t, st, b, used, due], k) => `<tr><td><label class="ax-check"><input type="checkbox" aria-label="Select ${n}"><span class="ax-check__box"><svg viewBox="0 0 14 14"><path d="M2.5 7.5l3 3 6-7" pathLength="1"/></svg></span></label></td><td data-sort="${n}"><div style="display:flex;flex-direction:column"><span class="t-label">${n}</span><span class="t-mono-id">${code}</span></div></td><td>${client}</td><td><div class="ax-cell-2" style="gap:8px">${av(i, t, 24)}<span>${owner}</span></div></td><td>${tag(st)}</td><td class="is-num" data-sort="${b}"><div style="display:flex;flex-direction:column;align-items:flex-end"><span class="ax-num">${inr(b)}</span><span class="t-caption ${used > 90 ? "tx-neg" : "tx-3"}">${used}% used</span></div></td><td class="is-num" data-sort="${k}">${due}</td></tr>`).join("")}
      </tbody></table>
      <div style="height:64px"></div>
      <div class="ax-action-bar ax-action-bar--floating" role="toolbar" aria-label="Selected projects"><span data-count>0 selected</span><span class="ax-action-bar__divider"></span><button class="ax-btn ax-btn--sm" type="button" data-bulk="archived">${I("archive")}Archive</button><button class="ax-btn ax-btn--sm" type="button" data-bulk="exported">${I("download")}Export</button><button class="ax-btn ax-btn--sm ax-btn--icon" type="button" aria-label="Clear selection" data-clear>${I("x")}</button></div>
    </div>
    <div class="ds-row" style="justify-content:space-between"><span class="t-caption tx-3">1–6 of 8</span><nav class="ax-pagination" data-ax-pagination data-total="2" data-current="1" aria-label="Pagination"></nav></div>`);

  /* ---------- Screen 3: Project detail ---------- */
  const detail = () => shell("Projects", ["Projects", "PRJ-104"], `
    ${header("Website redesign", "Lumen Health · due 14 Nov", `<button class="ax-btn" type="button">${I("share-2")}Share project</button><button class="ax-btn ax-btn--primary" type="button">${I("check")}Mark complete</button><button class="ax-btn ax-btn--icon" type="button" aria-label="More">${I("ellipsis")}</button>`, "Projects / PRJ-104")}
    <div class="ax-shell__split" style="margin-top:0">
      <section class="ds-stack" style="gap:24px">
        <div class="ax-tabs" aria-label="Project views"><button class="ax-tab" type="button" aria-selected="true">Overview</button><button class="ax-tab" type="button">Tasks <span class="t-mono-micro">5</span></button><button class="ax-tab" type="button">Activity</button></div>
        <div class="ax-card ax-card--outlined ex-kpis" style="grid-template-columns:repeat(3,1fr)">
          ${[["Budget used", "65%", ".65", 1, "₹1,68,000 left"], ["Tasks done", "2 of 5", ".4", 2, "3 open"], ["Days to due date", "40", ".46", 4, "Day 34 of 74"]].map(([l, v, m, c, cap]) => `<div class="ex-kpi"><span class="t-body tx-2">${l}</span><span class="t-h2 ax-num">${v}</span>${meter(m, c)}<span class="t-caption tx-3">${cap}</span></div>`).join("")}
        </div>
        <div class="ax-card ax-card--outlined"><b class="t-label">Summary</b><p class="t-body" style="margin:0;max-width:62ch">A new marketing site for Lumen Health: content model, eight page templates and a component library the client team can extend. Phase 1 covers the homepage, services and contact pages.</p></div>
        <div class="ax-card ax-card--outlined"><div><b class="t-label">Budget</b><div class="t-caption tx-3">Fixed fee, invoiced in three stages</div></div>
          <div class="ex-totals">${[["Discovery, invoiced", 96000], ["Design, invoiced", 216000], ["Build, not invoiced", 168000, 1]].map(([l, v, muted]) => `<div class="ds-row" style="justify-content:space-between"><span class="t-body ${muted ? "tx-3" : "tx-2"}">${l}</span><span class="ax-num ${muted ? "tx-3" : ""}">${inr(v)}.00</span></div>`).join("")}<hr class="ax-divider"><div class="ds-row" style="justify-content:space-between"><b class="t-body-lg-strong">Total</b><b class="t-h3 ax-num">₹4,80,000.00</b></div><span class="t-caption tx-3" style="text-align:right">Figures exclude tax.</span></div></div>
      </section>
      <aside class="ex-props">
        ${[["Details", [["Status", tag("Active")], ["Owner", `<span class="ds-row" style="gap:6px">${av("RK", "teal", 20)}Riya Kapoor</span>`], ["Client", "Lumen Health"], ["Code", '<span class="t-mono-id" style="color:var(--axiom-text-primary)">PRJ-104</span>']]], ["Schedule", [["Started", "1 Sep"], ["Due", "14 Nov"]]], ["People", [["Team", `<span class="ax-avatar-group" style="--gap:-6px">${av("RK", "teal", 22)}${av("AM", "orange", 22)}${av("SQ", "violet", 22)}${av("VI", "blue", 22)}</span>`], ["Tags", '<span class="ds-row" style="gap:4px"><span class="ax-tag ax-tag--subtle">Retainer</span><span class="ax-tag ax-tag--subtle">Web</span></span>']]]].map(([g, rows]) => `<div class="ex-props__group"><b class="t-label">${g}</b>${rows.map(([k, v]) => `<div class="ex-prop"><span class="tx-2">${k}</span><span>${v}</span></div>`).join("")}</div>`).join("")}
      </aside>
    </div>`);

  /* ---------- Screen 4: New project form ---------- */
  const form = () => shell("Projects", ["Projects", "New project"], `
    ${header("New project", "Projects keep work, budget and invoices together.", "", "Projects")}
    <form class="ex-form" onsubmit="return false">
      ${[["Details", "What the project is and who it is for.", `<div class="ax-field"><label class="ax-field__title" for="ex-name">Name<span class="ax-req">*</span></label><div class="ax-control"><input class="ax-input" id="ex-name" placeholder="Website redesign"></div></div>
          <div class="ex-form__2"><div class="ax-field"><span class="ax-field__title" id="ex-client-l">Client</span><button class="ax-control ax-select" type="button" data-ax-select="ex-client" aria-labelledby="ex-client-l"><span class="ax-select__value is-placeholder">Choose a client</span><i class="ax-select__chev" data-lucide="chevron-down"></i></button><div class="ax-float ax-dropdown" id="ex-client" data-offset="6"><div class="ax-option">Lumen Health</div><div class="ax-option">Fernway Bank</div><div class="ax-option">Kestrel Coffee</div><div class="ax-option">Orbit Logistics</div></div></div>
          <div class="ax-field"><label class="ax-field__title" for="ex-code">Code</label><div class="ax-control"><input class="ax-input t-mono-id" id="ex-code" value="PRJ-105" style="font-size:14px"></div><span class="ax-help">Shown on invoices and in search.</span></div></div>`],
        ["Schedule", "Dates drive the due-date meter and reminders.", `<div class="ex-form__2"><div class="ax-field"><label class="ax-field__title" for="ex-start">Start</label><div class="ax-control">${I("calendar")}<input class="ax-input" id="ex-start" value="1 Dec 2026"></div></div><div class="ax-field"><label class="ax-field__title" for="ex-due">Due</label><div class="ax-control">${I("calendar")}<input class="ax-input" id="ex-due" placeholder="Pick a date"></div></div></div>`],
        ["Budget", "How the client is billed.", `<div class="ex-form__2"><div class="ax-field"><label class="ax-field__title" for="ex-amt">Amount</label><div class="ax-control"><span class="tx-3">₹</span><input class="ax-input ax-num" id="ex-amt" value="4,80,000"></div></div><div class="ax-field"><span class="ax-field__title">Billing</span><div class="ax-segmented"><button type="button" aria-checked="true">Fixed fee</button><button type="button" aria-checked="false">Hourly</button><button type="button" aria-checked="false">Retainer</button></div></div></div>`],
        ["Team", "Everyone added can edit tasks and log time.", `<div class="ax-field"><span class="ax-field__title">Members</span><div class="ax-control ax-multi" data-ax-multi="ex-team"><input class="ax-input" placeholder="Add people" aria-label="Add people"></div><div class="ax-float ax-dropdown" id="ex-team" data-offset="6"><div class="ax-option" aria-selected="true">Riya Kapoor</div><div class="ax-option" aria-selected="true">Sana Qureshi</div><div class="ax-option">Arjun Mehta</div><div class="ax-option">Vikram Iyer</div></div></div>`]].map(([t, d, body]) => `<section class="ex-form__section"><div><b class="t-label">${t}</b><p class="t-caption tx-3" style="margin:2px 0 0">${d}</p></div><div class="ds-stack" style="gap:16px">${body}</div></section>`).join("")}
      <div class="ex-form__foot"><span class="t-caption tx-3">Drafts save automatically.</span><span style="flex:1"></span><button class="ax-btn ax-btn--ghost" type="button">Cancel</button><button class="ax-btn ax-btn--primary" type="button" data-ax-morph="Creating…|Created" data-toast="Project PRJ-105 created"><span class="ax-btn__label">Create project</span></button></div>
    </form>`);

  /* ---------- Screen 5: Inventory ---------- */
  const STOCK = [
    ["Classic crew tee", "SKU-1042", "shirt", "orange", "Clothes", 96, 38, 8, 60, 210],
    ["Steel pressure cooker 3L", "SKU-2210", "cooking-pot", "blue", "Kitchen", 18, 0, 0, 25, 820],
    ["Basmati rice 25 kg", "SKU-3305", "wheat", "yellow", "Grocery", 0, 40, 24, 30, 1650],
    ["Barcode scanner BS-200", "SKU-4120", "scan-barcode", "violet", "Equipment", 0, 0, 0, 5, 2400],
    ["Kraft carton, medium", "SKU-5011", "package", "lime", "Packaging", 400, 240, 600, 500, 14],
    ["Cotton bath towel", "SKU-1108", "bath", "teal", "Home", 36, 0, 0, 20, 160],
  ];
  const stockTag = (q, r) => (q === 0 ? '<span class="ax-tag tone-red"><span class="ax-tag__dot"></span>Out of stock</span>' : q < r ? '<span class="ax-tag tone-orange"><span class="ax-tag__dot"></span>Low</span>' : '<span class="ax-tag tone-green"><span class="ax-tag__dot"></span>In stock</span>');
  const inventory = () => shell("Products", ["Inventory", "Products"], `
    ${header("Products", "248 products across three warehouses", `<button class="ax-btn" type="button">${I("upload")}Import</button><button class="ax-btn" type="button">${I("scan-barcode")}Print labels</button><button class="ax-btn ax-btn--primary" type="button">${I("plus")}New product</button>`, "Inventory")}
    <div class="ax-card ax-card--outlined ex-kpis">
      ${[["Stock value", "wallet", 1, "₹18,42,600", "+₹1,20,400 this month"], ["Products", "package", 2, "248", "12 added this month"], ["Low stock", "triangle-alert", 4, "7", "Below their reorder point"], ["Out of stock", "circle-x", 6, "2", "₹14,800 in lost sales"]].map(([l, ic, c, v, cap]) => `<div class="ex-kpi"><div class="ds-row" style="gap:8px"><span class="ex-kpi__icon" style="color:var(--ax-chart-${c});background:color-mix(in srgb,var(--ax-chart-${c}) 12%,transparent)">${I(ic)}</span><span class="t-body tx-2">${l}</span></div><span class="t-h2 ax-num">${v}</span><span class="t-caption tx-3">${cap}</span></div>`).join("")}
    </div>
    <div class="ds-row" style="gap:8px;flex-wrap:nowrap">
      <div class="ax-segmented ax-segmented--sm" style="flex:none">${[["All", 1], ["Main"], ["Chakan"], ["Hosur"]].map(([l, on]) => `<button type="button" aria-checked="${!!on}">${l}</button>`).join("")}</div>
      <label class="ax-control ax-search ax-search--md" style="width:260px"><i data-lucide="search"></i><input class="ax-input" placeholder="Name, SKU or barcode" aria-label="Search products"></label>
      <button class="ax-btn" type="button">${I("list-filter")}Category</button><button class="ax-btn" type="button">${I("triangle-alert")}Low stock only</button><span style="flex:1"></span><button class="ax-btn ax-btn--ghost" type="button">${I("columns-3")}Columns</button>
    </div>
    <div class="ax-table-wrap" data-ax-table>
      <table class="ax-table"><thead><tr>
        <th style="width:44px"><div class="ax-th"><label class="ax-check"><input type="checkbox" aria-label="Select all"><span class="ax-check__box"><svg viewBox="0 0 14 14"><path d="M2.5 7.5l3 3 6-7" pathLength="1"/></svg></span></label></div></th>
        <th><div class="ax-th"><button class="ax-sort" type="button" aria-sort="ascending">Product<i data-lucide="arrow-up"></i></button></div></th><th><div class="ax-th">Category</div></th>
        <th class="is-num"><div class="ax-th">Main</div></th><th class="is-num"><div class="ax-th">Chakan</div></th><th class="is-num"><div class="ax-th">Hosur</div></th>
        <th style="width:180px"><div class="ax-th">On hand vs reorder</div></th><th><div class="ax-th">Status</div></th><th class="is-num"><div class="ax-th"><button class="ax-sort" type="button">Value<i data-lucide="arrow-up"></i></button></div></th>
      </tr></thead><tbody>
        ${STOCK.map(([n, sku, ic, t, cat, m, c, h, r, cost]) => { const q = m + c + h, ratio = Math.min(1, q / (r * 2)); return `<tr><td><label class="ax-check"><input type="checkbox" aria-label="Select ${n}"><span class="ax-check__box"><svg viewBox="0 0 14 14"><path d="M2.5 7.5l3 3 6-7" pathLength="1"/></svg></span></label></td><td data-sort="${n}"><div class="ex-prod"><span class="ex-thumb tone-${t}">${I(ic)}</span><div><span class="t-label">${n}</span><span class="t-mono-id">${sku}</span></div></div></td><td class="tx-2">${cat}</td>${[m, c, h].map((v) => `<td class="is-num ax-num ${v === 0 ? "tx-3" : ""}">${v.toLocaleString("en-IN")}</td>`).join("")}<td><div class="ex-onhand"><div class="ax-meter"><div class="ax-meter__track"><div class="ax-meter__fill" style="--v:${ratio.toFixed(2)};background:var(--ax-chart-${q === 0 ? 6 : q < r ? 4 : 2})"></div></div></div><span class="t-caption tx-3 ax-num">${q.toLocaleString("en-IN")} / ${r}</span></div></td><td>${stockTag(q, r)}</td><td class="is-num ax-num" data-sort="${q * cost}">${inr(q * cost)}</td></tr>`; }).join("")}
      </tbody></table>
      <div style="height:64px"></div>
      <div class="ax-action-bar ax-action-bar--floating" role="toolbar" aria-label="Selected products"><span data-count>0 selected</span><span class="ax-action-bar__divider"></span><button class="ax-btn ax-btn--sm" type="button" data-bulk="moved">${I("arrow-left-right")}Transfer</button><button class="ax-btn ax-btn--sm" type="button" data-bulk="reordered">${I("refresh-cw")}Reorder</button><button class="ax-btn ax-btn--sm ax-btn--icon" type="button" aria-label="Clear selection" data-clear>${I("x")}</button></div>
    </div>
    <div class="ds-row" style="justify-content:space-between"><span class="t-caption tx-3">1–6 of 248</span><nav class="ax-pagination" data-ax-pagination data-total="42" data-current="1" aria-label="Pagination"></nav></div>`);

  /* ---------- Screen 6: Reports ---------- */
  const reports = () => shell("Reports", ["Reports", "Sales"], `
    ${header("Sales report", "20–26 Nov · all warehouses · compared with the week before", `<div class="ax-segmented ax-segmented--sm"><button type="button" aria-checked="true">Week</button><button type="button" aria-checked="false">Month</button><button type="button" aria-checked="false">Quarter</button></div><button class="ax-btn" type="button">${I("calendar")}20 – 26 Nov${I("chevron-down", 14)}</button><button class="ax-btn ax-btn--primary" type="button">${I("download")}Export</button>`, "Reports")}
    <div class="ax-card ax-card--outlined ex-kpis">
      ${[["Revenue", "₹4,52,000", "+6.4%", 1, [38, 41, 40, 44, 43, 47, 45, 52]], ["Orders", "312", "+3.1%", 1, [270, 282, 279, 290, 296, 301, 305, 312]], ["Average order", "₹1,449", "+3.2%", 1, [1360, 1380, 1372, 1400, 1410, 1425, 1430, 1449]], ["Gross margin", "38.2%", "−0.4pt", 0, [39.1, 38.9, 39, 38.7, 38.6, 38.5, 38.3, 38.2]]].map(([l, v, ch, good, d]) => { const mx = Math.max(...d), mn = Math.min(...d); return `<div class="ex-kpi"><span class="t-body tx-2">${l}</span><div class="ds-row" style="gap:8px;justify-content:space-between"><span class="t-h2 ax-num">${v}</span><svg viewBox="0 0 80 28" width="80" height="28" aria-hidden="true"><polyline class="ax-spark" points="${d.map((x, i) => `${(i * 80) / (d.length - 1)},${26 - ((x - mn) / (mx - mn || 1)) * 24}`).join(" ")}" style="stroke:var(--ax-chart-${good ? 2 : 6})"/></svg></div><span class="ax-trend ${good ? "tx-pos" : "tx-neg"}">${I(ch.startsWith("−") ? "arrow-down" : "arrow-up", 14)}${ch}<span class="t-caption tx-3" style="font-weight:400;margin-left:4px">vs last week</span></span></div>`; }).join("")}
    </div>
    <div class="ex-report">
      <div class="ax-card ax-card--outlined"><div class="ax-card__head"><div><b class="t-label">Sales and purchases</b><div class="t-caption tx-3">Last six months, in lakh rupees</div></div><button class="ax-btn ax-btn--ghost ax-btn--sm ax-btn--icon" type="button" aria-label="More">${I("ellipsis")}</button></div>${grouped()}</div>
      <div class="ax-card ax-card--outlined" style="gap:12px"><div class="ax-card__head"><div><b class="t-label">Top customers</b><div class="t-caption tx-3">Share of this week's revenue</div></div></div>
        ${[["LH", "blue", "Lumen Health", 112000, 25], ["FB", "orange", "Fernway Bank", 86000, 19], ["KC", "violet", "Kestrel Coffee", 64000, 14], ["OL", "teal", "Orbit Logistics", 51000, 11], ["ST", "yellow", "Shree Textiles", 38000, 8]].map(([i, t, n, v, p]) => `<div class="ex-cust">${av(i, t, 28)}<div class="ex-cust__main"><div class="ds-row" style="justify-content:space-between"><span class="t-label">${n}</span><span class="ax-num t-body">${inr(v)}</span></div><div class="ex-cust__bar"><span style="width:${p * 3.6}%"></span></div></div></div>`).join("")}
      </div>
    </div>
    <div class="ax-card ax-card--outlined ex-aging"><div><b class="t-label">Money to collect</b><div class="t-caption tx-3">₹2,84,000 across 9 invoices, by age</div></div>
      <div class="ex-aging__bar">${[[46, 2, "0–30 days", "₹1,30,600"], [28, 4, "31–60 days", "₹79,500"], [16, 6, "61–90 days", "₹45,400"], [10, 3, "90+ days", "₹28,500"]].map(([p, c]) => `<span style="flex:${p};background:var(--ax-chart-${c})"></span>`).join("")}</div>
      <div class="ex-aging__legend">${[[2, "0–30 days", "₹1,30,600"], [4, "31–60 days", "₹79,500"], [6, "61–90 days", "₹45,400"], [3, "90+ days", "₹28,500"]].map(([c, l, v]) => `<span><i style="background:var(--ax-chart-${c})"></i><span class="tx-2">${l}</span><b class="ax-num">${v}</b></span>`).join("")}</div>
    </div>`);

  /* ---------- Charts ---------- */
  function area(d, w = 600, h = 200, c = 1) {
    const max = Math.max(...d) * 1.1, pts = d.map((v, i) => [(i * w) / (d.length - 1), h - (v / max) * h]);
    const line = pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + "," + p[1].toFixed(1)).join("");
    return `<svg class="ec" viewBox="0 0 ${w} ${h + 4}" preserveAspectRatio="none" style="height:${h * 0.6}px" data-reveal aria-hidden="true"><path class="ec-area" d="${line}L${w},${h}L0,${h}Z" style="fill:color-mix(in srgb,var(--ax-chart-${c}) 14%,transparent)"/><path class="ec-line" pathLength="1" d="${line}" style="stroke:var(--ax-chart-${c})"/></svg>`;
  }
  const W = 560, H = 220, L = 44, B = 24;
  const grid = (max, n, fmt) => { let g = ""; for (let i = 0; i <= n; i++) { const y = H - B - (i / n) * (H - B - 8); g += `<line x1="${L}" x2="${W}" y1="${y}" y2="${y}"/><text x="${L - 8}" y="${y + 4}" text-anchor="end">${fmt((max * i) / n)}</text>`; } return `<g class="ec-grid">${g}</g>`; };
  const svg = (inner, label, h = H) => `<svg class="ec" viewBox="0 0 ${W} ${h}" role="img" aria-label="${label}" data-reveal>${inner}</svg>`;
  const legend = (items) => `<div class="ax-legend">${items.map(([n, c]) => `<span style="--c:var(--ax-chart-${c})">${n}</span>`).join("")}</div>`;
  const yOf = (v, max) => H - B - (v / max) * (H - B - 8);

  function grouped() {
    const D = [["May", 4.2, 3.1], ["Jun", 4.8, 3.6], ["Jul", 4.4, 3.9], ["Aug", 5.6, 4.1], ["Sep", 6.1, 4.4], ["Oct", 6.8, 4.9]], max = 8, bw = 22, step = (W - L - 20) / D.length;
    let b = ""; D.forEach(([m, s, p], i) => { const x = L + 16 + i * step; b += `<rect class="ec-bar" x="${x}" y="${yOf(s, max)}" width="${bw}" height="${H - B - yOf(s, max)}" rx="3" style="fill:var(--ax-chart-1);--i:${i}"><title>${m} sales ₹${s}L</title></rect><rect class="ec-bar" x="${x + bw + 4}" y="${yOf(p, max)}" width="${bw}" height="${H - B - yOf(p, max)}" rx="3" style="fill:var(--ax-chart-2);--i:${i}"><title>${m} purchases ₹${p}L</title></rect><text class="ec-x" x="${x + bw + 2}" y="${H - 6}" text-anchor="middle">${m}</text>`; });
    return svg(grid(max, 4, (v) => "₹" + v + "L") + b, "Sales and purchases by month") + legend([["Sales", 1], ["Purchases", 2]]);
  }
  function stacked() {
    const S = [["Delivered", 1], ["Shipping", 3], ["Pending", 4], ["Returned", 6]], D = [[42, 12, 8, 2], [48, 10, 9, 3], [51, 14, 6, 2], [46, 18, 11, 4], [58, 15, 7, 2], [62, 13, 9, 3]], max = 100, bw = 34, step = (W - L - 20) / D.length;
    let b = ""; D.forEach((row, i) => { let acc = 0; const x = L + 22 + i * step; row.forEach((v, k) => { const y0 = yOf(acc, max), y1 = yOf(acc + v, max); b += `<rect class="ec-bar" x="${x}" y="${y1}" width="${bw}" height="${y0 - y1 - 1}" style="fill:var(--ax-chart-${S[k][1]});--i:${i}"><title>Week ${i + 40} ${S[k][0]}: ${v}</title></rect>`; acc += v; }); b += `<text class="ec-x" x="${x + bw / 2}" y="${H - 6}" text-anchor="middle">W${i + 40}</text>`; });
    return svg(grid(max, 4, (v) => Math.round(v)) + b, "Orders by status per week") + legend(S);
  }
  function multiline() {
    const S = [["Bhiwandi WH-01", 1, [32, 34, 33, 38, 41, 40, 44, 47]], ["Chakan WH-02", 3, [22, 24, 27, 26, 29, 33, 32, 35]], ["Hosur WH-03", 5, [14, 15, 18, 17, 16, 19, 22, 21]]], max = 50;
    let p = ""; S.forEach(([n, c, d]) => { const pts = d.map((v, i) => `${L + (i * (W - L - 10)) / (d.length - 1)},${yOf(v, max)}`); p += `<polyline class="ec-line" pathLength="1" points="${pts.join(" ")}" style="stroke:var(--ax-chart-${c})"/><circle cx="${pts[pts.length - 1].split(",")[0]}" cy="${pts[pts.length - 1].split(",")[1]}" r="3.5" style="fill:var(--ax-chart-${c})"/>`; });
    ["W36", "W38", "W40", "W43"].forEach((t, i) => (p += `<text class="ec-x" x="${L + (i * (W - L - 10)) / 3}" y="${H - 6}" text-anchor="${i ? (i === 3 ? "end" : "middle") : "start"}">${t}</text>`));
    return svg(grid(max, 5, (v) => "₹" + v + "L") + p, "Stock value by warehouse") + legend(S.map(([n, c]) => [n, c]));
  }
  function funnel() {
    const D = [["Leads", 1240], ["Qualified", 610], ["Proposal sent", 248], ["Negotiation", 96], ["Won", 58]];
    return `<div class="ec-funnel" data-reveal>${D.map(([l, v], i) => `<div class="ec-funnel__row"><span class="t-body tx-2">${l}</span><div class="ec-funnel__track"><div class="ec-funnel__bar" style="--v:${v / D[0][1]};--i:${i}"></div></div><span class="ax-num t-label">${v.toLocaleString("en-IN")}</span><span class="t-caption tx-3 ax-num">${i ? Math.round((v / D[i - 1][1]) * 100) + "%" : ""}</span></div>`).join("")}</div>`;
  }
  function bullets() {
    const D = [["Revenue", "₹65.3L of ₹70L", 0.93, 0.85, [0.6, 0.85]], ["Gross margin", "38% of 40%", 0.95, 0.9, [0.7, 0.9]], ["On-time delivery", "86% of 95%", 0.86, 0.95, [0.75, 0.9]], ["Collections", "₹48L of ₹60L", 0.8, 0.9, [0.6, 0.8]]];
    return `<div class="ec-bullets" data-reveal>${D.map(([l, cap, v, t, [a, b]], i) => `<div class="ec-bullet"><div class="ds-row" style="justify-content:space-between"><span class="t-label">${l}</span><span class="t-caption tx-3 ax-num">${cap}</span></div><div class="ec-bullet__track" style="--a:${a * 100}%;--b:${b * 100}%"><div class="ec-bullet__bar" style="--v:${v};--i:${i};background:var(--ax-chart-${v >= t ? 2 : 1})"></div><span class="ec-bullet__target" style="left:${t * 100}%"></span></div></div>`).join("")}</div>`;
  }
  function waterfall() {
    const D = [["Opening", 42, "base"], ["Sales", 38, "up"], ["Purchases", -21, "down"], ["Payroll", -12, "down"], ["Other", 5, "up"], ["Closing", 52, "base"]], max = 90, bw = 46, step = (W - L - 20) / D.length;
    let acc = 0, b = "";
    D.forEach(([l, v, k], i) => { const x = L + 16 + i * step; let y0, y1; if (k === "base") { y0 = yOf(0, max); y1 = yOf(v, max); acc = v; } else { const s = acc; acc += v; y0 = yOf(Math.min(s, acc), max); y1 = yOf(Math.max(s, acc), max); [y0, y1] = [yOf(Math.min(s, acc), max), yOf(Math.max(s, acc), max)]; } const fill = k === "base" ? "var(--axiom-text-tertiary)" : k === "up" ? "var(--ax-chart-2)" : "var(--ax-chart-6)"; b += `<rect class="ec-bar" x="${x}" y="${y1}" width="${bw}" height="${Math.max(2, y0 - y1)}" rx="3" style="fill:${fill};--i:${i}"><title>${l}: ₹${v}L</title></rect><text class="ec-val" x="${x + bw / 2}" y="${y1 - 6}" text-anchor="middle">${v > 0 && k !== "base" ? "+" : ""}${v}</text><text class="ec-x" x="${x + bw / 2}" y="${H - 6}" text-anchor="middle">${l}</text>`; if (i < D.length - 1) b += `<line class="ec-connector" x1="${x + bw}" x2="${x + step}" y1="${yOf(acc, max)}" y2="${yOf(acc, max)}"/>`; });
    return svg(grid(max, 3, (v) => "₹" + Math.round(v) + "L") + b, "Cash flow this quarter, in lakh rupees");
  }
  function kpiTable() {
    const spark = (d, c) => { const mx = Math.max(...d), mn = Math.min(...d); return `<svg viewBox="0 0 80 24" width="80" height="24" aria-hidden="true"><polyline class="ax-spark" points="${d.map((v, i) => `${(i * 80) / (d.length - 1)},${22 - ((v - mn) / (mx - mn || 1)) * 20}`).join(" ")}" style="stroke:var(--ax-chart-${c})"/></svg>`; };
    const R = [["Revenue", "₹65.3L", "+6.4%", 1, [40, 44, 43, 48, 52, 55, 61, 65]], ["Orders", "1,284", "+3.1%", 1, [980, 1010, 1080, 1060, 1150, 1190, 1240, 1284]], ["Average order", "₹5,086", "+3.2%", 1, [4700, 4800, 4750, 4900, 4950, 5000, 5050, 5086]], ["Returns", "2.4%", "−0.6pt", 0, [3.4, 3.1, 3.2, 2.9, 2.8, 2.6, 2.5, 2.4]], ["Days sales outstanding", "41", "+4", -1, [34, 35, 36, 37, 37, 39, 40, 41]]];
    return `<div class="ax-table-wrap" style="box-shadow:inset 0 0 0 1px var(--axiom-line-subtle)"><table class="ax-table"><thead><tr><th><div class="ax-th">Metric</div></th><th class="is-num"><div class="ax-th">This month</div></th><th class="is-num"><div class="ax-th">Change</div></th><th><div class="ax-th">Last 8 weeks</div></th></tr></thead><tbody>${R.map(([n, v, ch, good, d]) => `<tr><td>${n}</td><td class="is-num ax-num">${v}</td><td class="is-num"><span class="ax-trend ${good >= 0 ? "tx-pos" : "tx-neg"}">${I(good >= 0 ? (ch.startsWith("−") ? "arrow-down" : "arrow-up") : "arrow-up", 14)}${ch}</span></td><td>${spark(d, good >= 0 ? 2 : 6)}</td></tr>`).join("")}</tbody></table></div>`;
  }
  function gantt() {
    const weeks = 10, T = [["Discovery", 0, 2, 1, 1], ["Content model", 1, 3, 1, 1], ["Page templates", 3, 4, 3, 0.6], ["Component library", 4, 5, 3, 0.3], ["QA and launch", 8, 2, 5, 0]], today = 5.4;
    return `<div class="ec-gantt" data-reveal style="--weeks:${weeks}"><div class="ec-gantt__head"><span></span><div class="ec-gantt__weeks">${Array.from({ length: weeks }, (_, i) => `<span>W${36 + i}</span>`).join("")}</div></div>
      ${T.map(([n, s, d, c, done], i) => `<div class="ec-gantt__row"><span class="t-body">${n}</span><div class="ec-gantt__lane"><div class="ec-gantt__bar" style="left:${(s / weeks) * 100}%;width:${(d / weeks) * 100}%;--c:var(--ax-chart-${c});--i:${i}"><span style="width:${done * 100}%"></span></div></div></div>`).join("")}
      <div class="ec-gantt__row"><span class="t-body tx-2">Launch</span><div class="ec-gantt__lane"><span class="ec-gantt__milestone" style="left:${(10 / weeks) * 100}%" title="Launch, 14 Nov"></span></div></div>
      <div class="ec-gantt__today" style="left:calc(160px + (100% - 160px) * ${today / weeks})"><span>Today</span></div></div>`;
  }
  function cohort() {
    const rows = [["Jun", [100, 62, 48, 41, 37, 34]], ["Jul", [100, 66, 51, 44, 40]], ["Aug", [100, 64, 53, 47]], ["Sep", [100, 70, 57]], ["Oct", [100, 72]]];
    return `<div class="ec-cohort"><div class="ec-cohort__row ec-cohort__head"><span>Cohort</span>${["M0", "M1", "M2", "M3", "M4", "M5"].map((m) => `<span>${m}</span>`).join("")}</div>${rows.map(([m, d]) => `<div class="ec-cohort__row"><span>${m}</span>${Array.from({ length: 6 }, (_, i) => (d[i] != null ? `<span class="ec-cohort__cell" style="--p:${d[i]}">${d[i]}%</span>` : "<span></span>")).join("")}</div>`).join("")}</div>`;
  }

  const CHARTS = { grouped, stacked, multiline, funnel, bullets, waterfall, kpi: kpiTable, gantt, cohort };
  $$("[data-chart]").forEach((el) => { const f = CHARTS[el.dataset.chart]; if (f) el.innerHTML = f(); });
  const SCREENS = { home, list, detail, form, inventory, reports };
  $$("[data-demo-screen]").forEach((el) => { const f = SCREENS[el.dataset.demoScreen]; if (f) el.innerHTML = f(); });

  /* frames: 1280 wide, scaled to fit; tabs switch screens */
  const fitFrames = () => $$(".ex-frame-wrap").forEach((w) => w.style.setProperty("--k", (w.clientWidth / 1280).toFixed(4)));
  new ResizeObserver(fitFrames).observe(document.body); fitFrames();
  const seg = $("#demo-switch");
  if (seg) seg.addEventListener("click", (e) => { const b = e.target.closest("button[data-screen]"); if (!b) return; $$("[data-demo-frame]").forEach((f) => (f.hidden = f.dataset.demoFrame !== b.dataset.screen)); requestAnimationFrame(() => { fitFrames(); window.Axiom && Axiom.refresh(); }); });
})();
