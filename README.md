# Kasukabe

A walk-in 3D portfolio. You play a little character in a kimono walking home down a Japanese street at dusk. The neighbours wave as you pass. At home you slide the shoji open, sit at the desk and unroll scrolls for Projects, About me, Skills and Contact.

Built with [Three.js](https://threejs.org/) and plain JavaScript. There are no image, model or audio files: every house, character and sound is made in code.

**Live:** https://ius99.github.io/kasukabe/

## Controls

| Key | Action |
| --- | --- |
| W A S D / arrow keys | Walk |
| Shift | Run |
| E | Open the door, sit, stand up |
| Esc | Roll up a scroll / stand up |
| M | Sound on or off |

On phones there is an on-screen joystick and a tap button.

## Project layout

```
index.html        page markup and HUD
css/style.css     UI styles (HUD, speech bubbles, scroll panel)
js/config.js      shared settings and DOM helpers
js/audio.js       synthesised sound effects and ambience (Web Audio)
js/content.js     portfolio text shown on the scrolls
js/engine.js      renderer, camera, toon materials, outlines, textures, lights
js/world.js       the street: neighbours' houses, walls, poles, lamps, trees
js/home.js        the house, the room, the desk and the scrolls
js/characters.js  chibi character builder, the player and the neighbours
js/game.js        game state, input, collisions, camera and the main loop
```

## Run locally

Open `index.html` in a browser, or serve the folder:

```
npx serve .
```

## Editing the portfolio

Change the scroll text in `js/content.js`.
