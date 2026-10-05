import { describe, it, expect } from 'vitest';
import { detectSpeechLang, markdownToPlainText, textForSpeech } from '@/lib/text';

describe('markdownToPlainText', () => {
  it('bỏ ký hiệu Markdown nhưng giữ nội dung và xuống dòng', () => {
    const md = '## Tiêu đề\n\n**Đậm** và *nghiêng*\n- mục 1\n- mục 2\n\n[Link](https://x.y)\n`code`';
    expect(markdownToPlainText(md)).toBe('Tiêu đề\n\nĐậm và nghiêng\n• mục 1\n• mục 2\n\nLink\ncode');
  });

  it('bảng Markdown → các ô cách nhau bằng tab, bỏ dòng phân cách', () => {
    expect(markdownToPlainText('| A | B |\n|---|---|\n| 1 | 2 |')).toBe('A\tB\n1\t2');
  });
});

describe('textForSpeech', () => {
  it('bỏ phiên âm IPA, emoji và ký hiệu Markdown', () => {
    expect(textForSpeech('🌟 **Good job!** /ɡʊd dʒɑːb/ — Làm tốt lắm')).toBe('Good job! — Làm tốt lắm');
  });

  it('bỏ khối code', () => {
    expect(textForSpeech('Xem:\n```js\nconst a = 1;\n```\nHết')).toBe('Xem: Hết');
  });
});

describe('detectSpeechLang', () => {
  it('có dấu tiếng Việt → vi-VN, ngược lại en-US', () => {
    expect(detectSpeechLang('Xin chào các em')).toBe('vi-VN');
    expect(detectSpeechLang('Good morning, class')).toBe('en-US');
  });
});
