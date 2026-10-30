/** Thông tin tác giả — dùng chung cho trang Tác giả và chân trang. */
export const AUTHOR = {
  role: 'Giáo viên',
  name: 'Nguyễn Thị Thoa',
  email: 'nguyenthoa2306dn@gmail.com',
  phone: '0935414898',
  school: 'Trường Tiểu học Bế Văn Đàn',
  address: 'phường An Khê, TP Đà Nẵng',
} as const;

export const AUTHOR_ZALO_URL = `https://zalo.me/${AUTHOR.phone}`;

/** 0935414898 → "0935 414 898" cho dễ đọc. */
export const formatPhone = (phone: string) => phone.replace(/^(\d{4})(\d{3})(\d{3})$/, '$1 $2 $3');
