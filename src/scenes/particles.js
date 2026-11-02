export default {
  id: 'particles',
  title: 'Частицы',
  description:
    'Галактика из десятков тысяч точек: координаты и цвета записаны в BufferGeometry вручную, а рисует их Points с аддитивным смешиванием. Измените параметры — галактика сгенерируется заново.',
  camera: [0, 6, 9],

  setup({ THREE, gui, controls }) {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020308);

    const params = {
      count: 80000, size: 0.02, radius: 6, branches: 4, spin: 1, randomness: 0.25,
      randomnessPower: 3, insideColor: '#ff7a3d', outsideColor: '#3d5cff', autoRotate: true,
    };

    let points = null;
    const material = new THREE.PointsMaterial({
      size: params.size, sizeAttenuation: true, depthWrite: false,
      blending: THREE.AdditiveBlending, vertexColors: true,
    });

    function generate() {
      if (points) {
        points.geometry.dispose();
        scene.remove(points);
      }
      const positions = new Float32Array(params.count * 3);
      const colors = new Float32Array(params.count * 3);
      const inside = new THREE.Color(params.insideColor);
      const outside = new THREE.Color(params.outsideColor);
      const c = new THREE.Color();
      const rnd = () => Math.pow(Math.random(), params.randomnessPower) * (Math.random() < 0.5 ? 1 : -1)
        * params.randomness;

      for (let i = 0; i < params.count; i++) {
        const r = Math.random() * params.radius;
        const branch = ((i % params.branches) / params.branches) * Math.PI * 2;
        const angle = branch + r * params.spin;
        positions[i * 3] = Math.cos(angle) * r + rnd() * r;
        positions[i * 3 + 1] = rnd() * r * 0.5;
        positions[i * 3 + 2] = Math.sin(angle) * r + rnd() * r;

        c.copy(inside).lerp(outside, r / params.radius);
        colors.set([c.r, c.g, c.b], i * 3);
      }

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      material.size = params.size;
      points = new THREE.Points(geometry, material);
      scene.add(points);
    }
    generate();

    gui.add(params, 'count', 1000, 200000, 1000).onFinishChange(generate);
    gui.add(params, 'size', 0.005, 0.1, 0.001).onChange((v) => (material.size = v));
    gui.add(params, 'radius', 1, 15, 0.1).onFinishChange(generate);
    gui.add(params, 'branches', 2, 10, 1).onFinishChange(generate);
    gui.add(params, 'spin', -3, 3, 0.01).onFinishChange(generate);
    gui.add(params, 'randomness', 0, 1, 0.01).onFinishChange(generate);
    gui.add(params, 'randomnessPower', 1, 8, 0.1).onFinishChange(generate);
    gui.addColor(params, 'insideColor').onFinishChange(generate);
    gui.addColor(params, 'outsideColor').onFinishChange(generate);
    gui.add(params, 'autoRotate').name('auto-rotate camera')
      .onChange((v) => (controls.autoRotate = v));
    controls.autoRotate = params.autoRotate;
    controls.autoRotateSpeed = 0.6;

    return {
      scene,
      update(dt) {
        points.rotation.y += dt * 0.05;
      },
      dispose() {
        controls.autoRotate = false;
      },
    };
  },
};
