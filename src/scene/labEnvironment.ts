import * as THREE from 'three';

export interface LabSceneObjects {
  group: THREE.Group;
  dnaHologram: THREE.Group;
  containmentBeam: THREE.Mesh;
  energyShield: THREE.Mesh;
}

export function createPhotorealisticLab(): LabSceneObjects {
  const labGroup = new THREE.Group();
  labGroup.name = 'PHOTOREALISTIC_VR_BIOMEDICAL_LAB';

  // 1. High-Tech Hexagonal Brushed Metal Floor
  const floorGeo = new THREE.CylinderGeometry(9, 9, 0.25, 48);
  const floorMat = new THREE.MeshPhysicalMaterial({
    color: 0x090e1f,
    roughness: 0.2,
    metalness: 0.88,
    clearcoat: 0.6,
    clearcoatRoughness: 0.1,
  });
  const floorMesh = new THREE.Mesh(floorGeo, floorMat);
  floorMesh.position.y = -0.125;
  floorMesh.receiveShadow = true;
  labGroup.add(floorMesh);

  // Concentric Emissive Energy Conduit Rings
  const ringRadii = [1.8, 3.2, 5.0, 7.2];
  const ringColors = [0x00f0ff, 0x0284c7, 0x4f46e5, 0x00d2ff];

  ringRadii.forEach((r, idx) => {
    const ringGeo = new THREE.RingGeometry(r, r + 0.05, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: ringColors[idx],
      side: THREE.DoubleSide,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.01 + idx * 0.002;
    labGroup.add(ring);
  });

  // 2. Central Molecular Hologram Emitter Pedestal
  const pedestalBaseGeo = new THREE.CylinderGeometry(1.4, 1.6, 0.45, 32);
  const pedestalMat = new THREE.MeshPhysicalMaterial({
    color: 0x111c30,
    metalness: 0.92,
    roughness: 0.18,
    clearcoat: 0.7,
  });
  const pedestal = new THREE.Mesh(pedestalBaseGeo, pedestalMat);
  pedestal.position.set(0, 0.225, 0);
  pedestal.receiveShadow = true;
  pedestal.castShadow = true;
  labGroup.add(pedestal);

  // Emitter Core Ring with cyan neon glow
  const coreEmitter = new THREE.Mesh(
    new THREE.TorusGeometry(1.1, 0.05, 16, 64),
    new THREE.MeshBasicMaterial({ color: 0x00f7ff })
  );
  coreEmitter.rotation.x = Math.PI / 2;
  coreEmitter.position.set(0, 0.46, 0);
  labGroup.add(coreEmitter);

  // Hexagonal Glass Shield Containment
  const shieldGeo = new THREE.CylinderGeometry(1.2, 1.2, 2.8, 6, 1, true);
  const shieldMat = new THREE.MeshPhysicalMaterial({
    color: 0x00f0ff,
    transmission: 0.9,
    opacity: 0.35,
    transparent: true,
    roughness: 0.08,
    metalness: 0.1,
    ior: 1.45,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const energyShield = new THREE.Mesh(shieldGeo, shieldMat);
  energyShield.position.set(0, 1.85, 0);
  labGroup.add(energyShield);

  // Volumetric Containment Beam Cylinder
  const beamGeo = new THREE.CylinderGeometry(1.1, 1.1, 2.75, 32, 1, true);
  const beamMat = new THREE.MeshBasicMaterial({
    color: 0x00e1ff,
    transparent: true,
    opacity: 0.14,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const containmentBeam = new THREE.Mesh(beamGeo, beamMat);
  containmentBeam.position.set(0, 1.85, 0);
  labGroup.add(containmentBeam);

  // 3. Holographic DNA Double Helix Rotating inside Emitter
  const dnaHologram = new THREE.Group();
  dnaHologram.position.set(0, 1.85, 0);

  const numBasePairs = 24;
  const dnaRadius = 0.45;
  const dnaHeight = 2.2;

  const strandMat1 = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
  const strandMat2 = new THREE.MeshBasicMaterial({ color: 0xa855f7 });
  const basePairMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

  for (let b = 0; b < numBasePairs; b++) {
    const t = b / numBasePairs;
    const y = (t - 0.5) * dnaHeight;
    const angle = t * Math.PI * 4;

    const x1 = Math.cos(angle) * dnaRadius;
    const z1 = Math.sin(angle) * dnaRadius;
    const x2 = -x1;
    const z2 = -z1;

    // Strand 1 node
    const n1 = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 8), strandMat1);
    n1.position.set(x1, y, z1);
    dnaHologram.add(n1);

    // Strand 2 node
    const n2 = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 8), strandMat2);
    n2.position.set(x2, y, z2);
    dnaHologram.add(n2);

    // Hydrogen Base Pair rung connecting strand 1 & 2
    const rungGeo = new THREE.CylinderGeometry(0.012, 0.012, dnaRadius * 2, 6);
    const rung = new THREE.Mesh(rungGeo, basePairMat);
    rung.position.set(0, y, 0);
    rung.rotation.z = Math.PI / 2;
    rung.rotation.y = angle;
    dnaHologram.add(rung);
  }
  labGroup.add(dnaHologram);

  // 4. Lab Equipment Columns with Holographic Diagnostic Displays
  for (let c = 0; c < 6; c++) {
    const angle = (c / 6) * Math.PI * 2;
    const colGroup = new THREE.Group();
    colGroup.position.set(Math.cos(angle) * 7.2, 0, Math.sin(angle) * 7.2);
    colGroup.rotation.y = -angle - Math.PI / 2;

    // Structural Carbon-Steel Pillar
    const pillarGeo = new THREE.CylinderGeometry(0.4, 0.5, 5.5, 16);
    const pillarMat = new THREE.MeshPhysicalMaterial({
      color: 0x0f172a,
      metalness: 0.85,
      roughness: 0.25,
      clearcoat: 0.5,
    });
    const pillar = new THREE.Mesh(pillarGeo, pillarMat);
    pillar.position.y = 2.75;
    colGroup.add(pillar);

    // Vertical Blue Laser Guide Strip
    const strip = new THREE.Mesh(
      new THREE.BoxGeometry(0.06, 4.8, 0.06),
      new THREE.MeshBasicMaterial({ color: 0x00f0ff })
    );
    strip.position.set(0, 2.75, 0.42);
    colGroup.add(strip);

    // Diagnostic Holographic Screen on column
    const screenGeo = new THREE.PlaneGeometry(0.8, 1.2);
    const screenMat = new THREE.MeshBasicMaterial({
      color: 0x0284c7,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide,
    });
    const screen = new THREE.Mesh(screenGeo, screenMat);
    screen.position.set(0, 2.4, 0.65);
    colGroup.add(screen);

    labGroup.add(colGroup);
  }

  return {
    group: labGroup,
    dnaHologram,
    containmentBeam,
    energyShield,
  };
}
