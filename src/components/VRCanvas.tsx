import React, { useEffect, useRef } from 'react';
import { ThreeVREngine } from '../scene/threeEngine';
import { SceneId, VRMode } from '../types/vrCourse';

interface VRCanvasProps {
  currentScene: SceneId;
  vrMode: VRMode;
  onSceneChange: (scene: SceneId) => void;
  onUIAction: (action: string) => void;
  onReactionRateChange?: (rate: number, status?: string) => void;
  engineRef: React.MutableRefObject<ThreeVREngine | null>;
}

export const VRCanvas: React.FC<VRCanvasProps> = ({
  currentScene,
  vrMode,
  onSceneChange,
  onUIAction,
  onReactionRateChange,
  engineRef,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Initialize Three.js VR Engine once
    const engine = new ThreeVREngine(mountRef.current, {
      onSceneChange: (scene) => onSceneChange(scene),
      onUIAction: (action) => onUIAction(action),
      onReactionRateChange: (rate, status) => {
        if (onReactionRateChange) onReactionRateChange(rate, status);
      },
    });
    engineRef.current = engine;

    return () => {
      engine.dispose();
      engineRef.current = null;
    };
  }, []);

  // Update scene when currentScene changes
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.setScene(currentScene);
    }
  }, [currentScene]);

  // Update VR mode when changed
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.setVRMode(vrMode);
    }
  }, [vrMode]);

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 w-full h-full overflow-hidden bg-slate-950 cursor-grab active:cursor-grabbing"
    />
  );
};
