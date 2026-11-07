import React, { useState } from 'react';
import { Activity, Sliders, Pill, HelpCircle, Layers, ArrowRight } from 'lucide-react';
import { CLINICAL_DRUGS } from '../data/courseData';
import { soundManager } from '../audio/soundManager';

interface KineticsPanelProps {
  onApplyDrugToScene?: (type: 'competitive' | 'noncompetitive') => void;
}

export const KineticsPanel: React.FC<KineticsPanelProps> = ({ onApplyDrugToScene }) => {
  const [substrateConc, setSubstrateConc] = useState<number>(40); // 0 to 100 mM
  const [inhibitorConc, setInhibitorConc] = useState<number>(30); // 0 to 100 uM
  const [activeDrugIndex, setActiveDrugIndex] = useState<number>(0);
  const [plotMode, setPlotMode] = useState<'mm' | 'lb'>('mm'); // 'mm' = Michaelis-Menten, 'lb' = Lineweaver-Burk

  // Baseline enzyme kinetic parameters
  const Vmax_base = 100; // umol/min
  const Km_base = 25;    // mM
  const Ki = 20;         // uM

  // Competitive calculations
  const alphaComp = 1 + inhibitorConc / Ki;
  const Km_comp = Km_base * alphaComp;
  const Vmax_comp = Vmax_base;
  const v_normal = (Vmax_base * substrateConc) / (Km_base + substrateConc);
  const v_comp = (Vmax_comp * substrateConc) / (Km_comp + substrateConc);

  // Non-competitive calculations
  const alphaNonComp = 1 + inhibitorConc / Ki;
  const Km_noncomp = Km_base;
  const Vmax_noncomp = Vmax_base / alphaNonComp;
  const v_noncomp = (Vmax_noncomp * substrateConc) / (Km_noncomp + substrateConc);

  const selectedDrug = CLINICAL_DRUGS[activeDrugIndex];

  const handleSelectDrug = (index: number) => {
    soundManager.playClickSFX();
    setActiveDrugIndex(index);
    const drug = CLINICAL_DRUGS[index];
    if (onApplyDrugToScene) {
      onApplyDrugToScene(drug.type);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-[rgba(10,15,30,0.55)] backdrop-blur-[24px] -webkit-backdrop-blur-[24px] border border-white/[0.14] rounded-2xl p-4 sm:p-6 text-slate-100 shadow-[0_24px_60px_-4px_rgba(0,0,0,0.7),inset_0_1px_0_0_rgba(255,255,255,0.2)]">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold tracking-[1.2px] bg-gradient-to-r from-white to-[#A5F3FC] bg-clip-text text-transparent flex items-center gap-2">
              酶促动力学实验室与临床靶向药物仿真
            </h3>
            <p className="text-xs text-[#94A3B8] font-light">
              实时比对米氏方程（Michaelis-Menten）与双倒数图（Lineweaver-Burk）
            </p>
          </div>
        </div>

        {/* Plot Mode Toggle */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-800/80 border border-slate-700">
          <button
            onClick={() => {
              soundManager.playClickSFX();
              setPlotMode('mm');
            }}
            className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${
              plotMode === 'mm'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            米氏曲线 (v vs [S])
          </button>
          <button
            onClick={() => {
              soundManager.playClickSFX();
              setPlotMode('lb');
            }}
            className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${
              plotMode === 'lb'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            双倒数图 (1/v vs 1/[S])
          </button>
        </div>
      </div>

      {/* Main Grid: Graph + Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 my-4">
        {/* Graph Canvas Visualizer */}
        <div className="lg:col-span-7 bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-mono text-cyan-400 font-bold">
              {plotMode === 'mm' ? 'Michaelis-Menten 饱和动力学曲线' : 'Lineweaver-Burk 双倒数线性拟合'}
            </span>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-[11px] text-cyan-400">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block"></span> 正常无抑制
              </span>
              <span className="flex items-center gap-1 text-[11px] text-amber-400">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block"></span> 竞争性
              </span>
              <span className="flex items-center gap-1 text-[11px] text-pink-400">
                <span className="w-2.5 h-2.5 rounded-full bg-pink-400 inline-block"></span> 非竞争性
              </span>
            </div>
          </div>

          {/* SVG Plot */}
          <div className="relative w-full h-52 sm:h-56 bg-slate-900/60 rounded-lg border border-slate-800/80 overflow-hidden">
            <svg className="w-full h-full p-2" viewBox="0 0 400 200">
              {/* Grid lines */}
              <line x1="40" y1="20" x2="40" y2="175" stroke="#334155" strokeWidth="1.5" />
              <line x1="40" y1="175" x2="385" y2="175" stroke="#334155" strokeWidth="1.5" />

              {plotMode === 'mm' ? (
                <>
                  {/* Axis labels */}
                  <text x="350" y="195" fill="#64748b" fontSize="11" fontFamily="sans-serif">
                    [S] 底物浓度
                  </text>
                  <text x="5" y="25" fill="#64748b" fontSize="11" fontFamily="sans-serif">
                    v 速度
                  </text>

                  {/* Vmax asymptote line */}
                  <line x1="40" y1="35" x2="385" y2="35" stroke="#475569" strokeDasharray="4 4" strokeWidth="1" />
                  <text x="45" y="30" fill="#94a3b8" fontSize="10">理论 Vmax = 100</text>

                  {/* Curve 1: Normal (Cyan) */}
                  <path
                    d={`M 40 175 Q 120 70, 385 45`}
                    fill="none"
                    stroke="#22d3ee"
                    strokeWidth="3"
                  />

                  {/* Curve 2: Competitive (Amber) - Same plateau, shifted right */}
                  <path
                    d={`M 40 175 Q 220 120, 385 52`}
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="2.5"
                    strokeDasharray="2 0"
                  />

                  {/* Curve 3: Non-competitive (Pink) - Lower plateau */}
                  <path
                    d={`M 40 175 Q 130 115, 385 105`}
                    fill="none"
                    stroke="#ec4899"
                    strokeWidth="2.5"
                  />

                  {/* Current [S] marker */}
                  {(() => {
                    const markerX = 40 + (substrateConc / 100) * 340;
                    return (
                      <line
                        x1={markerX}
                        y1="25"
                        x2={markerX}
                        y2="175"
                        stroke="#e2e8f0"
                        strokeWidth="1.5"
                        strokeDasharray="2 2"
                      />
                    );
                  })()}
                </>
              ) : (
                <>
                  {/* Double Reciprocal Plot */}
                  <line x1="120" y1="20" x2="120" y2="175" stroke="#334155" strokeWidth="1.5" />
                  <line x1="15" y1="150" x2="385" y2="150" stroke="#334155" strokeWidth="1.5" />

                  <text x="340" y="168" fill="#64748b" fontSize="11">1/[S]</text>
                  <text x="125" y="25" fill="#64748b" fontSize="11">1/v</text>

                  {/* Normal Line (Cyan) passing through (120, 100) */}
                  <line x1="50" y1="150" x2="360" y2="35" stroke="#22d3ee" strokeWidth="2.5" />

                  {/* Competitive Line (Amber) intersects Y-axis at SAME point, but X-axis shifted right */}
                  <line x1="80" y1="150" x2="360" y2="10" stroke="#f59e0b" strokeWidth="2.5" />

                  {/* Non-competitive Line (Pink) intersects X-axis at SAME point, but Y-axis higher */}
                  <line x1="50" y1="150" x2="360" y2="15" stroke="#ec4899" strokeWidth="2.5" />
                </>
              )}
            </svg>
          </div>

          {/* Quantitative Readouts */}
          <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-800 text-center">
            <div className="p-1.5 rounded-lg bg-cyan-950/40 border border-cyan-800/40">
              <span className="text-[10px] text-cyan-400 block font-semibold">无抑制正常速度 v</span>
              <span className="text-sm font-mono font-bold text-white">{v_normal.toFixed(1)}</span>
              <span className="text-[10px] text-slate-400 block">Km: 25 mM</span>
            </div>
            <div className="p-1.5 rounded-lg bg-amber-950/40 border border-amber-800/40">
              <span className="text-[10px] text-amber-400 block font-semibold">竞争性抑制速度</span>
              <span className="text-sm font-mono font-bold text-amber-300">{v_comp.toFixed(1)}</span>
              <span className="text-[10px] text-slate-400 block">Km↑: {Km_comp.toFixed(0)} mM</span>
            </div>
            <div className="p-1.5 rounded-lg bg-pink-950/40 border border-pink-800/40">
              <span className="text-[10px] text-pink-400 block font-semibold">非竞争抑制速度</span>
              <span className="text-sm font-mono font-bold text-pink-300">{v_noncomp.toFixed(1)}</span>
              <span className="text-[10px] text-slate-400 block">Vmax↓: {Vmax_noncomp.toFixed(0)}</span>
            </div>
          </div>
        </div>

        {/* Sliders & Drug Selection */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
          {/* Concentration Sliders */}
          <div className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-4 space-y-3.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400">
              <Sliders className="w-4 h-4" />
              <span>生化反应条件调节滑块</span>
            </div>

            {/* Substrate Slider */}
            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>底物浓度 [S]</span>
                <span className="font-mono text-cyan-300 font-bold">{substrateConc} mM</span>
              </div>
              <input
                type="range"
                min="5"
                max="100"
                value={substrateConc}
                onChange={(e) => setSubstrateConc(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
              />
              <span className="text-[10px] text-slate-400">
                提示：大幅增加 [S] 可显著消除竞争性抑制剂的阻断效果。
              </span>
            </div>

            {/* Inhibitor Slider */}
            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>抑制剂药物浓度 [I]</span>
                <span className="font-mono text-amber-400 font-bold">{inhibitorConc} μM</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={inhibitorConc}
                onChange={(e) => setInhibitorConc(Number(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
              />
            </div>
          </div>

          {/* Clinical Drugs Swatches */}
          <div className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <Pill className="w-3.5 h-3.5 text-indigo-400" />
                临床代表药物靶向案例
              </span>
              <span className="text-[10px] text-cyan-400 font-mono">点击应用至3D微观场景</span>
            </div>

            <div className="space-y-2">
              {CLINICAL_DRUGS.map((drug, index) => {
                const isSelected = activeDrugIndex === index;
                return (
                  <button
                    key={drug.name}
                    onClick={() => handleSelectDrug(index)}
                    className={`w-full text-left p-2.5 rounded-lg border transition-all text-xs flex items-center justify-between ${
                      isSelected
                        ? drug.type === 'competitive'
                          ? 'bg-amber-950/60 border-amber-500/80 shadow-md'
                          : 'bg-pink-950/60 border-pink-500/80 shadow-md'
                        : 'bg-slate-900/60 border-slate-700/60 hover:border-slate-500'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-white flex items-center gap-1.5">
                        {drug.name}
                        <span
                          className={`text-[9px] px-1.5 py-0.2 rounded font-semibold ${
                            drug.type === 'competitive'
                              ? 'bg-amber-900/80 text-amber-300 border border-amber-700'
                              : 'bg-pink-900/80 text-pink-300 border border-pink-700'
                          }`}
                        >
                          {drug.type === 'competitive' ? '竞争性' : '非竞争性'}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        靶酶：{drug.targetEnzyme} · {drug.englishName}
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Selected Drug Medical Summary Card */}
      <div className="p-3.5 rounded-xl bg-slate-950/90 border border-cyan-500/20 text-xs">
        <div className="flex items-center gap-2 font-bold text-cyan-300 mb-1">
          <span>临床药理学作用机制剖析：{selectedDrug.name}</span>
        </div>
        <p className="text-slate-300 text-[11px] leading-relaxed">
          {selectedDrug.clinicalUse}。{selectedDrug.mechanism}
        </p>
      </div>
    </div>
  );
};
