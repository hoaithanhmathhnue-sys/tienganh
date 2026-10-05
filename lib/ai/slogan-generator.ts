import { ThinkingLevel, Type, type GenerateContentConfig } from '@google/genai';
import { isSlogan, sloganId, type Slogan } from '@/lib/slogans';
import { AiError, getFriendlyErrorMessage } from './errors';
import { generateContentWithFallback, type FallbackInfo } from './generate';
import { supportsThinkingLevel, type AiProvider } from './models';

export type SloganLength = 'short' | 'medium';
export type SloganGrade = 'all' | '1' | '2' | '3' | '4' | '5';

export interface SloganRequest {
  topic: string;
  count: number;
  length: SloganLength;
  grade: SloganGrade;
}

export const MAX_SLOGANS = 12;
export const MAX_TOPIC_LENGTH = 120;

const SYSTEM_INSTRUCTION = `You are a creative assistant for Vietnamese primary-school English teachers.
You write English slogans used to decorate classrooms (posters, bulletin boards, banners).
Rules:
- Use simple, positive, child-friendly vocabulary (CEFR Pre-A1 to A2).
- Each slogan is catchy, in Title Case, without ending punctuation unless it is a question or exclamation.
- Provide the IPA transcription in General American, wrapped in slashes, e.g. /ˈhæpi ˈklæsruːm/.
- Provide a natural, concise Vietnamese translation suitable for young learners.
- Never include offensive, political, religious or unsafe content.
- Do not repeat well-known slogans verbatim more than once; make them varied.`;

export const SLOGAN_RESPONSE_SCHEMA = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      en: { type: Type.STRING, description: 'English slogan in Title Case' },
      ipa: { type: Type.STRING, description: 'IPA (General American) wrapped in slashes' },
      vi: { type: Type.STRING, description: 'Vietnamese translation' },
    },
    required: ['en', 'ipa', 'vi'],
    propertyOrdering: ['en', 'ipa', 'vi'],
  },
};

export const buildSloganPrompt = (req: SloganRequest): string => {
  const count = Math.min(Math.max(Math.round(req.count) || 1, 1), MAX_SLOGANS);
  const length = req.length === 'short' ? '2 to 5 words' : '5 to 9 words';
  const level = req.grade === 'all' ? 'primary school students (grades 1-5)' : `grade ${req.grade} students (Vietnamese primary school)`;
  return [
    `Topic (may be written in Vietnamese): "${req.topic.trim().slice(0, MAX_TOPIC_LENGTH)}"`,
    `Write exactly ${count} different English classroom-decoration slogans about this topic.`,
    `Audience: ${level}.`,
    `Length of each slogan: ${length}.`,
    'Return a JSON array of objects with fields "en", "ipa", "vi".',
  ].join('\n');
};

/** Cấu hình request: JSON + schema; không gửi temperature/topP/topK; thinkingLevel chỉ cho Gemini 3.x. */
export const buildSloganConfig = (model: string): GenerateContentConfig => ({
  systemInstruction: SYSTEM_INSTRUCTION,
  responseMimeType: 'application/json',
  responseSchema: SLOGAN_RESPONSE_SCHEMA,
  maxOutputTokens: 8192,
  ...(supportsThinkingLevel(model) ? { thinkingConfig: { thinkingLevel: ThinkingLevel.LOW } } : {}),
});

const invalid = () => new AiError('INVALID_RESPONSE', getFriendlyErrorMessage('INVALID_RESPONSE', 'gemini'));

/** Kiểm định JSON từ AI: bỏ câu thiếu trường, chuẩn hoá IPA, loại trùng (kể cả với danh sách đã có). */
export const parseSloganResponse = (text: string, existing: Slogan[] = []): Slogan[] => {
  const cleaned = (text ?? '').trim().replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '').trim();
  let data: unknown;
  try {
    data = JSON.parse(cleaned);
  } catch {
    throw invalid();
  }

  const items: unknown[] = Array.isArray(data)
    ? data
    : Array.isArray((data as { slogans?: unknown })?.slogans)
      ? (data as { slogans: unknown[] }).slogans
      : [];

  const seen = new Set(existing.map(sloganId));
  const result: Slogan[] = [];

  for (const item of items) {
    if (!item || typeof item !== 'object') continue;
    const raw = item as Record<string, unknown>;
    const candidate = {
      en: typeof raw.en === 'string' ? raw.en.trim() : '',
      ipa: typeof raw.ipa === 'string' ? raw.ipa.trim() : '',
      vi: typeof raw.vi === 'string' ? raw.vi.trim() : '',
    };
    if (!candidate.en || !candidate.ipa || !candidate.vi) continue;
    candidate.ipa = `/${candidate.ipa.replace(/^\/+|\/+$/g, '').trim()}/`;
    if (!isSlogan(candidate)) continue;
    const id = sloganId(candidate);
    if (seen.has(id)) continue;
    seen.add(id);
    result.push(candidate);
    if (result.length >= MAX_SLOGANS) break;
  }

  if (result.length === 0) throw invalid();
  return result;
};

export interface GenerateSlogansOptions {
  provider: AiProvider;
  apiKey: string;
  selectedModel?: string;
  existing?: Slogan[];
  onFallback?: (info: FallbackInfo) => void;
}

export async function generateSlogans(req: SloganRequest, options: GenerateSlogansOptions): Promise<{ slogans: Slogan[]; model: string }> {
  const { response, model } = await generateContentWithFallback({
    provider: options.provider,
    apiKey: options.apiKey,
    selectedModel: options.selectedModel,
    contents: buildSloganPrompt(req),
    buildConfig: buildSloganConfig,
    onFallback: options.onFallback,
  });
  return { slogans: parseSloganResponse(response.text ?? '', options.existing), model };
}
