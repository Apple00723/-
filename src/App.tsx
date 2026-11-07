import React, { useState, useRef, useEffect } from 'react';
import { VRCanvas } from './components/VRCanvas';
import { HoloUI } from './components/HoloUI';
import { GuideModal } from './components/GuideModal';
import { KineticsPanel } from './components/KineticsPanel';
import { QuizModal } from './components/QuizModal';
import { ThreeVREngine } from './scene/threeEngine';
import { SceneId, VRMode } from './types/vrCourse';
import { COURSE_SCENES } from './data/courseData';
import { soundManager } from './audio/soundManager';
import { X } from 'lucide-react';

export default function App() {
  const [currentScene, setCurrentScene] = useState<SceneId>('scene1_lab');
  const [vrMode, setVrMode] = useState<VRMode>('desktop');
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isKineticsOpen, setIsKineticsOpen] = useState(false);
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  // Depth of Field default disabled as requested (景深焦段一直关闭比较好，保持超清锐利)
  const [isDoFEnabled, setIsDoFEnabled] = useState(false);
  const [reactionRate, setReactionRate] = useState<number>(0);
  const [reactionStatus, setReactionStatus] = useState<'idle' | 'snapping' | 'success' | 'rejected'>('idle');

  // Scene 3: Competitive Inhibition Game Progression State
  const [scene3Step, setScene3Step] = useState<'await_drug' | 'drug_locked' | 'substrate_repelled' | 'displaced_success'>('await_drug');
  const [substrateConcentration, setSubstrateConcentration] = useState<number>(10);

  // Scene 4 Non-Competitive State
  const [scene4Step, setScene4Step] = useState<'await_allosteric_drug' | 'drug_bound_distorted' | 'substrate_tested_clash' | 'concentration_tested'>('await_allosteric_drug');
  const [scene4SubstrateConc, setScene4SubstrateConc] = useState<number>(10);
  const [isCameraWide, setIsCameraWide] = useState<boolean>(true);

  const engineRef = useRef<ThreeVREngine | null>(null);

  const handleToggleCameraView = () => {
    if (engineRef.current) {
      const mode = engineRef.current.toggleCameraView();
      setIsCameraWide(mode === 'wide');
      soundManager.playClickSFX();
    }
  };

  // Auto-start ambient BGM on first user interaction
  useEffect(() => {
    const handleFirstInteraction = () => {
      soundManager.unlockAudio();
      soundManager.startAmbientBGM();
      window.removeEventListener('pointerdown', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };

    window.addEventListener('pointerdown', handleFirstInteraction);
    window.addEventListener('keydown', handleFirstInteraction);

    return () => {
      window.removeEventListener('pointerdown', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
      soundManager.stopAmbientBGM();
      soundManager.stopSpeech();
    };
  }, []);

  // Scene select directly navigates between acts, updates 3D scene and plays magnetic commentator voice
  const handleSceneSelect = (sceneId: SceneId) => {
    soundManager.unlockAudio();
    soundManager.stopSpeech();
    soundManager.playClickSFX();
    setCurrentScene(sceneId);
    setIsCameraWide(true); // 每次切到下一幕，自动重置为远景全貌视角

    if (engineRef.current) {
      engineRef.current.setScene(sceneId);
    }

    const sceneMeta = COURSE_SCENES.find(s => s.id === sceneId);
    if (sceneMeta) {
      soundManager.speak(sceneMeta.voiceover);
    }

    // Reset state when switching scenes
    if (sceneId === 'scene2_enzyme') {
      setReactionRate(0);
      setReactionStatus('idle');
      engineRef.current?.resetScene2Substrates();
    } else if (sceneId === 'scene3_competitive') {
      setScene3Step('await_drug');
      setSubstrateConcentration(10);
      setReactionRate(0);
      setReactionStatus('idle');
      engineRef.current?.resetScene3Competitive();
    } else if (sceneId === 'scene4_noncompetitive') {
      setScene4Step('await_allosteric_drug');
      setScene4SubstrateConc(10);
      setReactionRate(0);
      setReactionStatus('idle');
      engineRef.current?.resetScene4Noncompetitive();
    }
  };

  // Keyboard Navigation: ArrowRight / PageDown advance act; ArrowLeft / PageUp previous act
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isGuideOpen || isQuizOpen || isKineticsOpen) return;
      const acts = COURSE_SCENES.filter(s => s.id !== 'scene1_transition' && s.id !== 'scene6_quiz');
      const currentIndex = acts.findIndex(s => s.id === currentScene);

      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        e.preventDefault();
        if (currentIndex < acts.length - 1) {
          handleSceneSelect(acts[currentIndex + 1].id);
        }
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        if (currentIndex > 0) {
          handleSceneSelect(acts[currentIndex - 1].id);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentScene, isGuideOpen, isQuizOpen, isKineticsOpen]);

  const handleUIAction = (action: string) => {
    if (action === 'start_experience') {
      // Warp to cytoplasm
      handleSceneSelect('scene1_cytoplasm');
    } else if (action === 'open_guide') {
      setIsGuideOpen(true);
    }
  };

  const handleReactionRateChange = (rate: number, status?: string) => {
    setReactionRate(rate);
    if (status) {
      if (status === 'drug_locked') {
        setScene3Step('drug_locked');
      } else if (status === 'substrate_repelled') {
        setScene3Step('substrate_repelled');
      } else if (status === 'displaced_success') {
        setScene3Step('displaced_success');
      } else if (status === 'scene3_ready') {
        setScene3Step('await_drug');
      } else if (status === 'drug_bound_distorted') {
        setScene4Step('drug_bound_distorted');
      } else if (status === 'substrate_tested_clash') {
        setScene4Step('substrate_tested_clash');
      } else if (status === 'concentration_locked') {
        setScene4Step('concentration_tested');
      } else if (status === 'scene4_ready') {
        setScene4Step('await_allosteric_drug');
      }
      setReactionStatus(status as 'idle' | 'snapping' | 'success' | 'rejected');
    }
  };

  const handleTriggerCatalysis = () => {
    if (engineRef.current) {
      engineRef.current.animateSubstrateCatalysis();
    }
  };

  const handleTriggerDecoy = () => {
    if (engineRef.current) {
      engineRef.current.animateDecoyRejection();
    }
  };

  const handleResetSubstrates = () => {
    if (engineRef.current) {
      engineRef.current.resetScene2Substrates();
    }
  };

  // Scene 3 Statin & Competitive Handlers
  const handleLockStatinDrug = () => {
    if (engineRef.current) {
      engineRef.current.lockStatinDrugIntoActiveSite();
    }
  };

  const handleAttemptSubstrateWithDrug = () => {
    if (engineRef.current) {
      engineRef.current.attemptSubstrateDockingWithDrug();
    }
  };

  const handleSubstrateConcentrationChange = (conc: number) => {
    setSubstrateConcentration(conc);
    if (engineRef.current) {
      engineRef.current.setSubstrateConcentration(conc);
    }
  };

  const handleResetScene3 = () => {
    setScene3Step('await_drug');
    setSubstrateConcentration(10);
    setReactionRate(0);
    setReactionStatus('idle');
    if (engineRef.current) {
      engineRef.current.resetScene3Competitive();
    }
  };

  // Scene 4 Non-Competitive Handlers
  const handleDockAllostericDrug = () => {
    if (engineRef.current) {
      engineRef.current.dockAllostericDrug();
    }
  };

  const handleAttemptSubstrateDeformed = () => {
    if (engineRef.current) {
      engineRef.current.attemptSubstrateDockingInDeformedActiveSite();
    }
  };

  const handleScene4SubstrateConcChange = (conc: number) => {
    setScene4SubstrateConc(conc);
    if (engineRef.current) {
      engineRef.current.setSubstrateConcentrationScene4(conc);
    }
  };

  const handleResetScene4 = () => {
    setScene4Step('await_allosteric_drug');
    setScene4SubstrateConc(10);
    setReactionRate(0);
    setReactionStatus('idle');
    if (engineRef.current) {
      engineRef.current.resetScene4Noncompetitive();
    }
  };

  const handleTriggerCompetitive = () => {
    if (engineRef.current) {
      engineRef.current.animateCompetitiveInhibition();
    }
  };

  const handleTriggerNonCompetitive = () => {
    if (engineRef.current) {
      engineRef.current.animateNonCompetitiveInhibition();
    }
  };

  const handleResetConformation = () => {
    if (engineRef.current) {
      engineRef.current.setScene(currentScene);
    }
  };

  const handleToggleDoF = () => {
    if (engineRef.current) {
      const next = engineRef.current.toggleDepthOfField();
      setIsDoFEnabled(next);
    }
  };

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans select-none">
      {/* 3D WebGL / WebXR Viewport */}
      <VRCanvas
        currentScene={currentScene}
        vrMode={vrMode}
        onSceneChange={(scene) => setCurrentScene(scene)}
        onUIAction={handleUIAction}
        onReactionRateChange={handleReactionRateChange}
        engineRef={engineRef}
      />

      {/* Holographic UI Overlay */}
      <HoloUI
        currentScene={currentScene}
        vrMode={vrMode}
        onAdvancePPT={() => {
          const acts = COURSE_SCENES.filter(s => s.id !== 'scene1_transition' && s.id !== 'scene6_quiz');
          const currentIndex = acts.findIndex(s => s.id === currentScene);
          if (currentIndex < acts.length - 1) {
            handleSceneSelect(acts[currentIndex + 1].id);
          }
        }}
        onPrevPPT={() => {
          const acts = COURSE_SCENES.filter(s => s.id !== 'scene1_transition' && s.id !== 'scene6_quiz');
          const currentIndex = acts.findIndex(s => s.id === currentScene);
          if (currentIndex > 0) {
            handleSceneSelect(acts[currentIndex - 1].id);
          }
        }}
        isDoFEnabled={isDoFEnabled}
        isCameraWide={isCameraWide}
        onToggleCameraView={handleToggleCameraView}
        reactionRate={reactionRate}
        reactionStatus={reactionStatus}
        scene3Step={scene3Step}
        substrateConcentration={substrateConcentration}
        onSelectScene={handleSceneSelect}
        onChangeVRMode={(mode) => setVrMode(mode)}
        onToggleDoF={handleToggleDoF}
        onOpenGuide={() => setIsGuideOpen(true)}
        onOpenKinetics={() => setIsKineticsOpen(true)}
        onOpenQuiz={() => setIsQuizOpen(true)}
        onTriggerCatalysis={handleTriggerCatalysis}
        onTriggerDecoy={handleTriggerDecoy}
        onResetSubstrates={handleResetSubstrates}
        onLockStatinDrug={handleLockStatinDrug}
        onAttemptSubstrateWithDrug={handleAttemptSubstrateWithDrug}
        onChangeSubstrateConcentration={handleSubstrateConcentrationChange}
        onResetScene3={handleResetScene3}
        scene4Step={scene4Step}
        scene4SubstrateConc={scene4SubstrateConc}
        onDockAllostericDrug={handleDockAllostericDrug}
        onAttemptSubstrateDeformed={handleAttemptSubstrateDeformed}
        onChangeScene4SubstrateConc={handleScene4SubstrateConcChange}
        onResetScene4={handleResetScene4}
        onTriggerCompetitive={handleTriggerCompetitive}
        onTriggerNonCompetitive={handleTriggerNonCompetitive}
        onResetConformation={handleResetConformation}
        onTriggerFireworks={() => engineRef.current?.triggerFireworks()}
        onRestartCourse={() => handleSceneSelect('scene1_lab')}
      />

      {/* Guide Modal */}
      <GuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />

      {/* Kinetics Interactive Lab Modal */}
      {isKineticsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => {
                soundManager.playClickSFX();
                setIsKineticsOpen(false);
              }}
              className="absolute top-4 right-4 z-10 p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <KineticsPanel
              onApplyDrugToScene={(type) => {
                if (type === 'competitive') {
                  handleSceneSelect('scene3_competitive');
                } else {
                  handleSceneSelect('scene4_noncompetitive');
                }
                setIsKineticsOpen(false);
              }}
            />
          </div>
        </div>
      )}

      {/* Quiz Modal */}
      <QuizModal
        isOpen={isQuizOpen}
        onClose={() => setIsQuizOpen(false)}
        onRestartCourse={() => handleSceneSelect('scene1_lab')}
      />
    </main>
  );
}
