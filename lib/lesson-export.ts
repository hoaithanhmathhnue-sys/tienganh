import type { BiText, BilingualLessonPlan } from '@/lib/ai/lesson-plan';
import type { OutputMode } from '@/lib/lesson-options';

/** Hiển thị một cặp Việt–Anh theo chế độ đầu ra; thiếu ngôn ngữ nào thì dùng ngôn ngữ còn lại. */
export const formatBiText = (bi: BiText, mode: OutputMode): string => {
  const vi = bi.vi.trim();
  const en = bi.en.trim();
  if (!vi || !en) return vi || en;
  if (mode === 'A') return vi;
  if (mode === 'C') return `${en} (${vi})`;
  return `${vi} / ${en}`;
};

const escapeCell = (text: string) => text.replace(/\|/g, '\\|').replace(/\n+/g, ' ');

const bullets = (items: BiText[], mode: OutputMode): string[] =>
  items.map((item) => formatBiText(item, mode)).filter(Boolean).map((t) => `- ${t}`);

/** Giáo án song ngữ dạng Markdown (dùng cho Sao chép và gửi Trợ lý AI). */
export const lessonPlanToMarkdown = (plan: BilingualLessonPlan, mode: OutputMode): string => {
  const lines: string[] = [`# ${plan.title.vi || plan.title.en}`];
  if (plan.title.en && plan.title.vi && mode !== 'A') lines.push(`*${plan.title.en}*`);
  const info = [plan.grade, plan.subject, plan.duration].filter(Boolean).join(' · ');
  if (info) lines.push('', info);

  lines.push('', '## I. Yêu cầu cần đạt');
  const groups: [string, BiText[]][] = [
    ['Kiến thức, kĩ năng', plan.objectives],
    ['Năng lực', plan.competencies],
    ['Phẩm chất', plan.qualities],
  ];
  for (const [label, items] of groups) {
    if (!items.length) continue;
    lines.push('', `**${label}**`, ...bullets(items, mode));
  }

  lines.push('', '## II. Đồ dùng dạy học');
  if (plan.teacherMaterials.length) lines.push('', '**Giáo viên**', ...bullets(plan.teacherMaterials, mode));
  if (plan.studentMaterials.length) lines.push('', '**Học sinh**', ...bullets(plan.studentMaterials, mode));

  lines.push('', '## III. Các hoạt động dạy học');
  plan.activities.forEach((activity, index) => {
    const duration = activity.duration ? ` (${activity.duration})` : '';
    lines.push('', `### ${index + 1}. ${formatBiText(activity.title, mode)}${duration}`);
    const objective = formatBiText(activity.objective, mode);
    if (objective) lines.push(`- **Mục tiêu:** ${objective}`);
    const teacher = formatBiText(activity.teacher, mode);
    if (teacher) lines.push(`- **Hoạt động của GV:** ${teacher}`);
    const students = formatBiText(activity.students, mode);
    if (students) lines.push(`- **Hoạt động của HS:** ${students}`);
    if (activity.teacherTalk.length) {
      lines.push('- **Teacher Talk:**');
      for (const talk of activity.teacherTalk) {
        const extra = [talk.ipa, talk.vi].filter(Boolean).join(' — ');
        const purpose = talk.purpose ? ` _(${talk.purpose})_` : '';
        lines.push(`  - "${talk.en}"${extra ? ` ${extra}` : ''}${purpose}`);
      }
    }
    if (activity.note) lines.push(`- **Lưu ý:** ${activity.note}`);
  });

  if (plan.vocabulary.length) {
    lines.push('', '## Từ vựng chuyên môn', '', '| Từ | Phiên âm | Nghĩa | Ví dụ |', '| --- | --- | --- | --- |');
    for (const v of plan.vocabulary) {
      lines.push(`| ${escapeCell(v.word)} | ${escapeCell(v.ipa)} | ${escapeCell(v.vi)} | ${escapeCell(v.example)} |`);
    }
  }

  if (plan.tips.length) lines.push('', '## Lưu ý sư phạm', ...plan.tips.map((t) => `- ${t}`));
  return lines.join('\n') + '\n';
};

/** Câu hỏi gửi Trợ lý AI kèm tóm tắt giáo án, luôn trong giới hạn ký tự của ô nhập. */
export const lessonPlanChatPrompt = (plan: BilingualLessonPlan, maxChars: number): string => {
  const intro = `Tôi vừa soạn giáo án song ngữ "${plan.title.vi || plan.title.en}" (${[plan.grade, plan.subject, plan.duration]
    .filter(Boolean)
    .join(', ')}). Hãy góp ý để Teacher Talk tự nhiên hơn và gợi ý thêm 3 câu khen ngợi học sinh phù hợp bài.`;
  const summary = plan.activities
    .map((a, i) => {
      const talks = a.teacherTalk.map((t) => `"${t.en}"`).join(', ');
      return `${i + 1}. ${a.title.vi || a.title.en}${a.duration ? ` (${a.duration})` : ''}${talks ? `: ${talks}` : ''}`;
    })
    .join('\n');
  const full = `${intro}\n\nTóm tắt hoạt động:\n${summary}`;
  if (full.length <= maxChars) return full;
  if (intro.length >= maxChars) return intro.slice(0, Math.max(0, maxChars - 1)) + '…';
  return full.slice(0, maxChars - 1) + '…';
};

/** Tên file Word an toàn: bỏ dấu, chữ thường, chỉ chữ số và gạch nối. */
export const lessonFileName = (plan: BilingualLessonPlan): string => {
  const slug = (plan.title.vi || plan.title.en || 'giao-an')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
    .replace(/-+$/g, '');
  return `giao-an-song-ngu-${slug || 'bai-day'}.docx`;
};
