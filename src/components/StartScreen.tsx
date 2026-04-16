import { Briefcase } from 'lucide-react';

interface StartScreenProps {
  teamName: string;
  onTeamNameChange: (name: string) => void;
  onStart: () => void;
}

export default function StartScreen({ teamName, onTeamNameChange, onStart }: StartScreenProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background">
      <Briefcase className="text-orange mb-4" size={80} />
      <h1 className="font-display text-2xl text-gradient-orange mb-1 text-center">SIMULADOR GERENCIAL</h1>
      <h2 className="font-display text-lg text-foreground mb-2 text-center">DE LOGÍSTICA 360°</h2>
      <p className="text-muted-foreground text-xs mb-8 text-center max-w-xs">
        Resuelve 3 casos reales como un gerente de operaciones. Si fallas, la app te congela.
      </p>
      <div className="w-full max-w-sm space-y-4">
        <input
          type="text"
          placeholder="👤 Escribe tus Nombres y Apellidos Completos"
          value={teamName}
          onChange={e => onTeamNameChange(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && onStart()}
          className="w-full bg-card border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-center text-lg"
        />
        <button
          onClick={onStart}
          disabled={!teamName.trim()}
          className="w-full bg-orange text-primary-foreground font-display text-lg py-4 rounded-xl glow-orange hover:glow-orange-intense transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
        >
          🔊 ACTIVAR AUDIO E INICIAR
        </button>
      </div>
      <p className="text-muted-foreground text-xs mt-6 text-center max-w-xs">
        Asegúrate de tener el volumen activado. La app usará voz para explicar cada decisión.
      </p>
    </div>
  );
}
