import { useState, forwardRef, useImperativeHandle } from 'react';

export interface Crisis6Ref {
  validate: () => boolean;
  getStateDescription: () => string;
}

const Crisis6Console = forwardRef<Crisis6Ref>((_, ref) => {
  const [card1, setCard1] = useState('');
  const [card2, setCard2] = useState('');

  useImperativeHandle(ref, () => ({
    validate: () => card1 === 'picking' && card2 === 'packing',
    getStateDescription: () => {
      const labels: Record<string, string> = { picking: 'PICKING', packing: 'PACKING', '': '(sin seleccionar)' };
      return `🃏 TUS RESPUESTAS:\n  Gemelo A (el viajero): ${labels[card1] || card1}\n  Gemelo B (el empacador): ${labels[card2] || card2}\n🎯 CORRECTO: Gemelo A = PICKING, Gemelo B = PACKING\n✅ POR QUÉ: PICKING (Pick = Recoger) es el operario que CAMINA por la bodega recolectando artículos. PACKING (Pack = Empacar) es la estación FIJA donde se arma la caja con burbujas y cinta. Cruzarlos genera devoluciones millonarias.`;
    },
  }));

  const options = [
    { value: '', label: 'Seleccionar...' },
    { value: 'picking', label: 'Soy el PICKING' },
    { value: 'packing', label: 'Soy el PACKING' },
  ];

  return (
    <div className="space-y-4">
      <div className="bg-slate-800 border border-orange-500/30 rounded-xl p-5 shadow-lg">
        <div className="text-orange-300 text-lg font-bold mb-2">🧭 Gemelo A</div>
        <p className="text-slate-300 text-sm leading-relaxed mb-4">
          «Soy el viajero explorador. Camino kilómetros por los pasillos con un escáner y un carrito.
          Mi única misión es ir a las estanterías a <span className="text-orange-400 font-bold">BUSCAR y RECOLECTAR</span> los
          productos exactos que pide el cliente. ¿Quién soy?»
        </p>
        <select
          value={card1}
          onChange={e => setCard1(e.target.value)}
          className="w-full bg-slate-900 border border-slate-600 text-slate-100 rounded-lg px-4 py-3 text-base focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none"
        >
          {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      <div className="bg-slate-800 border border-cyan-500/30 rounded-xl p-5 shadow-lg">
        <div className="text-cyan-300 text-lg font-bold mb-2">📦 Gemelo B</div>
        <p className="text-slate-300 text-sm leading-relaxed mb-4">
          «Soy el protector estático. Me quedo quieto en mi mesa de trabajo. Tengo cajas, plástico burbuja
          y cinta adhesiva. Mi misión es <span className="text-cyan-400 font-bold">EMPACAR</span> el producto que me traen, sellarlo
          y etiquetarlo para el rudo viaje en camión. ¿Quién soy?»
        </p>
        <select
          value={card2}
          onChange={e => setCard2(e.target.value)}
          className="w-full bg-slate-900 border border-slate-600 text-slate-100 rounded-lg px-4 py-3 text-base focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none"
        >
          {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>
    </div>
  );
});

Crisis6Console.displayName = 'Crisis6Console';
export default Crisis6Console;
