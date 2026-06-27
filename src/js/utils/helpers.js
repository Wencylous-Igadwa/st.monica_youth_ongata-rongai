export function setViewportProps() {
  const doc = document.documentElement;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  doc.style.setProperty('--vw', `${vw / 100}px`);
  doc.style.setProperty('--vh', `${vh / 100}px`);
}

export function debounce(fn, delay = 100) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

export function createResizeSet() {
  const callbacks = new Set();
  let rafId = null;

  const handle = debounce(() => {
    setViewportProps();
    rafId && cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(() => {
      callbacks.forEach(cb => cb({ width: window.innerWidth, height: window.innerHeight }));
    });
  }, 60);

  window.addEventListener('resize', handle);
  window.addEventListener('orientationchange', handle);

  return {
    add(cb) { callbacks.add(cb); return () => callbacks.delete(cb); },
    remove(cb) { callbacks.delete(cb); },
    destroy() {
      window.removeEventListener('resize', handle);
      window.removeEventListener('orientationchange', handle);
      rafId && cancelAnimationFrame(rafId);
      callbacks.clear();
    }
  };
}

export function lerp(start, end, t) {
  return start * (1 - t) + end * t;
}

export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export function mapRange(value, inMin, inMax, outMin, outMax) {
  return outMin + ((value - inMin) / (inMax - inMin)) * (outMax - outMin);
}

export function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}
