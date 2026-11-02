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

  // #lab-<demo id> selects a demo (feature cards link here) and the browser scrolls to it.
  const fromHash = () => {
    const m = location.hash.match(/^#lab-([\w-]+)$/);
    const i = m ? lab.indexOf(m[1]) : -1;
    if (i >= 0) {
      lab.load(i);
      $('lab').scrollIntoView();
    }
    return i;
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
