// Shared settings and small DOM helpers
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const touch = matchMedia('(pointer: coarse)').matches;
const $ = (id) => document.getElementById(id);
