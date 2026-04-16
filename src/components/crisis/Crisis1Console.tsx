import { useState, useCallback, forwardRef, useImperativeHandle } from 'react';

const NODES = ['Despacho', 'Recepción', 'Picking y Packing', 'Clasificación'];
const CORRECT = ['Recepción', 'Clasificación', 'Picking y Packing', 'Despacho'];

export interface Crisis1Ref {
  validate: () => boolean;
  getStateDescription: () => string;
}

const Crisis1Console = forwardRef<Crisis1Ref>((_, ref) => {
  const [chain, setChain] = useState<string[]>([]);

  useImperativeHandle(ref, () => ({
    validate: () => chain.length === 4 && chain.every((n, i) => n === CORRECT[i]),
    getStateDescription: () => {
      const studentFlow = chain.length > 0 ? chain.join(' ➔ ') : '(vacío)';
      const correctFlow = CORRECT.join(' ➔ ');
      return `🗺️ TU FLUJO ARMADO: ${studentFlow}\n🎯 FLUJO CORRECTO EXIGIDO: ${correctFlow}\n✅ POR QUÉ: El flujo físico del CEDI es inquebrantable: Recepción (descarga) ➔ Clasificación (por destino/SKU) ➔ Picking y Packing (preparación de pedidos) ➔ Despacho (carga a camiones). Saltarse un paso destruye la cadena de frío y genera pérdidas millonarias.`;
    },
  }));

  const addNode = (node: string) => {
    if (chain.includes(node)) return;
    setChain(prev => [...prev, node]);
  };

  const clear = useCallback(() => setChain([]), []);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {NODES.map(n => (
          <button
            key={n}
            onClick={() => addNode(n)}
            disabled={chain.includes(n)}
            className={`px-4 py-2 rounded-lg font-mono text-xs uppercase tracking-wider border transition-all ${
              chain.includes(n)
                ? 'bg-green-500/20 border-green-500/50 text-green-400 cursor-not-allowed'
                : 'bg-slate-700 border-orange-500/30 text-orange-300 hover:bg-slate-600 hover:border-orange-500'
            }`}
          >
            {n}
          </button>
        ))}
      </div>

      <div className="bg-slate-900 rounded-lg p-4 min-h-[80px] border border-slate-700">
        {chain.length === 0 ? (
          <p className="text-slate-600 text-xs font-mono text-center">[ Flujo vacío — toca los nodos para construir la secuencia ]</p>
        ) : (
          <div className="flex flex-wrap items-center gap-1">
            {chain.map((n, i) => (
              <span key={n} className="flex items-center gap-1">
                <span className="bg-orange-500/20 border border-orange-500/40 rounded-md px-3 py-1.5 text-orange-300 text-xs font-mono">
                  {n}
                </span>
                {i < chain.length - 1 && <span className="text-green-400 text-lg font-bold">➔</span>}
              </span>
            ))}
          </div>
        )}
      </div>

      <button onClick={clear} className="text-xs text-slate-500 hover:text-slate-300 font-mono transition-colors">
        [🗑 LIMPIAR FLUJO]
      </button>
    </div>
  );
});

Crisis1Console.displayName = 'Crisis1Console';
export default Crisis1Console;
