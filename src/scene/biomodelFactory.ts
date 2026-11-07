import * as THREE from 'three';

// CPK Coloring Standard for Photorealistic Molecular Graphics
export const CPK_COLORS = {
  carbon: 0x334155,       // Slate Charcoal Gray
  carbonSubstrate: 0xfacc15,// Bright Golden Yellow for substrate
  carbonDrug: 0xdc2626,   // Bright Crimson Red for competitive drug
  hydrogen: 0xf8fafc,     // Pearl White
  nitrogen: 0x2563eb,     // Royal Blue
  oxygen: 0xef4444,       // Crimson Red
  phosphorus: 0xf59e0b,   // Amber Gold
  sulfur: 0xeab308,       // Golden Yellow
  fluorine: 0x10b981,     // Emerald Mint
  cofactorMg: 0x8b5cf6,   // Purple Magnesium/Zinc ion
  bond: 0x64748b,         // Metallic Steel Bond
};

// High-end PBR materials cache to reuse geometries & prevent memory overhead
const sphereGeoLOD = new THREE.SphereGeometry(1, 16, 16);
const bondGeoLOD = new THREE.CylinderGeometry(1, 1, 1, 12);

export function createFresnelBiomaterial(options: {
  color: number;
  fresnelColor?: number;
  fresnelPower?: number;
  fresnelIntensity?: number;
  roughness?: number;
  metalness?: number;
  transmission?: number;
  clearcoat?: number;
  emissive?: number;
  emissiveIntensity?: number;
}): THREE.MeshPhysicalMaterial {
  const {
    color,
    fresnelColor = 0x38bdf8,
    fresnelPower = 2.4,
    fresnelIntensity = 0.9,
    roughness = 0.18,
    metalness = 0.12,
    transmission = 0.32, // Crystal hydrated translucency
    clearcoat = 0.95,
    emissive = 0x000000,
    emissiveIntensity = 0.0,
  } = options;

  const mat = new THREE.MeshPhysicalMaterial({
    color,
    roughness,
    metalness,
    transmission,
    thickness: 1.4,
    clearcoat,
    clearcoatRoughness: 0.1,
    sheen: 1.0,
    sheenColor: new THREE.Color(fresnelColor),
    sheenRoughness: 0.25,
    emissive,
    emissiveIntensity,
    ior: 1.54,
  });

  const uFresnelColor = new THREE.Color(fresnelColor);

  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uFresnelColor = { value: uFresnelColor };
    shader.uniforms.uFresnelPower = { value: fresnelPower };
    shader.uniforms.uFresnelIntensity = { value: fresnelIntensity };

    shader.vertexShader = `
      varying vec3 vWorldNormalBio;
      varying vec3 vWorldPositionBio;
      ${shader.vertexShader}
    `;

    shader.vertexShader = shader.vertexShader.replace(
      '#include <worldpos_vertex>',
      `
      #include <worldpos_vertex>
      vWorldNormalBio = normalize(mat3(modelMatrix) * normal);
      vWorldPositionBio = (modelMatrix * vec4(transformed, 1.0)).xyz;
      `
    );

    shader.fragmentShader = `
      uniform vec3 uFresnelColor;
      uniform float uFresnelPower;
      uniform float uFresnelIntensity;
      varying vec3 vWorldNormalBio;
      varying vec3 vWorldPositionBio;
      ${shader.fragmentShader}
    `;

    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <dithering_fragment>',
      `
      #include <dithering_fragment>
      vec3 viewDirBio = normalize(cameraPosition - vWorldPositionBio);
      float fresnelFactor = pow(1.0 - max(0.0, dot(normalize(vWorldNormalBio), viewDirBio)), uFresnelPower);
      gl_FragColor.rgb += uFresnelColor * fresnelFactor * uFresnelIntensity;
      `
    );
  };

  return mat;
}

function createPBRMaterial(color: number, roughness = 0.2, metalness = 0.2, emissive = 0x000000, emissiveIntensity = 0.0, fresnelColor = 0x38bdf8) {
  return createFresnelBiomaterial({
    color,
    roughness,
    metalness,
    emissive,
    emissiveIntensity,
    fresnelColor,
  });
}

// Atom Builder Helper with Fresnel Glow
export function createAtom(
  type: keyof typeof CPK_COLORS,
  radius: number,
  position: [number, number, number],
  emissiveIntensity = 0.15
): THREE.Mesh {
  const color = CPK_COLORS[type];
  const fresnelColors: Record<keyof typeof CPK_COLORS, number> = {
    carbon: 0x60a5fa,
    carbonSubstrate: 0xfef08a,
    carbonDrug: 0xf87171,
    hydrogen: 0xe0f2fe,
    nitrogen: 0x93c5fd,
    oxygen: 0xfca5a5,
    phosphorus: 0xfde047,
    sulfur: 0xfef08a,
    fluorine: 0x6ee7b7,
    cofactorMg: 0xc4b5fd,
    bond: 0x94a3b8,
  };
  const mat = createFresnelBiomaterial({
    color,
    roughness: 0.16,
    metalness: 0.18,
    emissive: color,
    emissiveIntensity,
    fresnelColor: fresnelColors[type] || 0x38bdf8,
    fresnelIntensity: 0.85,
  });
  const mesh = new THREE.Mesh(sphereGeoLOD, mat);
  mesh.scale.setScalar(radius);
  mesh.position.set(...position);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

// Chemical Bond Helper
export function createBond(
  start: [number, number, number],
  end: [number, number, number],
  radius = 0.035,
  color = CPK_COLORS.bond
): THREE.Mesh {
  const p1 = new THREE.Vector3(...start);
  const p2 = new THREE.Vector3(...end);
  const dir = new THREE.Vector3().subVectors(p2, p1);
  const length = dir.length();

  const mat = createPBRMaterial(color, 0.3, 0.6);
  const mesh = new THREE.Mesh(bondGeoLOD, mat);
  mesh.scale.set(radius, length, radius);

  // Position at midpoint
  mesh.position.copy(p1).addScaledVector(dir, 0.5);

  // Orient towards target
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
  mesh.castShadow = true;
  return mesh;
}

// -------------------------------------------------------------
// 1. Unreal / Unity Grade Photorealistic Enzyme Macromolecule
// -------------------------------------------------------------
export interface HoloReactionRateGauge {
  group: THREE.Group;
  setRate: (percent: number, statusText?: string) => void;
  updateAnimation: (delta: number) => void;
  setVisible: (visible: boolean) => void;
}

export interface RealisticEnzymeComplex {
  group: THREE.Group;
  subunits: THREE.Group[];
  activeSitePocket: THREE.Group;
  allostericPocket: THREE.Group;
  catalyticTriadResidues: THREE.Mesh[];
  cofactorIon: THREE.Mesh;
  activeSiteGlowMesh: THREE.Mesh;
  allostericGlowMesh: THREE.Mesh;
  rateGauge: HoloReactionRateGauge;
}

export function createRealisticEnzyme(): RealisticEnzymeComplex {
  const enzymeGroup = new THREE.Group();
  enzymeGroup.name = 'HERO_ENZYME_MACROMOLECULE';

  const subunits: THREE.Group[] = [];
  const catalyticTriadResidues: THREE.Mesh[] = [];

  // Quaternary Tetrameric Structure: HMG-CoA Reductase (以羟甲基戊二酰辅酶A还原酶为原型，结构呈现浅绿色)
  const chainPalettes = [
    { base: 0x15803d, accent: 0x22c55e, alpha: 0x86efac }, // Chain A (Emerald/Mint Green)
    { base: 0x16a34a, accent: 0x4ade80, alpha: 0xbbf7d0 }, // Chain B (Bright Light Green)
    { base: 0x047857, accent: 0x10b981, alpha: 0x6ee7b7 }, // Chain C (Aquamarine Green)
    { base: 0x14532d, accent: 0x15803d, alpha: 0x4ade80 }, // Chain D (Deep Lime Green)
  ];

  for (let c = 0; c < 4; c++) {
    const chainGroup = new THREE.Group();
    chainGroup.name = `SUBUNIT_CHAIN_${c}`;
    const palette = chainPalettes[c];
    const angleOffset = (c / 4) * Math.PI * 2;
    const centerRadius = 0.95;

    chainGroup.position.set(
      Math.cos(angleOffset) * centerRadius,
      Math.sin(angleOffset) * 0.45,
      Math.sin(angleOffset * 2) * 0.35
    );

    // 1. Globular Connolly Molecular Surface Lobes (8-10 overlapping amino acid clusters per chain)
    for (let l = 0; l < 9; l++) {
      const lobeAngle = (l / 9) * Math.PI * 2 + angleOffset;
      const lobeRadius = 0.45 + (l % 3) * 0.15;

      const lobeGeo = new THREE.IcosahedronGeometry(0.38 + (l % 2) * 0.1, 3);
      const lobeMat = createFresnelBiomaterial({
        color: l % 2 === 0 ? palette.base : palette.accent,
        roughness: 0.22,
        metalness: 0.1,
        clearcoat: 0.95,
        transmission: 0.35,
        fresnelColor: palette.alpha,
        fresnelIntensity: 1.15,
        fresnelPower: 2.2,
      });

      const lobeMesh = new THREE.Mesh(lobeGeo, lobeMat);
      lobeMesh.position.set(
        Math.cos(lobeAngle) * lobeRadius,
        Math.sin(l * 1.5) * 0.4,
        Math.sin(lobeAngle) * lobeRadius * 0.8
      );
      lobeMesh.scale.set(1.0 + (l % 3) * 0.2, 0.85 + (l % 2) * 0.25, 1.1);
      lobeMesh.castShadow = true;
      lobeMesh.receiveShadow = true;
      chainGroup.add(lobeMesh);

      // Surface Residue Micro-bumps (Side Chains: Arg, Lys, Tyr, Phe)
      for (let b = 0; b < 4; b++) {
        const bump = new THREE.Mesh(
          new THREE.SphereGeometry(0.12, 10, 10),
          new THREE.MeshStandardMaterial({
            color: palette.alpha,
            roughness: 0.4,
            metalness: 0.1,
          })
        );
        bump.position.set(
          lobeMesh.position.x + (Math.random() - 0.5) * 0.5,
          lobeMesh.position.y + (Math.random() - 0.5) * 0.4,
          lobeMesh.position.z + (Math.random() - 0.5) * 0.5
        );
        chainGroup.add(bump);
      }
    }

    // 2. Secondary Structure: Alpha-Helix Ribbon Spirals (Authentic PDB secondary structure representation)
    const helixCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.3, -0.6, 0.2),
      new THREE.Vector3(-0.1, -0.2, 0.4),
      new THREE.Vector3(0.2, 0.2, 0.3),
      new THREE.Vector3(0.4, 0.6, 0.0),
    ]);
    const helixTubeGeo = new THREE.TubeGeometry(helixCurve, 24, 0.07, 8, false);
    const helixMat = new THREE.MeshStandardMaterial({
      color: palette.alpha,
      roughness: 0.25,
      metalness: 0.4,
    });
    const helixMesh = new THREE.Mesh(helixTubeGeo, helixMat);
    chainGroup.add(helixMesh);

    subunits.push(chainGroup);
    enzymeGroup.add(chainGroup);
  }

  // -------------------------------------------------------------
  // -------------------------------------------------------------
  // Catalytic Active Pocket (活性中心催化口袋) - Upper Groove (0, 0.58, 0.52)
  // -------------------------------------------------------------
  const activeSitePocket = new THREE.Group();
  activeSitePocket.name = 'ACTIVE_SITE_POCKET';
  activeSitePocket.position.set(0, 0.58, 0.52);

  // Sculpted Pocket Cavity (Soft Glowing Yellow Warm Light)
  const pocketCavityGeo = new THREE.TorusGeometry(0.48, 0.14, 18, 36);
  const pocketCavityMat = new THREE.MeshPhysicalMaterial({
    color: 0xfacc15,
    emissive: 0xeab308,
    emissiveIntensity: 0.95,
    roughness: 0.18,
    metalness: 0.25,
    clearcoat: 0.95,
    sheen: 1.0,
    sheenColor: new THREE.Color(0xfef08a),
  });
  const activeSiteGlowMesh = new THREE.Mesh(pocketCavityGeo, pocketCavityMat);
  activeSitePocket.add(activeSiteGlowMesh);

  // Soft Yellow Pocket Light Emitter (Warm pulsating glow)
  const pocketLight = new THREE.PointLight(0xfef08a, 3.2, 4.5);
  pocketLight.position.set(0, 0.15, 0.25);
  activeSitePocket.add(pocketLight);

  // 3D Billboard Label: 活性中心 (Active Site)
  const labelGroup = new THREE.Group();
  labelGroup.name = 'ACTIVE_SITE_LABEL_GROUP';
  labelGroup.position.set(0, 0.72, 0.12);

  const lblCanvas = document.createElement('canvas');
  lblCanvas.width = 512;
  lblCanvas.height = 160;
  const lblCtx = lblCanvas.getContext('2d')!;
  
  lblCtx.fillStyle = 'rgba(10, 15, 30, 0.90)';
  lblCtx.fillRect(6, 6, 500, 148);
  lblCtx.strokeStyle = '#38bdf8';
  lblCtx.lineWidth = 2.5;
  lblCtx.strokeRect(6, 6, 500, 148);

  // Title: 活性中心 (Active Site)
  lblCtx.font = 'bold 36px system-ui, -apple-system, sans-serif';
  lblCtx.fillStyle = '#fef08a';
  lblCtx.textAlign = 'left';
  lblCtx.fillText('活性中心 (Active Site)', 30, 64);

  // Subtitle: 锁钥结合靶位 · Catalytic Pocket
  lblCtx.font = '600 22px system-ui, -apple-system, sans-serif';
  lblCtx.fillStyle = '#38bdf8';
  lblCtx.fillText('★ 锁钥结合靶位 · HMG-CoA 催化凹槽', 30, 116);

  const lblTex = new THREE.CanvasTexture(lblCanvas);
  lblTex.colorSpace = THREE.SRGBColorSpace;
  const lblPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(1.35, 0.42),
    new THREE.MeshBasicMaterial({ map: lblTex, transparent: true, side: THREE.DoubleSide })
  );
  labelGroup.add(lblPlane);
  activeSitePocket.add(labelGroup);

  // Inner Catalytic Pocket Depth Funnel
  const funnelGeo = new THREE.ConeGeometry(0.38, 0.5, 24, 1, true);
  const funnelMat = new THREE.MeshStandardMaterial({
    color: 0xca8a04,
    emissive: 0xa16207,
    emissiveIntensity: 0.5,
    roughness: 0.3,
    side: THREE.DoubleSide,
  });
  const funnel = new THREE.Mesh(funnelGeo, funnelMat);
  funnel.rotation.x = Math.PI / 2;
  funnel.position.z = -0.2;
  activeSitePocket.add(funnel);

  // Detailed Catalytic Triad Residue Sidechains:
  // 1. Serine-195 (-OH nucleophile)
  const serResidue = createAtom('oxygen', 0.12, [-0.18, 0.15, -0.05], 0.6);
  activeSitePocket.add(serResidue);
  catalyticTriadResidues.push(serResidue);

  // 2. Histidine-57 (Imidazole Ring with 2 nitrogens)
  const hisResidueN1 = createAtom('nitrogen', 0.13, [0.15, 0.18, -0.08], 0.7);
  const hisResidueN2 = createAtom('nitrogen', 0.13, [0.26, 0.08, -0.12], 0.7);
  activeSitePocket.add(hisResidueN1);
  activeSitePocket.add(hisResidueN2);
  catalyticTriadResidues.push(hisResidueN1, hisResidueN2);

  // 3. Aspartate-102 (-COO- carboxylate oxygen pair)
  const aspResidueO1 = createAtom('oxygen', 0.12, [0.05, -0.18, -0.14], 0.5);
  activeSitePocket.add(aspResidueO1);
  catalyticTriadResidues.push(aspResidueO1);

  // 4. Catalytic Divalent Metal Cofactor Ion (Mg2+ / Zn2+ Sphere with coordination bonds)
  const cofactorIon = createAtom('cofactorMg', 0.15, [0.0, 0.0, -0.1], 0.9);
  activeSitePocket.add(cofactorIon);

  // Coordination bond rays to catalytic residues
  const coordBond1 = createBond([0, 0, -0.1], [-0.18, 0.15, -0.05], 0.015, 0xa78bfa);
  const coordBond2 = createBond([0, 0, -0.1], [0.15, 0.18, -0.08], 0.015, 0xa78bfa);
  const coordBond3 = createBond([0, 0, -0.1], [0.05, -0.18, -0.14], 0.015, 0xa78bfa);
  activeSitePocket.add(coordBond1, coordBond2, coordBond3);

  // Electrostatic Potential Surface Glow (Basic Blue & Acidic Red residues around pocket rim)
  for (let r = 0; r < 6; r++) {
    const rimAngle = (r / 6) * Math.PI * 2;
    const isBasic = r % 2 === 0;
    const rimAtom = createAtom(
      isBasic ? 'nitrogen' : 'oxygen',
      0.09,
      [Math.cos(rimAngle) * 0.45, Math.sin(rimAngle) * 0.45, 0.05],
      0.4
    );
    activeSitePocket.add(rimAtom);
  }

  enzymeGroup.add(activeSitePocket);

  // -------------------------------------------------------------
  // Allosteric Regulatory Pocket (别构调节位点) - Lateral Flank (1.25, -0.25, 0.4)
  // 闪烁着紫色的柔光，标注字幕：别构位点 / 别构中心 (Allosteric Site)
  // -------------------------------------------------------------
  const allostericPocket = new THREE.Group();
  allostericPocket.name = 'ALLOSTERIC_POCKET';
  allostericPocket.position.set(1.25, -0.25, 0.4);
  allostericPocket.rotation.y = -Math.PI / 4;

  // Purple soft glow toroidal halo
  const allostericRingGeo = new THREE.TorusGeometry(0.38, 0.10, 16, 32);
  const allostericRingMat = new THREE.MeshPhysicalMaterial({
    color: 0xa855f7,
    emissive: 0x9333ea,
    emissiveIntensity: 1.4,
    roughness: 0.15,
    metalness: 0.3,
    clearcoat: 0.8,
  });
  const allostericGlowMesh = new THREE.Mesh(allostericRingGeo, allostericRingMat);
  allostericPocket.add(allostericGlowMesh);

  // Soft purple point light for radiant halo
  const allostericLight = new THREE.PointLight(0xa855f7, 2.8, 3.5);
  allostericLight.position.set(0, 0, 0.15);
  allostericPocket.add(allostericLight);

  // Allosteric hydrophobic groove cleft (deep purple)
  const grooveGeo = new THREE.CylinderGeometry(0.26, 0.36, 0.4, 16, 1, true);
  const grooveMat = new THREE.MeshStandardMaterial({
    color: 0x581c87,
    roughness: 0.4,
    side: THREE.DoubleSide,
  });
  const groove = new THREE.Mesh(grooveGeo, grooveMat);
  groove.rotation.x = Math.PI / 2;
  groove.position.z = -0.15;
  allostericPocket.add(groove);

  // Hydrogen bond donor/acceptor pins for allosteric drug recognition
  for (let p = 0; p < 3; p++) {
    const pinAngle = (p / 3) * Math.PI * 2;
    const pin = createAtom('nitrogen', 0.1, [Math.cos(pinAngle) * 0.28, Math.sin(pinAngle) * 0.28, -0.05], 0.7);
    allostericPocket.add(pin);
  }

  // 3D Billboard Label: 别构位点 / 别构中心 (Allosteric Site)
  const allostericBillboard = createSubstrateBillboard(
    '别构位点 / 别构中心',
    'Allosteric Site · 侧面非催化调控口袋',
    '#a855f7',
    '#f3e8ff'
  );
  allostericBillboard.name = 'ALLOSTERIC_SITE_BILLBOARD';
  allostericBillboard.position.set(0, 0.75, 0);
  allostericPocket.add(allostericBillboard);

  // -------------------------------------------------------------
  // 3D Floating Reaction Rate Bar Chart (反应速率柱状图) - Overhead (0, 1.88, 0.25)
  // -------------------------------------------------------------
  const rateGauge = createHoloReactionRateGauge();
  enzymeGroup.add(rateGauge.group);

  enzymeGroup.add(allostericPocket);

  return {
    group: enzymeGroup,
    subunits,
    activeSitePocket,
    allostericPocket,
    catalyticTriadResidues,
    cofactorIon,
    activeSiteGlowMesh,
    allostericGlowMesh,
    rateGauge,
  };
}

// -------------------------------------------------------------
// 3D Holographic Reaction Rate Bar Gauge (Unreal/VR In-World HUD)
// -------------------------------------------------------------
export function createHoloReactionRateGauge(): HoloReactionRateGauge {
  const group = new THREE.Group();
  group.name = 'HOLO_REACTION_RATE_GAUGE';
  group.position.set(0, 1.88, 0.25);

  let currentRate = 0;
  let targetRate = 0;
  let statusText = '等待底物结合 (0%)';

  const panelCanvas = document.createElement('canvas');
  panelCanvas.width = 640;
  panelCanvas.height = 240;
  const ctx = panelCanvas.getContext('2d')!;

  const panelTex = new THREE.CanvasTexture(panelCanvas);
  panelTex.colorSpace = THREE.SRGBColorSpace;

  function renderCanvas(rateVal: number, statusStr: string) {
    ctx.clearRect(0, 0, 640, 240);

    // Workstation Dark Chassis with Hairline Precision Border
    ctx.fillStyle = 'rgba(6, 11, 24, 0.95)';
    ctx.fillRect(6, 6, 628, 228);
    ctx.strokeStyle = rateVal >= 90 ? 'rgba(52, 211, 153, 0.6)' : 'rgba(34, 211, 238, 0.5)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(6, 6, 628, 228);

    // Technical Corner Bracket Accents
    ctx.strokeStyle = rateVal >= 90 ? '#34d399' : '#22d3ee';
    ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(6, 26); ctx.lineTo(6, 6); ctx.lineTo(26, 6); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(614, 6); ctx.lineTo(634, 6); ctx.lineTo(634, 26); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(6, 214); ctx.lineTo(6, 234); ctx.lineTo(26, 234); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(614, 234); ctx.lineTo(634, 234); ctx.lineTo(634, 214); ctx.stroke();

    // Technical Telemetry Monospace Header
    ctx.font = 'bold 16px monospace';
    ctx.fillStyle = '#38bdf8';
    ctx.textAlign = 'left';
    ctx.fillText('[INSTRUMENTATION // TURNOVER FLUX (V/Vmax)]', 26, 42);

    // Percentage value display with tabular numbers
    ctx.font = '900 44px monospace';
    ctx.fillStyle = rateVal >= 90 ? '#34d399' : rateVal <= 20 ? '#fb7185' : '#38bdf8';
    ctx.textAlign = 'right';
    ctx.fillText(`${Math.round(rateVal)}%`, 614, 48);

    // Status description
    ctx.font = '600 18px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#f1f5f9';
    ctx.textAlign = 'left';
    ctx.fillText(`STATUS: ${statusStr}`, 26, 88);

    // Progress bar frame (Rectangular precision track)
    const barX = 26;
    const barY = 112;
    const barW = 588;
    const barH = 26;

    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.fillRect(barX, barY, barW, barH);
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.3)';
    ctx.lineWidth = 1;
    ctx.strokeRect(barX, barY, barW, barH);

    // Fill bar
    const fillWidth = Math.max(4, (barW * Math.min(100, Math.max(0, rateVal))) / 100);
    const grad = ctx.createLinearGradient(barX, 0, barX + barW, 0);
    grad.addColorStop(0, '#0284c7');
    grad.addColorStop(0.5, '#06b6d4');
    grad.addColorStop(1.0, '#10b981');

    ctx.fillStyle = grad;
    ctx.fillRect(barX + 2, barY + 2, fillWidth - 4, barH - 4);

    // Calibrated Tick Marks every 25%
    for (let t = 0; t <= 4; t++) {
      const tx = barX + (barW * t) / 4;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(tx, barY);
      ctx.lineTo(tx, barY + barH);
      ctx.stroke();
    }

    // Tick labels
    ctx.font = '500 14px monospace';
    ctx.fillStyle = '#94a3b8';
    ctx.textAlign = 'left';
    ctx.fillText('0% (BASAL)', barX, 172);
    ctx.textAlign = 'center';
    ctx.fillText('50% (Km AFFINITY)', barX + barW / 2, 172);
    ctx.fillText('100% (Vmax SATURATION)', barX + barW, 172);

    panelTex.needsUpdate = true;
  }

  renderCanvas(0, statusText);

  const panelPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(1.65, 0.62),
    new THREE.MeshBasicMaterial({ map: panelTex, transparent: true, side: THREE.DoubleSide })
  );
  group.add(panelPlane);

  return {
    group,
    setRate: (percent: number, newStatus?: string) => {
      targetRate = percent;
      if (newStatus) statusText = newStatus;
    },
    updateAnimation: (delta: number) => {
      if (Math.abs(currentRate - targetRate) > 0.2) {
        currentRate = THREE.MathUtils.damp(currentRate, targetRate, 4.0, delta);
        renderCanvas(currentRate, statusText);
      }
    },
    setVisible: (visible: boolean) => {
      group.visible = visible;
    },
  };
}

// -------------------------------------------------------------
// 2. Photorealistic Small Molecule Ligands (Ball-and-Stick CPK)
// -------------------------------------------------------------

// Realistic Natural Substrate (e.g., HMG-CoA / Acetyl-CoA / Dihydrofolate analog)
export function createRealisticSubstrate(): THREE.Group {
  const substrate = new THREE.Group();
  substrate.name = 'REALISTIC_SUBSTRATE';

  // Structure: Central carbon chain with carboxylate, hydroxyl, and phosphate anchor
  // Coordinates representing authentic 3D stereochemical geometry
  const atoms: { type: keyof typeof CPK_COLORS; radius: number; pos: [number, number, number] }[] = [
    { type: 'carbonSubstrate', radius: 0.12, pos: [0.0, 0.0, 0.0] },      // C1
    { type: 'carbonSubstrate', radius: 0.12, pos: [0.18, 0.14, 0.0] },    // C2
    { type: 'carbonSubstrate', radius: 0.12, pos: [-0.18, -0.14, 0.0] },  // C3
    { type: 'oxygen', radius: 0.11, pos: [0.35, 0.18, 0.05] },           // Carbonyl Oxygen =O
    { type: 'oxygen', radius: 0.11, pos: [0.12, 0.32, -0.05] },          // Hydroxyl Oxygen -OH
    { type: 'oxygen', radius: 0.11, pos: [-0.35, -0.18, 0.05] },         // Carboxylate O1
    { type: 'oxygen', radius: 0.11, pos: [-0.12, -0.32, -0.05] },        // Carboxylate O2
    { type: 'sulfur', radius: 0.14, pos: [0.0, 0.0, 0.24] },             // Thioester Sulfur -S-
    { type: 'carbonSubstrate', radius: 0.12, pos: [0.0, 0.0, 0.44] },    // Acetyl/Coenzyme tail C
    { type: 'hydrogen', radius: 0.07, pos: [0.18, -0.12, 0.1] },         // H1
    { type: 'hydrogen', radius: 0.07, pos: [-0.18, 0.12, -0.1] },        // H2
  ];

  atoms.forEach(a => {
    substrate.add(createAtom(a.type, a.radius, a.pos, 0.3));
  });

  // Chemical Bonds
  const bonds: [[number, number, number], [number, number, number]][] = [
    [[0.0, 0.0, 0.0], [0.18, 0.14, 0.0]],
    [[0.0, 0.0, 0.0], [-0.18, -0.14, 0.0]],
    [[0.18, 0.14, 0.0], [0.35, 0.18, 0.05]],
    [[0.18, 0.14, 0.0], [0.12, 0.32, -0.05]],
    [[-0.18, -0.14, 0.0], [-0.35, -0.18, 0.05]],
    [[-0.18, -0.14, 0.0], [-0.12, -0.32, -0.05]],
    [[0.0, 0.0, 0.0], [0.0, 0.0, 0.24]],
    [[0.0, 0.0, 0.24], [0.0, 0.0, 0.44]],
  ];

  bonds.forEach(b => {
    substrate.add(createBond(b[0], b[1], 0.025, 0x38bdf8));
  });

  // Soft Aura Glow
  const glow = new THREE.Mesh(
    new THREE.SphereGeometry(0.55, 16, 16),
    new THREE.MeshBasicMaterial({
      color: 0xfacc15,
      transparent: true,
      opacity: 0.22,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
  );
  substrate.add(glow);

  // 3D Billboard Label: 底物分子 (HMG-CoA)
  const lblMesh = createSubstrateBillboard(
    '底物分子 (HMG-CoA)',
    '★ 锁钥互补钥匙结构',
    '#facc15',
    '#fef08a'
  );
  lblMesh.position.set(0, -0.65, 0);
  substrate.add(lblMesh);

  return substrate;
}

// Mismatched Yellow Decoy Molecule (Shape doesn't match lock-and-key cavity)
export function createDecoySubstrate(): THREE.Group {
  const decoy = new THREE.Group();
  decoy.name = 'DECOY_MISMATCHED_SUBSTRATE';

  // Triangular rigid shape with bulky steric wings that cannot fit the keyhole cavity
  const atoms: { type: keyof typeof CPK_COLORS; radius: number; pos: [number, number, number] }[] = [
    { type: 'phosphorus', radius: 0.15, pos: [0.0, 0.25, 0.0] },
    { type: 'phosphorus', radius: 0.15, pos: [-0.28, -0.22, 0.0] },
    { type: 'phosphorus', radius: 0.15, pos: [0.28, -0.22, 0.0] },
    { type: 'sulfur', radius: 0.14, pos: [0.0, -0.05, 0.22] },
    { type: 'oxygen', radius: 0.12, pos: [-0.48, -0.32, 0.1] },
    { type: 'oxygen', radius: 0.12, pos: [0.48, -0.32, 0.1] },
    { type: 'oxygen', radius: 0.12, pos: [0.0, 0.45, -0.1] },
  ];

  atoms.forEach(a => {
    decoy.add(createAtom(a.type, a.radius, a.pos, 0.4));
  });

  decoy.add(createBond([0.0, 0.25, 0.0], [-0.28, -0.22, 0.0], 0.03, 0xeab308));
  decoy.add(createBond([-0.28, -0.22, 0.0], [0.28, -0.22, 0.0], 0.03, 0xeab308));
  decoy.add(createBond([0.28, -0.22, 0.0], [0.0, 0.25, 0.0], 0.03, 0xeab308));
  decoy.add(createBond([-0.28, -0.22, 0.0], [-0.48, -0.32, 0.1], 0.025, 0xef4444));
  decoy.add(createBond([0.28, -0.22, 0.0], [0.48, -0.32, 0.1], 0.025, 0xef4444));

  // Yellow warning halo
  const glow = new THREE.Mesh(
    new THREE.SphereGeometry(0.65, 16, 16),
    new THREE.MeshBasicMaterial({
      color: 0xeab308,
      transparent: true,
      opacity: 0.18,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
  );
  decoy.add(glow);

  // 3D Billboard Label: 异构非互补分子
  const lblMesh = createSubstrateBillboard(
    '异构小分子 (非匹配)',
    '✖ 空间位阻 · 无法契合',
    '#f97316',
    '#fed7aa'
  );
  lblMesh.position.set(0, -0.65, 0);
  decoy.add(lblMesh);

  return decoy;
}

// 3D Substrate Floating Billboard Helper (PyMOL / BioRender Scientific Annotation Card)
export function createSubstrateBillboard(
  title: string,
  subtitle: string,
  borderColor: string,
  textColor: string
): THREE.Mesh {
  const canvas = document.createElement('canvas');
  canvas.width = 440;
  canvas.height = 140;
  const ctx = canvas.getContext('2d')!;

  // High-Tech Dark Chassis
  ctx.fillStyle = 'rgba(6, 11, 24, 0.94)';
  ctx.fillRect(4, 4, 432, 132);
  ctx.strokeStyle = borderColor;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(4, 4, 432, 132);

  // Technical Corner Accents
  ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.moveTo(4, 18); ctx.lineTo(4, 4); ctx.lineTo(18, 4); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(422, 4); ctx.lineTo(436, 4); ctx.lineTo(436, 18); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(4, 122); ctx.lineTo(4, 136); ctx.lineTo(18, 136); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(422, 136); ctx.lineTo(436, 136); ctx.lineTo(436, 122); ctx.stroke();

  // Primary Title
  ctx.font = 'bold 26px system-ui, -apple-system, sans-serif';
  ctx.fillStyle = textColor;
  ctx.textAlign = 'center';
  ctx.fillText(title, 220, 52);

  // Subtitle (Monospace Scientific Annotation)
  ctx.font = '500 17px monospace';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText(subtitle, 220, 96);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(0.95, 0.32),
    new THREE.MeshBasicMaterial({ map: texture, transparent: true, side: THREE.DoubleSide })
  );
  return plane;
}

// Realistic Competitive Inhibitor Drug (Atorvastatin / Statin analog)
export function createRealisticCompetitiveDrug(): THREE.Group {
  const drug = new THREE.Group();
  drug.name = 'REALISTIC_COMPETITIVE_DRUG';

  // Structure: Bulky central pyrrole core ring, Fluorophenyl group, isopropyl arm,
  // and the mimic dihydroxy acid pharmacophore that competes for the active site!
  const ringRadius = 0.22;
  const atoms: { type: keyof typeof CPK_COLORS; radius: number; pos: [number, number, number] }[] = [
    // Central Pyrrole Ring (Bulky bright crimson red drug core)
    { type: 'nitrogen', radius: 0.13, pos: [0.0, ringRadius, 0.0] },
    { type: 'carbonDrug', radius: 0.12, pos: [ringRadius * 0.95, ringRadius * 0.31, 0.0] },
    { type: 'carbonDrug', radius: 0.12, pos: [ringRadius * 0.59, -ringRadius * 0.81, 0.0] },
    { type: 'carbonDrug', radius: 0.12, pos: [-ringRadius * 0.59, -ringRadius * 0.81, 0.0] },
    { type: 'carbonDrug', radius: 0.12, pos: [-ringRadius * 0.95, ringRadius * 0.31, 0.0] },

    // Fluorophenyl substituent (Benzene ring + Fluorine atom)
    { type: 'carbonDrug', radius: 0.12, pos: [0.45, 0.35, 0.0] },
    { type: 'carbonDrug', radius: 0.12, pos: [0.65, 0.35, 0.0] },
    { type: 'carbonDrug', radius: 0.12, pos: [0.75, 0.18, 0.0] },
    { type: 'fluorine', radius: 0.13, pos: [0.95, 0.18, 0.0] }, // Green Fluorine atom!

    // Bulky Isopropyl Group (Red bulky steric arm)
    { type: 'carbonDrug', radius: 0.12, pos: [-0.45, 0.35, 0.1] },
    { type: 'carbonDrug', radius: 0.12, pos: [-0.65, 0.45, 0.2] },
    { type: 'carbonDrug', radius: 0.12, pos: [-0.65, 0.25, -0.1] },

    // Statin Active Pharmacophore Head (Bright Yellow, mimics substrate to lock catalytic pocket!)
    { type: 'carbonSubstrate', radius: 0.12, pos: [0.0, -0.42, 0.05] },
    { type: 'oxygen', radius: 0.11, pos: [0.18, -0.48, 0.1] },
    { type: 'carbonSubstrate', radius: 0.12, pos: [0.0, -0.65, 0.1] },
    { type: 'oxygen', radius: 0.11, pos: [-0.18, -0.72, 0.15] },
    { type: 'oxygen', radius: 0.12, pos: [0.0, -0.88, 0.2] },   // Terminal Carboxylate
  ];

  atoms.forEach(a => {
    drug.add(createAtom(a.type, a.radius, a.pos, a.type === 'fluorine' ? 0.7 : 0.3));
  });

  // Bonds
  const bonds: [[number, number, number], [number, number, number]][] = [
    // Pyrrole ring bonds
    [[0.0, ringRadius, 0.0], [ringRadius * 0.95, ringRadius * 0.31, 0.0]],
    [[ringRadius * 0.95, ringRadius * 0.31, 0.0], [ringRadius * 0.59, -ringRadius * 0.81, 0.0]],
    [[ringRadius * 0.59, -ringRadius * 0.81, 0.0], [-ringRadius * 0.59, -ringRadius * 0.81, 0.0]],
    [[-ringRadius * 0.59, -ringRadius * 0.81, 0.0], [-ringRadius * 0.95, ringRadius * 0.31, 0.0]],
    [[-ringRadius * 0.95, ringRadius * 0.31, 0.0], [0.0, ringRadius, 0.0]],
    // Substituent bonds
    [[ringRadius * 0.95, ringRadius * 0.31, 0.0], [0.45, 0.35, 0.0]],
    [[0.45, 0.35, 0.0], [0.65, 0.35, 0.0]],
    [[0.65, 0.35, 0.0], [0.75, 0.18, 0.0]],
    [[0.75, 0.18, 0.0], [0.95, 0.18, 0.0]],
    // Isopropyl bonds
    [[-ringRadius * 0.95, ringRadius * 0.31, 0.0], [-0.45, 0.35, 0.1]],
    [[-0.45, 0.35, 0.1], [-0.65, 0.45, 0.2]],
    [[-0.45, 0.35, 0.1], [-0.65, 0.25, -0.1]],
    // Pharmacophore tail
    [[0.0, -ringRadius * 0.81, 0.0], [0.0, -0.42, 0.05]],
    [[0.0, -0.42, 0.05], [0.18, -0.48, 0.1]],
    [[0.0, -0.42, 0.05], [0.0, -0.65, 0.1]],
    [[0.0, -0.65, 0.1], [-0.18, -0.72, 0.15]],
    [[0.0, -0.65, 0.1], [0.0, -0.88, 0.2]],
  ];

  bonds.forEach(b => {
    drug.add(createBond(b[0], b[1], 0.028, 0xef4444));
  });

  // Bright Red High-Affinity Aura (亮红色高亲和力光晕)
  const glow = new THREE.Mesh(
    new THREE.SphereGeometry(0.78, 16, 16),
    new THREE.MeshBasicMaterial({
      color: 0xef4444,
      transparent: true,
      opacity: 0.26,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
  );
  drug.add(glow);

  // 3D Billboard Label: 他汀类药物分子 (竞争性抑制剂)
  const lblMesh = createSubstrateBillboard(
    '他汀类药物分子 (竞争性抑制剂)',
    '★ 一端模拟底物 · 抢占死锁活性中心',
    '#ef4444',
    '#fecaca'
  );
  lblMesh.position.set(0, -0.75, 0);
  drug.add(lblMesh);

  return drug;
}

// -------------------------------------------------------------
// 3D Photorealistic Medicine Bottle (他汀类药物药瓶)
// -------------------------------------------------------------
export function createMedicineBottle(): THREE.Group {
  const bottleGroup = new THREE.Group();
  bottleGroup.name = 'MEDICINE_BOTTLE';

  // 1. Translucent Medical Glass Bottle Body
  const bodyGeo = new THREE.CylinderGeometry(0.32, 0.34, 0.85, 32);
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0x38bdf8,
    transmission: 0.65,
    opacity: 1,
    transparent: true,
    roughness: 0.12,
    metalness: 0.1,
    ior: 1.52,
    thickness: 0.5,
    clearcoat: 1.0,
    clearcoatRoughness: 0.08,
  });
  const body = new THREE.Mesh(bodyGeo, glassMat);
  body.castShadow = true;
  bottleGroup.add(body);

  // 2. Bottle Shoulder & Neck
  const shoulderGeo = new THREE.CylinderGeometry(0.20, 0.32, 0.18, 32);
  const shoulder = new THREE.Mesh(shoulderGeo, glassMat);
  shoulder.position.y = 0.51;
  bottleGroup.add(shoulder);

  const neckGeo = new THREE.CylinderGeometry(0.18, 0.20, 0.15, 32);
  const neck = new THREE.Mesh(neckGeo, glassMat);
  neck.position.y = 0.67;
  bottleGroup.add(neck);

  // 3. Clinical White Bottle Cap
  const capGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.16, 32);
  const capMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    roughness: 0.35,
    metalness: 0.2,
  });
  const cap = new THREE.Mesh(capGeo, capMat);
  cap.position.y = 0.82;
  cap.castShadow = true;
  bottleGroup.add(cap);

  // 4. Inner Medicine Glow Core (Glowing red liquid/pills inside)
  const liquidGeo = new THREE.CylinderGeometry(0.27, 0.29, 0.68, 24);
  const liquidMat = new THREE.MeshBasicMaterial({
    color: 0xef4444,
    transparent: true,
    opacity: 0.45,
    blending: THREE.AdditiveBlending,
  });
  const liquid = new THREE.Mesh(liquidGeo, liquidMat);
  liquid.position.y = -0.05;
  bottleGroup.add(liquid);

  // Soft internal red pointlight
  const innerLight = new THREE.PointLight(0xef4444, 2.2, 2.5);
  innerLight.position.y = 0.1;
  bottleGroup.add(innerLight);

  // 5. Printed Pharmacy Label on Bottle (瓶身上写着：他汀类药物分子（竞争性抑制剂）)
  const lblCanvas = document.createElement('canvas');
  lblCanvas.width = 512;
  lblCanvas.height = 360;
  const ctx = lblCanvas.getContext('2d')!;

  // Label background
  ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
  ctx.fillRect(8, 8, 496, 344);

  // Border & Red Header bar
  ctx.fillStyle = '#dc2626';
  ctx.fillRect(8, 8, 496, 44);

  ctx.font = 'bold 22px system-ui, sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.fillText('★ 临床降脂靶向药物 · Rx 处方药', 256, 38);

  // Main Title requested by user: 他汀类药物分子（竞争性抑制剂）
  ctx.font = 'bold 32px system-ui, -apple-system, sans-serif';
  ctx.fillStyle = '#0f172a';
  ctx.fillText('他汀类药物分子', 256, 105);

  ctx.font = 'bold 24px system-ui, -apple-system, sans-serif';
  ctx.fillStyle = '#dc2626';
  ctx.fillText('（竞争性抑制剂）', 256, 142);

  // Subtitle / Chemical details
  ctx.font = '600 20px monospace';
  ctx.fillStyle = '#334155';
  ctx.fillText('阿托伐他汀 / 洛伐他汀 20mg', 256, 185);

  ctx.fillStyle = '#475569';
  ctx.font = '500 17px system-ui, sans-serif';
  ctx.fillText('靶点：HMG-CoA 还原酶活性中心', 256, 225);
  ctx.fillText('机制：竞争抢占催化口袋 · 阻断胆固醇合成', 256, 255);

  // Barcode decoration
  ctx.fillStyle = '#0f172a';
  for (let x = 60; x < 450; x += 10 + Math.random() * 8) {
    ctx.fillRect(x, 280, 4 + Math.random() * 4, 35);
  }
  ctx.font = '14px monospace';
  ctx.fillText('ATV-STATIN-2026-RX', 256, 335);

  const lblTex = new THREE.CanvasTexture(lblCanvas);
  lblTex.colorSpace = THREE.SRGBColorSpace;

  const labelGeo = new THREE.CylinderGeometry(0.33, 0.35, 0.62, 32, 1, true, -Math.PI * 0.45, Math.PI * 0.9);
  const labelMat = new THREE.MeshBasicMaterial({
    map: lblTex,
    transparent: true,
    side: THREE.DoubleSide,
  });
  const labelMesh = new THREE.Mesh(labelGeo, labelMat);
  labelMesh.position.y = -0.04;
  bottleGroup.add(labelMesh);

  // Base Pedestal Glow Ring
  const ringGeo = new THREE.RingGeometry(0.36, 0.52, 32);
  const ringMat = new THREE.MeshBasicMaterial({
    color: 0xef4444,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.6,
  });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = -0.42;
  bottleGroup.add(ring);

  return bottleGroup;
}

// Realistic Non-Competitive Allosteric Drug (Blue Molecule / 如某些重金属离子或特定靶向药)
export function createRealisticNonCompetitiveDrug(): THREE.Group {
  const drug = new THREE.Group();
  drug.name = 'REALISTIC_ALLOSTERIC_DRUG';

  // Tricyclic condensed core with heavy metal / targeted allosteric pharmacophore (Cyan & Royal Blue Motif)
  const atoms: { type: keyof typeof CPK_COLORS; radius: number; pos: [number, number, number] }[] = [
    { type: 'nitrogen', radius: 0.15, pos: [0.0, 0.0, 0.0] },              // Central Royal Blue Coordination Core
    { type: 'nitrogen', radius: 0.12, pos: [0.15, 0.14, 0.08] },          // Coordination ligand (1)
    { type: 'nitrogen', radius: 0.12, pos: [-0.15, 0.14, 0.08] },         // Coordination ligand (2)
    { type: 'fluorine', radius: 0.13, pos: [0.0, -0.22, 0.05] },          // Cyan electronegative anchor
    // Ring 1 (Hetero-aromatic blue scaffold)
    { type: 'nitrogen', radius: 0.12, pos: [0.0, 0.28, -0.1] },
    { type: 'carbon', radius: 0.12, pos: [0.22, 0.40, -0.12] },
    { type: 'carbon', radius: 0.12, pos: [0.22, 0.60, -0.12] },
    { type: 'nitrogen', radius: 0.12, pos: [0.0, 0.70, -0.1] },
    { type: 'carbon', radius: 0.12, pos: [-0.22, 0.60, -0.12] },
    { type: 'carbon', radius: 0.12, pos: [-0.22, 0.40, -0.12] },
    // Trifluoromethyl hydrophobic anchor
    { type: 'carbon', radius: 0.12, pos: [0.0, 0.90, -0.1] },
    { type: 'fluorine', radius: 0.12, pos: [0.14, 1.00, -0.05] },
    { type: 'fluorine', radius: 0.12, pos: [-0.14, 1.00, -0.05] },
    { type: 'fluorine', radius: 0.12, pos: [0.0, 0.96, -0.25] },
  ];

  atoms.forEach(a => {
    drug.add(createAtom(a.type, a.radius, a.pos, a.type === 'nitrogen' ? 0.6 : 0.3));
  });

  // Bonds (Electric Blue)
  const bonds: [[number, number, number], [number, number, number]][] = [
    [[0.0, 0.0, 0.0], [0.15, 0.14, 0.08]],
    [[0.0, 0.0, 0.0], [-0.15, 0.14, 0.08]],
    [[0.0, 0.0, 0.0], [0.0, -0.22, 0.05]],
    [[0.0, 0.0, 0.0], [0.0, 0.28, -0.1]],
    [[0.0, 0.28, -0.1], [0.22, 0.40, -0.12]],
    [[0.22, 0.40, -0.12], [0.22, 0.60, -0.12]],
    [[0.22, 0.60, -0.12], [0.0, 0.70, -0.1]],
    [[0.0, 0.70, -0.1], [-0.22, 0.60, -0.12]],
    [[-0.22, 0.60, -0.12], [-0.22, 0.40, -0.12]],
    [[-0.22, 0.40, -0.12], [0.0, 0.28, -0.1]],
    [[0.0, 0.70, -0.1], [0.0, 0.90, -0.1]],
    [[0.0, 0.90, -0.1], [0.14, 1.00, -0.05]],
    [[0.0, 0.90, -0.1], [-0.14, 1.00, -0.05]],
    [[0.0, 0.90, -0.1], [0.0, 0.96, -0.25]],
  ];

  bonds.forEach(b => {
    drug.add(createBond(b[0], b[1], 0.026, 0x0284c7));
  });

  // Radiant Royal Blue Allosteric Halo
  const glow = new THREE.Mesh(
    new THREE.SphereGeometry(0.72, 16, 16),
    new THREE.MeshBasicMaterial({
      color: 0x0284c7,
      transparent: true,
      opacity: 0.28,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
  );
  drug.add(glow);

  // 3D Billboard Label: 非竞争性抑制剂（如某些重金属离子或特定靶向药）
  const lblMesh = createSubstrateBillboard(
    '非竞争性抑制剂',
    '★ 如某些重金属离子或特定靶向药 · 结合别构位点',
    '#0284c7',
    '#bae6fd'
  );
  lblMesh.position.set(0, -0.75, 0);
  drug.add(lblMesh);

  return drug;
}

// Cleavage Split Products (P1 and P2)
export function createRealisticProducts(): { p1: THREE.Group; p2: THREE.Group } {
  const p1 = new THREE.Group();
  p1.name = 'PRODUCT_1';
  p1.add(createAtom('carbon', 0.12, [0, 0, 0]));
  p1.add(createAtom('oxygen', 0.11, [0.15, 0.1, 0]));
  p1.add(createAtom('oxygen', 0.11, [-0.15, -0.1, 0]));
  p1.add(createBond([0, 0, 0], [0.15, 0.1, 0], 0.025, 0x10b981));
  p1.add(createBond([0, 0, 0], [-0.15, -0.1, 0], 0.025, 0x10b981));

  const p2 = new THREE.Group();
  p2.name = 'PRODUCT_2';
  p2.add(createAtom('sulfur', 0.13, [0, 0, 0]));
  p2.add(createAtom('carbon', 0.12, [0, 0, 0.2]));
  p2.add(createAtom('hydrogen', 0.08, [0.1, 0.1, 0.25]));
  p2.add(createBond([0, 0, 0], [0, 0, 0.2], 0.025, 0x10b981));

  return { p1, p2 };
}

// -------------------------------------------------------------
// 3. Realistic Microscopic Cellular Elements
// -------------------------------------------------------------

// Realistic ATP Molecule: Adenine base + Ribose sugar + 3 High-Energy Phosphates
export function createRealisticATP(): THREE.Group {
  const atp = new THREE.Group();

  // 1. Adenine Purine Ring (Double ring: 5-membered + 6-membered)
  const ringA = new THREE.Mesh(
    new THREE.CylinderGeometry(0.24, 0.24, 0.08, 6),
    createPBRMaterial(0x2563eb, 0.25, 0.5)
  );
  ringA.rotation.x = Math.PI / 2;
  ringA.position.set(-0.75, 0, 0);
  atp.add(ringA);

  const ringB = new THREE.Mesh(
    new THREE.CylinderGeometry(0.18, 0.18, 0.08, 5),
    createPBRMaterial(0x3b82f6, 0.25, 0.5)
  );
  ringB.rotation.x = Math.PI / 2;
  ringB.position.set(-0.48, 0.08, 0);
  atp.add(ringB);

  // 2. Ribose Sugar Ring (Furanose pentagon)
  const ribose = new THREE.Mesh(
    new THREE.CylinderGeometry(0.22, 0.22, 0.08, 5),
    createPBRMaterial(0x10b981, 0.3, 0.3)
  );
  ribose.rotation.x = Math.PI / 2;
  ribose.position.set(-0.15, -0.05, 0);
  atp.add(ribose);

  // 3. Triphosphate Chain: Alpha (α), Beta (β), Gamma (γ) Phosphates
  for (let p = 0; p < 3; p++) {
    const pGroup = new THREE.Group();
    pGroup.position.set(0.24 + p * 0.42, 0, 0);

    // Central Phosphorus Atom
    const pAtom = createAtom('phosphorus', 0.14, [0, 0, 0], 0.5);
    pGroup.add(pAtom);

    // 4 Coordinate Oxygens in tetrahedral configuration
    const ox1 = createAtom('oxygen', 0.09, [0, 0.18, 0], 0.3);
    const ox2 = createAtom('oxygen', 0.09, [0, -0.18, 0], 0.3);
    const ox3 = createAtom('oxygen', 0.09, [0.12, 0, 0.15], 0.3);
    pGroup.add(ox1, ox2, ox3);

    // High-Energy Phosphoanhydride Bond Pulsing Arc (between P-O-P)
    const arcGlow = new THREE.Mesh(
      new THREE.TorusGeometry(0.16, 0.035, 12, 24),
      new THREE.MeshBasicMaterial({
        color: 0xffea00,
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending,
      })
    );
    arcGlow.rotation.y = Math.PI / 2;
    pGroup.add(arcGlow);

    atp.add(pGroup);
  }

  // Connecting bonds
  atp.add(createBond([-0.48, 0.08, 0], [-0.15, -0.05, 0], 0.025));
  atp.add(createBond([-0.15, -0.05, 0], [0.24, 0, 0], 0.025));
  atp.add(createBond([0.24, 0, 0], [0.66, 0, 0], 0.025));
  atp.add(createBond([0.66, 0, 0], [1.08, 0, 0], 0.025));

  return atp;
}

// Authentic 13-Protofilament Microtubule Section (Cytoskeleton)
export function createRealisticMicrotubule(length = 16): THREE.Group {
  const microtubule = new THREE.Group();
  microtubule.name = 'CYTOSKELETON_MICROTUBULE';

  // 13 protofilaments arranged in a hollow cylinder
  const radius = 0.55;
  const numProtofilaments = 13;
  const numDimers = Math.floor(length * 2.5);

  const alphaTubulinMat = createPBRMaterial(0x4f46e5, 0.35, 0.3); // Indigo α-Tubulin
  const betaTubulinMat = createPBRMaterial(0x06b6d4, 0.35, 0.3);  // Cyan β-Tubulin

  const instancedAlpha = new THREE.InstancedMesh(sphereGeoLOD, alphaTubulinMat, numProtofilaments * numDimers);
  const instancedBeta = new THREE.InstancedMesh(sphereGeoLOD, betaTubulinMat, numProtofilaments * numDimers);

  const dummy = new THREE.Object3D();
  let idx = 0;

  for (let z = 0; z < numDimers; z++) {
    const zPos = (z - numDimers / 2) * 0.32;
    const helixTwist = (z * 0.12);

    for (let p = 0; p < numProtofilaments; p++) {
      const angle = (p / numProtofilaments) * Math.PI * 2 + helixTwist;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;

      // α-tubulin
      dummy.position.set(x, y, zPos);
      dummy.scale.setScalar(0.12);
      dummy.updateMatrix();
      instancedAlpha.setMatrixAt(idx, dummy.matrix);

      // β-tubulin (staggered slightly along Z)
      dummy.position.set(x, y, zPos + 0.16);
      dummy.updateMatrix();
      instancedBeta.setMatrixAt(idx, dummy.matrix);

      idx++;
    }
  }

  instancedAlpha.instanceMatrix.needsUpdate = true;
  instancedBeta.instanceMatrix.needsUpdate = true;
  instancedAlpha.computeBoundingSphere();
  instancedBeta.computeBoundingSphere();

  microtubule.add(instancedAlpha);
  microtubule.add(instancedBeta);

  return microtubule;
}

// Endoplasmic Reticulum (ER Membrane Folds & Ribosomes) in foggy background
export function createEndoplasmicReticulum(): THREE.Group {
  const erGroup = new THREE.Group();
  erGroup.name = 'ENDOPLASMIC_RETICULUM_SHEETS';

  const sheetMat = new THREE.MeshPhysicalMaterial({
    color: 0x4338ca,
    roughness: 0.45,
    metalness: 0.1,
    transmission: 0.3,
    thickness: 1.2,
    clearcoat: 0.3,
    side: THREE.DoubleSide,
  });

  // Convoluted Cisternal Sheets
  for (let s = 0; s < 4; s++) {
    const sheetGeo = new THREE.PlaneGeometry(12, 6, 16, 16);
    const posAttr = sheetGeo.attributes.position;
    for (let i = 0; i < posAttr.count; i++) {
      const u = posAttr.getX(i);
      const v = posAttr.getY(i);
      posAttr.setZ(i, Math.sin(u * 0.6 + s) * 0.5 + Math.cos(v * 0.8) * 0.4);
    }
    sheetGeo.computeVertexNormals();

    const sheetMesh = new THREE.Mesh(sheetGeo, sheetMat);
    sheetMesh.position.set(0, (s - 1.5) * 1.8, -12);
    sheetMesh.rotation.x = Math.PI / 2.4;
    erGroup.add(sheetMesh);
  }

  // Bound Ribosomes on ER Surface (60S Large Subunit + 40S Small Subunit)
  const ribosomeMat = createPBRMaterial(0x818cf8, 0.4, 0.2);
  const numRibosomes = 180;
  const riboInstanced = new THREE.InstancedMesh(sphereGeoLOD, ribosomeMat, numRibosomes);
  const dummy = new THREE.Object3D();

  for (let r = 0; r < numRibosomes; r++) {
    dummy.position.set(
      (Math.random() - 0.5) * 11,
      (Math.random() - 0.5) * 5,
      -12 + (Math.random() - 0.5) * 2
    );
    dummy.scale.setScalar(0.14 + Math.random() * 0.05);
    dummy.updateMatrix();
    riboInstanced.setMatrixAt(r, dummy.matrix);
  }
  riboInstanced.instanceMatrix.needsUpdate = true;
  riboInstanced.computeBoundingSphere();
  erGroup.add(riboInstanced);

  return erGroup;
}
