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
