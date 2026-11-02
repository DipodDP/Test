const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uAmplitude;
  uniform float uFrequency;
  varying float vElevation;
  varying vec2 vUv;

  void main() {
    vec4 world = modelMatrix * vec4(position, 1.0);
    float e = sin(world.x * uFrequency + uTime) * sin(world.z * uFrequency * 0.8 + uTime * 0.7);
    e += 0.35 * sin(length(world.xz) * uFrequency * 2.0 - uTime * 2.0);
    world.y += e * uAmplitude;
    vElevation = e;
    vUv = uv;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uDeep;
  uniform vec3 uCrest;
  uniform float uGrid;
  varying float vElevation;
  varying vec2 vUv;

  void main() {
    vec3 color = mix(uDeep, uCrest, smoothstep(-1.0, 1.2, vElevation));
    vec2 g = abs(fract(vUv * uGrid - 0.5) - 0.5) / fwidth(vUv * uGrid);
    float line = 1.0 - min(min(g.x, g.y), 1.0);
    color += line * 0.25;
    gl_FragColor = vec4(color, 1.0);
    #include <colorspace_fragment>
  }
`;

export default {
  id: 'shaders',
  title: 'Шейдеры',
  description:
    'ShaderMaterial с собственным кодом на GLSL. Вершинный шейдер изгибает плоскость из 65 тысяч вершин в волны прямо на видеокарте, фрагментный красит её по высоте и рисует сетку. Все uniforms меняются в панели.',
  camera: [0, 6, 10],

  setup({ THREE, gui }) {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x070a14);

    const uniforms = {
      uTime: { value: 0 },
      uAmplitude: { value: 0.6 },
      uFrequency: { value: 0.8 },
      uGrid: { value: 40 },
      uDeep: { value: new THREE.Color(0x0b1a4a) },
      uCrest: { value: new THREE.Color(0x44e0ff) },
    };

    const plane = new THREE.Mesh(
      new THREE.PlaneGeometry(16, 16, 256, 256),
      new THREE.ShaderMaterial({ vertexShader, fragmentShader, uniforms, side: THREE.DoubleSide }),
    );
    plane.rotation.x = -Math.PI / 2;
    scene.add(plane);

    const params = { speed: 1 };
    gui.add(params, 'speed', 0, 4, 0.01);
    gui.add(uniforms.uAmplitude, 'value', 0, 2, 0.01).name('amplitude');
    gui.add(uniforms.uFrequency, 'value', 0.1, 3, 0.01).name('frequency');
    gui.add(uniforms.uGrid, 'value', 1, 100, 1).name('grid lines');
    gui.addColor(uniforms.uDeep, 'value').name('deep colour');
    gui.addColor(uniforms.uCrest, 'value').name('crest colour');
    gui.add(plane.material, 'wireframe');

    return {
      scene,
      update(dt) {
        uniforms.uTime.value += dt * params.speed;
      },
    };
  },
};
