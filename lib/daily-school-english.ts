import type { Slogan } from '@/lib/slogans';

export interface DailySchoolPhrase extends Slogan {
  /** Tình huống sử dụng trong trường. */
  situation: string;
}

export interface DailySchoolGroup {
  id: string;
  /** Tên nhóm tiếng Anh, ví dụ "Teacher ↔ Student". */
  title: string;
  name: string;
  icon: string;
  description: string;
  phrases: DailySchoolPhrase[];
}

/**
 * Daily School English — giao tiếp học đường theo 10 nhóm tình huống.
 * Phiên âm giữ nguyên theo tài liệu nguồn (giọng Anh – Anh).
 */
export const DAILY_SCHOOL_GROUPS: DailySchoolGroup[] = [
  {
    id: 'ds-teacher-student',
    title: 'Teacher ↔ Student',
    name: 'Thầy cô ↔ Học sinh',
    icon: '👩‍🏫',
    description: 'Thầy cô hỏi thăm, kiểm tra và động viên học sinh',
    phrases: [
      { en: 'Good morning! How are you today?', ipa: '/ɡʊd ˈmɔːnɪŋ haʊ ɑːr juː təˈdeɪ/', vi: 'Chào buổi sáng! Hôm nay em khỏe không?', situation: 'Đầu giờ sáng / Bắt đầu tiết học' },
      { en: 'Are you ready for class?', ipa: '/ɑːr juː ˈredi fɔːr klɑːs/', vi: 'Em đã sẵn sàng vào học chưa?', situation: 'Chuẩn bị vào bài học mới' },
      { en: 'Do you need any help?', ipa: '/duː juː niːd ˈeni help/', vi: 'Em có cần cô/thầy giúp gì không?', situation: 'Quan sát học sinh làm bài cá nhân' },
      { en: 'Have you finished your work?', ipa: '/hæv juː ˈfɪnɪʃt jɔːr wɜːk/', vi: 'Em đã hoàn thành bài chưa?', situation: 'Kiểm tra tiến độ làm bài' },
      { en: 'Great! Keep up the good work!', ipa: '/ɡreɪt kiːp ʌp ðə ɡʊd wɜːk/', vi: 'Tuyệt vời! Hãy tiếp tục phát huy nhé!', situation: 'Khen ngợi động viên học sinh' },
    ],
  },
  {
    id: 'ds-student-teacher',
    title: 'Student ↔ Teacher',
    name: 'Học sinh ↔ Thầy cô',
    icon: '🙋',
    description: 'Học sinh chào hỏi, xin phép và nhờ thầy cô giúp đỡ',
    phrases: [
      { en: 'Good morning, teacher.', ipa: '/ɡʊd ˈmɔːnɪŋ, ˈtiːtʃər/', vi: 'Em chào cô/thầy ạ.', situation: 'Học sinh chào thầy cô' },
      { en: 'May I come in?', ipa: '/meɪ aɪ kʌm ɪn/', vi: 'Em có thể vào lớp được không ạ?', situation: 'Xin phép vào lớp muộn / xin phép vào phòng' },
      { en: 'May I ask a question?', ipa: '/meɪ aɪ ɑːsk ə ˈkwestʃən/', vi: 'Em có thể hỏi một câu được không ạ?', situation: 'Học sinh giơ tay phát biểu / thắc mắc' },
      { en: "I don't understand. Can you explain it again?", ipa: '/aɪ dəʊnt ˌʌndəˈstænd kæn juː ɪkˈspleɪn ɪt əˈɡeɪn/', vi: 'Em chưa hiểu. Cô/thầy có thể giải thích lại không ạ?', situation: 'Học sinh phản hồi khi chưa hiểu kiến thức' },
      { en: 'Can you help me, please?', ipa: '/kæn juː help miː, pliːz/', vi: 'Cô/thầy có thể giúp em được không ạ?', situation: 'Nhờ sự trợ giúp khi gặp khó khăn trong bài tập' },
    ],
  },
  {
    id: 'ds-student-student',
    title: 'Student ↔ Student',
    name: 'Học sinh ↔ Học sinh',
    icon: '🤝',
    description: 'Các bạn làm quen, mượn đồ và hợp tác cùng nhau',
    phrases: [
      { en: 'Can I sit here?', ipa: '/kæn aɪ sɪt hɪər/', vi: 'Mình ngồi đây được không?', situation: 'Tìm chỗ ngồi / xếp bàn học' },
      { en: 'Sure. Sit next to me.', ipa: '/ʃɔːr sɪt nekst tuː miː/', vi: 'Được chứ. Ngồi cạnh mình đi.', situation: 'Đồng ý và đón nhận bạn học cùng' },
      { en: 'Can I borrow your pencil?', ipa: '/kæn aɪ ˈbɒrəʊ jɔːr ˈpensəl/', vi: 'Mình mượn bút chì của bạn được không?', situation: 'Mượn đồ dùng học tập trong giờ' },
      { en: 'Of course. Here you are.', ipa: '/əv kɔːs hɪər juː ɑːr/', vi: 'Tất nhiên. Của bạn đây.', situation: 'Cho bạn mượn đồ dùng' },
      { en: "Let's work together.", ipa: '/lets wɜːk təˈɡeðər/', vi: 'Chúng mình cùng làm nhé.', situation: 'Rủ bạn làm bài tập cặp / nhóm' },
    ],
  },
  {
    id: 'ds-in-classroom',
    title: 'In the Classroom',
    name: 'Trong lớp học',
    icon: '🏫',
    description: 'Sách vở, trang học và chuyển hoạt động',
    phrases: [
      { en: 'Please take out your books.', ipa: '/pliːz teɪk aʊt jɔːr bʊks/', vi: 'Các em lấy sách ra nhé.', situation: 'Bắt đầu bài học mới' },
      { en: 'Please put your books away.', ipa: '/pliːz pʊt jɔːr bʊks əˈweɪ/', vi: 'Các em cất sách đi nhé.', situation: 'Kết thúc bài học / dọn dẹp bàn học' },
      { en: 'What page are we on?', ipa: '/wɒt peɪdʒ ɑːr wiː ɒn/', vi: 'Chúng ta đang học trang nào?', situation: 'Hỏi trang sách đang mở' },
      { en: 'Can you say that again, please?', ipa: '/kæn juː seɪ ðæt əˈɡeɪn, pliːz/', vi: 'Bạn/cô có thể nói lại được không?', situation: 'Nhờ nhắc lại khi âm thanh nhỏ hoặc chưa nghe rõ' },
      { en: 'Are we ready to move on?', ipa: '/ɑːr wiː ˈredi tuː muːv ɒn/', vi: 'Chúng ta sẵn sàng chuyển sang hoạt động tiếp theo chưa?', situation: 'Chuyển tiếp phần học / hoạt động mới' },
    ],
  },
  {
    id: 'ds-break-time',
    title: 'At Break Time',
    name: 'Giờ ra chơi',
    icon: '⚽',
    description: 'Rủ bạn chơi, nhắc an toàn và quay lại lớp',
    phrases: [
      { en: 'What are you doing at break time?', ipa: '/wɒt ɑːr juː ˈduːɪŋ æt breɪk taɪm/', vi: 'Giờ ra chơi bạn làm gì?', situation: 'Hỏi thăm bạn vào giờ ra chơi' },
      { en: 'Do you want to play with us?', ipa: '/duː juː wɒnt tuː pleɪ wɪð ʌs/', vi: 'Bạn có muốn chơi cùng chúng mình không?', situation: 'Rủ bạn cùng chơi ở sân trường' },
      { en: "Let's play badminton.", ipa: '/lets pleɪ ˈbædmɪntən/', vi: 'Chúng mình chơi cầu lông nhé.', situation: 'Đề xuất trò chơi thể thao' },
      { en: 'Be careful!', ipa: '/biː ˈkeəfəl/', vi: 'Cẩn thận nhé!', situation: 'Nhắc nhở học sinh giữ an toàn khi chơi đùa' },
      { en: "It's time to go back to class.", ipa: '/ɪts taɪm tuː ɡəʊ bæk tuː klɑːs/', vi: 'Đến giờ quay lại lớp rồi.', situation: 'Hết giờ ra chơi / Báo hiệu vào lớp' },
    ],
  },
  {
    id: 'ds-around-school',
    title: 'Around the School',
    name: 'Quanh trường',
    icon: '🗺️',
    description: 'Hỏi đường, chỉ phòng chức năng và nhắc nề nếp',
    phrases: [
      { en: 'Where is the library?', ipa: '/weər ɪz ðə ˈlaɪbrəri/', vi: 'Thư viện ở đâu vậy?', situation: 'Hỏi vị trí phòng học / chức năng' },
      { en: "It's next to the computer room.", ipa: '/ɪts nekst tuː ðə kəmˈpjuːtər ruːm/', vi: 'Nó ở cạnh phòng máy tính.', situation: 'Chỉ đường trong khuôn viên trường' },
      { en: "Where is the teachers' room?", ipa: '/weər ɪz ðə ˈtiːtʃəz ruːm/', vi: 'Phòng giáo viên ở đâu?', situation: 'Hỏi vị trí phòng hội đồng / phòng giáo viên' },
      { en: "Let's go to the school yard.", ipa: '/lets ɡəʊ tuː ðə skuːl jɑːd/', vi: 'Chúng ta ra sân trường nhé.', situation: 'Rủ nhau ra sân tập thể dục / hoạt động' },
      { en: "Please walk, don't run.", ipa: '/pliːz wɔːk, dəʊnt rʌn/', vi: 'Hãy đi bộ, đừng chạy nhé.', situation: 'Nhắc nhở nề nếp di chuyển trên hành lang' },
    ],
  },
  {
    id: 'ds-school-gate',
    title: 'At the School Gate',
    name: 'Tại cổng trường',
    icon: '🚪',
    description: 'Đón học sinh, chào tạm biệt và nhắc đồ dùng',
    phrases: [
      { en: 'Good morning! Welcome to our school.', ipa: '/ɡʊd ˈmɔːnɪŋ ˈwelkəm tuː aʊər skuːl/', vi: 'Chào buổi sáng! Chào mừng bạn đến trường chúng tôi.', situation: 'Đón học sinh / khách ghé thăm tại cổng trường' },
      { en: 'Have a nice day at school!', ipa: '/hæv ə naɪs deɪ æt skuːl/', vi: 'Chúc em một ngày học vui vẻ!', situation: 'Lời chúc của thầy cô / phụ huynh đầu ngày' },
      { en: 'See you tomorrow!', ipa: '/siː juː təˈmɒrəʊ/', vi: 'Hẹn gặp em ngày mai!', situation: 'Tạm biệt học sinh tan trường' },
      { en: "Don't forget your school bag.", ipa: '/dəʊnt fəˈɡet jɔːr skuːl bæɡ/', vi: 'Đừng quên cặp sách nhé.', situation: 'Nhắc nhở học sinh mang đủ tư trang khi ra về' },
      { en: 'See you after school!', ipa: '/siː juː ˈɑːftər skuːl/', vi: 'Hẹn gặp lại sau giờ học!', situation: 'Tạm biệt bạn bè tại cổng trường' },
    ],
  },
  {
    id: 'ds-routines',
    title: 'School Routines',
    name: 'Nề nếp hằng ngày',
    icon: '⏰',
    description: 'Chào cờ, xếp hàng, ăn trưa và ra về',
    phrases: [
      { en: "It's time for the flag ceremony.", ipa: '/ɪts taɪm fɔːr ðə flæɡ ˈserɪməni/', vi: 'Đến giờ chào cờ rồi.', situation: 'Thông báo sinh hoạt dưới cờ / chào cờ Thứ Hai' },
      { en: 'Please line up quietly.', ipa: '/pliːz laɪn ʌp ˈkwaɪətli/', vi: 'Hãy xếp hàng trật tự.', situation: 'Yêu cầu xếp hàng di chuyển / sinh hoạt tập thể' },
      { en: "It's time for lunch.", ipa: '/ɪts taɪm fɔːr lʌntʃ/', vi: 'Đến giờ ăn trưa rồi.', situation: 'Thông báo giờ ăn trưa học sinh bán trú' },
      { en: 'Wash your hands before eating.', ipa: '/wɒʃ jɔːr hændz bɪˈfɔːr ˈiːtɪŋ/', vi: 'Hãy rửa tay trước khi ăn.', situation: 'Nhắc giữ vệ sinh cá nhân trước bữa ăn' },
      { en: "It's time to go home.", ipa: '/ɪts taɪm tuː ɡəʊ həʊm/', vi: 'Đến giờ về nhà rồi.', situation: 'Thông báo kết thúc ngày học' },
    ],
  },
  {
    id: 'ds-teacher-teacher',
    title: 'Teacher ↔ Teacher',
    name: 'Đồng nghiệp ↔ Đồng nghiệp',
    icon: '☕',
    description: 'Chào hỏi, hỗ trợ và hẹn họp chuyên môn',
    phrases: [
      { en: 'Good morning! How are you?', ipa: '/ɡʊd ˈmɔːnɪŋ haʊ ɑːr juː/', vi: 'Chào buổi sáng! Chị/Thầy khỏe không?', situation: 'Chào hỏi đồng nghiệp đầu ngày' },
      { en: 'Are you ready for the meeting?', ipa: '/ɑːr juː ˈredi fɔːr ðə ˈmiːtɪŋ/', vi: 'Chị/Thầy đã sẵn sàng cho cuộc họp chưa?', situation: 'Hỏi thăm trước giờ họp chuyên môn / tổ khối' },
      { en: 'Do you need any help?', ipa: '/duː juː niːd ˈeni help/', vi: 'Chị/Thầy có cần hỗ trợ gì không?', situation: 'Đề nghị giúp đỡ đồng nghiệp chuẩn bị hồ sơ / giảng dạy' },
      { en: 'What time does the meeting start?', ipa: '/wɒt taɪm dʌz ðə ˈmiːtɪŋ stɑːt/', vi: 'Cuộc họp bắt đầu lúc mấy giờ?', situation: 'Xác nhận lại giờ họp chuyên môn' },
      { en: 'See you at the meeting.', ipa: '/siː juː æt ðə ˈmiːtɪŋ/', vi: 'Hẹn gặp lại ở cuộc họp.', situation: 'Hẹn gặp lại đồng nghiệp' },
    ],
  },
  {
    id: 'ds-friendly',
    title: 'Friendly School English',
    name: 'Giao tiếp thân thiện',
    icon: '💛',
    description: 'Hỏi thăm, cảm ơn và chúc nhau một ngày tốt lành',
    phrases: [
      { en: 'How was your day?', ipa: '/haʊ wɒz jɔːr deɪ/', vi: 'Hôm nay của em/bạn thế nào?', situation: 'Hỏi thăm cảm xúc học sinh / đồng nghiệp cuối ngày' },
      { en: 'Are you feeling better today?', ipa: '/ɑːr juː ˈfiːlɪŋ ˈbetər təˈdeɪ/', vi: 'Hôm nay em/bạn cảm thấy tốt hơn chưa?', situation: 'Thăm hỏi sức khỏe người vừa bị ốm' },
      { en: 'Thank you for helping me.', ipa: '/θæŋk juː fɔːr ˈhelpɪŋ miː/', vi: 'Cảm ơn bạn đã giúp tôi.', situation: 'Cảm ơn học sinh hoặc bạn bè hỗ trợ công việc' },
      { en: "You're welcome.", ipa: '/jɔːr ˈwelkəm/', vi: 'Không có gì.', situation: 'Đáp lời cảm ơn lịch sự' },
      { en: 'Have a wonderful day!', ipa: '/hæv ə ˈwʌndəfəl deɪ/', vi: 'Chúc bạn/em một ngày thật tuyệt!', situation: 'Lời chúc tốt đẹp đầu hoặc giữa ngày' },
    ],
  },
];
