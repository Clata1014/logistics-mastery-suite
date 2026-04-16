import { useState, useRef, ReactNode } from 'react';
import { speak } from '@/lib/speech';
import { detectSpam, SPAM_PENALTY } from '@/lib/keywordValidator';
import SignatureCanvas from './SignatureCanvas';

interface CrisisWrapperProps {
  crisisNumber: number;
  icon: string;
  title: string;
  dossier: string;
  children: ReactNode;
  validateGame: () => boolean;
  getGameStateDescription?: () => string;
  successVoice: string;
  errorExplanation: string;
  onSuccess: () => void;
  onError: (voice: string, detail?: string) => void;
}

export default function CrisisWrapper({
  crisisNumber,
  icon,
  title,
  dossier,
  children,
  validateGame,
  getGameStateDescription,
  successVoice,
  errorExplanation,
  onSuccess,
  onError,
}: CrisisWrapperProps) {
  const [justification, setJustification] = useState('');
  const hasSigRef = useRef(false);

  const handleAuthorize = () => {
    if (justification.trim().length < 40) {
      alert('⚠️ Tu justificación gerencial debe tener al menos 40 caracteres. Explica tu razonamiento.');
      return;
    }
    if (detectSpam(justification)) {
      onError(SPAM_PENALTY, `❌ CRISIS ${crisisNumber}: ${title}\n🚫 INTENTO DE FRAUDE\n✍️ LO QUE TÚ ESCRIBISTE: "${justification.slice(0, 200)}"\n📊 ANÁLISIS: El sistema detectó caracteres repetitivos consecutivos (regex anti-trampa). Esto evidencia relleno de texto sin contenido académico.`);
      return;
    }
    if (!hasSigRef.current) {
      alert('⚠️ Debes firmar el canvas como Gerente Responsable antes de autorizar.');
      return;
    }
    if (validateGame()) {
      speak(successVoice);
      onSuccess();
    } else {
      // Build hyper-detailed error
      const stateDesc = getGameStateDescription ? getGameStateDescription() : '';
      const truncatedText = justification.length > 200 ? justification.slice(0, 200) + '...' : justification;
      const detail = `❌ CRISIS ${crisisNumber}: ${title}\n✍️ TU JUSTIFICACIÓN: "${truncatedText}"\n${stateDesc}`;
      onError(errorExplanation, detail);
    }
  };

  return (
    <div className="animate-fade-in space-y-5 pb-8">
      {/* Crisis header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-red-500/20 border border-red-500/40 flex items-center justify-center text-xl">
          {icon}
        </div>
        <div>
          <p className="text-[10px] font-mono text-red-400 uppercase tracking-widest">Crisis {crisisNumber} de 6</p>
          <h2 className="font-display text-sm text-orange-400 leading-tight">{title}</h2>
        </div>
      </div>

      {/* Dossier */}
      <div className="bg-slate-800/80 border border-red-500/30 rounded-xl p-4 space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-red-500 animate-pulse text-lg">●</span>
          <span className="text-[10px] font-mono text-red-400 uppercase tracking-widest">Dossier de Crisis — Clasificado</span>
        </div>
        <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">{dossier}</p>
      </div>

      {/* Media Placeholder */}
      <div className="border-2 border-dashed border-orange-500/50 bg-slate-800 h-56 flex flex-col items-center justify-center text-orange-400 rounded-xl shadow-inner text-center p-4 cursor-pointer hover:bg-slate-700 transition-colors">
        🎬 [ZONA MULTIMEDIA DE LA PROFESORA]
        <span className="text-sm text-slate-400 mt-2">Espacio reservado para inyectar foto/video real de la operación</span>
      </div>

      {/* Interactive console */}
      <div className="bg-slate-800/60 border border-orange-500/20 rounded-xl p-4">
        <p className="text-[10px] font-mono text-green-400 uppercase tracking-widest mb-4">▶ Consola Interactiva</p>
        {children}
      </div>

      {/* Triple Lock */}
      <div className="bg-slate-900/80 border border-orange-500/30 rounded-xl p-4 space-y-4">
        <p className="text-[10px] font-mono text-yellow-400 uppercase tracking-widest">🔒 Triple Candado de Autorización</p>

        <div className="space-y-1">
          <label className="text-xs text-orange-400 font-mono uppercase tracking-wider">📝 Justificación Gerencial (mín. 40 caracteres)</label>
          <textarea
            value={justification}
            onChange={(e) => setJustification(e.target.value)}
            placeholder="Explica tu razonamiento profesional para esta decisión operativa..."
            className="w-full min-h-[80px] bg-slate-800 border border-orange-500/30 rounded-lg p-3 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-orange-500 font-mono resize-none"
          />
          <p className="text-[10px] text-slate-600 font-mono text-right">{justification.trim().length}/40 mín.</p>
        </div>

        <SignatureCanvas onSignatureChange={(has) => { hasSigRef.current = has; }} />

        <button
          onClick={handleAuthorize}
          className="w-full py-3 rounded-xl font-display text-sm uppercase tracking-wider bg-gradient-to-r from-orange-600 to-red-600 text-white hover:from-orange-500 hover:to-red-500 transition-all shadow-lg shadow-orange-500/20 active:scale-[0.98]"
        >
          ⚡ AUTORIZAR INTERVENCIÓN
        </button>
      </div>
    </div>
  );
}
