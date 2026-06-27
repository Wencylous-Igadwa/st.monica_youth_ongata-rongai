import * as THREE from 'three';

function bronzeMat({ color = 0xcd9a3f, roughness = 0.3, metalness = 0.8, emissive = 0x000000, emissiveIntensity = 0, clearcoat = 0, ...rest } = {}) {
  return new THREE.MeshPhysicalMaterial({
    color,
    roughness,
    metalness,
    emissive,
    emissiveIntensity,
    clearcoat,
    clearcoatRoughness: 0.3,
    envMapIntensity: 1.2,
    ...rest,
  });
}

function darkBronze() {
  return bronzeMat({ color: 0x6b4a2a, roughness: 0.5, metalness: 0.7 });
}

function brightBronze() {
  return bronzeMat({ color: 0xe8c46a, roughness: 0.2, metalness: 0.9, clearcoat: 0.3 });
}

function agedBronze() {
  return bronzeMat({ color: 0x8a6b3e, roughness: 0.6, metalness: 0.6 });
}

function patinaBronze() {
  return bronzeMat({ color: 0x5a7a5a, roughness: 0.7, metalness: 0.4 });
}

function createFloralMedallion(radius, depth) {
  const group = new THREE.Group();

  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(radius, radius, depth, 32),
    darkBronze()
  );
  base.position.z = -depth / 2;
  group.add(base);

  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const petal = new THREE.Mesh(
      new THREE.SphereGeometry(radius * 0.35, 8, 8),
      brightBronze()
    );
    petal.position.set(
      Math.cos(angle) * radius * 0.55,
      Math.sin(angle) * radius * 0.55,
      depth * 0.2
    );
    petal.scale.set(1, 1, 0.3);
    group.add(petal);
  }

  const center = new THREE.Mesh(
    new THREE.SphereGeometry(radius * 0.25, 12, 12),
    brightBronze()
  );
  center.position.z = depth * 0.1;
  center.scale.set(1, 1, 0.4);
  group.add(center);

  return group;
}

function createSunburstHalo(outerRadius, rayCount) {
  const group = new THREE.Group();

  const ringMat = bronzeMat({ color: 0xc8963e, roughness: 0.25, metalness: 0.85, emissive: 0xc8963e, emissiveIntensity: 0.1, transparent: true, opacity: 0.6, side: THREE.DoubleSide });

  const innerRing = new THREE.Mesh(
    new THREE.TorusGeometry(outerRadius * 0.3, 0.025, 8, 48),
    ringMat
  );
  innerRing.rotation.x = Math.PI / 2;
  group.add(innerRing);

  const midRing = new THREE.Mesh(
    new THREE.TorusGeometry(outerRadius * 0.6, 0.02, 8, 48),
    bronzeMat({ color: 0xc8963e, roughness: 0.3, metalness: 0.7, transparent: true, opacity: 0.4, side: THREE.DoubleSide })
  );
  midRing.rotation.x = Math.PI / 2;
  group.add(midRing);

  const outerRing = new THREE.Mesh(
    new THREE.TorusGeometry(outerRadius * 0.9, 0.015, 8, 48),
    bronzeMat({ color: 0xc8963e, roughness: 0.3, metalness: 0.7, transparent: true, opacity: 0.25, side: THREE.DoubleSide })
  );
  outerRing.rotation.x = Math.PI / 2;
  group.add(outerRing);

  const rayMat = bronzeMat({ color: 0xc8963e, roughness: 0.3, metalness: 0.8, emissive: 0xc8963e, emissiveIntensity: 0.08, transparent: true, opacity: 0.5, side: THREE.DoubleSide });

  for (let i = 0; i < rayCount; i++) {
    const angle = (i / rayCount) * Math.PI * 2;
    const len = outerRadius * (0.7 + Math.random() * 0.3);
    const ray = new THREE.Mesh(
      new THREE.ConeGeometry(0.015, len, 4),
      rayMat
    );
    ray.position.set(
      Math.cos(angle) * (outerRadius * 0.3 + len * 0.4),
      Math.sin(angle) * (outerRadius * 0.3 + len * 0.4),
      0
    );
    ray.rotation.z = angle - Math.PI / 2;
    group.add(ray);
  }

  return group;
}

function createMedallion(radius, depth) {
  const group = new THREE.Group();

  const disc = new THREE.Mesh(
    new THREE.CylinderGeometry(radius, radius, depth, 32),
    bronzeMat({ color: 0x8a6b3e, roughness: 0.4, metalness: 0.7 })
  );
  disc.position.z = -depth / 2;
  group.add(disc);

  const border = new THREE.Mesh(
    new THREE.TorusGeometry(radius, depth * 0.6, 12, 32),
    brightBronze()
  );
  border.position.z = depth * 0.1;
  group.add(border);

  const innerRing = new THREE.Mesh(
    new THREE.TorusGeometry(radius * 0.7, depth * 0.3, 8, 24),
    bronzeMat({ color: 0x6b4a2a, roughness: 0.5, metalness: 0.6 })
  );
  innerRing.position.z = depth * 0.15;
  group.add(innerRing);

  const crossCenter = new THREE.Group();
  const barW = radius * 0.15;
  const barH = radius * 0.5;
  const hBar = new THREE.Mesh(new THREE.BoxGeometry(barH, barW, depth * 0.4), brightBronze());
  const vBar = new THREE.Mesh(new THREE.BoxGeometry(barW, barH, depth * 0.4), brightBronze());
  crossCenter.add(hBar);
  crossCenter.add(vBar);
  crossCenter.position.z = depth * 0.2;
  group.add(crossCenter);

  for (let i = 0; i < 4; i++) {
    const dot = new THREE.Mesh(
      new THREE.SphereGeometry(radius * 0.08, 6, 6),
      brightBronze()
    );
    dot.scale.set(1, 1, 0.3);
    const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
    dot.position.set(Math.cos(a) * radius * 0.35, Math.sin(a) * radius * 0.35, depth * 0.25);
    group.add(dot);
  }

  return group;
}

function createINRIPlaque() {
  const group = new THREE.Group();
  const plaqueMat = bronzeMat({ color: 0xf5efe6, roughness: 0.5, metalness: 0.1 });
  const trimMat = brightBronze();

  const plaque = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.32, 0.025), plaqueMat);
  plaque.position.z = 0;
  group.add(plaque);

  const trim = new THREE.Mesh(new THREE.BoxGeometry(0.89, 0.005, 0.035), trimMat);
  trim.position.z = 0.02;
  group.add(trim);

  const trimB = new THREE.Mesh(new THREE.BoxGeometry(0.89, 0.005, 0.035), trimMat);
  trimB.position.set(0, -0.16, 0.02);
  group.add(trimB);

  const trimL = new THREE.Mesh(new THREE.BoxGeometry(0.005, 0.32, 0.035), trimMat);
  trimL.position.set(-0.425, 0, 0.02);
  group.add(trimL);

  const trimR = new THREE.Mesh(new THREE.BoxGeometry(0.005, 0.32, 0.035), trimMat);
  trimR.position.set(0.425, 0, 0.02);
  group.add(trimR);

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 220;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#1a1000';
  ctx.font = 'bold 180px serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('INRI', canvas.width / 2, canvas.height / 2 + 4);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;

  const textMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(0.72, 0.26),
    new THREE.MeshBasicMaterial({
      map: tex,
      transparent: false,
      depthWrite: true,
    })
  );
  textMesh.position.set(0, 0.01, 0.024);
  group.add(textMesh);

  const crownBase = new THREE.Mesh(
    new THREE.TorusGeometry(0.12, 0.025, 6, 12),
    brightBronze()
  );
  crownBase.position.set(0, 0.18, 0.015);
  crownBase.scale.set(1, 1, 0.6);
  group.add(crownBase);

  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI - Math.PI / 2;
    const tip = new THREE.Mesh(
      new THREE.ConeGeometry(0.015, 0.05, 4),
      brightBronze()
    );
    tip.position.set(Math.sin(a) * 0.11, 0.18 + Math.cos(a) * 0.06, 0.02);
    group.add(tip);
  }

  return group;
}

export function createRealisticCross(scene) {
  const group = new THREE.Group();

  const uprightMat = bronzeMat({ color: 0x7a5a3a, roughness: 0.5, metalness: 0.6 });

  const uprightGeom = new THREE.BoxGeometry(0.22, 3.4, 0.15);
  const upright = new THREE.Mesh(uprightGeom, uprightMat);
  upright.position.y = 0.2;
  group.add(upright);

  const uprightFront = new THREE.Mesh(new THREE.BoxGeometry(0.18, 3.3, 0.02), brightBronze());
  uprightFront.position.set(0, 0.2, 0.085);
  group.add(uprightFront);

  const crossbarMat = bronzeMat({ color: 0x7a5a3a, roughness: 0.5, metalness: 0.6 });
  const crossbar = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.22, 0.15), crossbarMat);
  crossbar.position.set(0, 1.2, 0);
  group.add(crossbar);

  const crossbarFront = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.18, 0.02), brightBronze());
  crossbarFront.position.set(0, 1.2, 0.085);
  group.add(crossbarFront);

  const cornerMat = bronzeMat({ color: 0x8a6b3e, roughness: 0.3, metalness: 0.7 });

  const corners = [
    [-0.14, 1.06], [0.14, 1.06],
    [-0.14, 1.34], [0.14, 1.34],
  ];
  corners.forEach(([x, y]) => {
    const c = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 0.04), cornerMat);
    c.position.set(x, y, 0.09);
    group.add(c);
  });

  const topMedallion = createFloralMedallion(0.18, 0.04);
  topMedallion.position.set(0, 1.9, 0.06);
  group.add(topMedallion);

  const bottomMedallion = createFloralMedallion(0.18, 0.04);
  bottomMedallion.position.set(0, -1.5, 0.06);
  group.add(bottomMedallion);

  const leftMedallion = createFloralMedallion(0.18, 0.04);
  leftMedallion.position.set(-1.3, 1.2, 0.06);
  leftMedallion.rotation.z = Math.PI / 2;
  group.add(leftMedallion);

  const rightMedallion = createFloralMedallion(0.18, 0.04);
  rightMedallion.position.set(1.3, 1.2, 0.06);
  rightMedallion.rotation.z = Math.PI / 2;
  group.add(rightMedallion);

  const haloGroup = createSunburstHalo(1.1, 24);
  haloGroup.position.set(0, 1.2, -0.15);
  group.add(haloGroup);

  const centerMedallion = createMedallion(0.22, 0.04);
  centerMedallion.position.set(0, 1.2, 0.08);
  group.add(centerMedallion);

  const inriGroup = createINRIPlaque();
  inriGroup.position.set(0, 1.2, 0.12);
  inriGroup.scale.setScalar(1.0);
  group.add(inriGroup);

  const baseMat = bronzeMat({ color: 0x5a3a2a, roughness: 0.7, metalness: 0.4 });
  const base = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.06, 0.2), baseMat);
  base.position.set(0, -1.65, 0);
  group.add(base);

  const baseTrim = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.015, 0.23), brightBronze());
  baseTrim.position.set(0, -1.62, 0);
  group.add(baseTrim);

  const shadowMat = new THREE.MeshBasicMaterial({
    color: 0x000000,
    transparent: true,
    opacity: 0.08,
    depthWrite: false,
  });
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.3), shadowMat);
  shadow.position.set(0, -1.85, 0.15);
  shadow.rotation.x = -Math.PI / 2;
  group.add(shadow);

  group.scale.setScalar(0.7);
  scene.add(group);

  const clock = new THREE.Clock();

  return {
    group,
    update(scrollProgress = 0, mouseX = 0, mouseY = 0) {
      const t = clock.getElapsedTime();

      const autoRotate = t * 0.3;
      const targetRotY = autoRotate + scrollProgress * Math.PI * 0.8 + mouseX * 0.15;
      const targetRotX = mouseY * 0.1;
      group.rotation.y += (targetRotY - group.rotation.y) * 0.03;
      group.rotation.x += (targetRotX - group.rotation.x) * 0.03;

      const pulse = Math.sin(t * 0.8) * 0.15 + 0.85;

      const floatY = Math.sin(t * 0.4) * 0.03;
      group.position.y = floatY;

      if (haloGroup.children.length > 0) {
        haloGroup.children.forEach(child => {
          if (child.material) {
            const baseOpacity = child.material.userData?.baseOpacity ?? child.material.opacity;
            if (!child.material.userData) child.material.userData = {};
            if (!child.material.userData.baseOpacity) child.material.userData.baseOpacity = child.material.opacity;
            child.material.opacity = child.material.userData.baseOpacity * (0.7 + Math.sin(t * 1.2 + child.id) * 0.3);
          }
        });
      }
    },
  };
}
