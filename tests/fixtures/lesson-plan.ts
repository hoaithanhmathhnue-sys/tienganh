import type { BilingualLessonPlan } from '@/lib/ai/lesson-plan';

export const samplePlan: BilingualLessonPlan = {
  title: { vi: 'Phép cộng các số trong phạm vi 10 000', en: 'Addition within 10,000' },
  grade: 'Lớp 3',
  subject: 'Toán học (Mathematics)',
  duration: '35 phút',
  objectives: [{ vi: 'Thực hiện được phép cộng các số trong phạm vi 10 000.', en: 'Add numbers within 10,000.' }],
  competencies: [{ vi: 'Năng lực giao tiếp và hợp tác.', en: 'Communication and collaboration.' }],
  qualities: [{ vi: 'Chăm chỉ, trung thực.', en: 'Hard-working and honest.' }],
  teacherMaterials: [{ vi: 'Bảng phụ, máy chiếu', en: 'Board, projector' }],
  studentMaterials: [{ vi: 'Sách giáo khoa, bảng con', en: 'Textbook, mini whiteboard' }],
  activities: [
    {
      title: { vi: 'Khởi động', en: 'Warm-up' },
      duration: '5 phút',
      objective: { vi: 'Tạo hứng thú, ôn bảng cộng.', en: 'Engage students and review addition.' },
      teacher: { vi: 'GV tổ chức trò chơi "Tính nhanh nhận quà".', en: 'T runs the game "Quick Maths".' },
      students: { vi: 'HS tham gia trò chơi.', en: 'Ss play the game.' },
      teacherTalk: [
        { en: 'Good morning, class!', ipa: '/ɡʊd ˈmɔːrnɪŋ, klæs/', vi: 'Chào cả lớp!', purpose: 'Chào đầu giờ' },
        { en: "Let's play a game!", ipa: '/lɛts pleɪ ə ɡeɪm/', vi: 'Cùng chơi một trò chơi nhé!', purpose: 'Dẫn dắt trò chơi' },
      ],
      note: 'Dùng câu lệnh ngắn, hào hứng.',
    },
    {
      title: { vi: 'Hình thành kiến thức', en: 'Presentation' },
      duration: '12 phút',
      objective: { vi: 'HS biết đặt tính và cộng 4 523 + 2 314.', en: 'Ss can add 4,523 + 2,314 in columns.' },
      teacher: { vi: 'GV viết phép tính lên bảng, hướng dẫn cộng từ phải sang trái.', en: 'T writes the sum and models adding from right to left.' },
      students: { vi: 'HS quan sát, nêu cách đặt tính.', en: 'Ss watch and explain the steps.' },
      teacherTalk: [{ en: 'Look at the board, please.', ipa: '/lʊk æt ðə bɔːrd, pliːz/', vi: 'Các em nhìn lên bảng nhé.', purpose: 'Hướng sự chú ý' }],
      note: '',
    },
  ],
  vocabulary: [{ word: 'plus', ipa: '/plʌs/', vi: 'cộng', example: 'Five plus three is eight.' }],
  tips: ['Không ép học sinh nói tiếng Anh quá 5–10 phút mỗi tiết.'],
};
