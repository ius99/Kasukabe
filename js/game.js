// ---------- State ----------
const ui = {
  toast: $('toast'), intro: $('intro'), tags: $('tags'), shelf: $('shelf'), panel: $('panel'), paper: $('paper'),
  prompt: $('prompt'), promptText: $('promptText'), keys: $('keys'), stick: $('stick'), knob: $('knob'), deskBtn: $('deskBtn'),
};
let state = 'intro', time = 0, walkPhase = 0, sitK = 0, readK = 0;
let openId = null, hovered = null, doorOpen = false, action = null, toastTimer = 0;
const vel = new THREE.Vector3(), camLook = new THREE.Vector3(0, 2, 1), tmp = new THREE.Vector3();
const keys = {}, stickVec = { x: 0, y: 0 };
const tweens = [];
function tween(dur, fn, done) { tweens.push({ t: 0, dur, fn, done }); }
const lerpAngle = (a, b, k) => { let d = ((b - a + Math.PI) % (Math.PI * 2)) - Math.PI; if (d < -Math.PI) d += Math.PI * 2; return a + d * k; };
function toast(text, secs = 3) { ui.toast.textContent = text; ui.toast.style.opacity = 1; toastTimer = secs; }

const tagEls = SCROLLS.map((s) => {
  const b = document.createElement('button'); b.type = 'button'; b.className = 'tag chip';
  b.innerHTML = `<i>${s.kanji}</i>${s.label}`; b.addEventListener('click', () => openScroll(s.id));
  b.addEventListener('pointerenter', () => setHover(s.id)); b.addEventListener('pointerleave', () => setHover(null));
  ui.tags.appendChild(b); return b;
});
SCROLLS.forEach((s) => {
  const b = document.createElement('button'); b.type = 'button'; b.className = 'chip';
  b.innerHTML = `<i>${s.kanji}</i>${s.label}`; b.addEventListener('click', () => openScroll(s.id));
  ui.shelf.appendChild(b);
});
function showDeskUI(on) { ui.tags.hidden = !on; ui.shelf.hidden = !on; }
showDeskUI(false);

chibi.root.position.set(-0.6, 0, 46.6); chibi.root.rotation.y = Math.PI;

function showPlayUI() {
  ui.intro.style.opacity = 0; setTimeout(() => (ui.intro.hidden = true), 500);
  ui.keys.hidden = touch; ui.stick.hidden = !touch; ui.deskBtn.hidden = false;
}
function startPlay() {
  Sound.init(); Sound.chime();
  state = 'play'; showPlayUI();
  toast(touch ? 'Drag the stick to walk home' : 'Walk home down the lane', 3.5);
}
function setDoor(open) {
  doorOpen = open; Sound.door(open);
  const from = door.position.x, to = open ? 1.85 : 0;
  tween(0.7, (k) => (door.position.x = from + (to - from) * k));
}
function sitDown(instant) {
  state = 'sitting';
  const p0 = chibi.root.position.clone(), r0 = chibi.root.rotation.y, p1 = new THREE.Vector3(0, FLOOR, -1.2);
  const finish = () => { state = 'desk'; sitK = 1; showDeskUI(true); toast('Pick a scroll to unroll it', 3); };
  if (instant) { chibi.root.position.copy(p1); chibi.root.rotation.y = 0; finish(); return; }
  tween(0.7, (k) => { chibi.root.position.lerpVectors(p0, p1, k); chibi.root.rotation.y = lerpAngle(r0, 0, k); sitK = k; }, () => { Sound.sit(); finish(); });
}
function standUp() {
  closePanel(); showDeskUI(false); setHover(null); Sound.stand();
  state = 'sitting';
  tween(0.4, (k) => (sitK = 1 - k), () => { state = 'play'; sitK = 0; });
}
function goToDesk() {
  closePanel(); tweens.length = 0;
  if (state === 'intro') showPlayUI();
  doorOpen = true; door.position.x = 1.85; vel.set(0, 0, 0);
  sitDown(true); snapCamera();
}

// ---------- Input ----------
addEventListener('keydown', (e) => {
  if (e.key === 'Escape') { if (openId) closePanel(); else if (state === 'desk') standUp(); return; }
  if (!ui.panel.hidden) return;
  keys[e.code] = true;
  if (e.code === 'KeyM') toggleSound();
  if ((e.code === 'KeyE' || e.code === 'Enter' || e.code === 'Space') && action && document.activeElement.tagName !== 'BUTTON') { e.preventDefault(); action.fn(); }
  if (e.code.startsWith('Arrow') || e.code === 'Space') e.preventDefault();
});
addEventListener('keyup', (e) => (keys[e.code] = false));
addEventListener('blur', () => { for (const k in keys) keys[k] = false; });
ui.prompt.addEventListener('click', () => action && action.fn());

let stickId = null;
function stickMove(e) {
  const r = ui.stick.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
  let dx = e.clientX - cx, dy = e.clientY - cy; const d = Math.hypot(dx, dy), max = 46;
  if (d > max) { dx *= max / d; dy *= max / d; }
  ui.knob.style.transform = `translate(${dx}px, ${dy}px)`;
  stickVec.x = dx / max; stickVec.y = dy / max;
}
ui.stick.addEventListener('pointerdown', (e) => { stickId = e.pointerId; ui.stick.setPointerCapture(e.pointerId); stickMove(e); });
ui.stick.addEventListener('pointermove', (e) => { if (e.pointerId === stickId) stickMove(e); });
const stickEnd = (e) => { if (e.pointerId !== stickId) return; stickId = null; stickVec.x = stickVec.y = 0; ui.knob.style.transform = ''; };
ui.stick.addEventListener('pointerup', stickEnd); ui.stick.addEventListener('pointercancel', stickEnd);

// ---------- Scroll interaction ----------
function setHover(id) {
  if (id && id !== hovered) Sound.tick();
  hovered = id;
  tagEls.forEach((el, i) => el.classList.toggle('hot', SCROLLS[i].id === id));
  renderer.domElement.style.cursor = id ? 'pointer' : '';
}
function openScroll(id) {
  if (state !== 'desk' || openId === id) return;
  openId = id; Sound.unroll();
  const c = CONTENT[id], s = SCROLLS.find((x) => x.id === id);
  ui.paper.innerHTML = `<div class="paper-inner"><div>
      <header><div><div class="eyebrow">${c.eyebrow}</div><h2 id="panelTitle">${c.title}</h2></div>
      <button class="roll-up" type="button" id="rollUp">Roll it up</button></header>
      ${c.html}</div>
      <div class="side-kanji" aria-hidden="true">${c.side}<span class="hanko">${s.kanji}</span></div></div>`;
  setTimeout(() => {
    if (openId !== id) return;
    ui.panel.hidden = false;
    ui.paper.style.animation = 'none'; void ui.paper.offsetWidth; ui.paper.style.animation = '';
    $('rollUp').focus({ preventScroll: true });
  }, reduceMotion ? 0 : 450);
}
function closePanel() { if (openId) Sound.rollup(); openId = null; ui.panel.hidden = true; }
ui.panel.addEventListener('click', (e) => {
  if (e.target === ui.panel || e.target.id === 'rollUp') closePanel();
  const copy = e.target.closest('.copy');
  if (copy) {
    const done = () => { copy.textContent = 'Copied'; setTimeout(() => (copy.textContent = 'Copy'), 1400); };
    const sel = () => { const r = document.createRange(); r.selectNodeContents(copy.parentElement.querySelector('code')); const s = getSelection(); s.removeAllRanges(); s.addRange(r); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(copy.dataset.copy).then(done, sel); else sel();
  }
});

const raycaster = new THREE.Raycaster(), pointer = new THREE.Vector2();
function pick(e) {
  const r = renderer.domElement.getBoundingClientRect();
  pointer.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
  raycaster.setFromCamera(pointer, camera);
  const hit = raycaster.intersectObjects(scrollMeshes, false)[0];
  return hit ? hit.object.userData.group.userData.scroll.id : null;
}
renderer.domElement.addEventListener('pointermove', (e) => { if (state === 'desk' && !openId) setHover(pick(e)); });
renderer.domElement.addEventListener('click', (e) => { if (state === 'desk') { const id = pick(e); if (id) openScroll(id); } });

const soundBtn = $('soundBtn');
function showSound() { soundBtn.textContent = Sound.muted ? 'Sound: off' : 'Sound: on'; soundBtn.setAttribute('aria-pressed', String(!Sound.muted)); }
function toggleSound() { Sound.setMuted(!Sound.muted); showSound(); }
soundBtn.addEventListener('click', toggleSound);
showSound();
// browsers only allow audio after the viewer interacts, so unlock it on the first tap or key
addEventListener('pointerdown', () => Sound.init());
addEventListener('keydown', () => Sound.init());
$('enterBtn').addEventListener('click', startPlay);
$('introSkip').addEventListener('click', goToDesk);
ui.deskBtn.addEventListener('click', goToDesk);
let viewW = innerWidth, viewH = innerHeight;
function fitView() {
  if (innerWidth === viewW && innerHeight === viewH) return;
  viewW = innerWidth; viewH = innerHeight;
  renderer.setSize(Math.max(1, viewW), Math.max(1, viewH));
  camera.aspect = aspectNow(); camera.updateProjectionMatrix();
}
addEventListener('resize', fitView);

// ---------- Movement & collisions ----------
const R = 0.28;
function collide(p) {
  const all = doorOpen ? rects : rects.concat([doorRect]);
  for (const [x0, x1, z0, z1] of all) {
    const cx = Math.max(x0, Math.min(x1, p.x)), cz = Math.max(z0, Math.min(z1, p.z));
    const dx = p.x - cx, dz = p.z - cz, d = Math.hypot(dx, dz);
    if (d >= R) continue;
    if (d > 1e-5) { p.x = cx + dx / d * R; p.z = cz + dz / d * R; continue; }
    // centre is inside the rect: push out along the shortest axis
    const o = [[p.x - x0 + R, -1, 0], [x1 - p.x + R, 1, 0], [p.z - z0 + R, 0, -1], [z1 - p.z + R, 0, 1]].sort((a, b) => a[0] - b[0])[0];
    p.x += o[1] * o[0]; p.z += o[2] * o[0];
  }
  for (const [x, z, r] of circles) {
    const dx = p.x - x, dz = p.z - z, d = Math.hypot(dx, dz), m = r + R;
    if (d < m && d > 1e-5) { p.x = x + dx / d * m; p.z = z + dz / d * m; }
  }
  // safety net: stay inside the lane and the yard
  if (p.z > 6) p.x = Math.max(-2.35, Math.min(2.35, p.x)); else p.x = Math.max(-5.8, Math.min(5.8, p.x));
  p.z = Math.max(-5.4, Math.min(LANE_END - 0.4, p.z));
}
function groundY(x, z) {
  if (x > -4.5 && x < 4.5 && z > -4.1 && z < 4.42) return FLOOR;
  if (Math.abs(x) < 0.95 && z >= 4.42 && z < 5.15) return 0.3;
  return 0;
}
const inside = (p) => p.x > -4 && p.x < 4 && p.z > -3.5 && p.z < 3.5;

function updateAction() {
  const p = chibi.root.position;
  let a = null;
  if (state === 'play') {
    if (Math.abs(p.x) < 1.3 && p.z > 2.4 && p.z < 5.4) a = { label: doorOpen ? 'Close the shoji' : 'Open the shoji', fn: () => setDoor(!doorOpen) };
    if (inside(p) && p.x > -1.7 && p.x < 1.7 && p.z > -2.1 && p.z < 1.1) a = { label: 'Sit at the desk', fn: () => sitDown(false) };
  } else if (state === 'desk' && !openId) {
    a = { label: 'Stand up', fn: standUp };
  }
  if ((a && a.label) !== (action && action.label)) {
    ui.prompt.hidden = !a;
    if (a) { ui.promptText.textContent = a.label; Sound.pop(); }
    ui.prompt.querySelector('kbd').textContent = touch ? 'Tap' : 'E';
  }
  action = a;
}

function cameraGoal() {
  const c = chibi.root.position, aspect = aspectNow();
  if (state === 'intro') {
    const a = reduceMotion ? 0 : Math.sin(time * 0.12);
    return { pos: new THREE.Vector3(3 + a * 3, 10.5, 20), look: new THREE.Vector3(0, 1.6, 4) };
  }
  if (state === 'desk' || state === 'sitting') {
    const k = THREE.MathUtils.clamp(1.1 / aspect, 1, 1.2);
    const look = new THREE.Vector3(0, DESK_Y + 0.2, -0.45);
    return { pos: look.clone().add(new THREE.Vector3(0, 1.2, 2.3).multiplyScalar(openId ? k * 0.85 : k)), look };
  }
  if (inside(c)) {
    return { pos: new THREE.Vector3(c.x * 0.55, FLOOR + 2.45, Math.min(c.z + 3.3, 3.1)), look: new THREE.Vector3(c.x, c.y + 0.7, c.z - 0.4) };
  }
  const near = THREE.MathUtils.clamp(1 - (c.z - 3.5) / 3, 0, 1) * (Math.abs(c.x) < 5 ? 1 : 0);  // pull up and back near the porch
  return { pos: new THREE.Vector3(c.x * 0.6, c.y + 3.0 + near * 0.8, Math.min(c.z + 5.2 + near * 0.8, 52.4)), look: new THREE.Vector3(c.x * 0.8, c.y + 1.0, c.z - 1.2) };
}
function snapCamera() { const g = cameraGoal(); camera.position.copy(g.pos); camLook.copy(g.look); }
function fovFor() {
  const aspect = aspectNow(), desk = state === 'desk' || state === 'sitting';
  const hfov = (desk ? 64 : 74) * Math.PI / 180;
  return THREE.MathUtils.clamp(2 * Math.atan(Math.tan(hfov / 2) / aspect) * 180 / Math.PI, desk ? 42 : 50, 80);
}

// ---------- Loop ----------
let nextBlink = 2, blinkT = -1, lastStep = 0, catNext = 0;
const clock = new THREE.Clock();

function update(dt) {
  time += dt;
  for (let i = tweens.length - 1; i >= 0; i--) {
    const tw = tweens[i]; tw.t += dt;
    const k = Math.min(1, tw.t / tw.dur);
    tw.fn(k * k * (3 - 2 * k));
    if (k >= 1) { tweens.splice(i, 1); tw.done && tw.done(); }
  }

  // player movement; the camera looks toward -z, so "up" walks toward home
  const p = chibi.root.position;
  let ix = 0, iz = 0;
  if (state === 'play' && ui.panel.hidden) {
    ix = (keys.KeyD || keys.ArrowRight ? 1 : 0) - (keys.KeyA || keys.ArrowLeft ? 1 : 0) + stickVec.x;
    iz = (keys.KeyS || keys.ArrowDown ? 1 : 0) - (keys.KeyW || keys.ArrowUp ? 1 : 0) + stickVec.y;
  }
  const len = Math.hypot(ix, iz);
  if (len > 1) { ix /= len; iz /= len; }
  const run = keys.ShiftLeft || keys.ShiftRight || Math.hypot(stickVec.x, stickVec.y) > 0.95;
  const speed = inside(p) ? 2.2 : (run ? 5.2 : 3.2);
  vel.x += (ix * speed - vel.x) * (1 - Math.exp(-dt * 12));
  vel.z += (iz * speed - vel.z) * (1 - Math.exp(-dt * 12));
  const moveSpeed = Math.hypot(vel.x, vel.z);
  if (state === 'play') {
    p.x += vel.x * dt; p.z += vel.z * dt;
    collide(p);
    p.y += (groundY(p.x, p.z) - p.y) * (1 - Math.exp(-dt * 18));
    if (moveSpeed > 0.15) chibi.root.rotation.y = lerpAngle(chibi.root.rotation.y, Math.atan2(vel.x, vel.z), 1 - Math.exp(-dt * 14));
  } else vel.set(0, 0, 0);

  // pose
  const swing = Math.min(1, moveSpeed / 3);
  if (swing > 0.05) walkPhase += dt * (6 + moveSpeed * 1.6);
  const stepIdx = Math.floor(walkPhase / Math.PI);
  if (stepIdx !== lastStep) { lastStep = stepIdx; if (state === 'play' && swing > 0.3) Sound.step(inside(p) ? 'tatami' : p.y > 0.15 ? 'wood' : 'stone'); }
  Sound.listen(p.x, p.z);
  const s = Math.sin(walkPhase) * swing;
  readK += ((openId ? 1 : 0) - readK) * (1 - Math.exp(-dt * 6));
  chibi.legL.rotation.x = s * 0.8 + sitK * Math.PI / 2;
  chibi.legR.rotation.x = -s * 0.8 + sitK * Math.PI / 2;
  chibi.armL.rotation.x = -s * 0.6 - readK * 1.15 - sitK * 0.25;
  chibi.armR.rotation.x = s * 0.6 - readK * 1.15 - sitK * 0.25;
  chibi.body.position.y = Math.abs(Math.sin(walkPhase)) * 0.06 * swing - sitK * 0.1;
  chibi.body.rotation.z = s * 0.05;
  chibi.body.rotation.x = swing * 0.08;
  chibi.head.rotation.z = state === 'desk' || (state === 'play' && swing < 0.05) ? Math.sin(time * 1.3) * 0.05 : 0;
  chibi.head.rotation.x = readK * 0.18 + (state === 'desk' && !openId ? 0.08 : 0);

  nextBlink -= dt;
  if (nextBlink <= 0) { blinkT = 0; nextBlink = 2 + Math.random() * 3; }
  if (blinkT >= 0) {
    blinkT += dt;
    const k = blinkT < 0.07 ? 1 - blinkT / 0.07 : Math.min(1, (blinkT - 0.07) / 0.07);
    chibi.eyes.concat(...npcs.map((n) => n.c.eyes)).forEach((e) => (e.scale.y = 1.35 * Math.max(0.1, k)));
    if (blinkT > 0.14) blinkT = -1;
  }

  // neighbours: turn, hop and wave while you are close
  npcs.forEach((n) => {
    const r = n.c.root.position, dx = p.x - r.x, dz = p.z - r.z, d = Math.hypot(dx, dz);
    if (state === 'play' && d < 3.6 && !n.greeting) { n.greeting = true; n.hopT = 0; Sound.voice(n.voice, n.line); }
    if (n.greeting && (d > 4.4 || state !== 'play')) n.greeting = false;
    n.k += ((n.greeting ? 1 : 0) - n.k) * (1 - Math.exp(-dt * 7));
    r.y = 0;
    n.c.root.rotation.y = lerpAngle(n.c.root.rotation.y, n.greeting ? Math.atan2(dx, dz) : n.idleYaw, 1 - Math.exp(-dt * 6));
    n.c.armR.rotation.z = 0.12 + n.k * (2.35 + Math.sin(time * 11 + n.ph) * 0.4);
    n.hopT = Math.min(1, n.hopT + dt / 0.35);
    n.c.body.position.y = Math.sin(Math.PI * n.hopT) * 0.14;
    n.c.body.rotation.z = Math.sin(time * 1.4 + n.ph) * 0.03;
    n.c.head.rotation.z = n.k * 0.12 * Math.sin(time * 3 + n.ph);
    n.el.classList.toggle('on', n.k > 0.5);
    if (n.k > 0.02) {
      tmp.copy(r); tmp.y += 1.85; tmp.project(camera);
      n.el.style.left = ((tmp.x * 0.5 + 0.5) * innerWidth) + 'px';
      n.el.style.top = ((-tmp.y * 0.5 + 0.5) * innerHeight) + 'px';
      n.el.style.visibility = tmp.z < 1 ? 'visible' : 'hidden';
    }
  });

  scrollGroups.forEach((g) => {
    const id = g.userData.scroll.id;
    const goal = openId === id ? 0.42 : (hovered === id && state === 'desk' && !openId ? 0.07 : 0);
    g.userData.lift += (goal - g.userData.lift) * (1 - Math.exp(-dt * 8));
    g.position.y = g.userData.baseY + g.userData.lift;
    g.userData.paperMat.emissiveIntensity = Math.min(0.6, g.userData.lift * 4) + (state === 'desk' && !reduceMotion ? 0.1 + 0.08 * Math.sin(time * 2.4 + g.position.x * 6) : 0);
  });

  // ambient life
  catBody.scale.y = 0.7 + Math.sin(time * 2) * 0.03;
  if (state === 'play' && time > catNext && Math.hypot(p.x - LANE_X, p.z - 30.8) < 1.8) { Sound.meow(); catNext = time + 12; }
  clouds.forEach((c, i) => { c.position.x += dt * (0.4 + i * 0.05); if (c.position.x > 110) c.position.x = -110; });
  if (PETALS) {
    const a = petalGeo.attributes.position.array;
    for (let i = 0; i < PETALS; i++) {
      a[i * 3 + 1] -= dt * (0.3 + (pSeed[i] % 1) * 0.3);
      a[i * 3] += dt * (0.2 + Math.sin(time * 1.3 + pSeed[i]) * 0.3);
      if (a[i * 3 + 1] < 0 || a[i * 3] > 9) resetPetal(i, true);
    }
    petalGeo.attributes.position.needsUpdate = true;
  }
  if (toastTimer > 0) { toastTimer -= dt; if (toastTimer <= 0) ui.toast.style.opacity = 0; }

  updateAction();

  // camera follows
  const goal = cameraGoal();
  const camK = 1 - Math.exp(-dt * (state === 'play' ? 4 : 3));
  camera.position.lerp(goal.pos, camK);
  camLook.lerp(goal.look, camK);
  camera.lookAt(camLook);
  sun.position.set(p.x - 18, 13, p.z + 9); sun.target.position.set(p.x, 0, p.z - 4);
  const f = fovFor();
  if (!Number.isFinite(camera.fov)) { camera.fov = f; camera.updateProjectionMatrix(); }
  else if (Math.abs(camera.fov - f) > 0.01) { camera.fov += (f - camera.fov) * camK; camera.updateProjectionMatrix(); }

  if (state === 'desk') {
    scrollGroups.forEach((g, i) => {
      tmp.copy(g.position); tmp.z += 0.3; tmp.project(camera);
      const el = tagEls[i];
      el.style.left = ((tmp.x * 0.5 + 0.5) * innerWidth) + 'px';
      el.style.top = ((-tmp.y * 0.5 + 0.5) * innerHeight + 18) + 'px';
      el.style.opacity = openId ? 0 : 1;
    });
  }
}

snapCamera();
camera.fov = fovFor(); camera.updateProjectionMatrix();
function frame() {
  fitView();
  update(Math.min(clock.getDelta(), 0.05));
  renderer.render(scene, camera);
  requestAnimationFrame(frame);
}
frame();
