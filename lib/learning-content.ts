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
  { id: 'greetings', label: 'Chào hỏi & khởi động', eyebrow: 'Greetings & opening', icon: '👋' },
  { id: 'classroom', label: 'Câu lệnh lớp học', eyebrow: 'Classroom instructions', icon: '📋' },
  { id: 'games', label: 'Hướng dẫn trò chơi', eyebrow: 'Game instructions', icon: '🎲' },
  { id: 'math', label: 'Môn Toán', eyebrow: 'Mathematics', icon: '➕' },
  { id: 'vietnamese', label: 'Môn Tiếng Việt', eyebrow: 'Vietnamese language', icon: '📖' },
  { id: 'art', label: 'Môn Mĩ thuật', eyebrow: 'Art', icon: '🎨' },
  { id: 'music', label: 'Môn Âm nhạc', eyebrow: 'Music', icon: '🎵' },
  { id: 'pe', label: 'Môn Giáo dục thể chất', eyebrow: 'Physical education', icon: '⚽' },
  { id: 'history-geography', label: 'Môn Lịch sử & Địa lí', eyebrow: 'History & geography', icon: '🗺️' },
  { id: 'science', label: 'Môn Tự nhiên & Xã hội', eyebrow: 'Science', icon: '🔬' },
] as const;

export const SELF_STUDY_PHRASES: LearningPhrase[] = [
  { id: 'greetings-morning', subjectId: 'greetings', subject: 'Chào hỏi & khởi động', context: 'Chào lớp', en: 'Good morning, class!', ipa: '/ɡʊd ˈmɔːrnɪŋ klæs/', vi: 'Chào buổi sáng cả lớp!' },
  { id: 'greetings-ready', subjectId: 'greetings', subject: 'Chào hỏi & khởi động', context: 'Sẵn sàng vào bài', en: 'Are you ready to learn?', ipa: '/ɑːr juː ˈrɛdi tə lɜːrn/', vi: 'Các em đã sẵn sàng học chưa?' },
  { id: 'greetings-start', subjectId: 'greetings', subject: 'Chào hỏi & khởi động', context: 'Bắt đầu bài học', en: "Let's start our lesson.", ipa: '/lɛts stɑːrt ˈaʊər ˈlɛsən/', vi: 'Chúng ta bắt đầu bài học nhé.' },
  { id: 'classroom-listen', subjectId: 'classroom', subject: 'Câu lệnh lớp học', context: 'Nghe và nhắc lại', en: 'Listen and repeat.', ipa: '/ˈlɪsən ænd rɪˈpiːt/', vi: 'Nghe và nhắc lại.' },
  { id: 'classroom-pair', subjectId: 'classroom', subject: 'Câu lệnh lớp học', context: 'Làm việc cặp đôi', en: 'Work with your partner.', ipa: '/wɜːrk wɪð jʊr ˈpɑːrtnər/', vi: 'Làm việc cùng bạn của em.' },
  { id: 'classroom-board', subjectId: 'classroom', subject: 'Câu lệnh lớp học', context: 'Theo dõi bảng', en: 'Look at the board.', ipa: '/lʊk æt ðə bɔːrd/', vi: 'Các em nhìn lên bảng.' },
  { id: 'games-team', subjectId: 'games', subject: 'Hướng dẫn trò chơi', context: 'Chia đội', en: 'Make two teams.', ipa: '/meɪk tuː tiːmz/', vi: 'Chia thành hai đội.' },
  { id: 'games-turn', subjectId: 'games', subject: 'Hướng dẫn trò chơi', context: 'Đến lượt', en: "It's your turn.", ipa: '/ɪts jʊr tɜːrn/', vi: 'Đến lượt em.' },
  { id: 'games-point', subjectId: 'games', subject: 'Hướng dẫn trò chơi', context: 'Tính điểm', en: 'One point for Team A!', ipa: '/wʌn pɔɪnt fər tiːm eɪ/', vi: 'Đội A được một điểm!' },
  { id: 'math-count', subjectId: 'math', subject: 'Môn Toán', context: 'Đếm và tính nhẩm', en: "Let's count together.", ipa: '/lɛts kaʊnt təˈɡɛðər/', vi: 'Cùng đếm nào.' },
  { id: 'math-answer', subjectId: 'math', subject: 'Môn Toán', context: 'Kiểm tra kết quả', en: 'What is the answer?', ipa: '/wʌt ɪz ði ˈænsər/', vi: 'Đáp án là gì?' },
  { id: 'math-explain', subjectId: 'math', subject: 'Môn Toán', context: 'Trình bày cách làm', en: 'Please explain your answer.', ipa: '/pliːz ɪkˈspleɪn jʊr ˈænsər/', vi: 'Em hãy giải thích đáp án.' },
  { id: 'vietnamese-read', subjectId: 'vietnamese', subject: 'Môn Tiếng Việt', context: 'Đọc thành tiếng', en: 'Read the passage aloud.', ipa: '/riːd ðə ˈpæsɪdʒ əˈlaʊd/', vi: 'Đọc to đoạn văn.' },
  { id: 'vietnamese-keyword', subjectId: 'vietnamese', subject: 'Môn Tiếng Việt', context: 'Tìm ý chính', en: 'Find the key words.', ipa: '/faɪnd ðə kiː wɜːrdz/', vi: 'Tìm các từ khóa.' },
  { id: 'vietnamese-share', subjectId: 'vietnamese', subject: 'Môn Tiếng Việt', context: 'Chia sẻ ý kiến', en: 'Share your idea with the class.', ipa: '/ʃer jʊr aɪˈdiːə wɪð ðə klæs/', vi: 'Chia sẻ ý kiến với cả lớp.' },
  { id: 'science-observe', subjectId: 'science', subject: 'Môn Khoa học', context: 'Quan sát thí nghiệm', en: 'Observe the experiment carefully.', ipa: '/əbˈzɜːrv ði ɪkˈspɛrəmənt ˈkɛrfəli/', vi: 'Quan sát thí nghiệm cẩn thận.' },
  { id: 'science-predict', subjectId: 'science', subject: 'Môn Khoa học', context: 'Dự đoán', en: 'What do you predict?', ipa: '/wʌt duː ju prɪˈdɪkt/', vi: 'Em dự đoán điều gì?' },
  { id: 'science-safe', subjectId: 'science', subject: 'Môn Khoa học', context: 'An toàn', en: 'Remember the safety rules.', ipa: '/rɪˈmɛmbər ðə ˈseɪfti ruːlz/', vi: 'Hãy nhớ các quy tắc an toàn.' },
  { id: 'art-colours', subjectId: 'art', subject: 'Môn Mĩ thuật', context: 'Chuẩn bị dụng cụ', en: 'Take out your colours.', ipa: '/teɪk aʊt jʊr ˈkʌlərz/', vi: 'Lấy màu vẽ ra.' },
  { id: 'art-create', subjectId: 'art', subject: 'Môn Mĩ thuật', context: 'Sáng tạo', en: 'Create your own picture.', ipa: '/kriˈeɪt jʊr oʊn ˈpɪktʃər/', vi: 'Tạo bức tranh của riêng em.' },
  { id: 'art-display', subjectId: 'art', subject: 'Môn Mĩ thuật', context: 'Chia sẻ sản phẩm', en: 'Show us your work.', ipa: '/ʃoʊ ʌs jʊr wɜːrk/', vi: 'Hãy cho cả lớp xem sản phẩm.' },
  { id: 'music-sing', subjectId: 'music', subject: 'Môn Âm nhạc', context: 'Hát cùng nhau', en: "Let's sing together.", ipa: '/lɛts sɪŋ təˈɡɛðər/', vi: 'Cùng hát nào.' },
  { id: 'music-rhythm', subjectId: 'music', subject: 'Môn Âm nhạc', context: 'Giữ nhịp', en: 'Keep the rhythm.', ipa: '/kiːp ðə ˈrɪðəm/', vi: 'Hãy giữ nhịp.' },
  { id: 'music-listen', subjectId: 'music', subject: 'Môn Âm nhạc', context: 'Lắng nghe âm nhạc', en: 'Listen to the music.', ipa: '/ˈlɪsən tə ðə ˈmjuːzɪk/', vi: 'Lắng nghe bản nhạc.' },
  { id: 'pe-line', subjectId: 'pe', subject: 'Môn Giáo dục thể chất', context: 'Khởi động', en: 'Line up, please.', ipa: '/laɪn ʌp pliːz/', vi: 'Các em xếp hàng nào.' },
  { id: 'pe-move', subjectId: 'pe', subject: 'Môn Giáo dục thể chất', context: 'Vận động', en: 'Move your body safely.', ipa: '/muːv jʊr ˈbɑːdi ˈseɪfli/', vi: 'Vận động an toàn.' },
  { id: 'pe-breathe', subjectId: 'pe', subject: 'Môn Giáo dục thể chất', context: 'Thả lỏng', en: 'Take a deep breath.', ipa: '/teɪk ə diːp brɛθ/', vi: 'Hít thở sâu nào.' },
  { id: 'history-map', subjectId: 'history-geography', subject: 'Môn Lịch sử & Địa lí', context: 'Quan sát bản đồ', en: 'Look at the map.', ipa: '/lʊk æt ðə mæp/', vi: 'Hãy nhìn vào bản đồ.' },
  { id: 'history-place', subjectId: 'history-geography', subject: 'Môn Lịch sử & Địa lí', context: 'Xác định địa điểm', en: 'Where is this place?', ipa: '/wer ɪz ðɪs pleɪs/', vi: 'Địa điểm này ở đâu?' },
  { id: 'history-past', subjectId: 'history-geography', subject: 'Môn Lịch sử & Địa lí', context: 'Tìm hiểu quá khứ', en: 'Let us learn about the past.', ipa: '/lɛt ʌs lɜːrn əˈbaʊt ðə pæst/', vi: 'Chúng ta cùng tìm hiểu về quá khứ.' },
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
