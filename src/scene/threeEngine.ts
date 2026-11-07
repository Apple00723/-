import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { BokehPass } from 'three/examples/jsm/postprocessing/BokehPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { SceneId, VRMode } from '../types/vrCourse';
import { soundManager } from '../audio/soundManager';
import {
  createRealisticEnzyme,
  createRealisticSubstrate,
  createDecoySubstrate,
  createRealisticCompetitiveDrug,
  createMedicineBottle,
  createRealisticNonCompetitiveDrug,
  createRealisticProducts,
  createRealisticATP,
  createRealisticMicrotubule,
  createEndoplasmicReticulum,
  createSubstrateBillboard,
  RealisticEnzymeComplex,
} from './biomodelFactory';
import { createPhotorealisticLab, LabSceneObjects } from './labEnvironment';
import { createCytosolAtmosphere, CytosolAtmosphere } from './cytosolAtmosphere';

// Reusable math objects for zero garbage collection
const _vec3A = new THREE.Vector3();
const _vec3B = new THREE.Vector3();
const _colorA = new THREE.Color();
const _quatA = new THREE.Quaternion();

export class ThreeVREngine {
  private container: HTMLElement;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private xrCameraGroup: THREE.Group;

  // Postprocessing Composer & Bokeh Depth of Field (Default OFF for ultra-sharp clarity)
  private composer: EffectComposer;
  private bokehPass: BokehPass;
  private isDepthOfFieldEnabled = false;

  // VR controllers
  private controller1: THREE.XRTargetRaySpace | null = null;
  private controller2: THREE.XRTargetRaySpace | null = null;
  private controllerGrip1: THREE.XRGripSpace | null = null;
  private controllerGrip2: THREE.XRGripSpace | null = null;
  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2();

  // Scene sub-groups
  private labObjects: LabSceneObjects | null = null;
  private membraneTunnelGroup = new THREE.Group();
  private cytoplasmGroup = new THREE.Group();
  private cytosolAtmosphere: CytosolAtmosphere | null = null;
  private enzymeComplex: RealisticEnzymeComplex | null = null;
  private interactiveMoleculesGroup = new THREE.Group();
  private holoUIGroup = new THREE.Group();

  // Floating molecular groups in cytoplasm
  private atpMolecules: THREE.Group[] = [];
  private waterMolecules: THREE.Group[] = [];
  private ionParticles: THREE.Points | null = null;
  private warpParticles: THREE.Points | null = null;

  // Subunit morphing & allosteric conformation
  private currentConformation = 0; // 0 = normal open, 1 = allosteric distorted
  private targetConformation = 0;

  // High-fidelity Ligands
  private substrateMesh: THREE.Group | null = null;
  private decoySubstrateMesh: THREE.Group | null = null;
  private compInhibitorMesh: THREE.Group | null = null;
  private nonCompInhibitorMesh: THREE.Group | null = null;
  private product1Mesh: THREE.Group | null = null;
  private product2Mesh: THREE.Group | null = null;
  private reactionRate = 0; // 0 to 100%

  // State
  private currentScene: SceneId = 'scene1_lab';
  private vrMode: VRMode = 'desktop';
  private clock = new THREE.Clock();
  private isDestroyed = false;

  // Camera animation / transition
  private targetCameraPos = new THREE.Vector3(0, 1.6, 2.5);
  private targetCameraLookAt = new THREE.Vector3(0, 1.45, 0);
  private currentCameraLookAt = new THREE.Vector3(0, 1.45, 0);
  private transitionProgress = 0;
  private isTransitioning = false;

  // Mouse / Drag controls for Desktop / Cardboard / Touch
  private isPointerDown = false;
  private isDraggingSubstrate = false;
  private draggedObject: THREE.Object3D | null = null;
  private dragPlane = new THREE.Plane();
  private dragIntersection = new THREE.Vector3();
  private initialPointerPos = { x: 0, y: 0 };
  private previousPointerPos = { x: 0, y: 0 };
  private substrateRestPos = new THREE.Vector3(-0.65, 0.85, 1.4);
  private decoyRestPos = new THREE.Vector3(0.65, 0.85, 1.4);
  private productVelocity1 = new THREE.Vector3(-0.8, 0.6, 0.5);
  private productVelocity2 = new THREE.Vector3(0.8, 0.6, 0.5);

  // Scene 3: Competitive Inhibition with Statin Medicine Bottle & Swarm
  private medicineBottleMesh: THREE.Group | null = null;
  private statinDrugRestPos = new THREE.Vector3(1.15, 0.95, 1.2);
  private isDrugLockedInActiveSite = false;
  private isDrugDisplaced = false;
  private substrateConcentration = 10;
  private extraSubstrates: THREE.Group[] = [];
  private extraSubstratesGroup = new THREE.Group();
  private drugEjectVelocity = new THREE.Vector3(1.4, 0.9, 0.6);
  private isDrugEjecting = false;
  private repulsionShieldMesh: THREE.Mesh | null = null;

  // Scene 4: Non-Competitive Allosteric Inhibition & Conformational Morph
  private allostericDrugRestPos = new THREE.Vector3(-1.15, 0.95, 1.2); // Player's left side!
  private isAllostericDrugBound = false;
  private scene4Step: 'await_allosteric_drug' | 'drug_bound_distorted' | 'substrate_tested_clash' | 'concentration_tested' = 'await_allosteric_drug';

  // Scene 5: Dual Panoramic Comparison Models & Fireworks Celebration
  private dualComparisonGroup = new THREE.Group();
  private compDualModel: RealisticEnzymeComplex | null = null;
  private nonCompDualModel: RealisticEnzymeComplex | null = null;
  private fireworksGroup = new THREE.Group();
  private fireworksParticles: THREE.Points | null = null;
  private fireworksVelocities: THREE.Vector3[] = [];
  private fireworksDuration = 0;

  private cameraSpherical = { radius: 2.8, theta: 0, phi: Math.PI / 2.2 };
  private onSceneChangeCallback?: (scene: SceneId) => void;
  private onUIActionCallback?: (action: string) => void;
  private onReactionRateCallback?: (rate: number, status?: string) => void;

  // Holographic 3D buttons in Scene 1 & interactive molecules
  private interactive3DObjects: THREE.Object3D[] = [];

  constructor(
    container: HTMLElement, 
    options?: {
      onSceneChange?: (scene: SceneId) => void;
      onUIAction?: (action: string) => void;
      onReactionRateChange?: (rate: number, status?: string) => void;
    }
  ) {
    this.container = container;
    this.onSceneChangeCallback = options?.onSceneChange;
    this.onUIActionCallback = options?.onUIAction;
    this.onReactionRateCallback = options?.onReactionRateChange;

    // 1. Renderer Initialization (AAA PBR Pipeline)
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      alpha: true,
    });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    this.renderer.xr.enabled = true;

    container.appendChild(this.renderer.domElement);

    // 2. Scene & Studio PMREM Environment Map
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x060919);
    this.scene.fog = new THREE.FogExp2(0x060919, 0.038);

    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    pmremGenerator.compileEquirectangularShader();
    const roomEnv = new RoomEnvironment();
    this.scene.environment = pmremGenerator.fromScene(roomEnv, 0.04).texture;
    pmremGenerator.dispose();

    // 3. Camera & XR Rig
    this.camera = new THREE.PerspectiveCamera(
      62,
      container.clientWidth / container.clientHeight,
      0.05,
      120
    );
    this.camera.position.set(0, 1.6, 2.5);

    this.xrCameraGroup = new THREE.Group();
    this.xrCameraGroup.add(this.camera);
    this.scene.add(this.xrCameraGroup);

    // 4. Post-processing Composer with Bokeh Depth of Field
    this.composer = new EffectComposer(this.renderer);
    const renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(renderPass);

    this.bokehPass = new BokehPass(this.scene, this.camera, {
      focus: 2.6,
      aperture: 0.006, // initial sharp aperture
      maxblur: 0.014,
    });
    this.composer.addPass(this.bokehPass);

    const outputPass = new OutputPass();
    this.composer.addPass(outputPass);

    // 5. Studio Lighting Rig
    this.setupLighting();

    // 6. Build Sub-Scenes
    this.labObjects = createPhotorealisticLab();
    this.scene.add(this.labObjects.group);

    this.scene.add(this.membraneTunnelGroup);
    this.scene.add(this.cytoplasmGroup);
    this.scene.add(this.interactiveMoleculesGroup);
    this.scene.add(this.holoUIGroup);
    this.scene.add(this.fireworksGroup);

    this.buildHolo3DPanel();
    this.buildMembraneTransition();
    this.buildCytoplasmEnvironment();
    this.buildPhotorealisticEnzyme();
    this.buildDualComparisonModels();
    this.buildPhotorealisticLigands();
    this.setupWebXRControllers();

    // 7. Bind Event Listeners
    this.bindEvents();

    // 8. Start Render Loop
    this.renderer.setAnimationLoop(this.render.bind(this));
  }

  // Depth of field toggle
  public toggleDepthOfField(): boolean {
    this.isDepthOfFieldEnabled = !this.isDepthOfFieldEnabled;
    return this.isDepthOfFieldEnabled;
  }

  public getDepthOfField(): boolean {
    return this.isDepthOfFieldEnabled;
  }

  // -------------------------------------------------------------
  // Balanced 3-Point Lighting Rig
  // -------------------------------------------------------------
  private setupLighting() {
    const hemiLight = new THREE.HemisphereLight(0x7dd3fc, 0x1e1035, 1.15);
    this.scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfff7ed, 2.3);
    keyLight.position.set(4, 7, 5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.bias = -0.0004;
    keyLight.shadow.normalBias = 0.02;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 20;
    this.scene.add(keyLight);

    const rimLight = new THREE.PointLight(0x00f0ff, 4.2, 15);
    rimLight.position.set(-4, 3.5, -2);
    this.scene.add(rimLight);

    const magentaLight = new THREE.PointLight(0xff007f, 3.5, 12);
    magentaLight.position.set(3, 2, -1);
    this.scene.add(magentaLight);
  }

  // -------------------------------------------------------------
  // Holographic 3D Floating UI Panel (Scene 1)
  // -------------------------------------------------------------
  private buildHolo3DPanel() {
    this.holoUIGroup.position.set(0, 1.45, 0.85);

    const panelGeo = new THREE.PlaneGeometry(1.8, 1.15);
    const panelMat = new THREE.MeshPhysicalMaterial({
      color: 0x07152d,
      transmission: 0.65,
      opacity: 0.85,
      transparent: true,
      roughness: 0.1,
      metalness: 0.25,
      ior: 1.42,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const panel = new THREE.Mesh(panelGeo, panelMat);
    this.holoUIGroup.add(panel);

    const borderEdges = new THREE.EdgesGeometry(panelGeo);
    const borderMat = new THREE.LineBasicMaterial({
      color: 0x00f0ff,
      linewidth: 2,
    });
    const borderLine = new THREE.LineSegments(borderEdges, borderMat);
    this.holoUIGroup.add(borderLine);

    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 650;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = 'rgba(5, 14, 32, 0.96)';
    ctx.fillRect(0, 0, 1024, 650);

    const grad = ctx.createLinearGradient(0, 0, 1024, 0);
    grad.addColorStop(0, '#00f0ff');
    grad.addColorStop(0.5, '#8b5cf6');
    grad.addColorStop(1, '#00f0ff');
    ctx.fillStyle = grad;
    ctx.fillRect(40, 28, 944, 4);

    ctx.font = '600 24px monospace';
    ctx.fillStyle = '#00f0ff';
    ctx.fillText('VIRTUAL BIOCHEMICAL LAB · VR 交互课件 (胶体流体微观环境)', 50, 72);

    ctx.font = 'bold 44px sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('《微观视界：酶的抑制与药物靶向》', 50, 130);

    ctx.font = '500 22px sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('核心议题：竞争性与非竞争性抑制机制 · 菲涅尔生物荧光与动态景深', 50, 175);

    ctx.strokeStyle = 'rgba(0, 240, 255, 0.35)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(50, 205);
    ctx.lineTo(974, 205);
    ctx.stroke();

    ctx.fillStyle = 'rgba(0, 240, 255, 0.08)';
    ctx.fillRect(50, 225, 924, 160);
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.4)';
    ctx.strokeRect(50, 225, 924, 160);

    ctx.font = '600 22px sans-serif';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText('📌 场景一：引导与进入微观世界 (肝细胞纳米尺度跃迁)', 75, 270);

    ctx.font = '400 20px sans-serif';
    ctx.fillStyle = '#cbd5e1';
    ctx.fillText('• 沉浸式第一视角：置身未来生化实验室，手柄射线或触控交互', 75, 310);
    ctx.fillText('• 纳米级光子穿梭：穿透肝细胞膜磷脂双分子层，抵达胶体基质微观空间', 75, 350);

    ctx.font = '500 18px monospace';
    ctx.fillStyle = '#34d399';
    ctx.fillText('✔ 适配硬件：Pico 4 / Meta Quest 2/3 / PC VR双手柄 / 动态电影级景深 / 桌面3D', 50, 420);

    ctx.fillStyle = '#0284c7';
    ctx.fillRect(160, 465, 310, 80);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;
    ctx.strokeRect(160, 465, 310, 80);
    ctx.font = 'bold 30px sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('🚀 开始体验', 225, 517);

    ctx.fillStyle = '#312e81';
    ctx.fillRect(550, 465, 310, 80);
    ctx.strokeStyle = '#818cf8';
    ctx.lineWidth = 3;
    ctx.strokeRect(550, 465, 310, 80);
    ctx.font = 'bold 30px sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('📖 操作指引', 615, 517);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = this.renderer.capabilities.getMaxAnisotropy();

    const screenMat = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      side: THREE.DoubleSide,
    });
    const screenMesh = new THREE.Mesh(new THREE.PlaneGeometry(1.78, 1.13), screenMat);
    screenMesh.position.z = 0.005;
    this.holoUIGroup.add(screenMesh);

    const btnStartGeo = new THREE.BoxGeometry(0.55, 0.16, 0.06);
    const btnStartMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.01 });
    const btnStartMesh = new THREE.Mesh(btnStartGeo, btnStartMat);
    btnStartMesh.position.set(-0.35, -0.22, 0.02);
    btnStartMesh.name = 'BTN_START_EXPERIENCE';
    this.holoUIGroup.add(btnStartMesh);
    this.interactive3DObjects.push(btnStartMesh);

    const btnGuideMesh = new THREE.Mesh(btnStartGeo, btnStartMat.clone());
    btnGuideMesh.position.set(0.35, -0.22, 0.02);
    btnGuideMesh.name = 'BTN_GUIDE';
    this.holoUIGroup.add(btnGuideMesh);
    this.interactive3DObjects.push(btnGuideMesh);
  }

  // -------------------------------------------------------------
  // Membrane Transition Tunnel (Prompt: 穿梭粒子特效与细胞膜)
  // -------------------------------------------------------------
  private buildMembraneTransition() {
    this.membraneTunnelGroup.visible = false;
    this.membraneTunnelGroup.position.set(0, 0, -10);

    const particleCount = 2200;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const radius = 0.75 + Math.random() * 2.8;
      const angle = Math.random() * Math.PI * 2;
      const z = (Math.random() - 0.5) * 35;

      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = Math.sin(angle) * radius;
      positions[i * 3 + 2] = z;

      const t = Math.random();
      colors[i * 3] = t * 0.1;
      colors[i * 3 + 1] = t * 0.95 + 0.05;
      colors[i * 3 + 2] = 1.0;
    }

    const warpGeo = new THREE.BufferGeometry();
    warpGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    warpGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const warpMat = new THREE.PointsMaterial({
      size: 0.09,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this.warpParticles = new THREE.Points(warpGeo, warpMat);
    this.membraneTunnelGroup.add(this.warpParticles);

    // Realistic Fluid Mosaic Phospholipid Bilayer
    const lipidGroup = new THREE.Group();
    const headCount = 450;
    const headGeo = new THREE.SphereGeometry(0.12, 12, 12);
    const headMat = new THREE.MeshPhysicalMaterial({
      color: 0x38bdf8,
      roughness: 0.25,
      metalness: 0.35,
      clearcoat: 0.5,
      emissive: 0x0284c7,
      emissiveIntensity: 0.35,
    });
    const headsInstanced = new THREE.InstancedMesh(headGeo, headMat, headCount * 2);

    const dummy = new THREE.Object3D();
    let idx = 0;
    for (let x = -11; x <= 11; x++) {
      for (let y = -11; y <= 11; y++) {
        if (Math.hypot(x, y) < 1.3) continue;
        if (idx >= headCount) break;

        dummy.position.set(x * 0.28, y * 0.28, -0.65);
        dummy.scale.setScalar(0.95 + Math.random() * 0.2);
        dummy.updateMatrix();
        headsInstanced.setMatrixAt(idx, dummy.matrix);

        dummy.position.set(x * 0.28, y * 0.28, 0.65);
        dummy.updateMatrix();
        headsInstanced.setMatrixAt(idx + headCount, dummy.matrix);
        idx++;
      }
    }
    headsInstanced.instanceMatrix.needsUpdate = true;
    headsInstanced.computeBoundingSphere();
    lipidGroup.add(headsInstanced);

    const channelGeo = new THREE.CylinderGeometry(1.25, 1.25, 1.8, 32, 1, true);
    const channelMat = new THREE.MeshPhysicalMaterial({
      color: 0x9333ea,
      roughness: 0.3,
      metalness: 0.4,
      clearcoat: 0.6,
      side: THREE.DoubleSide,
    });
    const channelPore = new THREE.Mesh(channelGeo, channelMat);
    channelPore.rotation.x = Math.PI / 2;
    lipidGroup.add(channelPore);

    this.membraneTunnelGroup.add(lipidGroup);
  }

  // -------------------------------------------------------------
  // Photorealistic Cytoplasm Environment with Colloidal Atmosphere
  // -------------------------------------------------------------
  private buildCytoplasmEnvironment() {
    this.cytoplasmGroup.position.set(0, 0, -25);
    this.cytoplasmGroup.visible = false;

    // 1. Colloidal Fluid Background Dome & Microtrabecular Meshwork
    this.cytosolAtmosphere = createCytosolAtmosphere();
    this.cytoplasmGroup.add(this.cytosolAtmosphere.group);

    // 2. Microtubule Network (Cytoskeleton)
    for (let m = 0; m < 5; m++) {
      const mt = createRealisticMicrotubule(20);
      mt.position.set((m - 2) * 5.5, -2 + (m % 3) * 1.8, -4 + (m % 2) * 6);
      mt.rotation.set(0.3 + (m % 2) * 0.4, (m * 0.6), 0.2);
      this.cytoplasmGroup.add(mt);
    }

    // 3. Endoplasmic Reticulum (ER Sheets + Ribosomes)
    const er = createEndoplasmicReticulum();
    this.cytoplasmGroup.add(er);

    // 4. Photorealistic ATP Molecules
    for (let i = 0; i < 18; i++) {
      const atp = createRealisticATP();
      atp.position.set(
        (Math.random() - 0.5) * 14,
        0.5 + (Math.random() - 0.5) * 7,
        (Math.random() - 0.5) * 12
      );
      atp.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
      atp.scale.setScalar(0.48);
      this.cytoplasmGroup.add(atp);
      this.atpMolecules.push(atp);
    }

    // 5. Water Molecules
    const h2oMatO = new THREE.MeshPhysicalMaterial({ color: 0xef4444, roughness: 0.2, transmission: 0.4, clearcoat: 0.9 });
    const h2oMatH = new THREE.MeshPhysicalMaterial({ color: 0xf8fafc, roughness: 0.15, transmission: 0.3, clearcoat: 0.9 });

    for (let i = 0; i < 40; i++) {
      const h2o = new THREE.Group();
      const o = new THREE.Mesh(new THREE.SphereGeometry(0.2, 12, 12), h2oMatO);
      h2o.add(o);

      const h1 = new THREE.Mesh(new THREE.SphereGeometry(0.11, 8, 8), h2oMatH);
      h1.position.set(0.24, 0.18, 0);
      const h2 = new THREE.Mesh(new THREE.SphereGeometry(0.11, 8, 8), h2oMatH);
      h2.position.set(-0.24, 0.18, 0);
      h2o.add(h1, h2);

      h2o.position.set((Math.random() - 0.5) * 16, (Math.random() - 0.5) * 9 + 1, (Math.random() - 0.5) * 14);
      h2o.scale.setScalar(0.28);
      this.cytoplasmGroup.add(h2o);
      this.waterMolecules.push(h2o);
    }

    // 6. Floating Ions Points
    const ionCount = 350;
    const ionPositions = new Float32Array(ionCount * 3);
    const ionColors = new Float32Array(ionCount * 3);

    for (let i = 0; i < ionCount; i++) {
      ionPositions[i * 3] = (Math.random() - 0.5) * 20;
      ionPositions[i * 3 + 1] = (Math.random() - 0.5) * 12 + 1;
      ionPositions[i * 3 + 2] = (Math.random() - 0.5) * 20;

      const type = Math.random();
      if (type < 0.33) {
        ionColors[i * 3] = 0.2; ionColors[i * 3 + 1] = 0.8; ionColors[i * 3 + 2] = 1.0;
      } else if (type < 0.66) {
        ionColors[i * 3] = 1.0; ionColors[i * 3 + 1] = 0.9; ionColors[i * 3 + 2] = 0.2;
      } else {
        ionColors[i * 3] = 0.3; ionColors[i * 3 + 1] = 1.0; ionColors[i * 3 + 2] = 0.5;
      }
    }

    const ionGeo = new THREE.BufferGeometry();
    ionGeo.setAttribute('position', new THREE.BufferAttribute(ionPositions, 3));
    ionGeo.setAttribute('color', new THREE.BufferAttribute(ionColors, 3));

    const ionMat = new THREE.PointsMaterial({
      size: 0.07,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this.ionParticles = new THREE.Points(ionGeo, ionMat);
    this.cytoplasmGroup.add(this.ionParticles);
  }

  // -------------------------------------------------------------
  // Photorealistic Enzyme Macromolecule Complex with Fresnel Sheen
  // -------------------------------------------------------------
  private buildPhotorealisticEnzyme() {
    this.enzymeComplex = createRealisticEnzyme();
    this.enzymeComplex.group.position.set(0, 1.4, -25);
    this.enzymeComplex.group.visible = false;
    this.scene.add(this.enzymeComplex.group);
  }

  // -------------------------------------------------------------
  // Scene 5: Dual Panoramic Comparison Models (Left: Competitive, Right: Non-Competitive)
  // -------------------------------------------------------------
  private buildDualComparisonModels() {
    this.dualComparisonGroup = new THREE.Group();
    this.dualComparisonGroup.name = 'SCENE5_DUAL_COMPARISON_GROUP';
    this.dualComparisonGroup.visible = false;

    // 1. Left Side: Competitive Model (他汀类药物抢占活性中心)
    this.compDualModel = createRealisticEnzyme();
    this.compDualModel.group.position.set(-2.5, 1.35, -25);
    this.compDualModel.group.scale.setScalar(0.85);

    // Lock red statin drug into active site pocket
    const compDrug = createRealisticCompetitiveDrug();
    compDrug.position.set(0, 0.58, 0.52);
    this.compDualModel.group.add(compDrug);

    // Rate gauge
    if (this.compDualModel.rateGauge) {
      this.compDualModel.rateGauge.setVisible(true);
      this.compDualModel.rateGauge.setRate(20, '★ 竞争性抑制 · Vmax不变 · Km增大');
    }

    // 3D Billboard above left model
    const compBillboard = createSubstrateBillboard(
      '【竞争性抑制模型】',
      '★ 抢占活性中心 · 底物被排斥 · 可加大底物逆转',
      '#ef4444',
      '#fecaca'
    );
    compBillboard.position.set(0, 2.15, 0);
    this.compDualModel.group.add(compBillboard);

    this.dualComparisonGroup.add(this.compDualModel.group);

    // 2. Right Side: Non-Competitive Model (别构调节结合导致构象失活)
    this.nonCompDualModel = createRealisticEnzyme();
    this.nonCompDualModel.group.position.set(2.5, 1.35, -25);
    this.nonCompDualModel.group.scale.setScalar(0.85);

    // Distort its active site
    if (this.nonCompDualModel.activeSitePocket) {
      this.nonCompDualModel.activeSitePocket.scale.set(0.55, 0.38, 1.0);
    }

    // Lock blue allosteric drug into lateral allosteric cleft
    const allostericDrug = createRealisticNonCompetitiveDrug();
    allostericDrug.position.set(1.4, 0.55, 0.3);
    this.nonCompDualModel.group.add(allostericDrug);

    // Rate gauge
    if (this.nonCompDualModel.rateGauge) {
      this.nonCompDualModel.rateGauge.setVisible(true);
      this.nonCompDualModel.rateGauge.setRate(10, '★ 非竞争性抑制 · Vmax降低 · Km不变');
    }

    // 3D Billboard above right model
    const nonCompBillboard = createSubstrateBillboard(
      '【非竞争性抑制模型】',
      '★ 别构位点结合 · 构象畸变失活 · 加大底物无效',
      '#38bdf8',
      '#bae6fd'
    );
    nonCompBillboard.position.set(0, 2.15, 0);
    this.nonCompDualModel.group.add(nonCompBillboard);

    this.dualComparisonGroup.add(this.nonCompDualModel.group);
    this.scene.add(this.dualComparisonGroup);
  }

  // 3D Celebratory Fireworks Particles for Correct Answers and Completion
  public triggerFireworks() {
    while (this.fireworksGroup.children.length > 0) {
      const child = this.fireworksGroup.children[0];
      this.fireworksGroup.remove(child);
    }
    this.fireworksVelocities = [];

    const particleCount = 280;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const palette = [
      new THREE.Color(0x10b981), // Emerald
      new THREE.Color(0xfacc15), // Gold
      new THREE.Color(0x38bdf8), // Cyan
      new THREE.Color(0xec4899), // Magenta
      new THREE.Color(0xa855f7), // Purple
      new THREE.Color(0xffffff), // White spark
    ];

    const origin = new THREE.Vector3(0, 2.2, -23.5);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = origin.x;
      positions[i * 3 + 1] = origin.y;
      positions[i * 3 + 2] = origin.z;

      const phi = Math.random() * Math.PI * 2;
      const theta = Math.acos(Math.random() * 2 - 1);
      const speed = 1.2 + Math.random() * 2.8;

      const vel = new THREE.Vector3(
        Math.sin(theta) * Math.cos(phi) * speed,
        Math.sin(theta) * Math.sin(phi) * speed + 0.8,
        Math.cos(theta) * speed
      );
      this.fireworksVelocities.push(vel);

      const color = palette[Math.floor(Math.random() * palette.length)];
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const mat = new THREE.PointsMaterial({
      size: 0.14,
      vertexColors: true,
      transparent: true,
      opacity: 1.0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    this.fireworksParticles = new THREE.Points(geo, mat);
    this.fireworksGroup.add(this.fireworksParticles);
    this.fireworksDuration = 2.2;
  }

  // -------------------------------------------------------------
  // Photorealistic Small Molecule Ligands (CPK Ball-and-Stick)
  // -------------------------------------------------------------
  private buildPhotorealisticLigands() {
    this.interactiveMoleculesGroup.position.set(0, 1.4, -25);
    this.interactiveMoleculesGroup.visible = false;

    this.substrateMesh = createRealisticSubstrate();
    this.substrateMesh.name = 'CORRECT_SUBSTRATE';
    this.substrateMesh.position.set(-0.65, 0.85, 1.4);
    this.interactiveMoleculesGroup.add(this.substrateMesh);
    this.interactive3DObjects.push(this.substrateMesh);

    this.decoySubstrateMesh = createDecoySubstrate();
    this.decoySubstrateMesh.name = 'DECOY_SUBSTRATE';
    this.decoySubstrateMesh.position.set(0.65, 0.85, 1.4);
    this.interactiveMoleculesGroup.add(this.decoySubstrateMesh);
    this.interactive3DObjects.push(this.decoySubstrateMesh);

    // Medicine Bottle on player's right in Scene 3
    this.medicineBottleMesh = createMedicineBottle();
    this.medicineBottleMesh.position.set(1.4, 0.45, 1.25);
    this.medicineBottleMesh.rotation.y = -Math.PI * 0.28;
    this.medicineBottleMesh.visible = false;
    this.interactiveMoleculesGroup.add(this.medicineBottleMesh);

    // Statin Drug Molecule (Bright Red, competitive inhibitor)
    this.compInhibitorMesh = createRealisticCompetitiveDrug();
    this.compInhibitorMesh.name = 'COMPETITIVE_DRUG';
    this.compInhibitorMesh.position.copy(this.statinDrugRestPos);
    this.interactiveMoleculesGroup.add(this.compInhibitorMesh);
    this.interactive3DObjects.push(this.compInhibitorMesh);

    // Substrate Swarm for Concentration Adjustment Experiment (Scene 3)
    this.interactiveMoleculesGroup.add(this.extraSubstratesGroup);
    for (let i = 0; i < 24; i++) {
      const extraSub = createRealisticSubstrate();
      extraSub.scale.setScalar(0.65 + Math.random() * 0.25);
      const phi = Math.random() * Math.PI * 2;
      const theta = Math.random() * Math.PI;
      const rad = 0.95 + Math.random() * 1.5;
      extraSub.position.set(
        Math.sin(theta) * Math.cos(phi) * rad,
        0.58 + Math.cos(theta) * (rad * 0.7),
        0.52 + Math.sin(theta) * Math.sin(phi) * rad
      );
      extraSub.visible = false;
      this.extraSubstrates.push(extraSub);
      this.extraSubstratesGroup.add(extraSub);
    }

    this.nonCompInhibitorMesh = createRealisticNonCompetitiveDrug();
    this.nonCompInhibitorMesh.name = 'NON_COMPETITIVE_DRUG';
    this.nonCompInhibitorMesh.position.copy(this.allostericDrugRestPos);
    this.interactiveMoleculesGroup.add(this.nonCompInhibitorMesh);
    this.interactive3DObjects.push(this.nonCompInhibitorMesh);

    const products = createRealisticProducts();
    this.product1Mesh = products.p1;
    this.product2Mesh = products.p2;
    this.product1Mesh.visible = false;
    this.product2Mesh.visible = false;
    this.interactiveMoleculesGroup.add(this.product1Mesh, this.product2Mesh);

    // 3D Red Physical Collision Barrier Layer (Prompt: 红色的物理碰撞层)
    const shieldGeo = new THREE.RingGeometry(0.12, 0.58, 32);
    const shieldMat = new THREE.MeshBasicMaterial({
      color: 0xef4444,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this.repulsionShieldMesh = new THREE.Mesh(shieldGeo, shieldMat);
    this.repulsionShieldMesh.position.set(0, 0.58, 0.65);
    this.repulsionShieldMesh.visible = false;
    this.interactiveMoleculesGroup.add(this.repulsionShieldMesh);
  }

  // -------------------------------------------------------------
  // WebXR Controllers & Hands
  // -------------------------------------------------------------
  private setupWebXRControllers() {
    this.controller1 = this.renderer.xr.getController(0);
    this.controller1.addEventListener('selectstart', () => this.handleXRTrigger(0, true));
    this.controller1.addEventListener('selectend', () => this.handleXRTrigger(0, false));
    this.xrCameraGroup.add(this.controller1);

    const rayGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 0, -3),
    ]);
    const rayMat = new THREE.LineBasicMaterial({
      color: 0x00f0ff,
      linewidth: 3,
      transparent: true,
      opacity: 0.8,
    });
    const rayLine1 = new THREE.Line(rayGeo, rayMat);
    this.controller1.add(rayLine1);

    this.controller2 = this.renderer.xr.getController(1);
    this.controller2.addEventListener('selectstart', () => this.handleXRTrigger(1, true));
    this.controller2.addEventListener('selectend', () => this.handleXRTrigger(1, false));
    this.xrCameraGroup.add(this.controller2);

    const rayLine2 = new THREE.Line(rayGeo, rayMat.clone());
    this.controller2.add(rayLine2);

    this.controllerGrip1 = this.renderer.xr.getControllerGrip(0);
    this.controllerGrip1.add(this.createControllerModel());
    this.xrCameraGroup.add(this.controllerGrip1);

    this.controllerGrip2 = this.renderer.xr.getControllerGrip(1);
    this.controllerGrip2.add(this.createControllerModel());
    this.xrCameraGroup.add(this.controllerGrip2);
  }

  private createControllerModel(): THREE.Group {
    const group = new THREE.Group();
    const handleGeo = new THREE.CylinderGeometry(0.02, 0.025, 0.18, 16);
    const handleMat = new THREE.MeshPhysicalMaterial({
      color: 0x1e293b,
      metalness: 0.9,
      roughness: 0.2,
      clearcoat: 0.5,
    });
    const handle = new THREE.Mesh(handleGeo, handleMat);
    handle.rotation.x = Math.PI / 4;
    group.add(handle);

    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.035, 0.008, 16, 24),
      new THREE.MeshBasicMaterial({ color: 0x00f0ff })
    );
    ring.position.set(0, 0.08, -0.08);
    group.add(ring);

    return group;
  }

  private findInteractiveTarget(obj: THREE.Object3D): THREE.Object3D | null {
    let curr: THREE.Object3D | null = obj;
    while (curr) {
      if (
        curr.name === 'CORRECT_SUBSTRATE' ||
        curr.name === 'DECOY_SUBSTRATE' ||
        curr.name === 'COMPETITIVE_DRUG' ||
        curr.name === 'BTN_START_EXPERIENCE' ||
        curr.name === 'BTN_GUIDE'
      ) {
        return curr;
      }
      curr = curr.parent;
    }
    return null;
  }

  private handleXRTrigger(controllerIndex: number, isPressed: boolean) {
    if (!isPressed) return;
    soundManager.playClickSFX();

    const controller = controllerIndex === 0 ? this.controller1 : this.controller2;
    if (!controller) return;

    const tempMatrix = new THREE.Matrix4();
    tempMatrix.identity().extractRotation(controller.matrixWorld);

    this.raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
    this.raycaster.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix);

    const intersects = this.raycaster.intersectObjects(this.interactive3DObjects, true);
    if (intersects.length > 0) {
      const hitObj = intersects[0].object;
      const target = this.findInteractiveTarget(hitObj);
      if (target) {
        this.triggerUIAction(target.name);
      }
    }
  }

  // -------------------------------------------------------------
  // Pointer & Window Events
  // -------------------------------------------------------------
  private bindEvents() {
    const el = this.container;
    el.addEventListener('pointerdown', this.onPointerDown.bind(this));
    window.addEventListener('pointermove', this.onPointerMove.bind(this));
    window.addEventListener('pointerup', this.onPointerUp.bind(this));
    el.addEventListener('wheel', this.onWheel.bind(this), { passive: true });
    window.addEventListener('resize', this.onWindowResize.bind(this));
  }

  private onPointerDown(e: PointerEvent) {
    this.isPointerDown = true;
    this.previousPointerPos = { x: e.clientX, y: e.clientY };
    this.initialPointerPos = { x: e.clientX, y: e.clientY };

    const rect = this.container.getBoundingClientRect();
    this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.interactive3DObjects, true);

    if (intersects.length > 0) {
      const hitObj = intersects[0].object;
      const target = this.findInteractiveTarget(hitObj);

      if (target) {
        if (
          target.name === 'CORRECT_SUBSTRATE' ||
          target.name === 'DECOY_SUBSTRATE' ||
          target.name === 'COMPETITIVE_DRUG'
        ) {
          this.draggedObject = target;
          this.isDraggingSubstrate = true;
          soundManager.playGrabSFX();

          // Construct drag plane parallel to camera at object's world depth
          const worldPos = new THREE.Vector3();
          target.getWorldPosition(worldPos);
          const camDir = new THREE.Vector3();
          this.camera.getWorldDirection(camDir);
          this.dragPlane.setFromNormalAndCoplanarPoint(camDir.negate(), worldPos);
          return;
        } else {
          soundManager.playClickSFX();
          this.triggerUIAction(target.name);
          return;
        }
      }
    }
  }

  private onPointerMove(e: PointerEvent) {
    const rect = this.container.getBoundingClientRect();

    if (this.isDraggingSubstrate && this.draggedObject) {
      this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      this.raycaster.setFromCamera(this.mouse, this.camera);

      if (this.raycaster.ray.intersectPlane(this.dragPlane, this.dragIntersection)) {
        // Convert world intersection into local coordinates of interactiveMoleculesGroup
        const localPos = this.dragIntersection.clone();
        this.interactiveMoleculesGroup.worldToLocal(localPos);
        this.draggedObject.position.lerp(localPos, 0.45);

        // Check proximity to Active Site Pocket (0, 0.58, 0.52)
        const pocketTarget = new THREE.Vector3(0, 0.58, 0.52);
        const dist = this.draggedObject.position.distanceTo(pocketTarget);

        if (dist < 0.72) {
          const name = this.draggedObject.name;
          this.draggedObject = null;
          this.isDraggingSubstrate = false;

          if (this.currentScene === 'scene3_competitive') {
            if (name === 'COMPETITIVE_DRUG') {
              this.lockStatinDrugIntoActiveSite();
            } else if (name === 'CORRECT_SUBSTRATE') {
              if (this.isDrugLockedInActiveSite && !this.isDrugDisplaced) {
                this.attemptSubstrateDockingWithDrug();
              } else {
                this.animateSubstrateCatalysis();
              }
            }
          } else {
            if (name === 'CORRECT_SUBSTRATE') {
              this.animateSubstrateCatalysis();
            } else {
              this.animateDecoyRejection();
            }
          }
          return;
        }
      }
      return;
    }

    if (!this.isPointerDown) return;
    const deltaX = e.clientX - this.previousPointerPos.x;
    const deltaY = e.clientY - this.previousPointerPos.y;
    this.previousPointerPos = { x: e.clientX, y: e.clientY };

    this.cameraSpherical.theta -= deltaX * 0.005;
    this.cameraSpherical.phi -= deltaY * 0.005;
    this.cameraSpherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, this.cameraSpherical.phi));
  }

  private onPointerUp(e: PointerEvent) {
    if (this.isDraggingSubstrate && this.draggedObject) {
      const moveDist = Math.hypot(e.clientX - this.initialPointerPos.x, e.clientY - this.initialPointerPos.y);
      const target = this.draggedObject;
      this.isDraggingSubstrate = false;
      this.draggedObject = null;

      if (moveDist < 10) {
        // Direct click without large drag -> Trigger action directly
        if (this.currentScene === 'scene3_competitive') {
          if (target.name === 'COMPETITIVE_DRUG') {
            this.lockStatinDrugIntoActiveSite();
          } else if (target.name === 'CORRECT_SUBSTRATE') {
            if (this.isDrugLockedInActiveSite && !this.isDrugDisplaced) {
              this.attemptSubstrateDockingWithDrug();
            } else {
              this.animateSubstrateCatalysis();
            }
          }
        } else if (this.currentScene === 'scene4_noncompetitive') {
          if (target.name === 'NON_COMPETITIVE_DRUG') {
            this.dockAllostericDrug();
          } else if (target.name === 'CORRECT_SUBSTRATE') {
            if (this.isAllostericDrugBound) {
              this.attemptSubstrateDockingInDeformedActiveSite();
            } else {
              this.animateSubstrateCatalysis();
            }
          }
        } else {
          if (target.name === 'CORRECT_SUBSTRATE') {
            this.animateSubstrateCatalysis();
          } else if (target.name === 'DECOY_SUBSTRATE') {
            this.animateDecoyRejection();
          }
        }
      } else {
        // Released without reaching active site -> Spring back smoothly to rest position
        if (target.name === 'CORRECT_SUBSTRATE') {
          target.position.copy(this.substrateRestPos);
        } else if (target.name === 'DECOY_SUBSTRATE') {
          target.position.copy(this.decoyRestPos);
        } else if (target.name === 'COMPETITIVE_DRUG') {
          if (!this.isDrugLockedInActiveSite) {
            target.position.copy(this.statinDrugRestPos);
          }
        } else if (target.name === 'NON_COMPETITIVE_DRUG') {
          if (!this.isAllostericDrugBound) {
            target.position.copy(this.allostericDrugRestPos);
          }
        }
      }
    }

    this.isPointerDown = false;
  }

  private onWheel(e: WheelEvent) {
    this.cameraSpherical.radius += e.deltaY * 0.002;
    this.cameraSpherical.radius = Math.max(1.8, Math.min(7.0, this.cameraSpherical.radius));
  }

  public setCameraDistance(radius: number) {
    this.cameraSpherical.radius = radius;
  }

  public resetToWideView() {
    if (this.currentScene === 'scene1_lab') {
      this.cameraSpherical.radius = 2.6;
      this.cameraSpherical.theta = 0;
      this.cameraSpherical.phi = Math.PI / 2.2;
    } else if (this.currentScene === 'scene5_kinetics') {
      this.cameraSpherical.radius = 4.8;
      this.cameraSpherical.theta = 0;
      this.cameraSpherical.phi = Math.PI / 2.3;
    } else {
      this.cameraSpherical.radius = 4.4; // 远景全貌
      this.cameraSpherical.theta = 0;
      this.cameraSpherical.phi = Math.PI / 2.3;
    }
  }

  public toggleCameraView(): 'wide' | 'closeup' {
    const isCurrentlyWide = this.cameraSpherical.radius >= 3.5;
    if (isCurrentlyWide) {
      this.cameraSpherical.radius = 2.6; // 特写聚焦
      return 'closeup';
    } else {
      this.cameraSpherical.radius = this.currentScene === 'scene1_lab' ? 2.6 : 4.4; // 远景全貌
      return 'wide';
    }
  }

  public isWideView(): boolean {
    return this.cameraSpherical.radius >= 3.5;
  }

  private setBokehUniform(key: string, value: number) {
    const uniforms = this.bokehPass.uniforms as Record<string, { value: number }>;
    if (uniforms && uniforms[key]) {
      uniforms[key].value = value;
    }
  }

  private onWindowResize() {
    if (!this.container) return;
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
    this.composer.setSize(w, h);
    this.setBokehUniform('aspect', w / h);
  }

  private triggerUIAction(actionName: string) {
    if (actionName === 'BTN_START_EXPERIENCE') {
      soundManager.playWarpWhooshSFX();
      this.startMembraneTransition();
      if (this.onUIActionCallback) this.onUIActionCallback('start_experience');
    } else if (actionName === 'BTN_GUIDE') {
      soundManager.playBeepSFX(1200);
      if (this.onUIActionCallback) this.onUIActionCallback('open_guide');
    } else if (actionName === 'CORRECT_SUBSTRATE') {
      if (this.currentScene === 'scene3_competitive') {
        if (this.isDrugLockedInActiveSite && !this.isDrugDisplaced) {
          this.attemptSubstrateDockingWithDrug();
        } else {
          this.animateSubstrateCatalysis();
        }
      } else if (this.currentScene === 'scene4_noncompetitive') {
        if (this.isAllostericDrugBound) {
          this.attemptSubstrateDockingInDeformedActiveSite();
        } else {
          this.animateSubstrateCatalysis();
        }
      } else {
        this.animateSubstrateCatalysis();
      }
    } else if (actionName === 'DECOY_SUBSTRATE') {
      this.animateDecoyRejection();
    } else if (actionName === 'COMPETITIVE_DRUG') {
      this.lockStatinDrugIntoActiveSite();
    } else if (actionName === 'NON_COMPETITIVE_DRUG') {
      this.dockAllostericDrug();
    }
  }

  // -------------------------------------------------------------
  // Scene Progression & Transitions
  // -------------------------------------------------------------
  public setScene(sceneId: SceneId) {
    this.currentScene = sceneId;

    if (sceneId === 'scene1_lab') {
      this.scene.background = new THREE.Color(0x060919);
      this.scene.fog = new THREE.FogExp2(0x060919, 0.038);
      this.setBokehUniform('aperture', 0.005); // sharp in lab

      if (this.labObjects) this.labObjects.group.visible = true;
      this.holoUIGroup.visible = true;
      this.membraneTunnelGroup.visible = false;
      this.cytoplasmGroup.visible = false;
      if (this.enzymeComplex) this.enzymeComplex.group.visible = false;
      this.interactiveMoleculesGroup.visible = false;

      this.targetCameraPos.set(0, 1.6, 2.5);
      this.targetCameraLookAt.set(0, 1.45, 0);
      this.cameraSpherical.radius = 2.5;
      this.cameraSpherical.theta = 0;
      this.cameraSpherical.phi = Math.PI / 2.2;
    } 
    else if (sceneId === 'scene1_transition') {
      this.startMembraneTransition();
    } 
    else {
      // Translucent colloidal fluid atmosphere in cytoplasm
      this.scene.background = new THREE.Color(0x180b33);
      this.scene.fog = new THREE.FogExp2(0x180b33, 0.025);
      this.setBokehUniform('aperture', 0.024); // cinematic macro focal blur

      if (this.labObjects) this.labObjects.group.visible = false;
      this.holoUIGroup.visible = false;
      this.membraneTunnelGroup.visible = false;
      this.cytoplasmGroup.visible = true;

      if (sceneId === 'scene5_kinetics') {
        if (this.enzymeComplex) this.enzymeComplex.group.visible = false;
        this.interactiveMoleculesGroup.visible = false;
        this.targetCameraPos.set(0, 1.8, -19.5);
        this.targetCameraLookAt.set(0, 1.4, -25);
        this.cameraSpherical.radius = 4.8;
        this.cameraSpherical.theta = 0;
        this.cameraSpherical.phi = Math.PI / 2.3;
      } else {
        if (this.enzymeComplex) this.enzymeComplex.group.visible = true;
        this.interactiveMoleculesGroup.visible = true;
        // 自动远景：给整个酶蛋白大分子、结合口袋、游离底物和药瓶充足的观察视野，全貌一览无余
        this.targetCameraPos.set(0, 1.5, -20.6);
        this.targetCameraLookAt.set(0, 1.35, -25);
        this.cameraSpherical.radius = 4.4; // 自动远景（原先 2.7 导致模型过近过大）
        this.cameraSpherical.theta = 0;
        this.cameraSpherical.phi = Math.PI / 2.3;
      }

      this.updateMolecularStateForScene(sceneId);
    }

    if (this.onSceneChangeCallback) {
      this.onSceneChangeCallback(sceneId);
    }
  }

  public startMembraneTransition() {
    this.isTransitioning = true;
    this.transitionProgress = 0;
    if (this.labObjects) this.labObjects.group.visible = true;
    this.holoUIGroup.visible = true;
    this.membraneTunnelGroup.visible = true;
    this.cytoplasmGroup.visible = true;
    if (this.enzymeComplex) this.enzymeComplex.group.visible = true;
    this.interactiveMoleculesGroup.visible = true;

    soundManager.playWarpWhooshSFX();
  }

  private updateMolecularStateForScene(sceneId: SceneId) {
    if (!this.substrateMesh || !this.compInhibitorMesh || !this.nonCompInhibitorMesh) return;

    if (sceneId === 'scene1_cytoplasm') {
      this.targetConformation = 0;
      if (this.enzymeComplex?.rateGauge) this.enzymeComplex.rateGauge.setVisible(false);
      if (this.medicineBottleMesh) this.medicineBottleMesh.visible = false;
      this.extraSubstrates.forEach(s => s.visible = false);
      this.substrateMesh.visible = true;
      if (this.decoySubstrateMesh) this.decoySubstrateMesh.visible = true;
      this.compInhibitorMesh.visible = true;
      this.nonCompInhibitorMesh.visible = true;
      if (this.product1Mesh) this.product1Mesh.visible = false;
      if (this.product2Mesh) this.product2Mesh.visible = false;
    } 
    else if (sceneId === 'scene2_enzyme') {
      this.targetConformation = 0;
      if (this.medicineBottleMesh) this.medicineBottleMesh.visible = false;
      this.extraSubstrates.forEach(s => s.visible = false);
      this.compInhibitorMesh.position.set(-4.0, -2.0, 0);
      this.nonCompInhibitorMesh.position.set(4.0, -2.0, 0);
      if (this.enzymeComplex?.rateGauge) this.enzymeComplex.rateGauge.setVisible(true);
      this.resetScene2Substrates();
    } 
    else if (sceneId === 'scene3_competitive') {
      this.targetConformation = 0;
      if (this.decoySubstrateMesh) this.decoySubstrateMesh.visible = false;
      this.nonCompInhibitorMesh.position.set(4.0, -2.0, 0);
      if (this.enzymeComplex?.rateGauge) {
        this.enzymeComplex.rateGauge.setVisible(true);
      }
      this.resetScene3Competitive();
    } 
    else if (sceneId === 'scene4_noncompetitive') {
      this.targetConformation = 0;
      if (this.decoySubstrateMesh) this.decoySubstrateMesh.visible = false;
      if (this.compInhibitorMesh) this.compInhibitorMesh.visible = false;
      if (this.medicineBottleMesh) this.medicineBottleMesh.visible = false;
      this.resetScene4Noncompetitive();
    } 
    else if (sceneId === 'scene5_kinetics') {
      this.targetConformation = 0;
      if (this.enzymeComplex) this.enzymeComplex.group.visible = false;
      this.interactiveMoleculesGroup.visible = false;
      if (this.medicineBottleMesh) this.medicineBottleMesh.visible = false;
      this.extraSubstrates.forEach(s => s.visible = false);
      if (this.decoySubstrateMesh) this.decoySubstrateMesh.visible = false;
      if (this.repulsionShieldMesh) this.repulsionShieldMesh.visible = false;
      this.dualComparisonGroup.visible = true;
    } else {
      this.dualComparisonGroup.visible = false;
    }
  }

  // Scene 2: Reset substrates to floating position in front of player
  public resetScene2Substrates() {
    if (!this.substrateMesh) return;
    this.reactionRate = 0;
    
    // Reset 3D Overhead Rate Gauge
    if (this.enzymeComplex?.rateGauge) {
      this.enzymeComplex.rateGauge.setRate(0, '等待底物结合 (0%)');
      this.enzymeComplex.rateGauge.setVisible(true);
    }
    if (this.onReactionRateCallback) this.onReactionRateCallback(0, 'idle');

    // Floating in front of player for inspection and grab
    this.substrateMesh.position.copy(this.substrateRestPos);
    this.substrateMesh.rotation.set(0, 0, 0);
    this.substrateMesh.visible = true;

    if (this.decoySubstrateMesh) {
      this.decoySubstrateMesh.position.copy(this.decoyRestPos);
      this.decoySubstrateMesh.rotation.set(0, 0, 0);
      this.decoySubstrateMesh.visible = true;
    }

    if (this.product1Mesh) this.product1Mesh.visible = false;
    if (this.product2Mesh) this.product2Mesh.visible = false;
  }

  // Step A: Dock substrate into active site pocket
  public dockSubstrate() {
    if (!this.substrateMesh) return;
    soundManager.playGrabSFX();
    this.substrateMesh.position.set(0, 0.75, 0.75);

    setTimeout(() => {
      if (this.isDestroyed || !this.substrateMesh) return;
      soundManager.playMagneticSnapSFX();
      this.substrateMesh.position.set(0, 0.58, 0.52);
      this.substrateMesh.rotation.set(0, 0, 0);
      this.targetConformation = 0.35;
      if (this.enzymeComplex?.rateGauge) {
        this.enzymeComplex.rateGauge.setRate(50, '底物精准契合活性中心 · ES复合物生成 (50%)');
      }
      if (this.onReactionRateCallback) this.onReactionRateCallback(50, 'snapping');
    }, 200);
  }

  // Step B: Cleave substrate into products (100% Vmax)
  public cleaveSubstrate() {
    if (!this.substrateMesh) return;
    this.substrateMesh.visible = false;
    this.targetConformation = 0.0;
    soundManager.playReactionSuccessSFX();
    this.reactionRate = 100;
    if (this.enzymeComplex?.rateGauge) {
      this.enzymeComplex.rateGauge.setRate(100, '锁钥催化完成 · 产物释放 (100% Vmax)');
    }
    if (this.onReactionRateCallback) this.onReactionRateCallback(100, 'success');

    if (this.product1Mesh && this.product2Mesh) {
      this.product1Mesh.visible = true;
      this.product2Mesh.visible = true;
      this.product1Mesh.position.set(-0.15, 0.65, 0.55);
      this.product2Mesh.position.set(0.15, 0.65, 0.55);
      this.productVelocity1.set(-0.9, 0.65, 0.5);
      this.productVelocity2.set(0.9, 0.65, 0.5);
    }
  }

  // Animation: Grab correct HMG-CoA substrate -> Magnetic snap into active site -> Cleavage -> 100% Rate
  public animateSubstrateCatalysis() {
    this.dockSubstrate();
    setTimeout(() => {
      this.cleaveSubstrate();
    }, 800);
  }

  // Animation: Mismatched decoy substrate rejected (does not fit lock-and-key cavity)
  public animateDecoyRejection() {
    if (!this.decoySubstrateMesh) return;
    soundManager.playGrabSFX();

    // Move towards active pocket rim
    this.decoySubstrateMesh.position.set(0, 0.72, 0.85);

    setTimeout(() => {
      if (this.isDestroyed || !this.decoySubstrateMesh) return;
      // Clashes & shakes due to steric hindrance
      soundManager.playDockingSFX(false);
      this.decoySubstrateMesh.rotation.z += 0.45;
      this.decoySubstrateMesh.position.set(0.12, 0.75, 0.82);

      if (this.enzymeComplex?.rateGauge) {
        this.enzymeComplex.rateGauge.setRate(0, '空间位阻冲突 · 无法契合 (0%)');
      }
      if (this.onReactionRateCallback) this.onReactionRateCallback(0, 'rejected');

      setTimeout(() => {
        if (this.isDestroyed || !this.decoySubstrateMesh) return;
        // Rejects back to floating spot in front of player
        this.decoySubstrateMesh.position.copy(this.decoyRestPos);
        this.decoySubstrateMesh.rotation.set(0, 0, 0);
      }, 550);
    }, 250);
  }

  // -------------------------------------------------------------
  // Scene 3: Competitive Inhibition Gameplay & Substrate Concentration
  // -------------------------------------------------------------
  public resetScene3Competitive() {
    this.reactionRate = 0;
    this.isDrugLockedInActiveSite = false;
    this.isDrugDisplaced = false;
    this.isDrugEjecting = false;
    this.substrateConcentration = 10;

    if (this.medicineBottleMesh) {
      this.medicineBottleMesh.visible = true;
    }

    if (this.compInhibitorMesh) {
      this.compInhibitorMesh.position.copy(this.statinDrugRestPos);
      this.compInhibitorMesh.rotation.set(0, 0, 0);
      this.compInhibitorMesh.visible = true;
    }

    if (this.substrateMesh) {
      this.substrateMesh.position.copy(this.substrateRestPos);
      this.substrateMesh.rotation.set(0, 0, 0);
      this.substrateMesh.visible = true;
    }

    if (this.decoySubstrateMesh) {
      this.decoySubstrateMesh.visible = false;
    }

    this.extraSubstrates.forEach(s => (s.visible = false));

    if (this.product1Mesh) this.product1Mesh.visible = false;
    if (this.product2Mesh) this.product2Mesh.visible = false;
    if (this.repulsionShieldMesh) this.repulsionShieldMesh.visible = false;

    if (this.enzymeComplex?.rateGauge) {
      this.enzymeComplex.rateGauge.setVisible(true);
      this.enzymeComplex.rateGauge.setRate(0, '等待操作：抓取他汀药物放入活性中心 (0%)');
    }
    if (this.onReactionRateCallback) {
      this.onReactionRateCallback(0, 'scene3_ready');
    }
  }

  // Step 1: Lock red statin drug into active site pocket (0, 0.58, 0.52)
  public lockStatinDrugIntoActiveSite() {
    if (!this.compInhibitorMesh) return;
    soundManager.playGrabSFX();

    // 1. Move towards catalytic pocket
    this.compInhibitorMesh.position.set(0, 0.72, 0.65);

    setTimeout(() => {
      if (this.isDestroyed || !this.compInhibitorMesh) return;
      soundManager.playMagneticSnapSFX();

      // Lock tightly into catalytic pocket cavity (0, 0.58, 0.52)
      this.compInhibitorMesh.position.set(0, 0.58, 0.52);
      this.compInhibitorMesh.rotation.set(0, 0, 0);
      this.isDrugLockedInActiveSite = true;
      this.isDrugDisplaced = false;
      this.isDrugEjecting = false;

      // Rate drops directly to 20% (as specified in user prompt)
      this.reactionRate = 20;
      if (this.enzymeComplex?.rateGauge) {
        this.enzymeComplex.rateGauge.setRate(20, '★ 他汀抢占活性中心 · 死锁阻断 (速率下降至 20%)');
      }
      if (this.onReactionRateCallback) {
        this.onReactionRateCallback(20, 'drug_locked');
      }
    }, 240);
  }

  // Step 2: Attempting to insert substrate while drug is locked -> Physical barrier repel & bounce back
  public attemptSubstrateDockingWithDrug() {
    if (!this.substrateMesh) return;
    soundManager.playGrabSFX();

    // Move substrate near active site
    this.substrateMesh.position.set(0, 0.70, 0.65);

    setTimeout(() => {
      if (this.isDestroyed || !this.substrateMesh) return;

      // Collision! Physically deflected by red drug barrier
      soundManager.playBounceSFX();
      soundManager.playAlertSFX();

      // Trigger 3D red collision barrier flash!
      if (this.repulsionShieldMesh) {
        this.repulsionShieldMesh.visible = true;
        (this.repulsionShieldMesh.material as THREE.MeshBasicMaterial).opacity = 0.95;
        this.repulsionShieldMesh.scale.setScalar(1.0);
      }

      // Recoil bounce physics
      this.substrateMesh.rotation.z += 0.55;
      this.substrateMesh.position.set(-0.25, 0.82, 0.85);

      if (this.enzymeComplex?.rateGauge) {
        this.enzymeComplex.rateGauge.setRate(20, '✖ 活性中心被他汀阻占 · 底物被物理弹开！');
      }
      if (this.onReactionRateCallback) {
        this.onReactionRateCallback(20, 'substrate_repelled');
      }

      // Smoothly spring back to rest position
      setTimeout(() => {
        if (this.isDestroyed || !this.substrateMesh) return;
        this.substrateMesh.position.copy(this.substrateRestPos);
        this.substrateMesh.rotation.set(0, 0, 0);
      }, 400);
    }, 220);
  }

  // Step 3: Substrate Concentration Slider Adjustment (10% to 100%)
  public setSubstrateConcentration(conc: number) {
    this.substrateConcentration = Math.max(10, Math.min(100, conc));
    soundManager.playSliderTickSFX();

    // Adjust swarm of floating substrates
    const visibleCount = Math.round(((this.substrateConcentration - 10) / 90) * this.extraSubstrates.length);
    this.extraSubstrates.forEach((sub, idx) => {
      sub.visible = idx < visibleCount;
    });

    if (this.isDrugLockedInActiveSite && !this.isDrugDisplaced) {
      if (this.substrateConcentration < 80) {
        // Scaled reaction rate as concentration increases
        const dynamicRate = Math.round(20 + ((this.substrateConcentration - 10) / 70) * 35);
        this.reactionRate = dynamicRate;
        if (this.enzymeComplex?.rateGauge) {
          this.enzymeComplex.rateGauge.setRate(dynamicRate, `底物浓度 [S] 增加中 · 结合竞争加剧 (${dynamicRate}%)`);
        }
        if (this.onReactionRateCallback) {
          this.onReactionRateCallback(dynamicRate, 'concentration_raising');
        }
      } else {
        // Human-wave displacement triggered! Overcomes competitive inhibition
        this.isDrugDisplaced = true;
        this.isDrugEjecting = true;
        soundManager.playReactionSuccessSFX();

        // Statin drug flies away, ejected
        this.drugEjectVelocity.set(1.4, 0.9, 0.6);

        // Yellow substrate takes over the active site
        if (this.substrateMesh) {
          this.substrateMesh.position.set(0, 0.58, 0.52);
          this.substrateMesh.rotation.set(0, 0, 0);
        }

        // Reaction rate rebounds to 90%! (Vmax stays constant, Km increased)
        this.reactionRate = 90;
        if (this.enzymeComplex?.rateGauge) {
          this.enzymeComplex.rateGauge.setRate(90, '★ 人海战术逆转抑制！反应速率回升至 90% (Vmax不变，Km增大)');
        }
        if (this.onReactionRateCallback) {
          this.onReactionRateCallback(90, 'displaced_success');
        }
      }
    } else if (this.isDrugDisplaced) {
      // Already displaced, maintain high catalytic rate up to 90%
      const dynamicRate = Math.round(75 + ((this.substrateConcentration - 80) / 20) * 15);
      this.reactionRate = Math.min(90, dynamicRate);
      if (this.enzymeComplex?.rateGauge) {
        this.enzymeComplex.rateGauge.setRate(this.reactionRate, `人海战术维持高催化：${this.reactionRate}% (Vmax 恢复)`);
      }
      if (this.onReactionRateCallback) {
        this.onReactionRateCallback(this.reactionRate, 'displaced_success');
      }
    }
  }

  public animateCompetitiveInhibition() {
    this.resetScene3Competitive();
  }

  // -------------------------------------------------------------
  // Scene 4: Non-Competitive Inhibition & Allosteric Deformation
  // -------------------------------------------------------------
  public resetScene4Noncompetitive() {
    this.reactionRate = 0;
    this.isAllostericDrugBound = false;
    this.targetConformation = 0;
    this.scene4Step = 'await_allosteric_drug';
    this.substrateConcentration = 10;

    if (this.medicineBottleMesh) {
      this.medicineBottleMesh.visible = false;
    }

    if (this.compInhibitorMesh) {
      this.compInhibitorMesh.visible = false;
    }

    if (this.decoySubstrateMesh) {
      this.decoySubstrateMesh.visible = false;
    }

    if (this.product1Mesh) this.product1Mesh.visible = false;
    if (this.product2Mesh) this.product2Mesh.visible = false;
    if (this.repulsionShieldMesh) this.repulsionShieldMesh.visible = false;

    this.extraSubstrates.forEach(s => (s.visible = false));

    // Player's left side: Blue Non-Competitive Drug Molecule
    if (this.nonCompInhibitorMesh) {
      this.nonCompInhibitorMesh.position.copy(this.allostericDrugRestPos);
      this.nonCompInhibitorMesh.rotation.set(0, 0, 0);
      this.nonCompInhibitorMesh.visible = true;
    }

    // Substrate placed at front for testing
    if (this.substrateMesh) {
      this.substrateMesh.position.copy(this.substrateRestPos);
      this.substrateMesh.rotation.set(0, 0, 0);
      this.substrateMesh.visible = true;
    }

    // Overhead Rate Gauge
    if (this.enzymeComplex?.rateGauge) {
      this.enzymeComplex.rateGauge.setVisible(true);
      this.enzymeComplex.rateGauge.setRate(0, '等待操作：将蓝色抑制剂放入酶侧面别构位点 (0%)');
    }
    if (this.onReactionRateCallback) {
      this.onReactionRateCallback(0, 'scene4_ready');
    }
  }

  // Step 1: Place blue drug into allosteric site (1.25, -0.25, 0.4)
  public dockAllostericDrug() {
    if (!this.nonCompInhibitorMesh) return;
    soundManager.playGrabSFX();

    // 1. Move towards lateral allosteric cleft
    this.nonCompInhibitorMesh.position.set(1.1, -0.1, 0.6);

    setTimeout(() => {
      if (this.isDestroyed || !this.nonCompInhibitorMesh) return;
      soundManager.playMagneticSnapSFX();

      // Lock tightly into allosteric cleft
      this.nonCompInhibitorMesh.position.set(1.25, -0.25, 0.4);
      this.nonCompInhibitorMesh.rotation.set(0, -Math.PI / 4, 0);
      this.isAllostericDrugBound = true;
      this.scene4Step = 'drug_bound_distorted';

      // 核心构象动画：瞬间重低音扭曲变形音效 + 整体蛋白质扭曲畸变！
      soundManager.playConformationalDistortionSFX();
      this.targetConformation = 1.0;

      // 反应速率断崖式下跌至 10%
      this.reactionRate = 10;
      if (this.enzymeComplex?.rateGauge) {
        this.enzymeComplex.rateGauge.setRate(10, '★ 别构结合引发构象畸变 · 活性中心狭窄变形 (速率断崖跌至 10%)');
      }
      if (this.onReactionRateCallback) {
        this.onReactionRateCallback(10, 'drug_bound_distorted');
      }
    }, 240);
  }

  // Step 2: Attempting to put substrate into distorted active site -> Clashes & Rejects
  public attemptSubstrateDockingInDeformedActiveSite() {
    if (!this.substrateMesh) return;
    soundManager.playGrabSFX();

    // Move substrate near the distorted catalytic groove
    this.substrateMesh.position.set(0, 0.70, 0.65);

    setTimeout(() => {
      if (this.isDestroyed || !this.substrateMesh) return;

      // 锁孔变形无法契合！锁定警告音 + 空间碰撞排斥音效
      soundManager.playLockWarningSFX();
      soundManager.playBounceSFX();

      // Trigger 3D red collision barrier flash
      if (this.repulsionShieldMesh) {
        this.repulsionShieldMesh.visible = true;
        (this.repulsionShieldMesh.material as THREE.MeshBasicMaterial).opacity = 0.95;
        this.repulsionShieldMesh.scale.setScalar(1.0);
      }

      // Recoil bounce physics
      this.substrateMesh.rotation.z += 0.45;
      this.substrateMesh.position.set(0.18, 0.82, 0.85);

      if (this.enzymeComplex?.rateGauge) {
        this.enzymeComplex.rateGauge.setRate(10, '✖ 活性中心凹槽畸变变形 · 底物完全无法放入！(10%)');
      }
      if (this.onReactionRateCallback) {
        this.onReactionRateCallback(10, 'substrate_tested_clash');
      }
      this.scene4Step = 'substrate_tested_clash';

      // Smoothly spring back to rest position
      setTimeout(() => {
        if (this.isDestroyed || !this.substrateMesh) return;
        this.substrateMesh.position.copy(this.substrateRestPos);
        this.substrateMesh.rotation.set(0, 0, 0);
      }, 420);
    }, 220);
  }

  // Step 3: Substrate Concentration Slider in Scene 4 -> Strictly LOCKED at 10%
  public setSubstrateConcentrationScene4(conc: number) {
    this.substrateConcentration = Math.max(10, Math.min(100, conc));
    soundManager.playSliderTickSFX();

    // Show substrate swarm surrounding the enzyme
    const visibleCount = Math.round(((this.substrateConcentration - 10) / 90) * this.extraSubstrates.length);
    this.extraSubstrates.forEach((sub, idx) => {
      sub.visible = idx < visibleCount;
    });

    // 柱状图上限被锁定在 10%（表明 Vmax 降低，但 Km 不变）
    this.reactionRate = 10;
    if (this.enzymeComplex?.rateGauge) {
      this.enzymeComplex.rateGauge.setRate(
        10,
        `🔒 Vmax上限锁定10% · 加大底物完全无效！([S]=${this.substrateConcentration}%)`
      );
    }
    if (this.onReactionRateCallback) {
      this.onReactionRateCallback(10, 'concentration_locked');
    }
    this.scene4Step = 'concentration_tested';
  }

  public animateNonCompetitiveInhibition() {
    this.dockAllostericDrug();
  }

  public setVRMode(mode: VRMode) {
    this.vrMode = mode;
    if (mode === 'webxr') {
      this.enterWebXR();
    }
  }

  private async enterWebXR() {
    if (!navigator.xr) {
      alert('您的浏览器或设备未检测到 WebXR 支持。请在 Meta Quest、Pico 4 浏览器中打开体验。');
      return;
    }
    try {
      const isSupported = await navigator.xr.isSessionSupported('immersive-vr');
      if (isSupported) {
        const session = await navigator.xr.requestSession('immersive-vr', {
          optionalFeatures: ['local-floor', 'bounded-floor', 'hand-tracking'],
        });
        this.renderer.xr.setSession(session);
      }
    } catch (err) {
      console.error('Failed to request XR session:', err);
    }
  }

  // -------------------------------------------------------------
  // Main Render Loop with Dynamic Focus & DoF
  // -------------------------------------------------------------
  private render() {
    if (this.isDestroyed) return;
    const delta = this.clock.getDelta();
    const elapsedTime = this.clock.getElapsedTime();

    // 1. Transition Warp Camera Interpolation
    if (this.isTransitioning) {
      this.transitionProgress += delta * 0.45;
      const t = Math.min(1.0, this.transitionProgress);
      const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

      this.camera.position.z = THREE.MathUtils.lerp(2.5, -20.6, ease);
      this.camera.position.y = THREE.MathUtils.lerp(1.6, 1.45, ease);

      if (this.warpParticles) {
        this.warpParticles.rotation.z += delta * 4;
      }

      if (this.transitionProgress >= 1.0) {
        this.isTransitioning = false;
        this.setScene('scene1_cytoplasm');
      }
    } else {
      if (!this.renderer.xr.isPresenting) {
        const targetX = this.targetCameraLookAt.x + this.cameraSpherical.radius * Math.sin(this.cameraSpherical.phi) * Math.sin(this.cameraSpherical.theta);
        const targetY = this.targetCameraLookAt.y + this.cameraSpherical.radius * Math.cos(this.cameraSpherical.phi);
        const targetZ = this.targetCameraLookAt.z + this.cameraSpherical.radius * Math.sin(this.cameraSpherical.phi) * Math.cos(this.cameraSpherical.theta);

        this.camera.position.x = THREE.MathUtils.damp(this.camera.position.x, targetX, 5, delta);
        this.camera.position.y = THREE.MathUtils.damp(this.camera.position.y, targetY, 5, delta);
        this.camera.position.z = THREE.MathUtils.damp(this.camera.position.z, targetZ, 5, delta);

        this.currentCameraLookAt.x = THREE.MathUtils.damp(this.currentCameraLookAt.x, this.targetCameraLookAt.x, 5, delta);
        this.currentCameraLookAt.y = THREE.MathUtils.damp(this.currentCameraLookAt.y, this.targetCameraLookAt.y, 5, delta);
        this.currentCameraLookAt.z = THREE.MathUtils.damp(this.currentCameraLookAt.z, this.targetCameraLookAt.z, 5, delta);

        this.camera.lookAt(this.currentCameraLookAt);
      }
    }

    // 2. Animate Lab DNA Hologram in Scene 1
    if (this.labObjects?.group.visible) {
      this.labObjects.dnaHologram.rotation.y += delta * 0.8;
      this.labObjects.energyShield.rotation.y -= delta * 0.3;
    }

    // 3. Update Colloidal Atmosphere in Cytoplasm
    if (this.cytoplasmGroup.visible && this.cytosolAtmosphere) {
      this.cytosolAtmosphere.update(elapsedTime, delta);
    }

    // 4. Animate Enzyme Complex, Allosteric Conformational Ripple & 3D Rate Gauge
    this.currentConformation = THREE.MathUtils.damp(this.currentConformation, this.targetConformation, 3.5, delta);

    if (this.enzymeComplex?.group.visible) {
      this.enzymeComplex.group.rotation.y = Math.sin(elapsedTime * 0.25) * 0.12;
      this.enzymeComplex.group.position.y = 1.4 + Math.sin(elapsedTime * 0.7) * 0.04;

      this.enzymeComplex.subunits.forEach((sub, i) => {
        const breathe = Math.sin(elapsedTime * 1.5 + i * 1.2) * 0.02;
        sub.scale.set(1.0 + breathe, 1.0 - breathe, 1.0 + breathe);
      });

      const pocket = this.enzymeComplex.activeSitePocket;
      const glow = this.enzymeComplex.activeSiteGlowMesh;
      if (pocket && glow) {
        const scaleX = 1.0 - this.currentConformation * 0.48;
        const scaleY = 1.0 - this.currentConformation * 0.62;
        pocket.scale.set(scaleX, scaleY, 1.0);

        _colorA.setRGB(
          THREE.MathUtils.lerp(0.96, 0.48, this.currentConformation),
          THREE.MathUtils.lerp(0.62, 0.12, this.currentConformation),
          THREE.MathUtils.lerp(0.04, 0.12, this.currentConformation)
        );
        (glow.material as THREE.MeshPhysicalMaterial).color.copy(_colorA);

        // Soft pulsating pocket light intensity
        const pocketLight = pocket.children.find(c => c instanceof THREE.PointLight) as THREE.PointLight | undefined;
        if (pocketLight) {
          pocketLight.intensity = 2.8 + Math.sin(elapsedTime * 3.0) * 0.8;
        }

        // Active Site Dashed Billboard facing camera
        const activeLabel = pocket.getObjectByName('ACTIVE_SITE_LABEL_GROUP');
        if (activeLabel) {
          activeLabel.lookAt(this.camera.position);
        }
      }

      // Update 3D Floating Reaction Rate Bar Gauge & face camera
      if (this.enzymeComplex.rateGauge) {
        this.enzymeComplex.rateGauge.updateAnimation(delta);
        this.enzymeComplex.rateGauge.group.lookAt(this.camera.position);
      }

      // Allosteric Site Billboard facing camera
      const allostericBillboard = this.enzymeComplex.allostericPocket?.getObjectByName('ALLOSTERIC_SITE_BILLBOARD');
      if (allostericBillboard) {
        allostericBillboard.lookAt(this.camera.position);
      }
    }

    // 5. Animate ATP & Water Molecules in Cytoplasm
    if (this.cytoplasmGroup.visible) {
      this.atpMolecules.forEach((atp, index) => {
        atp.rotation.x += delta * (0.25 + index * 0.04);
        atp.rotation.y += delta * (0.35 + index * 0.03);
        atp.position.y += Math.sin(elapsedTime * 1.4 + index) * 0.0025;
      });

      this.waterMolecules.forEach((h2o, index) => {
        h2o.rotation.z += delta * 0.7;
        h2o.position.x += Math.cos(elapsedTime * 0.8 + index) * 0.002;
      });

      if (this.ionParticles) {
        this.ionParticles.rotation.y += delta * 0.035;
      }
    }

    // 6. Floating Substrates & Molecules Micro-Gravity Drift
    if (this.medicineBottleMesh?.visible) {
      this.medicineBottleMesh.position.y = 0.45 + Math.sin(elapsedTime * 1.5) * 0.015;
    }

    if (!this.isDraggingSubstrate) {
      if (this.substrateMesh?.visible && !this.isDrugLockedInActiveSite) {
        this.substrateMesh.position.y = this.substrateRestPos.y + Math.sin(elapsedTime * 2.0) * 0.025;
        this.substrateMesh.rotation.y += delta * 0.4;
      }
      if (this.decoySubstrateMesh?.visible) {
        this.decoySubstrateMesh.position.y = this.decoyRestPos.y + Math.cos(elapsedTime * 1.8) * 0.025;
        this.decoySubstrateMesh.rotation.y += delta * 0.35;
      }
      if (this.compInhibitorMesh?.visible) {
        if (this.isDrugEjecting) {
          this.compInhibitorMesh.position.addScaledVector(this.drugEjectVelocity, delta);
          this.compInhibitorMesh.rotation.x += delta * 2.5;
          this.compInhibitorMesh.rotation.y += delta * 3.5;
        } else if (!this.isDrugLockedInActiveSite) {
          this.compInhibitorMesh.position.y = this.statinDrugRestPos.y + Math.sin(elapsedTime * 2.2) * 0.02;
          this.compInhibitorMesh.rotation.y += delta * 0.35;
        }
      }
      if (this.nonCompInhibitorMesh?.visible && !this.isAllostericDrugBound) {
        this.nonCompInhibitorMesh.position.y = this.allostericDrugRestPos.y + Math.sin(elapsedTime * 2.1) * 0.02;
        this.nonCompInhibitorMesh.rotation.y += delta * 0.35;
      }
    }

    // Extra substrate swarm for concentration adjustment
    this.extraSubstrates.forEach((sub, i) => {
      if (sub.visible) {
        sub.rotation.y += delta * (0.5 + i * 0.04);
        sub.position.y += Math.sin(elapsedTime * 2.2 + i * 0.8) * 0.0025;
      }
    });

    // 6b. Red Collision Forcefield Barrier Flash & Fade
    if (this.repulsionShieldMesh && this.repulsionShieldMesh.visible) {
      const mat = this.repulsionShieldMesh.material as THREE.MeshBasicMaterial;
      if (mat.opacity > 0.02) {
        mat.opacity -= delta * 2.2;
        this.repulsionShieldMesh.scale.addScalar(delta * 0.65);
      } else {
        mat.opacity = 0;
        this.repulsionShieldMesh.visible = false;
      }
    }

    // 7. Products Cleavage Drift Animation
    if (this.product1Mesh?.visible && this.product2Mesh?.visible) {
      this.product1Mesh.position.addScaledVector(this.productVelocity1, delta);
      this.product2Mesh.position.addScaledVector(this.productVelocity2, delta);
      this.product1Mesh.rotation.x += delta * 2.0;
      this.product1Mesh.rotation.y += delta * 1.5;
      this.product2Mesh.rotation.x -= delta * 1.8;
      this.product2Mesh.rotation.y += delta * 2.2;
    }

    // 7b. Scene 5: Dual Models subtle breathing & rotation
    if (this.dualComparisonGroup.visible) {
      if (this.compDualModel) {
        this.compDualModel.group.rotation.y = Math.sin(elapsedTime * 0.25) * 0.12;
      }
      if (this.nonCompDualModel) {
        this.nonCompDualModel.group.rotation.y = -Math.sin(elapsedTime * 0.25) * 0.12;
      }
    }

    // 8. 3D Fireworks Particle Explosion Physics
    if (this.fireworksDuration > 0 && this.fireworksParticles) {
      this.fireworksDuration -= delta;
      const positions = this.fireworksParticles.geometry.attributes.position.array as Float32Array;
      const count = this.fireworksVelocities.length;
      for (let i = 0; i < count; i++) {
        const vel = this.fireworksVelocities[i];
        vel.y -= delta * 1.5; // gravity
        positions[i * 3] += vel.x * delta;
        positions[i * 3 + 1] += vel.y * delta;
        positions[i * 3 + 2] += vel.z * delta;
      }
      this.fireworksParticles.geometry.attributes.position.needsUpdate = true;
      const mat = this.fireworksParticles.material as THREE.PointsMaterial;
      mat.opacity = Math.max(0, this.fireworksDuration / 2.2);
      if (this.fireworksDuration <= 0) {
        while (this.fireworksGroup.children.length > 0) {
          this.fireworksGroup.remove(this.fireworksGroup.children[0]);
        }
      }
    }

    // 7. Dynamic Depth of Field Focus Lock on Active Site
    if (this.currentScene !== 'scene1_lab' && this.enzymeComplex?.activeSitePocket) {
      this.enzymeComplex.activeSitePocket.getWorldPosition(_vec3A);
      const focalDist = this.camera.position.distanceTo(_vec3A);
      this.setBokehUniform('focus', focalDist);
    }

    // 8. Render Scene via Post-Processing Composer (or XR direct)
    if (this.renderer.xr.isPresenting) {
      this.renderer.render(this.scene, this.camera);
    } else {
      if (this.isDepthOfFieldEnabled) {
        this.composer.render();
      } else {
        this.renderer.render(this.scene, this.camera);
      }
    }
  }

  // -------------------------------------------------------------
  // Cleanup
  // -------------------------------------------------------------
  public dispose() {
    this.isDestroyed = true;
    this.renderer.setAnimationLoop(null);
    this.renderer.dispose();
    if (this.container && this.renderer.domElement.parentNode === this.container) {
      this.container.removeChild(this.renderer.domElement);
    }
  }
}
