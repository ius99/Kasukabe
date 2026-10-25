// ---------- Sound: everything is synthesised with Web Audio, so there are no files to load ----------
const Sound = (() => {
  let ctx = null, master = null, noiseBuf = null, started = false, muted = false;
  const bus = {}, listener = { x: 0, z: 40 };
  try { muted = localStorage.getItem('kasukabe-muted') === '1'; } catch (e) {}
  const live = () => !!ctx && ctx.state === 'running' && !muted;

  function init() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      try { ctx = new AC(); } catch (e) { return; }
      master = ctx.createGain(); master.gain.value = muted ? 0 : 0.9; master.connect(ctx.destination);
      bus.sfx = ctx.createGain(); bus.sfx.gain.value = 0.85; bus.sfx.connect(master);
      bus.amb = ctx.createGain(); bus.amb.gain.value = 0.6; bus.amb.connect(master);
      noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
      const d = noiseBuf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      document.addEventListener('visibilitychange', () => { if (document.hidden) ctx.suspend(); else ctx.resume(); });
    }
    if (ctx.state === 'suspended') ctx.resume();
    if (!started) { started = true; startAmbience(); }
  }
  function env(g, t, peak, a, dcy) {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + a);
    g.gain.exponentialRampToValueAtTime(0.0001, t + a + dcy);
  }
  function out(dest, pan) {
    if (pan === undefined || !ctx.createStereoPanner) return dest;
    const p = ctx.createStereoPanner(); p.pan.value = pan; p.connect(dest); return p;
  }
  function noise({ t = 0, dur = 0.1, type = 'bandpass', f = 1000, f2, q = 1, gain = 0.2, a = 0.005, dest = bus.sfx, pan } = {}) {
    const at = ctx.currentTime + t;
    const src = ctx.createBufferSource(); src.buffer = noiseBuf; src.loop = true;
    const fl = ctx.createBiquadFilter(); fl.type = type; fl.Q.value = q;
    fl.frequency.setValueAtTime(f, at); if (f2) fl.frequency.exponentialRampToValueAtTime(f2, at + a + dur);
    const g = ctx.createGain(); env(g, at, gain, a, dur);
    src.connect(fl); fl.connect(g); g.connect(out(dest, pan));
    src.start(at, Math.random() * 1.5); src.stop(at + a + dur + 0.05);
  }
  function tone({ t = 0, dur = 0.2, type = 'sine', f = 440, f2, gain = 0.2, a = 0.005, dest = bus.sfx, pan, lp } = {}) {
    const at = ctx.currentTime + t;
    const o = ctx.createOscillator(); o.type = type;
    o.frequency.setValueAtTime(f, at); if (f2) o.frequency.exponentialRampToValueAtTime(f2, at + a + dur);
    const g = ctx.createGain(); env(g, at, gain, a, dur);
    let node = o;
    if (lp) { const fl = ctx.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.value = lp; o.connect(fl); node = fl; }
    node.connect(g); g.connect(out(dest, pan));
    o.start(at); o.stop(at + a + dur + 0.05);
  }
  const bell = (t, f, v, pan) => [[1, 0.06], [2.76, 0.022], [5.4, 0.009]].forEach(([m, gn]) =>
    tone({ t, dur: 2.4 / Math.pow(m, 0.4), f: f * m, gain: gn * v, a: 0.003, dest: bus.amb, pan }));

  // evening ambience: a breeze, higurashi cicadas, a wind chime under the eaves, distant crows
  function startAmbience() {
    const src = ctx.createBufferSource(); src.buffer = noiseBuf; src.loop = true;
    const fl = ctx.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.value = 420;
    const g = ctx.createGain(); g.gain.value = 0.05;
    const lfo = ctx.createOscillator(); lfo.frequency.value = 0.07;
    const lg = ctx.createGain(); lg.gain.value = 0.035;
    lfo.connect(lg); lg.connect(g.gain);
    src.connect(fl); fl.connect(g); g.connect(bus.amb);
    src.start(); lfo.start();
    every(higurashi, 2.5, 7, 14);
    every(furin, 1.5, 3.5, 8);
    every(crows, 10, 20, 38);
  }
  function every(fn, first, min, max) {
    const run = (delay) => setTimeout(() => { if (live() && !document.hidden) fn(); run(min + Math.random() * (max - min)); }, delay * 1000);
    run(first);
  }
  function higurashi() {
    const pan = Math.random() * 1.6 - 0.8, n = 14 + Math.floor(Math.random() * 8), base = 4000 + Math.random() * 500;
    for (let i = 0; i < n; i++) {
      const k = i / n, f = base * (1 - k * 0.06);
      tone({ t: i * 0.115, dur: 0.075, f, f2: f * 0.93, gain: 0.028 * (1 - k * 0.7) * (i < 2 ? 0.5 : 1), a: 0.012, dest: bus.amb, pan });
    }
  }
  function furin() {
    const v = Math.max(0.08, 1 - Math.hypot(listener.x, listener.z - 4.4) / 18);
    const notes = [1568, 1760, 2093, 2349, 2637];
    bell(0, notes[Math.floor(Math.random() * 5)], v, 0.15);
    if (Math.random() < 0.45) bell(0.16 + Math.random() * 0.2, notes[Math.floor(Math.random() * 5)], v * 0.7, 0.2);
  }
  function crows() {
    const pan = Math.random() * 1.4 - 0.7, n = 2 + Math.floor(Math.random() * 2);
    for (let i = 0; i < n; i++) {
      tone({ t: i * 0.38, dur: 0.22, type: 'sawtooth', f: 690, f2: 520, gain: 0.03, a: 0.02, lp: 1300, dest: bus.amb, pan });
      noise({ t: i * 0.38, dur: 0.2, f: 1100, q: 3, gain: 0.012, a: 0.02, dest: bus.amb, pan });
    }
  }

  const api = {
    init,
    get muted() { return muted; },
    setMuted(m) {
      muted = m;
      try { localStorage.setItem('kasukabe-muted', m ? '1' : '0'); } catch (e) {}
      if (!m) init();
      if (master) master.gain.setTargetAtTime(m ? 0 : 0.9, ctx.currentTime, 0.05);
    },
    listen(x, z) { listener.x = x; listener.z = z; },
    step(surface) {
      if (!live()) return;
      const v = 0.85 + Math.random() * 0.3;
      if (surface === 'tatami') noise({ dur: 0.06, type: 'lowpass', f: 600 * v, gain: 0.13 });
      else if (surface === 'wood') { noise({ dur: 0.05, f: 1100 * v, q: 2, gain: 0.12 }); tone({ dur: 0.07, type: 'triangle', f: 210 * v, f2: 160, gain: 0.12 }); }
      else { noise({ dur: 0.045, f: 2200 * v, q: 1.4, gain: 0.15 }); tone({ dur: 0.06, f: 120 * v, f2: 80, gain: 0.13 }); }
    },
    block(t = 0, g = 1) { if (!live()) return; tone({ t, dur: 0.08, f: 820, f2: 700, gain: 0.22 * g }); tone({ t, dur: 0.05, f: 1640, gain: 0.07 * g }); },
    door(open) {
      if (!live()) return;
      noise({ dur: 0.55, f: open ? 500 : 1300, f2: open ? 1300 : 500, q: 3, gain: 0.16, a: 0.08 });
      tone({ dur: 0.5, type: 'triangle', f: 70, f2: 60, gain: 0.08, a: 0.06, lp: 300 });
      api.block(0.62, 0.7);
    },
    tick() { if (live()) tone({ dur: 0.04, f: 1500, f2: 1200, gain: 0.05 }); },
    pop() { if (live()) tone({ dur: 0.09, f: 520, f2: 880, gain: 0.07 }); },
    chime() { if (live()) [523, 659, 784, 1047].forEach((f, i) => tone({ t: i * 0.09, dur: 0.5, type: 'triangle', f, gain: 0.07 })); },
    sit() { if (!live()) return; noise({ dur: 0.18, type: 'lowpass', f: 380, gain: 0.25, a: 0.01 }); tone({ dur: 0.15, f: 95, f2: 60, gain: 0.18 }); },
    stand() { if (live()) noise({ dur: 0.2, f: 1600, f2: 900, q: 1, gain: 0.07, a: 0.04 }); },
    unroll() {
      if (!live()) return;
      api.block(0, 0.6);
      noise({ t: 0.05, dur: 0.6, f: 3500, f2: 1400, q: 0.8, gain: 0.1, a: 0.05 });
      for (let i = 0; i < 7; i++) noise({ t: 0.08 + i * 0.07 + Math.random() * 0.03, dur: 0.03, type: 'highpass', f: 3000, gain: 0.05 + Math.random() * 0.05 });
    },
    rollup() { if (!live()) return; noise({ dur: 0.35, f: 1400, f2: 3200, q: 0.8, gain: 0.08, a: 0.03 }); api.block(0.36, 0.5); },
    // Animal Crossing-style babble: one blip per syllable, pitched to the speaker
    voice(base, text) {
      if (!live()) return;
      const n = Math.min(10, Math.max(3, Math.round(text.replace(/[^a-z]/gi, '').length / 2.5)));
      const steps = [0, 2, 4, 7, 9, 12];
      for (let i = 0; i < n; i++) {
        const f = base * Math.pow(2, (steps[Math.floor(Math.random() * steps.length)] + (i === n - 1 ? 3 : 0)) / 12);
        tone({ t: 0.05 + i * 0.075, dur: 0.055, type: 'square', f, f2: f * 0.94, gain: 0.045, lp: 1800 });
      }
    },
    meow() {
      if (!live()) return;
      tone({ dur: 0.4, type: 'sawtooth', f: 480, f2: 760, gain: 0.045, a: 0.06, lp: 1600 });
      tone({ t: 0.32, dur: 0.3, type: 'sawtooth', f: 760, f2: 420, gain: 0.035, lp: 1400 });
    },
  };
  return api;
})();
