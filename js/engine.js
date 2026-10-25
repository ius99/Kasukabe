// ---------- Renderer ----------
function showNoGL() {
  const d = document.createElement('div'); d.id = 'nogl';
  d.innerHTML = '<p>This preview needs WebGL, which this browser or device has turned off.</p>';
  document.body.appendChild(d);
}
if (typeof THREE === 'undefined') { showNoGL(); throw new Error('Three.js failed to load'); }
let renderer;
try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); } catch (e) { showNoGL(); throw e; }
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(Math.max(1, innerWidth), Math.max(1, innerHeight));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
$('stage').appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0xc996b4, 34, 100);
// The page can load in a hidden, zero-sized frame, so never divide by a zero size
const aspectNow = () => Math.max(1, innerWidth) / Math.max(1, innerHeight);
const camera = new THREE.PerspectiveCamera(50, aspectNow(), 0.1, 300);

// ---------- Materials, ink outlines & helpers ----------
const gradientMap = new THREE.DataTexture(new Uint8Array([150, 212, 255]), 3, 1, THREE.LuminanceFormat);
gradientMap.minFilter = gradientMap.magFilter = THREE.NearestFilter;
gradientMap.needsUpdate = true;
const toon = (color, extra = {}) => new THREE.MeshToonMaterial(Object.assign({ color, gradientMap }, extra));

const INK = 0x2e2230;
const hullCache = {};
function hullMat(t) {
  if (!hullCache[t]) hullCache[t] = new THREE.ShaderMaterial({
    uniforms: { t: { value: t }, c: { value: new THREE.Color(INK) } },
    vertexShader: 'uniform float t; void main(){ vec3 p = position + normal * t; gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0); }',
    fragmentShader: 'uniform vec3 c; void main(){ gl_FragColor = vec4(c, 1.0); }',
    side: THREE.BackSide,
  });
  return hullCache[t];
}
const edgeMat = new THREE.LineBasicMaterial({ color: INK });
let ink = 0;  // outline thickness for round shapes while building; boxes get ink edge lines; 0 = no outline
function inkUp(m) {
  if (!ink) return;
  if (m.geometry.type === 'BoxGeometry' || m.geometry.type === 'BoxBufferGeometry') {
    m.add(new THREE.LineSegments(new THREE.EdgesGeometry(m.geometry), edgeMat));
  } else {
    const h = new THREE.Mesh(m.geometry, hullMat(ink)); h.castShadow = false; m.add(h);
  }
}
function add(geo, mat, x = 0, y = 0, z = 0, parent = scene, cast = true) {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z); m.castShadow = cast; m.receiveShadow = true;
  parent.add(m); inkUp(m); return m;
}
function canvasTex(w, h, draw) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.anisotropy = 4; return t;
}
const rand = (() => { let s = 11; return () => (s = (s * 16807) % 2147483647) / 2147483647; })();
const line = (g, x0, y0, x1, y1) => { g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke(); };

const shojiTex = canvasTex(256, 512, (g, w, h) => {
  g.fillStyle = '#fff6e2'; g.fillRect(0, 0, w, h);
  g.fillStyle = '#6a4228'; g.fillRect(0, h * 0.86, w, h * 0.14);
  g.strokeStyle = '#6a4228'; g.lineWidth = 16; g.strokeRect(0, 0, w, h);
  g.lineWidth = 5;
  for (let i = 1; i < 3; i++) line(g, w * i / 3, 0, w * i / 3, h * 0.86);
  for (let j = 1; j < 6; j++) line(g, 0, h * 0.86 * j / 6, w, h * 0.86 * j / 6);
});
const tatamiTex = canvasTex(256, 512, (g, w, h) => {
  g.fillStyle = '#d9d184'; g.fillRect(0, 0, w, h);
  for (let x = 0; x < w; x += 4) { g.fillStyle = x % 8 ? 'rgba(110,100,30,.10)' : 'rgba(255,255,210,.14)'; g.fillRect(x, 0, 2, h); }
  g.fillStyle = '#2f5a3a'; g.fillRect(0, 0, 14, h); g.fillRect(w - 14, 0, 14, h);
  g.fillStyle = 'rgba(60,50,20,.35)'; g.fillRect(0, 0, w, 3); g.fillRect(0, h - 3, w, 3);
});
tatamiTex.wrapS = tatamiTex.wrapT = THREE.RepeatWrapping;
tatamiTex.repeat.set(8 / 0.9, 7 / 1.8);
const kimonoTex = canvasTex(128, 128, (g, w, h) => {
  g.fillStyle = '#2f6fd8'; g.fillRect(0, 0, w, h);
  const flower = (cx, cy, r) => {
    g.fillStyle = '#ffffff';
    for (let k = 0; k < 5; k++) { const a = k / 5 * Math.PI * 2; g.beginPath(); g.arc(cx + Math.cos(a) * r, cy + Math.sin(a) * r, r * 0.75, 0, 7); g.fill(); }
    g.fillStyle = '#ffc93c'; g.beginPath(); g.arc(cx, cy, r * 0.5, 0, 7); g.fill();
  };
  flower(30, 34, 7); flower(92, 84, 7); flower(74, 20, 4); flower(20, 100, 4);
});
kimonoTex.wrapS = kimonoTex.wrapT = THREE.RepeatWrapping; kimonoTex.repeat.set(3, 2);
const kakejikuTex = canvasTex(256, 560, (g, w, h) => {
  g.fillStyle = '#4f7a5a'; g.fillRect(0, 0, w, h);
  g.fillStyle = '#fbf3de'; g.fillRect(22, 40, w - 44, h - 90);
  g.fillStyle = '#1e1a16'; g.font = '700 150px "Shippori Mincho", serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText('夢', w / 2, h * 0.36);
  g.font = '700 54px "Shippori Mincho", serif'; g.fillText('一歩', w / 2, h * 0.62);
  g.fillStyle = '#e2462c'; g.fillRect(w / 2 + 30, h * 0.74, 34, 34);
});
const petalTex = canvasTex(64, 64, (g) => { g.fillStyle = '#fff'; g.beginPath(); g.ellipse(32, 32, 26, 16, 0.6, 0, 7); g.fill(); });

// flagstone paving, tileable
const paveTex = canvasTex(256, 256, (g, w, h) => {
  g.fillStyle = '#5a4c4a'; g.fillRect(0, 0, w, h);
  const cols = ['#cdb99a', '#c0ab8c', '#d8c6a6', '#b8a68c', '#c7b394', '#a99a86'];
  const rr = (x, y, ww, hh, r) => { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + ww, y, x + ww, y + hh, r); g.arcTo(x + ww, y + hh, x, y + hh, r); g.arcTo(x, y + hh, x, y, r); g.arcTo(x, y, x + ww, y, r); g.fill(); };
  for (let row = 0; row < 8; row++) {
    const ws = []; let tot = 0;
    while (tot < w) { const s = 34 + rand() * 40; ws.push(s); tot += s; }
    let x = rand() * 40;
    ws.forEach((s) => {
      s *= w / tot; g.fillStyle = cols[Math.floor(rand() * cols.length)];
      [x, x - w].forEach((xx) => rr(xx + 2.5, row * 32 + 2.5, s - 5, 27, 7)); x += s;
    });
  }
});
paveTex.wrapS = paveTex.wrapT = THREE.RepeatWrapping;
const woodTex = canvasTex(128, 128, (g, w, h) => {
  for (let x = 0; x < w; x += 16) { g.fillStyle = (x / 16) % 2 ? '#7a4c32' : '#8a5a3c'; g.fillRect(x, 0, 16, h); g.fillStyle = '#4a2c1c'; g.fillRect(x + 15, 0, 1, h); }
});
woodTex.wrapS = woodTex.wrapT = THREE.RepeatWrapping; woodTex.repeat.set(3, 2);
const winTex = canvasTex(128, 96, (g, w, h) => {
  const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#fff2bc'); gr.addColorStop(1, '#ffbb5a');
  g.fillStyle = gr; g.fillRect(0, 0, w, h);
  g.strokeStyle = '#4a2c1c'; g.lineWidth = 10; g.strokeRect(0, 0, w, h);
  g.lineWidth = 3; line(g, w / 3, 0, w / 3, h); line(g, 2 * w / 3, 0, 2 * w / 3, h); line(g, 0, h / 2, w, h / 2);
});
const doorTex = canvasTex(64, 128, (g, w, h) => {
  const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#ffe7a6'); gr.addColorStop(1, '#ffb04e');
  g.fillStyle = gr; g.fillRect(0, 0, w, h);
  g.strokeStyle = '#4a2c1c'; g.lineWidth = 7; g.strokeRect(0, 0, w, h);
  g.lineWidth = 2.5; for (let i = 1; i < 4; i++) line(g, w * i / 4, 0, w * i / 4, h * 0.8);
  for (let j = 1; j < 8; j++) line(g, 0, h * 0.8 * j / 8, w, h * 0.8 * j / 8);
  g.fillStyle = '#5a3a24'; g.fillRect(0, h * 0.8, w, h * 0.2);
});
const vendTex = canvasTex(128, 256, (g, w, h) => {
  g.fillStyle = '#eef3ff'; g.fillRect(0, 0, w, h);
  const cols = ['#e2462c', '#2f6fd8', '#5cb030', '#f2b42c', '#ff8fb0', '#7a4a2c'];
  for (let r = 0; r < 4; r++) for (let c = 0; c < 5; c++) {
    g.fillStyle = cols[(r * 5 + c * 2) % 6]; g.fillRect(10 + c * 22, 14 + r * 36, 15, 27);
    g.fillStyle = '#ffffff'; g.fillRect(12 + c * 22, 19 + r * 36, 11, 6);
  }
  g.fillStyle = '#2a2a33'; g.fillRect(12, 172, 104, 42);
  g.fillStyle = '#e2462c'; g.fillRect(88, 224, 26, 14);
});
const plateTex = canvasTex(64, 192, (g, w, h) => {
  g.fillStyle = '#e9dcc0'; g.fillRect(0, 0, w, h);
  g.fillStyle = '#1e1a16'; g.font = '700 44px "Shippori Mincho", serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
  ['春', '日', '部'].forEach((ch, i) => g.fillText(ch, w / 2, 36 + i * 58));
});

const M = {
  wood: toon(0x8a5a3a), darkWood: toon(0x553524), post: toon(0x6a4028),
  plaster: toon(0xf3e7c9), roof: toon(0x3e4560, { flatShading: true }),
  stone: toon(0xa8a296), lane: toon(0xffffff, { map: paveTex }),
  shoji: toon(0xffffff, { map: shojiTex, emissive: 0xffb866, emissiveMap: shojiTex, emissiveIntensity: 0.3, side: THREE.DoubleSide }),
  block: toon(0xbcb1a4), blockCap: toon(0x8a8078),
  boards: toon(0xffffff, { map: woodTex }), boardsDark: toon(0xb89488, { map: woodTex }),
  cream: toon(0xeee0c2), grey: toon(0xc9c3bc),
  litWin: new THREE.MeshToonMaterial({ color: 0xffffff, map: winTex, emissive: 0xffb84a, emissiveMap: winTex, emissiveIntensity: 0.9, gradientMap }),
  darkWin: toon(0x6a6f96, { map: winTex }),
  litDoor: new THREE.MeshToonMaterial({ color: 0xffffff, map: doorTex, emissive: 0xffa848, emissiveMap: doorTex, emissiveIntensity: 0.8, gradientMap }),
  roofs: [toon(0x3a4058), toon(0x4a3e44), toon(0x2f3a4a), toon(0x50505e)],
};

// ---------- Lights: low warm sun from the west, lavender sky ----------
scene.add(new THREE.HemisphereLight(0xc4b6ff, 0x5a4a62, 0.62));
const sun = new THREE.DirectionalLight(0xffb27a, 0.62);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
Object.assign(sun.shadow.camera, { left: -24, right: 24, top: 24, bottom: -24, near: 1, far: 80 });
sun.shadow.bias = -0.0006;
scene.add(sun); scene.add(sun.target);
