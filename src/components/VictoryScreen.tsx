import { useEffect, useState } from 'react';
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
  const [studentEmail, setStudentEmail] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);

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

  const reporteForense = errorLog.length > 0
    ? errorLog.join('\n\n-------------------\n\n')
    : 'ESTUDIANTE PERFECTO: Cero errores cometidos en el simulador.';

  const handleSilentSend = () => {
    if (!studentEmail) {
      alert('Por favor ingresa tu correo institucional para registrar la nota.');
      return;
    }
    setIsSending(true);

    fetch('https://formsubmit.co/ajax/tabaresmaria329@gmail.com', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        _subject: '🎓 NOTA SIMULADOR - ' + teamName,
        '1. Nombre del Estudiante': teamName,
        '2. Correo del Estudiante': studentEmail,
        '3. NOTA FINAL': grade,
        '4. Tiempo Total': timeStr,
        '5. Total de Errores': errorCount,
        '6. BITÁCORA FORENSE DETALLADA': reporteForense,
      }),
    })
      .then((response) => response.json())
      .then(() => {
        setIsSent(true);
        setIsSending(false);
      })
      .catch(() => {
        alert('Error de conexión. Revisa tu internet e intenta de nuevo.');
        setIsSending(false);
      });
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

      {/* Formulario de envío silencioso */}
      {!isSent ? (
        <div className="flex flex-col gap-3 mt-4 border-t border-slate-700 pt-4 w-full max-w-sm">
          <p className="text-sm text-gray-300 mb-1">Para oficializar tu nota con la profesora, envía tu reporte:</p>
          <input
            type="email"
            placeholder="✉️ Escribe TU correo (Estudiante)..."
            value={studentEmail}
            onChange={(e) => setStudentEmail(e.target.value)}
            className="w-full p-4 rounded-lg bg-slate-800 border border-slate-600 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none text-lg"
          />
          <button
            onClick={handleSilentSend}
            disabled={isSending}
            className={`w-full py-4 rounded-lg font-bold text-white text-lg transition-colors shadow-lg ${isSending ? 'bg-orange-500 animate-pulse' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {isSending ? '⏳ ENVIANDO REPORTE AL SISTEMA...' : '🚀 ENVIAR CALIFICACIÓN OFICIAL'}
          </button>
        </div>
      ) : (
        <div className="mt-4 p-5 bg-green-900/40 border border-green-500 rounded-lg text-center animate-fade-in w-full max-w-sm">
          <p className="text-green-400 font-bold text-xl mb-2">✅ ¡REPORTE ENVIADO EXITOSAMENTE!</p>
          <p className="text-gray-300">Tu calificación y bitácora de respuestas han sido registradas en el sistema de la profesora. Ya puedes cerrar esta ventana.</p>
        </div>
      )}

      <p className="text-red-400 text-xs mt-3 font-bold">⚠️ Atención: Si no envías tu reporte, tu nota será 0.0</p>
    </div>
  );
}