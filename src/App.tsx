import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Game } from './game/Game';
import { Menu } from './components/Menu';
import { LevelSelect } from './components/LevelSelect';
import { GameUI } from './components/GameUI';
import { GameOver } from './components/GameOver';
import { Victory } from './components/Victory';
import { MobileControls } from './components/MobileControls';
import { Difficulty } from './game/config';
import './index.css';


export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<Game | null>(null);
  const scoreRef = useRef<number>(0);
  const [screen, setScreen] = useState<'menu' | 'levels' | 'playing' | 'gameover' | 'victory'>('menu');
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(1);
  const [bestScores, setBestScores] = useState<Record<Difficulty, number>>({
    easy: 0,
    medium: 0,
    hard: 0
  });
  const [currentDifficulty, setCurrentDifficulty] = useState<Difficulty>('easy');

  const handleDeath = useCallback(() => {
    setScreen('gameover');
    setBestScores(prev => ({
      ...prev,
      [currentDifficulty]: Math.max(prev[currentDifficulty], scoreRef.current)
    }));
  }, [currentDifficulty]);

  const handleVictory = useCallback(() => {
    setScreen('victory');
    setBestScores(prev => ({
      ...prev,
      [currentDifficulty]: 100
    }));
  }, [currentDifficulty]);

  const handleScore = useCallback((newScore: number) => {
    if (scoreRef.current !== newScore) {
      scoreRef.current = newScore;
      setScore(newScore);
    }
  }, []);

  useEffect(() => {
    if (screen !== 'playing') return;
    if (!canvasRef.current) return;
    if (gameRef.current) return;
    
    scoreRef.current = 0;
    gameRef.current = new Game(canvasRef.current, handleScore, handleDeath, handleVictory, currentDifficulty);
    gameRef.current.start();

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy();
        gameRef.current = null;
      }
    };
  }, [screen, handleScore, handleDeath, handleVictory, currentDifficulty]);

  const goToLevels = useCallback(() => {
    setScreen('levels');
  }, []);

  const selectDifficulty = useCallback((diff: Difficulty) => {
    setCurrentDifficulty(diff);
    setScore(0);
    scoreRef.current = 0;
    setAttempts(1);
    setScreen('playing');
  }, []);

  const restartGame = useCallback(() => {
    if (gameRef.current) {
      gameRef.current.destroy();
      gameRef.current = null;
    }
    setScore(0);
    scoreRef.current = 0;
    setAttempts(prev => prev + 1);
    setScreen('playing');
  }, []);

  const goToMenu = useCallback(() => {
    if (gameRef.current) {
      gameRef.current.destroy();
      gameRef.current = null;
    }
    setScreen('menu');
  }, []);

  const exitToLevelSelect = useCallback(() => {
    if (gameRef.current) {
      gameRef.current.destroy();
      gameRef.current = null;
    }
    setScreen('levels');
  }, []);

  const handleJump = useCallback(() => {
    if (gameRef.current) {
      gameRef.current.jump();
    }
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-slate-900">
      {screen === 'menu' && (
        <Menu onPlay={goToLevels} />
      )}
      
      {screen === 'levels' && (
        <LevelSelect 
          onSelect={selectDifficulty}
          bestScores={bestScores}
        />
      )}
      
      {screen === 'playing' && (
        <>
          <canvas ref={canvasRef} className="w-full h-full" />
          <GameUI 
            score={score} 
            attempts={attempts} 
            difficulty={currentDifficulty}
            onExit={exitToLevelSelect}
          />
          <MobileControls onJump={handleJump} />
        </>
      )}
      
      {screen === 'gameover' && (
        <>
          <canvas ref={canvasRef} className="w-full h-full opacity-50" />
          <GameOver 
            score={score} 
            bestScore={bestScores[currentDifficulty]}
            onRestart={restartGame}
            onMenu={goToMenu}
          />
        </>
      )}
      
      {screen === 'victory' && (
        <>
          <canvas ref={canvasRef} className="w-full h-full opacity-50" />
          <Victory 
            attempts={attempts}
            difficulty={currentDifficulty}
            onMenu={goToMenu}
          />
        </>
      )}
    </div>
  );
}