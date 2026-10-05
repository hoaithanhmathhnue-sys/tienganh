/** Chấm luyện nói: so khớp từ giữa câu mẫu và kết quả nhận diện giọng nói (thuật toán LCS theo từ). */

const WORD_PATTERN = /[\p{L}\p{N}'’]+/gu;

const tokens = (text: string): string[] => (text ?? '').match(WORD_PATTERN) ?? [];

const normalizeToken = (token: string): string => token.toLowerCase().replace(/’/g, "'").replace(/^'+|'+$/g, '');

export const normalizeWords = (text: string): string[] => tokens(text).map(normalizeToken).filter(Boolean);

export interface WordResult {
  word: string;
  matched: boolean;
}

export interface PronunciationResult {
  score: number;
  words: WordResult[];
  transcript: string;
}

export function scorePronunciation(target: string, spoken: string): PronunciationResult {
  const display = tokens(target).filter((t) => normalizeToken(t));
  const expected = display.map(normalizeToken);
  const heard = normalizeWords(spoken);
  const n = expected.length;
  const m = heard.length;

  if (n === 0) return { score: 0, words: [], transcript: spoken };

  // Bảng LCS (n+1) x (m+1)
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array<number>(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i][j] = expected[i] === heard[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }

  const matched = new Array<boolean>(n).fill(false);
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (expected[i] === heard[j]) {
      matched[i] = true;
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      i++;
    } else {
      j++;
    }
  }

  const count = matched.filter(Boolean).length;
  return {
    score: Math.round((count / n) * 100),
    words: display.map((word, idx) => ({ word, matched: matched[idx] })),
    transcript: spoken,
  };
}

/** Trình duyệt trả về nhiều phương án nhận diện — chọn phương án khớp nhất. */
export function scoreBestAlternative(target: string, alternatives: string[]): PronunciationResult {
  const candidates = alternatives.length ? alternatives : [''];
  return candidates
    .map((alt) => scorePronunciation(target, alt))
    .reduce((best, current) => (current.score > best.score ? current : best));
}

export type FeedbackLevel = 'excellent' | 'good' | 'fair' | 'retry';

export interface PronunciationFeedback {
  level: FeedbackLevel;
  emoji: string;
  title: string;
  message: string;
}

export function getPronunciationFeedback(score: number): PronunciationFeedback {
  if (score >= 90) {
    return { level: 'excellent', emoji: '🏆', title: 'Xuất sắc!', message: 'Phát âm rõ ràng, đọc đủ các từ. Tiếp tục phát huy nhé!' };
  }
  if (score >= 70) {
    return { level: 'good', emoji: '🌟', title: 'Tốt lắm!', message: 'Gần như hoàn hảo. Hãy chú ý các từ màu đỏ rồi đọc lại một lần nữa.' };
  }
  if (score >= 50) {
    return { level: 'fair', emoji: '💪', title: 'Khá rồi!', message: 'Nghe mẫu thêm một lần, đọc chậm và rõ từng từ nhé.' };
  }
  return { level: 'retry', emoji: '🎧', title: 'Thử lại nhé!', message: 'Bấm "Nghe mẫu", sau đó nói to, rõ ràng và đứng gần micro hơn.' };
}
