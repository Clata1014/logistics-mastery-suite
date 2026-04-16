import { useEffect } from 'react';
import { Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';
import { speak } from '@/lib/speech';

interface VictoryScreenProps {
  teamName: string;
  elapsedSeconds: number;
  errorCount: number;
  errorLog: string[];
}

function calcGrade(errors: number): string {
  if (errors === 0) return '5.0 (Nivel Dios)';
  if (errors <= 2) return '4.5 (Excelente)';
  if (errors <= 4) return '4.0 (Sobresaliente)';
  if (errors <= 6) return '3.5 (Aceptable)';
  return '3.0 (Sobrevivió de milagro)';
}

export default function VictoryScreen({ teamName, elapsedSeconds, errorCount, errorLog }: VictoryScreenProps) {
  const mins = String(Math.floor(elapsedSeconds / 60)).padStart(2, '0');
  const secs = String(elapsedSeconds % 60).padStart(2, '0');
  const timeStr = `${mins}:${secs}`;
  const grade = calcGrade(errorCount);

  useEffect(() => {
    speak('Operación logística maestra completada con éxito. Son verdaderos gerentes de operaciones. Felicidades ' + teamName);
    const end = Date.now() + 4000;
    const frame = () => {
      confetti({ particleCount: 4, angle: 60, spread: 55, origin: { x: 0 } });
      confetti({ particleCount: 4, angle: 120, spread: 55, origin: { x: 1 } });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
  }, [teamName]);

  const sendWhatsApp = () => {
    const detailLines = errorLog.length > 0
      ? errorLog.join('\n\n====================\n\n')
      : 'El estudiante demostró dominio absoluto sin fallas operativas';

    const msg = `🎓 REPORTE DEL SIMULADOR LOGÍSTICO 🎓\n👤 Estudiante: ${teamName}\n⏱️ Tiempo Total: ${timeStr}\n🏆 NOTA DEL SISTEMA: ${grade}\n\n❌ CANTIDAD DE ERRORES: ${errorCount}\n\n📋 DETALLE FORENSE DE LAS FALLAS:\n\n${detailLines}\n\n¡Hola profe! El sistema certifica mi graduación operativa. Adjunto mi bitácora forense de errores para su revisión en la planilla.`;
    window.open(`https://wa.me/573160457000?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-background">
      <Trophy className="text-yellow-400 mb-4" size={150} />
      <h1 className="font-display text-2xl text-gradient-orange mb-2">OPERACIÓN LOGÍSTICA MAESTRA</h1>
      <p className="text-foreground text-lg mb-6">¡ERES UN GERENTE LOGÍSTICO NIVEL DIOS!</p>

      <div className="bg-card border border-border rounded-xl p-6 mb-4 w-full max-w-sm">
        <p className="text-muted-foreground text-sm mb-1">Estudiante</p>
        <p className="font-display text-xl text-foreground">{teamName}</p>
      </div>

      <div className="flex gap-4 mb-4 w-full max-w-sm">
        <div className="bg-card border border-border rounded-xl p-4 flex-1">
          <p className="text-muted-foreground text-xs mb-1">Tiempo</p>
          <p className="font-display text-2xl text-orange">{timeStr}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 flex-1">
          <p className="text-muted-foreground text-xs mb-1">Errores</p>
          <p className="font-display text-2xl text-red-400">{errorCount}</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 mb-4 w-full max-w-sm">
        <p className="text-muted-foreground text-sm mb-1">Nota del Sistema</p>
        <p className="font-display text-3xl text-green-400">{grade}</p>
      </div>

      {/* Audit Log */}
      <div className="bg-slate-900 border border-red-500/50 rounded-xl p-4 mb-6 w-full max-w-sm max-h-[500px] overflow-y-auto">
        <p className="text-orange-400 font-display text-sm mb-3 tracking-wider">📋 BITÁCORA DE AUDITORÍA LOGÍSTICA</p>
        {errorLog.length === 0 ? (
          <p className="text-green-400 text-sm font-mono">✅ Operación impecable. Cero errores de conocimiento registrados.</p>
        ) : (
          <div className="space-y-3">
            {errorLog.map((entry, i) => (
              <div key={i} className="whitespace-pre-wrap text-sm leading-relaxed text-gray-300 bg-slate-800/80 p-4 rounded border-l-4 border-red-500">
                <span className="text-red-400 font-bold text-xs">🔴 Error #{i + 1}</span>
                <div className="mt-1">{entry}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={sendWhatsApp}
        className="w-full max-w-sm bg-green-500 hover:bg-green-600 text-white font-display text-lg py-4 rounded-xl transition-all active:scale-95 animate-pulse"
      >
        📲 ENVIAR CALIFICACIÓN OFICIAL A LA PROFE
      </button>
      <p className="text-red-400 text-xs mt-3 font-bold">⚠️ Atención: Si no envías tu reporte por WhatsApp, tu nota será 0.0</p>
    </div>
  );
}
