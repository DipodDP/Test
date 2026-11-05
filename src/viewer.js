import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import GUI from 'lil-gui';

/** Runs `fn` only while `el` is on screen; returns nothing. */
export function whenVisible(el, onChange) {
  new IntersectionObserver(([e]) => onChange(e.isIntersecting), { rootMargin: '100px' }).observe(el);
}

/** Size a renderer + camera to a container element and keep them in sync. */
export function fitTo(container, renderer, camera) {
  const resize = () => {
    const w = container.clientWidth;
    const h = container.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  new ResizeObserver(resize).observe(container);
  resize();
}

/**
 * Embedded demo viewer: tabs + canvas + lil-gui panel inside the page.
 * Each demo module exports { id, title, description, camera, target, setup }.
 */
export function createViewer({ demos, tabs, stage, guiHost, desc, hint }) {
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  stage.prepend(renderer.domElement);

  const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 500);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.enableZoom = false; // wheel would hijack page scroll; enabled after a click
  fitTo(stage, renderer, camera);

  renderer.domElement.addEventListener('pointerdown', () => {
    controls.enableZoom = true;
    hint.classList.add('off');
  });
  stage.addEventListener('pointerleave', () => {
    controls.enableZoom = false;
    hint.classList.remove('off');
  });

  const clock = new THREE.Clock();
  let gui = null;
  let active = null;
  let current = -1;

  demos.forEach((demo, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.role = 'tab';
    b.id = `lab-tab-${demo.id}`;
    b.textContent = demo.title;
    b.addEventListener('click', () => {
      try { history.replaceState(null, '', `#lab-${demo.id}`); } catch { /* sandboxed frames may refuse */ }
      load(i);
    });
    tabs.appendChild(b);
  });

  function load(index) {
    if (index === current) return;
    current = index;
    if (active) {
      active.dispose?.();
      disposeScene(active.scene);
    }
    gui?.destroy();
    gui = new GUI({ container: guiHost, title: 'Настройки' });
    if (stage.clientWidth < 560) gui.close();

    const demo = demos[index];
    [...tabs.children].forEach((b, i) => b.setAttribute('aria-selected', String(i === index)));
    desc.textContent = demo.description;

    controls.autoRotate = false;
    camera.position.set(...(demo.camera ?? [0, 4, 10]));
    controls.target.set(...(demo.target ?? [0, 0, 0]));
    controls.update();

    active = demo.setup({ THREE, renderer, camera, controls, gui });
  }

  function frame() {
    const dt = Math.min(clock.getDelta(), 0.1);
    controls.update();
    active.update?.(dt, clock.elapsedTime);
    renderer.render(active.scene, camera);
  }
  whenVisible(stage, (v) => {
    clock.getDelta();
    renderer.setAnimationLoop(v ? frame : null);
  });

  return {
    load,
    indexOf: (id) => demos.findIndex((d) => d.id === id),
  };
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
  scene.environment?.dispose?.();
}
