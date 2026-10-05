import type { LessonSettings } from '@/lib/lesson-options';

export interface LessonSample {
  id: string;
  label: string;
  settings: Pick<LessonSettings, 'grade' | 'subjectId' | 'duration'>;
  content: string;
}

/** Giáo án mẫu để thầy cô thử nhanh Trợ lý mà không cần chuẩn bị file. */
export const LESSON_SAMPLES: LessonSample[] = [
  {
    id: 'math-3-addition',
    label: 'Phép cộng các số trong phạm vi 10 000 (Lớp 3)',
    settings: { grade: '3', subjectId: 'math', duration: '35 phút' },
    content: `KẾ HOẠCH BÀI DẠY – MÔN TOÁN LỚP 3
Bài: PHÉP CỘNG CÁC SỐ TRONG PHẠM VI 10 000

I. YÊU CẦU CẦN ĐẠT
1. Kiến thức, kĩ năng:
- Biết đặt tính và thực hiện phép cộng các số trong phạm vi 10 000 (có nhớ không quá hai lượt và không liên tiếp).
- Vận dụng giải bài toán có lời văn liên quan đến phép cộng.
2. Năng lực: tư duy và lập luận toán học, giao tiếp toán học, hợp tác.
3. Phẩm chất: chăm chỉ, cẩn thận, trung thực khi làm bài.

II. ĐỒ DÙNG DẠY HỌC
- GV: máy chiếu, bảng phụ, phiếu bài tập, thẻ số.
- HS: SGK Toán 3, vở, bảng con.

III. CÁC HOẠT ĐỘNG DẠY HỌC CHỦ YẾU
1. Khởi động (5 phút)
- GV tổ chức trò chơi "Tính nhanh nhận quà": GV đọc phép cộng trong phạm vi 1 000, HS ghi kết quả vào bảng con.
- GV nhận xét, giới thiệu bài mới.
2. Hình thành kiến thức (12 phút)
- GV viết phép tính 4 523 + 2 314 lên bảng, yêu cầu HS nêu cách đặt tính.
- GV hướng dẫn cộng từ phải sang trái: 3 + 4 = 7, viết 7; 2 + 1 = 3, viết 3; 5 + 3 = 8, viết 8; 4 + 2 = 6, viết 6.
- GV giới thiệu phép cộng có nhớ 3 526 + 2 759, HS thực hiện trên bảng con, GV chốt cách nhớ.
3. Luyện tập, thực hành (13 phút)
- Bài 1: HS tính rồi đổi vở kiểm tra chéo theo cặp.
- Bài 2: HS đặt tính rồi tính, 2 HS lên bảng.
- Bài 3: Bài toán có lời văn: Một thư viện có 2 345 quyển sách tiếng Việt và 1 250 quyển sách tiếng Anh. Hỏi thư viện có tất cả bao nhiêu quyển sách? HS làm vào vở, GV chữa bài.
4. Vận dụng, trải nghiệm (5 phút)
- GV tổ chức trò chơi "Ai nhanh hơn" theo nhóm 4 với các thẻ số.
- GV nhận xét tiết học, dặn dò HS chuẩn bị bài sau.`,
  },
  {
    id: 'vietnamese-2-storm',
    label: 'Tập đọc: Mẹ vắng nhà ngày bão (Lớp 2)',
    settings: { grade: '2', subjectId: 'vietnamese', duration: '35 phút' },
    content: `KẾ HOẠCH BÀI DẠY – MÔN TIẾNG VIỆT LỚP 2
Bài đọc: MẸ VẮNG NHÀ NGÀY BÃO

I. YÊU CẦU CẦN ĐẠT
1. Kiến thức, kĩ năng:
- Đọc đúng, rõ ràng bài thơ "Mẹ vắng nhà ngày bão"; biết ngắt nghỉ hơi đúng nhịp thơ.
- Hiểu nội dung: tình cảm yêu thương, sự quan tâm của các thành viên trong gia đình khi mẹ vắng nhà.
2. Năng lực: năng lực ngôn ngữ, giao tiếp và hợp tác khi trao đổi về bài đọc.
3. Phẩm chất: biết yêu thương, quan tâm, chia sẻ với người thân trong gia đình.

II. ĐỒ DÙNG DẠY HỌC
- GV: tranh minh hoạ bài đọc, máy chiếu, bảng phụ ghi khổ thơ cần luyện đọc.
- HS: SGK Tiếng Việt 2.

III. CÁC HOẠT ĐỘNG DẠY HỌC CHỦ YẾU
1. Khởi động (5 phút)
- GV cho HS quan sát tranh, hỏi: Tranh vẽ cảnh gì? Khi trời mưa bão, em cảm thấy thế nào?
- GV giới thiệu bài đọc.
2. Khám phá – Luyện đọc (12 phút)
- GV đọc mẫu toàn bài, giọng tình cảm, tha thiết.
- HS đọc nối tiếp từng khổ thơ; GV hướng dẫn đọc từ khó: nằm, nồm, lợp, thao thức.
- HS luyện đọc theo nhóm đôi; GV theo dõi, hỗ trợ.
3. Tìm hiểu bài (10 phút)
- GV nêu câu hỏi: Khi mẹ vắng nhà, ai đã chăm sóc các bạn nhỏ? Những chi tiết nào cho thấy cả nhà mong mẹ về?
- HS thảo luận nhóm, trả lời; GV chốt nội dung bài.
4. Luyện đọc lại và vận dụng (8 phút)
- HS luyện đọc thuộc khổ thơ em thích.
- HS chia sẻ một việc em đã làm để giúp đỡ người thân trong gia đình.
- GV nhận xét tiết học, khen ngợi HS tích cực.`,
  },
];
