// SINH TỰ ĐỘNG bằng tools/make_question_data.py mai-hac-de — KHÔNG sửa tay.
// Nguồn: assets/question/mai-hac-de-question.json (Excel của team). Pool + câu loại: docs/SUTA_MHD_TASK_00.md §3.3.
// Câu team loại hẳn: không có.

export const QUESTIONS = {
  1: {stt: 1, question: "Mai Hắc Đế có tên thường gọi là gì?", answers: ["Mai Thúc Huy", "Mai Kỳ Sơn", "Phùng Hưng", "Mai Thúc Loan"], correct: 3, explain: "Sử Việt và sách giáo khoa gọi ông là Mai Thúc Loan."},
  2: {stt: 2, question: "Cựu Đường thư, phần truyện Dương Tư Húc, chép tên thủ lĩnh An Nam xưng Hắc Đế là gì?", answers: ["Mai Thúc Huy", "Mai Kỳ Sơn", "Mai Huyền Thành", "Mai Hoàn"], correct: 2, explain: "Sử nhà Đường chép nhiều tên khác nhau: Mai Huyền Thành, Mai Thúc Loan."},
  3: {stt: 3, question: "Mai Thúc Loan tự xưng danh hiệu gì?", answers: ["Dạ Trạch Vương", "Hắc Đế", "Bố Cái Đại Vương", "Nam Việt Đế"], correct: 1, explain: "Cả sử Trung Hoa và sử Việt đều chép ông xưng Hắc Đế."},
  4: {stt: 4, question: "Danh hiệu \"Hắc Đế\" có nghĩa là gì?", answers: ["Vua Biển", "Vua Đen", "Vua Núi", "Vua Rồng"], correct: 1, explain: "\"Hắc\" là màu đen, \"Đế\" là vua."},
  5: {stt: 5, question: "Sử triều Nguyễn giải thích tên \"Hắc Đế\" là do đâu?", answers: ["Vì ông có nước da đen", "Vì ông hay đánh ban đêm", "Vì quân Đường đặt tên", "Vì ông sinh ở núi đá đen"], correct: 0, explain: "Sử triều Nguyễn liên hệ tên gọi này với nước da đen của ông."},
  6: {stt: 6, question: "Khi Mai Thúc Loan khởi nghĩa, nước ta đang bị triều đại nào đô hộ?", answers: ["Nhà Hán", "Nhà Lương", "Nhà Minh", "Nhà Đường"], correct: 3, explain: "Khởi nghĩa chống ách đô hộ của nhà Đường."},
  7: {stt: 7, question: "Vua nhà Đường sai tướng đi đánh Mai Thúc Loan là ai?", answers: ["Đường Thái Tông", "Đường Cao Tông", "Đường Huyền Tông", "Đường Trung Tông"], correct: 2, explain: "Việc này chép trong bản kỷ Huyền Tông của Cựu Đường thư."},
  8: {stt: 8, question: "Sử nhà Đường chép cuộc nổi dậy của Mai Thúc Loan vào niên hiệu nào?", answers: ["Trinh Quán", "Vĩnh Huy", "Khai Nguyên", "Thiên Bảo"], correct: 2, explain: "Sử Đường ghi \"đầu niên hiệu Khai Nguyên\" và năm Khai Nguyên thứ 10."},
  9: {stt: 9, question: "Sử nhà Đường gọi vùng đất nước ta khi đó là gì?", answers: ["Vạn Xuân", "An Nam", "Đại Cồ Việt", "Văn Lang"], correct: 1, explain: "Sử Đường chép Mai Thúc Loan là thủ lĩnh ở An Nam."},
  10: {stt: 10, question: "Trị sở của An Nam đô hộ phủ thời đó ở đâu?", answers: ["Tống Bình", "Luy Lâu", "Cổ Loa", "Mê Linh"], correct: 0, explain: "Tống Bình là trị sở chính quyền đô hộ, nay thuộc Hà Nội."},
  11: {stt: 11, question: "Thành Tống Bình ngày nay thuộc thành phố nào?", answers: ["Vinh", "Huế", "Hải Phòng", "Hà Nội"], correct: 3, explain: "Tống Bình nằm ở vùng Hà Nội ngày nay."},
  12: {stt: 12, question: "Theo Tân Đường thư, quan An Nam đại đô hộ thời đó là ai?", answers: ["Tô Định", "Tiêu Tư", "Mã Viện", "Quang Sở Khách"], correct: 3, explain: "Tân Đường thư chép Dương Tư Húc hợp quân với đại đô hộ Quang Sở Khách."},
  13: {stt: 13, question: "Theo sách Lịch sử 6 (Kết nối tri thức), khởi nghĩa Mai Thúc Loan bùng nổ năm nào?", answers: ["722", "766", "713", "938"], correct: 2, explain: "Sách ghi bùng nổ năm 713. Sử cũ như Toàn thư chép việc này ở năm 722."},
  14: {stt: 14, question: "Nhà Đường đem quân đàn áp, khiến khởi nghĩa thất bại vào năm nào?", answers: ["713", "722", "766", "791"], correct: 1, explain: "Cựu Đường thư chép việc sai Dương Tư Húc đi đánh vào năm Khai Nguyên 10 (722)."},
  15: {stt: 15, question: "Đại Việt sử ký toàn thư chép việc Mai Thúc Loan xưng Hắc Đế vào năm nào?", answers: ["722", "713", "544", "938"], correct: 0, explain: "Toàn thư ghi năm Nhâm Tuất, Khai Nguyên 10, tức năm 722."},
  16: {stt: 16, question: "Theo sách Lịch sử 6, chính quyền độc lập của Mai Thúc Loan giữ được bao lâu?", answers: ["Gần 10 năm", "Khoảng 1 năm", "Hơn 20 năm", "Khoảng 50 năm"], correct: 0, explain: "Từ 713 đến 722, gần 10 năm."},
  17: {stt: 17, question: "Sau khi làm chủ Hoan Châu, nghĩa quân tiến ra Bắc làm chủ thành nào?", answers: ["Long Biên", "Luy Lâu", "Cổ Loa", "Tống Bình"], correct: 3, explain: "Nghĩa quân đánh đuổi chính quyền đô hộ, làm chủ Tống Bình."},
  18: {stt: 18, question: "Tướng nhà Đường được sai đi đàn áp Mai Thúc Loan là ai?", answers: ["Trần Bá Tiên", "Lục Dận", "Dương Tư Húc", "Tô Định"], correct: 2, explain: "Sử Đường và sách giáo khoa đều nêu Dương Tư Húc."},
  19: {stt: 19, question: "Dương Tư Húc vốn là người thế nào trong triều Đường?", answers: ["Một thư sinh đỗ đạt", "Một hoạn quan cầm quân", "Một hoàng tử", "Một thương nhân"], correct: 1, explain: "Ông là hoạn quan, giữ chức kiêm Nội thị."},
  20: {stt: 20, question: "Theo Cựu Đường thư, Dương Tư Húc chiêu mộ được bao nhiêu quân ở Lĩnh Nam?", answers: ["Khoảng 1 vạn", "Hơn 10 vạn", "Khoảng 3 vạn", "Hơn 50 vạn"], correct: 1, explain: "Ông mộ con em các thủ lĩnh địa phương, được hơn mười vạn người."},
  21: {stt: 21, question: "Quân Dương Tư Húc đi theo đường cũ của vị tướng nào để đánh bất ngờ?", answers: ["Mã Viện", "Triệu Đà", "Lưu Phương", "Trần Bá Tiên"], correct: 0, explain: "Sử Đường chép đi theo đường cũ của Phục Ba tướng quân Mã Viện."},
  22: {stt: 22, question: "Dương Tư Húc hợp quân với ai để đánh Mai Thúc Loan?", answers: ["Tiêu Tư", "Lục Dận", "Trương Phụ", "Quang Sở Khách"], correct: 3, explain: "Tân Đường thư chép ông hợp quân với đại đô hộ Quang Sở Khách."},
  23: {stt: 23, question: "Sau khi thắng, quân Đường làm gì với xác nghĩa quân?", answers: ["Thả trôi xuống sông", "Đem về Trường An", "Chất thành gò kinh quan để thị uy", "Trả lại cho gia đình"], correct: 2, explain: "Sử Đường đều chép việc chất xác thành gò gọi là kinh quan."},
  24: {stt: 24, question: "Theo Cựu Đường thư, thủ lĩnh Mai Huyền Thành có kết cục thế nào?", answers: ["Chạy sang Lâm Ấp", "Đầu hàng và được phong quan", "Bị bắt và chém trước trận", "Mất tích trên biển"], correct: 2, explain: "Đây là ghi chép của sử nhà Đường. Dân gian Việt lại kể khác."},
  25: {stt: 25, question: "Dân gian Việt kể Mai Hắc Đế mất như thế nào?", answers: ["Tử trận trên sông Hồng", "Lui vào rừng rồi lâm bệnh qua đời", "Tự vẫn ở thành Tống Bình", "Chết già ở quê nhà"], correct: 1, explain: "Đây là lời truyền của dân gian, khác với sử nhà Đường."},
  26: {stt: 26, question: "Tương truyền ai nối ngôi Mai Hắc Đế để tiếp tục chống Đường?", answers: ["Mai Thúc Huy (Mai Thiếu Đế)", "Khúc Thừa Dụ", "Phùng Hưng", "Dương Đình Nghệ"], correct: 0, explain: "Tương truyền con ông là Mai Thúc Huy được tôn lên, gọi là Mai Thiếu Đế."},
  27: {stt: 27, question: "Đại Việt sử ký toàn thư gọi Mai Thúc Loan là gì?", answers: ["Thánh vương", "Đại vương", "Quốc công", "Tướng giặc"], correct: 3, explain: "Toàn thư dùng chữ này vì chép theo sử nhà Đường."},
  28: {stt: 28, question: "Sử gia nào phản đối việc gọi Mai Thúc Loan là \"tướng giặc\"?", answers: ["Lê Văn Hưu", "Ngô Sĩ Liên", "Tư Mã Quang", "Ngô Thì Sĩ"], correct: 3, explain: "Ngô Thì Sĩ, tác giả Đại Việt sử ký tiền biên, cho cách gọi đó là sai."},
  29: {stt: 29, question: "GS Phan Huy Lê nhận định thế nào về chuyện cống vải gây ra khởi nghĩa?", answers: ["Đã được sử nhà Đường xác nhận", "Có ghi trong Đại Việt sử ký toàn thư", "Chưa có bằng chứng tin cậy", "Do chính Mai Thúc Loan kể lại"], correct: 2, explain: "Ông cho rằng nguyên nhân sâu xa là sự bóc lột của ách đô hộ."},
  30: {stt: 30, question: "Chuyện dân phu gánh vải cống nạp trong khởi nghĩa Mai Thúc Loan thuộc loại tư liệu nào?", answers: ["Chép trong Cựu Đường thư", "Truyền thuyết dân gian", "Chép trong Toàn thư", "Khắc trên bia đời Đường"], correct: 1, explain: "Các quốc sử không chép chuyện này, nhiều nhà sử học không công nhận."},
  31: {stt: 31, question: "Theo GS Phan Huy Lê, nguyên nhân sâu xa của khởi nghĩa là gì?", answers: ["Sự áp bức, bóc lột của chính quyền đô hộ", "Tranh chấp giữa các dòng họ", "Mất mùa do hạn hán", "Nhà Đường đổi tên nước"], correct: 0, explain: "Ông bác nguyên nhân cống vải và nhấn vào ách bóc lột nói chung."},
  32: {stt: 32, question: "Theo sách Lịch sử 6, ý nghĩa của khởi nghĩa Mai Thúc Loan là gì?", answers: ["Cổ vũ tinh thần giành độc lập hoàn toàn đầu thế kỉ X", "Chấm dứt vĩnh viễn thời Bắc thuộc", "Lập ra nhà Đinh", "Mở đầu nhà Lý"], correct: 0, explain: "Khởi nghĩa để lại kinh nghiệm cho các cuộc đấu tranh sau này."},
  33: {stt: 33, question: "Lễ hội đền Vua Mai ở Nam Đàn tổ chức vào dịp nào?", answers: ["Rằm tháng Tám", "Mùng 10 tháng Ba", "Tết Đoan Ngọ", "Rằm tháng Giêng"], correct: 3, explain: "Lễ hội thường diễn ra từ 13 đến 15 tháng Giêng âm lịch."},
  34: {stt: 34, question: "Đền thờ Vua Mai Hắc Đế được xếp hạng di tích nào?", answers: ["Di sản thiên nhiên thế giới", "Di tích cấp huyện", "Di tích quốc gia đặc biệt", "Bảo tàng tư nhân"], correct: 2, explain: "Lễ đón bằng xếp hạng tổ chức đầu năm 2023."},
  35: {stt: 35, question: "Ở lễ hội đền Vua Mai có môn thi truyền thống nào dưới chân núi Đụn?", answers: ["Đua thuyền", "Đấu vật", "Chọi trâu", "Bắn nỏ"], correct: 1, explain: "Sới vật dưới chân núi Đụn thu hút đông người xem."},
  36: {stt: 36, question: "Sách cũ chép gốc gia đình Mai Thúc Loan ở vùng nào?", answers: ["Mê Linh (Hà Nội)", "Mai Phụ (Hà Tĩnh)", "Chu Diên (Hưng Yên)", "Đường Lâm (Hà Nội)"], correct: 1, explain: "Mai Phụ là vùng ven biển Hà Tĩnh ngày nay."},
  37: {stt: 37, question: "Tương truyền gia đình bên mẹ Mai Thúc Loan ở Mai Phụ làm nghề gì?", answers: ["Làm muối", "Đúc đồng", "Dệt lụa", "Làm gốm"], correct: 0, explain: "Mai Phụ là vùng làm muối ven biển."},
  38: {stt: 38, question: "Tương truyền Mai Thúc Loan lớn lên ở vùng nào?", answers: ["Thạch Hà (Hà Tĩnh)", "Hoa Lư (Ninh Bình)", "Chu Diên (Hưng Yên)", "Nam Đàn (Nghệ An)"], correct: 3, explain: "Tương truyền mẹ con ông dời về Ngọc Trừng, vùng Nam Đàn."},
  39: {stt: 39, question: "Tương truyền ai nuôi Mai Thúc Loan sau khi ông mồ côi?", answers: ["Phùng Hạp Khanh", "Tiết Anh", "Đinh Thế", "Hoắc Đan"], correct: 2, explain: "Đinh Thế là bạn của cha ông, sau gả con gái cho ông."},
  40: {stt: 40, question: "Tương truyền thuở trẻ Mai Thúc Loan nổi tiếng với môn võ nào?", answers: ["Bắn cung", "Đấu kiếm", "Đô vật", "Cưỡi ngựa"], correct: 2, explain: "Tương truyền ông mở lò vật để tập hợp trai tráng."},
  41: {stt: 41, question: "Khởi nghĩa Mai Thúc Loan bắt đầu từ vùng nào?", answers: ["Giao Châu", "Hoan Châu", "Phong Châu", "Ái Châu"], correct: 1, explain: "Quân khởi nghĩa nhanh chóng làm chủ vùng Hoan Châu."},
  42: {stt: 42, question: "Vùng Hoan Châu nay thuộc địa phương nào?", answers: ["Nghệ An – Hà Tĩnh", "Thanh Hóa – Ninh Bình", "Quảng Nam – Đà Nẵng", "Hà Nội – Bắc Ninh"], correct: 0, explain: "Sách giáo khoa ghi Hoan Châu nay thuộc Nghệ An – Hà Tĩnh."},
  43: {stt: 43, question: "Mai Thúc Loan xây thành nào làm quốc đô?", answers: ["Thành Cổ Loa", "Thành Hoa Lư", "Thành Đại La", "Thành Vạn An"], correct: 3, explain: "Ông xưng đế và xây thành Vạn An làm quốc đô."},
  44: {stt: 44, question: "Tên kinh đô Vạn An được cho là để đối chọi với kinh đô nào của nhà Đường?", answers: ["Lạc Dương", "Kiến Khang", "Biện Kinh", "Trường An"], correct: 3, explain: "Một số nghiên cứu cho rằng tên này đối lại với Trường An."},
  45: {stt: 45, question: "Dãy núi nào được nhắc đến là căn cứ cuối cùng của nghĩa quân?", answers: ["Tam Đảo", "Lam Sơn", "Hùng Sơn", "Yên Tử"], correct: 2, explain: "Hùng Sơn còn gọi là núi Đụn, ở Nam Đàn."},
  46: {stt: 46, question: "Sử nhà Đường chép Mai Thúc Loan liên kết với hai nước nào?", answers: ["Nam Chiếu và Lâm Ấp", "Lâm Ấp và Chân Lạp", "Chân Lạp và Nam Hán", "Nam Hán và Nam Chiếu"], correct: 1, explain: "Cựu Đường thư, Tân Đường thư và Toàn thư đều nêu hai nước này."},
  47: {stt: 47, question: "Ngoài Lâm Ấp và Chân Lạp, Tân Đường thư còn nêu tên nước nào?", answers: ["Kim Lân", "Nam Chiếu", "Phù Nam", "Cao Ly"], correct: 0, explain: "Tân Đường thư thêm nước Kim Lân."},
  48: {stt: 48, question: "Theo Tân Đường thư, Mai Thúc Loan huy động dân chúng của bao nhiêu châu?", answers: ["32 châu", "5 châu", "12 châu", "64 châu"], correct: 0, explain: "Sách chép ông tập hợp dân 32 châu."},
  49: {stt: 49, question: "Hai bộ sử ghi số quân của Mai Thúc Loan khác nhau thế nào?", answers: ["Tân Đường thư 10 vạn, Toàn thư 5 vạn", "Cả hai đều ghi 32 vạn", "Cả hai đều ghi 100 vạn", "Tân Đường thư 40 vạn, Toàn thư 30 vạn"], correct: 3, explain: "GS Phan Huy Lê cho rằng các con số này có thể bị thổi phồng."},
  50: {stt: 50, question: "Theo Việt điện u linh bản tân đính, ai được cử đi liên lạc với hai nước phiên?", answers: ["Phùng Hưng và Phùng Hải", "Mai Thúc Huy và Mai Kỳ Sơn", "Tiết Anh và Hoắc Đan", "Đinh Thế và Thôi Thặng"], correct: 2, explain: "Bài của Lê Thái Dũng dẫn tư liệu này, sử nhà Đường không chép."},
};

// Màn 1: mỗi lượt rút ngẫu nhiên QUIZ.level1Count câu trong bộ này (config.js).
export const LEVEL1_QUESTION_POOL = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35];

// Màn 2: câu hỏi chặn đường trước mỗi NPC — rút 1 câu trong bộ của NPC đó.
export const NPC_QUESTION_POOLS = {
  maThi: [36, 37, 38, 39, 40],
  thucBao: [41, 42, 43, 44, 45],
  suGia: [46, 47, 48, 49, 50]
};
