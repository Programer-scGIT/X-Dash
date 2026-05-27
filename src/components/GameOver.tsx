interface GameOverProps {
  score: number;
  bestScore: number;
  onRestart: () => void;
  onMenu: () => void;
}

export function GameOver({ score, bestScore, onRestart, onMenu }: GameOverProps) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70">
      <div className="bg-slate-800 p-8 rounded-xl text-center border-2 border-red-500/50">
        <h2 className="text-4xl font-bold text-red-400 mb-4">CRASHED!</h2>
        
        <div className="mb-6">
          <p className="text-slate-400">Progress</p>
          <p className="text-5xl font-bold text-cyan-400">{score}%</p>
        </div>
        
        {score === bestScore && score > 0 && (
          <p className="text-yellow-400 font-bold mb-4">NEW BEST!</p>
        )}
        
        <div className="flex gap-4 justify-center">
          <button
            onClick={onRestart}
            className="px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold rounded-lg transition-all hover:scale-105"
          >
            RETRY
          </button>
          <button
            onClick={onMenu}
            className="px-6 py-3 bg-slate-600 hover:bg-slate-500 text-white font-bold rounded-lg transition-all hover:scale-105"
          >
            MENU
          </button>
        </div>
      </div>
    </div>
  );
}