/** Tiện ích xử lý văn bản trả lời của AI (Markdown) để sao chép và đọc thành tiếng. */

const VIETNAMESE_CHARS = /[ăâđêôơưàảãáạằẳẵắặầẩẫấậèẻẽéẹềểễếệìỉĩíịòỏõóọồổỗốộờởỡớợùủũúụừửữứựỳỷỹýỵ]/i;
const TABLE_SEPARATOR = /^\s*\|?\s*:?-{3,}:?\s*(?:\|\s*:?-{3,}:?\s*)*\|?\s*$\n?/gm;
const IPA_SEGMENT = /\/[^/\n]*[ˈˌːəɪʊæɑɒɔʌɛɜθðʃʒŋɡɹɾ][^/\n]*\//g;
const EMOJI = /[\p{Extended_Pictographic}\u{FE0F}\u{200D}\u{20E3}]/gu;

/** Markdown → văn bản thường (giữ xuống dòng, danh sách thành "•", bảng thành cột cách tab). */
export function markdownToPlainText(markdown: string): string {
  return (markdown ?? '')
    .replace(/\r\n/g, '\n')
    .replace(/```[^\n]*\n([\s\S]*?)```/g, '$1')
    .replace(TABLE_SEPARATOR, '')
    .replace(/^\s*\|(.*)\|\s*$/gm, (_, row: string) => row.split('|').map((c) => c.trim()).join('\t'))
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^>\s?/gm, '')
    .replace(/^\s*(?:-{3,}|\*{3,}|_{3,})\s*$/gm, '')
    .replace(/^(\s*)[-*+]\s+/gm, '$1• ')
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/__(.+?)__/g, '$1')
    .replace(/(^|[^\w*])\*(?!\s)(.+?)\*(?!\w)/g, '$1$2')
    .replace(/(^|[^\w])_(?!\s)(.+?)_(?!\w)/g, '$1$2')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/** Văn bản để đọc thành tiếng: bỏ khối code, phiên âm IPA, emoji, ký hiệu Markdown. */
export function textForSpeech(markdown: string): string {
  const withoutCode = (markdown ?? '').replace(/```[\s\S]*?```/g, ' ');
  return markdownToPlainText(withoutCode)
    .replace(IPA_SEGMENT, ' ')
    .replace(EMOJI, ' ')
    .replace(/[•\t]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Chọn giọng đọc của trình duyệt theo nội dung. */
export const detectSpeechLang = (text: string): 'vi-VN' | 'en-US' => (VIETNAMESE_CHARS.test(text) ? 'vi-VN' : 'en-US');
