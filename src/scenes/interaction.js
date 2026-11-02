export default {
  id: 'interaction',
  title: 'Выбор мышью',
  description:
    'Сетка 20×20 из 400 кубиков — это один InstancedMesh и один вызов отрисовки. Raycaster определяет кубик под курсором: наведите, чтобы подсветить, кликните, чтобы запустить волну.',
  camera: [0, 17, 21],

  setup({ THREE, renderer, camera, gui }) {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x101218);
    scene.add(new THREE.HemisphereLight(0xffffff, 0x223344, 1.2));
    const dir = new THREE.DirectionalLight(0xffffff, 1.5);
    dir.position.set(5, 10, 7);
    scene.add(dir);

    const N = 20;
    const SPACING = 1.1;
    const COUNT = N * N;
    const mesh = new THREE.InstancedMesh(
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.MeshStandardMaterial({ roughness: 0.4, metalness: 0.1 }),
      COUNT,
    );
    scene.add(mesh);

    const base = new THREE.Color(0x3b4c78);
    const hover = new THREE.Color(0xffd166);
    const wave = new THREE.Color(0x4f7cff);
    const tmpColor = new THREE.Color();
    const dummy = new THREE.Object3D();
    const cells = [];
    for (let i = 0; i < COUNT; i++) {
      const x = (i % N) - (N - 1) / 2;
      const z = Math.floor(i / N) - (N - 1) / 2;
      cells.push({ x: x * SPACING, z: z * SPACING });
      mesh.setColorAt(i, base);
    }

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2(10, 10);
    let hovered = -1;
    const ripples = []; // { x, z, start }
    let elapsed = 0;

    const params = { amplitude: 1.5, speed: 8, decay: 2.5 };
    gui.add(params, 'amplitude', 0.2, 4, 0.1);
    gui.add(params, 'speed', 1, 20, 0.1);
    gui.add(params, 'decay', 0.5, 6, 0.1);
    gui.add({ randomRipple: () => addRipple(Math.floor(Math.random() * COUNT)) }, 'randomRipple')
      .name('random ripple');

    function pick() {
      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.intersectObject(mesh)[0];
      return hit ? hit.instanceId : -1;
    }

    function addRipple(index) {
      ripples.push({ x: cells[index].x, z: cells[index].z, start: elapsed });
    }

    const el = renderer.domElement;
    let downAt = null;
    const onMove = (e) => {
      const rect = el.getBoundingClientRect();
      pointer.set(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
    };
    const onDown = (e) => (downAt = { x: e.clientX, y: e.clientY });
    const onUp = (e) => {
      // Treat as a click only if the pointer barely moved (i.e. not an orbit drag).
      if (downAt && Math.hypot(e.clientX - downAt.x, e.clientY - downAt.y) < 5) {
        onMove(e);
        const index = pick();
        if (index >= 0) addRipple(index);
      }
      downAt = null;
    };
    const onLeave = () => pointer.set(10, 10);
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerdown', onDown);
    el.addEventListener('pointerup', onUp);
    el.addEventListener('pointerleave', onLeave);

    return {
      scene,
      update(dt) {
        elapsed += dt;
        // Drop ripples that have fully faded.
        for (let r = ripples.length - 1; r >= 0; r--) if (elapsed - ripples[r].start > 6) ripples.splice(r, 1);

        for (let i = 0; i < COUNT; i++) {
          const { x, z } = cells[i];
          let h = 0;
          for (const r of ripples) {
            const age = elapsed - r.start;
            const d = Math.hypot(x - r.x, z - r.z);
            const front = age * params.speed;
            const k = Math.exp(-Math.pow(d - front, 2)) * Math.exp(-age * params.decay * 0.3);
            h += k * params.amplitude;
          }
          dummy.position.set(x, h, z);
          dummy.scale.set(1, 1 + h, 1);
          dummy.updateMatrix();
          mesh.setMatrixAt(i, dummy.matrix);
          tmpColor.copy(base).lerp(wave, Math.min(h / params.amplitude, 1));
          if (i === hovered) tmpColor.copy(hover);
          mesh.setColorAt(i, tmpColor);
        }
        mesh.instanceMatrix.needsUpdate = true;
        mesh.instanceColor.needsUpdate = true;
        mesh.computeBoundingSphere();

        hovered = pick();
        el.style.cursor = hovered >= 0 ? 'pointer' : '';
      },
      dispose() {
        el.removeEventListener('pointermove', onMove);
        el.removeEventListener('pointerdown', onDown);
        el.removeEventListener('pointerup', onUp);
        el.removeEventListener('pointerleave', onLeave);
        el.style.cursor = '';
      },
    };
  },
};
