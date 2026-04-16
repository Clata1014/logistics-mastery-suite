// Anti-cheat: detect repeated characters (e.g. "aaaaa")
const SPAM_REGEX = /(.)\1{4,}/;

export function detectSpam(text: string): boolean {
  return SPAM_REGEX.test(text);
}

export const SPAM_PENALTY = '❌ INTENTO DE FRAUDE DETECTADO: El sistema identificó texto de relleno o letras repetidas sin sentido. ¡Se te sumó un error disciplinario, redacta una justificación seria!';

interface KeywordRule {
  groups: string[][];           // each sub-array requires at least 1 match
  allKeywords: string[];        // flat list of all keywords for NLP analysis
  penaltyMessage: string;
  theory: string;
}

export const PRODUCT_KEYWORDS: Record<number, KeywordRule> = {
  0: { // Papel Higiénico
    groups: [
      ['volumen', 'aire', 'bulto', 'espacio'],
      ['flete', 'costo', 'transporte', 'fraccionar', 'mayorista', 'diluir'],
    ],
    allKeywords: ['volumen', 'aire', 'bulto', 'espacio', 'flete', 'costo', 'transporte', 'fraccionar', 'mayorista', 'diluir'],
    penaltyMessage: '❌ REPORTE GERENCIAL RECHAZADO: Tu justificación carece de rigor técnico. Olvidaste mencionar que el papel ocupa mucho VOLUMEN (transportas aire) lo que encarece el FLETE. Es obligatorio usar un MAYORISTA porque las tiendas pequeñas no tienen 50 millones para comprar una tractomula entera ni una megabodega para guardarla. El mayorista absorbe el costo y FRACCIONA la carga. ¡Se ha sumado un error a tu nota final, redacta usando lenguaje logístico!',
    theory: 'El papel higiénico es 90% aire. Su enorme VOLUMEN encarece el FLETE. Se necesita un MAYORISTA que compre tractomulas completas y FRACCIONE la carga en lotes pequeños para las tiendas, diluyendo el costo logístico por unidad.',
  },
  1: { // Celulares
    groups: [
      ['valor', 'robo', 'seguridad', 'riesgo', 'corto', 'exclusivo'],
    ],
    allKeywords: ['valor', 'robo', 'seguridad', 'riesgo', 'corto', 'exclusivo'],
    penaltyMessage: '❌ REPORTE RECHAZADO: Un gerente evalúa riesgos. El altísimo VALOR del producto exige canal corto para mitigar el RIESGO de ROBO en bodegas masivas. ¡Tu nota bajó, corrige el texto!',
    theory: 'Los celulares gama alta tienen altísimo VALOR concentrado en mínimo volumen, lo que genera alto RIESGO de ROBO. Se requiere canal CORTO y EXCLUSIVO (fábrica ➔ vitrina) para minimizar la exposición en bodegas masivas y proteger la SEGURIDAD del inventario.',
  },
};

export interface NLPAnalysis {
  found: string[];
  missing: string[];
  passed: boolean;
}

export function analyzeKeywords(text: string, productIndex: number): NLPAnalysis | null {
  const rule = PRODUCT_KEYWORDS[productIndex];
  if (!rule) return null;

  const lower = text.toLowerCase();
  const found = rule.allKeywords.filter(kw => lower.includes(kw));
  const missing = rule.allKeywords.filter(kw => !lower.includes(kw));

  // Check all groups have at least one match
  const passed = rule.groups.every(group => group.some(kw => lower.includes(kw)));

  return { found, missing, passed };
}

export function buildNLPErrorDetail(
  text: string,
  productIndex: number,
  productName: string,
): string | null {
  const lower = text.toLowerCase();

  // Anti-spam first
  if (detectSpam(lower)) return null; // spam handled separately

  const analysis = analyzeKeywords(text, productIndex);
  if (!analysis) return null;
  if (analysis.passed) return null;

  const rule = PRODUCT_KEYWORDS[productIndex]!;
  const truncatedText = text.length > 200 ? text.slice(0, 200) + '...' : text;

  return `❌ FASE 4: ${productName}\n✍️ LO QUE TÚ ESCRIBISTE: "${truncatedText}"\n📊 ANÁLISIS NLP: Encontramos ${analysis.found.length} de ${rule.allKeywords.length} coincidencias técnicas.${analysis.found.length > 0 ? ` Detectadas: [${analysis.found.join(', ')}]` : ''}\n🔍 CONCEPTOS OMITIDOS QUE TE FALTARON: [${analysis.missing.join(', ')}]\n✅ VEREDICTO TEÓRICO: ${rule.theory}`;
}

export function validateKeywords(text: string, productIndex: number): string | null {
  const lower = text.toLowerCase();

  // Anti-spam first
  if (detectSpam(lower)) return SPAM_PENALTY;

  const rule = PRODUCT_KEYWORDS[productIndex];
  if (!rule) return null; // no keyword rule for this product

  for (const group of rule.groups) {
    const found = group.some(kw => lower.includes(kw));
    if (!found) return rule.penaltyMessage;
  }

  return null; // passed
}
