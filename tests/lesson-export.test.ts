import { describe, it, expect } from 'vitest';
import { formatBiText, lessonFileName, lessonPlanChatPrompt, lessonPlanToMarkdown } from '@/lib/lesson-export';
import { samplePlan } from './fixtures/lesson-plan';

describe('formatBiText', () => {
  const bi = { vi: 'Chào cả lớp', en: 'Hello, class' };
  it('theo chế độ: A tiếng Việt, B song song, C tiếng Anh trước', () => {
    expect(formatBiText(bi, 'A')).toBe('Chào cả lớp');
    expect(formatBiText(bi, 'B')).toBe('Chào cả lớp / Hello, class');
    expect(formatBiText(bi, 'C')).toBe('Hello, class (Chào cả lớp)');
  });
  it('thiếu một ngôn ngữ thì dùng phần còn lại', () => {
    expect(formatBiText({ vi: '', en: 'Hi' }, 'A')).toBe('Hi');
    expect(formatBiText({ vi: 'Xin chào', en: '' }, 'C')).toBe('Xin chào');
  });
});

describe('lessonPlanToMarkdown', () => {
  it('có đủ các phần theo khung CV 2345 và Teacher Talk kèm IPA', () => {
    const md = lessonPlanToMarkdown(samplePlan, 'B');
    expect(md).toContain('# Phép cộng các số trong phạm vi 10 000');
    expect(md).toContain('I. Yêu cầu cần đạt');
    expect(md).toContain('II. Đồ dùng dạy học');
    expect(md).toContain('III. Các hoạt động dạy học');
    expect(md).toContain('Good morning, class!');
    expect(md).toContain('/ɡʊd ˈmɔːrnɪŋ, klæs/');
    expect(md).toContain('| plus |');
  });

  it('chế độ A không lặp bản dịch tiếng Anh của hoạt động GV', () => {
    const md = lessonPlanToMarkdown(samplePlan, 'A');
    expect(md).not.toContain('T runs the game');
    expect(md).toContain('Good morning, class!');
  });
});

describe('lessonPlanChatPrompt', () => {
  it('tóm tắt gọn trong giới hạn ký tự để gửi cho Trợ lý AI', () => {
    const prompt = lessonPlanChatPrompt(samplePlan, 600);
    expect(prompt.length).toBeLessThanOrEqual(600);
    expect(prompt).toContain('Phép cộng');
  });
});

describe('lessonFileName', () => {
  it('bỏ dấu tiếng Việt, ký tự đặc biệt, có đuôi .docx', () => {
    expect(lessonFileName(samplePlan)).toBe('giao-an-song-ngu-phep-cong-cac-so-trong-pham-vi-10-000.docx');
    expect(lessonFileName({ ...samplePlan, title: { vi: 'Đọc: Mẹ vắng nhà ngày bão!', en: '' } })).toBe(
      'giao-an-song-ngu-doc-me-vang-nha-ngay-bao.docx',
    );
  });
});
