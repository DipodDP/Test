export default {
  id: 'lights',
  title: 'Lights & Shadows',
  description:
    'Ambient, hemisphere, directional, point and spot lights with real-time soft shadow maps, ' +
    'light helpers and exponential fog. Toggle each light and tweak its colour in the panel.',
  camera: [8, 7, 12],

  setup({ THREE, gui }) {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0b0d12);
    scene.fog = new THREE.FogExp2(0x0b0d12, 0.035);

    // Floor + some shadow casters.
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(60, 60),
      new THREE.MeshStandardMaterial({ color: 0x808595, roughness: 0.9 }),
    );
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    const mat = new THREE.MeshStandardMaterial({ color: 0xf2f2f2, roughness: 0.4 });
    const objects = [];
    for (let i = 0; i < 12; i++) {
      const geo = i % 3 === 0 ? new THREE.BoxGeometry(1, 1, 1)
        : i % 3 === 1 ? new THREE.SphereGeometry(0.6, 32, 16)
        : new THREE.ConeGeometry(0.6, 1.4, 32);
      const mesh = new THREE.Mesh(geo, mat);
      const a = (i / 12) * Math.PI * 2;
      const r = 3 + (i % 2) * 2;
      mesh.position.set(Math.cos(a) * r, 0.7, Math.sin(a) * r);
      mesh.castShadow = mesh.receiveShadow = true;
      scene.add(mesh);
      objects.push(mesh);
    }
    const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 3, 32), mat);
    pillar.position.y = 1.5;
    pillar.castShadow = pillar.receiveShadow = true;
    scene.add(pillar);

    // Lights.
    const ambient = new THREE.AmbientLight(0xffffff, 0.08);
    const hemi = new THREE.HemisphereLight(0x87b4ff, 0x332211, 0.3);

    const dir = new THREE.DirectionalLight(0xffeedd, 1.2);
    dir.position.set(-8, 10, 4);
    dir.castShadow = true;
    dir.shadow.mapSize.set(2048, 2048);
    Object.assign(dir.shadow.camera, { left: -10, right: 10, top: 10, bottom: -10 });

    const point = new THREE.PointLight(0xff5533, 30, 15);
    point.castShadow = true;
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.12), new THREE.MeshBasicMaterial({ color: 0xff5533 }));
    point.add(bulb);

    const spot = new THREE.SpotLight(0x55aaff, 120, 30, Math.PI / 7, 0.4, 1.5);
    spot.position.set(6, 9, -4);
    spot.castShadow = true;
    spot.shadow.mapSize.set(1024, 1024);

    scene.add(ambient, hemi, dir, point, spot, spot.target);

    const helpers = [
      new THREE.DirectionalLightHelper(dir, 1),
      new THREE.PointLightHelper(point, 0.4),
      new THREE.SpotLightHelper(spot),
    ];
    helpers.forEach((h) => { h.visible = false; scene.add(h); });

    const params = { helpers: false, animate: true, fog: true };
    gui.add(params, 'helpers').onChange((v) => helpers.forEach((h) => (h.visible = v)));
    gui.add(params, 'animate');
    gui.add(params, 'fog').onChange((v) => (scene.fog = v ? new THREE.FogExp2(0x0b0d12, 0.035) : null));
    const addLight = (name, light, max) => {
      const f = gui.addFolder(name);
      f.add(light, 'visible').name('on');
      f.add(light, 'intensity', 0, max, 0.01);
      f.addColor(light, 'color');
      f.close();
      return f;
    };
    addLight('Ambient', ambient, 2);
    addLight('Hemisphere', hemi, 3);
    addLight('Directional', dir, 5).open();
    addLight('Point', point, 100);
    const sf = addLight('Spot', spot, 400);
    sf.add(spot, 'angle', 0.05, Math.PI / 3, 0.01);
    sf.add(spot, 'penumbra', 0, 1, 0.01);

    return {
      scene,
      update(dt, t) {
        if (params.animate) {
          point.position.set(Math.cos(t * 0.8) * 4, 2 + Math.sin(t * 1.7), Math.sin(t * 0.8) * 4);
          spot.target.position.set(Math.cos(t * 0.5) * 4, 0, Math.sin(t * 0.5) * 4);
          objects.forEach((o, i) => (o.rotation.y += dt * (0.3 + i * 0.05)));
        }
        helpers.forEach((h) => h.update?.());
      },
    };
  },
};
