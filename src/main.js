import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import Stats from 'three/addons/libs/stats.module.js';
import GUI from 'lil-gui';

import materials from './scenes/materials.js';
import lights from './scenes/lights.js';
import particles from './scenes/particles.js';
import interaction from './scenes/interaction.js';
import shaders from './scenes/shaders.js';
import models from './scenes/models.js';

const DEMOS = [materials, lights, particles, interaction, shaders, models];

// --- Core setup shared by every demo ----------------------------------------
const container = document.getElementById('app');
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
container.appendChild(renderer.domElement);

const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 500);
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

const stats = new Stats();
stats.dom.style.cssText = 'position:fixed;bottom:8px;left:8px;opacity:0.8;';
document.body.appendChild(stats.dom);

const clock = new THREE.Clock();
let gui = null;
let active = null;

// --- Demo switching ---------------------------------------------------------
const tabs = document.getElementById('tabs');
const description = document.getElementById('description');

DEMOS.forEach((demo, i) => {
  const button = document.createElement('button');
  button.textContent = demo.title;
  button.addEventListener('click', () => load(i));
  tabs.appendChild(button);
});

function load(index) {
  if (active) {
    active.dispose?.();
    disposeScene(active.scene);
  }
  gui?.destroy();
  gui = new GUI({ title: DEMOS[index].title });

  const demo = DEMOS[index];
  [...tabs.children].forEach((b, i) => b.classList.toggle('active', i === index));
  description.textContent = demo.description;

  controls.reset();
  camera.position.set(...(demo.camera ?? [0, 4, 10]));
  controls.target.set(...(demo.target ?? [0, 0, 0]));
  controls.autoRotate = false;

  active = demo.setup({ THREE, renderer, camera, controls, gui });
  history.replaceState(null, '', `#${demo.id}`);
}

function disposeScene(scene) {
  scene.traverse((obj) => {
    obj.geometry?.dispose();
    const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
    mats.forEach((m) => {
      if (!m) return;
      Object.values(m).forEach((v) => v?.isTexture && v.dispose());
      m.dispose();
    });
  });
  if (scene.environment?.dispose) scene.environment.dispose();
}

// --- Resize & render loop ---------------------------------------------------
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

renderer.setAnimationLoop(() => {
  const dt = clock.getDelta();
  const t = clock.elapsedTime;
  controls.update();
  active?.update?.(dt, t);
  renderer.render(active.scene, camera);
  stats.update();
});

const indexFromHash = () => Math.max(0, DEMOS.findIndex((d) => `#${d.id}` === location.hash));
window.addEventListener('hashchange', () => load(indexFromHash()));
load(indexFromHash());
