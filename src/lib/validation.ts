export function normalize(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ');
}

export function validateAnswer(input: string, validAnswers: string[]): boolean {
  const n = normalize(input);
  return validAnswers.some(a => normalize(a) === n);
}
