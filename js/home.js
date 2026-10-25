// ---------- The home ----------
const FLOOR = 0.6, WALL_TOP = 2.7, EAVE = 3.4;
ink = 0.03;
add(new THREE.BoxGeometry(9, FLOOR, 8.4), M.wood, 0, FLOOR / 2, 0.2);
ink = 0;
const tatami = add(new THREE.PlaneGeometry(8, 7), toon(0xffffff, { map: tatamiTex }), 0, FLOOR + 0.004, 0, scene, false);
tatami.rotation.x = -Math.PI / 2;
ink = 0.03;
add(new THREE.BoxGeometry(1.8, 0.3, 0.7), M.stone, 0, 0.15, 4.75);
const postGeo = new THREE.BoxGeometry(0.16, EAVE - FLOOR, 0.16);
[[-4, 3.5], [-0.9, 3.5], [0.9, 3.5], [4, 3.5], [-4, -3.5], [4, -3.5], [-4, 0], [4, 0], [0, -3.5]].forEach(([x, z]) => add(postGeo, M.post, x, (EAVE + FLOOR) / 2, z));
const longPost = new THREE.BoxGeometry(0.18, EAVE, 0.18);
[[-4.4, 4.3], [4.4, 4.3]].forEach(([x, z]) => { add(longPost, M.post, x, EAVE / 2, z); circles.push([x, z, 0.15]); });

function wallSegment(cx, cz, len, rotY) {
  const g = new THREE.Group(); g.position.set(cx, 0, cz); g.rotation.y = rotY; scene.add(g);
  const n = Math.max(1, Math.round(len / 1.0)), w = len / n;
  for (let i = 0; i < n; i++) add(new THREE.BoxGeometry(w - 0.03, WALL_TOP - FLOOR, 0.05), M.shoji, -len / 2 + w * (i + 0.5), (WALL_TOP + FLOOR) / 2, 0, g);
  add(new THREE.BoxGeometry(len, EAVE - WALL_TOP, 0.08), M.plaster, 0, (EAVE + WALL_TOP) / 2, 0, g);
}
wallSegment(-2.45, 3.5, 3.1, 0);
wallSegment(2.45, 3.5, 3.1, 0);
add(new THREE.BoxGeometry(1.8, EAVE - WALL_TOP, 0.08), M.plaster, 0, (EAVE + WALL_TOP) / 2, 3.5);
wallSegment(-4, 0, 7, Math.PI / 2);
wallSegment(4, 0, 7, Math.PI / 2);
add(new THREE.BoxGeometry(8, EAVE - FLOOR, 0.12), M.plaster, 0, (EAVE + FLOOR) / 2, -3.5);

const door = add(new THREE.BoxGeometry(1.8, WALL_TOP - FLOOR, 0.05), M.shoji, 0, (WALL_TOP + FLOOR) / 2, 3.57);
add(new THREE.BoxGeometry(0.05, 0.16, 0.03), M.darkWood, 0.75, 1.6, 0.03, door);

add(new THREE.BoxGeometry(10.4, 0.16, 9.6), M.darkWood, 0, EAVE + 0.08, 0.25);
ink = 0;
const roofGeo = new THREE.ConeGeometry(1, 2.5, 4, 1); roofGeo.rotateY(Math.PI / 4);
const roof = add(roofGeo, M.roof, 0, EAVE + 0.16 + 1.25, 0.25);
roof.scale.set(5.5 / 0.7071, 1, 5.05 / 0.7071);
roof.add(new THREE.LineSegments(new THREE.EdgesGeometry(roofGeo), edgeMat));
ink = 0.03;
add(new THREE.BoxGeometry(0.9, 0.2, 0.3), M.darkWood, 0, EAVE + 2.75, 0.25);

// walls and raised-floor edges as colliders (the door gets its own, used while it is shut)
rects.push([-4.6, -0.9, 3.4, 3.62], [0.9, 4.6, 3.4, 3.62], [-4.12, -3.88, -3.6, 3.6], [3.88, 4.12, -3.6, 3.6], [-4.6, 4.6, -3.62, -3.38],
           [-4.6, -0.95, 4.3, 4.5], [0.95, 4.6, 4.3, 4.5], [-4.6, -4.4, -4.1, 4.5], [4.4, 4.6, -4.1, 4.5], [-4.6, 4.6, -4.1, -3.9]);
const doorRect = [-0.9, 0.9, 3.4, 3.7];

// stone lantern and shrubs in the front yard
const sl = new THREE.Group(); sl.position.set(-3.3, 0, 5.25); scene.add(sl);
add(new THREE.CylinderGeometry(0.3, 0.36, 0.18, 6), M.stone, 0, 0.09, 0, sl);
add(new THREE.CylinderGeometry(0.09, 0.12, 0.6, 6), M.stone, 0, 0.48, 0, sl);
add(new THREE.BoxGeometry(0.4, 0.1, 0.4), M.stone, 0, 0.82, 0, sl);
add(new THREE.BoxGeometry(0.3, 0.28, 0.3), toon(0xfff0b0, { emissive: 0xffb04a, emissiveIntensity: 0.9 }), 0, 1.01, 0, sl);
add(new THREE.ConeGeometry(0.42, 0.3, 4), M.stone, 0, 1.3, 0, sl).rotation.y = Math.PI / 4;
circles.push([-3.3, 5.25, 0.38]);
rects.push([4.5, 6.0, 3.7, 4.5], [-6.0, -4.5, 3.7, 4.5]);  // keep the walk to the front of the house
ink = 0.04;
[[3.4, 5.2], [5.25, 4.1], [-5.25, 4.1]].forEach(([x, z]) => {
  const b = add(new THREE.IcosahedronGeometry(0.55, 1), toon(0x4f8a46, { flatShading: true }), x, 0.38, z);
  b.scale.set(1.2, 0.8, 1); circles.push([x, z, 0.55]);
});
ink = 0.03;

// tokonoma alcove
add(new THREE.BoxGeometry(2.0, 0.14, 0.6), M.darkWood, -2.2, FLOOR + 0.07, -3.15);
rects.push([-3.2, -1.2, -3.5, -2.8]);
ink = 0;
const kake = add(new THREE.PlaneGeometry(0.72, 1.58), toon(0xffffff, { map: kakejikuTex }), -2.2, 2.05, -3.42, scene, false);
add(new THREE.CylinderGeometry(0.03, 0.03, 0.86, 8), M.darkWood, 0, -0.81, 0.01, kake).rotation.z = Math.PI / 2;
ink = 0.02;
add(new THREE.CylinderGeometry(0.12, 0.08, 0.32, 10), toon(0x3a8fa0), -1.7, FLOOR + 0.3, -3.15);
[[-1.56, 0.92], [-1.6, 0.8], [-1.5, 0.84]].forEach(([x, y]) => add(new THREE.SphereGeometry(0.05, 6, 5), toon(0xff9dbc), x, FLOOR + y, -3.15));
ink = 0;
const twig = add(new THREE.CylinderGeometry(0.012, 0.012, 0.6, 5), toon(0x6a3e2c), -1.66, FLOOR + 0.66, -3.15); twig.rotation.z = -0.35;

// round window with the evening sky in it
ink = 0.02;
const ring = add(new THREE.TorusGeometry(0.62, 0.07, 8, 32), M.darkWood, 2.2, 1.95, -3.43);
ink = 0;
add(new THREE.CircleGeometry(0.6, 32), toon(0xd8a8d8, { emissive: 0xc890c8, emissiveIntensity: 0.55 }), 0, 0, 0, ring, false);

// desk, cushion, lamps
const DESK_Y = FLOOR + 0.44;
ink = 0.02;
add(new THREE.BoxGeometry(1.8, 0.08, 1.0), toon(0xb0602f), 0, DESK_Y - 0.04, -0.2);
[[-0.8, 0.25], [0.8, 0.25], [-0.8, -0.65], [0.8, -0.65]].forEach(([x, z]) => add(new THREE.BoxGeometry(0.09, 0.4, 0.09), M.darkWood, x, FLOOR + 0.2, z));
add(new THREE.BoxGeometry(0.8, 0.1, 0.8), toon(0xe2462c), 0, FLOOR + 0.05, -1.2);
add(new THREE.BoxGeometry(0.24, 0.035, 0.16), toon(0x2a2a2a), -0.72, DESK_Y + 0.018, 0.18);
add(new THREE.CylinderGeometry(0.06, 0.045, 0.09, 12), toon(0x58a878), 0.74, DESK_Y + 0.045, 0.16);
rects.push([-0.95, 0.95, -0.75, 0.35]);
function andon(x, z) {
  add(new THREE.BoxGeometry(0.36, 0.06, 0.36), M.darkWood, x, FLOOR + 0.03, z);
  add(new THREE.BoxGeometry(0.3, 0.5, 0.3), toon(0xfff6e0, { emissive: 0xffb860, emissiveIntensity: 0.9 }), x, FLOOR + 0.31, z);
  add(new THREE.BoxGeometry(0.36, 0.04, 0.36), M.darkWood, x, FLOOR + 0.58, z);
  rects.push([x - 0.25, x + 0.25, z - 0.25, z + 0.25]);
}
andon(1.55, -1.35); andon(-3.4, -2.9);
ink = 0;
const roomLight = new THREE.PointLight(0xffd8a8, 0.75, 11, 1.4); roomLight.position.set(0, 3.0, 0.4); scene.add(roomLight);

// ---------- Scrolls ----------
const scrollGroups = [], scrollMeshes = [];
SCROLLS.forEach((s, i) => {
  const g = new THREE.Group();
  g.position.set(-0.48 + i * 0.32, DESK_Y + 0.07, 0.02);
  g.rotation.y = (i - 1.5) * 0.14;
  scene.add(g);
  ink = 0.012;
  const paperMat = toon(0xfbf0d4, { emissive: 0xffc070, emissiveIntensity: 0 });
  const paper = add(new THREE.CylinderGeometry(0.065, 0.065, 0.44, 20), paperMat, 0, 0, 0, g);
  paper.rotation.x = Math.PI / 2;
  [-0.245, 0.245].forEach((z) => {
    const cap = add(new THREE.CylinderGeometry(0.08, 0.08, 0.05, 16), M.darkWood, 0, 0, z, g); cap.rotation.x = Math.PI / 2;
    add(new THREE.SphereGeometry(0.035, 10, 8), toon(0xf1c75e), 0, 0, z + Math.sign(z) * 0.045, g);
  });
  ink = 0;
  const tie = add(new THREE.CylinderGeometry(0.069, 0.069, 0.035, 20), toon(s.ribbon), 0, 0, 0.04, g); tie.rotation.x = Math.PI / 2;
  g.userData = { scroll: s, baseY: g.position.y, lift: 0, paperMat };
  g.traverse((o) => { if (o.isMesh && o.material.type !== 'ShaderMaterial') { o.userData.group = g; scrollMeshes.push(o); } });
  scrollGroups.push(g);
});
