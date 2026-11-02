# Three.js Feature Showcase

A small, dependency-free web app that demonstrates core [three.js](https://threejs.org) features
through six interactive demos. Every demo has a live control panel (lil-gui), orbit controls and an FPS meter.

| Demo | What it shows |
| --- | --- |
| **Geometries & Materials** | Built-in geometries; Basic, Lambert, Phong, Toon, Normal, Standard (PBR) and Physical (iridescence, clearcoat) materials; PMREM environment lighting; canvas textures; sprites |
| **Lights & Shadows** | Ambient, hemisphere, directional, point and spot lights; soft shadow maps; light helpers; exponential fog |
| **Particles** | Procedural galaxy of up to 200k points from a raw `BufferGeometry` with per-vertex colours and additive blending |
| **Raycasting** | 400-cube `InstancedMesh` (one draw call) with pointer hover highlight and click-to-ripple via `Raycaster` |
| **Custom Shaders** | `ShaderMaterial` with GLSL vertex displacement and a height-coloured, anti-aliased grid; live uniforms |
| **GLTF & Animation** | Skinned glTF model loaded with `GLTFLoader`, clips played and cross-faded with `AnimationMixer` (falls back to a keyframe-track animation when offline) |

## Run it

No build step — three.js and lil-gui are loaded as ES modules from a CDN via an import map.
Serve the folder with any static server (ES modules don't work from `file://`):

```bash
npx serve .            # or: python3 -m http.server 8000
```

Then open the printed URL. Link straight to a demo with a hash, e.g. `/#shaders`.

## Project layout

```
index.html            import map + HUD markup
src/main.js           renderer, camera, controls, demo switching, render loop
src/style.css
src/scenes/*.js       one module per demo: { id, title, description, camera, setup() }
```

To add a demo, create a module in `src/scenes/` that exports `{ id, title, description, setup }`
where `setup({ THREE, renderer, camera, controls, gui })` returns `{ scene, update(dt, t), dispose() }`,
then add it to the `DEMOS` array in `src/main.js`.
