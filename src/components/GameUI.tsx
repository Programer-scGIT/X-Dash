import { Home } from 'lucide-react';
import { Difficulty } from '../game/config';

interface GameUIProps {
  score: number;
  attempts: number;
  difficulty: Difficulty;
  onExit: () => void;
}

const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  easy: 'bg-green-400',
  medium: 'bg-yellow-400',
  hard: 'bg-red-400',
};

const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: 'EASY',
  medium: 'MEDIUM',
  hard: 'HARD',
};

export function GameUI({ score, attempts, difficulty, onExit }: GameUIProps) {
  return (
    <div className="absolute top-0 left-0 right-0 p-4 pointer-events-none">
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-1">
          <div className={`px-3 py-1 rounded text-xs font-bold text-slate-900 ${DIFFICULTY_COLORS[difficulty]}`}>
            {DIFFICULTY_LABELS[difficulty]}
          </div>
          <div className="bg-slate-900 bg-opacity-80 px-4 py-2 rounded-lg">
            <p className="text-cyan-400 font-bold text-2xl">{score}%</p>
          </div>
        </div>
        
        <div className="flex items-start gap-2">
          <div className="bg-slate-900 bg-opacity-80 px-4 py-2 rounded-lg">
            <p className="text-slate-400 text-sm">Attempt</p>
            <p className="text-white font-bold text-xl">{attempts}</p>
          </div>
          
          <button
            onClick={onExit}
            className="pointer-events-auto flex items-center gap-2 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold rounded-lg transition-all hover:scale-105 border border-slate-600"
            title="Exit to Level Select"
          >
            <Home className="w-5 h-5" />
            <span className="hidden sm:inline">Exit</span>
          </button>
        </div>
      </div>
      
      <div className="mt-4 h-2 bg-slate-700 rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all duration-300 ${DIFFICULTY_COLORS[difficulty]}`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}