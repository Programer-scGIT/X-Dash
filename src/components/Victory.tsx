import { Star, Trophy } from 'lucide-react';
import { Difficulty } from '../game/config';

interface VictoryProps {
  attempts: number;
  difficulty: Difficulty;
  onMenu: () => void;
}

const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  easy: 'text-green-400',
  medium: 'text-yellow-400',
  hard: 'text-red-400',
};

export function Victory({ attempts, difficulty, onMenu }: VictoryProps) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-80">
      <div className="text-center">
        <div className="flex justify-center gap-2 mb-4">
          {[...Array(3)].map((_, i) => (
            <Star 
              key={i} 
              className="w-12 h-12 text-yellow-400 fill-yellow-400 animate-bounce" 
              style={{ animationDelay: `${i * 0.15}s` }} 
            />
          ))}
        </div>
        
        <h2 className="text-5xl font-bold text-yellow-400 mb-2 flex items-center justify-center gap-3">
          <Trophy className="w-10 h-10" />
          LEVEL COMPLETE!
        </h2>
        
        <p className={`text-2xl font-bold mb-4 ${DIFFICULTY_COLORS[difficulty]}`}>
          {difficulty.toUpperCase()}
        </p>
        
        <div className="mb-6">
          <p className="text-slate-400 text-lg">Attempts</p>
          <p className="text-4xl font-bold text-white">{attempts}</p>
        </div>
        
        <button
          onClick={onMenu}
          className="px-8 py-4 bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-bold text-xl rounded-lg transition-all hover:scale-105"
        >
          MENU
        </button>
      </div>
    </div>
  );
}