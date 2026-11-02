import * as THREE from 'three';
import { fitTo, whenVisible } from './viewer.js';

const css = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

/** Hero viewport: a faceted polyhedron above a grid with XYZ axes, tinted from the page's theme tokens. */
export function createHero(container) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
  camera.position.set(5.5, 4, 6.5);
  camera.lookAt(0, 0.6, 0);
  fitTo(container, renderer, camera);

  scene.add(new THREE.HemisphereLight(0xffffff, 0x445566, 1.6));
  const key = new THREE.DirectionalLight(0xffffff, 2.2);
  key.position.set(4, 6, 3);
  scene.add(key);

  const pivot = new THREE.Group();
  pivot.position.y = 1.3;
  scene.add(pivot);

  const solidMat = new THREE.MeshStandardMaterial({ flatShading: true, roughness: 0.35, metalness: 0.15 });
  const solid = new THREE.Mesh(new THREE.IcosahedronGeometry(1.1, 0), solidMat);
  const wireMat = new THREE.LineBasicMaterial({ transparent: true, opacity: 0.6 });
  const wire = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(1.6, 1)), wireMat);
  pivot.add(solid, wire);

  // Orbiting points, like vertices drifting around the model.
  const N = 260;
  const pos = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    const r = 2 + Math.random() * 1.2;
    const a = Math.random() * Math.PI * 2;
    const y = (Math.random() - 0.5) * 1.6;
    pos.set([Math.cos(a) * r, y, Math.sin(a) * r], i * 3);
  }
  const ptsGeo = new THREE.BufferGeometry();
  ptsGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const ptsMat = new THREE.PointsMaterial({ size: 0.04, transparent: true, opacity: 0.8 });
  const pts = new THREE.Points(ptsGeo, ptsMat);
  pivot.add(pts);

  let grid = null;
  const axes = new THREE.AxesHelper(2.2);
  axes.position.y = 0.002;
  scene.add(axes);

  function applyTheme() {
    const ink = new THREE.Color(css('--muted') || '#536276');
    const line = new THREE.Color(css('--line') || '#ccd5e0');
    const z = new THREE.Color(css('--z') || '#2a62c4');
    solidMat.color.copy(z);
    wireMat.color.copy(ink);
    ptsMat.color.copy(z);
    if (grid) { scene.remove(grid); grid.geometry.dispose(); grid.material.dispose(); }
    grid = new THREE.GridHelper(8, 16, ink, line);
    scene.add(grid);
    axes.setColors(new THREE.Color(css('--x')), new THREE.Color(css('--y')));
  }
  applyTheme();
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applyTheme);
  new MutationObserver(applyTheme).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  const mouse = new THREE.Vector2();
  container.addEventListener('pointermove', (e) => {
    const r = container.getBoundingClientRect();
    mouse.set(((e.clientX - r.left) / r.width) * 2 - 1, ((e.clientY - r.top) / r.height) * 2 - 1);
  });
  container.addEventListener('pointerleave', () => mouse.set(0, 0));

  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clock = new THREE.Clock();
  function frame() {
    const t = still ? 0.8 : clock.getElapsedTime();
    solid.rotation.set(t * 0.35, t * 0.5, 0);
    wire.rotation.set(-t * 0.15, -t * 0.2, 0);
    pts.rotation.y = t * 0.12;
    pivot.position.y = 1.3 + Math.sin(t * 1.2) * 0.12;
    pivot.rotation.x += (mouse.y * 0.4 - pivot.rotation.x) * 0.06;
    pivot.rotation.z += (-mouse.x * 0.4 - pivot.rotation.z) * 0.06;
    renderer.render(scene, camera);
  }
  frame();
  whenVisible(container, (v) => renderer.setAnimationLoop(v && !still ? frame : null));
}
