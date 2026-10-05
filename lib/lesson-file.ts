/** Đọc giáo án từ file .docx / .txt / .md ngay trên trình duyệt (không gửi file lên máy chủ). */

export const MAX_FILE_BYTES = 10 * 1024 * 1024;
export const ACCEPTED_LESSON_FILES = '.docx,.txt,.md,.markdown';

export type LessonFileErrorCode = 'too-large' | 'unsupported' | 'legacy-doc' | 'empty' | 'read-failed';

const MESSAGES: Record<LessonFileErrorCode, string> = {
  'too-large': 'File lớn hơn 10 MB. Thầy/Cô hãy bỏ bớt hình ảnh hoặc dán phần nội dung chữ vào ô bên dưới.',
  unsupported: 'Chỉ hỗ trợ file Word (.docx), văn bản (.txt) hoặc Markdown (.md).',
  'legacy-doc': 'File Word đời cũ (.doc) không đọc được trên trình duyệt. Thầy/Cô mở file bằng Word → Lưu thành (Save As) → chọn "Word Document (.docx)" rồi tải lên lại.',
  empty: 'File không có nội dung chữ. Hãy kiểm tra lại file giáo án.',
  'read-failed': 'Không đọc được file (có thể file bị hỏng hoặc đang được bảo vệ). Thầy/Cô thử lưu lại file hoặc dán nội dung vào ô bên dưới.',
};

export class LessonFileError extends Error {
  readonly code: LessonFileErrorCode;
  constructor(code: LessonFileErrorCode) {
    super(MESSAGES[code]);
    this.name = 'LessonFileError';
    this.code = code;
  }
}

/** Tối thiểu cần có của một File (để kiểm thử dễ dàng). */
export interface LessonFileLike {
  name: string;
  size: number;
  text(): Promise<string>;
  arrayBuffer(): Promise<ArrayBuffer>;
}

export interface ReadLessonDeps {
  docxToHtml: (file: LessonFileLike) => Promise<string>;
}

/** Chuyển .docx → HTML bằng mammoth; chỉ tải thư viện khi thật sự cần. */
const defaultDocxToHtml = async (file: LessonFileLike): Promise<string> => {
  const mod = await import('mammoth');
  const mammoth = (mod as unknown as { default?: typeof mod }).default ?? mod;
  const data = await file.arrayBuffer();
  // Trình duyệt dùng `arrayBuffer`, Node dùng `buffer` — truyền cả hai cho chắc chắn.
  const input = { arrayBuffer: data, buffer: data } as unknown as Parameters<typeof mammoth.convertToHtml>[0];
  const result = await mammoth.convertToHtml(input);
  return result.value;
};

const normalize = (text: string): string =>
  text
    .replace(/^\uFEFF/, '')
    .replace(/\r\n?/g, '\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

export async function readLessonFile(file: LessonFileLike, deps: ReadLessonDeps = { docxToHtml: defaultDocxToHtml }): Promise<string> {
  if (file.size > MAX_FILE_BYTES) throw new LessonFileError('too-large');
  const ext = file.name.toLowerCase().split('.').pop() ?? '';

  let text: string;
  if (ext === 'doc') throw new LessonFileError('legacy-doc');
  if (ext === 'txt' || ext === 'md' || ext === 'markdown') {
    try {
      text = await file.text();
    } catch {
      throw new LessonFileError('read-failed');
    }
  } else if (ext === 'docx') {
    try {
      text = htmlToLessonText(await deps.docxToHtml(file));
    } catch {
      throw new LessonFileError('read-failed');
    }
  } else {
    throw new LessonFileError('unsupported');
  }

  const result = normalize(text);
  if (!result) throw new LessonFileError('empty');
  return result;
}

/* ─────────────── HTML (từ mammoth) → văn bản có cấu trúc ─────────────── */

const ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };

const decodeEntities = (text: string): string =>
  text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, code: string) => {
    if (code[0] === '#') {
      const n = code[1].toLowerCase() === 'x' ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10);
      return Number.isFinite(n) ? String.fromCodePoint(n) : match;
    }
    return ENTITIES[code.toLowerCase()] ?? match;
  });

/**
 * Chuyển HTML đơn giản của mammoth thành văn bản kiểu Markdown: giữ tiêu đề, danh sách
 * và bảng (mỗi hàng thành "| ô | ô |") để AI hiểu đúng cấu trúc giáo án. Không cần DOM.
 */
export function htmlToLessonText(html: string): string {
  const lines: string[] = [];
  let line = '';
  let prefix = '';
  const lists: { ordered: boolean; index: number }[] = [];
  let tableDepth = 0;
  let rows: string[][] = [];
  let row: string[] | null = null;
  let cell: string | null = null;

  const flush = () => {
    const content = line.replace(/\s+/g, ' ').trim();
    if (content) lines.push(prefix + content);
    line = '';
    prefix = '';
  };

  const appendText = (text: string) => {
    if (cell !== null) cell += text;
    else line += text;
  };

  const tokens = html.match(/<\/?[a-zA-Z][a-zA-Z0-9]*[^>]*>|[^<]+/g) ?? [];
  for (const token of tokens) {
    const tag = token.match(/^<(\/?)([a-zA-Z][a-zA-Z0-9]*)/);
    if (!tag) {
      appendText(decodeEntities(token));
      continue;
    }
    const closing = tag[1] === '/';
    const name = tag[2].toLowerCase();

    if (name === 'table') {
      if (!closing) {
        if (tableDepth === 0) {
          flush();
          rows = [];
        }
        tableDepth++;
      } else if (tableDepth > 0) {
        tableDepth--;
        if (tableDepth === 0) {
          for (const r of rows) if (r.some(Boolean)) lines.push(`| ${r.join(' | ')} |`);
          lines.push('');
          rows = [];
          row = null;
          cell = null;
        }
      }
      continue;
    }

    if (tableDepth > 0) {
      if (name === 'tr') {
        if (!closing) row = [];
        else if (row) {
          rows.push(row);
          row = null;
        }
      } else if (name === 'td' || name === 'th') {
        if (!closing) cell = '';
        else if (cell !== null) {
          (row ??= []).push(cell.replace(/\s+/g, ' ').trim());
          cell = null;
        }
      } else if (name === 'p' || name === 'br' || name === 'li') {
        if (cell) cell += ' ';
      }
      continue;
    }

    if (/^h[1-6]$/.test(name)) {
      flush();
      if (!closing) prefix = `${'#'.repeat(Number(name[1]))} `;
    } else if (name === 'p' || name === 'div') {
      flush();
    } else if (name === 'br') {
      flush();
    } else if (name === 'ul' || name === 'ol') {
      flush();
      if (!closing) lists.push({ ordered: name === 'ol', index: 0 });
      else lists.pop();
    } else if (name === 'li') {
      flush();
      if (!closing) {
        const list = lists.at(-1);
        const indent = '  '.repeat(Math.max(lists.length - 1, 0));
        if (list?.ordered) prefix = `${indent}${++list.index}. `;
        else prefix = `${indent}- `;
      }
    }
  }
  flush();

  return lines
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
