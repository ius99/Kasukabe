// ---------- Chibi characters (you and the neighbours) ----------
function makeChibi(o = {}) {
  const root = new THREE.Group();
  const body = new THREE.Group(); root.add(body);
  const skin = toon(o.skin || 0xffe2cc), robe = o.robe || toon(0xffffff, { map: kimonoTex }), hairMat = toon(o.hairColor || 0x2a1c1a);
  ink = 0.022;
  add(new THREE.CylinderGeometry(0.17, 0.31, 0.62, 18), robe, 0, 0.56, 0, body);
  if (o.obi !== null) add(new THREE.CylinderGeometry(0.245, 0.26, 0.12, 18), toon(o.obi || 0xffc93c), 0, 0.62, 0, body);
  if (o.bow) add(new THREE.BoxGeometry(0.26, 0.14, 0.08), toon(o.bow), 0, 0.64, -0.26, body);
  add(new THREE.CylinderGeometry(0.12, 0.15, 0.06, 14), toon(o.collar || 0xffffff), 0, 0.86, 0, body);

  const head = new THREE.Group(); head.position.y = 1.12; body.add(head);
  ink = 0.025;
  add(new THREE.SphereGeometry(0.36, 28, 20), skin, 0, 0, 0, head);
  const style = o.hair || 'bun';
  const cap = (theta, tilt) => { const h = add(new THREE.SphereGeometry(0.385, 28, 20, 0, Math.PI * 2, 0, Math.PI * theta), hairMat, 0, 0.01, 0, head); h.rotation.x = tilt; };
  if (style === 'bun' || style === 'bob') cap(0.56, -0.42);
  if (style === 'short' || style === 'cap') cap(0.52, -0.55);
  if (style === 'bun') add(new THREE.SphereGeometry(0.15, 16, 12), hairMat, 0, 0.38, -0.12, head);
  if (style === 'bob') [-1, 1].forEach((k) => { const sh = add(new THREE.SphereGeometry(0.17, 14, 10), hairMat, k * 0.29, -0.08, -0.06, head); sh.scale.set(0.6, 1.1, 1); });
  if (style === 'bald') [-1, 1].forEach((k) => add(new THREE.SphereGeometry(0.1, 12, 10), hairMat, k * 0.33, -0.02, -0.1, head));
  if (style === 'cap') {
    const c = add(new THREE.SphereGeometry(0.4, 22, 12, 0, Math.PI * 2, 0, Math.PI * 0.42), toon(o.capColor || 0xffc93c), 0, 0.03, 0, head);
    c.rotation.x = -0.28;
    add(new THREE.BoxGeometry(0.34, 0.03, 0.22), toon(o.capColor || 0xffc93c), 0, 0.2, 0.36, head).rotation.x = 0.25;
  }
  ink = 0;
  if (style === 'bun') {
    const pin = add(new THREE.CylinderGeometry(0.012, 0.012, 0.42, 6), toon(0xf1c75e), 0, 0.4, -0.12, head); pin.rotation.z = 1.2;
    add(new THREE.SphereGeometry(0.04, 8, 6), toon(0xe2462c), 0.19, 0.48, -0.12, head);
  }
  if (style !== 'bald') (style === 'bun' || style === 'bob' ? [-0.16, 0, 0.16] : [-0.1, 0.1]).forEach((x) => {
    const b = add(new THREE.SphereGeometry(0.12, 12, 10), hairMat, x, 0.17, 0.27, head); b.scale.set(1, 0.7, 0.6);
  });

  const eyes = [];
  [-0.13, 0.13].forEach((x) => {
    if (o.happyEyes) {
      const e = add(new THREE.TorusGeometry(0.04, 0.011, 6, 12, Math.PI), toon(0x1b1416), x, -0.06, 0.33, head, false);
      e.scale.y = 0.8;
    } else {
      const e = add(new THREE.SphereGeometry(0.052, 12, 10), toon(0x1b1416), x, -0.04, 0.322, head, false);
      e.scale.set(1, 1.35, 0.45); eyes.push(e);
      add(new THREE.SphereGeometry(0.016, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffffff }), 0.018, 0.025, 0.04, e, false);
    }
    const blush = add(new THREE.SphereGeometry(0.05, 10, 8), toon(0xff9aa6), x * 1.6, -0.11, 0.268, head, false);
    blush.scale.set(1.1, 0.6, 0.3);
  });
  const mouth = add(new THREE.TorusGeometry(0.028, 0.008, 6, 12, Math.PI), toon(0x8a2c2c), 0, -0.13, 0.33, head, false);
  mouth.rotation.z = Math.PI;
  if (o.mustache) add(new THREE.BoxGeometry(0.17, 0.045, 0.05), hairMat, 0, -0.095, 0.335, head, false);

  ink = 0.02;
  const limb = (x, y, geo, mat, offY, extra) => {
    const pivot = new THREE.Group(); pivot.position.set(x, y, 0); body.add(pivot);
    add(geo, mat, 0, offY, 0, pivot);
    if (extra) extra(pivot);
    return pivot;
  };
  const hand = (p) => add(new THREE.SphereGeometry(0.055, 10, 8), skin, 0, -0.35, 0.02, p);
  const armL = limb(-0.22, 0.82, new THREE.BoxGeometry(0.13, 0.34, 0.24), robe, -0.16, hand);
  const armR = limb(0.22, 0.82, new THREE.BoxGeometry(0.13, 0.34, 0.24), robe, -0.16, hand);
  armL.rotation.z = -0.12; armR.rotation.z = 0.12;
  const legGeo = new THREE.CylinderGeometry(0.06, 0.055, 0.2, 10);
  const legMat = o.legs ? toon(o.legs) : skin;
  const foot = (p) => { add(new THREE.BoxGeometry(0.11, 0.05, 0.17), toon(o.socks || 0xffffff), 0, -0.22, 0.03, p); add(new THREE.BoxGeometry(0.12, 0.03, 0.19), toon(o.shoes || 0xa8683b), 0, -0.26, 0.03, p); };
  const legL = limb(-0.09, 0.27, legGeo, legMat, -0.1, foot);
  const legR = limb(0.09, 0.27, legGeo, legMat, -0.1, foot);
  const parts = { root, body, head, eyes, armL, armR, legL, legR };
  if (o.extra) o.extra(parts);
  ink = 0;

  root.traverse((m) => { if (m.isMesh && m.material.type !== 'ShaderMaterial') m.castShadow = true; });
  scene.add(root);
  return parts;
}
const chibi = makeChibi({ bow: 0xe2462c });

// neighbours stand by their gates and wave when you pass
const NEIGHBOURS = [
  { name: 'Mr. Sato', voice: 190, line: 'Evening! Long day?', at: [1.95, 42.0],
    look: { robe: toon(0x34405e), obi: null, collar: 0xffffff, hair: 'short', legs: 0x2a3048, socks: 0x2a2a30, shoes: 0x1e1e24,
      extra: (p) => { add(new THREE.BoxGeometry(0.05, 0.24, 0.03), toon(0xd83a3a), 0, 0.72, 0.205, p.body); add(new THREE.BoxGeometry(0.3, 0.22, 0.08), toon(0x5a3a24), 0, -0.42, 0.02, p.armL); } } },
  { name: 'Kenta', voice: 430, line: 'Whoa, nice kimono!', at: [-1.9, 29.4],
    look: { robe: toon(0x5bb0e8), obi: null, hair: 'cap', capColor: 0xffc93c, legs: 0xffe2cc, shoes: 0xe2462c, hairColor: 0x3a2618,
      extra: (p) => { add(new THREE.BoxGeometry(0.34, 0.36, 0.16), toon(0xc8302a), 0, 0.6, -0.3, p.body); } } },
  { name: 'Mrs. Ito', voice: 320, line: 'Okaeri! Welcome home.', at: [1.95, 23.4],
    look: { robe: toon(0xa77ad0), obi: null, hair: 'bob', hairColor: 0x5a3524,
      extra: (p) => {
        add(new THREE.BoxGeometry(0.3, 0.42, 0.04), toon(0xffc6d6), 0, 0.5, 0.27, p.body);
        add(new THREE.CylinderGeometry(0.08, 0.09, 0.16, 12), toon(0x4aa86a), 0, -0.45, 0.06, p.armL);
      } } },
  { name: 'Grandpa Mori', voice: 140, line: 'Konbanwa, kiddo.', at: [-1.95, 10.4],
    look: { robe: toon(0x7d6e4e), obi: 0x3a2e24, hair: 'bald', hairColor: 0xf2f0ea, happyEyes: true, mustache: true, skin: 0xf6d2b4 } },
];
const bubbleLayer = $('bubbles');
const npcs = NEIGHBOURS.map((n, i) => {
  const c = makeChibi(n.look);
  const idleYaw = n.at[0] < 0 ? Math.PI / 2 : -Math.PI / 2;
  c.root.position.set(n.at[0], 0, n.at[1]); c.root.rotation.y = idleYaw;
  circles.push([n.at[0], n.at[1], 0.3]);
  const el = document.createElement('div'); el.className = 'bubble';
  el.innerHTML = `<small>${n.name}</small>${n.line}`;
  bubbleLayer.appendChild(el);
  return { c, el, idleYaw, k: 0, greeting: false, hopT: 1, ph: i * 1.7, voice: n.voice, line: n.line };
});

// ---------- Petals ----------
const PETALS = reduceMotion ? 0 : 140;
const petalGeo = new THREE.BufferGeometry();
const pPos = new Float32Array(PETALS * 3), pSeed = new Float32Array(PETALS);
const resetPetal = (i, top) => { pPos[i * 3] = (rand() - 0.5) * 16; pPos[i * 3 + 1] = top ? 5 + rand() * 2 : rand() * 7; pPos[i * 3 + 2] = -4 + rand() * 50; };
for (let i = 0; i < PETALS; i++) { resetPetal(i, false); pSeed[i] = rand() * 10; }
petalGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
scene.add(new THREE.Points(petalGeo, new THREE.PointsMaterial({ color: 0xffbdd0, size: 0.13, map: petalTex, transparent: true, alphaTest: 0.3, depthWrite: false })));
