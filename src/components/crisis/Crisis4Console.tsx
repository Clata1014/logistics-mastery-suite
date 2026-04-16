import { useState, forwardRef, useImperativeHandle } from 'react';

export interface Crisis4Ref {
  validate: () => boolean;
  getStateDescription: () => string;
}

const Crisis4Console = forwardRef<Crisis4Ref>((_, ref) => {
  const [value, setValue] = useState(50);

  useImperativeHandle(ref, () => ({
    validate: () => value === 53,
    getStateDescription: () => {
      return `🎛️ TU CALIBRACIÓN: ${value}%\n🎯 CORRECTO: 53% exacto.\n✅ POR QUÉ: La Última Milla (Last Mile) representa hasta el 53% del costo total logístico. Es el tramo más corto pero el más ineficiente: tráfico urbano, calles estrechas, direcciones incorrectas y la ausencia del cliente generan re-entregas que duplican el costo de cada paquete.`;
    },
  }));

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <p className="text-xs text-orange-400 font-mono uppercase tracking-widest">Escáner de Costos — Última Milla</p>
        <div className="font-display text-7xl text-orange-400 tabular-nums" style={{
          textShadow: '0 0 30px rgba(249,115,22,0.5), 0 0 60px rgba(249,115,22,0.2)',
        }}>
          {value}%
        </div>
        <p className="text-[10px] text-slate-500 font-mono">% del costo total logístico</p>
      </div>

      <input
        type="range"
        min={0}
        max={100}
        step={1}
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
        className="w-full h-4 rounded-full appearance-none cursor-pointer bg-slate-700 accent-orange-500"
      />
      <div className="flex justify-between text-[10px] text-slate-500 font-mono">
        <span>0%</span>
        <span>50%</span>
        <span>100%</span>
      </div>
    </div>
  );
});

Crisis4Console.displayName = 'Crisis4Console';
export default Crisis4Console;
