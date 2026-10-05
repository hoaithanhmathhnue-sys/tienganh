// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { htmlToLessonText, LessonFileError, MAX_FILE_BYTES, readLessonFile, type LessonFileLike } from '@/lib/lesson-file';

const fakeFile = (name: string, content: string, size = content.length): LessonFileLike => ({
  name,
  size,
  text: async () => content,
  arrayBuffer: async () => new TextEncoder().encode(content).buffer as ArrayBuffer,
});

describe('readLessonFile', () => {
  it('đọc .txt và .md: bỏ BOM, chuẩn hoá xuống dòng', async () => {
    expect(await readLessonFile(fakeFile('giao-an.txt', '\uFEFFDòng 1\r\nDòng 2'))).toBe('Dòng 1\nDòng 2');
    expect(await readLessonFile(fakeFile('GIAO-AN.MD', '# Tiêu đề\n- ý 1'))).toBe('# Tiêu đề\n- ý 1');
  });

  it('.docx dùng bộ chuyển đổi Word (chỉ tải khi cần)', async () => {
    const convert = vi.fn(async () => '<h1>Bài 5</h1><p>Mục tiêu</p>');
    const text = await readLessonFile(fakeFile('bai5.docx', 'PK'), { docxToHtml: convert });
    expect(convert).toHaveBeenCalledOnce();
    expect(text).toContain('# Bài 5');
    expect(text).toContain('Mục tiêu');
  });

  it('báo lỗi rõ ràng: .doc cũ, định dạng lạ, file quá lớn, file rỗng', async () => {
    await expect(readLessonFile(fakeFile('cu.doc', 'x'))).rejects.toMatchObject({ code: 'legacy-doc' });
    await expect(readLessonFile(fakeFile('a.pdf', 'x'))).rejects.toMatchObject({ code: 'unsupported' });
    await expect(readLessonFile(fakeFile('to.txt', 'x', MAX_FILE_BYTES + 1))).rejects.toMatchObject({ code: 'too-large' });
    await expect(readLessonFile(fakeFile('rong.txt', '  \n '))).rejects.toMatchObject({ code: 'empty' });
    await expect(readLessonFile(fakeFile('cu.doc', 'x'))).rejects.toBeInstanceOf(LessonFileError);
  });

  it('lỗi khi chuyển đổi Word → read-failed', async () => {
    const convert = vi.fn(async () => {
      throw new Error('zip hỏng');
    });
    await expect(readLessonFile(fakeFile('hong.docx', 'x'), { docxToHtml: convert })).rejects.toMatchObject({ code: 'read-failed' });
  });
});

describe('htmlToLessonText', () => {
  it('giữ cấu trúc: tiêu đề, đoạn, danh sách, bảng thành cột cách " | "', () => {
    const html =
      '<h2>I. Yêu cầu cần đạt</h2><p>Học sinh <strong>cộng</strong> được</p>' +
      '<ul><li>Ý một</li><li>Ý hai</li></ul><ol><li>Bước 1</li></ol>' +
      '<table><tr><td>Hoạt động GV</td><td>Hoạt động HS</td></tr><tr><td><p>Hỏi</p></td><td>Trả lời</td></tr></table>';
    const text = htmlToLessonText(html);
    expect(text).toContain('## I. Yêu cầu cần đạt');
    expect(text).toContain('Học sinh cộng được');
    expect(text).toContain('- Ý một\n- Ý hai');
    expect(text).toContain('1. Bước 1');
    expect(text).toContain('| Hoạt động GV | Hoạt động HS |');
    expect(text).toContain('| Hỏi | Trả lời |');
    expect(text).not.toMatch(/<[a-z]/i);
  });
});
