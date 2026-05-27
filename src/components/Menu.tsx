import { Play } from 'lucide-react';

interface MenuProps {
    onPlay: () => void;
}

export function Menu({ onPlay }: MenuProps) {
    return (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-slate-800 to-slate-900">
            <div className="text-center">
                <h1 className="text-6xl font-bold text-cyan-400 mb-2 tracking-wider animate-pulse">
                    GEOMETRY DASH
                </h1>
                <p className="text-slate-400 text-lg mb-12">Jump and survive!</p>

                <button
                    onClick={onPlay}
                    className="flex items-center gap-3 px-10 py-5 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold text-2xl rounded-xl transition-all hover:scale-110 active:scale-95 shadow-lg shadow-cyan-500/30 translate-x-44"
                >
                    <Play className="w-8 h-8" />
                    PLAY
                </button>




                <div className="mt-16 text-slate-500 text-sm">
                    <p>SPACE / CLICK / TAP to jump</p>
                    <p>Double jump available!</p>
                </div>
            </div>

            <div className="absolute bottom-10 left-10 w-16 h-16 bg-cyan-500/20 rotate-12 rounded-lg" />
            <div className="absolute top-20 right-20 w-12 h-12 bg-yellow-500/20 rotate-45 rounded-lg" />
            <div className="absolute bottom-32 right-32 w-8 h-8 bg-pink-500/20 rotate-12 rounded-lg" />
        </div>
    );
}
