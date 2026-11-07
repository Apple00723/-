import React from 'react';
import { X, Glasses, Gamepad2, MousePointer, Info, Cpu, CheckCircle2, ArrowDown } from 'lucide-react';
import { soundManager } from '../audio/soundManager';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GuideModal: React.FC<GuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl bg-[rgba(10,15,30,0.55)] backdrop-blur-[24px] -webkit-backdrop-blur-[24px] border border-white/[0.14] rounded-2xl p-6 sm:p-8 text-slate-100 shadow-[0_24px_60px_-4px_rgba(0,0,0,0.7),inset_0_1px_0_0_rgba(255,255,255,0.2)] max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={() => {
            soundManager.playClickSFX();
            onClose();
          }}
          className="absolute top-5 right-5 p-2 rounded-xl border border-white/[0.1] bg-white/[0.03] hover:bg-white/[0.08] text-[#94A3B8] hover:text-white transition-colors"
          title="关闭"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/[0.08]">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Gamepad2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              VR课件操作与设备指引
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800">
                跨平台兼容
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              《微观视界：酶的抑制与药物靶向》· 沉浸式生物化学与临床药理教学平台
            </p>
          </div>
        </div>

        {/* Device Guides */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
          {/* VR Headset & Controllers (Pico / Meta Quest) */}
          <div className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-4.5 hover:border-cyan-500/40 transition-colors">
            <div className="flex items-center gap-2.5 text-cyan-400 font-semibold mb-3">
              <Glasses className="w-5 h-5" />
              <span>VR头显双手柄模式 (Pico / Meta Quest)</span>
            </div>
            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-300">
              <li className="flex items-start gap-2">
                <span className="font-mono bg-cyan-950 text-cyan-300 px-1.5 py-0.5 rounded border border-cyan-800 shrink-0 text-xs">
                  扳机键 (Trigger)
                </span>
                <span>对准悬浮全息面板或分子发射激光射线，扣动扳机即可点击或抓取注入底物/药物。</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-mono bg-cyan-950 text-cyan-300 px-1.5 py-0.5 rounded border border-cyan-800 shrink-0 text-xs">
                  握持键 (Grip)
                </span>
                <span>双手抓握可在微观细胞质空间中进行平移或旋转观察酶的任意立体角度。</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-mono bg-cyan-950 text-cyan-300 px-1.5 py-0.5 rounded border border-cyan-800 shrink-0 text-xs">
                  摇杆 (Thumbstick)
                </span>
                <span>前后推拉摇杆调节纳米焦距与视野距离，实现宏观到超微观的自由缩放。</span>
              </li>
            </ul>
          </div>

          {/* PC / Mobile Browser 3D Mode */}
          <div className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-4.5 hover:border-cyan-500/40 transition-colors">
            <div className="flex items-center gap-2.5 text-indigo-400 font-semibold mb-3">
              <MousePointer className="w-5 h-5" />
              <span>PC端与移动端 3D / 陀螺仪模式</span>
            </div>
            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-300">
              <li className="flex items-start gap-2">
                <span className="font-mono bg-indigo-950 text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-800 shrink-0 text-xs">
                  鼠标拖拽 / 单指滑动
                </span>
                <span>在场景任意位置按住拖动，可 360° 环视实验室全景或微观细胞质基质。</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-mono bg-indigo-950 text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-800 shrink-0 text-xs">
                  鼠标滚轮 / 双指捏合
                </span>
                <span>拉近或推远观察酶蛋白复合体、ATP分子及活性中心催化三联体细节。</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-mono bg-indigo-950 text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-800 shrink-0 text-xs">
                  3D全息点击
                </span>
                <span>直接点击悬浮在空中的【开始体验】与【操作指引】面板，体验光子穿梭转场！</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Real-time Yellow Arrow Step-by-Step Guidance Banner */}
        <div className="bg-gradient-to-r from-yellow-500/15 via-amber-500/10 to-yellow-500/5 border border-yellow-400/50 rounded-xl p-4 mb-6 shadow-[0_0_20px_rgba(250,204,21,0.15)] flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-yellow-400/20 border border-yellow-400/60 flex items-center justify-center shrink-0 text-yellow-300 shadow-[0_0_12px_rgba(250,204,21,0.4)] animate-bounce mt-0.5">
            <ArrowDown className="w-4 h-4 fill-current text-yellow-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-yellow-300 tracking-wide">
                🎯 智能黄色小箭头实时操作指引系统
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-400 text-slate-950 font-black">
                全程保姆级导航
              </span>
            </div>
            <p className="text-xs text-slate-200 mt-1 leading-relaxed">
              在课件的每一个实验步骤中，界面都会出现跳动的<strong className="text-yellow-300">【黄色小箭头】</strong>与金色高光，精准指示您下一步应该点击的按钮（放入底物、测试异构、浓度调节、切换幕次或临床自测）。您可以直接点击箭头所指的按钮，也可以在顶部的步骤条中点击“下一步点这里”一键执行！
            </p>
          </div>
        </div>

        {/* Pedagogical Feature Roadmap */}
        <div className="bg-cyan-950/30 border border-cyan-800/50 rounded-xl p-4.5 mb-6">
          <div className="flex items-center gap-2 text-cyan-300 font-semibold text-sm mb-2.5">
            <Cpu className="w-4 h-4" />
            <span>核心教学场景与生化考点路线 (分幕指引)</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-300">
            <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700">
              <span className="text-cyan-400 font-bold block mb-1">【第1幕】生化实验室与微观跃迁</span>
              实验室宏观引导，穿梭跨越细胞膜磷脂双分子层与离子通道，抵达微观细胞质胶体基质。
            </div>
            <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700">
              <span className="text-amber-400 font-bold block mb-1">【第2-4幕】分子结合与抑制机制</span>
              第2幕锁钥模型特异契合裂解、第3幕竞争性他汀抢占催化口袋、第4幕非竞争性别构扭曲失活。
            </div>
            <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700">
              <span className="text-emerald-400 font-bold block mb-1">【第5幕】全景对比与临床考核关卡</span>
              全景左右双模型对比，完成他汀用药实战与米氏曲线配对考核小游戏，解锁“生化达人”勋章与报告。
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={() => {
              soundManager.playClickSFX();
              onClose();
            }}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-medium text-sm shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            我已了解，进入课件
          </button>
        </div>
      </div>
    </div>
  );
};
