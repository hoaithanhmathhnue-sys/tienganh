import {
  AlignmentType,
  BorderStyle,
  Document,
  Packer,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
  type ParagraphChild,
} from 'docx';
import type { BiText, BilingualLessonPlan, TeacherTalk } from '@/lib/ai/lesson-plan';
import { formatBiText } from '@/lib/lesson-export';
import type { OutputMode } from '@/lib/lesson-options';

const FONT = 'Times New Roman';
const SIZE = 26; // 13pt (đơn vị nửa point)
const HEADER_FILL = 'DCE6F2';
const BORDER = { style: BorderStyle.SINGLE, size: 4, color: '808080' };
const BORDERS = { top: BORDER, bottom: BORDER, left: BORDER, right: BORDER };

const run = (text: string, opts: { bold?: boolean; italics?: boolean; color?: string; size?: number } = {}) =>
  new TextRun({ text, font: FONT, size: opts.size ?? SIZE, bold: opts.bold, italics: opts.italics, color: opts.color });

const para = (
  children: ParagraphChild[] | string,
  opts: { align?: (typeof AlignmentType)[keyof typeof AlignmentType]; after?: number; before?: number; indent?: number } = {},
) =>
  new Paragraph({
    children: typeof children === 'string' ? [run(children)] : children,
    alignment: opts.align,
    spacing: { after: opts.after ?? 80, before: opts.before ?? 0 },
    indent: opts.indent ? { left: opts.indent } : undefined,
  });

const heading = (text: string) => para([run(text, { bold: true })], { before: 200, after: 100 });

const subHeading = (text: string) => para([run(text, { bold: true, italics: true })], { before: 80 });

const bulletList = (items: BiText[], mode: OutputMode) =>
  items.map((item) => formatBiText(item, mode)).filter(Boolean).map((text) => para(`- ${text}`, { indent: 360 }));

const cell = (children: Paragraph[], opts: { width?: number; fill?: string; columnSpan?: number } = {}) =>
  new TableCell({
    children: children.length ? children : [para('')],
    borders: BORDERS,
    columnSpan: opts.columnSpan,
    width: opts.width ? { size: opts.width, type: WidthType.PERCENTAGE } : undefined,
    shading: opts.fill ? { type: ShadingType.CLEAR, color: 'auto', fill: opts.fill } : undefined,
    margins: { top: 60, bottom: 60, left: 100, right: 100 },
  });

const headerCell = (text: string, width: number) =>
  cell([para([run(text, { bold: true })], { align: AlignmentType.CENTER, after: 0 })], { width, fill: HEADER_FILL });

const talkParagraphs = (talks: TeacherTalk[]): Paragraph[] =>
  talks.flatMap((talk) => {
    const lines = [para([run(`“${talk.en}”`, { bold: true, color: '1F3864' })], { after: 0 })];
    if (talk.ipa) lines.push(para([run(talk.ipa, { italics: true, color: '595959' })], { after: 0 }));
    const meaning = [talk.vi, talk.purpose ? `(${talk.purpose})` : ''].filter(Boolean).join(' ');
    if (meaning) lines.push(para(meaning, { after: 100 }));
    return lines;
  });

const activityTable = (plan: BilingualLessonPlan, mode: OutputMode) => {
  const rows: TableRow[] = [
    new TableRow({
      tableHeader: true,
      children: [headerCell('Hoạt động của giáo viên', 35), headerCell('Hoạt động của học sinh', 30), headerCell('Teacher Talk', 35)],
    }),
  ];
  plan.activities.forEach((activity, index) => {
    const title = `${index + 1}. ${formatBiText(activity.title, mode)}${activity.duration ? ` (${activity.duration})` : ''}`;
    const objective = formatBiText(activity.objective, mode);
    rows.push(
      new TableRow({
        children: [
          cell(
            [
              para([run(title, { bold: true })], { after: objective ? 0 : 40 }),
              ...(objective ? [para([run('Mục tiêu: ', { italics: true }), run(objective, { italics: true })], { after: 40 })] : []),
            ],
            { columnSpan: 3, fill: 'F2F2F2' },
          ),
        ],
      }),
    );
    const teacher = [para(formatBiText(activity.teacher, mode))];
    if (activity.note) teacher.push(para([run('Lưu ý: ', { bold: true, italics: true }), run(activity.note, { italics: true })]));
    rows.push(
      new TableRow({
        children: [
          cell(teacher, { width: 35 }),
          cell([para(formatBiText(activity.students, mode))], { width: 30 }),
          cell(talkParagraphs(activity.teacherTalk), { width: 35 }),
        ],
      }),
    );
  });
  return new Table({ rows, width: { size: 100, type: WidthType.PERCENTAGE } });
};

const vocabularyTable = (plan: BilingualLessonPlan) =>
  new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        tableHeader: true,
        children: [headerCell('Từ / cụm từ', 20), headerCell('Phiên âm', 20), headerCell('Nghĩa', 20), headerCell('Ví dụ', 40)],
      }),
      ...plan.vocabulary.map(
        (v) =>
          new TableRow({
            children: [
              cell([para([run(v.word, { bold: true })], { after: 0 })], { width: 20 }),
              cell([para([run(v.ipa, { italics: true })], { after: 0 })], { width: 20 }),
              cell([para(v.vi, { after: 0 })], { width: 20 }),
              cell([para(v.example, { after: 0 })], { width: 40 }),
            ],
          }),
      ),
    ],
  });

/** Dựng tài liệu Word theo khung Kế hoạch bài dạy (CV 2345). */
export const buildLessonDocument = (plan: BilingualLessonPlan, mode: OutputMode): Document => {
  const info = [plan.grade, plan.subject, plan.duration ? `Thời lượng: ${plan.duration}` : ''].filter(Boolean).join(' – ');
  const children: (Paragraph | Table)[] = [
    para([run('KẾ HOẠCH BÀI DẠY', { bold: true, size: 30 })], { align: AlignmentType.CENTER, after: 60 }),
    para([run(plan.title.vi || plan.title.en, { bold: true, size: 28 })], { align: AlignmentType.CENTER, after: 40 }),
  ];
  if (plan.title.vi && plan.title.en) {
    children.push(para([run(plan.title.en, { italics: true })], { align: AlignmentType.CENTER, after: 40 }));
  }
  if (info) children.push(para([run(info, { italics: true })], { align: AlignmentType.CENTER, after: 160 }));

  children.push(heading('I. YÊU CẦU CẦN ĐẠT'));
  const groups: [string, BiText[]][] = [
    ['1. Kiến thức, kĩ năng', plan.objectives],
    ['2. Năng lực', plan.competencies],
    ['3. Phẩm chất', plan.qualities],
  ];
  for (const [label, items] of groups) {
    if (!items.length) continue;
    children.push(subHeading(label), ...bulletList(items, mode));
  }

  children.push(heading('II. ĐỒ DÙNG DẠY HỌC'));
  if (plan.teacherMaterials.length) children.push(subHeading('1. Giáo viên'), ...bulletList(plan.teacherMaterials, mode));
  if (plan.studentMaterials.length) children.push(subHeading('2. Học sinh'), ...bulletList(plan.studentMaterials, mode));

  children.push(heading('III. CÁC HOẠT ĐỘNG DẠY HỌC CHỦ YẾU'), activityTable(plan, mode));

  if (plan.vocabulary.length) children.push(heading('IV. TỪ VỰNG CHUYÊN MÔN'), vocabularyTable(plan));
  if (plan.tips.length) {
    children.push(heading('V. LƯU Ý SƯ PHẠM'), ...plan.tips.map((tip) => para(`- ${tip}`, { indent: 360 })));
  }

  return new Document({
    creator: 'English Classroom Decoration',
    title: plan.title.vi || plan.title.en,
    styles: { default: { document: { run: { font: FONT, size: SIZE } } } },
    sections: [
      {
        // Lề chuẩn văn bản hành chính: trái 3cm, phải 2cm, trên/dưới 2cm (1cm ≈ 567 twip).
        properties: { page: { margin: { top: 1134, bottom: 1134, left: 1701, right: 1134 } } },
        children,
      },
    ],
  });
};

/** Dữ liệu nhị phân của file Word (dùng được cả trên Node lẫn trình duyệt). */
export const lessonPlanToDocxBuffer = async (plan: BilingualLessonPlan, mode: OutputMode): Promise<Uint8Array> =>
  new Uint8Array(await Packer.toArrayBuffer(buildLessonDocument(plan, mode)));

/** Blob để tải xuống trên trình duyệt. */
export const lessonPlanToDocxBlob = (plan: BilingualLessonPlan, mode: OutputMode): Promise<Blob> =>
  Packer.toBlob(buildLessonDocument(plan, mode));
