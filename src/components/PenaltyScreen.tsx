import { AlertTriangle } from 'lucide-react';

interface PenaltyScreenProps {
  onComplete: () => void;
  message?: string;
}

export default function PenaltyScreen({ onComplete, message }: PenaltyScreenProps) {
  return (
    <div className="fixed inset-0 z-50 bg-penalty flex flex-col items-center justify-center p-6 text-center animate-shake">
      <img
        src="https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=800&q=80"
        alt="Accidente logístico"
        className="w-48 h-32 object-cover rounded-xl mb-6 border-2 border-destructive/50"
      />
      <AlertTriangle className="text-destructive-foreground mb-4" size={100} />
      <h1 className="font-display text-2xl text-destructive-foreground mb-3">
        🚨 ERROR GERENCIAL GRAVE 🚨
      </h1>
      <p className="text-destructive-foreground/90 text-sm mb-8 max-w-sm whitespace-pre-line">
        {message || 'Ignoraste el análisis del caso y generaste sobrecostos operativos. Asume la penalidad.'}
      </p>

      <button
        onClick={onComplete}
        className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-xl text-sm uppercase tracking-wider animate-pulse transition-colors shadow-lg shadow-red-500/30"
      >
        🚨 ASUMIR ERROR Y CONTINUAR AL SIGUIENTE RETO ➔
      </button>

      <p className="text-destructive-foreground/50 mt-4 text-xs">
        El error ya fue registrado en tu bitácora forense
      </p>
    </div>
  );
}
