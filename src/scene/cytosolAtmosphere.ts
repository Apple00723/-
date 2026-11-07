import * as THREE from 'three';

export interface CytosolAtmosphere {
  group: THREE.Group;
  fluidDome: THREE.Mesh;
  trabecularMesh: THREE.Group;
  vesicles: THREE.InstancedMesh;
  update: (elapsedTime: number, delta: number) => void;
}

export function createCytosolAtmosphere(): CytosolAtmosphere {
  const group = new THREE.Group();
  group.name = 'COLLOIDAL_CYTOSOL_ATMOSPHERE';

  // 1. Inverted Colloidal Fluid Sky Dome with Translucent Deep Purple/Blue Gradient
  const domeGeo = new THREE.SphereGeometry(45, 32, 24);
  domeGeo.scale(-1, 1, 1); // Invert faces to view from inside

  // Dynamic Fluid Gradient & Caustics Shader
  const fluidShaderMat = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uColorTop: { value: new THREE.Color(0x230e42) },     // Deep Cellular Violet
      uColorMid: { value: new THREE.Color(0x0a1438) },     // Bioluminescent Deep Indigo
      uColorBottom: { value: new THREE.Color(0x18072b) },  // Dark Cytoplasmic Magenta
      uCausticColor: { value: new THREE.Color(0x38bdf8) }, // Cyan Fluid Caustic Highlights
    },
    vertexShader: `
      varying vec3 vWorldPosition;
      varying vec2 vUv;
      void main() {
        vUv = uv;
        vec4 worldPos = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPos.xyz;
        gl_Position = projectionMatrix * viewMatrix * worldPos;
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform vec3 uColorTop;
      uniform vec3 uColorMid;
      uniform vec3 uColorBottom;
      uniform vec3 uCausticColor;
      varying vec3 vWorldPosition;
      varying vec2 vUv;

      void main() {
        // Vertical gradient
        float h = normalize(vWorldPosition).y;
        vec3 baseColor = mix(uColorBottom, uColorMid, smoothstep(-0.8, 0.1, h));
        baseColor = mix(baseColor, uColorTop, smoothstep(0.1, 0.9, h));

        // High-performance fast analytical caustic wave streams (zero nested loops, 60+ FPS)
        vec2 p = vUv * 10.0;
        float w1 = sin(p.x * 1.8 + uTime * 0.35) * cos(p.y * 1.8 + uTime * 0.28);
        float w2 = sin(p.x * 3.2 - uTime * 0.25 + w1) * cos(p.y * 3.2 + uTime * 0.3);
        float caustic = max(0.0, (w1 + w2) * 0.5) * 0.14;

        vec3 finalColor = baseColor + uCausticColor * caustic;
        gl_FragColor = vec4(finalColor, 1.0);
      }
    `,
    side: THREE.BackSide,
    depthWrite: false,
  });

  const fluidDome = new THREE.Mesh(domeGeo, fluidShaderMat);
  group.add(fluidDome);

  // 2. Microtrabecular Lattice Network (微梁网架流动光纤)
  const trabecularMesh = new THREE.Group();
  trabecularMesh.name = 'TRABECULAR_CYTOSKELETON_LATTICE';

  const latticeMat = new THREE.MeshBasicMaterial({
    color: 0x6366f1,
    transparent: true,
    opacity: 0.35,
    blending: THREE.AdditiveBlending,
  });

  const numFibres = 28;
  const fibreCurves: THREE.CatmullRomCurve3[] = [];

  for (let i = 0; i < numFibres; i++) {
    const angle1 = (i / numFibres) * Math.PI * 2;
    const angle2 = angle1 + (Math.random() - 0.5) * 1.2;
    const r1 = 6 + Math.random() * 8;
    const r2 = 7 + Math.random() * 8;

    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(Math.cos(angle1) * r1, (Math.random() - 0.5) * 10 - 2, Math.sin(angle1) * r1),
      new THREE.Vector3(Math.cos((angle1 + angle2) / 2) * (r1 * 0.7), (Math.random() - 0.5) * 6 + 1, Math.sin((angle1 + angle2) / 2) * (r1 * 0.7)),
      new THREE.Vector3(Math.cos(angle2) * r2, (Math.random() - 0.5) * 10 + 2, Math.sin(angle2) * r2),
    ]);
    fibreCurves.push(curve);

    const tubeGeo = new THREE.TubeGeometry(curve, 24, 0.035, 6, false);
    const tubeMesh = new THREE.Mesh(tubeGeo, latticeMat);
    trabecularMesh.add(tubeMesh);
  }
  group.add(trabecularMesh);

  // 3. Brownian Colloidal Micro-Vesicles / Micelles (胶体微粒与代谢小囊泡)
  const numVesicles = 120;
  const vesicleGeo = new THREE.SphereGeometry(1, 10, 10);
  const vesicleMat = new THREE.MeshStandardMaterial({
    color: 0x818cf8,
    roughness: 0.25,
    metalness: 0.2,
    opacity: 0.5,
    transparent: true,
  });
  const vesicles = new THREE.InstancedMesh(vesicleGeo, vesicleMat, numVesicles);

  const vesiclePositions: THREE.Vector3[] = [];
  const vesicleVelocities: THREE.Vector3[] = [];
  const dummy = new THREE.Object3D();

  for (let v = 0; v < numVesicles; v++) {
    const pos = new THREE.Vector3(
      (Math.random() - 0.5) * 22,
      (Math.random() - 0.5) * 14 + 1.2,
      (Math.random() - 0.5) * 20
    );
    vesiclePositions.push(pos);
    vesicleVelocities.push(
      new THREE.Vector3(
        (Math.random() - 0.5) * 0.08,
        (Math.random() - 0.5) * 0.05,
        (Math.random() - 0.5) * 0.08
      )
    );

    dummy.position.copy(pos);
    dummy.scale.setScalar(0.08 + Math.random() * 0.14);
    dummy.updateMatrix();
    vesicles.setMatrixAt(v, dummy.matrix);
  }
  vesicles.instanceMatrix.needsUpdate = true;
  group.add(vesicles);

  // Animation Update function
  const update = (elapsedTime: number, delta: number) => {
    fluidShaderMat.uniforms.uTime.value = elapsedTime;

    // Slowly pulse trabecular lattice
    latticeMat.opacity = 0.25 + Math.sin(elapsedTime * 0.8) * 0.12;

    // Brownian motion simulation for vesicles
    for (let v = 0; v < numVesicles; v++) {
      const pos = vesiclePositions[v];
      const vel = vesicleVelocities[v];

      // Subtle Brownian jitter
      pos.x += vel.x * delta + Math.sin(elapsedTime * 1.5 + v) * 0.003;
      pos.y += vel.y * delta + Math.cos(elapsedTime * 1.2 + v) * 0.003;
      pos.z += vel.z * delta + Math.sin(elapsedTime * 1.1 + v * 2) * 0.003;

      // Boundary loop
      if (pos.x > 12) pos.x = -12;
      if (pos.x < -12) pos.x = 12;
      if (pos.y > 8) pos.y = -6;
      if (pos.y < -6) pos.y = 8;
      if (pos.z > 12) pos.z = -12;
      if (pos.z < -12) pos.z = 12;

      dummy.position.copy(pos);
      dummy.scale.setScalar(0.08 + (v % 5) * 0.02);
      dummy.updateMatrix();
      vesicles.setMatrixAt(v, dummy.matrix);
    }
    vesicles.instanceMatrix.needsUpdate = true;
  };

  return {
    group,
    fluidDome,
    trabecularMesh,
    vesicles,
    update,
  };
}
