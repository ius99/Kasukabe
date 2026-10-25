# Kasukabe: full context

Everything needed to understand, edit, or extend this site, whether you're picking it up yourself or handing it to someone else.

---

## 1. What it is

Kasukabe is Shivansh Yadav's portfolio, built as a small 3D game. You play a chibi character in a blue kimono walking home down a Japanese residential lane at dusk. Neighbours wave as you pass. At the end of the lane is your house: you slide the shoji open, walk in, sit at a low desk, and unroll scrolls. Each scroll is a section of the portfolio: **Projects, About me, Skills, Contact**.

- **Repo:** https://github.com/ius99/Kasukabe
- **Live site (GitHub Pages):** https://ius99.github.io/Kasukabe/ (the path is case-sensitive: capital K)

The core idea: nothing is a downloaded asset. Every house, character, texture and sound is generated in code at load time. The only external dependencies are Three.js and two Google Fonts.

---

## 2. Files

```
index.html          page markup: HUD, intro card, scroll panel, script tags
css/style.css       all UI styling (design tokens at the top)
js/config.js        reduceMotion, touch, $() helper
js/audio.js         Sound: synthesised effects and ambience (Web Audio)
js/content.js       SCROLLS (the four scrolls) and CONTENT (their HTML)
js/engine.js        renderer, scene, camera, toon materials, ink outlines, canvas textures, M (materials), lights
js/world.js         sky, lane, neighbours' houses, walls and gates, yard, trees, poles, wires, lamps, vending machine, cat
js/home.js          your house, the room, tokonoma, desk, andon lamps, the four 3D scrolls
js/characters.js    makeChibi(), the player, NEIGHBOURS and their speech bubbles, falling petals
js/game.js          state machine, input, scroll panel, collisions, interactions, camera, main loop
.github/workflows/pages.yml   deploys the repo to GitHub Pages on every push to main
README.md           short public description
CONTEXT.md          this file
```

Plain HTML, CSS and JavaScript. No framework, no bundler, no build step. Three.js r128 is loaded from cdnjs, then the scripts in the order above. They are classic scripts (not modules), so top-level `const`/`function` declarations in one file are visible to the files after it. **Order matters:** a file can only use things declared in files above it.

---

## 3. How the page works

### States

`game.js` keeps one `state`:

| state | what's happening |
|---|---|
| `intro` | intro card shown, camera slowly sways above the house |
| `play` | you control the character |
| `sitting` | short tween while sitting down or standing up |
| `desk` | seated; scrolls are clickable |

"Start walking" → `startPlay()`. "Go straight to the desk" / "Jump to the desk" → `goToDesk()`, which opens the door and seats you instantly.

### Controls

| input | action |
|---|---|
| W A S D / arrows | walk (camera faces -z, so up walks toward home) |
| Shift | run (outside only) |
| E / Enter / Space | the current action: open/close the shoji, sit, stand up |
| Esc | roll up the open scroll, or stand up |
| M | sound on/off |
| touch | joystick bottom-left (`#stick`); the action prompt becomes a tap button |

### Interactions

`updateAction()` checks where the player is every frame and shows the prompt (`#prompt`):

- Near the front door (`|x| < 1.3`, `2.4 < z < 5.4`): **Open / Close the shoji** → `setDoor()`
- Inside near the desk: **Sit at the desk** → `sitDown()`
- At the desk: **Stand up** → `standUp()`

### Scrolls

Each scroll is a `THREE.Group` on the desk. Clicking one (raycast in `pick()`), its floating tag, or its button in the phone shelf calls `openScroll(id)`. That lifts the 3D scroll, makes the character lean in to read, and fills `#paper` with `CONTENT[id].html`. The panel "unrolls" with a CSS `max-height` animation.

### Neighbours

`NEIGHBOURS` in `characters.js` lists each one: `name`, `line`, `voice` (base pitch in Hz for their babble), `at` ([x, z] on the lane) and `look` (options for `makeChibi`). In the loop, when the player comes within 3.6 units, a neighbour turns to face you, hops, waves their right arm, plays their voice and shows a speech bubble (an HTML `.bubble` projected above their head). It resets once you are 4.4 units away.

### Collisions

The ground is treated as 2D (x, z). `rects` holds `[minX, maxX, minZ, maxZ]` boxes, `circles` holds `[x, z, r]`. `collide()` pushes the player's circle (radius 0.28) out of each one, plus `doorRect` while the door is shut, then clamps the player to the lane (`|x| < 2.35` when `z > 6`) or the yard. `groundY()` raises the character onto the step (0.3) and the raised floor (0.6).

### Camera

`cameraGoal()` returns a target position and look-at point for the current state: a swaying overview in `intro`, a follow-cam behind the player in the lane (pulled up near the porch, clamped before the far end), a fixed interior angle inside the house, and a desk shot when seated. The camera eases toward the goal each frame. `fovFor()` widens the field of view on narrow screens so the scene still fits on phones.

> **Keep the size guard.** The page can load inside a zero-sized frame. `aspectNow()` and `fitView()` stop that from producing a NaN camera, which leaves only the sky visible.

### Main loop

`frame()` → `fitView()` → `update(dt)` → render. `update` runs tweens, movement and collisions, the walk animation and blinking, neighbours, scroll hover and lift, petals, clouds, the cat, footstep sounds, the action prompt, the camera, and the scroll tag positions. `dt` is capped at 0.05s.

---

## 4. Art direction

**Concept:** a cel-shaded anime evening. The target was a hand-drawn Japanese alley at dusk: two-storey wooden houses, warm glowing windows, tangled power lines, street lamps, sakura, and a cat asleep on a wall.

**How the look is made (`engine.js`):**
- **Toon shading:** every material is `MeshToonMaterial` with a 3-step `gradientMap` (`150, 212, 255`).
- **Ink outlines:** set the global `ink` before calling `add()`. Round shapes get an inverted-hull outline (`hullMat(t)` pushes vertices out along normals, back faces only). Boxes get `EdgesGeometry` lines. `ink = 0` turns outlines off.
- **Textures** are drawn on canvases at load time: shoji, tatami, kimono pattern, wood boards, lit windows and doors, flagstone paving (tileable), the vending machine front, the hanging scroll, the gate nameplate.
- **Lighting:** a lavender `HemisphereLight` plus a low, warm `DirectionalLight` from the west that follows the player (long shadows across the lane). Point lights only on the street lamps and in the room. Windows, lamps, shoji and the vending machine glow through emissive maps.
- **Sky:** a CSS gradient behind a transparent canvas (`#stage`), with pink fog, a moon, drifting clouds and purple hills.

**Palette (CSS tokens, `css/style.css`):**

| token | value | used for |
|---|---|---|
| `--sky` | #34407e | page background behind the canvas |
| `--ink` | #3a2a1e | text, outlines on UI |
| `--cream` | #fffaf0 | chips, buttons |
| `--washi` | #f6ecd4 | the unrolled scroll paper |
| `--shu` | #e2462c | vermilion accent: CTA, key caps, hanko seal |
| `--line` | dark ink | 2.5px borders and hard drop shadows |

**Fonts** (Google Fonts): `Shippori Mincho` for headings and kanji, `Zen Maru Gothic` for UI and body.

**UI language:** "sticker" chips: cream fill, thick ink border, hard 3px shadow underneath, like game UI. Scroll panels have wooden rods with gold end caps, a kanji label down the side and a red hanko stamp.

---

## 5. The world (layout)

Units are roughly metres. Home is at the origin, facing +z. The lane runs from z ≈ 6 to z ≈ 48.6.

- **Your house:** raised floor at y 0.6, 8 × 7 room of tatami, shoji walls, sliding door at z 3.5, hipped roof. Inside: tokonoma with a hanging scroll and vase, round window, low desk at z -0.2, red cushion at z -1.2, two andon lamps.
- **Yard:** block walls at x ±6, gate posts with a small roof and a 春日部 nameplate at z 6, stone lantern, shrubs.
- **Lane:** 5 wide, flagstone paving, block walls on both sides with wooden gates. Neighbour houses at x ±6.8 (`leftHouses`, `rightHouses`), background rows at x ±14.5, houses beside and behind yours, one at the far end.
- **Street furniture:** five utility poles with sagging wires and birds, three pole lamps plus one by the gate, potted plants, a glowing vending machine (z ≈ 25), a sleeping cat on the right wall (z ≈ 31), sakura and round trees in the gaps.
- **Neighbours:** Mr. Sato (z 42), Kenta (z 29.4), Mrs. Ito (z 23.4), Grandpa Mori (z 10.4). The player starts at z 46.6.

---

## 6. Sound (`js/audio.js`)

All synthesised with Web Audio, with no audio files. Browsers only allow sound after a tap or key press, so `Sound.init()` runs on the first `pointerdown`/`keydown`. Mute is stored in `localStorage` (`kasukabe-muted`).

Building blocks: `noise({...})` (filtered white noise with an envelope) and `tone({...})` (an oscillator with an envelope, optional pitch glide and low-pass).

| call | sound |
|---|---|
| `step(surface)` | footstep, `stone`, `wood` or `tatami`; fired each half walk cycle |
| `door(open)` | shoji slide plus a wooden knock |
| `sit()` / `stand()` | cushion thump / cloth rustle |
| `unroll()` / `rollup()` | paper rustle plus a wood block |
| `voice(base, text)` | Animal Crossing-style babble, one blip per syllable |
| `meow()` | the cat, when you walk past (12s cooldown) |
| `tick()`, `pop()`, `chime()` | hover, prompt appears, game start |

Ambience (started once): looping breeze, higurashi cicadas every 7–14s, a furin wind chime (louder near the house, via `Sound.listen(x, z)`), distant crows every 20–38s.

---

## 7. Common edits

- **Portfolio text:** edit `CONTENT` in `js/content.js`. Each entry is plain HTML. Useful classes: `.proj` (project block), `.chips` (tags), `.skills` (grid), `.contact-row`, `.note`. To add a fifth scroll, add it to `SCROLLS` (id, label, kanji, ribbon colour) and `CONTENT`. The desk spaces scrolls 0.32 apart starting at x -0.48, so five will need that spacing tightened in `home.js`.
- **A new neighbour:** add an entry to `NEIGHBOURS`. Stand them at `x ≈ ±1.9` on the lane, clear of poles, plants and the vending machine. `look` options: `robe`, `obi` (null for none), `bow`, `collar`, `hair` (`bun`, `bob`, `short`, `cap`, `bald`), `hairColor`, `capColor`, `skin`, `legs`, `socks`, `shoes`, `happyEyes`, `mustache`, `extra(parts)` to attach props.
- **A new house:** `neighborHouse(x, z, rotY, { w, d, wall, roof, lit, lite, acSide })`. Houses face local +z; use `rotY = π/2` on the left of the lane and `-π/2` on the right. `lit` toggles windows `[front, upper, side, side]`. `lite: true` skips details for background houses.
- **Anything solid:** push a rect or circle into `rects` / `circles` so the player can't walk through it.
- **New interaction:** add a branch to `updateAction()` with a zone check, a `label` and an `fn`.
- **Time of day:** sky gradient in `#stage` (CSS), `scene.fog`, the hemisphere and sun colours in `engine.js`, and the emissive intensity on windows.

---

## 8. Hosting

GitHub Pages, deployed by `.github/workflows/pages.yml` (checkout → configure-pages → upload the repo root → deploy-pages) on every push to `main`. Repo **Settings → Pages → Source** must be set to **GitHub Actions**. A deploy takes about 30 seconds.

Run locally by opening `index.html`, or `npx serve .`.

---

## 9. Open items

- All scroll content is placeholder: real projects, about text and contact links still need filling in.
- Contact rows show addresses as text with a copy button. `mailto:` links are unreliable in some embeds, so text is the safe default.
- Ideas not built yet: background music, more interactions in the room, a day/night toggle, linking project cards to their own pages.
