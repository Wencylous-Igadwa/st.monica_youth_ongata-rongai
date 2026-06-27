import { gsap, ScrollTrigger } from './gsap.js';
import * as THREE from 'three';
import { createScene } from './three/scene.js';
import { loadList } from './utils/data.js';

const SPHERE_DEFAULTS = [
  '/images/koh-01.jpeg', '/images/koh-02.jpeg', '/images/koh-v-2.jpeg',
  '/images/st-monica-1.jpeg', '/images/mary_jesus_01.jpeg', '/images/index.jpeg',
];

const GRID_DEFAULTS = [
  '/images/koh-01.jpeg', '/images/koh-02.jpeg',
  '/images/st-monica-1.jpeg', '/images/mary_jesus_01.jpeg', '/images/index.jpeg',
];

let sphereImages = [...SPHERE_DEFAULTS];
let gridImages = [...GRID_DEFAULTS];

async function renderGalleryGrid() {
  const grid = document.querySelector('[data-gallery-grid]');
  if (!grid) return;
  const images = gridImages.slice(0, 8);
  grid.innerHTML = images.map(url => `
    <div class="gallery-grid-item">
      <img src="${url}" alt="Gallery image" loading="lazy">
      <div class="gallery-grid-overlay"></div>
    </div>
  `).join('');
}

export async function initGallery() {
  sphereImages = await loadList('gallery_sphere', SPHERE_DEFAULTS);
  gridImages = await loadList('gallery_grid', GRID_DEFAULTS);
  renderGalleryGrid();
  const section = document.querySelector('[data-gallery]');
  const canvasWrap = document.querySelector('[data-gallery-3d]');
  const text = document.querySelector('[data-gallery-text]');
  if (!canvasWrap || !section) return;

  const { scene, camera, renderer, dispose } = createScene(canvasWrap);

  const imageUrls = sphereImages.slice(0, 12);

  const group = new THREE.Group();
  scene.add(group);

  const count = imageUrls.length;
  const radius = 4.2;

  let scrollBase = 0;
  let dragOffsetY = 0;
  let dragOffsetX = 0.15;
  let momentumY = 0;
  let momentumX = 0;
  let isDragging = false;
  let dragPrevX = 0;
  let dragPrevY = 0;

  imageUrls.forEach((url, i) => {
    const loader = new THREE.TextureLoader();
    loader.load(url, tex => {
      tex.colorSpace = THREE.SRGBColorSpace;

      const aspect = tex.image ? tex.image.width / tex.image.height : 1.5;
      const width = 1.8;
      const height = width / aspect;

      const geometry = new THREE.PlaneGeometry(width, height);
      const material = new THREE.MeshBasicMaterial({
        map: tex,
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
      });

      const mesh = new THREE.Mesh(geometry, material);

      const phi = Math.acos(2 * (i / count) - 1);
      const theta = i * 3.883;

      mesh.position.set(
        Math.sin(phi) * Math.cos(theta) * radius,
        Math.cos(phi) * radius * 0.7,
        Math.sin(phi) * Math.sin(theta) * radius
      );
      mesh.lookAt(0, 0, 0);

      group.add(mesh);

      gsap.to(material, {
        opacity: 1,
        duration: 1.5,
        delay: i * 0.15,
        ease: 'power3.out',
      });
    });
  });

  camera.position.set(0, 0.5, 7);

  if (window.lenis) {
    window.lenis.on('scroll', () => {
      const rect = section.getBoundingClientRect();
      const progress = Math.min(Math.max(-rect.top / (rect.height + window.innerHeight), 0), 1);
      scrollBase = progress * Math.PI * 2;
    });
  }

  canvasWrap.addEventListener('pointerdown', (e) => {
    isDragging = true;
    dragPrevX = e.clientX;
    dragPrevY = e.clientY;
    momentumY = 0;
    momentumX = 0;
    canvasWrap.setPointerCapture(e.pointerId);
  });

  canvasWrap.addEventListener('pointermove', (e) => {
    if (!isDragging) return;
    const dx = e.clientX - dragPrevX;
    const dy = e.clientY - dragPrevY;
    dragPrevX = e.clientX;
    dragPrevY = e.clientY;
    momentumY = dx * 0.005;
    momentumX = dy * 0.004;
    dragOffsetY += momentumY;
    dragOffsetX += momentumX;
    dragOffsetX = Math.max(-1.2, Math.min(1.2, dragOffsetX));
  });

  function onDragEnd() {
    isDragging = false;
  }

  canvasWrap.addEventListener('pointerup', onDragEnd);
  canvasWrap.addEventListener('pointercancel', onDragEnd);

  if (text) {
    gsap.fromTo(text, { opacity: 0, y: 30 }, {
      opacity: 0.5, y: 0, duration: 1.2, ease: 'power3.out',
      scrollTrigger: { trigger: text, start: 'top 80%', end: 'top 40%' }
    });
  }

  function animate() {
    if (!isDragging) {
      dragOffsetY += momentumY;
      dragOffsetX += momentumX;
      momentumY *= 0.95;
      momentumX *= 0.95;
      if (Math.abs(momentumY) < 0.0005) momentumY = 0;
      if (Math.abs(momentumX) < 0.0005) momentumX = 0;
    }

    const targetY = scrollBase + dragOffsetY;
    group.rotation.y += (targetY - group.rotation.y) * 0.08;
    group.rotation.x += (dragOffsetX - group.rotation.x) * 0.06;

    group.children.forEach((child, i) => {
      if (child.isMesh) {
        const float = Math.sin(performance.now() / 1000 * 0.4 + i * 1.8) * 0.12;
        const base = child.userData.baseY;
        if (base === undefined) {
          child.userData.baseY = child.position.y;
        } else {
          child.position.y = base + float;
        }
      }
    });

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  animate();

  return { dispose };
}
