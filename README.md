# Путеводитель по Three.js

Русскоязычный интерактивный гид по библиотеке [three.js](https://threejs.org): что это такое,
зачем она нужна, её преимущества, где её применяют, базовые понятия, сравнение с альтернативами
и как начать. В страницу встроены живые 3D-сцены:

- **Герой-сцена**: многогранник над сеткой с осями XYZ, цвета берутся из темы страницы.
- **Первая сцена**: код вращающегося куба и результат его работы рядом.
- **Лаборатория** с шестью примерами и панелью настроек: материалы, свет и тени, частицы,
  выбор объектов мышью (Raycaster + InstancedMesh), свои шейдеры, glTF-модель с анимацией.

Онлайн: https://dipoddp.github.io/Test/ (GitHub Pages).

## Запуск локально

Сборка не нужна: three.js и lil-gui подключаются с CDN через import map. Нужен любой статический сервер:

```bash
npx serve .            # или: python3 -m http.server 8000
```

Ссылки вида `#lab-shaders` сразу открывают нужный пример в лаборатории
(`materials`, `lights`, `particles`, `interaction`, `shaders`, `models`).

## Структура

```
index.html             текст путеводителя и import map
src/guide.css          стили (светлая и тёмная темы)
src/main.js            точка входа: подсветка кода, сцены, лаборатория, навигация по #lab-*
src/viewer.js          встроенный просмотрщик примеров (вкладки, OrbitControls, lil-gui)
src/hero.js            сцена в шапке
src/first-scene.js     живой пример «куб за 20 строк»
src/highlight.js       маленькая подсветка синтаксиса
src/scenes/*.js        примеры лаборатории: { id, title, description, camera, setup() }
```

Чтобы добавить пример, создайте модуль в `src/scenes/`, который экспортирует
`{ id, title, description, setup }`, где `setup({ THREE, renderer, camera, controls, gui })`
возвращает `{ scene, update(dt, t), dispose() }`, и добавьте его в список в `src/main.js`.
