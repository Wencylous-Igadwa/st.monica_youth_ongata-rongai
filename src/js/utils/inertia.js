import { gsap } from '../gsap.js';

export function initInertia() {
  const container = document.querySelector('[data-inertia]');
  if (!container) return;
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  document.addEventListener('mousemove', e => {
    const x = (e.clientX / window.innerWidth) * 2 - 1;
    const y = (e.clientY / window.innerHeight) * 2 - 1;

    container.querySelectorAll('[data-inertia-item]').forEach(item => {
      const rect = item.getBoundingClientRect();
      const ix = (rect.left + rect.width / 2) / window.innerWidth;
      const iy = (rect.top + rect.height / 2) / window.innerHeight;

      const dx = (x - ix * 2 + 1) * 8;
      const dy = (y - iy * 2 + 1) * 8;

      gsap.to(item, {
        x: dx,
        y: dy,
        rotate: dx * 0.5,
        duration: 2,
        ease: 'power2.out',
        overwrite: 'auto',
      });
    });
  });
}
