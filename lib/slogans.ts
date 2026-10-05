export interface Slogan {
  en: string;
  ipa: string;
  vi: string;
}

export interface SloganCategory {
  id: string;
  name: string;
  icon: string;
  slogans: Slogan[];
}

/** Khoá định danh slogan: không phân biệt hoa thường / khoảng trắng. */
export const sloganId = (slogan: Pick<Slogan, 'en'>): string =>
  (slogan?.en ?? '').trim().replace(/\s+/g, ' ').toLowerCase();

export const isSlogan = (value: unknown): value is Slogan => {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return typeof v.en === 'string' && v.en.trim() !== '' && typeof v.ipa === 'string' && typeof v.vi === 'string';
};

export const categories: SloganCategory[] = [
  {
    id: 'general',
    name: 'Slogan chung',
    icon: '⭐',
    slogans: [
      { en: 'Learn Every Day, Grow Every Day', ipa: '/lɜːrn ˈɛvri deɪ, ɡroʊ ˈɛvri deɪ/', vi: 'Học mỗi ngày, lớn lên mỗi ngày' },
      { en: 'Together We Learn, Together We Shine', ipa: '/təˈɡɛðər wi lɜːrn, təˈɡɛðər wi ʃaɪn/', vi: 'Cùng nhau học, cùng nhau tỏa sáng' },
      { en: 'Be Kind, Be Brave, Be You', ipa: '/biː kaɪnd, biː breɪv, biː juː/', vi: 'Hãy tử tế, dũng cảm, là chính mình' },
      { en: 'Small Steps, Big Dreams', ipa: '/smɔːl stɛps, bɪɡ driːmz/', vi: 'Bước nhỏ, ước mơ lớn' },
      { en: 'Every Child Is a Star', ipa: '/ˈɛvri tʃaɪld ɪz ə stɑːr/', vi: 'Mỗi em nhỏ là một ngôi sao' },
      { en: 'Education Is the Key to Success', ipa: '/ˌɛdʒʊˈkeɪʃən ɪz ðə kiː tuː səkˈsɛs/', vi: 'Giáo dục là chìa khóa thành công' },
      { en: 'Dream Big, Work Hard, Stay Humble', ipa: '/driːm bɪɡ, wɜːrk hɑːrd, steɪ ˈhʌmbl/', vi: 'Ước mơ lớn, nỗ lực nhiều, khiêm tốn luôn' },
      { en: 'Knowledge Is Power', ipa: '/ˈnɑːlɪdʒ ɪz ˈpaʊər/', vi: 'Kiến thức là sức mạnh' },
      { en: 'Today a Reader, Tomorrow a Leader', ipa: '/təˈdeɪ ə ˈriːdər, təˈmɑːroʊ ə ˈliːdər/', vi: 'Hôm nay là người đọc, ngày mai là người dẫn dắt' },
      { en: 'We Are the Future', ipa: '/wiː ɑːr ðə ˈfjuːtʃər/', vi: 'Chúng ta là tương lai' },
      { en: 'Learning Never Stops', ipa: '/ˈlɜːrnɪŋ ˈnɛvər stɑːps/', vi: 'Việc học không bao giờ dừng lại' },
      { en: 'Believe in Yourself', ipa: '/bɪˈliːv ɪn jɔːrˈsɛlf/', vi: 'Hãy tin vào chính mình' },
    ],
  },
  {
    id: 'love-unity',
    name: 'Yêu thương & Đoàn kết',
    icon: '❤️',
    slogans: [
      { en: 'Spread Love, Spread Kindness', ipa: '/sprɛd lʌv, sprɛd ˈkaɪndnəs/', vi: 'Lan tỏa yêu thương, lan tỏa lòng tốt' },
      { en: 'Kindness Makes the World Better', ipa: '/ˈkaɪndnəs meɪks ðə wɜːrld ˈbɛtər/', vi: 'Lòng tốt làm thế giới tốt đẹp hơn' },
      { en: 'Friends Are Treasures', ipa: '/frɛndz ɑːr ˈtrɛʒərz/', vi: 'Bạn bè là kho báu' },
      { en: 'United We Stand, Divided We Fall', ipa: '/juˈnaɪtɪd wiː stænd, dɪˈvaɪdɪd wiː fɔːl/', vi: 'Đoàn kết thì sống, chia rẽ thì rụng' },
      { en: 'Love One Another', ipa: '/lʌv wʌn əˈnʌðər/', vi: 'Hãy yêu thương nhau' },
      { en: 'Together Is Better', ipa: '/təˈɡɛðər ɪz ˈbɛtər/', vi: 'Cùng nhau thì tốt hơn' },
      { en: 'A Smile Can Change the World', ipa: '/ə smaɪl kæn tʃeɪndʒ ðə wɜːrld/', vi: 'Một nụ cười có thể thay đổi thế giới' },
      { en: 'Share, Care, and Be Fair', ipa: '/ʃɛr, kɛr, ænd biː fɛr/', vi: 'Chia sẻ, quan tâm và công bằng' },
      { en: 'Helping Hands, Happy Hearts', ipa: '/ˈhɛlpɪŋ hændz, ˈhæpi hɑːrts/', vi: 'Bàn tay giúp đỡ, trái tim hạnh phúc' },
      { en: 'One Team, One Dream', ipa: '/wʌn tiːm, wʌn driːm/', vi: 'Một đội, một ước mơ' },
      { en: 'Be a Friend to Everyone', ipa: '/biː ə frɛnd tuː ˈɛvriˌwʌn/', vi: 'Hãy là bạn với tất cả mọi người' },
      { en: 'We Rise by Lifting Others', ipa: '/wiː raɪz baɪ ˈlɪftɪŋ ˈʌðərz/', vi: 'Chúng ta vươn lên bằng cách nâng đỡ người khác' },
    ],
  },
  {
    id: 'dreams',
    name: 'Ước mơ & Khát vọng',
    icon: '🌟',
    slogans: [
      { en: 'Reach for the Stars', ipa: '/riːtʃ fɔːr ðə stɑːrz/', vi: 'Hãy vươn tới các vì sao' },
      { en: 'Dream It, Believe It, Achieve It', ipa: '/driːm ɪt, bɪˈliːv ɪt, əˈtʃiːv ɪt/', vi: 'Mơ ước, tin tưởng, đạt được' },
      { en: 'The Sky Is the Limit', ipa: '/ðə skaɪ ɪz ðə ˈlɪmɪt/', vi: 'Bầu trời là giới hạn' },
      { en: 'Make Your Dreams Come True', ipa: '/meɪk jɔːr driːmz kʌm truː/', vi: 'Hãy biến ước mơ thành hiện thực' },
      { en: 'You Can Do Anything', ipa: '/juː kæn duː ˈɛniˌθɪŋ/', vi: 'Bạn có thể làm bất cứ điều gì' },
      { en: 'Shoot for the Moon', ipa: '/ʃuːt fɔːr ðə muːn/', vi: 'Hãy hướng tới mặt trăng' },
      { en: 'Be the Change You Wish to See', ipa: '/biː ðə tʃeɪndʒ juː wɪʃ tuː siː/', vi: 'Hãy là sự thay đổi mà bạn muốn thấy' },
      { en: 'Dare to Dream', ipa: '/dɛr tuː driːm/', vi: 'Dám ước mơ' },
      { en: 'Your Future Starts Here', ipa: '/jɔːr ˈfjuːtʃər stɑːrts hɪr/', vi: 'Tương lai bắt đầu từ đây' },
      { en: 'Imagine, Create, Inspire', ipa: '/ɪˈmædʒɪn, kriˈeɪt, ɪnˈspaɪər/', vi: 'Tưởng tượng, sáng tạo, truyền cảm hứng' },
    ],
  },
  {
    id: 'learning',
    name: 'Học tập & Khám phá',
    icon: '📚',
    slogans: [
      { en: 'Curiosity Is the Engine of Learning', ipa: '/ˌkjʊriˈɑːsəti ɪz ðə ˈɛndʒɪn ʌv ˈlɜːrnɪŋ/', vi: 'Sự tò mò là động cơ của việc học' },
      { en: 'Ask Questions, Find Answers', ipa: '/æsk ˈkwɛstʃənz, faɪnd ˈænsərz/', vi: 'Hỏi câu hỏi, tìm câu trả lời' },
      { en: 'Every Day Is a Chance to Learn', ipa: '/ˈɛvri deɪ ɪz ə tʃæns tuː lɜːrn/', vi: 'Mỗi ngày là cơ hội để học hỏi' },
      { en: 'Reading Opens Doors', ipa: '/ˈriːdɪŋ ˈoʊpənz dɔːrz/', vi: 'Đọc sách mở ra nhiều cánh cửa' },
      { en: 'Think Big, Learn More', ipa: '/θɪŋk bɪɡ, lɜːrn mɔːr/', vi: 'Nghĩ lớn, học nhiều hơn' },
      { en: 'Mistakes Help Us Grow', ipa: '/mɪˈsteɪks hɛlp ʌs ɡroʊ/', vi: 'Sai lầm giúp ta trưởng thành' },
      { en: 'Explore, Discover, Learn', ipa: '/ɪkˈsplɔːr, dɪˈskʌvər, lɜːrn/', vi: 'Khám phá, phát hiện, học hỏi' },
      { en: 'A Book Is a Friend for Life', ipa: '/ə bʊk ɪz ə frɛnd fɔːr laɪf/', vi: 'Một cuốn sách là người bạn cả đời' },
      { en: 'Study Smart, Not Just Hard', ipa: '/ˈstʌdi smɑːrt, nɑːt dʒʌst hɑːrd/', vi: 'Học thông minh, không chỉ học chăm' },
      { en: 'The More You Learn, the More You Earn', ipa: '/ðə mɔːr juː lɜːrn, ðə mɔːr juː ɜːrn/', vi: 'Học càng nhiều, thu hoạch càng lớn' },
      { en: 'Knowledge Is a Treasure', ipa: '/ˈnɑːlɪdʒ ɪz ə ˈtrɛʒər/', vi: 'Kiến thức là kho báu' },
      { en: 'Open Your Mind, Open Your World', ipa: '/ˈoʊpən jɔːr maɪnd, ˈoʊpən jɔːr wɜːrld/', vi: 'Mở rộng tâm trí, mở rộng thế giới' },
      { en: 'Learn from Yesterday, Live for Today', ipa: '/lɜːrn frʌm ˈjɛstərdeɪ, lɪv fɔːr təˈdeɪ/', vi: 'Học từ hôm qua, sống cho hôm nay' },
      { en: 'Education Plants Seeds of Knowledge', ipa: '/ˌɛdʒʊˈkeɪʃən plænts siːdz ʌv ˈnɑːlɪdʒ/', vi: 'Giáo dục gieo mầm kiến thức' },
    ],
  },
  {
    id: 'effort',
    name: 'Nỗ lực & Kiên trì',
    icon: '💪',
    slogans: [
      { en: 'Never Give Up', ipa: '/ˈnɛvər ɡɪv ʌp/', vi: 'Không bao giờ bỏ cuộc' },
      { en: 'Hard Work Pays Off', ipa: '/hɑːrd wɜːrk peɪz ɔːf/', vi: 'Làm việc chăm chỉ sẽ được đền đáp' },
      { en: 'Practice Makes Perfect', ipa: '/ˈpræktɪs meɪks ˈpɜːrfɪkt/', vi: 'Luyện tập tạo nên hoàn hảo' },
      { en: 'Try, Try, Try Again', ipa: '/traɪ, traɪ, traɪ əˈɡɛn/', vi: 'Cố gắng, cố gắng, cố gắng thêm lần nữa' },
      { en: 'Winners Never Quit', ipa: '/ˈwɪnərz ˈnɛvər kwɪt/', vi: 'Người chiến thắng không bao giờ bỏ cuộc' },
      { en: 'Keep Going, Keep Growing', ipa: '/kiːp ˈɡoʊɪŋ, kiːp ˈɡroʊɪŋ/', vi: 'Tiếp tục tiến bước, tiếp tục phát triển' },
      { en: 'Success Comes from Effort', ipa: '/səkˈsɛs kʌmz frʌm ˈɛfərt/', vi: 'Thành công đến từ nỗ lực' },
      { en: 'Fall Seven Times, Stand Up Eight', ipa: '/fɔːl ˈsɛvən taɪmz, stænd ʌp eɪt/', vi: 'Ngã bảy lần, đứng dậy tám lần' },
      { en: 'Every Expert Was Once a Beginner', ipa: '/ˈɛvri ˈɛkspɜːrt wʌz wʌns ə bɪˈɡɪnər/', vi: 'Mọi chuyên gia đều từng là người mới bắt đầu' },
      { en: 'Push Yourself to Be the Best', ipa: '/pʊʃ jɔːrˈsɛlf tuː biː ðə bɛst/', vi: 'Thúc đẩy bản thân để trở thành xuất sắc nhất' },
      { en: 'Difficult Roads Lead to Beautiful Destinations', ipa: '/ˈdɪfɪkəlt roʊdz liːd tuː ˈbjuːtɪfəl ˌdɛstɪˈneɪʃənz/', vi: 'Con đường khó khăn dẫn đến đích đẹp đẽ' },
    ],
  },
  {
    id: 'reading',
    name: 'Góc đọc sách & Thư viện',
    icon: '📖',
    slogans: [
      { en: 'Read More, Learn More', ipa: '/riːd mɔːr, lɜːrn mɔːr/', vi: 'Đọc nhiều hơn, học nhiều hơn' },
      { en: 'Books Are Our Best Friends', ipa: '/bʊks ɑːr aʊər bɛst frɛndz/', vi: 'Sách là người bạn tốt nhất' },
      { en: 'A Reader Lives a Thousand Lives', ipa: '/ə ˈriːdər lɪvz ə ˈθaʊzənd laɪvz/', vi: 'Người đọc sống ngàn cuộc đời' },
      { en: 'Reading Is Dreaming with Open Eyes', ipa: '/ˈriːdɪŋ ɪz ˈdriːmɪŋ wɪð ˈoʊpən aɪz/', vi: 'Đọc sách là mơ với đôi mắt mở' },
      { en: 'The Library Is a Gateway to the World', ipa: '/ðə ˈlaɪbrɛri ɪz ə ˈɡeɪtweɪ tuː ðə wɜːrld/', vi: 'Thư viện là cổng vào thế giới' },
      { en: 'Every Book Is an Adventure', ipa: '/ˈɛvri bʊk ɪz ən ədˈvɛntʃər/', vi: 'Mỗi cuốn sách là một cuộc phiêu lưu' },
      { en: 'Feed Your Mind, Read a Book', ipa: '/fiːd jɔːr maɪnd, riːd ə bʊk/', vi: 'Nuôi dưỡng trí óc, hãy đọc sách' },
      { en: 'Words Have the Power to Change Us', ipa: '/wɜːrdz hæv ðə ˈpaʊər tuː tʃeɪndʒ ʌs/', vi: 'Ngôn từ có sức mạnh thay đổi chúng ta' },
      { en: 'One Book at a Time', ipa: '/wʌn bʊk æt ə taɪm/', vi: 'Từng cuốn sách một' },
      { en: 'Reading Is a Superpower', ipa: '/ˈriːdɪŋ ɪz ə ˈsuːpərˌpaʊər/', vi: 'Đọc sách là siêu năng lực' },
      { en: 'Unlock Your Imagination with Books', ipa: '/ʌnˈlɑːk jɔːr ɪˌmædʒɪˈneɪʃən wɪð bʊks/', vi: 'Mở khóa trí tưởng tượng với sách' },
    ],
  },
  {
    id: 'discipline',
    name: 'Kỷ luật & Trách nhiệm',
    icon: '🏅',
    slogans: [
      { en: 'Respect Yourself, Respect Others', ipa: '/rɪˈspɛkt jɔːrˈsɛlf, rɪˈspɛkt ˈʌðərz/', vi: 'Tôn trọng bản thân, tôn trọng người khác' },
      { en: 'Be Responsible, Be Reliable', ipa: '/biː rɪˈspɑːnsəbl, biː rɪˈlaɪəbl/', vi: 'Hãy có trách nhiệm, hãy đáng tin cậy' },
      { en: 'Rules Help Us Stay Safe', ipa: '/ruːlz hɛlp ʌs steɪ seɪf/', vi: 'Nội quy giúp chúng ta an toàn' },
      { en: 'Discipline Is the Bridge to Success', ipa: '/ˈdɪsəplɪn ɪz ðə brɪdʒ tuː səkˈsɛs/', vi: 'Kỷ luật là cầu nối đến thành công' },
      { en: 'Do the Right Thing', ipa: '/duː ðə raɪt θɪŋ/', vi: 'Hãy làm điều đúng đắn' },
      { en: 'Own Your Actions', ipa: '/oʊn jɔːr ˈækʃənz/', vi: 'Chịu trách nhiệm cho hành động của mình' },
      { en: 'Good Habits Build Great Futures', ipa: '/ɡʊd ˈhæbɪts bɪld ɡreɪt ˈfjuːtʃərz/', vi: 'Thói quen tốt xây dựng tương lai tuyệt vời' },
      { en: 'Be on Time, Be Prepared', ipa: '/biː ɑːn taɪm, biː prɪˈpɛrd/', vi: 'Đúng giờ, sẵn sàng' },
      { en: 'Integrity Is Doing the Right Thing When No One Is Watching', ipa: '/ɪnˈtɛɡrəti ɪz ˈduːɪŋ ðə raɪt θɪŋ wɛn noʊ wʌn ɪz ˈwɑːtʃɪŋ/', vi: 'Chính trực là làm điều đúng khi không ai nhìn' },
    ],
  },
  {
    id: 'environment',
    name: 'Bảo vệ môi trường',
    icon: '🌿',
    slogans: [
      { en: 'Go Green, Save the Earth', ipa: '/ɡoʊ ɡriːn, seɪv ðə ɜːrθ/', vi: 'Sống xanh, cứu Trái Đất' },
      { en: 'Reduce, Reuse, Recycle', ipa: '/rɪˈduːs, riːˈjuːz, riːˈsaɪkl/', vi: 'Giảm thiểu, tái sử dụng, tái chế' },
      { en: 'Love Our Planet', ipa: '/lʌv aʊər ˈplænɪt/', vi: 'Hãy yêu hành tinh của chúng ta' },
      { en: 'Every Drop Counts', ipa: '/ˈɛvri drɑːp kaʊnts/', vi: 'Mỗi giọt nước đều quý giá' },
      { en: 'Plant a Tree, Grow a Future', ipa: '/plænt ə triː, ɡroʊ ə ˈfjuːtʃər/', vi: 'Trồng một cái cây, trồng một tương lai' },
      { en: 'Keep Our School Clean and Green', ipa: '/kiːp aʊər skuːl kliːn ænd ɡriːn/', vi: 'Giữ trường học sạch và xanh' },
      { en: 'The Earth Does Not Belong to Us, We Belong to the Earth', ipa: '/ðə ɜːrθ dʌz nɑːt bɪˈlɔːŋ tuː ʌs, wiː bɪˈlɔːŋ tuː ðə ɜːrθ/', vi: 'Trái Đất không thuộc về ta, ta thuộc về Trái Đất' },
      { en: 'Save Water, Save Life', ipa: '/seɪv ˈwɔːtər, seɪv laɪf/', vi: 'Tiết kiệm nước, cứu sống cuộc sống' },
      { en: 'Be a Hero, Save the Environment', ipa: '/biː ə ˈhɪroʊ, seɪv ðə ɪnˈvaɪrənmənt/', vi: 'Hãy là anh hùng, bảo vệ môi trường' },
    ],
  },
  {
    id: 'happy-class',
    name: 'Lớp học hạnh phúc',
    icon: '😊',
    slogans: [
      { en: 'Happy Classroom, Happy Students', ipa: '/ˈhæpi ˈklæsruːm, ˈhæpi ˈstuːdənts/', vi: 'Lớp học vui, học sinh vui' },
      { en: 'Laugh, Learn, and Love', ipa: '/læf, lɜːrn, ænd lʌv/', vi: 'Cười, học và yêu thương' },
      { en: 'Our Classroom, Our Home', ipa: '/aʊər ˈklæsruːm, aʊər hoʊm/', vi: 'Lớp học là nhà của chúng ta' },
      { en: 'Where Learning Meets Fun', ipa: '/wɛr ˈlɜːrnɪŋ miːts fʌn/', vi: 'Nơi việc học gặp niềm vui' },
      { en: 'Smile, You Are in a Great Classroom', ipa: '/smaɪl, juː ɑːr ɪn ə ɡreɪt ˈklæsruːm/', vi: 'Hãy cười, bạn đang ở một lớp học tuyệt vời' },
      { en: 'Learning Is Fun When We Work Together', ipa: '/ˈlɜːrnɪŋ ɪz fʌn wɛn wiː wɜːrk təˈɡɛðər/', vi: 'Học vui khi cùng nhau làm việc' },
      { en: 'Create Joy in Every Lesson', ipa: '/kriˈeɪt dʒɔɪ ɪn ˈɛvri ˈlɛsn/', vi: 'Tạo niềm vui trong mỗi bài học' },
      { en: 'A Classroom Full of Smiles', ipa: '/ə ˈklæsruːm fʊl ʌv smaɪlz/', vi: 'Một lớp học tràn ngập nụ cười' },
    ],
  },
];
