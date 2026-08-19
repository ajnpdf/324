import { getConversionToolManifest } from "@/lib/pdf-backend";

export type OcrLanguageOption = {
  value: string;
  label: string;
};

export const AUTO_OCR_LANGUAGE: OcrLanguageOption = {
  value: "auto",
  label: "Auto Detect (Recommended)",
};

export const CORE_OCR_LANGUAGE_OPTIONS: OcrLanguageOption[] = [
  { value: "eng", label: "English" },
  { value: "tel", label: "Telugu" },
  { value: "hin", label: "Hindi" },
  { value: "tam", label: "Tamil" },
  { value: "kan", label: "Kannada" },
  { value: "mal", label: "Malayalam" },
];

const SPECIAL_LABELS: Record<string, string> = {
  Latin: "Latin script", Cyrillic: "Cyrillic script", Greek: "Greek script",
  Arabic: "Arabic script", Hebrew: "Hebrew script", Devanagari: "Devanagari script",
  Bengali: "Bengali script", Gurmukhi: "Gurmukhi script", Gujarati: "Gujarati script",
  Oriya: "Odia script", Tamil: "Tamil script", Telugu: "Telugu script",
  Kannada: "Kannada script", Malayalam: "Malayalam script", Sinhala: "Sinhala script",
  Thai: "Thai script", Lao: "Lao script", Tibetan: "Tibetan script",
  Myanmar: "Myanmar script", Khmer: "Khmer script", Ethiopic: "Ethiopic script",
  Georgian: "Georgian script", Armenian: "Armenian script", Hangul: "Hangul script",
  Japanese: "Japanese script", HanS: "Simplified Han script", HanT: "Traditional Han script",
};

const HIDDEN_MODELS = new Set(["osd", "equ"]);

function displayLanguage(code: string): string {
  if (SPECIAL_LABELS[code]) return SPECIAL_LABELS[code];
  const core = CORE_OCR_LANGUAGE_OPTIONS.find((item) => item.value === code);
  if (core) return core.label;
  if (/^[a-z]{2,3}$/i.test(code)) {
    try {
      const DisplayNamesCtor = (Intl as typeof Intl & { DisplayNames?: new (locales: string[], options: { type: "language" }) => { of: (value: string) => string | undefined } }).DisplayNames;
      if (!DisplayNamesCtor) return code;
      const names = new DisplayNamesCtor(["en"], { type: "language" });
      const label = names.of(code.toLowerCase());
      if (label && label.toLowerCase() !== code.toLowerCase()) return `${label} (${code})`;
    } catch {}
  }
  return code;
}

export function normalizeOcrLanguageOptions(models: string[]): OcrLanguageOption[] {
  const installed = [...new Set(models.map((item)=>String(item||"").trim()).filter((item)=>item&&!HIDDEN_MODELS.has(item.toLowerCase())))];
  const source = installed.length ? installed : CORE_OCR_LANGUAGE_OPTIONS.map((item)=>item.value);
  const options = source.map((value)=>({value,label:displayLanguage(value)}));
  return [AUTO_OCR_LANGUAGE,...options.sort((a,b)=>a.label.localeCompare(b.label,"en",{sensitivity:"base"}))];
}

export async function fetchOcrLanguageOptions(toolId: string): Promise<OcrLanguageOption[]> {
  const manifest = await getConversionToolManifest();
  const tool = manifest.find((item) => item.id === toolId);
  const models = Array.isArray(tool?.ocrLanguages) ? tool.ocrLanguages : [];
  return normalizeOcrLanguageOptions(models);
}
