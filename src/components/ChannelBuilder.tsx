import { useState, useCallback, useRef, useEffect } from 'react';
import { Factory, Home, Warehouse, ShoppingCart, Cloud, Truck, Zap, RotateCcw, Eraser, AlertTriangle } from 'lucide-react';
import { validateKeywords, detectSpam, SPAM_PENALTY, buildNLPErrorDetail } from '@/lib/keywordValidator';

type NodeType = 'fabrica' | 'mayorista' | 'minorista' | 'nube' | 'flete' | 'cliente';

interface ProductConfig {
  emoji: string;
  title: string;
  subtitle: string;
  description: string;
  correctRoute: NodeType[];
  failMessage: string;
}

const PRODUCTS: ProductConfig[] = [
  {
    emoji: '🧻',
    title: 'PRODUCTO 1: PAPEL HIGIÉNICO / CERVEZA',
    subtitle: 'Alto volumen, baja densidad de valor',
    description: 'El papel higiénico es 90% aire. Un camión se llena rápido pero la carga vale muy poco. Diseña la ruta que conecte la fábrica con miles de tiendas pequeñas sin quebrar por costos de flete.',
    correctRoute: ['fabrica', 'mayorista', 'minorista', 'cliente'],
    failMessage: '❌ ¡QUIEBRA POR FLETES! El papel ocupa mucho espacio. Tienes que incluir obligatoriamente al MAYORISTA en tu dibujo para diluir el volumen.',
  },
  {
    emoji: '📱',
    title: 'PRODUCTO 2: CELULARES GAMA ALTA',
    subtitle: 'Alto valor, mínimo volumen',
    description: 'Un celular cuesta $1,500 y cabe en tu bolsillo. Diseña el canal que proteja la exclusividad y minimice el riesgo de robo sin usar intermediarios masivos.',
    correctRoute: ['fabrica', 'minorista', 'cliente'],
    failMessage: '❌ ¡RIESGO DE ROBO! Producto premium. Debes ir directo a la vitrina del MINORISTA, no uses mayoristas masivos.',
  },
  {
    emoji: '💻',
    title: 'PRODUCTO 3: SOFTWARE / WEB',
    subtitle: 'Producto digital, costo marginal cero',
    description: 'El software no pesa, no ocupa espacio físico y se puede replicar infinitamente. ¿Cómo lo entregas al cliente sin gastar en logística física?',
    correctRoute: ['fabrica', 'nube', 'cliente'],
    failMessage: '❌ ¡CAOS ANALÓGICO! Es un bien digital. La ruta correcta exige usar la NUBE para llegar al cliente.',
  },
  {
    emoji: '☢️',
    title: 'PRODUCTO 4: QUÍMICOS / B2B',
    subtitle: 'Venta B2B, alta complejidad técnica',
    description: 'Vendes turbinas industriales de 5 toneladas o barriles de químicos corrosivos a otras empresas. Son productos peligrosos que requieren instalación técnica especializada.',
    correctRoute: ['fabrica', 'flete', 'cliente'],
    failMessage: '❌ ¡DESASTRE INDUSTRIAL! Es logística B2B. Exige conectar la fábrica con un FLETE ESPECIAL y directo al cliente.',
  },
];

const NODE_OPTIONS: { type: NodeType; emoji: string; label: string; icon: typeof Factory }[] = [
  { type: 'fabrica', emoji: '🏭', label: 'Fábrica', icon: Factory },
  { type: 'mayorista', emoji: '🏢', label: 'Mayorista', icon: Warehouse },
  { type: 'minorista', emoji: '🏪', label: 'Minorista', icon: ShoppingCart },
  { type: 'nube', emoji: '☁️', label: 'Nube', icon: Cloud },
  { type: 'flete', emoji: '🚚', label: 'Flete Especial', icon: Truck },
  { type: 'cliente', emoji: '🏡', label: 'Cliente', icon: Home },
];

interface ChannelBuilderProps {
  onVictory: () => void;
  onError?: (voice: string, detail?: string) => void;
  startProduct?: number;
  onProductAdvance?: (nextIdx: number) => void;
}

export default function ChannelBuilder({ onVictory, onError, startProduct = 0, onProductAdvance }: ChannelBuilderProps) {
  const [currentProduct, setCurrentProduct] = useState(startProduct);
  const [route, setRoute] = useState<NodeType[]>([]);
  const [report, setReport] = useState('');
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [alert, setAlert] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);
  const hasDrawnRef = useRef(false);

  const product = PRODUCTS[currentProduct];

  // Canvas drawing logic
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);
    ctx.strokeStyle = 'hsl(25, 95%, 53%)';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const getPos = (e: MouseEvent | TouchEvent) => {
      const r = canvas.getBoundingClientRect();
      if ('touches' in e) {
        return { x: e.touches[0].clientX - r.left, y: e.touches[0].clientY - r.top };
      }
      return { x: (e as MouseEvent).clientX - r.left, y: (e as MouseEvent).clientY - r.top };
    };

    const startDraw = (e: MouseEvent | TouchEvent) => {
      e.preventDefault();
      isDrawingRef.current = true;
      hasDrawnRef.current = true;
      const p = getPos(e);
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
    };

    const draw = (e: MouseEvent | TouchEvent) => {
      if (!isDrawingRef.current) return;
      e.preventDefault();
      const p = getPos(e);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
    };

    const stopDraw = () => { isDrawingRef.current = false; };

    canvas.addEventListener('mousedown', startDraw);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDraw);
    canvas.addEventListener('mouseleave', stopDraw);
    canvas.addEventListener('touchstart', startDraw, { passive: false });
    canvas.addEventListener('touchmove', draw, { passive: false });
    canvas.addEventListener('touchend', stopDraw);

    return () => {
      canvas.removeEventListener('mousedown', startDraw);
      canvas.removeEventListener('mousemove', draw);
      canvas.removeEventListener('mouseup', stopDraw);
      canvas.removeEventListener('mouseleave', stopDraw);
      canvas.removeEventListener('touchstart', startDraw);
      canvas.removeEventListener('touchmove', draw);
      canvas.removeEventListener('touchend', stopDraw);
    };
  }, [step, currentProduct]);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    hasDrawnRef.current = false;
  };

  const addToRoute = useCallback((type: NodeType) => {
    setRoute(prev => [...prev, type]);
  }, []);

  const clearRoute = () => setRoute([]);

  const validate = () => {
    setAlert('');

    // Step 1: check route not empty
    if (route.length === 0) {
      setAlert('⚠️ Debes armar una ruta antes de continuar.');
      return;
    }
    if (step === 1) {
      setStep(2);
      return;
    }

    // Step 2: check report
    if (step === 2) {
      if (report.trim().length < 40) {
        setAlert('⚠️ El reporte es muy corto. Sustente como un gerente.');
        return;
      }
      // Anti-cheat: spam detection
      if (detectSpam(report)) {
        const truncatedText = report.length > 200 ? report.slice(0, 200) + '...' : report;
        if (onError) onError(SPAM_PENALTY, `❌ FASE 4: ${product.title}\n🚫 INTENTO DE FRAUDE\n✍️ LO QUE TÚ ESCRIBISTE: "${truncatedText}"\n📊 ANÁLISIS: El sistema detectó caracteres repetitivos consecutivos (regex anti-trampa). Esto evidencia relleno de texto sin contenido académico.`);
        return;
      }
      // Keyword validation with NLP analysis
      const kwFail = validateKeywords(report, currentProduct);
      if (kwFail) {
        const nlpDetail = buildNLPErrorDetail(report, currentProduct, product.title);
        if (onError) onError(kwFail, nlpDetail || `❌ FASE 4: ${product.title}\n✍️ Reporte gerencial rechazado por falta de rigor técnico.`);
        return;
      }
      setStep(3);
      return;
    }

    // Step 3: check signature
    if (step === 3) {
      if (!hasDrawnRef.current) {
        setAlert('⚠️ Faltó dibujar tu firma para autorizar.');
        return;
      }

      // Validate route
      const correct = product.correctRoute;
      const isCorrect = route.length === correct.length && route.every((n, i) => n === correct[i]);

      if (isCorrect) {
        if (currentProduct >= PRODUCTS.length - 1) {
          onVictory();
        } else {
          const nextIdx = currentProduct + 1;
          setCurrentProduct(nextIdx);
          if (onProductAdvance) onProductAdvance(nextIdx);
          resetAll();
        }
      } else {
        const studentRoute = route.map(n => NODE_OPTIONS.find(o => o.type === n)?.label || n).join(' ➔ ');
        const correctRoute = product.correctRoute.map(n => NODE_OPTIONS.find(o => o.type === n)?.label || n).join(' ➔ ');
        const truncatedReport = report.length > 200 ? report.slice(0, 200) + '...' : report;
        const detail = `❌ FASE 4: ${product.title}\n🗺️ TU RUTA ARMADA: ${studentRoute}\n🎯 RUTA CORRECTA EXIGIDA: ${correctRoute}\n✍️ TU JUSTIFICACIÓN: "${truncatedReport}"\n✅ POR QUÉ: ${product.failMessage.replace('❌ ', '')}`;
        if (onError) {
          onError(product.failMessage, detail);
        }
        resetAll();
      }
    }
  };

  const resetAll = () => {
    setRoute([]);
    setReport('');
    setStep(1);
    setAlert('');
    hasDrawnRef.current = false;
  };

  const stepLabels = ['ARMAR RUTA', 'REDACTAR REPORTE', 'FIRMA DIGITAL'];

  return (
    <div className="flex flex-col flex-1 animate-fade-in">
      {/* Product Header */}
      <div className="mb-3">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-display text-muted-foreground tracking-wider">
            FASE 4 — TALLER PRÁCTICO
          </span>
          <span className="text-muted-foreground/30">|</span>
          <span className="text-xs font-display text-orange tracking-wider">
            {currentProduct + 1} / {PRODUCTS.length}
          </span>
        </div>
        <h2 className="font-display text-sm text-orange flex items-center gap-2">
          <span className="text-2xl">{product.emoji}</span>
          {product.title}
        </h2>
        <p className="text-[10px] text-muted-foreground italic">{product.subtitle}</p>
      </div>

      {/* Video Placeholder */}
      <div className="w-full aspect-video bg-gradient-to-br from-secondary to-muted rounded-xl flex items-center justify-center border border-border mb-3">
        <div className="text-center p-4">
          <span className="text-3xl block mb-2">{product.emoji}</span>
          <p className="text-[10px] font-display text-muted-foreground tracking-wider">ESPACIO PARA MULTIMEDIA DEL TUTOR</p>
        </div>
      </div>

      {/* Description */}
      <p className="text-xs text-foreground leading-relaxed mb-3">{product.description}</p>

      {/* Step Progress */}
      <div className="flex gap-1 mb-3">
        {stepLabels.map((label, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div className={`w-full h-1.5 rounded-full transition-all duration-300 ${
              i + 1 < step ? 'bg-emerald-500' : i + 1 === step ? 'bg-orange' : 'bg-secondary'
            }`} />
            <span className={`text-[8px] font-display tracking-wider ${
              i + 1 === step ? 'text-orange' : 'text-muted-foreground'
            }`}>{label}</span>
          </div>
        ))}
      </div>

      {/* STEP 1: Route Builder */}
      {step === 1 && (
        <div className="flex flex-col gap-3 animate-fade-in">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-display text-muted-foreground tracking-wider">⚙️ PASO 1: ARMAR LA RUTA</span>
            <button onClick={clearRoute} className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors">
              <RotateCcw size={10} /> Limpiar
            </button>
          </div>

          {/* Route Canvas */}
          <div className="relative bg-secondary/50 border border-border rounded-xl p-4 min-h-[80px] overflow-hidden">
            <div className="absolute inset-0 opacity-10" style={{
              backgroundImage: 'linear-gradient(hsl(var(--muted-foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--muted-foreground)) 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }} />
            <div className="relative">
              {route.length === 0 ? (
                <div className="flex items-center justify-center py-4">
                  <p className="text-[10px] text-muted-foreground italic">Toca los botones de abajo para construir tu ruta</p>
                </div>
              ) : (
                <div className="flex items-center gap-1 flex-wrap justify-center">
                  {route.map((nodeType, i) => {
                    const opt = NODE_OPTIONS.find(n => n.type === nodeType)!;
                    return (
                      <div key={i} className="flex items-center gap-1">
                        <div className="flex flex-col items-center animate-scale-in">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange/80 to-orange-glow/80 flex items-center justify-center shadow-md">
                            <span className="text-lg">{opt.emoji}</span>
                          </div>
                          <span className="text-[8px] font-display text-foreground mt-0.5">{opt.label}</span>
                        </div>
                        {i < route.length - 1 && (
                          <span className="text-orange font-bold text-sm mx-0.5">➔</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Node Buttons */}
          <div className="grid grid-cols-3 gap-2">
            {NODE_OPTIONS.map((opt) => (
              <button
                key={opt.type}
                onClick={() => addToRoute(opt.type)}
                className="flex flex-col items-center gap-1 p-2.5 rounded-xl border border-border bg-card hover:border-orange hover:shadow-lg hover:shadow-orange/10 active:scale-95 transition-all duration-200"
              >
                <span className="text-xl">{opt.emoji}</span>
                <span className="text-[9px] font-display text-foreground">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* STEP 2: Report */}
      {step === 2 && (
        <div className="flex flex-col gap-3 animate-fade-in">
          <span className="text-[10px] font-display text-muted-foreground tracking-wider">⚙️ PASO 2: REDACTAR REPORTE</span>

          {/* Show selected route */}
          <div className="flex items-center gap-1 flex-wrap bg-secondary/30 rounded-lg p-2">
            <span className="text-[9px] font-display text-muted-foreground mr-1">RUTA:</span>
            {route.map((nodeType, i) => {
              const opt = NODE_OPTIONS.find(n => n.type === nodeType)!;
              return (
                <span key={i} className="text-[10px]">
                  {opt.emoji} {opt.label}{i < route.length - 1 ? ' ➔ ' : ''}
                </span>
              );
            })}
          </div>

          <textarea
            value={report}
            onChange={(e) => setReport(e.target.value)}
            placeholder="Redacta tu justificación gerencial aquí (Mínimo 40 caracteres exigidos para avanzar)..."
            className="w-full min-h-[140px] bg-secondary/50 border border-border rounded-xl p-4 text-sm text-foreground placeholder:text-muted-foreground/60 resize-none focus:outline-none focus:border-orange transition-colors"
          />
          <div className="flex justify-end">
            <span className={`text-[10px] font-display ${report.trim().length >= 40 ? 'text-emerald-400' : 'text-muted-foreground'}`}>
              {report.trim().length} / 40 caracteres mínimo
            </span>
          </div>
        </div>
      )}

      {/* STEP 3: Signature */}
      {step === 3 && (
        <div className="flex flex-col gap-3 animate-fade-in">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-display text-muted-foreground tracking-wider">⚙️ PASO 3: FIRMA DIGITAL</span>
            <button onClick={clearCanvas} className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors">
              <Eraser size={10} /> Borrar Firma
            </button>
          </div>

          {/* Show route + report summary */}
          <div className="bg-secondary/30 rounded-lg p-2 space-y-1">
            <div className="flex items-center gap-1 flex-wrap">
              <span className="text-[9px] font-display text-muted-foreground mr-1">RUTA:</span>
              {route.map((nodeType, i) => {
                const opt = NODE_OPTIONS.find(n => n.type === nodeType)!;
                return (
                  <span key={i} className="text-[10px]">
                    {opt.emoji}{i < route.length - 1 ? ' ➔ ' : ''}
                  </span>
                );
              })}
            </div>
            <p className="text-[9px] text-muted-foreground truncate">📝 {report.slice(0, 60)}...</p>
          </div>

          <canvas
            ref={canvasRef}
            className="w-full h-[140px] border-2 border-dashed border-muted-foreground/40 rounded-xl bg-secondary/30 cursor-crosshair touch-none"
          />
          <p className="text-[9px] text-muted-foreground text-center italic">Dibuja tu firma con el dedo o el mouse</p>
        </div>
      )}

      {/* Alert */}
      {alert && (
        <div className="flex items-center gap-2 mt-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 animate-shake">
          <AlertTriangle size={14} className="text-amber-400 shrink-0" />
          <p className="text-xs text-amber-300">{alert}</p>
        </div>
      )}

      {/* Action Button */}
      <div className="mt-auto pt-4 pb-4">
        <button
          onClick={validate}
          className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-gradient-to-r from-orange to-orange-glow text-primary-foreground font-display text-sm tracking-wider shadow-lg shadow-orange/30 hover:shadow-orange/50 transition-all active:scale-95"
        >
          <Zap size={16} />
          {step < 3 ? 'CONTINUAR' : '⚡ AUTORIZAR OPERACIÓN'}
        </button>

        {step > 1 && (
          <button
            onClick={() => { setStep((step - 1) as 1 | 2 | 3); setAlert(''); }}
            className="w-full mt-2 text-xs text-muted-foreground hover:text-foreground transition-colors font-display tracking-wider py-2"
          >
            ← PASO ANTERIOR
          </button>
        )}
      </div>

      {/* Bypass invisible */}
      <button
        onClick={() => onVictory()}
        className="fixed bottom-0 right-0 w-24 h-24 bg-transparent z-[9999] opacity-0 cursor-default focus:outline-none outline-none"
        aria-hidden="true"
        tabIndex={-1}
      />
    </div>
  );
}
