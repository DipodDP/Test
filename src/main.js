import { createViewer } from './viewer.js';
import { createHero } from './hero.js';
import { createFirstScene } from './first-scene.js';
import { highlightAll } from './highlight.js';

import materials from './scenes/materials.js';
import lights from './scenes/lights.js';
import particles from './scenes/particles.js';
import interaction from './scenes/interaction.js';
import shaders from './scenes/shaders.js';
import models from './scenes/models.js';

highlightAll();

const $ = (id) => document.getElementById(id);

try {
  createHero($('hero-canvas'));
  createFirstScene($('first-canvas'));

  const lab = createViewer({
    demos: [materials, lights, particles, interaction, shaders, models],
    tabs: $('lab-tabs'),
    stage: $('lab-stage'),
    guiHost: $('lab-gui'),
    desc: $('lab-desc'),
    hint: $('lab-hint'),
  });

  // #lab-<demo id> selects a demo. Feature cards link here; handle their clicks directly,
  // because no hashchange fires when the address already ends in the same hash.
  const openDemo = (id) => {
    const i = lab.indexOf(id);
    if (i < 0) return -1;
    lab.load(i);
    $('lab').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    return i;
  };
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="#lab-"]');
    if (!link || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const id = link.getAttribute('href').slice('#lab-'.length);
    if (lab.indexOf(id) < 0) return;
    e.preventDefault();
    try { history.replaceState(null, '', `#lab-${id}`); } catch { /* sandboxed frames may refuse */ }
    openDemo(id);
  });
  const fromHash = () => {
    const m = location.hash.match(/^#lab-([\w-]+)$/);
    return m ? openDemo(m[1]) : -1;
  };
  window.addEventListener('hashchange', fromHash);
  if (fromHash() < 0) lab.load(0);
} catch (err) {
  // No WebGL: keep the guide readable and say why the scenes are missing.
  console.error(err);
  document.querySelectorAll('.hero-canvas, .first-canvas, .lab-stage').forEach((el) => {
    el.innerHTML = '<p style="padding:20px;color:var(--muted)">Не удалось запустить WebGL в этом браузере, поэтому 3D-сцена не показана.</p>';
  });
}
