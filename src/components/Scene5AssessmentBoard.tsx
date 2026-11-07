import React, { useState, useEffect } from 'react';
import {
  Award,
  CheckCircle,
  XCircle,
  Sparkles,
  Clock,
  Target,
  BookOpen,
  ArrowRight,
  RotateCcw,
  Zap,
  ShieldAlert,
  Layers,
  Volume2,
  Play,
  Share2,
  Check
} from 'lucide-react';
import { soundManager } from '../audio/soundManager';
import { SceneId } from '../types/vrCourse';

interface Scene5AssessmentBoardProps {
  onTriggerFireworks: () => void;
  onRestartCourse: () => void;
  onSelectScene: (sceneId: SceneId) => void;
}

export const Scene5AssessmentBoard: React.FC<Scene5AssessmentBoardProps> = ({
  onTriggerFireworks,
  onRestartCourse,
  onSelectScene,
}) => {
  // Assessment Steps: 1 (Question 1), 2 (Question 2 Curve Match), 3 (Medal & Report)
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Question 1 State
  const [q1Answer, setQ1Answer] = useState<'effective' | 'ineffective' | null>(null);
  const [q1Submitted, setQ1Submitted] = useState<boolean>(false);

  // Question 2 Curve Match State
  // Card A: Km增大，Vmax不变 -> Target: competitive
  // Card B: Km不变，Vmax降低 -> Target: noncompetitive
  const [selectedCard, setSelectedCard] = useState<'curveA' | 'curveB' | null>(null);
  const [compSlotMatched, setCompSlotMatched] = useState<'curveA' | 'curveB' | null>(null);
  const [nonCompSlotMatched, setNonCompSlotMatched] = useState<'curveA' | 'curveB' | null>(null);
  const [isQ2Submitted, setIsQ2Submitted] = useState<boolean>(false);

  // Timer for session duration in report
  const [secondsElapsed, setSecondsElapsed] = useState<number>(145); // default realistic demo time
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, '0')}分 ${String(secs).padStart(2, '0')}秒`;
  };

  // Question 1 Handler
  const handleSelectQ1 = (choice: 'effective' | 'ineffective') => {
    setQ1Answer(choice);
    setQ1Submitted(true);
    soundManager.playClickSFX();

    if (choice === 'effective') {
      soundManager.playReactionSuccessSFX();
      soundManager.playBeepSFX(1200);
      onTriggerFireworks();
    } else {
      soundManager.playAlertSFX();
    }
  };

  // Question 2 Match Handlers
  const handleSlotClick = (slot: 'competitive' | 'noncompetitive') => {
    if (!selectedCard) return;
    soundManager.playClickSFX();

    if (slot === 'competitive') {
      if (selectedCard === 'curveA') {
        setCompSlotMatched('curveA');
        soundManager.playReactionSuccessSFX();
      } else {
        setCompSlotMatched('curveB');
        soundManager.playAlertSFX();
      }
    } else {
      if (selectedCard === 'curveB') {
        setNonCompSlotMatched('curveB');
        soundManager.playReactionSuccessSFX();
      } else {
        setNonCompSlotMatched('curveA');
        soundManager.playAlertSFX();
      }
    }
    setSelectedCard(null);
  };

  // Check if both matched correctly
  const isQ2FullyCorrect = compSlotMatched === 'curveA' && nonCompSlotMatched === 'curveB';

  const handleFinishAssessment = () => {
    setStep(3);
    soundManager.playCheerSFX();
    soundManager.playLevelUpMedalSFX();
    onTriggerFireworks();

    soundManager.speak(
      '太棒了！通过本次VR微观体验，你已经彻底掌握了酶的两种核心抑制机制及其在药物研发中的应用。记住，理解分子与靶点的互动，是开启现代精准药物治疗的关键钥匙。实验结束，感谢你的体验！'
    );
  };

  const handleResetAssessment = () => {
    soundManager.playClickSFX();
    setStep(1);
    setQ1Answer(null);
    setQ1Submitted(false);
    setSelectedCard(null);
    setCompSlotMatched(null);
    setNonCompSlotMatched(null);
    setIsQ2Submitted(false);
  };

  return (
    <div className="pointer-events-auto w-full max-w-2xl mx-auto my-auto transition-all animate-fade-in z-40">
      <div className="bg-slate-900/95 border border-cyan-500/50 rounded-2xl p-4 sm:p-6 text-slate-100 shadow-[0_0_50px_rgba(6,182,212,0.35)] backdrop-blur-xl space-y-4">
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-2.5 border-b border-cyan-500/20">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-slate-950 font-black shadow-md">
              <Award className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm sm:text-base font-bold text-white">
                  第5幕 · 对比总结与临床考核关卡
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                  时长约 2.5 分钟
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                左右对比两种抑制模型，完成实战考核题解锁达人勋章与报告
              </p>
            </div>
          </div>

          {/* Step Pills */}
          <div className="flex items-center gap-1 text-[11px] font-mono">
            {[1, 2, 3].map((s) => (
              <span
                key={s}
                className={`w-6 h-6 rounded-full flex items-center justify-center font-bold transition-all ${
                  step === s
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/40 ring-2 ring-cyan-300'
                    : step > s
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50'
                    : 'bg-slate-800 text-slate-500 border border-slate-700'
                }`}
              >
                {step > s ? '✓' : s}
              </span>
            ))}
          </div>
        </div>

        {/* STEP 1: Question 1 (他汀增加底物浓度是否有效) */}
        {step === 1 && (
          <div className="space-y-3.5 animate-slide-up">
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-cyan-400 font-mono flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5" />
                  题目 1 / 2 · 临床药物实战辨析
                </span>
                <span className="text-[10px] text-slate-400 font-mono">考点：他汀类机制与逆转性</span>
              </div>
              <p className="text-sm font-semibold text-white leading-relaxed">
                “临床上使用他汀类药物降低血脂，若想减轻药物的过度抑制效果，增加体内的底物浓度是否有效？”
              </p>
            </div>

            {/* Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Option A: 有效（竞争性） */}
              <button
                onClick={() => handleSelectQ1('effective')}
                className={`p-3.5 rounded-xl border text-left transition-all flex items-start gap-2.5 ${
                  q1Answer === 'effective'
                    ? 'bg-emerald-950/70 border-emerald-400 text-emerald-100 ring-2 ring-emerald-500 shadow-lg shadow-emerald-950/50'
                    : 'bg-slate-800/70 border-slate-700 hover:border-cyan-500 hover:bg-slate-800 text-slate-200'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center font-mono text-xs shrink-0 mt-0.5 ${
                    q1Answer === 'effective'
                      ? 'bg-emerald-500 text-slate-950 font-bold'
                      : 'bg-slate-900 border border-slate-700 text-slate-400'
                  }`}
                >
                  A
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-xs sm:text-sm text-emerald-300 flex items-center gap-1.5">
                    <span>【有效（竞争性）】</span>
                    {q1Answer === 'effective' && (
                      <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    药物与底物抢占同一个活性中心，可借高浓度底物挤走药物
                  </p>
                </div>
              </button>

              {/* Option B: 无效（非竞争性） */}
              <button
                onClick={() => handleSelectQ1('ineffective')}
                className={`p-3.5 rounded-xl border text-left transition-all flex items-start gap-2.5 ${
                  q1Answer === 'ineffective'
                    ? 'bg-red-950/70 border-red-400 text-red-100 ring-2 ring-red-500 shadow-lg shadow-red-950/50'
                    : 'bg-slate-800/70 border-slate-700 hover:border-cyan-500 hover:bg-slate-800 text-slate-200'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center font-mono text-xs shrink-0 mt-0.5 ${
                    q1Answer === 'ineffective'
                      ? 'bg-red-500 text-slate-950 font-bold'
                      : 'bg-slate-900 border border-slate-700 text-slate-400'
                  }`}
                >
                  B
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-xs sm:text-sm text-red-300 flex items-center gap-1.5">
                    <span>【无效（非竞争性）】</span>
                    {q1Answer === 'ineffective' && (
                      <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    结合别构中心引起催化构象变形，增加底物浓度毫无作用
                  </p>
                </div>
              </button>
            </div>

            {/* Detailed Feedback & Next Button */}
            {q1Submitted && (
              <div
                className={`p-3.5 rounded-xl border text-xs leading-relaxed animate-fade-in ${
                  q1Answer === 'effective'
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                    : 'bg-red-950/40 border-red-500/40 text-red-200'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold mb-1">
                  {q1Answer === 'effective' ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-300">
                        正确！周围已触发庆祝烟花特效 🎉
                      </span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 text-red-400" />
                      <span className="text-red-300">分析提示：</span>
                    </>
                  )}
                </div>
                <p className="text-[11px] text-slate-300">
                  {q1Answer === 'effective'
                    ? '阿托伐他汀/洛伐他汀为竞争性抑制剂，其一端分子结构与底物极相似，抢占同一活性中心。依据质量作用定律，大量增加底物浓度可通过“人海战术”以更大概率挤走药物，恢复原本的最大反应速度 Vmax！'
                    : '他汀类并非作用于别构位点的非竞争性抑制剂，而是争夺催化活性中心的典型竞争性抑制剂。因此，增加底物浓度是完全能够有效逆转抑制的。'}
                </p>

                {q1Answer === 'effective' && (
                  <div className="mt-3 flex justify-end">
                    <button
                      onClick={() => {
                        soundManager.playClickSFX();
                        setStep(2);
                      }}
                      className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/25 flex items-center gap-1.5 transition-all"
                    >
                      <span>进入题目 2：动力学曲线匹配</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* STEP 2: Question 2 (米氏方程曲线图拖拽/点击匹配) */}
        {step === 2 && (
          <div className="space-y-3.5 animate-slide-up">
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-cyan-400 font-mono flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5" />
                  题目 2 / 2 · 三维动力学图表配对小游戏
                </span>
                <span className="text-[10px] text-slate-400 font-mono">考点：Km 与 Vmax 曲线特征</span>
              </div>
              <p className="text-sm font-semibold text-white leading-relaxed">
                “请将下方的【米氏方程曲线图变化】卡片，点击或拖拽匹配到对应的抑制类型目标槽上。”
              </p>
            </div>

            {/* Target Slots: Left = 竞争性抑制模型, Right = 非竞争性抑制模型 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Left Target Slot: 竞争性抑制模型 */}
              <div
                onClick={() => handleSlotClick('competitive')}
                className={`p-3 rounded-xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between min-h-[110px] ${
                  compSlotMatched === 'curveA'
                    ? 'bg-emerald-950/50 border-emerald-400 shadow-md shadow-emerald-500/20 ring-1 ring-emerald-400'
                    : compSlotMatched === 'curveB'
                    ? 'bg-red-950/50 border-red-500 ring-1 ring-red-400'
                    : selectedCard
                    ? 'bg-slate-800/80 border-cyan-400 hover:bg-slate-700/80 ring-2 ring-cyan-500/50'
                    : 'bg-slate-950/70 border-slate-700 hover:border-slate-500'
                }`}
              >
                <div className="flex items-center justify-between pb-1 border-b border-slate-800">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-red-400">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>【左侧目标：竞争性抑制】</span>
                  </div>
                  {compSlotMatched === 'curveA' && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40 flex items-center gap-0.5">
                      <Check className="w-3 h-3" /> 配对正确
                    </span>
                  )}
                </div>

                <div className="text-center py-2">
                  {compSlotMatched === 'curveA' ? (
                    <div className="space-y-0.5">
                      <div className="text-xs font-bold text-emerald-300">
                        ✓ 匹配成功：Km 增大，Vmax 不变
                      </div>
                      <div className="text-[10px] text-slate-300 font-mono">
                        曲线右移，无限接近原 Vmax 渐近线
                      </div>
                    </div>
                  ) : compSlotMatched === 'curveB' ? (
                    <div className="text-xs font-semibold text-red-300">
                      ✖ 错误：曲线 B 为非竞争性抑制特征，请重新选择！
                    </div>
                  ) : (
                    <div className="text-[11px] text-slate-400 font-medium">
                      {selectedCard
                        ? '👉 点击将选中的曲线卡片放入此槽'
                        : '（等待匹配对应的动力学曲线卡片）'}
                    </div>
                  )}
                </div>

                <div className="text-[9px] text-slate-500 font-mono text-right">
                  对应 3D 视野左侧亮红色他汀模型
                </div>
              </div>

              {/* Right Target Slot: 非竞争性抑制模型 */}
              <div
                onClick={() => handleSlotClick('noncompetitive')}
                className={`p-3 rounded-xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between min-h-[110px] ${
                  nonCompSlotMatched === 'curveB'
                    ? 'bg-emerald-950/50 border-emerald-400 shadow-md shadow-emerald-500/20 ring-1 ring-emerald-400'
                    : nonCompSlotMatched === 'curveA'
                    ? 'bg-red-950/50 border-red-500 ring-1 ring-red-400'
                    : selectedCard
                    ? 'bg-slate-800/80 border-cyan-400 hover:bg-slate-700/80 ring-2 ring-cyan-500/50'
                    : 'bg-slate-950/70 border-slate-700 hover:border-slate-500'
                }`}
              >
                <div className="flex items-center justify-between pb-1 border-b border-slate-800">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-400">
                    <Layers className="w-3.5 h-3.5" />
                    <span>【右侧目标：非竞争性抑制】</span>
                  </div>
                  {nonCompSlotMatched === 'curveB' && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40 flex items-center gap-0.5">
                      <Check className="w-3 h-3" /> 配对正确
                    </span>
                  )}
                </div>

                <div className="text-center py-2">
                  {nonCompSlotMatched === 'curveB' ? (
                    <div className="space-y-0.5">
                      <div className="text-xs font-bold text-emerald-300">
                        ✓ 匹配成功：Km 不变，Vmax 降低
                      </div>
                      <div className="text-[10px] text-slate-300 font-mono">
                        催化构象受损，渐近线高度被直接腰斩
                      </div>
                    </div>
                  ) : nonCompSlotMatched === 'curveA' ? (
                    <div className="text-xs font-semibold text-red-300">
                      ✖ 错误：曲线 A 为竞争性抑制特征，请重新选择！
                    </div>
                  ) : (
                    <div className="text-[11px] text-slate-400 font-medium">
                      {selectedCard
                        ? '👉 点击将选中的曲线卡片放入此槽'
                        : '（等待匹配对应的动力学曲线卡片）'}
                    </div>
                  )}
                </div>

                <div className="text-[9px] text-slate-500 font-mono text-right">
                  对应 3D 视野右侧蓝色别构畸变模型
                </div>
              </div>
            </div>

            {/* Source Curve Cards (Draggable / Clickable) */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-cyan-400" />
                待配对米氏曲线卡片（点击卡片即可拾取，再点击上方插槽匹配）：
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* Curve Card A */}
                <div
                  onClick={() => {
                    soundManager.playClickSFX();
                    setSelectedCard(selectedCard === 'curveA' ? null : 'curveA');
                  }}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center gap-3 ${
                    compSlotMatched === 'curveA'
                      ? 'opacity-40 border-slate-800 bg-slate-900/60 pointer-events-none'
                      : selectedCard === 'curveA'
                      ? 'border-amber-400 bg-amber-950/40 ring-2 ring-amber-400 shadow-md shadow-amber-500/30'
                      : 'border-slate-700 bg-slate-800/80 hover:border-cyan-400 hover:bg-slate-800'
                  }`}
                >
                  {/* Mini SVG Graph for Curve A */}
                  <div className="w-16 h-12 bg-slate-950 rounded-lg border border-slate-800 p-1 shrink-0 flex items-center justify-center">
                    <svg viewBox="0 0 100 65" className="w-full h-full">
                      {/* Axes */}
                      <line x1="10" y1="55" x2="95" y2="55" stroke="#475569" strokeWidth="1.5" />
                      <line x1="10" y1="55" x2="10" y2="8" stroke="#475569" strokeWidth="1.5" />
                      {/* Vmax asymptote line */}
                      <line x1="10" y1="16" x2="95" y2="16" stroke="#94a3b8" strokeDasharray="2,2" strokeWidth="1" />
                      {/* Normal control curve (gray) */}
                      <path d="M 10 55 Q 25 22 95 18" fill="none" stroke="#64748b" strokeWidth="1.2" />
                      {/* Competitive shifted curve (amber, reaches same height) */}
                      <path d="M 10 55 Q 52 35 95 18" fill="none" stroke="#f59e0b" strokeWidth="2.5" />
                    </svg>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-amber-300">
                      【曲线 A：右移达同峰】
                    </div>
                    <div className="text-[11px] font-mono text-emerald-300 font-semibold">
                      Km 增大，Vmax 不变
                    </div>
                    <p className="text-[10px] text-slate-400 truncate">
                      半饱和底物浓度右移，底物过量可恢复原本 Vmax
                    </p>
                  </div>
                </div>

                {/* Curve Card B */}
                <div
                  onClick={() => {
                    soundManager.playClickSFX();
                    setSelectedCard(selectedCard === 'curveB' ? null : 'curveB');
                  }}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center gap-3 ${
                    nonCompSlotMatched === 'curveB'
                      ? 'opacity-40 border-slate-800 bg-slate-900/60 pointer-events-none'
                      : selectedCard === 'curveB'
                      ? 'border-cyan-400 bg-cyan-950/40 ring-2 ring-cyan-400 shadow-md shadow-cyan-500/30'
                      : 'border-slate-700 bg-slate-800/80 hover:border-cyan-400 hover:bg-slate-800'
                  }`}
                >
                  {/* Mini SVG Graph for Curve B */}
                  <div className="w-16 h-12 bg-slate-950 rounded-lg border border-slate-800 p-1 shrink-0 flex items-center justify-center">
                    <svg viewBox="0 0 100 65" className="w-full h-full">
                      {/* Axes */}
                      <line x1="10" y1="55" x2="95" y2="55" stroke="#475569" strokeWidth="1.5" />
                      <line x1="10" y1="55" x2="10" y2="8" stroke="#475569" strokeWidth="1.5" />
                      {/* Lowered Vmax asymptote line */}
                      <line x1="10" y1="34" x2="95" y2="34" stroke="#94a3b8" strokeDasharray="2,2" strokeWidth="1" />
                      {/* Normal control curve (gray) */}
                      <path d="M 10 55 Q 25 22 95 18" fill="none" stroke="#64748b" strokeWidth="1.2" />
                      {/* Non-competitive capped curve (cyan, capped at low Vmax) */}
                      <path d="M 10 55 Q 25 38 95 35" fill="none" stroke="#38bdf8" strokeWidth="2.5" />
                    </svg>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-cyan-300">
                      【曲线 B：峰值腰斩】
                    </div>
                    <div className="text-[11px] font-mono text-cyan-200 font-semibold">
                      Km 不变，Vmax 降低
                    </div>
                    <p className="text-[10px] text-slate-400 truncate">
                      构象畸变，催化速率上限被永久压低
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Completion Trigger Button */}
            {isQ2FullyCorrect && (
              <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-950/60 to-cyan-950/60 border border-emerald-500/50 flex items-center justify-between animate-fade-in">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <div className="text-xs font-bold text-emerald-300">
                      两组动力学曲线配对完全正确！
                    </div>
                    <div className="text-[10px] text-slate-300">
                      已彻底掌握竞争性与非竞争性的数学本质与空间分子机制
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleFinishAssessment}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/30 flex items-center gap-1.5 transition-all"
                >
                  <Sparkles className="w-4 h-4 fill-slate-950" />
                  <span>领取勋章与报告</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* STEP 3: 通关结算与“临床药学生化达人”勋章与学习报告 */}
        {step === 3 && (
          <div className="space-y-4 animate-slide-up text-center py-2">
            {/* Holographic Glowing 3D Medal Emblem */}
            <div className="relative inline-block mx-auto mb-1">
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-amber-500 via-yellow-300 to-amber-600 p-1.5 shadow-[0_0_50px_rgba(245,158,11,0.6)] animate-pulse">
                <div className="w-full h-full rounded-full bg-slate-950 border-2 border-amber-400 flex flex-col items-center justify-center text-amber-300">
                  <Award className="w-10 h-10 text-amber-400 filter drop-shadow-md" />
                  <span className="text-[8px] font-mono font-black tracking-widest text-amber-300 uppercase mt-0.5">
                    BIOCHEM
                  </span>
                </div>
              </div>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-[10px] shadow-md uppercase tracking-wider whitespace-nowrap">
                ★ 临床药学生化达人 ★
              </div>
            </div>

            <h3 className="text-xl font-black text-white pt-2">
              恭喜通关！荣获【临床药学生化达人】认证
            </h3>
            <p className="text-xs text-slate-300 max-w-lg mx-auto leading-relaxed">
              “太棒了！通过本次VR微观体验，你已经彻底掌握了酶的两种核心抑制机制及其在药物研发中的应用。记住，理解分子与靶点的互动，是开启现代精准药物治疗的关键钥匙。实验结束，感谢你的体验！”
            </p>

            {/* Learning Report (学习报告) */}
            <div className="bg-slate-950/80 border border-cyan-500/30 rounded-2xl p-4 text-left space-y-3 max-w-xl mx-auto shadow-inner">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-300">
                  <BookOpen className="w-4 h-4 text-cyan-400" />
                  <span>本次沉浸式实验学习报告 (Course Report)</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">
                  NO. MED-2026-VR-BIOCHEM
                </span>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-cyan-400" />
                  <div>
                    <div className="text-[10px] text-slate-400">实验累计时长</div>
                    <div className="font-bold text-white">{formatTime(secondsElapsed)}</div>
                  </div>
                </div>

                <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2">
                  <Target className="w-4 h-4 text-emerald-400" />
                  <div>
                    <div className="text-[10px] text-slate-400">考核准确率</div>
                    <div className="font-bold text-emerald-300">100% (满分卓越)</div>
                  </div>
                </div>
              </div>

              {/* Core Knowledge Review */}
              <div className="space-y-2 pt-1 text-xs">
                <div className="text-[11px] font-bold text-slate-200">
                  📚 核心生化与临床考点回顾：
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900/90 border border-red-500/30 space-y-1">
                  <div className="font-bold text-red-300 flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
                    <span>1. 竞争性抑制（以阿托伐他汀 / 洛伐他汀为例）</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-snug">
                    • 机制：药物一端结构与天然底物极相似，抢占活性中心催化口袋。
                    <br />
                    • 特征：<strong className="text-emerald-300">Km 增大，Vmax 不变</strong>。增加底物浓度可通过人海战术解除抑制。
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900/90 border border-cyan-500/30 space-y-1">
                  <div className="font-bold text-cyan-300 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-cyan-400" />
                    <span>2. 非竞争性抑制（以别构药物与重金属为例）</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-snug">
                    • 机制：药物结合侧面“别构位点”，通过变构效应使活性中心空间畸变。
                    <br />
                    • 特征：<strong className="text-cyan-300">Km 不变，Vmax 降低</strong>。增加底物浓度无法恢复催化活性。
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
              <button
                onClick={handleResetAssessment}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                重新测试一次
              </button>

              <button
                onClick={() => {
                  soundManager.playClickSFX();
                  soundManager.speak(
                    '太棒了！通过本次VR微观体验，你已经彻底掌握了酶的两种核心抑制机制及其在药物研发中的应用。记住，理解分子与靶点的互动，是开启现代精准药物治疗的关键钥匙。实验结束，感谢你的体验！'
                  );
                }}
                className="px-4 py-2 rounded-xl bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Volume2 className="w-3.5 h-3.5" />
                重播通关解说语音
              </button>

              <button
                onClick={() => {
                  soundManager.playClickSFX();
                  onRestartCourse();
                }}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-cyan-500/25 flex items-center gap-1.5 transition-all"
              >
                <span>返回生化实验室从头体验</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
