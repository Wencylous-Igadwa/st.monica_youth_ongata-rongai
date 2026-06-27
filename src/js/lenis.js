import Lenis from 'lenis';
import { gsap, ScrollTrigger } from './gsap.js';
import { createResizeSet } from './utils/helpers.js';

export function initLenis() {
  const lenis = new Lenis({
    lerp: 0.08,
    wheelMultiplier: 1,
    smoothWheel: true,
    smoothTouch: true,
    touchMultiplier: 1.5,
  });

  const resizeSet = createResizeSet();
  resizeSet.add(() => ScrollTrigger.refresh());

  lenis.on('scroll', () => {
    ScrollTrigger.update();
  });

  gsap.ticker.lagSmoothing(0);
  gsap.ticker.add(time => {
    lenis.raf(time * 1000);
  });

  window.lenis = lenis;

  return { lenis, resizeSet };
}

export { createResizeSet };
