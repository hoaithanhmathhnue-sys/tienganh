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
  { id: 'science-observe', subjectId: 'science', subject: 'Môn Tự nhiên & Xã hội', context: 'Quan sát thí nghiệm', en: 'Observe the experiment carefully.', ipa: '/əbˈzɜːrv ði ɪkˈspɛrəmənt ˈkɛrfəli/', vi: 'Quan sát thí nghiệm cẩn thận.' },
  { id: 'science-predict', subjectId: 'science', subject: 'Môn Tự nhiên & Xã hội', context: 'Dự đoán', en: 'What do you predict?', ipa: '/wʌt duː ju prɪˈdɪkt/', vi: 'Em dự đoán điều gì?' },
  { id: 'science-safe', subjectId: 'science', subject: 'Môn Tự nhiên & Xã hội', context: 'An toàn', en: 'Remember the safety rules.', ipa: '/rɪˈmɛmbər ðə ˈseɪfti ruːlz/', vi: 'Hãy nhớ các quy tắc an toàn.' },
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


const SUBJECT_LABELS: Record<string, string> = Object.fromEntries(LEARNING_SUBJECTS.map((subject) => [subject.id, subject.label]));
const SUBJECT_IDS_BY_PREFIX: Record<string, string> = {
  greetings: 'greetings',
  classroom: 'classroom',
  games: 'games',
  math: 'math',
  vietnamese: 'vietnamese',
  art: 'art',
  music: 'music',
  pe: 'pe',
  history: 'history-geography',
  science: 'science',
};
const ADDITIONAL_LEARNING_PHRASES: Array<[string, string, string, string, string]> = [
  // Chào hỏi & khởi động
  ['greetings-how-are-you', 'Hỏi thăm đầu giờ', 'How are you today?', '/haʊ ɑːr ju təˈdeɪ/', 'Hôm nay các em thế nào?'],
  ['greetings-happy-to-see', 'Tạo không khí thân thiện', 'I am happy to see you.', '/aɪ æm ˈhæpi tə siː juː/', 'Cô/thầy rất vui được gặp các em.'],
  ['greetings-sit-comfortably', 'Ổn định tư thế', 'Sit comfortably, please.', '/sɪt ˈkʌmftərbli pliːz/', 'Các em ngồi ngay ngắn, thoải mái nhé.'],
  ['greetings-take-deep-breath', 'Bình tĩnh trước giờ học', 'Take a deep breath.', '/teɪk ə diːp brɛθ/', 'Các em hít thở sâu nào.'],
  ['greetings-date', 'Hỏi ngày', 'What day is it today?', '/wʌt deɪ ɪz ɪt təˈdeɪ/', 'Hôm nay là thứ mấy?'],
  ['greetings-weather', 'Hỏi thời tiết', 'What is the weather like today?', '/wʌt ɪz ðə ˈwɛðər laɪk təˈdeɪ/', 'Hôm nay thời tiết như thế nào?'],
  ['greetings-check-materials', 'Kiểm tra đồ dùng', 'Do you have your book and pencil?', '/duː juː hæv jʊr bʊk ənd ˈpɛnsəl/', 'Các em đã có sách và bút chì chưa?'],
  ['greetings-topic', 'Giới thiệu chủ đề', 'Today we will learn about shapes.', '/təˈdeɪ wiː wɪl lɜːrn əˈbaʊt ʃeɪps/', 'Hôm nay chúng ta sẽ học về các hình.'],
  ['greetings-objective', 'Nêu mục tiêu đơn giản', 'By the end, you can tell a story.', '/baɪ ði ɛnd juː kæn tɛl ə ˈstɔːri/', 'Cuối giờ, các em có thể kể một câu chuyện.'],
  ['greetings-review', 'Ôn bài cũ', 'Let us review the last lesson.', '/lɛt ʌs rɪˈvjuː ðə læst ˈlɛsən/', 'Chúng ta cùng ôn bài trước nhé.'],
  ['greetings-volunteer', 'Khuyến khích xung phong', 'Who would like to try?', '/huː wʊd laɪk tə traɪ/', 'Bạn nào muốn thử?'],
  ['greetings-brave', 'Động viên tự tin', 'It is okay to make mistakes.', '/ɪt ɪz oʊˈkeɪ tə meɪk mɪˈsteɪks/', 'Mắc lỗi cũng không sao đâu.'],
  ['greetings-kind', 'Nhắc ứng xử tích cực', 'Let us be kind to each other.', '/lɛt ʌs biː kaɪnd tə iːtʃ ˈʌðər/', 'Chúng ta hãy đối xử tử tế với nhau.'],
  ['greetings-partner-greeting', 'Chào bạn bên cạnh', 'Say hello to your partner.', '/seɪ həˈloʊ tə jʊr ˈpɑːrtnər/', 'Hãy chào bạn bên cạnh của em.'],
  ['greetings-smile', 'Khởi động vui vẻ', 'Give me your biggest smile.', '/ɡɪv miː jʊr ˈbɪɡɪst smaɪl/', 'Hãy cho cô/thầy nụ cười tươi nhất nào.'],
  ['greetings-clap', 'Tạo nhịp khởi động', 'Clap your hands three times.', '/klæp jʊr hændz θriː taɪmz/', 'Vỗ tay ba lần nào.'],
  ['greetings-great-day', 'Kết nối tích cực', 'Let us have a great day.', '/lɛt ʌs hæv ə ɡreɪt deɪ/', 'Chúng ta cùng có một ngày thật vui nhé.'],

  // Câu lệnh lớp học
  ['classroom-open-book', 'Mở sách', 'Open your book to page ten.', '/ˈoʊpən jʊr bʊk tə peɪdʒ tɛn/', 'Mở sách ở trang mười.'],
  ['classroom-close-book', 'Đóng sách', 'Close your book, please.', '/kloʊz jʊr bʊk pliːz/', 'Các em đóng sách nhé.'],
  ['classroom-take-out', 'Lấy đồ dùng', 'Take out your notebook.', '/teɪk aʊt jʊr ˈnoʊtbʊk/', 'Lấy vở ra nào.'],
  ['classroom-put-away', 'Cất đồ dùng', 'Put your pencils away.', '/pʊt jʊr ˈpɛnsəlz əˈweɪ/', 'Cất bút chì của các em đi.'],
  ['classroom-sit-down', 'Ngồi xuống', 'Please sit down.', '/pliːz sɪt daʊn/', 'Các em ngồi xuống nhé.'],
  ['classroom-stand-up', 'Đứng lên', 'Please stand up.', '/pliːz stænd ʌp/', 'Các em đứng lên nhé.'],
  ['classroom-raise-hand', 'Phát biểu', 'Raise your hand if you know.', '/reɪz jʊr hænd ɪf juː noʊ/', 'Nếu biết, các em hãy giơ tay.'],
  ['classroom-think-time', 'Cho thời gian suy nghĩ', 'Think quietly for one minute.', '/θɪŋk ˈkwaɪətli fər wʌn ˈmɪnɪt/', 'Hãy suy nghĩ yên lặng trong một phút.'],
  ['classroom-group', 'Làm việc nhóm', 'Work in groups of four.', '/wɜːrk ɪn ɡruːps əv fɔːr/', 'Làm việc theo nhóm bốn bạn.'],
  ['classroom-take-turns', 'Luân phiên nói', 'Take turns to speak.', '/teɪk tɜːrnz tə spiːk/', 'Lần lượt nói nhé.'],
  ['classroom-quiet-voice', 'Giữ âm lượng phù hợp', 'Use a quiet voice.', '/juːz ə ˈkwaɪət vɔɪs/', 'Hãy nói với giọng vừa đủ nghe.'],
  ['classroom-read-together', 'Đọc đồng thanh', 'Read together, please.', '/riːd təˈɡɛðər pliːz/', 'Cả lớp cùng đọc nhé.'],
  ['classroom-write-name', 'Ghi tên', 'Write your name at the top.', '/raɪt jʊr neɪm æt ðə tɑːp/', 'Viết tên của em ở phía trên.'],
  ['classroom-check-work', 'Kiểm tra bài', 'Check your work carefully.', '/tʃɛk jʊr wɜːrk ˈkɛrfəli/', 'Kiểm tra bài làm cẩn thận.'],
  ['classroom-help', 'Xin hỗ trợ', 'Put your hand up if you need help.', '/pʊt jʊr hænd ʌp ɪf juː niːd hɛlp/', 'Giơ tay nếu các em cần giúp đỡ.'],
  ['classroom-tidy', 'Dọn góc học tập', 'Keep your desk tidy.', '/kiːp jʊr dɛsk ˈtaɪdi/', 'Giữ bàn học của em gọn gàng.'],
  ['classroom-well-done', 'Khen ngợi', 'Well done, everyone!', '/wɛl dʌn ˈɛvriwʌn/', 'Cả lớp làm tốt lắm!'],

  // Hướng dẫn trò chơi
  ['games-listen-rules', 'Lắng nghe luật chơi', 'Listen to the rules first.', '/ˈlɪsən tə ðə ruːlz fɜːrst/', 'Trước tiên, hãy nghe luật chơi.'],
  ['games-watch-demo', 'Xem làm mẫu', 'Watch my example.', '/wɑːtʃ maɪ ɪɡˈzæmpəl/', 'Hãy xem cô/thầy làm mẫu.'],
  ['games-ready', 'Chuẩn bị chơi', 'Are you ready to play?', '/ɑːr juː ˈrɛdi tə pleɪ/', 'Các em đã sẵn sàng chơi chưa?'],
  ['games-wait-turn', 'Chờ đến lượt', 'Wait for your turn.', '/weɪt fər jʊr tɜːrn/', 'Hãy chờ đến lượt của mình.'],
  ['games-roll-dice', 'Tung xúc xắc', 'Roll the dice.', '/roʊl ðə daɪs/', 'Tung xúc xắc nào.'],
  ['games-pick-card', 'Chọn thẻ', 'Pick a card.', '/pɪk ə kɑːrd/', 'Chọn một thẻ.'],
  ['games-match', 'Ghép thẻ', 'Find the matching card.', '/faɪnd ðə ˈmætʃɪŋ kɑːrd/', 'Tìm thẻ phù hợp.'],
  ['games-move-space', 'Di chuyển trên bảng', 'Move forward two spaces.', '/muːv ˈfɔːrwərd tuː speɪsɪz/', 'Tiến lên hai ô.'],
  ['games-say-answer', 'Nói đáp án', 'Say the answer clearly.', '/seɪ ði ˈænsər ˈklɪrli/', 'Hãy nói đáp án rõ ràng.'],
  ['games-help-team', 'Hỗ trợ đội', 'Help your team kindly.', '/hɛlp jʊr tiːm ˈkaɪndli/', 'Hãy hỗ trợ đội của mình một cách thân thiện.'],
  ['games-score', 'Cập nhật điểm', 'Let us count the points.', '/lɛt ʌs kaʊnt ðə pɔɪnts/', 'Chúng ta cùng đếm điểm nhé.'],
  ['games-cheer', 'Cổ vũ tích cực', 'Cheer for every team.', '/tʃɪr fər ˈɛvri tiːm/', 'Hãy cổ vũ cho mọi đội.'],
  ['games-fair', 'Chơi công bằng', 'Play fairly and kindly.', '/pleɪ ˈfɛrli ənd ˈkaɪndli/', 'Chơi công bằng và thân thiện nhé.'],
  ['games-time', 'Nhắc thời gian', 'You have one more minute.', '/juː hæv wʌn mɔːr ˈmɪnɪt/', 'Các em còn một phút nữa.'],
  ['games-freeze', 'Dừng khi có hiệu lệnh', 'Freeze and listen.', '/friːz ənd ˈlɪsən/', 'Dừng lại và lắng nghe.'],
  ['games-winner', 'Chúc mừng đội thắng', 'Congratulations, Team B!', '/kənˌɡrætʃəˈleɪʃənz tiːm biː/', 'Chúc mừng đội B!'],
  ['games-try-again', 'Khích lệ sau lượt chơi', 'Great try! Let us play again.', '/ɡreɪt traɪ lɛt ʌs pleɪ əˈɡɛn/', 'Cố gắng rất tốt! Chúng ta chơi lại nhé.'],

  // Môn Toán
  ['math-number', 'Nhận biết số', 'What number is this?', '/wʌt ˈnʌmbər ɪz ðɪs/', 'Đây là số mấy?'],
  ['math-equation', 'Đọc phép tính', 'Read the equation aloud.', '/riːd ði ɪˈkweɪʒən əˈlaʊd/', 'Đọc to phép tính.'],
  ['math-add', 'Phép cộng', 'Let us add the numbers.', '/lɛt ʌs æd ðə ˈnʌmbərz/', 'Chúng ta cùng cộng các số.'],
  ['math-subtract', 'Phép trừ', 'Now subtract the smaller number.', '/naʊ səbˈtrækt ðə ˈsmɔːlər ˈnʌmbər/', 'Bây giờ hãy trừ số nhỏ hơn.'],
  ['math-compare', 'So sánh số', 'Which number is greater?', '/wɪtʃ ˈnʌmbər ɪz ˈɡreɪtər/', 'Số nào lớn hơn?'],
  ['math-less', 'So sánh số', 'Which number is smaller?', '/wɪtʃ ˈnʌmbər ɪz ˈsmɔːlər/', 'Số nào bé hơn?'],
  ['math-shape', 'Nhận biết hình', 'Name this shape.', '/neɪm ðɪs ʃeɪp/', 'Hãy gọi tên hình này.'],
  ['math-sides', 'Đếm cạnh', 'How many sides does it have?', '/haʊ ˈmɛni saɪdz dʌz ɪt hæv/', 'Hình có bao nhiêu cạnh?'],
  ['math-measure', 'Đo độ dài', 'Measure it with your ruler.', '/ˈmɛʒər ɪt wɪð jʊr ˈruːlər/', 'Hãy đo bằng thước kẻ của em.'],
  ['math-units', 'Đơn vị đo', 'Do not forget the unit.', '/duː nɑːt fərˈɡɛt ðə ˈjuːnɪt/', 'Đừng quên ghi đơn vị.'],
  ['math-pattern', 'Quy luật dãy số', 'What comes next in the pattern?', '/wʌt kʌmz nɛkst ɪn ðə ˈpætərn/', 'Điều gì đến tiếp theo trong quy luật?'],
  ['math-sort', 'Phân loại', 'Sort the shapes by color.', '/sɔːrt ðə ʃeɪps baɪ ˈkʌlər/', 'Hãy phân loại các hình theo màu sắc.'],
  ['math-draw', 'Vẽ hình', 'Draw a triangle in your notebook.', '/drɔː ə ˈtraɪæŋɡəl ɪn jʊr ˈnoʊtbʊk/', 'Vẽ một hình tam giác vào vở.'],
  ['math-word-problem', 'Bài toán có lời văn', 'Underline the important numbers.', '/ˌʌndərˈlaɪn ði ɪmˈpɔːrtənt ˈnʌmbərz/', 'Gạch chân các số quan trọng.'],
  ['math-estimate', 'Ước lượng', 'Make a sensible estimate.', '/meɪk ə ˈsɛnsəbəl ˈɛstəmeɪt/', 'Hãy đưa ra một ước lượng hợp lí.'],
  ['math-check', 'Tự kiểm tra', 'Check your answer another way.', '/tʃɛk jʊr ˈænsər əˈnʌðər weɪ/', 'Hãy kiểm tra đáp án bằng một cách khác.'],
  ['math-strategy', 'Khuyến khích tư duy', 'There is more than one way to solve it.', '/ðɛr ɪz mɔːr ðæn wʌn weɪ tə sɑːlv ɪt/', 'Có nhiều cách để giải bài toán này.'],

  // Môn Tiếng Việt
  ['vietnamese-title', 'Đọc nhan đề', 'Read the title first.', '/riːd ðə ˈtaɪtəl fɜːrst/', 'Hãy đọc nhan đề trước.'],
  ['vietnamese-main-idea', 'Tìm ý chính', 'What is the main idea?', '/wʌt ɪz ðə meɪn aɪˈdiːə/', 'Ý chính là gì?'],
  ['vietnamese-character', 'Nhân vật', 'Who is the main character?', '/huː ɪz ðə meɪn ˈkærɪktər/', 'Nhân vật chính là ai?'],
  ['vietnamese-setting', 'Bối cảnh', 'Where does the story happen?', '/wer dʌz ðə ˈstɔːri ˈhæpən/', 'Câu chuyện diễn ra ở đâu?'],
  ['vietnamese-sequence', 'Sắp xếp sự việc', 'Put the events in order.', '/pʊt ði ɪˈvɛnts ɪn ˈɔːrdər/', 'Hãy sắp xếp các sự việc theo thứ tự.'],
  ['vietnamese-question', 'Đặt câu hỏi', 'Ask a question about the text.', '/æsk ə ˈkwɛstʃən əˈbaʊt ðə tɛkst/', 'Hãy đặt một câu hỏi về bài đọc.'],
  ['vietnamese-sentence', 'Đặt câu', 'Make a sentence with this word.', '/meɪk ə ˈsɛntəns wɪð ðɪs wɜːrd/', 'Đặt câu với từ này.'],
  ['vietnamese-capital', 'Viết hoa đầu câu', 'Start the sentence with a capital letter.', '/stɑːrt ðə ˈsɛntəns wɪð ə ˈkæpɪtəl ˈlɛtər/', 'Bắt đầu câu bằng chữ cái viết hoa.'],
  ['vietnamese-punctuation', 'Dấu câu', 'Choose the correct punctuation mark.', '/tʃuːz ðə kəˈrɛkt ˌpʌŋktʃuˈeɪʃən mɑːrk/', 'Chọn dấu câu phù hợp.'],
  ['vietnamese-spell', 'Đánh vần', 'Spell the word slowly.', '/spɛl ðə wɜːrd ˈsloʊli/', 'Đánh vần từ thật chậm.'],
  ['vietnamese-sound', 'Nhận biết âm', 'Listen for the first sound.', '/ˈlɪsən fər ðə fɜːrst saʊnd/', 'Lắng nghe âm đầu tiên.'],
  ['vietnamese-describe', 'Miêu tả tranh', 'Describe the picture in one sentence.', '/dɪˈskraɪb ðə ˈpɪktʃər ɪn wʌn ˈsɛntəns/', 'Miêu tả bức tranh bằng một câu.'],
  ['vietnamese-imagine', 'Viết sáng tạo', 'Use your imagination.', '/juːz jʊr ɪˌmædʒɪˈneɪʃən/', 'Hãy dùng trí tưởng tượng của em.'],
  ['vietnamese-partner-read', 'Đọc cùng bạn', 'Read to your partner.', '/riːd tə jʊr ˈpɑːrtnər/', 'Đọc cho bạn bên cạnh nghe.'],
  ['vietnamese-feedback', 'Góp ý tích cực', 'Give your friend a kind comment.', '/ɡɪv jʊr frɛnd ə kaɪnd ˈkɑːmɛnt/', 'Hãy góp ý tích cực cho bạn.'],
  ['vietnamese-summary', 'Tóm tắt', 'Tell the story in three sentences.', '/tɛl ðə ˈstɔːri ɪn θriː ˈsɛntənsɪz/', 'Kể lại câu chuyện bằng ba câu.'],
  ['vietnamese-voice', 'Đọc diễn cảm', 'Use a clear and friendly voice.', '/juːz ə klɪr ənd ˈfrɛndli vɔɪs/', 'Hãy đọc với giọng rõ ràng, thân thiện.'],
  // art
  ["art-materials","Gọi tên dụng cụ","What materials do you need?","/wʌt məˈtɪriəlz duː juː niːd/","Em cần những dụng cụ nào?"],
  ["art-draw-lightly","Phác thảo","Draw lightly with your pencil.","/drɔː ˈlaɪtli wɪð jʊr ˈpɛnsəl/","Hãy phác nhẹ bằng bút chì."],
  ["art-lines","Vẽ nét","Try different kinds of lines.","/traɪ ˈdɪfrənt kaɪndz əv laɪnz/","Hãy thử các kiểu nét khác nhau."],
  ["art-shapes","Tạo hình","Use circles and squares.","/juːz ˈsɜːrkəlz ənd skwerz/","Hãy dùng hình tròn và hình vuông."],
  ["art-colour-choice","Chọn màu","Choose colors that work well together.","/tʃuːz ˈkʌlərz ðæt wɜːrk wɛl təˈɡɛðər/","Chọn những màu phù hợp với nhau."],
  ["art-colour-carefully","Tô màu","Color carefully inside the lines.","/ˈkʌlər ˈkɛrfəli ɪnˈsaɪd ðə laɪnz/","Tô màu cẩn thận trong các nét viền."],
  ["art-mix","Pha màu","Let us mix two colors.","/lɛt ʌs mɪks tuː ˈkʌlərz/","Chúng ta cùng pha hai màu."],
  ["art-cut-safely","Dùng kéo an toàn","Use the scissors safely.","/juːz ðə ˈsɪzərz ˈseɪfli/","Sử dụng kéo an toàn."],
  ["art-glue","Dán sản phẩm","Use a small amount of glue.","/juːz ə smɔːl əˈmaʊnt əv ɡluː/","Chỉ dùng một lượng keo vừa đủ."],
  ["art-texture","Khám phá chất liệu","Can you feel the texture?","/kæn juː fiːl ðə ˈtɛkstʃər/","Em có cảm nhận được bề mặt chất liệu không?"],
  ["art-observe","Quan sát mẫu","Look closely at the picture.","/lʊk ˈkloʊsli æt ðə ˈpɪktʃər/","Hãy quan sát kĩ bức tranh."],
  ["art-ideas","Khuyến khích ý tưởng riêng","Your idea is special.","/jʊr aɪˈdiːə ɪz ˈspɛʃəl/","Ý tưởng của em thật đặc biệt."],
  ["art-details","Thêm chi tiết","Add some details to your picture.","/æd sʌm ˈdiːteɪlz tə jʊr ˈpɪktʃər/","Hãy thêm vài chi tiết vào bức tranh."],
  ["art-gallery","Tham quan sản phẩm","Let us walk around the gallery.","/lɛt ʌs wɔːk əˈraʊnd ðə ˈɡæləri/","Chúng ta cùng xem triển lãm nhỏ của lớp."],
  ["art-praise","Khen sản phẩm","Tell your friend one thing you like.","/tɛl jʊr frɛnd wʌn θɪŋ juː laɪk/","Hãy nói với bạn một điều em thích ở sản phẩm."],
  ["art-clean","Dọn dẹp","Clean your table when you finish.","/kliːn jʊr ˈteɪbəl wɛn juː ˈfɪnɪʃ/","Dọn bàn khi các em làm xong."],
  ["art-proud","Ghi nhận nỗ lực","Be proud of your hard work.","/biː praʊd əv jʊr hɑːrd wɜːrk/","Hãy tự hào về sự cố gắng của em."],

  // music
  ["music-echo","Hát hoặc đọc nhắc lại","Echo my voice.","/ˈɛkoʊ maɪ vɔɪs/","Hãy hát hoặc đọc nhắc lại theo cô/thầy."],
  ["music-clap","Vỗ tay theo nhịp","Clap the rhythm with me.","/klæp ðə ˈrɪðəm wɪð miː/","Vỗ tay theo nhịp cùng cô/thầy."],
  ["music-count","Đếm nhịp","Count four beats with me.","/kaʊnt fɔːr biːts wɪð miː/","Cùng đếm bốn phách nào."],
  ["music-loud","Âm lượng to","Sing a little louder.","/sɪŋ ə ˈlɪtəl ˈlaʊdər/","Hãy hát to hơn một chút."],
  ["music-soft","Âm lượng nhỏ","Sing softly now.","/sɪŋ ˈsɔːftli naʊ/","Bây giờ hãy hát nhẹ nhàng."],
  ["music-fast","Tốc độ nhanh","Can you clap faster?","/kæn juː klæp ˈfæstər/","Các em có thể vỗ tay nhanh hơn không?"],
  ["music-slow","Tốc độ chậm","Let us sing more slowly.","/lɛt ʌs sɪŋ mɔːr ˈsloʊli/","Chúng ta cùng hát chậm hơn."],
  ["music-high-low","Nhận biết cao độ","Is this sound high or low?","/ɪz ðɪs saʊnd haɪ ɔːr loʊ/","Âm thanh này cao hay thấp?"],
  ["music-melody","Nghe giai điệu","Follow the melody with your finger.","/ˈfɑːloʊ ðə ˈmɛlədi wɪð jʊr ˈfɪŋɡər/","Hãy dùng ngón tay theo dõi giai điệu."],
  ["music-instrument","Nhận biết nhạc cụ","Which instrument can you hear?","/wɪtʃ ˈɪnstrəmənt kæn juː hɪr/","Em nghe thấy nhạc cụ nào?"],
  ["music-hold","Cầm nhạc cụ đúng cách","Hold the instrument gently.","/hoʊld ði ˈɪnstrəmənt ˈdʒɛntli/","Cầm nhạc cụ nhẹ nhàng."],
  ["music-start","Bắt đầu biểu diễn","Start when I count to three.","/stɑːrt wɛn aɪ kaʊnt tə θriː/","Bắt đầu khi cô/thầy đếm đến ba."],
  ["music-stop","Dừng biểu diễn","Stop and listen for the next cue.","/stɑːp ənd ˈlɪsən fər ðə nɛkst kjuː/","Dừng lại và chờ hiệu lệnh tiếp theo."],
  ["music-breathe","Lấy hơi","Take a breath before you sing.","/teɪk ə brɛθ bɪˈfɔːr juː sɪŋ/","Lấy hơi trước khi hát."],
  ["music-posture","Tư thế hát","Stand tall and relax your shoulders.","/stænd tɔːl ənd rɪˈlæks jʊr ˈʃoʊldərz/","Đứng thẳng và thả lỏng vai."],
  ["music-perform","Biểu diễn nhóm","Let us perform for the class.","/lɛt ʌs pərˈfɔːrm fər ðə klæs/","Chúng ta cùng biểu diễn cho cả lớp."],
  ["music-applause","Khích lệ bạn","Give them a big round of applause.","/ɡɪv ðɛm ə bɪɡ raʊnd əv əˈplɔːz/","Hãy dành cho các bạn một tràng pháo tay lớn."],

  // pe
  ["pe-space","Giữ khoảng cách","Find a safe space.","/faɪnd ə seɪf speɪs/","Hãy tìm một khoảng trống an toàn."],
  ["pe-shoes","Kiểm tra trang phục","Check that your shoes are tied.","/tʃɛk ðæt jʊr ʃuːz ɑːr taɪd/","Kiểm tra xem dây giày đã được buộc chưa."],
  ["pe-warm-up","Khởi động","Let us warm up our bodies.","/lɛt ʌs wɔːrm ʌp aʊər ˈbɑːdiz/","Chúng ta cùng khởi động cơ thể."],
  ["pe-stretch","Giãn cơ","Stretch your arms up high.","/strɛtʃ jʊr ɑːrmz ʌp haɪ/","Duỗi tay lên cao."],
  ["pe-jog","Chạy chậm","Jog slowly around the cones.","/dʒɑːɡ ˈsloʊli əˈraʊnd ðə koʊnz/","Chạy chậm quanh các cọc tiêu."],
  ["pe-jump","Bật nhảy","Jump with both feet.","/dʒʌmp wɪð boʊθ fiːt/","Bật nhảy bằng cả hai chân."],
  ["pe-balance","Giữ thăng bằng","Balance on one foot.","/ˈbæləns ɑːn wʌn fʊt/","Giữ thăng bằng trên một chân."],
  ["pe-throw","Ném bóng","Throw the ball gently.","/θroʊ ðə bɔːl ˈdʒɛntli/","Ném bóng nhẹ nhàng."],
  ["pe-catch","Bắt bóng","Keep your eyes on the ball.","/kiːp jʊr aɪz ɑːn ðə bɔːl/","Hãy nhìn theo quả bóng."],
  ["pe-signal","Lắng nghe hiệu lệnh","Stop when you hear the whistle.","/stɑːp wɛn juː hɪr ðə ˈwɪsəl/","Dừng lại khi nghe tiếng còi."],
  ["pe-watch","Quan sát xung quanh","Watch where you are going.","/wɑːtʃ wer juː ɑːr ˈɡoʊɪŋ/","Hãy quan sát nơi em đang di chuyển."],
  ["pe-water","Uống nước","Take a water break.","/teɪk ə ˈwɔːtər breɪk/","Hãy nghỉ uống nước."],
  ["pe-teamwork","Làm việc đội","Help your teammates.","/hɛlp jʊr ˈtiːmmeɪts/","Hãy hỗ trợ các bạn trong đội."],
  ["pe-fair","Chơi đẹp","Play fairly and follow the rules.","/pleɪ ˈfɛrli ənd ˈfɑːloʊ ðə ruːlz/","Chơi công bằng và tuân thủ luật."],
  ["pe-encourage","Khích lệ bạn","Encourage your friends.","/ɪnˈkɜːrɪdʒ jʊr frɛndz/","Hãy động viên các bạn."],
  ["pe-cool-down","Hồi tĩnh","Let us cool down slowly.","/lɛt ʌs kuːl daʊn ˈsloʊli/","Chúng ta cùng thả lỏng từ từ."],
  ["pe-effort","Ghi nhận nỗ lực","You tried your best today.","/juː traɪd jʊr bɛst təˈdeɪ/","Hôm nay các em đã cố gắng hết sức."],

  ["history-compass","Xác định phương hướng","Find north on the map.","/faɪnd nɔːrθ ɑːn ðə mæp/","Hãy tìm hướng bắc trên bản đồ."],
  ["history-symbols","Đọc kí hiệu","What does this map symbol mean?","/wʌt dʌz ðɪs mæp ˈsɪmbəl miːn/","Kí hiệu này trên bản đồ có nghĩa gì?"],
  ["history-locate","Xác định vị trí","Can you locate our country?","/kæn juː ˈloʊkeɪt aʊər ˈkʌntri/","Em có thể xác định vị trí đất nước mình không?"],
  ["history-land-water","Phân biệt địa hình","Is this land or water?","/ɪz ðɪs lænd ɔːr ˈwɔːtər/","Đây là đất liền hay vùng nước?"],
  ["history-weather","Tìm hiểu thời tiết","How is the weather in this area?","/haʊ ɪz ðə ˈwɛðər ɪn ðɪs ˈɛriə/","Thời tiết ở khu vực này như thế nào?"],
  ["history-people","Tìm hiểu cộng đồng","How do people live here?","/haʊ duː ˈpiːpəl lɪv hɪr/","Người dân sống ở đây như thế nào?"],
  ["history-respect-culture","Tôn trọng văn hóa","We respect different cultures.","/wiː rɪˈspɛkt ˈdɪfrənt ˈkʌltʃərz/","Chúng ta tôn trọng các nền văn hóa khác nhau."],
  ["history-photo","Quan sát tư liệu","What can you see in this old photo?","/wʌt kæn juː siː ɪn ðɪs oʊld ˈfoʊtoʊ/","Em nhìn thấy gì trong bức ảnh cũ này?"],
  ["history-timeline","Đọc dòng thời gian","Put the events on the timeline.","/pʊt ði ɪˈvɛnts ɑːn ðə ˈtaɪmlaɪn/","Hãy đặt các sự kiện lên dòng thời gian."],
  ["history-present","So sánh xưa và nay","How is life different today?","/haʊ ɪz laɪf ˈdɪfrənt təˈdeɪ/","Cuộc sống hôm nay khác như thế nào?"],
  ["history-source","Đọc tư liệu","What does this source tell us?","/wʌt dʌz ðɪs sɔːrs tɛl ʌs/","Tư liệu này cho chúng ta biết điều gì?"],
  ["history-important","Ý nghĩa sự kiện","Why is this event important?","/waɪ ɪz ðɪs ɪˈvɛnt ɪmˈpɔːrtənt/","Vì sao sự kiện này quan trọng?"],
  ["history-hero","Nhân vật lịch sử","What did this person do?","/wʌt dɪd ðɪs ˈpɜːrsən duː/","Nhân vật này đã làm gì?"],
  ["history-landmark","Di tích và danh lam","This is an important landmark.","/ðɪs ɪz ən ɪmˈpɔːrtənt ˈlændmɑːrk/","Đây là một địa danh quan trọng."],
  ["history-environment","Bảo vệ môi trường địa phương","How can we protect this place?","/haʊ kæn wiː prəˈtɛkt ðɪs pleɪs/","Chúng ta có thể bảo vệ nơi này bằng cách nào?"],
  ["history-share","Chia sẻ phát hiện","Share one fact you learned.","/ʃer wʌn fækt juː lɜːrnd/","Hãy chia sẻ một điều em đã học được."],
  ["history-curious","Khuyến khích khám phá","Let us be curious about our world.","/lɛt ʌs biː ˈkjʊriəs əˈbaʊt aʊər wɜːrld/","Chúng ta hãy tò mò khám phá thế giới quanh mình."],
  ["science-question","Đặt câu hỏi","What do you notice?","/wʌt duː juː ˈnoʊtɪs/","Em nhận thấy điều gì?"],
  ["science-test","Kiểm tra dự đoán","Let us test your prediction.","/lɛt ʌs tɛst jʊr prɪˈdɪkʃən/","Chúng ta cùng kiểm tra dự đoán của em."],
  ["science-materials","Chuẩn bị vật liệu","Do not taste the materials.","/duː nɑːt teɪst ðə məˈtɪriəlz/","Không được nếm các vật liệu."],
  ["science-senses","Quan sát bằng giác quan","Use your eyes and ears carefully.","/juːz jʊr aɪz ənd ɪrz ˈkɛrfəli/","Hãy dùng mắt và tai để quan sát cẩn thận."],
  ["science-measure","Đo đạc","Measure and write down the result.","/ˈmɛʒər ənd raɪt daʊn ðə rɪˈzʌlt/","Hãy đo và ghi lại kết quả."],
  ["science-record","Ghi chép quan sát","Draw what you observe.","/drɔː wʌt juː əbˈzɜːrv/","Vẽ lại điều em quan sát được."],
  ["science-compare","So sánh","How are these objects different?","/haʊ ɑːr ðiːz ˈɑːbdʒɛkts ˈdɪfrənt/","Các vật này khác nhau như thế nào?"],
  ["science-sort","Phân loại","Sort these things into groups.","/sɔːrt ðiːz θɪŋz ˈɪntu ɡruːps/","Hãy phân loại những vật này thành các nhóm."],
  ["science-plant","Tìm hiểu về cây","What does a plant need to grow?","/wʌt dʌz ə plænt niːd tə ɡroʊ/","Cây cần gì để lớn lên?"],
  ["science-animal","Tìm hiểu về động vật","Where does this animal live?","/wer dʌz ðɪs ˈænɪməl lɪv/","Con vật này sống ở đâu?"],
  ["science-body","Chăm sóc cơ thể","How can we keep our bodies healthy?","/haʊ kæn wiː kiːp aʊər ˈbɑːdiz ˈhɛlθi/","Chúng ta làm gì để cơ thể khỏe mạnh?"],
  ["science-water","Tiết kiệm nước","Why should we save water?","/waɪ ʃʊd wiː seɪv ˈwɔːtər/","Vì sao chúng ta nên tiết kiệm nước?"],
  ["science-weather","Quan sát thời tiết","What changes do you see in the sky?","/wʌt ˈtʃeɪndʒɪz duː juː siː ɪn ðə skaɪ/","Em thấy bầu trời có những thay đổi gì?"],
  ["science-recycle","Bảo vệ môi trường","Put the paper in the recycling bin.","/pʊt ðə ˈpeɪpər ɪn ðə riːˈsaɪklɪŋ bɪn/","Bỏ giấy vào thùng tái chế."],
  ["science-fair-test","Thực hiện thử nghiệm công bằng","Change only one thing at a time.","/tʃeɪndʒ ˈoʊnli wʌn θɪŋ æt ə taɪm/","Mỗi lần chỉ thay đổi một yếu tố."],
  ["science-conclusion","Rút ra kết luận","What did we learn from this?","/wʌt dɪd wiː lɜːrn frəm ðɪs/","Chúng ta học được gì từ hoạt động này?"],
  ["science-care","Nuôi dưỡng tinh thần khám phá","Scientists ask questions and look for answers.","/ˈsaɪəntɪsts æsk ˈkwɛstʃənz ənd lʊk fɔːr ˈænsərz/","Các nhà khoa học đặt câu hỏi và tìm câu trả lời."],
];

SELF_STUDY_PHRASES.push(...ADDITIONAL_LEARNING_PHRASES.map(([id, context, en, ipa, vi]) => {
  const subjectId = SUBJECT_IDS_BY_PREFIX[id.split('-', 1)[0]];
  if (!subjectId) throw new Error('Unknown learning subject for phrase: ' + id);
  return { id, subjectId, subject: SUBJECT_LABELS[subjectId], context, en, ipa, vi };
}));

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
