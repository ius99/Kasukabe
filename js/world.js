// ---------- Sky dressing ----------
const ground = add(new THREE.CircleGeometry(160, 48), toon(0x6c8a58), 0, 0, 20, scene, false);
ground.rotation.x = -Math.PI / 2;
[[-55, -70, 30, 0x6b5f9e], [5, -90, 40, 0x5a5292], [60, -75, 28, 0x6b5f9e], [-90, 20, 26, 0x7a6aa6], [90, 30, 28, 0x7a6aa6]].forEach(([x, z, r, c]) => {
  const h = add(new THREE.SphereGeometry(r, 18, 12), toon(c), x, -r * 0.45, z, scene, false);
  h.scale.y = 0.5;
});
const moon = new THREE.Mesh(new THREE.CircleGeometry(2.6, 32), new THREE.MeshBasicMaterial({ color: 0xfff3d2, fog: false }));
moon.position.set(-30, 40, -80); moon.lookAt(0, 4, 30); scene.add(moon);
const clouds = [];
const cloudMat = new THREE.MeshToonMaterial({ color: 0xffd8e6, gradientMap, emissive: 0xffa8c4, emissiveIntensity: 0.32, fog: false });
[[-40, 30, -90, 1.2], [15, 36, -100, 1.6], [55, 26, -85, 1.1], [-75, 22, -50, 1.0], [80, 24, -40, 1.2], [-12, 24, -70, 0.8]].forEach(([x, y, z, s]) => {
  const g = new THREE.Group(); g.position.set(x, y, z); scene.add(g);
  [[0, 0, 5], [5, -1, 4], [-5, -1.2, 3.6], [2, 2.6, 3.8], [-2.5, 2, 3.2]].forEach(([cx, cy, r]) => {
    const m = new THREE.Mesh(new THREE.SphereGeometry(r * s, 16, 12), cloudMat); m.position.set(cx * s, cy * s, 0); g.add(m);
  });
  g.scale.y = 0.7; clouds.push(g);
});

// colliders on the ground plane: rects [minX, maxX, minZ, maxZ] and circles [x, z, r]
const rects = [], circles = [];

// ---------- The lane ----------
const LANE_X = 2.65, LANE_END = 48.6;
const lane = add(new THREE.PlaneGeometry(5.1, LANE_END - 5.1), M.lane, 0, 0.012, (LANE_END + 5.1) / 2, scene, false);
lane.rotation.x = -Math.PI / 2;
paveTex.repeat.set(2, (LANE_END - 5.1) / 2.5);

// neighbours' houses: built facing local +z, then turned toward the lane
function neighborHouse(x, z, rotY, o) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = rotY; scene.add(g);
  const { w, d, wall, roof } = o, lit = o.lit || [1, 1, 1, 1];
  ink = 0.03;
  add(new THREE.BoxGeometry(w, 2.6, d), wall, 0, 1.3, 0, g);
  add(new THREE.BoxGeometry(w + 0.9, 0.14, d + 0.9), roof, 0, 2.66, 0, g);
  const uw = w - 0.6, ud = d - 1.0, uz = -0.3;
  add(new THREE.BoxGeometry(uw, 2.3, ud), wall, 0, 3.75, uz, g);
  add(new THREE.BoxGeometry(uw + 1.2, 0.12, ud + 1.2), roof, 0, 4.94, uz, g);
  ink = 0;
  const rg = new THREE.ConeGeometry(1, 1.6, 4, 1); rg.rotateY(Math.PI / 4);
  const r = add(rg, roof, 0, 5.0 + 0.8, uz, g);
  r.scale.set((uw / 2 + 0.6) / 0.7071, 1, (ud / 2 + 0.6) / 0.7071);
  r.add(new THREE.LineSegments(new THREE.EdgesGeometry(rg), edgeMat));
  const pane = (mat, ww, wh, px, py, pz, ry = 0) => { const m = add(new THREE.PlaneGeometry(ww, wh), mat, px, py, pz, g, false); m.rotation.y = ry; };
  const win = (on) => (on ? M.litWin : M.darkWin);
  const fz = d / 2 + 0.012, ufz = uz + ud / 2 + 0.012;
  pane(win(lit[0]), 1.5, 1.0, -w * 0.22, 1.55, fz);
  pane(M.litDoor, 1.1, 2.0, w * 0.22, 1.0, fz);
  pane(win(lit[1]), 1.7, 1.0, 0, 3.85, ufz);
  if (o.lite) return g;
  pane(win(lit[2]), 1.2, 0.9, -w / 2 - 0.012, 1.6, 0.4, -Math.PI / 2);
  pane(win(lit[3]), 1.2, 0.9, w / 2 + 0.012, 1.6, 0.4, Math.PI / 2);
  pane(win(lit[1]), 1.0, 0.8, -uw / 2 - 0.012, 3.8, uz, -Math.PI / 2);
  pane(win(lit[2]), 1.0, 0.8, uw / 2 + 0.012, 3.8, uz, Math.PI / 2);
  // balcony
  ink = 0.02;
  const bz = ufz + 0.4;
  add(new THREE.BoxGeometry(2.3, 0.07, 0.07), M.darkWood, 0, 3.42, bz, g);
  add(new THREE.BoxGeometry(2.3, 0.05, 0.05), M.darkWood, 0, 2.86, bz, g);
  for (let i = 0; i <= 6; i++) add(new THREE.BoxGeometry(0.04, 0.56, 0.04), M.darkWood, -1.15 + i * 0.383, 3.14, bz, g);
  // air-conditioner box and a drain pipe
  const side = o.acSide || 1;
  const ac = add(new THREE.BoxGeometry(0.32, 0.5, 0.72), toon(0xe6e2d8), side * (uw / 2 + 0.17), 3.2, uz + 0.5, g);
  ink = 0;
  const fan = add(new THREE.CircleGeometry(0.17, 16), toon(0x3a3a44), side * 0.165, 0, 0.08, ac, false); fan.rotation.y = side * Math.PI / 2;
  ink = 0.015;
  add(new THREE.CylinderGeometry(0.045, 0.045, 4.9, 6), toon(0x6e6a62), -side * (w / 2 + 0.06), 2.45, d / 2 - 0.12, g);
  ink = 0;
  return g;
}

const L = Math.PI / 2, Rr = -Math.PI / 2;
const leftHouses = [
  { z: 11, w: 6.2, d: 5, wall: M.boards, roof: M.roofs[0], lit: [1, 1, 0, 1] },
  { z: 20.5, w: 6.0, d: 5, wall: M.cream, roof: M.roofs[1], lit: [1, 0, 1, 1] },
  { z: 30, w: 6.4, d: 5, wall: M.boardsDark, roof: M.roofs[2], lit: [1, 1, 1, 0] },
  { z: 39.5, w: 6.0, d: 5, wall: M.grey, roof: M.roofs[3], lit: [0, 1, 1, 1] },
];
const rightHouses = [
  { z: 14, w: 6.0, d: 5, wall: M.cream, roof: M.roofs[2], lit: [1, 1, 1, 0], acSide: -1 },
  { z: 23.5, w: 6.2, d: 5, wall: M.boards, roof: M.roofs[0], lit: [1, 1, 0, 1], acSide: -1 },
  { z: 33, w: 6.0, d: 5, wall: M.grey, roof: M.roofs[1], lit: [0, 1, 1, 1], acSide: -1 },
  { z: 42.5, w: 6.4, d: 5, wall: M.boardsDark, roof: M.roofs[3], lit: [1, 0, 1, 1], acSide: -1 },
];
leftHouses.forEach((h) => { neighborHouse(-6.8, h.z, L, h); h.gate = h.z - 0.22 * h.w; });
rightHouses.forEach((h) => { neighborHouse(6.8, h.z, Rr, h); h.gate = h.z + 0.22 * h.w; });
// houses beside, behind and at the far end
neighborHouse(-11.2, 0.3, L, { w: 6.4, d: 5, wall: M.boards, roof: M.roofs[3], lit: [1, 1, 1, 1] });
neighborHouse(11.2, -0.5, Rr, { w: 6.2, d: 5, wall: M.cream, roof: M.roofs[0], lit: [1, 1, 1, 1], acSide: -1 });
neighborHouse(0, 55.5, Math.PI, { w: 6.6, d: 5, wall: M.boardsDark, roof: M.roofs[1], lit: [1, 1, 1, 1] });
[[-8.5, -12], [0.5, -12.5], [9, -12]].forEach(([x, z], i) => neighborHouse(x, z, 0, { w: 6.2, d: 5, wall: [M.cream, M.boards, M.grey][i], roof: M.roofs[i], lite: true, lit: [i !== 1, 1] }));
[12, 22, 32, 42].forEach((z, i) => neighborHouse(-14.5, z, L, { w: 6, d: 5, wall: i % 2 ? M.cream : M.boards, roof: M.roofs[(i + 1) % 4], lite: true, lit: [1, i % 2] }));
[16, 26, 36, 46].forEach((z, i) => neighborHouse(14.5, z, Rr, { w: 6, d: 5, wall: i % 2 ? M.boards : M.grey, roof: M.roofs[(i + 2) % 4], lite: true, lit: [i % 2, 1] }));

// block walls along the lane, with wooden gates in front of each house
ink = 0.03;
[-1, 1].forEach((s) => {
  add(new THREE.BoxGeometry(0.25, 1.15, LANE_END - 5.9), M.block, s * LANE_X, 0.575, (LANE_END + 5.9) / 2);
  add(new THREE.BoxGeometry(0.36, 0.08, LANE_END - 5.9), M.blockCap, s * LANE_X, 1.19, (LANE_END + 5.9) / 2);
});
add(new THREE.BoxGeometry(5.6, 1.15, 0.25), M.block, 0, 0.575, LANE_END + 0.05);
add(new THREE.BoxGeometry(5.6, 0.08, 0.36), M.blockCap, 0, 1.19, LANE_END + 0.05);
function gate(x, z, alongX) {
  const gw = alongX ? [1.2, 1.25, 0.34] : [0.34, 1.25, 1.2];
  add(new THREE.BoxGeometry(...gw), M.boards, x, 0.63, z);
  const off = 0.68;
  [-1, 1].forEach((k) => add(new THREE.BoxGeometry(0.3, 1.45, 0.3), M.blockCap, x + (alongX ? k * off : 0), 0.725, z + (alongX ? 0 : k * off)));
}
leftHouses.forEach((h) => gate(-LANE_X, h.gate, false));
rightHouses.forEach((h) => gate(LANE_X, h.gate, false));
gate(0.9, LANE_END + 0.05, true);
rects.push([LANE_X - 0.15, LANE_X + 0.2, 5.9, LANE_END + 0.2], [-LANE_X - 0.2, -LANE_X + 0.15, 5.9, LANE_END + 0.2], [-2.9, 2.9, LANE_END - 0.12, LANE_END + 0.3]);

// ---------- Home yard: walls, gate and nameplate ----------
add(new THREE.BoxGeometry(4.6, 1.15, 0.25), M.block, 3.85, 0.575, 6.0);
add(new THREE.BoxGeometry(4.6, 1.15, 0.25), M.block, -3.85, 0.575, 6.0);
add(new THREE.BoxGeometry(0.25, 1.15, 11.8), M.block, 6.05, 0.575, 0.1);
add(new THREE.BoxGeometry(0.25, 1.15, 11.8), M.block, -6.05, 0.575, 0.1);
add(new THREE.BoxGeometry(12.3, 1.15, 0.25), M.block, 0, 0.575, -5.75);
[[3.85, 6.0, 4.7, 0.36], [-3.85, 6.0, 4.7, 0.36], [6.05, 0.1, 0.36, 11.9], [-6.05, 0.1, 0.36, 11.9], [0, -5.75, 12.4, 0.36]].forEach(([x, z, w, d]) =>
  add(new THREE.BoxGeometry(w, 0.08, d), M.blockCap, x, 1.19, z));
[-1.55, 1.55].forEach((x) => { add(new THREE.BoxGeometry(0.26, 2.5, 0.26), M.post, x, 1.25, 6.0); circles.push([x, 6.0, 0.2]); });
add(new THREE.BoxGeometry(3.6, 0.18, 0.3), M.post, 0, 2.45, 6.0);
add(new THREE.BoxGeometry(4.0, 0.1, 0.8), M.roofs[0], 0, 2.62, 6.0);
ink = 0;
add(new THREE.PlaneGeometry(0.2, 0.6), toon(0xffffff, { map: plateTex }), 1.55, 1.6, 6.135, scene, false);
rects.push([1.45, 6.2, 5.85, 6.15], [-6.2, -1.45, 5.85, 6.15], [5.9, 6.2, -5.9, 6.15], [-6.2, -5.9, -5.9, 6.15], [-6.2, 6.2, -5.9, -5.6]);

// ---------- Trees ----------
ink = 0.045;
function roundTree(x, z, s) {
  const g = new THREE.Group(); g.position.set(x, 0, z); scene.add(g);
  add(new THREE.CylinderGeometry(0.18 * s, 0.28 * s, 2.2 * s, 7), toon(0x6a4030), 0, 1.1 * s, 0, g);
  const greens = [0x4f8a4a, 0x63a052, 0x3f7a44];
  [[0, 2.8, 0, 1.4], [1.0, 2.4, 0.3, 1.0], [-1.0, 2.5, -0.2, 1.05], [0.2, 3.5, -0.3, 1.0]].forEach(([bx, by, bz, r], i) =>
    add(new THREE.IcosahedronGeometry(r * s, 1), toon(greens[i % 3], { flatShading: true }), bx * s, by * s, bz * s, g));
}
function sakura(x, z, s) {
  const g = new THREE.Group(); g.position.set(x, 0, z); scene.add(g);
  add(new THREE.CylinderGeometry(0.16 * s, 0.3 * s, 2.8 * s, 7), toon(0x5a3430), 0, 1.4 * s, 0, g);
  const pinks = [0xffb3cb, 0xf596b8, 0xffcfe0];
  [[0, 3.3, 0, 1.4], [1.0, 3.0, 0.4, 1.0], [-1.0, 3.1, -0.3, 1.05], [0.2, 3.9, -0.5, 1.0], [-0.3, 2.9, 0.9, 0.9]].forEach(([bx, by, bz, r], i) =>
    add(new THREE.IcosahedronGeometry(r * s, 1), toon(pinks[i % 3], { flatShading: true }), bx * s, by * s, bz * s, g));
}
sakura(-5.0, 15.9, 1.2); sakura(5.0, 28.4, 1.15); sakura(-7.6, 4.2, 1.15); sakura(7.7, -3.6, 1.1); sakura(-4.6, 44.5, 0.95);
[[5.0, 18.9, 0.85], [-5.0, 34.9, 0.95], [5.0, 37.9, 0.85], [-5.0, 25.4, 0.8], [-9, -8, 1.2], [9.5, -8.5, 1.1], [7.8, 4.5, 0.9]].forEach((t) => roundTree(...t));

// ---------- Street furniture ----------
ink = 0.03;
const lampLights = [];
function lampHead(x, y, z) {
  add(new THREE.BoxGeometry(0.34, 0.3, 0.34), toon(0xfff1c8, { emissive: 0xffc070, emissiveIntensity: 1 }), x, y, z);
  add(new THREE.ConeGeometry(0.32, 0.18, 4), M.darkWood, x, y + 0.24, z).rotation.y = Math.PI / 4;
  const l = new THREE.PointLight(0xffc27a, 1.1, 10, 1.5); l.position.set(x, y - 0.2, z); scene.add(l); lampLights.push(l);
}
// free-standing lamp by the home gate
add(new THREE.CylinderGeometry(0.06, 0.08, 2.8, 8), toon(0x3a3440), 2.15, 1.4, 7.0); circles.push([2.15, 7.0, 0.15]);
lampHead(2.15, 2.95, 7.0);

// utility poles with sagging wires (a dusk-alley staple)
const poles = [[-2.25, 12.6], [2.25, 21.2], [-2.25, 32.6], [2.25, 40.2], [-2.25, 47.4]];
poles.forEach(([x, z], i) => {
  add(new THREE.CylinderGeometry(0.11, 0.15, 7.6, 8), toon(0x8e8478), x, 3.8, z);
  add(new THREE.BoxGeometry(1.5, 0.11, 0.11), toon(0x8e8478), x, 7.0, z).rotation.y = Math.PI / 2;
  add(new THREE.BoxGeometry(1.1, 0.1, 0.1), toon(0x8e8478), x, 6.4, z).rotation.y = Math.PI / 2;
  if (i % 2 === 0) add(new THREE.CylinderGeometry(0.2, 0.2, 0.55, 10), toon(0x9aa0a8), x + Math.sign(x) * 0.3, 5.7, z);
  if (i < 3) {
    add(new THREE.BoxGeometry(0.9, 0.05, 0.05), toon(0x3a3440), x - Math.sign(x) * 0.45, 4.2, z);
    lampHead(x - Math.sign(x) * 0.9, 4.0, z);
  }
  circles.push([x, z, 0.2]);
});
ink = 0;
const wire = (a, b, sag) => {
  const mid = a.clone().lerp(b, 0.5); mid.y -= sag;
  scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(new THREE.QuadraticBezierCurve3(a, mid, b).getPoints(18)), edgeMat));
};
const V = (x, y, z) => new THREE.Vector3(x, y, z);
for (let i = 0; i < poles.length - 1; i++) {
  const [x0, z0] = poles[i], [x1, z1] = poles[i + 1];
  [-0.6, 0, 0.6].forEach((o, k) => wire(V(x0, 7.05, z0 + o), V(x1, 7.05, z1 + o), 0.5 + k * 0.15));
  wire(V(x0, 6.45, z0 + 0.4), V(x1, 6.45, z1 - 0.4), 0.7);
}
poles.forEach(([x, z]) => wire(V(x, 6.4, z), V(Math.sign(x) * 4.4, 4.6, z + 1.2), 0.3));
wire(V(2.25, 6.4, 21.2), V(-4.4, 4.6, 19.5), 0.5);
wire(V(-2.25, 6.4, 12.6), V(1.2, 2.5, 6.0), 0.2);

// birds resting on the wires
ink = 0.012;
[[0, 0], [0, 0.6], [2, -0.6], [3, 0]].forEach(([i, o]) => {
  const [x0, z0] = poles[i], [x1, z1] = poles[i + 1];
  const g = new THREE.Group(); g.position.set((x0 + x1) / 2, 7.05 - 0.25 + 0.1, (z0 + z1) / 2 + o); scene.add(g);
  const b = add(new THREE.SphereGeometry(0.1, 10, 8), toon(0x2c2a38), 0, 0, 0, g, false); b.scale.set(0.9, 0.9, 1.4);
  add(new THREE.SphereGeometry(0.07, 10, 8), toon(0x2c2a38), 0, 0.09, 0.1, g, false);
  g.rotation.y = rand() * 6;
});

// vending machine glowing against the left wall
ink = 0.03;
const vend = add(new THREE.BoxGeometry(0.7, 1.85, 1.05), toon(0xd8443a), -2.15, 0.925, 24.9);
ink = 0;
const vf = add(new THREE.PlaneGeometry(0.95, 1.6), new THREE.MeshToonMaterial({ color: 0xffffff, map: vendTex, emissive: 0xffffff, emissiveMap: vendTex, emissiveIntensity: 0.75, gradientMap }), 0.355, 0.05, 0, vend, false);
vf.rotation.y = Math.PI / 2;
rects.push([-2.55, -1.78, 24.35, 25.45]);

// potted plants by the walls
ink = 0.025;
[[2.25, 9.2], [-2.25, 16.4], [2.25, 27.6], [-2.25, 36.6], [2.25, 45.8], [-2.25, 7.4]].forEach(([x, z]) => {
  add(new THREE.CylinderGeometry(0.2, 0.15, 0.32, 10), toon(0xc0643a), x, 0.16, z);
  add(new THREE.IcosahedronGeometry(0.28, 1), toon(0x5a9a4a, { flatShading: true }), x, 0.5, z);
  circles.push([x, z, 0.28]);
});

// a cat asleep on top of the wall
ink = 0.015;
const cat = new THREE.Group(); cat.position.set(LANE_X, 1.23, 30.8); scene.add(cat);
const catMat = toon(0xf0a050);
const catBody = add(new THREE.SphereGeometry(0.17, 14, 10), catMat, 0, 0.1, 0, cat); catBody.scale.set(0.9, 0.7, 1.5);
add(new THREE.SphereGeometry(0.12, 14, 10), catMat, 0, 0.13, 0.25, cat);
[-0.06, 0.06].forEach((x) => add(new THREE.ConeGeometry(0.04, 0.08, 4), catMat, x, 0.25, 0.25, cat));
const tail = add(new THREE.TorusGeometry(0.15, 0.03, 6, 12, Math.PI), catMat, 0.0, 0.04, -0.2, cat); tail.rotation.x = Math.PI / 2;
ink = 0;
