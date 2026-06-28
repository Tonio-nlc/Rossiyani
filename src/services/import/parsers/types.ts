import type { CefrLevel } from "@/types/domain";

export type ImportSourceType = "txt" | "md" | "pdf" | "paste";

export type ImportDocumentMetadata = {
  summary: string;
  focusPoints: string[];
  category: string | null;
  estimatedReadingMinutes: number;
  detectedLevel: CefrLevel | null;
  estimatedSentences: number;
};

export type NormalizedImportDocument = {
  rawText: string;
  title: string;
  source: string;
  textId?: string;
  collectionId?: string;
  level?: CefrLevel;
  metadata: ImportDocumentMetadata;
  extractionMethod?: "direct" | "ocr";
  sourceType: ImportSourceType;
};

export type NormalizeImportOptions = {
  sourceType: ImportSourceType;
  fileName?: string;
  /** Page texts before merge — used for header/footer detection. */
  pdfPages?: string[];
};

export type ParseImportSourceOptions = {
  fileName: string;
  level: CefrLevel;
  onProgress?: (phase: ImportParsePhase) => void;
};

export type ImportParsePhase = "uploading" | "extracting" | "generating" | "done";
