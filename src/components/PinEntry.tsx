import { useState } from 'react';
import { MapPin } from 'lucide-react';
import { speak } from '@/lib/speech';

interface PinStep {
  pin: string;
  voice: string;
  hint?: string;
}

interface PinEntryProps {
  title: string;
  subtitle: string;
  pinSequence: PinStep[];
  errorVoice: string;
  onComplete: () => void;
  onError: (voice: string) => void;
}

export default function PinEntry({
  title,
  subtitle,
  pinSequence,
  errorVoice,
  onComplete,
  onError,
}: PinEntryProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [input, setInput] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [disabled, setDisabled] = useState(false);

  const currentPin = pinSequence[currentIdx];
  const progress = currentIdx + 1;

  const handleSubmit = () => {
    if (!input.trim() || disabled) return;

    if (input.trim() === currentPin.pin) {
      setDisabled(true);
      setFeedback(currentPin.voice);
      speak(currentPin.voice);

      setTimeout(() => {
        setFeedback(null);
        setInput('');
        setDisabled(false);

        if (currentIdx < pinSequence.length - 1) {
          setCurrentIdx(prev => prev + 1);
        } else {
          onComplete();
        }
      }, 2500);
    } else {
      setInput('');
      onError(errorVoice);
    }
  };

  return (
    <div className="flex flex-col items-center text-center flex-1">
      <MapPin className="text-orange mb-4 mt-4" size={80} />
      <h2 className="font-display text-lg text-orange mb-1">{title}</h2>
      <p className="text-muted-foreground text-sm mb-2">{subtitle}</p>

      <div className="flex gap-2 mb-6">
        {pinSequence.map((_, i) => (
          <div
            key={i}
            className={`w-8 h-2 rounded-full transition-all ${
              i < currentIdx ? 'bg-emerald-500' : i === currentIdx ? 'bg-orange' : 'bg-secondary'
            }`}
          />
        ))}
      </div>

      <p className="text-foreground font-medium text-base mb-2">
        PIN {progress} de {pinSequence.length}
      </p>
      {currentPin.hint && (
        <p className="text-orange font-medium text-sm mb-4 w-full text-left">{currentPin.hint}</p>
      )}
      <p className="text-muted-foreground text-sm mb-6">Ingresa el PIN del cartel:</p>

      {feedback && (
        <div className="rounded-xl p-3 mb-4 text-sm bg-emerald-900/40 border border-emerald-500/30 text-emerald-300 w-full">
          {feedback}
        </div>
      )}

      <div className="w-full mt-auto space-y-3 pb-4">
        <input
          type="number"
          placeholder="PIN"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          disabled={disabled}
          className="w-full bg-card border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-center text-2xl font-display tracking-widest disabled:opacity-50"
        />
        <button
          onClick={handleSubmit}
          disabled={!input.trim() || disabled}
          className="w-full bg-orange text-primary-foreground font-display py-3 rounded-xl glow-orange hover:glow-orange-intense transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
        >
          ENVIAR PIN
        </button>
      </div>

      <button
        onClick={() => {
          if (disabled) return;
          if (currentIdx < pinSequence.length - 1) {
            setCurrentIdx(prev => prev + 1);
            setInput('');
          } else {
            onComplete();
          }
        }}
        className="fixed bottom-0 right-0 w-24 h-24 bg-transparent z-[9999] opacity-0 cursor-default focus:outline-none outline-none"
        aria-hidden="true"
        tabIndex={-1}
      />
    </div>
  );
}
