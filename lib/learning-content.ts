import { getDailyIndex } from '@/lib/daily';
import { classroomCategories } from '@/lib/classroom-english';
import type { Slogan } from '@/lib/slogans';

export interface LearningPhrase extends Slogan {
  id: string;
  subjectId: string;
  subject: string;
  context: string;
}

export const LEARNING_SUBJECTS = [
  { id: 'math', label: 'Môn Toán', icon: '➕' },
  { id: 'vietnamese', label: 'Môn Tiếng Việt', icon: '📖' },
  { id: 'science', label: 'Môn Khoa học', icon: '🔬' },
  { id: 'art', label: 'Môn Nghệ thuật', icon: '🎨' },
  { id: 'pe', label: 'Giáo dục thể chất', icon: '⚽' },
  { id: 'english', label: 'Môn Tiếng Anh', icon: '💬' },
] as const;

export const SELF_STUDY_PHRASES: LearningPhrase[] = [
  { id: 'math-count', subjectId: 'math', subject: 'Môn Toán', context: 'Đếm và tính nhẩm', en: "Let's count together.", ipa: '/lɛts kaʊnt təˈɡɛðər/', vi: 'Cùng đếm nào.' },
  { id: 'math-answer', subjectId: 'math', subject: 'Môn Toán', context: 'Kiểm tra kết quả', en: 'What is the answer?', ipa: '/wʌt ɪz ði ˈænsər/', vi: 'Đáp án là gì?' },
  { id: 'math-explain', subjectId: 'math', subject: 'Môn Toán', context: 'Trình bày cách làm', en: 'Please explain your answer.', ipa: '/pliːz ɪkˈspleɪn jʊr ˈænsər/', vi: 'Em hãy giải thích đáp án.' },
  { id: 'vietnamese-read', subjectId: 'vietnamese', subject: 'Môn Tiếng Việt', context: 'Đọc thành tiếng', en: 'Read the passage aloud.', ipa: '/riːd ðə ˈpæsɪdʒ əˈlaʊd/', vi: 'Đọc to đoạn văn.' },
  { id: 'vietnamese-keyword', subjectId: 'vietnamese', subject: 'Môn Tiếng Việt', context: 'Tìm ý chính', en: 'Find the key words.', ipa: '/faɪnd ðə kiː wɜːrdz/', vi: 'Tìm các từ khóa.' },
  { id: 'vietnamese-share', subjectId: 'vietnamese', subject: 'Môn Tiếng Việt', context: 'Chia sẻ ý kiến', en: 'Share your idea with the class.', ipa: '/ʃer jʊr aɪˈdiːə wɪð ðə klæs/', vi: 'Chia sẻ ý kiến với cả lớp.' },
  { id: 'science-observe', subjectId: 'science', subject: 'Môn Khoa học', context: 'Quan sát thí nghiệm', en: 'Observe the experiment carefully.', ipa: '/əbˈzɜːrv ði ɪkˈspɛrəmənt ˈkɛrfəli/', vi: 'Quan sát thí nghiệm cẩn thận.' },
  { id: 'science-predict', subjectId: 'science', subject: 'Môn Khoa học', context: 'Dự đoán', en: 'What do you predict?', ipa: '/wʌt duː ju prɪˈdɪkt/', vi: 'Em dự đoán điều gì?' },
  { id: 'science-safe', subjectId: 'science', subject: 'Môn Khoa học', context: 'An toàn', en: 'Remember the safety rules.', ipa: '/rɪˈmɛmbər ðə ˈseɪfti ruːlz/', vi: 'Hãy nhớ các quy tắc an toàn.' },
  { id: 'art-colours', subjectId: 'art', subject: 'Môn Nghệ thuật', context: 'Chuẩn bị dụng cụ', en: 'Take out your colours.', ipa: '/teɪk aʊt jʊr ˈkʌlərz/', vi: 'Lấy màu vẽ ra.' },
  { id: 'art-create', subjectId: 'art', subject: 'Môn Nghệ thuật', context: 'Sáng tạo', en: 'Create your own picture.', ipa: '/kriˈeɪt jʊr oʊn ˈpɪktʃər/', vi: 'Tạo bức tranh của riêng em.' },
  { id: 'art-display', subjectId: 'art', subject: 'Môn Nghệ thuật', context: 'Chia sẻ sản phẩm', en: 'Show us your work.', ipa: '/ʃoʊ ʌs jʊr wɜːrk/', vi: 'Hãy cho cả lớp xem sản phẩm.' },
  { id: 'pe-line', subjectId: 'pe', subject: 'Giáo dục thể chất', context: 'Khởi động', en: 'Line up, please.', ipa: '/laɪn ʌp pliːz/', vi: 'Các em xếp hàng nào.' },
  { id: 'pe-move', subjectId: 'pe', subject: 'Giáo dục thể chất', context: 'Vận động', en: 'Move your body safely.', ipa: '/muːv jʊr ˈbɑːdi ˈseɪfli/', vi: 'Vận động an toàn.' },
  { id: 'pe-breathe', subjectId: 'pe', subject: 'Giáo dục thể chất', context: 'Thả lỏng', en: 'Take a deep breath.', ipa: '/teɪk ə diːp brɛθ/', vi: 'Hít thở sâu nào.' },
  { id: 'english-listen', subjectId: 'english', subject: 'Môn Tiếng Anh', context: 'Nghe và nhắc lại', en: 'Listen and repeat.', ipa: '/ˈlɪsən ænd rɪˈpiːt/', vi: 'Nghe và nhắc lại.' },
  { id: 'english-pair', subjectId: 'english', subject: 'Môn Tiếng Anh', context: 'Làm việc cặp đôi', en: 'Work with your partner.', ipa: '/wɜːrk wɪð jʊr ˈpɑːrtnər/', vi: 'Làm việc cùng bạn của em.' },
  { id: 'english-try', subjectId: 'english', subject: 'Môn Tiếng Anh', context: 'Khích lệ', en: 'Try your best!', ipa: '/traɪ jʊr bɛst/', vi: 'Hãy cố gắng hết sức!' },
];

export interface DailySchoolSet {
  id: string;
  title: string;
  icon: string;
  description: string;
  phrases: LearningPhrase[];
}

export const getDailySchoolSet = (date = new Date()): DailySchoolSet => {
  const category = classroomCategories[getDailyIndex(date, classroomCategories.length)];
  const start = getDailyIndex(date, category.slogans.length);
  const phrases = Array.from({ length: Math.min(3, category.slogans.length) }, (_, index) => {
    const slogan = category.slogans[(start + index) % category.slogans.length];
    return { ...slogan, id: 'daily-' + category.id + '-' + ((start + index) % category.slogans.length), subjectId: category.id, subject: category.name, context: category.description };
  });
  return { id: category.id, title: category.name, icon: category.icon, description: category.description, phrases };
};

export const DAILY_SCHOOL_TOPICS = classroomCategories.map((category) => ({
  id: category.id,
  name: category.name,
  icon: category.icon,
  description: category.description,
  count: category.slogans.length,
}));
