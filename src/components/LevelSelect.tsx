import { Star } from 'lucide-react';
import { Difficulty } from '../game/config';

interface LevelSelectProps {
  onSelect: (difficulty: Difficulty) => void;
  bestScores: Record<Difficulty, number>;
}

const LEVELS: { 
  difficulty: Difficulty; 
  name: string; 
  description: string;
  color: string;
  borderColor: string;
}[] = [
  {
    difficulty: 'easy',
    name: 'EASY',
    description: 'Single spikes, wide gaps, forgiving jumps',
    color: 'text-green-400',
    borderColor: 'border-green-500/50',
  },
  {
    difficulty: 'medium',
    name: 'MEDIUM',
    description: 'Double spikes, spikes on platforms, tighter gaps',
    color: 'text-yellow-400',
    borderColor: 'border-yellow-500/50',
  },
  {
    difficulty: 'hard',
    name: 'HARD',
    description: 'Triple spikes, spikes everywhere, precision required',
    color: 'text-red-400',
    borderColor: 'border-red-500/50',
  },
];

export function LevelSelect({ onSelect, bestScores }: LevelSelectProps) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-slate-800 to-slate-900 p-8">
      <h2 className="text-4xl font-bold text-white mb-2">SELECT LEVEL</h2>
      <p className="text-slate-400 mb-8">Choose your difficulty</p>
      
      <div className="flex flex-col gap-4 w-full max-w-md">
        {LEVELS.map((level) => {
          const bestScore = bestScores[level.difficulty];
          const isCompleted = bestScore === 100;
          
          return (
            <button
              key={level.difficulty}
              onClick={() => onSelect(level.difficulty)}
              className={`
                relative flex items-center justify-between p-6 rounded-xl
                bg-slate-800 border-2 ${level.borderColor}
                hover:border-opacity-100 transition-all hover:scale-102
                ${isCompleted ? 'ring-2 ring-yellow-400/50' : ''}
              `}
            >
              <div className="text-left">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className={`text-2xl font-bold ${level.color}`}>{level.name}</h3>
                  {isCompleted && <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />}
                </div>
                <p className="text-slate-400 text-sm">{level.description}</p>
              </div>
              
              <div className="text-right">
                {bestScore > 0 ? (
                  <div>
                    <p className="text-slate-400 text-xs">BEST</p>
                    <p className={`text-xl font-bold ${level.color}`}>{bestScore}%</p>
                  </div>
                ) : (
                  <div className="text-slate-500">
                    <p className="text-sm">NEW</p>
                  </div>
                )}
              </div>
              
              <div className="absolute bottom-2 left-6 flex gap-1">
                {level.difficulty === 'easy' && (
                  <>
                    <div className="w-2 h-2 rounded-full bg-green-400" />
                    <div className="w-2 h-2 rounded-full bg-slate-600" />
                    <div className="w-2 h-2 rounded-full bg-slate-600" />
                  </>
                )}
                {level.difficulty === 'medium' && (
                  <>
                    <div className="w-2 h-2 rounded-full bg-yellow-400" />
                    <div className="w-2 h-2 rounded-full bg-yellow-400" />
                    <div className="w-2 h-2 rounded-full bg-slate-600" />
                  </>
                )}
                {level.difficulty === 'hard' && (
                  <>
                    <div className="w-2 h-2 rounded-full bg-red-400" />
                    <div className="w-2 h-2 rounded-full bg-red-400" />
                    <div className="w-2 h-2 rounded-full bg-red-400" />
                  </>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}