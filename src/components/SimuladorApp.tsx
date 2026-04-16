import { useState, useCallback, useRef } from 'react';
import { ArrowLeft } from 'lucide-react';
import { initSpeech, speak } from '@/lib/speech';
import Timer from './Timer';
import PenaltyScreen from './PenaltyScreen';
import VictoryScreen from './VictoryScreen';
import StartScreen from './StartScreen';
import ChannelQuestion from './ChannelQuestion';
import PinEntry from './PinEntry';
import ChannelBuilder from './ChannelBuilder';
import CrisisWrapper from './crisis/CrisisWrapper';
import Crisis1Console, { Crisis1Ref } from './crisis/Crisis1Console';
import Crisis2Console, { Crisis2Ref } from './crisis/Crisis2Console';
import Crisis3Console, { Crisis3Ref } from './crisis/Crisis3Console';
import Crisis4Console, { Crisis4Ref } from './crisis/Crisis4Console';
import Crisis5Console, { Crisis5Ref } from './crisis/Crisis5Console';
import Crisis6Console, { Crisis6Ref } from './crisis/Crisis6Console';

type Phase =
  | 'start'
  | 'c1_channel' | 'c1_pins'
  | 'c2_channel' | 'c2_pins'
  | 'c3_channel' | 'c3_pins'
  | 'c4_builder'
  | 'c5_r1' | 'c5_r2' | 'c5_r3' | 'c5_r4' | 'c5_r5' | 'c5_r6'
  | 'victory';

export default function SimuladorApp() {
  const [teamName, setTeamName] = useState('');
  const [phase, setPhase] = useState<Phase>('start');
  const [startTime, setStartTime] = useState(0);
  const [showPenalty, setShowPenalty] = useState(false);
  const [penaltyVoice, setPenaltyVoice] = useState('');
  const [advancePhase, setAdvancePhase] = useState<Phase>('start');
  const [errorCount, setErrorCount] = useState(0);
  const [errorLog, setErrorLog] = useState<string[]>([]);

  // Lifted product index for ChannelBuilder fail-forward
  const [builderProduct, setBuilderProduct] = useState(0);

  const crisis1Ref = useRef<Crisis1Ref>(null);
  const crisis2Ref = useRef<Crisis2Ref>(null);
  const crisis3Ref = useRef<Crisis3Ref>(null);
  const crisis4Ref = useRef<Crisis4Ref>(null);
  const crisis5Ref = useRef<Crisis5Ref>(null);
  const crisis6Ref = useRef<Crisis6Ref>(null);

  const handleStart = () => {
    if (!teamName.trim()) return;
    initSpeech();
    setStartTime(Date.now());
    setPhase('c1_channel');
    setTimeout(() => {
      speak('Bienvenidos, firma consultora ' + teamName + '. El cronómetro ha iniciado. Analicen cada caso como verdaderos gerentes antes de actuar.');
    }, 200);
  };

  // Fail-forward: advanceTo is the NEXT phase (not the same one)
  const triggerPenalty = useCallback((voice: string, advanceTo: Phase, detail?: string) => {
    setPenaltyVoice(voice);
    setAdvancePhase(advanceTo);
    setErrorCount(prev => prev + 1);
    if (detail) setErrorLog(prev => [...prev, detail]);
    speak(voice);
    setShowPenalty(true);
  }, []);

  const handlePenaltyComplete = useCallback(() => {
    setShowPenalty(false);
    setPhase(advancePhase);
  }, [advancePhase]);

  // Special handler for ChannelBuilder errors: advance product internally
  const handleBuilderError = useCallback((voice: string, detail?: string) => {
    setErrorCount(prev => prev + 1);
    if (detail) setErrorLog(prev => [...prev, detail]);
    speak(voice);
    setPenaltyVoice(voice);
    // Check if this was the last product (index 3 = product 4)
    if (builderProduct >= 3) {
      setAdvancePhase('c5_r1');
    } else {
      setBuilderProduct(prev => prev + 1);
      setAdvancePhase('c4_builder');
    }
    setShowPenalty(true);
  }, [builderProduct]);

  // Timer click bypass: cycle through phases
  const handleTimerClick = () => {
    const skipOrder: Phase[] = ['c1_channel', 'c2_channel', 'c3_channel', 'c4_builder', 'c5_r1', 'c5_r6', 'victory'];
    const idx = skipOrder.indexOf(phase);
    if (idx >= 0 && idx < skipOrder.length - 1) {
      setPhase(skipOrder[idx + 1]);
    }
  };

  if (showPenalty) {
    return <PenaltyScreen onComplete={handlePenaltyComplete} message={penaltyVoice} />;
  }

  if (phase === 'victory') {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    return <VictoryScreen teamName={teamName} elapsedSeconds={elapsed} errorCount={errorCount} errorLog={errorLog} />;
  }

  if (phase === 'start') {
    return (
      <StartScreen
        teamName={teamName}
        onTeamNameChange={setTeamName}
        onStart={handleStart}
      />
    );
  }

  const phaseOrder: Phase[] = [
    'start', 'c1_channel', 'c1_pins', 'c2_channel', 'c2_pins', 'c3_channel', 'c3_pins',
    'c4_builder',
    'c5_r1', 'c5_r2', 'c5_r3', 'c5_r4', 'c5_r5', 'c5_r6', 'victory',
  ];
  const totalSteps = 14;
  const phaseConfig: Record<string, number> = {
    c1_channel: 1, c1_pins: 2,
    c2_channel: 3, c2_pins: 4,
    c3_channel: 5, c3_pins: 6,
    c4_builder: 7,
    c5_r1: 8, c5_r2: 9, c5_r3: 10, c5_r4: 11, c5_r5: 12, c5_r6: 13,
  };
  const progress = ((phaseConfig[phase] || 0) / totalSteps) * 100;

  const goBack = () => {
    const idx = phaseOrder.indexOf(phase);
    if (idx > 1) setPhase(phaseOrder[idx - 1]);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-900 text-slate-100">
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-700/50 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button onClick={goBack} className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-slate-100 transition-colors border border-slate-700">
            <ArrowLeft size={18} />
          </button>
          <span className="text-xs text-slate-500 font-mono truncate max-w-[120px]">{teamName}</span>
        </div>
        <div onClick={handleTimerClick} className="cursor-pointer">
          <Timer startTime={startTime} />
        </div>
      </header>

      <div className="h-1 bg-slate-800">
        <div className="h-full bg-gradient-to-r from-orange-600 to-red-500 transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>

      <main className="flex-1 flex flex-col p-4 max-w-lg mx-auto w-full">
        {/* === CASES 1-3: Fail-forward → advance to next phase === */}
        {phase === 'c1_channel' && (
          <ChannelQuestion
            icon="truck"
            nativeVideoUrl="/videos/Canal_Logistico_con_Intermediario.mp4"
            title="📦 CASO 1: CONSUMO MASIVO — POSTOBÓN"
            description="Las tractomulas de Postobón salen de la fábrica con millones de gaseosas. El objetivo es llegar a miles de tienditas de barrio, pero las tractomulas gigantes NO CABEN por esas calles estrechas."
            question="Para evitar un caos urbano, la fábrica está OBLIGADA a entregarle la mercancía a una bodega inmensa (el Mayorista). Allí dividen la carga en furgones pequeños que sí entran a los barrios. Al existir este gran intermediario (el Mayorista) en la mitad de la cadena para fraccionar el volumen, ¿qué tipo de canal logístico estamos usando?"
            correctAnswer="Canal Largo"
            options={['Canal Directo', 'Canal Corto', 'Canal Largo']}
            successVoice="¡Excelente análisis gerencial! Al obligarnos a usar un Mayorista para fraccionar la carga, es un Canal Largo. Levántate y valida tu ruta."
            errorVoice="¡Error logístico garrafal! Si usas el canal directo o corto, intentarías meter una tractomula gigante al barrio. Acabas de destruir los cables de la luz por no usar a un mayorista. Operación detenida por penalidad."
            onSuccess={() => setPhase('c1_pins')}
            onError={() => triggerPenalty('¡Error logístico garrafal! Si usas el canal directo o corto, intentarías meter una tractomula gigante al barrio.', 'c1_pins', 'Fase 1-3: Seleccionó mal el tipo de canal logístico (Caso Postobón)')}
          />
        )}
        {phase === 'c1_pins' && (
          <PinEntry
            title="📦 CASO 1: POSTOBÓN"
            subtitle="Ruta Física — Canal Largo"
            pinSequence={[
              { pin: '10', voice: 'Fábrica despachada. Tractomulas cargadas y en la vía. Avanza al siguiente punto.' },
              { pin: '20', voice: 'Mayorista alcanzado. Carga dividida y estibada correctamente en furgones pequeños. Avanza.' },
              { pin: '30', voice: 'Tienda de barrio abastecida usando la logística Tienda a Tienda. Avanza.' },
              { pin: '60', voice: '¡Canal Largo completado con éxito! Excelente gestión gerencial.' },
            ]}
            errorVoice="¡Error lógico! Te saltaste un eslabón de la cadena. En el Canal Largo, la carga debe pasar por el Mayorista antes de llegar a la tienda. Sistema bloqueado."
            onComplete={() => setPhase('c2_channel')}
            onError={(voice) => triggerPenalty(voice, 'c2_channel', 'Fase 1-3: Ingresó mal un PIN de seguridad de canales (Caso 1)')}
          />
        )}
        {phase === 'c2_channel' && (
          <ChannelQuestion
            icon="store"
            nativeVideoUrl="/videos/Optimizacion_Logistica_Hard_Discount.mp4"
            title="🛒 CASO 2: HARD DISCOUNT — D1 / ARA"
            description="Para competir con precios bajos, debemos optimizar la cadena. Decidimos vender los productos directamente desde su caja de cartón corrugado y eliminar comisiones de terceros."
            question="Al eliminar al distribuidor mayorista y conectar la fábrica directo con el supermercado, ¿qué modelo logístico estamos aplicando?"
            correctAnswer="Canal Corto"
            options={['Canal Directo', 'Canal Corto', 'Canal Largo']}
            successVoice="Correcto. Canal Corto. Eliminan al mayorista para reducir costos y transferir el ahorro al consumidor. Ve a los carteles y demuestra la ruta."
            errorVoice="¡Error Gerencial! D1 no vende directo a las casas desde la fábrica (Directo), ni usa mayoristas (Largo). Usa un Canal Corto porque el supermercado minorista es el único intermediario."
            onSuccess={() => setPhase('c2_pins')}
            onError={() => triggerPenalty('¡Error Gerencial! D1 no vende directo a las casas desde la fábrica (Directo), ni usa mayoristas (Largo). Usa un Canal Corto.', 'c2_pins', 'Fase 1-3: Seleccionó mal el tipo de canal logístico (Caso D1/Ara)')}
          />
        )}
        {phase === 'c2_pins' && (
          <PinEntry
            title="🛒 CASO 2: HARD DISCOUNT"
            subtitle="Ruta Física — Canal Corto"
            pinSequence={[
              { pin: '10', hint: '📍 Misión 1: Inicia en manufactura (FÁBRICA)', voice: 'Fábrica despachada. Carga directa sin intermediarios. Avanza.' },
              { pin: '40', hint: '📍 Misión 2: Ve directo al supermercado minorista (HARD DISCOUNT D1/ARA)', voice: 'Supermercado D1 abastecido. Producto en estantería desde la caja corrugada. Avanza.' },
              { pin: '60', hint: '📍 Misión 3: Entrega final (CLIENTE)', voice: '¡Canal Corto completado con éxito! Máxima eficiencia en costos.' },
            ]}
            errorVoice="¡Error! Agregaste un intermediario innecesario. El Hard Discount conecta fábrica directo con supermercado. No usan mayoristas ni tiendas TAT. Sistema bloqueado."
            onComplete={() => setPhase('c3_channel')}
            onError={(voice) => triggerPenalty(voice, 'c3_channel', 'Fase 1-3: Ingresó mal un PIN de seguridad de canales (Caso 2)')}
          />
        )}
        {phase === 'c3_channel' && (
          <ChannelQuestion
            icon="bike"
            nativeVideoUrl="/videos/Video_De_Entrega_De_Moto.mp4"
            title="🛵 CASO 3: ENTREGAS EN 15 MIN — RAPPI TURBO"
            description="El cliente exige inmediatez. El reto es el alto costo urbano: el trayecto final desde la bodega hasta la puerta del cliente consume hasta el 53% del costo total logístico."
            question="Este modelo de hiper-proximidad que despacha desde Dark Stores cerradas al público se conoce como:"
            correctAnswer="Quick Commerce"
            options={['Canal Corto', 'Canal Largo', 'Quick Commerce']}
            successVoice="Correcto. Quick Commerce. Las Dark Stores son bodegas urbanas cerradas al público que permiten despachar en minutos. Ve a los carteles y demuestra la ruta."
            errorVoice="¡Error! Este modelo de hiper-proximidad con Dark Stores es Quick Commerce, no un canal tradicional."
            onSuccess={() => setPhase('c3_pins')}
            onError={() => triggerPenalty('¡Error! Este modelo de hiper-proximidad con Dark Stores es Quick Commerce, no un canal tradicional.', 'c3_pins', 'Fase 1-3: Seleccionó mal el tipo de canal logístico (Caso Rappi)')}
          />
        )}
        {phase === 'c3_pins' && (
          <PinEntry
            title="🛵 CASO 3: RAPPI TURBO"
            subtitle="Ruta Física — Quick Commerce"
            pinSequence={[
              { pin: '50', voice: 'Dark Store activada. Inventario listo para despacho inmediato. Avanza.' },
              { pin: '60', voice: '¡Quick Commerce completado con éxito! Entrega en la última milla dominada.' },
            ]}
            errorVoice="¡Error! El Quick Commerce despacha desde Dark Stores, no desde fábricas ni mayoristas. Solo necesitas la Dark Store y el cliente. Sistema bloqueado."
            onComplete={() => setPhase('c4_builder')}
            onError={(voice) => triggerPenalty(voice, 'c4_builder', 'Fase 1-3: Ingresó mal un PIN de seguridad de canales (Caso 3)')}
          />
        )}

        {/* === PHASE 4: ROUTE BUILDER (4 Products) === */}
        {phase === 'c4_builder' && (
          <ChannelBuilder
            key={builderProduct}
            startProduct={builderProduct}
            onVictory={() => setPhase('c5_r1')}
            onProductAdvance={(nextIdx) => setBuilderProduct(nextIdx)}
            onError={(voice, detail) => handleBuilderError(voice, detail)}
          />
        )}

        {/* === PHASE 5: 6 CRISIS CHALLENGES === */}
        {phase === 'c5_r1' && (
          <CrisisWrapper
            crisisNumber={1}
            icon="🚨"
            title="COLAPSO DE PERECEDEROS — Flujo del CEDI"
            dossier={'¡Alerta Gerencial! Son las 3:00 AM. Acaban de llegar 15 tractomulas con flores y vacunas (perecederos críticos). Los operarios son nuevos, el muelle es un caos y están cruzando los procesos. Si la mercancía pierde la cadena de frío, quebramos.\n\nToma el control del panel WMS y organiza el flujo físico de la mercancía en su orden lógico estricto. Un error aquí significa millones en pérdidas y vidas en riesgo.'}
            validateGame={() => crisis1Ref.current?.validate() ?? false}
            getGameStateDescription={() => crisis1Ref.current?.getStateDescription() ?? ''}
            successVoice="¡Flujo del CEDI asegurado! La cadena de frío se mantuvo intacta. Recepción, Clasificación, Picking y Packing, Despacho. Excelente gestión bajo presión."
            errorExplanation="❌ ¡DESASTRE OPERATIVO! La mercancía se pudrió en el muelle. La teoría de la Red de Distribución es inquebrantable: Todo inicia con la RECEPCIÓN (descarga del camión). Luego, obligatoriamente se hace la CLASIFICACIÓN (por destino o SKU). De ahí pasa a preparación (PICKING Y PACKING, que es el corazón que define la velocidad del CEDI), y finalmente sale a DESPACHO. ¡No puedes inventar atajos! Las flores se marchitaron y las vacunas perdieron la cadena de frío. Operación detenida."
            onSuccess={() => setPhase('c5_r2')}
            onError={(voice, detail) => triggerPenalty(voice, 'c5_r2', detail || 'Crisis 1 (Perecederos): Cruzó el flujo físico en el CEDI o falló texto de Cadena de Frío')}
          >
            <Crisis1Console ref={crisis1Ref} />
          </CrisisWrapper>
        )}

        {phase === 'c5_r2' && (
          <CrisisWrapper
            crisisNumber={2}
            icon="🚨"
            title="LA GUERRA DEL CONSUMO MASIVO — Canales"
            dossier={'La Junta Directiva está histérica. Lanzamos una nueva bebida económica para competir con Postobón, pero Finanzas exige que el producto esté en el 100% de las 500,000 tiendas de barrio (TAT) del país en 48 horas. Tu presupuesto para camiones propios es CERO.\n\nConfigura el enrutador de canales encendiendo (ON) SOLO a los eslabones logísticos indispensables para lograr esta hazaña. Un interruptor de más o de menos y la operación colapsa.'}
            validateGame={() => crisis2Ref.current?.validate() ?? false}
            getGameStateDescription={() => crisis2Ref.current?.getStateDescription() ?? ''}
            successVoice="¡Canal configurado correctamente! Megamayorista fraccionando carga y Minoristas TAT vendiendo al detal. 500,000 tiendas cubiertas en 48 horas."
            errorExplanation="❌ ¡EL PRODUCTO NO LLEGÓ A LA GENTE Y PERDIMOS MILLONES! El consumo masivo y económico exige un CANAL LARGO. A mayor cobertura geográfica, necesitas ceder margen a un MAYORISTA que compre en tractomulas y fraccione la carga, entregándosela al MINORISTA (la tienda), quien vende por unidades al detal en cada cuadra. ¡Intentar vender masivo por web o camiones propios es un suicidio logístico! El Agente Aduanero es para comercio internacional, no aplica aquí."
            onSuccess={() => setPhase('c5_r3')}
            onError={(voice, detail) => triggerPenalty(voice, 'c5_r3', detail || 'Crisis 2 (Masivo): Encendió mal los interruptores o falló texto de Cobertura/Mayorista')}
          >
            <Crisis2Console ref={crisis2Ref} />
          </CrisisWrapper>
        )}

        {phase === 'c5_r3' && (
          <CrisisWrapper
            crisisNumber={3}
            icon="🚨"
            title="REESTRUCTURACIÓN HARD DISCOUNT — Formatos"
            dossier={'Acabamos de comprar un supermercado tradicional en quiebra y tu misión es convertirlo en un formato Hard Discount (estilo Tiendas D1 o Ara). El equipo de marketing quiere poner pisos de mármol y traer 20,000 marcas diferentes.\n\nPara lograr rentabilidad y destrozar a la competencia con precios bajos, debes calibrar los parámetros financieros a sus niveles óptimos. Un mal calibre y serás despedido por la Junta Directiva.'}
            validateGame={() => crisis3Ref.current?.validate() ?? false}
            getGameStateDescription={() => crisis3Ref.current?.getStateDescription() ?? ''}
            successVoice="¡Calibración perfecta! Góndolas al 0% y SKUs mínimos. El Hard Discount es austeridad pura: el rey es el PRECIO. Producto exhibido desde la caja corrugada."
            errorExplanation="❌ ¡QUIEBRA FINANCIERA INMINENTE! No entendiste el ADN del Hard Discount. Su éxito radica en la eficiencia extrema y austeridad: INVERSIÓN EN GÓNDOLAS DEBE SER 0% (se exhibe y vende desde la misma caja de cartón rasgada, sin lujos) y los SKUs deben ser súper limitados (menos de 1,000 — menos variedad significa reabastecimiento más rápido y simple). ¡El rey absoluto aquí es el PRECIO! Si inviertes en lujo o variedad, pierdes la guerra de costos contra D1 y Ara."
            onSuccess={() => setPhase('c5_r4')}
            onError={(voice, detail) => triggerPenalty(voice, 'c5_r4', detail || 'Crisis 3 (Hard Discount): Le puso lujos a las góndolas o falló texto de Austeridad/Alta Rotación')}
          >
            <Crisis3Console ref={crisis3Ref} />
          </CrisisWrapper>
        )}

        {phase === 'c5_r4' && (
          <CrisisWrapper
            crisisNumber={4}
            icon="🚨"
            title="LA HEMORRAGIA URBANA — Última Milla"
            dossier={'Auditoría urgente al departamento de E-commerce. Las ventas por página web están rompiendo récords, pero los márgenes de ganancia desaparecieron. El contador sospecha de la logística urbana.\n\nMueve el escáner de precisión para identificar QUÉ PORCENTAJE EXACTO del costo total logístico se está evaporando únicamente en el tramo final de entrega domiciliaria. Un porcentaje mal calibrado y seguirás perdiendo millones.'}
            validateGame={() => crisis4Ref.current?.validate() ?? false}
            getGameStateDescription={() => crisis4Ref.current?.getStateDescription() ?? ''}
            successVoice="¡Diagnóstico perfecto! 53% del costo logístico total se consume en la Última Milla. Has identificado el hoyo negro financiero."
            errorExplanation="❌ ¡DESCUADRE CONTABLE IMPERDONABLE! Sigues perdiendo plata a chorros. Según la teoría logística y las métricas globales, la Última Milla (Last Mile) representa hasta el 53% del costo total de envío. El tráfico, las calles estrechas, direcciones incorrectas y la ausencia del cliente hacen que cada re-entrega duplique el costo logístico de ese paquete. ¡Es el tramo más corto pero el hoyo negro financiero más letal! Calibra el escáner exactamente en 53%."
            onSuccess={() => setPhase('c5_r5')}
            onError={(voice, detail) => triggerPenalty(voice, 'c5_r5', detail || 'Crisis 4 (Última Milla): No calibró el 53% exacto o falló texto sobre Tráfico/Reentregas')}
          >
            <Crisis4Console ref={crisis4Ref} />
          </CrisisWrapper>
        )}

        {phase === 'c5_r5' && (
          <CrisisWrapper
            crisisNumber={5}
            icon="🚨"
            title="HACKEO DEL INVENTARIO — Tecnología"
            dossier={'¡Viernes de Black Friday! Tenemos 10,000 pallets represados en los muelles de salida. El sistema láser de código de barras colapsó y leer visualmente caja por caja nos tomará un mes.\n\nExiste una tecnología militar adaptada al CEDI que lee cientos de cajas automáticamente por ondas electromagnéticas, sin línea de visión, al pasar por un arco. Digita su sigla de 4 letras para encender las antenas y salvar la operación.'}
            validateGame={() => crisis5Ref.current?.validate() ?? false}
            getGameStateDescription={() => crisis5Ref.current?.getStateDescription() ?? ''}
            successVoice="¡RFID activado! Las antenas están leyendo pallets enteros en milisegundos. Trazabilidad total en tiempo real. ¡ERES UN GERENTE LOGÍSTICO NIVEL DIOS!"
            errorExplanation="❌ ¡EL CEDI ESTÁ PARALIZADO POR USAR TECNOLOGÍA OBSOLETA! El código de barras es bueno, pero exige 'línea de vista' (un operario apuntando manualmente). La respuesta que salva la operación es RFID (Identificación por Radiofrecuencia). Permite lectura automática de pallets enteros en milisegundos, sin necesidad de línea de visión directa, brindando trazabilidad en tiempo real a la velocidad de la luz. ¡Actualiza tu mente!"
            onSuccess={() => setPhase('c5_r6')}
            onError={(voice, detail) => triggerPenalty(voice, 'c5_r6', detail || 'Crisis 5 (Tecnología): Escribió mal RFID o no justificó las ondas/trazabilidad vs vista manual')}
          >
            <Crisis5Console ref={crisis5Ref} />
          </CrisisWrapper>
        )}

        {phase === 'c5_r6' && (
          <CrisisWrapper
            crisisNumber={6}
            icon="🚨"
            title="EL ACERTIJO DE LOS GEMELOS OPERATIVOS — Picking vs Packing"
            dossier={'¡Alto ahí, Gerente! Para abrir los portones del CEDI, despachar los camiones y graduarte, el auditor jefe te exige resolver el último gran acertijo para demostrar que dominas el idioma de la bodega.'}
            validateGame={() => crisis6Ref.current?.validate() ?? false}
            getGameStateDescription={() => crisis6Ref.current?.getStateDescription() ?? ''}
            successVoice="¡PERFECTO! Picking RECOLECTA, Packing EMPACA. Dominas el idioma del CEDI. ¡Los portones están abiertos, los camiones salen!"
            errorExplanation="❌ ¡CONFUSIÓN GERENCIAL FATAL! \n\nPICKING (del inglés Pick = Recoger/Picar) es el operario que viaja por la bodega recolectando artículos.\n\nPACKING (del inglés Pack = Empacar) es la estación fija donde se arma la caja con burbujas y cinta.\n\n¡Cruzar estos términos es un sacrilegio logístico que te costará millones en devoluciones!"
            onSuccess={() => setPhase('victory')}
            onError={(voice, detail) => triggerPenalty(voice, 'victory', detail || 'Crisis 6 (Acertijo final): Confundió el rol de Picking (caminar) con Packing (empacar fijo)')}
          >
            <Crisis6Console ref={crisis6Ref} />
          </CrisisWrapper>
        )}
      </main>
    </div>
  );
}
