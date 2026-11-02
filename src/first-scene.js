import * as THREE from 'three';
import { fitTo, whenVisible } from './viewer.js';

/** Exactly the "first scene" code shown on the page, sized to its container. */
export function createFirstScene(container) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
  camera.position.z = 3;

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);
  fitTo(container, renderer, camera);

  const cube = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshStandardMaterial({ color: 0x2f6fd6 }),
  );
  scene.add(cube);

  const light = new THREE.DirectionalLight(0xffffff, 3);
  light.position.set(2, 3, 4);
  scene.add(light, new THREE.AmbientLight(0xffffff, 0.4));

  const loop = (time) => {
    cube.rotation.x = time / 2000;
    cube.rotation.y = time / 1000;
    renderer.render(scene, camera);
  };
  loop(1200);
  whenVisible(container, (v) => renderer.setAnimationLoop(v ? loop : null));
}
