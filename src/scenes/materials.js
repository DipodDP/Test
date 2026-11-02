import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

export default {
  id: 'materials',
  title: 'Geometries & Materials',
  description:
    'Built-in geometries paired with the core material types: Basic, Lambert, Phong, Toon, Normal, ' +
    'Standard (PBR) and Physical (iridescence, clearcoat), lit by a PMREM environment map. The cube uses a canvas texture.',
  camera: [0, 3, 12],

  setup({ THREE, renderer, gui }) {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x14161d);

    // Image-based lighting from a procedural room, pre-filtered with PMREM.
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();

    scene.add(new THREE.AmbientLight(0xffffff, 0.3));
    const sun = new THREE.DirectionalLight(0xffffff, 1.5);
    sun.position.set(5, 8, 5);
    scene.add(sun);

    // Procedural checker texture drawn on a canvas.
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 128;
    const ctx = canvas.getContext('2d');
    for (let y = 0; y < 8; y++)
      for (let x = 0; x < 8; x++) {
        ctx.fillStyle = (x + y) % 2 ? '#ffb347' : '#3a3f58';
        ctx.fillRect(x * 16, y * 16, 16, 16);
      }
    const checker = new THREE.CanvasTexture(canvas);
    checker.colorSpace = THREE.SRGBColorSpace;

    const color = 0x4f7cff;
    const items = [
      ['Basic', new THREE.BoxGeometry(1.4, 1.4, 1.4), new THREE.MeshBasicMaterial({ map: checker })],
      ['Lambert', new THREE.SphereGeometry(0.9, 48, 32), new THREE.MeshLambertMaterial({ color })],
      ['Phong', new THREE.TorusGeometry(0.7, 0.28, 32, 64), new THREE.MeshPhongMaterial({ color, shininess: 120 })],
      ['Toon', new THREE.TorusKnotGeometry(0.55, 0.2, 128, 16), new THREE.MeshToonMaterial({ color: 0xff7a59 })],
      ['Normal', new THREE.IcosahedronGeometry(0.95, 0), new THREE.MeshNormalMaterial({ flatShading: true })],
      ['Standard', new THREE.DodecahedronGeometry(0.95), new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 1, roughness: 0.25 })],
      ['Iridescent', new THREE.SphereGeometry(0.9, 64, 32), new THREE.MeshPhysicalMaterial({ color: 0xffffff, metalness: 1, roughness: 0.15, iridescence: 1, iridescenceIOR: 1.3, iridescenceThicknessRange: [100, 800] })],
      ['Clearcoat', new THREE.CapsuleGeometry(0.55, 0.8, 8, 32), new THREE.MeshPhysicalMaterial({ color: 0xc0143c, metalness: 0.2, roughness: 0.6, clearcoat: 1, clearcoatRoughness: 0.05 })],
    ];

    const meshes = items.map(([label, geometry, material], i) => {
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set((i % 4) * 3 - 4.5, i < 4 ? 1.5 : -1.5, 0);
      mesh.name = label;
      scene.add(mesh);
      scene.add(makeLabel(THREE, label, mesh.position));
      return mesh;
    });

    const params = { rotate: true, speed: 0.6, wireframe: false, envIntensity: 1, metalness: 1, roughness: 0.25 };
    gui.add(params, 'rotate');
    gui.add(params, 'speed', 0, 3, 0.01);
    gui.add(params, 'wireframe').onChange((v) => meshes.forEach((m) => (m.material.wireframe = v)));
    gui.add(params, 'envIntensity', 0, 3, 0.01).name('env intensity')
      .onChange((v) => (scene.environmentIntensity = v));
    const std = gui.addFolder('Standard material');
    std.add(params, 'metalness', 0, 1, 0.01).onChange((v) => (meshes[5].material.metalness = v));
    std.add(params, 'roughness', 0, 1, 0.01).onChange((v) => (meshes[5].material.roughness = v));

    return {
      scene,
      update(dt) {
        if (!params.rotate) return;
        meshes.forEach((m, i) => {
          m.rotation.x += dt * params.speed * 0.6;
          m.rotation.y += dt * params.speed * (1 + i * 0.05);
        });
      },
    };
  },
};

function makeLabel(THREE, text, position) {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  ctx.font = '600 30px system-ui, sans-serif';
  ctx.fillStyle = '#c9cfdd';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 128, 32);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true }));
  sprite.scale.set(2, 0.5, 1);
  sprite.position.set(position.x, position.y - 1.35, position.z);
  return sprite;
}
