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
