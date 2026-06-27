import { gsap } from './gsap.js';
import { createScene } from './three/scene.js';
import { createRealisticCross } from './three/cross.js';
import { createParticles } from './three/particles.js';

const TYPING_SEGMENTS = [
  { text: 'Raised in ', cls: '' },
  { text: 'Faith', cls: 'accent' },
  { text: ', United in ', cls: '' },
  { text: 'Love', cls: 'accent' },
];

function buildTypingHTML(globalPos) {
  let remaining = globalPos;
  let html = '';
  for (const seg of TYPING_SEGMENTS) {
    if (remaining <= 0) break;
    const take = Math.min(remaining, seg.text.length);
    const chars = seg.text.slice(0, take);
    html += seg.cls ? `<span class="${seg.cls}">${chars}</span>` : chars;
    remaining -= take;
  }
  return html;
}

function getTotalLength() {
  return TYPING_SEGMENTS.reduce((s, seg) => s + seg.text.length, 0);
}

function startTyping(el) {
  if (!el) return;
  const total = getTotalLength();
  let index = 0;
  let isDeleting = false;
  let pause = false;

  function tick() {
    if (pause) {
      pause = false;
      setTimeout(tick, 2000);
      return;
    }

    if (!isDeleting) {
      index++;
      el.innerHTML = buildTypingHTML(index);
      if (index >= total) {
        pause = true;
        isDeleting = true;
        setTimeout(tick, 3000);
        return;
      }
    } else {
      index--;
      el.innerHTML = buildTypingHTML(index);
      if (index <= 0) {
        isDeleting = false;
        setTimeout(tick, 500);
        return;
      }
    }

    const delay = isDeleting ? 30 : 50 + Math.random() * 70;
    setTimeout(tick, delay);
  }

  tick();
}

export function initHero() {
  const section = document.querySelector('[data-hero]');
  const canvasWrap = section?.querySelector('[data-hero-canvas]');
  const titleEl = section?.querySelector('[data-hero-title]');
  const subtitle = section?.querySelector('[data-hero-subtitle]');
  const actions = section?.querySelector('[data-hero-actions]');
  const badge = section?.querySelector('[data-hero-badge]');
  const indicator = section?.querySelector('[data-scroll-indicator]');

  if (!canvasWrap || !section) return;

  const { scene, camera, pointLight, dispose } = createScene(canvasWrap);

  const cross = createRealisticCross(scene);
  cross.group.position.set(3.0, 0.2, 0);
  cross.group.scale.setScalar(0.65);

  const particles = createParticles(scene, { count: 200, spread: 5 });
  particles.points.position.y = 0.2;

  camera.position.set(0, 0.15, 6.5);

  let mouseX = 0;
  let mouseY = 0;

  section.addEventListener('mousemove', e => {
    const rect = section.getBoundingClientRect();
    mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouseY = ((e.clientY - rect.top) / rect.height) * 2 - 1;
  });

  let scrollProgress = 0;
  if (window.lenis) {
    window.lenis.on('scroll', () => {
      const rect = section.getBoundingClientRect();
      scrollProgress = Math.min(Math.max(-rect.top / (rect.height + window.innerHeight), 0), 1);
    });
  }

  // Entrance animations
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

  tl.fromTo(
    badge,
    { y: 25, opacity: 0 },
    { y: 0, opacity: 1, duration: 1, delay: 0.1 }
  )
    .fromTo(
      titleEl,
      { opacity: 0 },
      { opacity: 1, duration: 0.8 },
      '-=0.5'
    )
    .fromTo(subtitle, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8 }, '-=0.6')
    .fromTo(actions, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8 }, '-=0.5')
    .fromTo(indicator, { opacity: 0 }, { opacity: 1, duration: 0.6 }, '-=0.3')
    .call(() => {
      startTyping(titleEl?.querySelector('.hero-typing'));
    });

  function animate() {
    const t = performance.now() / 1000;

    cross.update(scrollProgress, mouseX, mouseY);
    particles.update(mouseX, mouseY);

    const breathe = Math.sin(t * 0.5) * 0.1 + 0.9;
    pointLight.intensity = 1.0 * breathe;

    const px = Math.sin(t * 0.3) * 0.3;
    const py = Math.cos(t * 0.2) * 0.2 + 1.2;
    pointLight.position.set(px, py, 2);

    requestAnimationFrame(animate);
  }
  animate();

  return { dispose };
}
