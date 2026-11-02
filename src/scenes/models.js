import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const MODEL_URL = 'https://threejs.org/examples/models/gltf/RobotExpressive/RobotExpressive.glb';

export default {
  id: 'models',
  title: 'glTF и анимация',
  description:
    'GLTFLoader загружает модель робота со скелетной анимацией, AnimationMixer проигрывает её клипы с плавными переходами. Выберите движение в панели. Модель: Tomás Laulhé, лицензия CC0, из примеров three.js.',
  camera: [-5, 3, 8],
  target: [0, 1.5, 0],

  setup({ THREE, gui }) {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xbfd8f0);
    scene.fog = new THREE.Fog(0xbfd8f0, 20, 60);

    scene.add(new THREE.HemisphereLight(0xffffff, 0x8d8d8d, 2.5));
    const sun = new THREE.DirectionalLight(0xffffff, 2.5);
    sun.position.set(3, 10, 6);
    sun.castShadow = true;
    Object.assign(sun.shadow.camera, { left: -6, right: 6, top: 6, bottom: -6 });
    sun.shadow.mapSize.set(1024, 1024);
    scene.add(sun);

    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(200, 200),
      new THREE.MeshStandardMaterial({ color: 0xcbcbcb, roughness: 1 }),
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);
    const grid = new THREE.GridHelper(200, 100, 0x000000, 0x000000);
    grid.material.opacity = 0.15;
    grid.material.transparent = true;
    scene.add(grid);

    let mixer = null;
    let current = null;
    let disposed = false;
    const params = { clip: '', timeScale: 1 };

    const play = (actions, name) => {
      const next = actions[name];
      if (!next || next === current) return;
      next.reset().fadeIn(0.4).play();
      current?.fadeOut(0.4);
      current = next;
    };

    const loading = gui.add({ status: 'загрузка…' }, 'status').name('модель').disable();

    new GLTFLoader().load(
      MODEL_URL,
      (gltf) => {
        if (disposed) return;
        loading.destroy();
        const model = gltf.scene;
        model.traverse((o) => o.isMesh && (o.castShadow = true));
        scene.add(model);

        mixer = new THREE.AnimationMixer(model);
        const actions = Object.fromEntries(gltf.animations.map((c) => [c.name, mixer.clipAction(c)]));
        params.clip = actions.Dance ? 'Dance' : gltf.animations[0].name;
        play(actions, params.clip);
        gui.add(params, 'clip', Object.keys(actions)).onChange((n) => play(actions, n));
        gui.add(params, 'timeScale', 0, 3, 0.01).name('speed').onChange((v) => (mixer.timeScale = v));
      },
      undefined,
      () => {
        if (disposed) return;
        loading.setValue('нет сети — запасной вариант');
        // No network? Show a hand-built keyframe animation instead.
        const box = new THREE.Mesh(
          new THREE.BoxGeometry(1, 1, 1),
          new THREE.MeshStandardMaterial({ color: 0x4f7cff }),
        );
        box.castShadow = true;
        scene.add(box);
        const times = [0, 1, 2];
        const clip = new THREE.AnimationClip('bounce', 2, [
          new THREE.VectorKeyframeTrack('.position', times, [0, 0.5, 0, 0, 3, 0, 0, 0.5, 0]),
          new THREE.NumberKeyframeTrack('.rotation[y]', times, [0, Math.PI, Math.PI * 2]),
        ]);
        mixer = new THREE.AnimationMixer(box);
        mixer.clipAction(clip).play();
      },
    );

    return {
      scene,
      update(dt) {
        mixer?.update(dt);
      },
      dispose() {
        disposed = true;
        mixer?.stopAllAction();
      },
    };
  },
};
