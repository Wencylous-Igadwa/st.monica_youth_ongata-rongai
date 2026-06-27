import * as THREE from 'three';

export function createParticles(scene, { count = 300, spread = 4 } = {}) {
  const positions = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const speeds = [];
  const phases = [];

  for (let i = 0; i < count; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = spread * Math.cbrt(Math.random());

    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.cos(phi) * 0.6;
    positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);

    sizes[i] = 0.015 + Math.random() * 0.03;
    speeds.push(0.1 + Math.random() * 0.3);
    phases.push(Math.random() * Math.PI * 2);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
  gradient.addColorStop(0, 'rgba(255,255,255,1)');
  gradient.addColorStop(0.2, 'rgba(255,240,200,0.8)');
  gradient.addColorStop(1, 'rgba(255,240,200,0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 32, 32);
  const texture = new THREE.CanvasTexture(canvas);

  const material = new THREE.PointsMaterial({
    size: 0.04,
    map: texture,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    transparent: true,
    opacity: 0.5,
    color: 0xd4a84b,
    sizeAttenuation: true,
  });

  const points = new THREE.Points(geometry, material);
  scene.add(points);

  const clock = new THREE.Clock();

  return {
    points,
    update(mouseX = 0, mouseY = 0) {
      const t = clock.getElapsedTime();
      const pos = points.geometry.attributes.position.array;

      for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        const drift = Math.sin(t * speeds[i] + phases[i]) * 0.02;
        pos[i3] += drift * 0.5;
        pos[i3 + 1] += Math.sin(t * speeds[i] * 0.5 + phases[i]) * 0.008;
        pos[i3 + 2] += Math.cos(t * speeds[i] * 0.3 + phases[i]) * 0.008;
      }

      points.geometry.attributes.position.needsUpdate = true;
      points.rotation.y += 0.0003;
      points.position.y = mouseY * 0.1;
      points.position.x = mouseX * 0.1;
    },
    dispose() {
      scene.remove(points);
      geometry.dispose();
      material.dispose();
    },
  };
}
