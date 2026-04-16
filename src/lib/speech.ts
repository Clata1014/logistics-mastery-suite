let initialized = false;

export function initSpeech() {
  if (initialized) return;
  const u = new SpeechSynthesisUtterance('');
  u.volume = 0;
  window.speechSynthesis.speak(u);
  initialized = true;
}

export function speak(text: string, volume = 1) {
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'es-ES';
  u.rate = 0.95;
  u.volume = volume;
  const voices = window.speechSynthesis.getVoices();
  const esVoice = voices.find(v => v.lang.startsWith('es'));
  if (esVoice) u.voice = esVoice;
  window.speechSynthesis.speak(u);
}
