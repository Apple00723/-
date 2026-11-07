import React, { useState } from 'react';
import { Award, CheckCircle, XCircle, ArrowRight, RotateCcw, BookOpen, AlertCircle } from 'lucide-react';
import { QUIZ_QUESTIONS } from '../data/courseData';
import { soundManager } from '../audio/soundManager';

interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRestartCourse: () => void;
}

export const QuizModal: React.FC<QuizModalProps> = ({ isOpen, onClose, onRestartCourse }) => {
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  if (!isOpen) return null;

  const currentQ = QUIZ_QUESTIONS[currentIdx];

  const handleSelectOption = (optIdx: number) => {
    if (isAnswerSubmitted) return;
    soundManager.playClickSFX();
    setSelectedOption(optIdx);
  };

  const handleSubmitAnswer = () => {
    if (selectedOption === null) return;
    setIsAnswerSubmitted(true);
    const isCorrect = selectedOption === currentQ.correctIndex;
    if (isCorrect) {
      soundManager.playBeepSFX(1200);
      setScore(prev => prev + 1);
    } else {
      soundManager.playDockingSFX(false);
    }
  };

  const handleNextQuestion = () => {
    soundManager.playClickSFX();
    if (currentIdx + 1 < QUIZ_QUESTIONS.length) {
      setCurrentIdx(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
    } else {
      setIsCompleted(true);
      soundManager.playBeepSFX(1600);
    }
  };

  const handleResetQuiz = () => {
    soundManager.playClickSFX();
    setCurrentIdx(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setScore(0);
    setIsCompleted(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-[rgba(10,15,30,0.55)] backdrop-blur-[24px] -webkit-backdrop-blur-[24px] border border-white/[0.14] rounded-2xl p-6 sm:p-8 text-slate-100 shadow-[0_24px_60px_-4px_rgba(0,0,0,0.7),inset_0_1px_0_0_rgba(255,255,255,0.2)]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">临床生化与药理靶向考核</h3>
              <p className="text-xs text-slate-400">
                {isCompleted ? '考核已完成 · 结果认证' : `问题 ${currentIdx + 1} / ${QUIZ_QUESTIONS.length}`}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              soundManager.playClickSFX();
              onClose();
            }}
            className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            返回课件
          </button>
        </div>

        {!isCompleted ? (
          <div>
            {/* Question Text */}
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 mb-5">
              <span className="text-xs font-bold text-cyan-400 font-mono block mb-1">
                CASE SCENARIO #{currentQ.id}
              </span>
              <p className="text-sm sm:text-base font-medium text-white leading-relaxed">
                {currentQ.question}
              </p>
            </div>

            {/* Options */}
            <div className="space-y-3 mb-6">
              {currentQ.options.map((opt, idx) => {
                const isSelected = selectedOption === idx;
                let optStyle = 'border-slate-800 bg-slate-800/40 hover:border-slate-600 text-slate-200';

                if (isAnswerSubmitted) {
                  if (idx === currentQ.correctIndex) {
                    optStyle = 'border-emerald-500 bg-emerald-950/60 text-emerald-200 font-semibold';
                  } else if (isSelected) {
                    optStyle = 'border-red-500 bg-red-950/60 text-red-200';
                  } else {
                    optStyle = 'border-slate-800/50 opacity-40 text-slate-400';
                  }
                } else if (isSelected) {
                  optStyle = 'border-cyan-500 bg-cyan-950/50 text-cyan-200 font-semibold shadow-md';
                }

                return (
                  <button
                    key={opt}
                    onClick={() => handleSelectOption(idx)}
                    disabled={isAnswerSubmitted}
                    className={`w-full text-left p-3.5 rounded-xl border text-xs sm:text-sm transition-all flex items-start gap-3 ${optStyle}`}
                  >
                    <span className="w-5 h-5 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-mono text-xs shrink-0 mt-0.5">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="flex-1">{opt}</span>
                    {isAnswerSubmitted && idx === currentQ.correctIndex && (
                      <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    )}
                    {isAnswerSubmitted && isSelected && idx !== currentQ.correctIndex && (
                      <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Explanation card after submit */}
            {isAnswerSubmitted && (
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 mb-5 text-xs animate-fade-in">
                <div className="font-bold text-cyan-300 mb-1 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  生化机制解析：
                </div>
                <p className="text-slate-300 leading-relaxed mb-2">{currentQ.explanation}</p>
                <div className="p-2 rounded bg-cyan-950/40 border border-cyan-800/40 text-[11px] text-cyan-300 font-medium">
                  {currentQ.clinicalNote}
                </div>
              </div>
            )}

            {/* Footer Buttons */}
            <div className="flex justify-end gap-3 pt-2 border-t border-slate-800">
              {!isAnswerSubmitted ? (
                <button
                  onClick={handleSubmitAnswer}
                  disabled={selectedOption === null}
                  className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                    selectedOption !== null
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25 hover:from-cyan-400 hover:to-blue-500'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  提交答案
                </button>
              ) : (
                <button
                  onClick={handleNextQuestion}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-bold shadow-lg shadow-cyan-500/25 hover:from-cyan-400 hover:to-blue-500 transition-all flex items-center gap-2"
                >
                  {currentIdx + 1 < QUIZ_QUESTIONS.length ? '下一题' : '查看考核证书'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Completion Certificate Screen */
          <div className="text-center py-6">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 shadow-xl shadow-amber-500/20">
              <Award className="w-8 h-8" />
            </div>

            <h4 className="text-xl font-bold text-white mb-1">
              《微观视界：酶的抑制与药物靶向》修读合格
            </h4>
            <p className="text-xs text-slate-400 mb-6 font-mono">
              COMPLETION ID: VR-MED-2026-BIOCHEM · 得分: {score} / {QUIZ_QUESTIONS.length}
            </p>

            <div className="max-w-md mx-auto p-4 rounded-xl bg-slate-950/80 border border-cyan-500/30 text-left text-xs mb-6 space-y-2">
              <div className="flex justify-between text-slate-300">
                <span>竞争性抑制机制 (争夺活性中心):</span>
                <span className="text-emerald-400 font-bold">已掌握 (Vmax不变, Km增大)</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>非竞争性抑制机制 (别构构象变性):</span>
                <span className="text-emerald-400 font-bold">已掌握 (Vmax降低, Km不变)</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>临床代表药物 (立普妥、甲氨蝶呤):</span>
                <span className="text-emerald-400 font-bold">已掌握</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={handleResetQuiz}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                重测一次
              </button>
              <button
                onClick={() => {
                  soundManager.playClickSFX();
                  onRestartCourse();
                  onClose();
                }}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-cyan-500/25 transition-all flex items-center gap-2"
              >
                返回生化实验室从头体验
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
