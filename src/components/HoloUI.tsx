import React, { useState, useEffect } from 'react';
import {
  Volume2,
  VolumeX,
  RotateCcw,
  Glasses,
  Monitor,
  HelpCircle,
  Activity,
  Layers,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Zap,
  ShieldAlert,
  Beaker,
  CheckCircle2,
  Focus,
  Sliders,
  AlertTriangle,
  Eye,
  Lightbulb
} from 'lucide-react';
import { SceneId, VRMode } from '../types/vrCourse';
import { COURSE_SCENES, PPT_STEPS } from '../data/courseData';
import { soundManager } from '../audio/soundManager';
import { Scene5AssessmentBoard } from './Scene5AssessmentBoard';

interface HoloUIProps {
  currentScene: SceneId;
  vrMode: VRMode;
  pptStep?: number;
  onAdvancePPT?: () => void;
  onPrevPPT?: () => void;
  onSelectPPTStep?: (step: number) => void;
  isDoFEnabled: boolean;
  isCameraWide?: boolean;
  onToggleCameraView?: () => void;
  reactionRate?: number;
  reactionStatus?: 'idle' | 'snapping' | 'success' | 'rejected';
  scene3Step?: 'await_drug' | 'drug_locked' | 'substrate_repelled' | 'displaced_success';
  substrateConcentration?: number;
  scene4Step?: 'await_allosteric_drug' | 'drug_bound_distorted' | 'substrate_tested_clash' | 'concentration_tested';
  scene4SubstrateConc?: number;
  onSelectScene: (sceneId: SceneId) => void;
  onChangeVRMode: (mode: VRMode) => void;
  onToggleDoF: () => void;
  onOpenGuide: () => void;
  onOpenKinetics: () => void;
  onOpenQuiz: () => void;
  onTriggerCatalysis: () => void;
  onTriggerDecoy?: () => void;
  onResetSubstrates?: () => void;
  onLockStatinDrug?: () => void;
  onAttemptSubstrateWithDrug?: () => void;
  onChangeSubstrateConcentration?: (conc: number) => void;
  onResetScene3?: () => void;
  onDockAllostericDrug?: () => void;
  onAttemptSubstrateDeformed?: () => void;
  onChangeScene4SubstrateConc?: (conc: number) => void;
  onResetScene4?: () => void;
  onTriggerCompetitive: () => void;
  onTriggerNonCompetitive: () => void;
  onResetConformation: () => void;
  onTriggerFireworks?: () => void;
  onRestartCourse?: () => void;
}

export const HoloUI: React.FC<HoloUIProps> = ({
  currentScene,
  vrMode,
  isDoFEnabled,
  isCameraWide = true,
  onToggleCameraView,
  reactionRate = 0,
  reactionStatus = 'idle',
  scene3Step = 'await_drug',
  substrateConcentration = 10,
  scene4Step = 'await_allosteric_drug',
  scene4SubstrateConc = 10,
  onSelectScene,
  onChangeVRMode,
  onToggleDoF,
  onOpenGuide,
  onOpenKinetics,
  onOpenQuiz,
  onTriggerCatalysis,
  onTriggerDecoy,
  onResetSubstrates,
  onLockStatinDrug,
  onAttemptSubstrateWithDrug,
  onChangeSubstrateConcentration,
  onResetScene3,
  onDockAllostericDrug,
  onAttemptSubstrateDeformed,
  onChangeScene4SubstrateConc,
  onResetScene4,
  onTriggerCompetitive,
  onTriggerNonCompetitive,
  onResetConformation,
  onTriggerFireworks,
  onRestartCourse,
}) => {
  const [isMuted, setIsMuted] = useState(soundManager.getIsMuted());
  const [isDockCollapsed, setIsDockCollapsed] = useState(false);
  const [isVoicePlaying, setIsVoicePlaying] = useState(false);
  const [isSubtitleCollapsed, setIsSubtitleCollapsed] = useState(false);
  const [isTipCollapsed, setIsTipCollapsed] = useState(false);
  const [isScene2PanelCollapsed, setIsScene2PanelCollapsed] = useState(false);
  const [isScene3PanelCollapsed, setIsScene3PanelCollapsed] = useState(false);
  const [isScene4PanelCollapsed, setIsScene4PanelCollapsed] = useState(false);

  const activeSceneMeta = COURSE_SCENES.find(s => s.id === currentScene) || COURSE_SCENES[0];
  const activeSceneIndex = COURSE_SCENES.findIndex(s => s.id === currentScene);

  useEffect(() => {
    soundManager.initVoiceEngine();
    soundManager.setVoiceStyle('deep_commentator');
  }, []);

  const handleToggleMute = () => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
    soundManager.playClickSFX();
  };

  const handlePlayVoiceover = () => {
    soundManager.stopSpeech();
    soundManager.playClickSFX();
    setIsVoicePlaying(true);
    soundManager.speak(activeSceneMeta.voiceover, () => {
      setIsVoicePlaying(false);
    });
  };

  const handlePrevAct = () => {
    if (activeSceneIndex > 0) {
      soundManager.stopSpeech();
      soundManager.playClickSFX();
      onSelectScene(COURSE_SCENES[activeSceneIndex - 1].id);
    }
  };

  const handleNextAct = () => {
    if (activeSceneIndex < COURSE_SCENES.length - 1) {
      soundManager.stopSpeech();
      soundManager.playClickSFX();
      onSelectScene(COURSE_SCENES[activeSceneIndex + 1].id);
    }
  };

  return (
    <div className="pointer-events-none fixed inset-0 z-40 flex flex-col justify-between p-3 sm:p-5 select-none font-sans overflow-hidden">
      {/* 1. 顶部控制栏 (清爽半透明微光质感) */}
      <header className="pointer-events-auto flex flex-wrap items-center justify-between gap-2.5 sm:gap-4 bg-[rgba(10,15,30,0.55)] backdrop-blur-[20px] -webkit-backdrop-blur-[20px] border border-white/[0.12] rounded-2xl px-3.5 sm:px-4 py-2 shadow-[0_16px_40px_-4px_rgba(0,0,0,0.5),inset_0_1px_0_0_rgba(255,255,255,0.2)] shrink-0 transition-all">
        {/* 标题与标识 */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-7 h-7 rounded-xl bg-white/[0.04] border border-cyan-400/35 flex items-center justify-center text-[#A5F3FC] shadow-[0_0_12px_-2px_rgba(34,211,238,0.35),inset_0_1px_0_0_rgba(255,255,255,0.2)] shrink-0">
            <Beaker className="w-3.5 h-3.5 text-cyan-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-[15px] font-semibold tracking-[1.2px] bg-gradient-to-r from-white via-slate-100 to-[#A5F3FC] bg-clip-text text-transparent select-none">
                《微观视界：酶的抑制与药物靶向》
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/[0.08] text-[#A5F3FC] border border-cyan-400/35 font-mono shadow-[0_0_12px_-2px_rgba(34,211,238,0.25),inset_0_1px_0_0_rgba(255,255,255,0.22)]">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_6px_#22d3ee]" />
                VR 交互课件
              </span>
              <span className="hidden xl:inline-flex items-center text-[10px] px-2 py-0.5 rounded-full bg-white/[0.03] text-[#94A3B8] border border-white/[0.12] font-mono shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15)]">
                HD 超清仿真
              </span>
            </div>
            <div className="text-[11px] text-[#94A3B8] hidden md:block tracking-wide font-normal mt-0.5">
              项目主题：竞争性抑制与非竞争性抑制机制及临床药物作用 · 肝细胞微观视界
            </div>
          </div>
        </div>

        {/* 顶部工具按钮 */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* 音效开关 */}
          <button
            onClick={handleToggleMute}
            className={`px-2.5 py-1.5 rounded-xl border text-xs transition-all flex items-center gap-1.5 ${
              isMuted
                ? 'border-white/[0.08] bg-white/[0.02] text-[#94A3B8] hover:text-white hover:border-white/20'
                : 'border-cyan-400/40 bg-cyan-500/[0.08] text-[#A5F3FC] shadow-[0_0_12px_rgba(34,211,238,0.2)]'
            }`}
            title={isMuted ? '解除静音' : '静音'}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 text-[#94A3B8]" /> : <Volume2 className="w-3.5 h-3.5 text-cyan-300" />}
            <span className="text-[11px] hidden sm:inline">{isMuted ? '静音' : '音效开'}</span>
          </button>

          {/* 指引说明 */}
          <button
            onClick={() => {
              soundManager.playClickSFX();
              onOpenGuide();
            }}
            className="p-1.5 sm:px-2.5 py-1.5 rounded-xl border border-white/[0.12] bg-white/[0.03] hover:border-cyan-400/40 hover:bg-white/[0.08] text-[#94A3B8] hover:text-white text-xs font-medium transition-all flex items-center gap-1.5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15)]"
            title="操作指引"
          >
            <HelpCircle className="w-3.5 h-3.5 text-[#A5F3FC]" />
            <span className="hidden sm:inline">操作指引</span>
          </button>

          {/* 动力学实验看板 */}
          <button
            onClick={() => {
              soundManager.playClickSFX();
              onOpenKinetics();
            }}
            className="p-1.5 sm:px-2.5 py-1.5 rounded-xl border border-amber-400/40 bg-amber-500/[0.08] text-[#FDE68A] hover:border-amber-300 hover:bg-amber-500/[0.14] text-xs font-medium transition-all duration-200 flex items-center gap-1.5 shadow-[0_0_12px_rgba(245,158,11,0.2),inset_0_0_6px_rgba(245,158,11,0.15)]"
            title="米氏双倒数方程与动力学曲线实验"
          >
            <Activity className="w-3.5 h-3.5 text-amber-300" />
            <span className="hidden sm:inline">动力学实验</span>
          </button>

          {/* 临床自测考核 */}
          <button
            onClick={() => {
              soundManager.playClickSFX();
              onOpenQuiz();
            }}
            className="px-2.5 sm:px-3 py-1.5 rounded-xl border border-cyan-400/60 bg-cyan-500/[0.12] text-[#A5F3FC] hover:text-white hover:border-cyan-300 text-xs font-medium transition-all duration-200 flex items-center gap-1.5 shadow-[0_0_16px_rgba(34,211,238,0.25)]"
            title="进入临床自测考核"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-cyan-300" />
            <span className="tracking-wide">临床自测</span>
          </button>

          {/* 景深切换 */}
          <button
            onClick={() => {
              soundManager.playClickSFX();
              onToggleDoF();
            }}
            className={`p-1.5 sm:px-2 py-1.5 rounded-xl border text-xs transition-all flex items-center gap-1.5 ${
              isDoFEnabled
                ? 'border-amber-400/50 bg-amber-500/[0.1] text-amber-200 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                : 'border-white/[0.08] bg-white/[0.02] text-[#94A3B8] hover:text-white'
            }`}
            title={isDoFEnabled ? '景深焦段已开启' : '景深焦段已关闭，画面保持超清锐利'}
          >
            <Focus className="w-3.5 h-3.5 text-amber-300" />
            <span className="hidden xl:inline text-[11px]">{isDoFEnabled ? '景深:开' : '高清锐利'}</span>
          </button>

          {/* 远景/特写 视角切换 */}
          <button
            onClick={() => {
              soundManager.playClickSFX();
              if (onToggleCameraView) onToggleCameraView();
            }}
            className={`p-1.5 sm:px-2.5 py-1.5 rounded-xl border text-xs transition-all flex items-center gap-1.5 ${
              isCameraWide
                ? 'border-cyan-400/50 bg-cyan-500/[0.12] text-cyan-200 shadow-[0_0_12px_rgba(34,211,238,0.25)]'
                : 'border-white/[0.12] bg-white/[0.04] text-[#94A3B8] hover:text-white'
            }`}
            title={isCameraWide ? '当前为自动远景全貌（点击拉近看特写）' : '当前为特写聚焦（点击切换回自动远景全貌）'}
          >
            <Eye className="w-3.5 h-3.5 text-cyan-300" />
            <span className="hidden sm:inline font-medium text-[11px]">
              {isCameraWide ? '🔭 远景全貌' : '🔬 特写聚焦'}
            </span>
          </button>

          {/* 硬件模式切换 */}
          <div className="flex items-center gap-0.5 p-0.5 rounded-xl bg-black/30 border border-white/[0.1] backdrop-blur-md shadow-inner">
            <button
              onClick={() => {
                soundManager.playClickSFX();
                onChangeVRMode('desktop');
              }}
              className={`p-1.5 rounded-lg text-xs transition-all ${
                vrMode === 'desktop'
                  ? 'bg-cyan-400/20 text-[#A5F3FC] border border-cyan-400/40 shadow-[0_0_10px_rgba(34,211,238,0.25)]'
                  : 'text-[#94A3B8] hover:text-white'
              }`}
              title="3D 桌面模式"
            >
              <Monitor className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                soundManager.playClickSFX();
                onChangeVRMode('webxr');
              }}
              className={`p-1.5 rounded-lg text-xs transition-all flex items-center gap-1 ${
                vrMode === 'webxr'
                  ? 'bg-cyan-400/20 text-[#A5F3FC] border border-cyan-400/40 shadow-[0_0_10px_rgba(34,211,238,0.25)]'
                  : 'text-[#94A3B8] hover:text-white'
              }`}
              title="WebXR 头显 (Quest / Pico / Vision Pro)"
            >
              <Glasses className="w-3.5 h-3.5" />
              <span className="text-[10px] font-mono hidden md:inline">VR头显</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. 中间区域：左侧紧凑实验面板 + 右侧字幕 (中间三维视口完全开阔无遮挡) */}
      <div className="flex-1 flex flex-col md:flex-row justify-between items-start pointer-events-none gap-3 my-2 w-full overflow-hidden">
        {/* 左侧 0A: 第1幕 宏观实验室快捷启航卡片 */}
        {currentScene === 'scene1_lab' && (
          <div className="pointer-events-auto self-start max-w-xs sm:max-w-sm w-full transition-all animate-fade-in z-30">
            <div className="bg-[rgba(10,15,30,0.55)] backdrop-blur-[20px] -webkit-backdrop-blur-[20px] border border-white/[0.12] rounded-2xl p-3 sm:p-3.5 text-slate-100 shadow-[0_20px_48px_-4px_rgba(0,0,0,0.55),inset_0_1px_0_0_rgba(255,255,255,0.2)] space-y-2.5">
              <div className="flex items-center gap-1.5 pb-1.5 border-b border-white/[0.08]">
                <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                <span className="text-xs font-semibold text-white tracking-wide">
                  第1幕 · 生化实验室启航
                </span>
              </div>
              <p className="text-xs text-slate-200 leading-snug">
                欢迎来到微观生物化学实验室。点击下方按钮开启微观跃迁，穿透肝细胞磷脂双分子层，进入细胞质基质探寻药物靶点！
              </p>
              <div className="pt-1">
                <button
                  onClick={() => {
                    soundManager.stopSpeech();
                    soundManager.playClickSFX();
                    onSelectScene('scene1_cytoplasm');
                  }}
                  className="w-full py-2 rounded-xl border border-cyan-400/60 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 text-[#A5F3FC] hover:text-white font-bold text-xs transition-all shadow-[0_0_16px_rgba(34,211,238,0.3)] flex items-center justify-center gap-2"
                >
                  <Zap className="w-3.5 h-3.5 text-cyan-300" />
                  <span>🚀 开启微观跃迁 (进入细胞质)</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 左侧 0B: 基质幕 细胞内微环境入口 */}
        {currentScene === 'scene1_cytoplasm' && (
          <div className="pointer-events-auto self-start max-w-xs sm:max-w-sm w-full transition-all animate-fade-in z-30">
            <div className="bg-[rgba(10,15,30,0.55)] backdrop-blur-[20px] -webkit-backdrop-blur-[20px] border border-white/[0.12] rounded-2xl p-3 sm:p-3.5 text-slate-100 shadow-[0_20px_48px_-4px_rgba(0,0,0,0.55),inset_0_1px_0_0_rgba(255,255,255,0.2)] space-y-2.5">
              <div className="flex items-center gap-1.5 pb-1.5 border-b border-white/[0.08]">
                <Layers className="w-3.5 h-3.5 text-indigo-300" />
                <span className="text-xs font-semibold text-white tracking-wide">
                  基质幕 · 细胞内微环境
                </span>
              </div>
              <p className="text-xs text-slate-200 leading-snug">
                已进入细胞质胶体基质空间。环顾四周观察发光的ATP分子与微管网络。正前方已定位靶酶蛋白复合体！
              </p>
              <div className="pt-1">
                <button
                  onClick={() => {
                    soundManager.stopSpeech();
                    soundManager.playClickSFX();
                    onSelectScene('scene2_enzyme');
                  }}
                  className="w-full py-2 rounded-xl border border-cyan-400/60 bg-gradient-to-r from-cyan-500/20 to-teal-500/20 hover:from-cyan-500/30 hover:to-teal-500/30 text-[#A5F3FC] hover:text-white font-bold text-xs transition-all shadow-[0_0_16px_rgba(34,211,238,0.3)] flex items-center justify-center gap-2"
                >
                  <Zap className="w-3.5 h-3.5 text-cyan-300" />
                  <span>⚡ 前往活性中心 (进入第2幕锁钥实验)</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 左侧 1: 第2幕 锁钥契合实验控制面板 */}
        {currentScene === 'scene2_enzyme' && (
          <div className="pointer-events-auto self-start max-w-xs sm:max-w-sm w-full transition-all animate-fade-in z-30">
            {!isScene2PanelCollapsed ? (
              <div className="bg-[rgba(10,15,30,0.55)] backdrop-blur-[20px] -webkit-backdrop-blur-[20px] border border-white/[0.12] rounded-2xl p-3 sm:p-3.5 text-slate-100 shadow-[0_20px_48px_-4px_rgba(0,0,0,0.55),inset_0_1px_0_0_rgba(255,255,255,0.2)] space-y-2.5">
                <div className="flex items-center justify-between pb-1.5 border-b border-white/[0.08]">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span className="text-xs font-semibold text-white tracking-wide">
                      第2幕 · 锁钥契合实验控制
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      soundManager.playClickSFX();
                      setIsScene2PanelCollapsed(true);
                    }}
                    className="p-1 rounded-lg border border-white/[0.1] bg-white/[0.03] hover:bg-white/[0.08] text-[#94A3B8] hover:text-white text-xs transition-colors"
                    title="收起面板"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* 催化速率柱状图 */}
                <div className="bg-black/30 border border-white/[0.08] backdrop-blur-md rounded-xl p-2.5 space-y-1.5">
                  <div className="flex items-center justify-between gap-1.5">
                    <div className="flex items-center gap-1">
                      <Activity className="w-3.5 h-3.5 text-cyan-400" />
                      <span className="text-[11px] font-semibold text-[#94A3B8]">
                        催化反应速率
                      </span>
                    </div>
                    <span className="font-mono text-xs font-bold text-[#A5F3FC]">
                      {reactionRate}% (Vmax)
                    </span>
                  </div>
                  <div className="relative w-full h-2.5 bg-black/40 rounded-full overflow-hidden border border-white/[0.1] shadow-inner">
                    <div
                      className={`h-full transition-all duration-300 ease-out rounded-full ${
                        reactionRate >= 80
                          ? 'bg-gradient-to-r from-cyan-500 to-emerald-400'
                          : reactionRate > 0
                          ? 'bg-gradient-to-r from-amber-500 to-cyan-400'
                          : 'bg-slate-700'
                      }`}
                      style={{ width: `${Math.max(4, reactionRate)}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[9px] text-[#94A3B8] font-mono">
                    <span>0% (空载)</span>
                    <span>50% (Km)</span>
                    <span className="text-cyan-300 font-semibold">100% (Vmax 饱和)</span>
                  </div>
                </div>

                {/* 快捷操作按键 */}
                <div className="flex flex-wrap items-center justify-between gap-1.5 pt-1 border-t border-white/[0.08]">
                  <button
                    onClick={() => {
                      soundManager.playClickSFX();
                      onTriggerCatalysis();
                    }}
                    className="px-2.5 py-1.5 rounded-lg border border-cyan-400/50 bg-cyan-500/[0.1] hover:bg-cyan-500/[0.2] text-[#A5F3FC] hover:text-white text-[11px] font-medium transition-all shadow-[0_0_10px_rgba(34,211,238,0.25)] flex items-center gap-1"
                  >
                    <Zap className="w-3 h-3 text-cyan-300" />
                    <span>放入底物</span>
                  </button>

                  <button
                    onClick={() => {
                      soundManager.playClickSFX();
                      if (onTriggerDecoy) onTriggerDecoy();
                    }}
                    className="px-2.5 py-1.5 rounded-lg border border-amber-400/50 bg-amber-500/[0.08] hover:bg-amber-500/[0.16] text-[#FDE68A] hover:text-white text-[11px] font-medium transition-all shadow-[0_0_10px_rgba(245,158,11,0.25)] flex items-center gap-1"
                  >
                    <ShieldAlert className="w-3 h-3 text-amber-300" />
                    <span>测试异构</span>
                  </button>

                  <button
                    onClick={() => {
                      soundManager.playClickSFX();
                      if (onResetSubstrates) onResetSubstrates();
                    }}
                    className="p-1 px-2 rounded-lg border border-white/[0.12] bg-white/[0.03] hover:border-white/25 text-[#94A3B8] hover:text-white text-[11px] transition-colors flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>重置</span>
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => {
                  soundManager.playClickSFX();
                  setIsScene2PanelCollapsed(false);
                }}
                className="px-3 py-1.5 rounded-xl bg-[rgba(10,15,30,0.55)] backdrop-blur-[20px] border border-white/[0.12] text-cyan-300 hover:text-white text-xs shadow-md flex items-center gap-1.5 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>第2幕: 锁钥契合实验 (展开)</span>
                <ChevronUp className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        {/* 左侧 2: 第3幕 他汀竞争性抑制实验面板 */}
        {currentScene === 'scene3_competitive' && (
          <div className="pointer-events-auto self-start max-w-xs sm:max-w-sm w-full transition-all animate-fade-in z-30">
            {!isScene3PanelCollapsed ? (
              <div className="bg-[rgba(10,15,30,0.55)] backdrop-blur-[20px] -webkit-backdrop-blur-[20px] border border-white/[0.12] rounded-2xl p-3 sm:p-3.5 text-slate-100 shadow-[0_20px_48px_-4px_rgba(0,0,0,0.55),inset_0_1px_0_0_rgba(255,255,255,0.2)] space-y-2.5">
                <div className="flex items-center justify-between pb-1.5 border-b border-white/[0.08]">
                  <div className="flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                    <span className="text-xs font-semibold text-white tracking-wide">
                      第3幕 · 竞争性抑制实验关卡
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      soundManager.playClickSFX();
                      setIsScene3PanelCollapsed(true);
                    }}
                    className="p-1 rounded-lg border border-white/[0.1] bg-white/[0.03] hover:bg-white/[0.08] text-[#94A3B8] hover:text-white text-xs transition-colors"
                    title="收起面板"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* 底物浓度滑块 */}
                <div className="bg-black/30 border border-white/[0.08] backdrop-blur-md rounded-xl p-2.5 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-200">
                    <div className="flex items-center gap-1 text-cyan-300">
                      <Sliders className="w-3.5 h-3.5" />
                      <span>【底物浓度调节】</span>
                    </div>
                    <span className="font-mono text-[#A5F3FC] text-xs">
                      [S] = {substrateConcentration}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    step="5"
                    value={substrateConcentration}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      if (onChangeSubstrateConcentration) onChangeSubstrateConcentration(val);
                    }}
                    className="w-full h-2 bg-black/40 rounded-lg appearance-none cursor-pointer accent-cyan-400 focus:outline-none shadow-inner"
                  />
                  <div className="flex justify-between items-center text-[9px] text-[#94A3B8] font-mono">
                    <span className={substrateConcentration <= 20 ? 'text-rose-400 font-bold' : ''}>10% (死锁)</span>
                    <span className={substrateConcentration >= 45 && substrateConcentration <= 60 ? 'text-amber-400 font-bold' : ''}>50% (竞争)</span>
                    <span className={substrateConcentration >= 80 ? 'text-cyan-300 font-bold' : ''}>100% (逆转)</span>
                  </div>
                </div>

                {/* 催化速率 */}
                <div className="bg-black/30 border border-white/[0.08] backdrop-blur-md rounded-xl p-2.5 space-y-1.5">
                  <div className="flex items-center justify-between gap-1.5">
                    <span className="text-[11px] font-semibold text-[#94A3B8]">催化反应速率</span>
                    <span className="font-mono text-xs font-bold text-[#A5F3FC]">{reactionRate}%</span>
                  </div>
                  <div className="relative w-full h-2.5 bg-black/40 rounded-full overflow-hidden border border-white/[0.1] shadow-inner">
                    <div
                      className={`h-full transition-all duration-300 ease-out rounded-full ${
                        reactionRate >= 80
                          ? 'bg-gradient-to-r from-emerald-500 to-cyan-300'
                          : reactionRate <= 25
                          ? 'bg-rose-500'
                          : 'bg-amber-500'
                      }`}
                      style={{ width: `${Math.max(4, reactionRate)}%` }}
                    />
                  </div>
                </div>

                {/* 快捷操作按键 */}
                <div className="flex flex-wrap items-center justify-between gap-1.5 pt-1 border-t border-white/[0.08]">
                  <button
                    onClick={() => {
                      soundManager.playClickSFX();
                      if (onLockStatinDrug) onLockStatinDrug();
                    }}
                    className="px-2 py-1 rounded-lg border border-rose-400/50 bg-rose-500/[0.1] hover:bg-rose-500/[0.2] text-[#FFE4E6] hover:text-white text-[11px] font-medium transition-all flex items-center gap-1"
                  >
                    <ShieldAlert className="w-3 h-3 text-rose-300" />
                    <span>放入他汀</span>
                  </button>

                  <button
                    onClick={() => {
                      soundManager.playClickSFX();
                      if (onAttemptSubstrateWithDrug) onAttemptSubstrateWithDrug();
                    }}
                    className="px-2 py-1 rounded-lg border border-amber-400/50 bg-amber-500/[0.08] hover:bg-amber-500/[0.16] text-[#FDE68A] hover:text-white text-[11px] font-medium transition-all flex items-center gap-1"
                  >
                    <Zap className="w-3 h-3 text-amber-300" />
                    <span>放入底物</span>
                  </button>

                  <button
                    onClick={() => {
                      soundManager.playClickSFX();
                      if (onChangeSubstrateConcentration) onChangeSubstrateConcentration(100);
                    }}
                    className="px-2 py-1 rounded-lg border border-cyan-400/50 bg-cyan-500/[0.1] hover:bg-cyan-500/[0.2] text-[#A5F3FC] hover:text-white text-[11px] font-medium transition-all flex items-center gap-1"
                  >
                    <Sliders className="w-3 h-3 text-cyan-300" />
                    <span>底物拉满</span>
                  </button>

                  <button
                    onClick={() => {
                      soundManager.playClickSFX();
                      if (onResetScene3) onResetScene3();
                    }}
                    className="p-1 px-1.5 rounded-lg border border-white/[0.12] bg-white/[0.03] text-[#94A3B8] hover:text-white text-[11px]"
                  >
                    <RotateCcw className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => {
                  soundManager.playClickSFX();
                  setIsScene3PanelCollapsed(false);
                }}
                className="px-3 py-1.5 rounded-xl bg-[rgba(10,15,30,0.55)] backdrop-blur-[20px] border border-white/[0.12] text-rose-300 hover:text-white text-xs shadow-md flex items-center gap-1.5 transition-all"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                <span>第3幕: 他汀竞争性抑制 ({reactionRate}%) (展开)</span>
                <ChevronUp className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        {/* 左侧 3: 第4幕 非竞争性抑制实验面板 */}
        {currentScene === 'scene4_noncompetitive' && (
          <div className="pointer-events-auto self-start max-w-xs sm:max-w-sm w-full transition-all animate-fade-in z-30">
            {!isScene4PanelCollapsed ? (
              <div className="bg-[rgba(10,15,30,0.55)] backdrop-blur-[20px] -webkit-backdrop-blur-[20px] border border-white/[0.12] rounded-2xl p-3 sm:p-3.5 text-slate-100 shadow-[0_20px_48px_-4px_rgba(0,0,0,0.55),inset_0_1px_0_0_rgba(255,255,255,0.2)] space-y-2.5">
                <div className="flex items-center justify-between pb-1.5 border-b border-white/[0.08]">
                  <div className="flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-cyan-300" />
                    <span className="text-xs font-semibold text-white tracking-wide">
                      第4幕 · 非竞争性抑制 (别构调节)
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      soundManager.playClickSFX();
                      setIsScene4PanelCollapsed(true);
                    }}
                    className="p-1 rounded-lg border border-white/[0.1] bg-white/[0.03] hover:bg-white/[0.08] text-[#94A3B8] hover:text-white text-xs transition-colors"
                    title="收起面板"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* 底物浓度滑块 */}
                <div className="bg-black/30 border border-white/[0.08] backdrop-blur-md rounded-xl p-2.5 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-200">
                    <div className="flex items-center gap-1 text-cyan-300">
                      <Sliders className="w-3.5 h-3.5" />
                      <span>【底物浓度调节】</span>
                    </div>
                    <span className="font-mono text-[#A5F3FC] text-xs">
                      [S] = {scene4SubstrateConc}% (上限被锁)
                    </span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    step="5"
                    value={scene4SubstrateConc}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      if (onChangeScene4SubstrateConc) onChangeScene4SubstrateConc(val);
                    }}
                    className="w-full h-2 bg-black/40 rounded-lg appearance-none cursor-pointer accent-cyan-400 focus:outline-none shadow-inner"
                  />
                  <div className="flex justify-between items-center text-[9px] text-[#94A3B8] font-mono">
                    <span className="text-cyan-300 font-medium">10% (失活)</span>
                    <span>50% (过量无效)</span>
                    <span className="text-rose-400 font-medium">100% (拉满无用)</span>
                  </div>
                </div>

                {/* 催化速率 */}
                <div className="bg-black/30 border border-white/[0.08] backdrop-blur-md rounded-xl p-2.5 space-y-1.5">
                  <div className="flex items-center justify-between gap-1.5">
                    <span className="text-[11px] font-semibold text-[#94A3B8]">反应速率</span>
                    <span className="font-mono text-xs font-bold text-rose-300">10% (Vmax锁定)</span>
                  </div>
                  <div className="relative w-full h-2.5 bg-black/40 rounded-full overflow-hidden border border-white/[0.1] shadow-inner">
                    <div
                      className="h-full bg-rose-500 rounded-full transition-all duration-300"
                      style={{ width: '10%' }}
                    />
                  </div>
                </div>

                {/* 快捷操作按键 */}
                <div className="flex flex-wrap items-center justify-between gap-1.5 pt-1 border-t border-white/[0.08]">
                  <button
                    onClick={() => {
                      soundManager.playClickSFX();
                      if (onDockAllostericDrug) onDockAllostericDrug();
                    }}
                    className="px-2 py-1 rounded-lg border border-cyan-400/50 bg-cyan-500/[0.1] hover:bg-cyan-500/[0.2] text-[#A5F3FC] hover:text-white text-[11px] font-medium transition-all flex items-center gap-1"
                  >
                    <Layers className="w-3 h-3 text-cyan-300" />
                    <span>放入别构药</span>
                  </button>

                  <button
                    onClick={() => {
                      soundManager.playClickSFX();
                      if (onAttemptSubstrateDeformed) onAttemptSubstrateDeformed();
                    }}
                    className="px-2 py-1 rounded-lg border border-amber-400/50 bg-amber-500/[0.08] hover:bg-amber-500/[0.16] text-[#FDE68A] hover:text-white text-[11px] font-medium transition-all flex items-center gap-1"
                  >
                    <Zap className="w-3 h-3 text-amber-300" />
                    <span>放入底物</span>
                  </button>

                  <button
                    onClick={() => {
                      soundManager.playClickSFX();
                      if (onChangeScene4SubstrateConc) onChangeScene4SubstrateConc(100);
                    }}
                    className="px-2 py-1 rounded-lg border border-cyan-400/50 bg-cyan-500/[0.1] hover:bg-cyan-500/[0.2] text-[#A5F3FC] hover:text-white text-[11px] font-medium transition-all flex items-center gap-1"
                  >
                    <Sliders className="w-3 h-3 text-cyan-300" />
                    <span>底物拉满</span>
                  </button>

                  <button
                    onClick={() => {
                      soundManager.playClickSFX();
                      if (onResetScene4) onResetScene4();
                    }}
                    className="p-1 px-1.5 rounded-lg border border-white/[0.12] bg-white/[0.03] text-[#94A3B8] hover:text-white text-[11px]"
                  >
                    <RotateCcw className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => {
                  soundManager.playClickSFX();
                  setIsScene4PanelCollapsed(false);
                }}
                className="px-3 py-1.5 rounded-xl bg-[rgba(10,15,30,0.55)] backdrop-blur-[20px] border border-white/[0.12] text-cyan-300 hover:text-white text-xs shadow-md flex items-center gap-1.5 transition-all"
              >
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                <span>第4幕: 别构非竞争抑制 (展开)</span>
                <ChevronUp className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        {/* 第5幕：居中显示考核卡片 */}
        {currentScene === 'scene5_kinetics' && (
          <div className="pointer-events-auto flex-1 max-w-2xl mx-auto my-auto z-30">
            <Scene5AssessmentBoard
              onTriggerFireworks={onTriggerFireworks || (() => {})}
              onRestartCourse={onRestartCourse || (() => onSelectScene('scene1_lab'))}
              onSelectScene={onSelectScene}
            />
          </div>
        )}

        {/* 右侧容器：右上角操作提示卡片 (第2、3、4幕关键交互指引) + 紧凑字幕 */}
        {currentScene !== 'scene5_kinetics' && (
          <div className="pointer-events-auto self-start max-w-xs sm:max-w-sm w-full flex flex-col gap-2.5 transition-all animate-fade-in z-30">
            {/* 1. 右上角操作指引提示卡片 (第2、3、4幕专属：引导用户怎么点、怎么操作) */}
            {currentScene === 'scene2_enzyme' && (
              <div className="bg-[rgba(10,15,30,0.65)] backdrop-blur-[20px] -webkit-backdrop-blur-[20px] border border-amber-400/40 rounded-2xl p-3 sm:p-3.5 text-slate-100 shadow-[0_20px_48px_-4px_rgba(0,0,0,0.6),inset_0_1px_0_0_rgba(255,255,255,0.2)] space-y-2">
                <div className="flex items-center justify-between pb-1.5 border-b border-white/[0.08]">
                  <div className="flex items-center gap-1.5">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                    <span className="text-xs font-bold text-amber-200 tracking-wide">
                      💡 第2幕 · 探索操作指引
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      soundManager.playClickSFX();
                      setIsTipCollapsed(!isTipCollapsed);
                    }}
                    className="p-1 rounded-lg border border-white/[0.1] bg-white/[0.03] hover:bg-white/[0.08] text-amber-300 hover:text-white text-xs transition-colors"
                    title={isTipCollapsed ? '展开操作指引' : '收起操作指引'}
                  >
                    {isTipCollapsed ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {!isTipCollapsed ? (
                  <div className="space-y-2 text-[11px] leading-snug">
                    {/* 状态徽章 */}
                    <div className="px-2 py-1 rounded-lg bg-black/40 border border-white/[0.08] font-mono text-[10px] flex items-center justify-between">
                      <span className="text-slate-400">当前状态</span>
                      <span className={
                        reactionRate >= 80
                          ? 'text-emerald-300 font-semibold'
                          : reactionStatus === 'rejected'
                          ? 'text-amber-300 font-semibold'
                          : 'text-cyan-300'
                      }>
                        {reactionRate >= 80
                          ? '🟢 催化成功 · 产物已生成 (100%)'
                          : reactionStatus === 'rejected'
                          ? '🟡 构象错配 · 诱饵底物被弹开'
                          : '⚪ 就绪 · 请点击放入底物'}
                      </span>
                    </div>

                    {/* 分步指引 */}
                    <div className="space-y-1.5 text-slate-200">
                      <div className="p-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-start gap-1.5">
                        <span className="w-4 h-4 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">1</span>
                        <div>
                          <span className="font-semibold text-cyan-300">放入底物：</span>
                          点击左侧<span className="text-white font-medium bg-cyan-950/80 px-1 py-0.5 rounded border border-cyan-400/40">【放入底物】</span>（或在3D中拖拽绿色底物至中央凹槽），观察三维形状契合并裂解为2分子产物。
                        </div>
                      </div>

                      <div className="p-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-start gap-1.5">
                        <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">2</span>
                        <div>
                          <span className="font-semibold text-amber-300">测试异构：</span>
                          点击左侧<span className="text-white font-medium bg-amber-950/80 px-1 py-0.5 rounded border border-amber-400/40">【测试异构】</span>，测试错误构象分子，观察空间位阻冲突导致被活性中心即刻弹开。
                        </div>
                      </div>

                      <div className="p-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-start gap-1.5">
                        <span className="w-4 h-4 rounded-full bg-slate-500/20 text-slate-300 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">3</span>
                        <div>
                          <span className="font-semibold text-slate-300">复原重试：</span>
                          点击左侧<span className="text-white font-medium bg-slate-800 px-1 py-0.5 rounded border border-white/20">【重置】</span>随时还原分子位置。
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-[10px] text-amber-200/80">点击右上方箭头展开详细点按指引</div>
                )}
              </div>
            )}

            {currentScene === 'scene3_competitive' && (
              <div className="bg-[rgba(10,15,30,0.65)] backdrop-blur-[20px] -webkit-backdrop-blur-[20px] border border-rose-400/40 rounded-2xl p-3 sm:p-3.5 text-slate-100 shadow-[0_20px_48px_-4px_rgba(0,0,0,0.6),inset_0_1px_0_0_rgba(255,255,255,0.2)] space-y-2">
                <div className="flex items-center justify-between pb-1.5 border-b border-white/[0.08]">
                  <div className="flex items-center gap-1.5">
                    <Lightbulb className="w-3.5 h-3.5 text-rose-300 animate-pulse" />
                    <span className="text-xs font-bold text-rose-200 tracking-wide">
                      💡 第3幕 · 竞争性抑制操作指引
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      soundManager.playClickSFX();
                      setIsTipCollapsed(!isTipCollapsed);
                    }}
                    className="p-1 rounded-lg border border-white/[0.1] bg-white/[0.03] hover:bg-white/[0.08] text-rose-300 hover:text-white text-xs transition-colors"
                    title={isTipCollapsed ? '展开操作指引' : '收起操作指引'}
                  >
                    {isTipCollapsed ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {!isTipCollapsed ? (
                  <div className="space-y-2 text-[11px] leading-snug">
                    {/* 状态徽章 */}
                    <div className="px-2 py-1 rounded-lg bg-black/40 border border-white/[0.08] font-mono text-[10px] flex items-center justify-between">
                      <span className="text-slate-400">进行阶段</span>
                      <span className={
                        scene3Step === 'displaced_success'
                          ? 'text-emerald-300 font-semibold'
                          : scene3Step === 'substrate_repelled'
                          ? 'text-amber-300 font-semibold'
                          : scene3Step === 'drug_locked'
                          ? 'text-rose-300 font-semibold'
                          : 'text-cyan-300'
                      }>
                        {scene3Step === 'displaced_success'
                          ? '🟢 逆转成功！高浓度挤出他汀药物'
                          : scene3Step === 'substrate_repelled'
                          ? '⚠️ 底物被药物位阻弹开 (速率0%)'
                          : scene3Step === 'drug_locked'
                          ? '🔴 他汀药物已锁定活性凹槽'
                          : '⚪ 待操作：请先放入降脂药物'}
                      </span>
                    </div>

                    {/* 3步互动引导 */}
                    <div className="space-y-1.5 text-slate-200">
                      <div className={`p-1.5 rounded-lg border transition-all flex items-start gap-1.5 ${
                        scene3Step === 'await_drug'
                          ? 'bg-rose-500/15 border-rose-400/50 shadow-[0_0_10px_rgba(244,63,94,0.2)]'
                          : 'bg-white/[0.03] border-white/[0.06] opacity-80'
                      }`}>
                        <span className={`w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5 ${
                          scene3Step === 'await_drug' ? 'bg-rose-500 text-white animate-bounce' : 'bg-rose-500/20 text-rose-300'
                        }`}>1</span>
                        <div>
                          <span className="font-semibold text-rose-300">第1步 · 锁定药物：</span>
                          点击左侧<span className="text-white font-medium bg-rose-950/80 px-1 py-0.5 rounded border border-rose-400/40">【放入他汀药】</span>，阿托伐他汀分子抢占活性中心并紧固嵌合。
                        </div>
                      </div>

                      <div className={`p-1.5 rounded-lg border transition-all flex items-start gap-1.5 ${
                        scene3Step === 'drug_locked'
                          ? 'bg-amber-500/15 border-amber-400/50 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                          : 'bg-white/[0.03] border-white/[0.06] opacity-80'
                      }`}>
                        <span className={`w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5 ${
                          scene3Step === 'drug_locked' ? 'bg-amber-500 text-black animate-bounce' : 'bg-amber-500/20 text-amber-300'
                        }`}>2</span>
                        <div>
                          <span className="font-semibold text-amber-300">第2步 · 测试结合：</span>
                          点击左侧<span className="text-white font-medium bg-amber-950/80 px-1 py-0.5 rounded border border-amber-400/40">【放入底物】</span>，底物被他汀药物强力阻挡反弹，反应速率降为 0%！
                        </div>
                      </div>

                      <div className={`p-1.5 rounded-lg border transition-all flex items-start gap-1.5 ${
                        scene3Step === 'substrate_repelled' || scene3Step === 'displaced_success'
                          ? 'bg-cyan-500/15 border-cyan-400/50 shadow-[0_0_10px_rgba(34,211,238,0.2)]'
                          : 'bg-white/[0.03] border-white/[0.06] opacity-80'
                      }`}>
                        <span className={`w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5 ${
                          scene3Step === 'substrate_repelled' ? 'bg-cyan-400 text-black animate-bounce' : 'bg-cyan-500/20 text-cyan-300'
                        }`}>3</span>
                        <div>
                          <span className="font-semibold text-cyan-300">第3步 · 竞争逆转：</span>
                          向右拖动左侧<span className="text-cyan-200 font-medium">【底物浓度滑块】</span>（或点<span className="text-white font-medium bg-cyan-950/80 px-1 py-0.5 rounded border border-cyan-400/40">【底物拉满】</span>），海量底物凭借数量优势**强行挤出他汀药**，速率恢复100%！
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-[10px] text-rose-200/80">点击右上方箭头展开竞争抑制操作指引</div>
                )}
              </div>
            )}

            {currentScene === 'scene4_noncompetitive' && (
              <div className="bg-[rgba(10,15,30,0.65)] backdrop-blur-[20px] -webkit-backdrop-blur-[20px] border border-cyan-400/40 rounded-2xl p-3 sm:p-3.5 text-slate-100 shadow-[0_20px_48px_-4px_rgba(0,0,0,0.6),inset_0_1px_0_0_rgba(255,255,255,0.2)] space-y-2">
                <div className="flex items-center justify-between pb-1.5 border-b border-white/[0.08]">
                  <div className="flex items-center gap-1.5">
                    <Lightbulb className="w-3.5 h-3.5 text-cyan-300 animate-pulse" />
                    <span className="text-xs font-bold text-cyan-200 tracking-wide">
                      💡 第4幕 · 非竞争性抑制操作指引
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      soundManager.playClickSFX();
                      setIsTipCollapsed(!isTipCollapsed);
                    }}
                    className="p-1 rounded-lg border border-white/[0.1] bg-white/[0.03] hover:bg-white/[0.08] text-cyan-300 hover:text-white text-xs transition-colors"
                    title={isTipCollapsed ? '展开操作指引' : '收起操作指引'}
                  >
                    {isTipCollapsed ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {!isTipCollapsed ? (
                  <div className="space-y-2 text-[11px] leading-snug">
                    {/* 状态徽章 */}
                    <div className="px-2 py-1 rounded-lg bg-black/40 border border-white/[0.08] font-mono text-[10px] flex items-center justify-between">
                      <span className="text-slate-400">进行阶段</span>
                      <span className={
                        scene4Step === 'concentration_tested'
                          ? 'text-rose-400 font-semibold'
                          : scene4Step === 'substrate_tested_clash'
                          ? 'text-amber-300 font-semibold'
                          : scene4Step === 'drug_bound_distorted'
                          ? 'text-purple-300 font-semibold'
                          : 'text-cyan-300'
                      }>
                        {scene4Step === 'concentration_tested'
                          ? '⚠️ 底物拉满依然无效 (Vmax锁定10%)'
                          : scene4Step === 'substrate_tested_clash'
                          ? '🚫 活性中心已闭合，底物无法结合'
                          : scene4Step === 'drug_bound_distorted'
                          ? '🟣 构象已形变！活性中心收缩'
                          : '⚪ 待操作：请先结合别构抑制剂'}
                      </span>
                    </div>

                    {/* 3步互动引导 */}
                    <div className="space-y-1.5 text-slate-200">
                      <div className={`p-1.5 rounded-lg border transition-all flex items-start gap-1.5 ${
                        scene4Step === 'await_allosteric_drug'
                          ? 'bg-cyan-500/15 border-cyan-400/50 shadow-[0_0_10px_rgba(34,211,238,0.2)]'
                          : 'bg-white/[0.03] border-white/[0.06] opacity-80'
                      }`}>
                        <span className={`w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5 ${
                          scene4Step === 'await_allosteric_drug' ? 'bg-cyan-400 text-black animate-bounce' : 'bg-cyan-500/20 text-cyan-300'
                        }`}>1</span>
                        <div>
                          <span className="font-semibold text-cyan-300">第1步 · 结合别构位点：</span>
                          点击左侧<span className="text-white font-medium bg-cyan-950/80 px-1 py-0.5 rounded border border-cyan-400/40">【放入别构药】</span>，调节剂结合在侧翼非催化部位。
                        </div>
                      </div>

                      <div className={`p-1.5 rounded-lg border transition-all flex items-start gap-1.5 ${
                        scene4Step === 'drug_bound_distorted'
                          ? 'bg-purple-500/15 border-purple-400/50 shadow-[0_0_10px_rgba(168,85,247,0.2)]'
                          : 'bg-white/[0.03] border-white/[0.06] opacity-80'
                      }`}>
                        <span className={`w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5 ${
                          scene4Step === 'drug_bound_distorted' ? 'bg-purple-400 text-black animate-bounce' : 'bg-purple-500/20 text-purple-300'
                        }`}>2</span>
                        <div>
                          <span className="font-semibold text-purple-300">第2步 · 观察构象形变：</span>
                          酶发生空间构象形变，催化活性中心收缩变窄，此时点<span className="text-white font-medium bg-purple-950/80 px-1 py-0.5 rounded border border-purple-400/40">【放入底物】</span>验证无法嵌合。
                        </div>
                      </div>

                      <div className={`p-1.5 rounded-lg border transition-all flex items-start gap-1.5 ${
                        scene4Step === 'substrate_tested_clash' || scene4Step === 'concentration_tested'
                          ? 'bg-rose-500/15 border-rose-400/50 shadow-[0_0_10px_rgba(244,63,94,0.2)]'
                          : 'bg-white/[0.03] border-white/[0.06] opacity-80'
                      }`}>
                        <span className={`w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5 ${
                          scene4Step === 'substrate_tested_clash' ? 'bg-rose-400 text-white animate-bounce' : 'bg-rose-500/20 text-rose-300'
                        }`}>3</span>
                        <div>
                          <span className="font-semibold text-rose-300">第3步 · 验证不可逆性：</span>
                          尝试将<span className="text-cyan-200 font-medium">【底物浓度滑块】</span>拉至100%（或点<span className="text-white font-medium bg-rose-950/80 px-1 py-0.5 rounded border border-rose-400/40">【底物拉满】</span>），发现因口袋变形，**速率永久压死在10% (无法逆转)**！
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-[10px] text-cyan-200/80">点击右上方箭头展开别构抑制操作指引</div>
                )}
              </div>
            )}

            {/* 2. 紧凑解说字幕卡片 (可随时收起或重听) */}
            {!isSubtitleCollapsed ? (
              <div className="bg-[rgba(10,15,30,0.55)] backdrop-blur-[20px] -webkit-backdrop-blur-[20px] border border-white/[0.12] rounded-2xl p-3 sm:p-3.5 text-slate-100 shadow-[0_20px_48px_-4px_rgba(0,0,0,0.55),inset_0_1px_0_0_rgba(255,255,255,0.2)] space-y-2">
                <div className="flex items-center justify-between pb-1.5 border-b border-white/[0.08]">
                  <div className="flex items-center gap-1.5">
                    <Volume2 className="w-3.5 h-3.5 text-cyan-300" />
                    <span className="text-xs font-semibold text-white tracking-wide">
                      {activeSceneMeta.actBadge} · {activeSceneMeta.actName.split('·')[1]?.trim() || activeSceneMeta.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={handlePlayVoiceover}
                      className="px-2 py-0.5 rounded-lg border border-cyan-400/40 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 text-[10px] flex items-center gap-1 transition-colors"
                      title="重听本幕解说"
                    >
                      <Volume2 className="w-3 h-3 text-cyan-400" />
                      <span>重听</span>
                    </button>
                    <button
                      onClick={() => setIsSubtitleCollapsed(true)}
                      className="p-1 rounded-lg border border-white/[0.1] bg-white/[0.03] hover:bg-white/[0.08] text-[#94A3B8] hover:text-white text-xs transition-colors"
                      title="收起解说"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed max-h-36 overflow-y-auto pr-1 scrollbar-thin">
                  {activeSceneMeta.voiceover}
                </p>
                {/* 快捷切幕按钮 */}
                <div className="flex items-center justify-between pt-1 border-t border-white/[0.08] text-[11px]">
                  <button
                    onClick={handlePrevAct}
                    disabled={activeSceneIndex <= 0}
                    className={`px-2.5 py-1 rounded-xl border flex items-center gap-1 transition-all ${
                      activeSceneIndex <= 0
                        ? 'border-white/[0.05] bg-white/[0.01] text-slate-600 cursor-not-allowed'
                        : 'border-white/[0.12] bg-white/[0.03] hover:border-cyan-400/40 text-[#94A3B8] hover:text-white'
                    }`}
                  >
                    <ChevronLeft className="w-3 h-3" />
                    <span>上一幕</span>
                  </button>
                  <button
                    onClick={handleNextAct}
                    disabled={activeSceneIndex >= COURSE_SCENES.length - 1}
                    className={`px-3 py-1 rounded-xl border flex items-center gap-1 transition-all ${
                      activeSceneIndex >= COURSE_SCENES.length - 1
                        ? 'border-white/[0.05] bg-white/[0.01] text-slate-600 cursor-not-allowed'
                        : 'border-cyan-400/60 bg-cyan-500/20 hover:bg-cyan-500/30 text-[#A5F3FC] hover:text-white font-semibold'
                    }`}
                  >
                    <span>下一幕</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsSubtitleCollapsed(false)}
                className="px-3 py-1.5 rounded-xl bg-[rgba(10,15,30,0.55)] backdrop-blur-[20px] border border-white/[0.12] text-slate-300 hover:text-white text-xs shadow-md flex items-center gap-1.5 transition-all"
              >
                <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>展开解说字幕</span>
                <ChevronUp className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* 3. 底部导航栏与分幕路线图 */}
      <footer className="pointer-events-auto flex flex-col gap-2 shrink-0 transition-all max-w-6xl mx-auto w-full">
        {!isDockCollapsed ? (
          <div className="bg-[rgba(10,15,30,0.55)] backdrop-blur-[20px] -webkit-backdrop-blur-[20px] border border-white/[0.12] rounded-2xl p-2.5 sm:p-3 text-slate-100 shadow-[0_20px_48px_-4px_rgba(0,0,0,0.55),inset_0_1px_0_0_rgba(255,255,255,0.2)] space-y-2">
            {/* 顶栏信息与折叠按钮 */}
            <div className="flex items-center justify-between pb-1.5 border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-white tracking-wide">
                  课程路线图导航
                </span>
                <span className="text-[10px] text-cyan-300 hidden sm:inline">
                  (点击直接切换幕次，声音自动同步更新)
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    soundManager.playClickSFX();
                    onResetConformation();
                  }}
                  className="px-2 py-1 rounded-lg border border-white/[0.12] bg-white/[0.03] hover:border-white/25 text-[#94A3B8] hover:text-white text-[11px] transition-colors flex items-center gap-1"
                  title="重置分子模型"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>重置模型</span>
                </button>
                <button
                  onClick={() => setIsDockCollapsed(true)}
                  className="p-1 rounded-lg border border-white/[0.1] bg-white/[0.03] hover:bg-white/[0.08] text-[#94A3B8] hover:text-white text-xs transition-colors"
                  title="收起路线图"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* 6幕分幕条带 */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
              {COURSE_SCENES.filter(s => s.id !== 'scene1_transition' && s.id !== 'scene6_quiz').map((sceneItem) => {
                const isCurrent = sceneItem.id === currentScene;

                return (
                  <button
                    key={sceneItem.id}
                    onClick={() => {
                      soundManager.stopSpeech();
                      soundManager.playClickSFX();
                      onSelectScene(sceneItem.id);
                    }}
                    className={`px-3 py-2 rounded-xl border text-xs font-medium transition-all text-left flex flex-col gap-0.5 shrink-0 ${
                      isCurrent
                        ? 'border-2 border-cyan-400 bg-cyan-500/20 text-[#A5F3FC] shadow-[0_0_18px_rgba(34,211,238,0.4)] ring-2 ring-cyan-400/50'
                        : 'border-white/[0.08] bg-white/[0.02] text-[#94A3B8] hover:border-cyan-400/40 hover:text-white hover:bg-white/[0.06] backdrop-blur-md'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] px-1.5 py-0.2 rounded-md font-mono bg-white/[0.04] text-[#94A3B8] border border-white/[0.1]">
                        {sceneItem.actBadge}
                      </span>
                      <span className={`font-semibold whitespace-nowrap ${isCurrent ? 'text-white font-bold' : 'text-slate-300'}`}>
                        {sceneItem.actName.split('·')[1]?.trim() || sceneItem.title}
                      </span>
                      {isCurrent && (
                        <span className="text-[9px] px-1 py-0.2 rounded bg-cyan-400 text-slate-950 font-black shadow-sm">
                          进行中
                        </span>
                      )}
                    </div>
                    <span className={`text-[10px] truncate max-w-[130px] ${isCurrent ? 'text-cyan-200' : 'text-[#94A3B8]'}`}>
                      {sceneItem.title}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <button
              onClick={() => setIsDockCollapsed(false)}
              className="px-4 py-1.5 rounded-xl bg-[rgba(10,15,30,0.55)] backdrop-blur-[20px] border border-white/[0.12] text-cyan-300 hover:text-white text-xs shadow-lg flex items-center gap-1.5 transition-all"
            >
              <span>展开课程路线图导航</span>
              <ChevronUp className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </footer>
    </div>
  );
};
