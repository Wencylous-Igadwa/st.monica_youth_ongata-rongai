import { gsap, ScrollTrigger } from './gsap.js';

export function initTestimonials() {
  const icons = document.querySelectorAll('[data-testimonial-icon]');
  const stage = document.querySelector('[data-testimonials-stage]');

  if (!icons.length) return;

  let current = -1;

  const anchorIdx = 4;

  icons.forEach((icon, i) => {
    const targetTop = parseFloat(icon.dataset.targetTop);
    const targetLeft = parseFloat(icon.dataset.targetLeft);
    const anchorTop = parseFloat(icons[anchorIdx].dataset.targetTop);
    const anchorLeft = parseFloat(icons[anchorIdx].dataset.targetLeft);

    icon.style.top = anchorTop + '%';
    icon.style.left = anchorLeft + '%';

    const popup = icon.querySelector('.testimonial-popup');
    if (popup) {
      if (icon.dataset.popupDir === 'left') popup.setAttribute('data-popup', 'left');
      else popup.removeAttribute('data-popup');
    }

    const burstAngle = (Math.random() - 0.5) * 25;

    gsap.set(icon, {
      xPercent: -50,
      yPercent: -50,
      scale: 0,
      opacity: 0,
      rotation: 0,
      x: 0,
      y: 0,
    });

    const tl = gsap.timeline({ paused: true });

    if (i === anchorIdx) {
      tl.to(icon, {
        scale: 1,
        opacity: 1,
        duration: 0.8,
        ease: 'power2.out',
      }, 0);
      tl.to(icon, {
        top: targetTop + '%',
        left: targetLeft + '%',
        duration: 0.5,
        ease: 'power1.out',
      }, 0.3);
    } else {
      tl.to(icon, {
        scale: 1,
        opacity: 1,
        duration: 0.4,
        ease: 'power2.out',
      }, 0);
      tl.to(icon, {
        top: targetTop + '%',
        left: targetLeft + '%',
        scale: 1.05,
        rotation: burstAngle,
        duration: 20,
        ease: 'sine.out',
      }, 0.3);
      tl.to(icon, {
        scale: 1,
        rotation: 0,
        duration: 2,
        ease: 'sine.out',
      }, 19);
    }

    icon._anim = tl;

    const angles = [-35, -20, 0, 20, 35, 50, -50];
    const angleDeg = angles[i % angles.length];
    const rad = angleDeg * Math.PI / 180;
    const dist = 40 + Math.random() * 60;
    const floatOffsets = [
      { x: Math.cos(rad) * dist * 0.6, y: Math.sin(rad) * dist * 0.6 },
      { x: Math.cos(rad + 0.8) * dist, y: Math.sin(rad + 0.8) * dist },
      { x: Math.cos(rad + 2) * dist * 0.4, y: Math.sin(rad + 2) * dist * 0.4 },
      { x: Math.cos(rad + 3.5) * dist * 0.7, y: Math.sin(rad + 3.5) * dist * 0.7 },
    ];

    const floatDuration = 5 + Math.random() * 4;
    const floatKeyframes = floatOffsets.map(o => ({
      x: o.x, y: o.y,
      duration: floatDuration * (0.2 + Math.random() * 0.15),
      ease: 'sine.inOut',
    }));
    floatKeyframes.push({ x: 0, y: 0, duration: floatDuration * 0.25, ease: 'sine.inOut' });

    icon._floatTween = gsap.to(icon, {
      keyframes: floatKeyframes,
      repeat: -1,
      paused: true,
    });
  });

  ScrollTrigger.create({
    trigger: stage,
    start: 'top 95%',
    end: 'top 5%',
    onUpdate: (self) => {
      const p = self.progress;
      icons.forEach((icon, i) => {
        if (!icon._anim) return;
        let t = p;
        if (i !== anchorIdx) {
          const order = i < anchorIdx ? i : i - 1;
          const delay = 0.08 * order;
          t = Math.max(0, Math.min((p - delay) / (1 - delay), 1));
        }
        icon._anim.progress(t);
      });
      if (p > 0) {
        icons.forEach(icon => {
          if (icon._floatTween && icon._floatTween.paused()) icon._floatTween.play();
        });
      } else {
        icons.forEach(icon => {
          if (icon._floatTween && !icon._floatTween.paused()) {
            icon._floatTween.pause(0);
            icon._floatTween.progress(0);
          }
        });
      }
    },
    onLeave: () => {
      icons.forEach(icon => {
        if (icon._anim) icon._anim.progress(1);
        if (icon._floatTween && icon._floatTween.paused()) icon._floatTween.play();
      });
    },
    onEnterBack: () => {
      icons.forEach(icon => {
        if (icon._anim) icon._anim.progress(0);
        if (icon._floatTween) {
          icon._floatTween.pause(0);
          icon._floatTween.progress(0);
        }
      });
    },
  });

  icons.forEach((icon, i) => {
    icon.addEventListener('click', () => {
      if (current === i) {
        icon.classList.remove('is-active');
        current = -1;
        return;
      }
      icons.forEach(el => el.classList.remove('is-active'));
      icon.classList.add('is-active');
      current = i;
    });
  });
}
