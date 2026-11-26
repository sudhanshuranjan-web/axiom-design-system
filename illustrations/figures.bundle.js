/* Generated from illustrations/<name>.js (the hairline figures, unchanged).
   Each runs in its own scope so several can share one page. Rebuild after editing a figure. */
/* ---- cardfile.js ---- */
(() => {
/**
 * Cardfile: AXIOM's "inbox zero" illustration. An index-card box holds six
 * divider tabs and no cards between them. The divider under the pointer
 * stands up; the ones in front lean forward and the ones behind lean back,
 * staggered outwards from it on the 700ms lift curve. Each divider's place is
 * punched on its tab as dots, and the read-out counts the cards filed behind
 * it: none. The slider is the stagger, in ms.
 *
 * The pattern: discrete items (Riffle's answer), with the emptiness as the
 * subject: the box is whole and composed, only the cards are missing.
 */
const {
  Cam, clamp, facing, fillet, fit, hull, open, poly, proj, rad, ringAt, rrect, run, seg,
  tdone, tset, tval, tween, disposer, mk, place, pointer, register,
} = HL;

const N = 6, W = 92, H = 40, G = 17, TW = 24, TH = 9, TABS = [8, 34, 60], TK = 1.4;
const REST = -16, BACK = -28, FWD = 22, LIFT = 12;
const X0 = -6, X1 = W + 6, Y0 = -10, Y1 = (N - 1) * G + 12, WH = 24, WR = 6, WT = 2.4;
const LR = (pts) => (pts[0][0] <= pts[pts.length - 1][0] ? pts : pts.slice().reverse());

function box(P, front, outer, inner) {
  const far = [
    [poly(hull(ringAt(P, outer, 0).concat(ringAt(P, outer, WH)))), "sil"],
    [poly(ringAt(P, inner, WH)), "nf"],
    [open(ringAt(P, run(inner, (q) => !front(q)), 2.5)), "nf lo"],
    // the rod a card file's dividers ride on, painted on the floor behind them
    [seg(P(W / 2, Y0 + 4, 3), P(W / 2, Y1 - 4, 3)), "nf lo dash"],
  ];
  const iF = LR(ringAt(P, run(inner, front), WH)), oT = LR(ringAt(P, run(outer, front), WH)), oB = LR(ringAt(P, run(outer, front), 0));
  const hx = (X0 + X1) / 2, onFront = (ring) => ring.map((q) => P(q.u, Y1, q.v));
  const near = [
    [poly([...iF, oT[oT.length - 1], ...oB.slice().reverse(), oT[0]]), "fo"],
    [open(oT), "nf lo"],
    [open(iF), "nf"],
    [open([oT[0], ...oB, oT[oT.length - 1]]), "nf sil"],
    // a label frame on the front, holding no label
    [poly(onFront(rrect(hx - 16, 8, hx + 16, 17, 2, 5))), "nf"],
  ];
  return { far, near };
}

function divider(i) {
  const t0 = TABS[i % 3];
  const shape = fillet(
    [[0, 0], [W, 0], [W, H], [t0 + TW, H], [t0 + TW, H + TH], [t0, H + TH], [t0, H], [0, H]],
    [1, 1, 3.2, 1.8, 2.4, 2.4, 1.8, 3.2],
  );
  return { t0, shape };
}

function pose(P, i, t0, shape, th, lift) {
  const yb = i * G, s = Math.sin(rad(th)), c = Math.cos(rad(th));
  const w = (u, v) => P(u, yb + v * s, v * c + lift);
  const wb = (u, v) => P(u, yb + v * s - TK * c, v * c + TK * s + lift);
  const punch = [];
  for (let k = 0; k < 6; k++) punch.push(w(t0 + TW / 2 + ((k % 3) - 1) * 4.6, H + TH / 2 + (0.5 - Math.floor(k / 3)) * 3.2));
  return { back: poly(shape.map((p) => wb(p[0], p[1]))), face: poly(shape.map((p) => w(p[0], p[1]))), punch };
}

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let stag = value;
  const C = Cam(45, 0.5, 1.74);
  fit(C, [[X0, Y0, 0], [X1, Y1, 0], [X1, Y0, 0], [X0, Y1, 0], [X0, Y0, H + TH], [X1, Y0, H + TH + LIFT]], 200, 166);
  const P = proj(C), front = facing(C);
  const outer = rrect(X0, Y0, X1, Y1, WR, 6), inner = rrect(X0 + WT, Y0 + WT, X1 - WT, Y1 - WT, WR - WT, 6);
  const paths = box(P, front, outer, inner);

  const g = mk("g", {}, svg);
  for (const [d, cls] of paths.far) mk("path", { d, class: cls }, g);
  const tabs = [];
  for (let i = 0; i < N; i++) {
    const { t0, shape } = divider(i);
    const grp = mk("g", {}, g);
    const back = mk("path", { class: "lo" }, grp), face = mk("path", { class: "sil" }, grp);
    // its place, punched on the tab: i + 1 dots of six lit medium, the rest dim
    const punch = [];
    for (let k = 0; k < 6; k++) punch.push(mk("circle", { r: 1.1, class: "dot " + (k <= i ? "m" : "off") }, grp));
    tabs.push({ t0, shape, back, face, punch, a: tween(REST), z: tween(0) });
  }
  for (const [d, cls] of paths.near) mk("path", { d, class: cls }, g);

  // rule 01: hit bands along the RESTING top edges, which never move
  const top = (i) => P(W / 2, i * G + H * Math.sin(rad(REST)), H * Math.cos(rad(REST)));
  const c0 = top(0), c1 = top(1), d = [c1[0] - c0[0], c1[1] - c0[1]];
  const px0 = P(0, 0, 0), px1 = P(1, 0, 0), ex = [px1[0] - px0[0], px1[1] - px0[1]];
  const HALF = W / 2 + 6, det = d[0] * ex[1] - d[1] * ex[0];
  function hit([x, y]) {
    const qx = x - c0[0], qy = y - c0[1];
    const s = (qx * ex[1] - qy * ex[0]) / det, r = (d[0] * qy - d[1] * qx) / det;
    if (Math.abs(r) > HALF || s < -0.5 || s > N + 0.5) return -1;
    return clamp(Math.round(s), 0, N - 1);
  }

  function draw(i, th, lift) {
    const t = tabs[i], q = pose(P, i, t.t0, t.shape, th, lift);
    t.back.setAttribute("d", q.back); t.face.setAttribute("d", q.face);
    t.punch.forEach((el, k) => place(el, q.punch[k]));
  }
  const B = register(stage, (_dt, now) => {
    let moving = false;
    tabs.forEach((t, i) => { draw(i, tval(t.a, now), tval(t.z, now)); if (!tdone(t.a, now) || !tdone(t.z, now)) moving = true; });
    return moving;
  });
  bag.add(B.unregister);

  // rest: the front divider's edge is the one bright mark
  const RESTMARK = N - 1;
  tabs[RESTMARK].face.classList.add("hi");
  let act = -1;
  function setActive(a) {
    if (a === act) return;
    const now = performance.now(), from = a >= 0 ? a : act;
    act = a;
    tabs.forEach((t, i) => {
      const delay = Math.abs(i - from) * stag;
      tset(t.a, a < 0 ? REST : i < a ? BACK : i > a ? FWD : 0, now, delay);
      tset(t.z, a === i ? LIFT : 0, now, delay);
      t.face.classList.toggle("hi", a < 0 ? i === RESTMARK : i === a);
    });
    read.textContent = a < 0 ? "rest" : `tab ${a + 1} · 0`;
    B.wake();
  }
  bag.add(pointer(stage, { move: (p) => setActive(hit(p)), leave: () => setActive(-1) }));
  bag.add(() => svg.replaceChildren());
  return { set: (v) => { stag = v; }, destroy: bag.dispose };
}

hairline({
  name: "cardfile",
  means: "A card box with six dividers and no cards: the divider under the pointer stands up, and each reads empty.",
  rules: [1, 2, 5, 10],
  range: [0, 45, 90],
  tour: [[170, 150], [205, 128], [250, 112], null],
  mount,
});
})();
/* ---- sieve.js ---- */
(() => {
/**
 * Sieve: AXIOM's "no results" illustration. A round sieve with a bare mesh
 * hangs over an empty catch dish. The pointer tilts the sieve towards it, as a
 * hand shaking it would, on two springs; nothing falls through. The mesh cell
 * under the pointer takes the bright dot and the read-out counts what it holds:
 * none. At rest the sieve leans a little towards the viewer and its centre
 * cell is lit. The slider is the most it tilts, in degrees.
 *
 * The pattern: a continuous answer (springs) over a rest-pose hit test on the
 * mesh plane, which never moves.
 */
const {
  Cam, circ, clamp, facing, fit, hull, open, poly, proj, prism, rad, rings, rrect, run, unproj,
  spring, stepS, mk, place, pointer, put, register, disposer, solid,
} = HL;

const R = 46, RT = 2.4, Z0 = 34, Z1 = 46, MZ = 36, STEP = 8.6, HX = 30, HW = 7;
const DR = 62, DZ = 7;                                // the catch dish
const REST = [-0.06, 0.05];                           // the rest lean: towards the viewer

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let T = Math.tan(rad(value));
  const C = Cam(45, 0.5, 1.9);
  const tmax = Math.tan(rad(16));
  fit(C, [[-DR, -DR, 0], [DR, DR, 0], [DR, -DR, 0], [-DR, DR, 0], [-R, -R, Z1 + R * tmax], [R + HX, 0, Z1 + (R + HX) * tmax]], 200, 160);
  const P = proj(C), front = facing(C);

  const outer = circ(R, 40), inner = circ(R - RT, 40);
  const g = mk("g", {}, svg);

  // the dish: static, painted first
  // a large round: more steps per corner than rings() takes, so no facets show (rule 09)
  const dr = rrect(-DR, -DR, DR, DR, DR, 14), di = rrect(-DR + 2.2, -DR + 2.2, DR - 2.2, DR - 2.2, DR - 2.2, 14);
  put(solid(g), prism(P, front, dr, di, 0, DZ));
  mk("path", { d: poly(circ(DR - 6, 40).map((q) => P(q.u, q.v, DZ))), class: "nf lo" }, g);

  // the mesh cells, inside the rim
  const cells = [];
  for (let i = -5; i <= 5; i++) for (let j = -5; j <= 5; j++) {
    const x = i * STEP, y = j * STEP;
    if (Math.hypot(x, y) > R - 6) continue;
    cells.push({ i, j, x, y });
  }
  const centre = cells.find((c) => c.i === 0 && c.j === 0);

  const body = mk("path", { class: "sil" }, g);
  const rimIn = mk("path", { class: "nf" }, g);
  const mesh = mk("path", { class: "nf lo" }, g);
  const dots = mk("g", {}, g);
  cells.forEach((c) => (c.el = mk("circle", { r: 1.25, class: "dot off" }, dots)));
  const nearFill = mk("path", { class: "fo" }, g);
  const nearTop = mk("path", { class: "nf lo" }, g);
  const nearIn = mk("path", { class: "nf" }, g);
  const nearBase = mk("path", { class: "nf sil" }, g);
  const handle = solid(g);

  const sx = spring(REST[0], { eps: 0.0004 }), sy = spring(REST[1], { eps: 0.0004 });
  const zAt = (x, y, z) => z + x * sx.x + y * sy.x;
  const at = (ring, z) => ring.map((q) => P(q.u, q.v, zAt(q.u, q.v, z)));
  const LR = (pts) => (pts[0][0] <= pts[pts.length - 1][0] ? pts : pts.slice().reverse());
  let drawn = "";

  function draw() {
    const key = sx.x.toFixed(4) + "," + sy.x.toFixed(4);
    if (key === drawn) return;
    drawn = key;
    body.setAttribute("d", poly(hull(at(outer, Z0).concat(at(outer, Z1)))));
    rimIn.setAttribute("d", poly(at(inner, Z1)));
    // the mesh: a few wires across the floor of the sieve
    let w = "";
    for (let k = -4; k <= 4; k++) {
      const o = k * STEP + STEP / 2, h = Math.sqrt(Math.max(0, (R - RT) ** 2 - o * o));
      const a = P(o, -h, zAt(o, -h, MZ)), b = P(o, h, zAt(o, h, MZ));
      const c = P(-h, o, zAt(-h, o, MZ)), d = P(h, o, zAt(h, o, MZ));
      w += `M${a[0]},${a[1]}L${b[0]},${b[1]}M${c[0]},${c[1]}L${d[0]},${d[1]}`;
    }
    mesh.setAttribute("d", w);
    cells.forEach((c) => place(c.el, P(c.x, c.y, zAt(c.x, c.y, MZ))));
    // the near wall: one opaque piece from the rim's inner edge down to the base
    const iF = LR(at(run(inner, front), Z1)), oT = LR(at(run(outer, front), Z1)), oB = LR(at(run(outer, front), Z0));
    nearFill.setAttribute("d", poly([...iF, oT[oT.length - 1], ...oB.slice().reverse(), oT[0]]));
    nearTop.setAttribute("d", open(oT));
    nearIn.setAttribute("d", open(iF));
    nearBase.setAttribute("d", open([oT[0], ...oB, oT[oT.length - 1]]));
    // the handle, a rounded bar riveted to the rim at +x
    const [hr, hi] = rings(R - 4, -HW / 2, R + HX, HW / 2, HW / 2, 1);
    const hs = at(hr, Z1 - 5), ht = at(hr, Z1 - 1);
    put(handle, { sil: poly(hull(hs.concat(ht))), crease: open(at(run(hi, front), Z1 - 1)) });
  }

  const B = register(stage, (dt) => {
    const m = stepS(sx, dt) | stepS(sy, dt);
    draw();
    return !!m;
  });
  bag.add(B.unregister);

  let lit = centre;
  centre.el.setAttribute("class", "dot");
  function light(c) {
    if (c === lit) return;
    if (lit) lit.el.setAttribute("class", "dot off");
    lit = c || centre;
    lit.el.setAttribute("class", "dot");
  }

  bag.add(pointer(stage, {
    move: (p) => {
      // rule 01: the pointer meets the mesh in its REST plane, which never moves
      const [x, y] = unproj(C, p[0], p[1], MZ);
      sx.t = clamp(x / R, -1, 1) * T; sy.t = clamp(y / R, -1, 1) * T;
      const c = cells.reduce((a, b) => (Math.hypot(b.x - x, b.y - y) < Math.hypot(a.x - x, a.y - y) ? b : a));
      const inside = Math.hypot(c.x - x, c.y - y) < STEP * 0.8;
      light(inside ? c : null);
      read.textContent = inside ? `mesh ${c.i + 5}·${c.j + 5} · 0` : "sieve · 0";
      B.wake();
    },
    leave: () => { sx.t = REST[0]; sy.t = REST[1]; light(null); read.textContent = "rest"; B.wake(); },
  }));
  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => { T = Math.tan(rad(v)); B.wake(); },
    destroy: bag.dispose,
  };
}

hairline({
  name: "sieve",
  means: "A sieve over an empty dish tilts towards the pointer, and every cell of its mesh reads empty.",
  rules: [1, 3, 5, 8],
  range: [4, 9, 16],
  tour: [[160, 150], [236, 132], [214, 186], null],
  mount,
});
})();
/* ---- pegboard.js ---- */
(() => {
/**
 * Pegboard: AXIOM's "your sprint" illustration, for onboarding and empty
 * dashboards. A board of round pegs, seven days by four weeks; each peg's
 * height is the work closed that day. At rest the board rises along a steady
 * burn-up, highest at the latest day, which carries the bright edge and a dot
 * on its cap. The pointer is put on the board's plane and the pegs near it rise
 * on their own springs, falling off with distance; the peg under it takes the
 * bright edge. The slider is the reach, in pegs.
 *
 * The pattern: a continuous field (Terrain's answer) on round solids.
 */
const {
  Cam, clamp, facing, fit, prism, proj, rings, rrect, unproj, spring, stepS,
  flatDot, mk, place, pointer, put, register, disposer, solid,
} = HL;

const NX = 7, NY = 4, CELL = 17, FOOT = 10, HMAX = 46, PB = 6, M = 9;
const EX = NX * CELL, EY = NY * CELL;
const falloff = (u) => (u <= 0 ? 1 : u <= 0.45 ? 1 - (u / 0.45) * 0.62 : u <= 1 ? 0.38 - ((u - 0.45) / 0.55) * 0.28 : 0.1);

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let R = value * CELL, over = null;
  const C = Cam(45, 0.5, 1.86);
  fit(C, [[-M, -M, -PB], [EX + M, EY + M, -PB], [EX + M, -M, -PB], [-M, EY + M, -PB], [0, 0, HMAX], [EX, 0, HMAX]], 200, 168);
  const P = proj(C), front = facing(C);
  const g = mk("g", {}, svg);

  // the board, with a routed groove round its top
  put(solid(g), prism(P, front, rrect(-M, -M, EX + M, EY + M, 8, 6), rrect(-M + 2, -M + 2, EX + M - 2, EY + M - 2, 6, 6), -PB, 0));
  mk("path", { d: "M" + rrect(-M + 4.5, -M + 4.5, EX + M - 4.5, EY + M - 4.5, 4, 6).map((q) => P(q.u, q.v, 0).join(",")).join("L") + "Z", class: "nf lo" }, g);

  const pegs = [];
  // back to front: by ascending i + j from the far corner
  for (let s = 0; s <= NX + NY - 2; s++) for (let i = 0; i < NX; i++) {
    const j = s - i;
    if (j < 0 || j >= NY) continue;
    // rest: the board climbs away from the viewer, so short near pegs never hide tall far ones (rule 05)
    const day = (NY - 1 - j) * NX + (NX - 1 - i), h0 = 3 + 28 * Math.pow(((NX - 1 - i) + (NY - 1 - j)) / (NX + NY - 2), 1.5);
    const x0 = i * CELL + (CELL - FOOT) / 2, y0 = j * CELL + (CELL - FOOT) / 2;
    const [ring, inner] = rings(x0, y0, x0 + FOOT, y0 + FOOT, FOOT / 2, 1);
    pegs.push({ i, j, day, h0: Math.max(2, h0), ring, inner, el: solid(g), sp: spring(Math.max(2, h0), { eps: 0.04 }), drawn: NaN });
  }
  const latest = pegs.reduce((a, b) => (b.day > a.day ? b : a));
  const cap = mk("g", {}, g), capDot = flatDot(cap, C, 0.75, "dot");
  let lit = latest;

  function drawPeg(p) {
    const h = Math.max(0.8, p.sp.x);
    if (h === p.drawn) return;
    p.drawn = h;
    put(p.el, prism(P, front, p.ring, p.inner, 0, h));
  }
  function drawCap() {
    p0.el.g.after(cap);
    place(capDot, P((lit.i + 0.5) * CELL, (lit.j + 0.5) * CELL, Math.max(0.8, lit.sp.x)));
  }
  let p0 = latest;
  const B = register(stage, (dt) => {
    let m = false;
    for (const p of pegs) { if (stepS(p.sp, dt)) m = true; drawPeg(p); }
    p0 = lit; drawCap();
    return m;
  });
  bag.add(B.unregister);
  latest.el.sil.classList.add("hi");

  function retarget() {
    let pick = latest;
    if (over) {
      const i = clamp(Math.floor(over[0] / CELL), 0, NX - 1), j = clamp(Math.floor(over[1] / CELL), 0, NY - 1);
      pick = pegs.find((p) => p.i === i && p.j === j);
      read.textContent = `w${j + 1} · d${i + 1}`;
    } else read.textContent = "rest";
    for (const p of pegs) {
      if (!over) { p.sp.t = p.h0; continue; }
      const dx = (p.i + 0.5) * CELL - over[0], dy = (p.j + 0.5) * CELL - over[1];
      p.sp.t = Math.max(p.h0 * 0.6, HMAX * falloff(Math.hypot(dx, dy) / R));
    }
    if (pick !== lit) { lit.el.sil.classList.remove("hi"); lit = pick; lit.el.sil.classList.add("hi"); }
    B.wake();
  }
  // rule 01: the pointer meets the board's plane, which never moves
  bag.add(pointer(stage, {
    move: (p) => { over = unproj(C, p[0], p[1], 0); retarget(); },
    leave: () => { over = null; retarget(); },
  }));
  bag.add(() => svg.replaceChildren());
  return { set: (v) => { R = v * CELL; if (over) retarget(); }, destroy: bag.dispose };
}

hairline({
  name: "pegboard",
  means: "A board of pegs, one a day: they climb a steady burn-up and rise around the pointer.",
  rules: [1, 3, 5, 9],
  range: [1.2, 2.2, 3.6],
  tour: [[150, 150], [232, 140], [214, 196], null],
  mount,
});
})();
