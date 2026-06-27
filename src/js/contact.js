import { gsap, ScrollTrigger } from './gsap.js';

export function initContact() {
  const map = document.querySelector('[data-contact-map]');
  const info = document.querySelector('[data-contact-info]');

  if (info) {
    gsap.fromTo(info.querySelectorAll('.contact-item'), { y: 30, opacity: 0 }, {
      y: 0, opacity: 1, duration: 0.7, stagger: 0.1, ease: 'power3.out',
      scrollTrigger: { trigger: info, start: 'top 80%' }
    });
  }

  if (map) {
    gsap.fromTo(map, { y: 20, opacity: 0 }, {
      y: 0, opacity: 1, duration: 0.6, ease: 'power3.out',
      scrollTrigger: { trigger: map, start: 'top 80%' }
    });
  }
}
