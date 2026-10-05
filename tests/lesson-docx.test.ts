import { describe, it, expect } from 'vitest';
import mammoth from 'mammoth';
import { lessonPlanToDocxBuffer } from '@/lib/lesson-docx';
import { readLessonFile } from '@/lib/lesson-file';
import { samplePlan } from './fixtures/lesson-plan';

const toArrayBuffer = (buf: Uint8Array): ArrayBuffer => buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer;

describe('lessonPlanToDocxBuffer', () => {
  it('tạo file Word hợp lệ chứa tiêu đề, hoạt động, Teacher Talk và từ vựng', async () => {
    const buffer = await lessonPlanToDocxBuffer(samplePlan, 'B');
    expect(buffer.byteLength).toBeGreaterThan(1000);
    const { value } = await mammoth.extractRawText({ buffer: Buffer.from(buffer) });
    expect(value).toContain('Phép cộng các số trong phạm vi 10 000');
    expect(value).toContain('Addition within 10,000');
    expect(value).toContain('KẾ HOẠCH BÀI DẠY');
    expect(value).toContain('Khởi động');
    expect(value).toContain('Good morning, class!');
    expect(value).toContain('/ɡʊd ˈmɔːrnɪŋ, klæs/');
    expect(value).toContain('plus');
  }, 20000);

  it('file Word xuất ra có thể nhập lại vào Trợ lý (vòng tròn docx → văn bản)', async () => {
    const buffer = await lessonPlanToDocxBuffer(samplePlan, 'A');
    const text = await readLessonFile({
      name: 'giao-an.docx',
      size: buffer.byteLength,
      text: async () => '',
      arrayBuffer: async () => toArrayBuffer(buffer),
    });
    expect(text).toContain('Phép cộng các số trong phạm vi 10 000');
    expect(text).toContain('|');
  }, 20000);
});
