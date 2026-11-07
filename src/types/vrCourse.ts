export type SceneId = 
  | 'scene1_lab'          // 场景一：虚拟医学生化实验室与引导
  | 'scene1_transition'   // 细胞膜穿梭微观跃迁
  | 'scene1_cytoplasm'    // 细胞质基质空间巡视 (蛋白质、ATP、水分子)
  | 'scene2_enzyme'       // 场景二：酶结构认知与正常催化反应
  | 'scene3_competitive'  // 场景三：竞争性抑制剂机制 (争夺活性中心)
  | 'scene4_noncompetitive' // 场景四：非竞争性抑制机制 (结合别构位点)
  | 'scene5_kinetics'     // 场景五：米氏动力学曲线与临床药物实验室
  | 'scene6_quiz';        // 场景六：沉浸式考核与临床案例分析

export type VRMode = 'desktop' | 'stereo' | 'webxr';

export interface ControllerState {
  connected: boolean;
  position: [number, number, number];
  rotation: [number, number, number];
  triggerPressed: boolean;
  gripPressed: boolean;
  rayIntersecting: boolean;
}

export interface VoiceOverLine {
  id: string;
  speaker: string;
  text: string;
  duration: number; // seconds
}

export interface ClinicalDrugInfo {
  name: string;
  englishName: string;
  type: 'competitive' | 'noncompetitive';
  targetEnzyme: string;
  clinicalUse: string;
  mechanism: string;
  formula: string;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  clinicalNote: string;
}
