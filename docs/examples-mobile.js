/* Examples · mobile: six AXIOM app screens for the same ERP (Kestrel Traders), in the AtomGo app look:
   white canvas, soft grey groups, round ringed icon buttons, 40px CTAs with 16px corners, a floating tab bar.
   Every screen is built from AXIOM mobile components plus a few .mx-* layout helpers (docs/showcase.css).
   Runs after mobile-showcase.js (phone chrome) and before showcase.js (icons) and axiom.js (behaviour). */
(function () {
  "use strict";
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const I = (n, s) => `<i data-lucide="${n}"${s ? ` style="width:${s}px;height:${s}px"` : ""}></i>`;
  const inr = (n) => "₹" + n.toLocaleString("en-IN");

  /* ---------- shared pieces ---------- */
  const TABS = [["Home", "house"], ["Inventory", "package"], ["Sales", "receipt"], ["Reports", "chart-column"], ["More", "layout-grid"]];
  const tabbar = (active) => `<nav class="ax-tabbar" aria-label="Main">${TABS.map(([n, ic]) => `<button class="ax-tabbar__item" type="button" tabindex="-1" aria-selected="${n === active}"><span class="ax-tabbar__icon">${I(ic)}</span>${n}</button>`).join("")}</nav>`;
  const ring = (ic, label, dot) => `<button class="mx-ring${dot ? " mx-ring--dot" : ""}" type="button" tabindex="-1" aria-label="${label}">${I(ic)}</button>`;
  const topbar = (left, title, right) => `<header class="ax-mtopbar ax-mtopbar--inline mx-topbar">${left || ""}<span class="ax-mtopbar__title">${title}</span><span class="ax-mtopbar__spacer"></span>${right || ""}</header>`;
  const back = (label) => `<button class="ax-back" type="button" tabindex="-1">${I("chevron-left")}${label}</button>`;
  const section = (title, link) => `<div class="mx-section"><b>${title}</b>${link ? `<a class="ax-link">${link}</a>` : ""}</div>`;
  const thumb = (ic, tone) => `<span class="mx-thumb tone-${tone}">${I(ic)}</span>`;
  const tag = (t, tone) => `<span class="ax-tag ${tone ? "tone-" + tone : ""}"><span class="ax-tag__dot"></span>${t}</span>`;
  const meter = (v, c) => `<div class="ax-meter mx-meter"><div class="ax-meter__track"><div class="ax-meter__fill" style="--v:${v};background:var(--ax-chart-${c})"></div></div></div>`;
  const spark = (d, c, w = 326, h = 64) => {
    const mx = Math.max(...d) * 1.08, mn = Math.min(...d) * 0.9, pts = d.map((v, i) => [(i * w) / (d.length - 1), h - ((v - mn) / (mx - mn)) * h]);
    const line = pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + "," + p[1].toFixed(1)).join("");
    return `<svg class="mx-spark" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-hidden="true"><path d="${line}L${w},${h}L0,${h}Z" style="fill:color-mix(in srgb,var(--ax-chart-${c}) 16%,transparent)"/><path d="${line}" style="fill:none;stroke:var(--ax-chart-${c});stroke-width:2;vector-effect:non-scaling-stroke"/></svg>`;
  };
  const screen = (inner, after = "") => `<div class="ax-screen mx-app"><div class="ax-screen__content">${inner}</div>${after}</div>`;

  const PRODUCTS = [
    ["Classic crew tee", "SKU-1042", "shirt", "orange", 142, "pcs", "Main · Chakan", ""],
    ["Steel pressure cooker 3L", "SKU-2210", "cooking-pot", "blue", 18, "pcs", "Main", "Low"],
    ["Basmati rice 25 kg", "SKU-3305", "wheat", "yellow", 64, "bags", "Chakan · Hosur", ""],
    ["Barcode scanner BS-200", "SKU-4120", "scan-barcode", "violet", 0, "pcs", "Main", "Out"],
    ["Kraft carton, medium", "SKU-5011", "package", "lime", 1240, "pcs", "Hosur", ""],
    ["Cotton bath towel", "SKU-1108", "bath", "teal", 36, "pcs", "Main", ""],
  ];

  /* ---------- 1. Home ---------- */
  const home = () => screen(`
    <div class="ax-safe-top"></div>
    <div class="ax-scroll">
      <div class="mx-hello"><span class="ax-avatar tone-orange" style="--size:44px">RK</span><div class="mx-hello__text"><span class="t-caption tx-3">Good morning</span><b>Riya Kapoor</b></div>${ring("search", "Search")}${ring("bell", "Notifications", 1)}</div>
      <div class="mx-pad"><div class="ax-segmented ax-segmented--sm" style="width:100%"><button type="button" tabindex="-1" aria-checked="true">Today</button><button type="button" tabindex="-1" aria-checked="false">Week</button><button type="button" tabindex="-1" aria-checked="false">Month</button></div></div>
      <div class="mx-hero" style="margin-top:12px">
        <div class="mx-row"><span class="t-body tx-2">Sales today</span><span class="ax-tag tone-green">${I("arrow-up", 12)}12%</span></div>
        <span class="mx-hero__value">₹48,250</span>
        <span class="t-caption tx-3">23 orders · ₹6,010 more than yesterday</span>
        ${spark([18, 22, 19, 26, 24, 31, 29, 35, 33, 41, 38, 48], 1)}
      </div>
      <div class="mx-tiles">
        <div class="mx-tile"><span class="mx-tile__icon tone-blue">${I("hand-coins")}</span><span class="mx-tile__value">₹2.84L</span><span class="t-caption tx-3">To collect · 9 invoices</span></div>
        <div class="mx-tile"><span class="mx-tile__icon tone-orange">${I("package")}</span><span class="mx-tile__value">7</span><span class="t-caption tx-3">Products low on stock</span></div>
      </div>
      ${section("Quick actions")}
      <div class="mx-actions">${[["New sale", "receipt"], ["Add product", "package-plus"], ["Scan", "scan-barcode"], ["Receive", "truck"]].map(([l, ic]) => `<button class="mx-action" type="button" tabindex="-1"><span class="mx-action__icon">${I(ic)}</span>${l}</button>`).join("")}</div>
      ${section("Needs you", "See all")}
      <div class="ax-mlist">
        ${[["clipboard-check", "yellow", "Approve PO-2231", "Shree Textiles · 400 tees", "₹1,24,000"], ["file-text", "red", "INV-0147 is overdue", "Fernway Bank · 6 days late", "₹42,480"], ["arrow-left-right", "blue", "Transfer TR-088 arrived", "Chakan → Main · 3 items", "Check"]].map(([ic, t, ti, sub, m]) => `<div class="ax-mrow" style="--sep:72px"><span class="mx-thumb tone-${t}">${I(ic)}</span><span class="ax-mrow__text"><span class="ax-mrow__title">${ti}</span><span class="ax-mrow__sub">${sub}</span></span><span class="mx-qty"><b>${m}</b></span></div>`).join("")}
      </div>
      <div style="height:24px"></div>
    </div>
    ${tabbar("Home")}`);

  /* ---------- 2. Inventory list ---------- */
  const inventory = () => screen(`
    ${topbar("", "Inventory", ring("bell", "Notifications", 1) + ring("sliders-horizontal", "Filter"))}
    <div class="ax-tabs mx-tabs" aria-label="Inventory views"><button class="ax-tab" type="button" tabindex="-1" aria-selected="true">Products</button><button class="ax-tab" type="button" tabindex="-1">Warehouses</button><button class="ax-tab" type="button" tabindex="-1">Transfers</button><button class="ax-tab" type="button" tabindex="-1">Counts</button></div>
    <div class="ax-scroll">
      <div class="ax-msearch" style="padding-top:12px"><label class="ax-msearch__field">${I("search")}<input type="search" placeholder="Name, SKU or barcode" aria-label="Search products" tabindex="-1"></label></div>
      <div class="ax-hscroll">${[["All", 248, 1], ["Low stock", 7], ["Out of stock", 2], ["Clothes", 86], ["Grocery", 54], ["Kitchen", 31]].map(([l, n, on]) => `<button class="ax-chip" type="button" tabindex="-1" aria-pressed="${!!on}">${l} <span class="t-mono-micro" style="margin-left:4px">${n}</span></button>`).join("")}</div>
      <div class="mx-strip"><span>Stock value <b class="ax-num">₹18.4L</b></span><span>Sorted by <b>Name</b></span></div>
      <div class="ax-mlist ax-mlist--flush">
        ${PRODUCTS.map(([n, sku, ic, t, q, u, wh, st]) => `<div class="ax-mrow" style="--sep:72px">${thumb(ic, t)}<span class="ax-mrow__text"><span class="ax-mrow__title">${n}</span><span class="ax-mrow__sub"><span class="t-mono-id">${sku}</span> · ${wh}</span></span><span class="mx-qty"><b class="${st === "Out" ? "tx-neg" : ""}">${q.toLocaleString("en-IN")}</b>${st ? tag(st === "Low" ? "Low" : "Out", st === "Low" ? "orange" : "red") : `<small>${u}</small>`}</span></div>`).join("")}
      </div>
      <div style="height:96px"></div>
    </div>
    <button class="ax-fab" type="button" tabindex="-1" data-extended>${I("plus")}<span class="ax-fab__label">Add product</span></button>
    ${tabbar("Inventory")}`);

  /* ---------- 3. Product detail ---------- */
  const product = () => screen(`
    ${topbar(back("Inventory"), "", ring("share-2", "Share") + ring("ellipsis", "More"))}
    <div class="ax-scroll">
      <div class="mx-media tone-orange">${I("shirt", 88)}<span class="mx-media__count">1 / 4</span></div>
      <div class="mx-title"><span class="t-mono-id">SKU-1042 · Clothes</span><h2>Classic crew tee</h2><div class="mx-row" style="justify-content:flex-start;gap:6px">${tag("In stock", "green")}<span class="ax-tag">5% GST</span><span class="ax-tag">4 variants</span></div></div>
      <div class="mx-cells">${[["Selling", "₹349"], ["Cost", "₹210"], ["Margin", "40%"]].map(([k, v]) => `<div class="mx-cell"><span class="t-caption tx-3">${k}</span><b class="ax-num">${v}</b></div>`).join("")}</div>
      ${section("Stock by warehouse", "Transfer")}
      <div class="mx-card">
        ${[["Main warehouse", 96, ".68", 1, ""], ["Chakan", 38, ".27", 2, ""], ["Hosur", 8, ".06", 4, "Below reorder point"]].map(([w, q, v, c, warn]) => `<div class="mx-wh"><div class="mx-row"><span class="t-body">${w}</span><b class="ax-num">${q} pcs</b></div>${meter(v, c)}${warn ? `<span class="t-caption" style="color:var(--axiom-text-negative)">${warn}</span>` : ""}</div>`).join("")}
        <div class="mx-row mx-total"><span class="t-body tx-2">On hand</span><b class="ax-num">142 pcs</b></div>
      </div>
      ${section("Variants")}
      <div class="ax-hscroll">${["S · 28", "M · 46", "L · 41", "XL · 27"].map((s, i) => `<button class="ax-chip" type="button" tabindex="-1" aria-pressed="${i === 1}">${s}</button>`).join("")}</div>
      ${section("Recent movement")}
      <div class="ax-mlist">
        ${[["arrow-down-left", "green", "Received 50", "PO-2231 · Main · today", "+50"], ["arrow-up-right", "blue", "Sold 12", "SO-1184 · Lumen Health", "−12"], ["arrow-left-right", "violet", "Moved 20", "Main → Chakan · Mon", "20"]].map(([ic, t, ti, sub, m]) => `<div class="ax-mrow" style="--sep:72px"><span class="mx-thumb mx-thumb--sm tone-${t}">${I(ic)}</span><span class="ax-mrow__text"><span class="ax-mrow__title">${ti}</span><span class="ax-mrow__sub">${sub}</span></span><span class="mx-qty"><b class="ax-num">${m}</b></span></div>`).join("")}
      </div>
      <div style="height:112px"></div>
    </div>
    <div class="ax-mcta mx-cta"><button class="ax-btn ax-btn--m" type="button" tabindex="-1">${I("arrow-left-right")}Transfer</button><button class="ax-btn ax-btn--primary ax-btn--m" type="button" tabindex="-1">Adjust stock</button></div>`);

  /* ---------- 4. New sales order ---------- */
  const LINES = [["Classic crew tee", "M · Navy", "shirt", "orange", 349, 4], ["Steel pressure cooker 3L", "Main warehouse", "cooking-pot", "blue", 1290, 1], ["Cotton bath towel", "White", "bath", "teal", 249, 2]];
  const sub = LINES.reduce((a, l) => a + l[4] * l[5], 0), gst = Math.round(sub * 0.05);
  const order = () => screen(`
    ${topbar(`<button class="ax-btn ax-btn--ghost ax-btn--sm mx-textbtn" type="button" tabindex="-1">Cancel</button>`, "New order", `<button class="ax-btn ax-btn--ghost ax-btn--sm mx-textbtn" type="button" tabindex="-1">Save draft</button>`)}
    <div class="ax-scroll">
      <div class="mx-steps" aria-label="Step 2 of 3"><span class="is-done"></span><span class="is-done"></span><span></span></div>
      <p class="t-caption tx-3 mx-pad" style="margin:8px 0 0">Step 2 of 3 · Items</p>
      <div class="mx-form">
        <div class="ax-field"><span class="ax-field__title">Customer</span><div class="ax-control mx-pick"><span class="ax-avatar tone-blue" style="--size:28px">LH</span><span class="mx-pick__text"><b>Lumen Health</b><small>GSTIN 27AAACL4521M1Z5</small></span>${I("chevron-down")}</div></div>
        <div class="ax-field"><span class="ax-field__title">Deliver from</span><div class="ax-control mx-pick">${I("store")}<span class="mx-pick__text"><b>Main warehouse</b></span>${I("chevron-down")}</div></div>
      </div>
      ${section("Items · 3", "Scan")}
      <div class="mx-lines">
        ${LINES.map(([n, v, ic, t, p, q]) => `<div class="mx-line">${thumb(ic, t)}<div class="mx-line__main"><b>${n}</b><span class="t-caption tx-3">${v} · ${inr(p)} each</span><div class="mx-row"><span class="mx-stepper"><button type="button" tabindex="-1" aria-label="Fewer">${I("minus")}</button><span class="ax-num">${q}</span><button type="button" tabindex="-1" aria-label="More">${I("plus")}</button></span><b class="ax-num">${inr(p * q)}</b></div></div></div>`).join("")}
        <button class="ax-btn ax-btn--ghost ax-btn--m mx-add" type="button" tabindex="-1">${I("plus")}Add item</button>
      </div>
      ${section("Payment")}
      <div class="mx-pad"><div class="ax-segmented ax-segmented--sm" style="width:100%"><button type="button" tabindex="-1" aria-checked="false">Paid now</button><button type="button" tabindex="-1" aria-checked="true">15 days</button><button type="button" tabindex="-1" aria-checked="false">30 days</button></div></div>
      <div class="mx-card" style="margin-top:16px;gap:8px">
        <div class="mx-row"><span class="t-body tx-2">Subtotal</span><span class="ax-num">${inr(sub)}</span></div>
        <div class="mx-row"><span class="t-body tx-2">GST 5%</span><span class="ax-num">${inr(gst)}</span></div>
        <div class="mx-row mx-total"><b>Total</b><b class="mx-total__value ax-num">${inr(sub + gst)}</b></div>
      </div>
      <div style="height:112px"></div>
    </div>
    <div class="ax-mcta"><button class="ax-btn ax-btn--primary ax-btn--m" type="button" tabindex="-1">Review order · ${inr(sub + gst)}</button></div>`);

  /* ---------- 5. Invoice ---------- */
  const invoice = () => screen(`
    ${topbar(back("Sales"), "INV-0147", ring("share-2", "Share") + ring("ellipsis", "More"))}
    <div class="ax-scroll">
      <div class="mx-hero mx-hero--alert" style="margin-top:8px">
        <div class="mx-row">${tag("Overdue · 6 days", "red")}<span class="t-mono-id">Due 20 Nov</span></div>
        <span class="mx-hero__value">₹42,480</span>
        <span class="t-body tx-2">Fernway Bank · issued 5 Nov</span>
        <div class="mx-paid"><div class="mx-row"><span class="t-caption tx-3">Paid ₹20,000</span><span class="t-caption tx-3">Left ₹22,480</span></div>${meter(".47", 2)}</div>
      </div>
      ${section("Items")}
      <div class="ax-mlist">
        ${[["Website redesign · Design stage", "1 × ₹30,000", 30000], ["Copywriting, 8 pages", "8 × ₹1,000", 8000], ["Stock photo licences", "4 × ₹500", 2000]].map(([n, q, v]) => `<div class="ax-mrow"><span class="ax-mrow__text"><span class="ax-mrow__title">${n}</span><span class="ax-mrow__sub">${q}</span></span><span class="mx-qty"><b class="ax-num">${inr(v)}</b></span></div>`).join("")}
      </div>
      <div class="mx-card" style="margin-top:8px;gap:8px">
        <div class="mx-row"><span class="t-body tx-2">Subtotal</span><span class="ax-num">₹40,000</span></div>
        <div class="mx-row"><span class="t-body tx-2">GST 18% · split CGST/SGST</span><span class="ax-num">₹2,480</span></div>
        <div class="mx-row mx-total"><b>Total</b><b class="mx-total__value ax-num">₹42,480</b></div>
      </div>
      ${section("Activity")}
      <ol class="mx-activity">
        ${[["Part payment received", "₹20,000 by UPI · 15 Nov", "green", "circle-check-big"], ["Reminder sent", "Email to accounts@fernway.in · 21 Nov", "blue", "bell"], ["Viewed by client", "11 Nov, 4:12 PM", "", "file-text"], ["Invoice sent", "5 Nov", "", "receipt"]].map(([t, s, tone, ic]) => `<li><span class="mx-activity__dot ${tone ? "tone-" + tone : ""}">${I(ic)}</span><div><b>${t}</b><span class="t-caption tx-3">${s}</span></div></li>`).join("")}
      </ol>
      <div style="height:112px"></div>
    </div>
    <div class="ax-mcta mx-cta"><button class="ax-btn ax-btn--m" type="button" tabindex="-1">${I("bell")}Remind</button><button class="ax-btn ax-btn--primary ax-btn--m" type="button" tabindex="-1">Record payment</button></div>`);

  /* ---------- 6. Reports ---------- */
  const DAYS = [["Mon", 52], ["Tue", 61], ["Wed", 48], ["Thu", 70], ["Fri", 84], ["Sat", 96], ["Sun", 41]];
  const reports = () => screen(`
    <div class="ax-safe-top"></div>
    <div class="ax-scroll">
      <div class="mx-hello" style="padding-bottom:4px"><div class="mx-hello__text"><h2 class="mx-h1">Reports</h2></div>${ring("calendar-days", "Pick dates")}${ring("share-2", "Export")}</div>
      <div class="mx-pad"><div class="ax-segmented ax-segmented--sm" style="width:100%"><button type="button" tabindex="-1" aria-checked="true">Week</button><button type="button" tabindex="-1" aria-checked="false">Month</button><button type="button" tabindex="-1" aria-checked="false">Quarter</button></div></div>
      <div class="mx-card" style="margin-top:12px">
        <div class="mx-row"><span class="t-body tx-2">Revenue · 20–26 Nov</span><span class="ax-tag tone-green">${I("arrow-up", 12)}6.4%</span></div>
        <span class="mx-hero__value" style="margin-top:-6px">₹4,52,000</span>
        <div class="mx-bars">${DAYS.map(([d, v], i) => `<div class="mx-bar${i === 5 ? " is-peak" : ""}"><span style="--v:${v / 100}"></span><small>${d}</small></div>`).join("")}</div>
        <span class="t-caption tx-3">Best day Saturday, ₹96,000 from 41 orders.</span>
      </div>
      ${section("Top products", "All")}
      <div class="mx-card" style="gap:14px">
        ${[["Classic crew tee", 38, 1], ["Basmati rice 25 kg", 26, 2], ["Steel pressure cooker", 18, 3], ["Cotton bath towel", 11, 4]].map(([n, p, c]) => `<div class="mx-share"><div class="mx-row"><span class="t-body">${n}</span><span class="ax-num t-body tx-2">${p}%</span></div><div class="mx-share__track"><span style="width:${p * 2.4}%;background:var(--ax-chart-${c})"></span></div></div>`).join("")}
      </div>
      ${section("Money to collect")}
      <div class="mx-card">
        <div class="mx-row"><span class="mx-hero__value" style="font-size:24px;line-height:30px">₹2,84,000</span><span class="t-caption tx-3">9 invoices</span></div>
        <div class="mx-aging">${[[46, 2], [28, 4], [16, 6], [10, 3]].map(([p, c]) => `<span style="flex:${p};background:var(--ax-chart-${c})"></span>`).join("")}</div>
        <div class="mx-legend">${[["0–30 days", "₹1.31L", 2], ["31–60", "₹79.5K", 4], ["61–90", "₹45.4K", 6], ["90+", "₹28.4K", 3]].map(([l, v, c]) => `<span style="--c:var(--ax-chart-${c})"><i></i>${l}<b class="ax-num">${v}</b></span>`).join("")}</div>
      </div>
      <div style="height:24px"></div>
    </div>
    ${tabbar("Reports")}`);

  const MSCREENS = { home, inventory, product, order, invoice, reports };
  $$("[data-mscreen]").forEach((el) => { const f = MSCREENS[el.dataset.mscreen]; if (f) el.outerHTML = f(); });
})();
