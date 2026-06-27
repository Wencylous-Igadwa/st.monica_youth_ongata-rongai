import { gsap } from './gsap.js';

export function initLoader() {
  return new Promise(resolve => {
    const loader = document.querySelector('[data-loader]');
    if (!loader) { resolve(); return; }

    const text = loader.querySelector('.loading');
    const letters = loader.querySelectorAll('[data-l]');
    const svgWrap = loader.querySelector('#svg-container');

    if (svgWrap) gsap.set(svgWrap, { autoAlpha: 0, scale: 0.8 });
    gsap.set(text, { autoAlpha: 0 });

    letters.forEach(l => {
      const angle = Math.random() * Math.PI * 2;
      const dist = 150 + Math.random() * 250;
      gsap.set(l, {
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist,
        rotation: (Math.random() - 0.5) * 720,
        opacity: 0,
      });
    });

    const tl = gsap.timeline();

    if (svgWrap) {
      tl.to(svgWrap, { autoAlpha: 1, scale: 1, duration: 0.5, ease: 'back.out(1.7)' });
    }
    tl.to(text, { autoAlpha: 1, duration: 0.3 }, '-=0.2')
      .to(letters, {
        x: 0, y: 0, rotation: 0, opacity: 1,
        duration: 0.8, stagger: 0.04, ease: 'back.out(1.4)',
      })
      .to({}, { duration: 1.2 })
      .to(loader, {
        autoAlpha: 0, duration: 0.6, ease: 'power2.in',
        onComplete: () => {
          document.documentElement.classList.add('is-ready');
          loader.style.display = 'none';
          resolve();
        },
      });
  });
}
