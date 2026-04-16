import { useState, forwardRef, useImperativeHandle } from 'react';

export interface Crisis3Ref {
  validate: () => boolean;
  getStateDescription: () => string;
}

const Crisis3Console = forwardRef<Crisis3Ref>((_, ref) => {
  const [gondolas, setGondolas] = useState(50);
  const [skus, setSkus] = useState(7500);

  useImperativeHandle(ref, () => ({
    validate: () => gondolas === 0 && skus < 1000,
    getStateDescription: () => {
      return `🎛️ TU CONFIGURACIÓN: Lujos al ${gondolas}% y ${skus.toLocaleString()} SKUs.\n🎯 CORRECTO: 0% Lujos y portafolio súper limitado (<1,000 SKUs).\n✅ POR QUÉ: El formato Hard Discount exige austeridad total. Se exhibe y vende desde la misma caja de cartón rasgada (0% góndolas lujosas). Menos variedad de SKUs = reabastecimiento más rápido, alta rotación y precios imbatibles. El rey absoluto es el PRECIO.`;
    },
  }));

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex justify-between items-end">
          <label className="text-xs text-orange-400 font-mono uppercase tracking-wider">Presupuesto en Góndolas Lujosas</label>
          <span className="font-display text-2xl text-orange-300">{gondolas}%</span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          step={5}
          value={gondolas}
          onChange={(e) => setGondolas(Number(e.target.value))}
          className="w-full h-3 rounded-full appearance-none cursor-pointer bg-slate-700 accent-orange-500"
        />
        <div className="flex justify-between text-[10px] text-slate-500 font-mono">
          <span>0% — Austero</span>
          <span>100% — Lujo Total</span>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-end">
          <label className="text-xs text-orange-400 font-mono uppercase tracking-wider">Límite de SKUs / Variedad</label>
          <span className="font-display text-2xl text-orange-300">{skus.toLocaleString()}</span>
        </div>
        <input
          type="range"
          min={0}
          max={15000}
          step={100}
          value={skus}
          onChange={(e) => setSkus(Number(e.target.value))}
          className="w-full h-3 rounded-full appearance-none cursor-pointer bg-slate-700 accent-orange-500"
        />
        <div className="flex justify-between text-[10px] text-slate-500 font-mono">
          <span>0 — Mínimo</span>
          <span>15,000 — Máxima Variedad</span>
        </div>
      </div>
    </div>
  );
});

Crisis3Console.displayName = 'Crisis3Console';
export default Crisis3Console;
