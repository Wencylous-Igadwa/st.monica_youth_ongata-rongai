import * as THREE from 'three';
import { createResizeSet } from '../utils/helpers.js';

export function createScene(container) {
  const width = container.clientWidth;
  const height = container.clientHeight;

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
  });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
  camera.position.set(0, 0, 6);

  const ambientLight = new THREE.AmbientLight(0xffeedd, 0.6);
  scene.add(ambientLight);

  const mainLight = new THREE.DirectionalLight(0xfff0e0, 1.8);
  mainLight.position.set(3, 5, 4);
  scene.add(mainLight);

  const fillLight = new THREE.DirectionalLight(0xc8d8ff, 0.5);
  fillLight.position.set(-3, 1, -2);
  scene.add(fillLight);

  const rimLight = new THREE.DirectionalLight(0xffe4b5, 0.6);
  rimLight.position.set(-1, -2, 3);
  scene.add(rimLight);

  const pointLight = new THREE.PointLight(0xd4a84b, 1.2, 8);
  pointLight.position.set(0, 1.5, 2);
  scene.add(pointLight);

  const resizeSet = createResizeSet();
  const unsub = resizeSet.add(({ width, height }) => {
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  });

  let animating = true;

  function render() {
    if (!animating) return;
    renderer.render(scene, camera);
    requestAnimationFrame(render);
  }

  render();

  return {
    scene,
    camera,
    renderer,
    pointLight,
    mainLight,
    resizeSet,
    unsub,
    dispose() {
      animating = false;
      unsub();
      resizeSet.destroy();
      renderer.dispose();
      if (renderer.domElement.parentNode) {
        container.removeChild(renderer.domElement);
      }
    },
  };
}
