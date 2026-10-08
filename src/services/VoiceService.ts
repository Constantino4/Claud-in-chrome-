export class VoiceService {
  private recognition: any = null;
  private isListening: boolean = false;
  private onResultCallback: ((text: string) => void) | null = null;
  private onErrorCallback: ((error: string) => void) | null = null;
  private onEndCallback: (() => void) | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.lang = 'pt-BR';

        this.recognition.onresult = (event: any) => {
          let transcript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            transcript += event.results[i][0].transcript;
          }
          if (this.onResultCallback && transcript) {
            this.onResultCallback(transcript);
          }
        };

        this.recognition.onerror = (event: any) => {
          this.isListening = false;
          if (this.onErrorCallback) {
            this.onErrorCallback(event.error || 'Erro no reconhecimento de voz.');
          }
        };

        this.recognition.onend = () => {
          this.isListening = false;
          if (this.onEndCallback) {
            this.onEndCallback();
          }
        };
      }
    }
  }

  public isSupported(): boolean {
    return !!this.recognition;
  }

  public startListening(
    onResult: (text: string) => void,
    onError?: (error: string) => void,
    onEnd?: () => void
  ): boolean {
    if (!this.recognition) {
      if (onError) onError('Reconhecimento de fala não suportado neste navegador.');
      return false;
    }

    try {
      this.onResultCallback = onResult;
      this.onErrorCallback = onError || null;
      this.onEndCallback = onEnd || null;
      this.isListening = true;
      this.recognition.start();
      return true;
    } catch (e: any) {
      this.isListening = false;
      if (onError) onError(e.message || 'Falha ao iniciar microfone.');
      return false;
    }
  }

  public stopListening(): void {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {
        // ignore
      }
      this.isListening = false;
    }
  }

  public speak(text: string): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      // Remove marcações markdown antes de falar
      const cleanText = text.replace(/[*#_`]/g, '').slice(0, 300);
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'pt-BR';
      utterance.rate = 1.05;
      window.speechSynthesis.speak(utterance);
    }
  }

  public cancelSpeech(): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }
}

export const voiceService = new VoiceService();
