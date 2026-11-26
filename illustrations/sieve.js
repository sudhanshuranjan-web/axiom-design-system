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
