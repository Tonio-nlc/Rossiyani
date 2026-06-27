export type TtsSynthesisInput = {
  text: string;
  voiceId: string;
};

export type TtsSynthesisResult = {
  audio: Buffer;
  mimeType: string;
};

export type TtsProvider = {
  id: "azure" | "elevenlabs";
  isConfigured: () => boolean;
  synthesize: (input: TtsSynthesisInput) => Promise<TtsSynthesisResult>;
};
