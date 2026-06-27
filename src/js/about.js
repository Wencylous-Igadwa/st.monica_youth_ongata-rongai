import { gsap, ScrollTrigger } from './gsap.js';

export function initAbout() {
  const section = document.querySelector('[data-about]');
  if (!section) return;

  const stats = section.querySelectorAll('[data-about-stat]');
  const statNumbers = section.querySelectorAll('[data-count]');
  const content = section.querySelector('[data-about-content]');
  const visual = section.querySelector('[data-about-visual]');

  gsap.fromTo(
    content,
    { y: 50, opacity: 0 },
    {
      y: 0,
      opacity: 1,
      duration: 1.2,
      ease: 'power3.out',
      scrollTrigger: { trigger: content, start: 'top 80%' },
    }
  );

  gsap.fromTo(
    visual,
    { opacity: 0, scale: 0.9 },
    {
      opacity: 1,
      scale: 1,
      duration: 1.2,
      ease: 'power3.out',
      scrollTrigger: { trigger: visual, start: 'top 85%' },
    }
  );

  gsap.fromTo(
    stats,
    { y: 30, opacity: 0 },
    {
      y: 0,
      opacity: 1,
      duration: 0.7,
      stagger: 0.12,
      ease: 'power3.out',
      scrollTrigger: { trigger: stats[0], start: 'top 85%' },
    }
  );

  statNumbers.forEach(el => {
    const target = parseInt(el.getAttribute('data-count'));
    gsap.from(el, {
      textContent: 0,
      duration: 2,
      ease: 'power2.out',
      snap: { textContent: 1 },
      scrollTrigger: { trigger: el, start: 'top 85%' },
    });
  });
}
