export function speakWithBrowser(text: string, lang: string, rate: number): Promise<void> {
  if (typeof window === "undefined" || !window.speechSynthesis) {
    return Promise.reject(new Error("Synthèse vocale indisponible."));
  }

  return new Promise((resolve, reject) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = rate;
    utterance.onend = () => resolve();
    utterance.onerror = () => reject(new Error("Échec de la synthèse vocale."));
    window.speechSynthesis.speak(utterance);
  });
}

export function stopBrowserSpeech(): void {
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}
