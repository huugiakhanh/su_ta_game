// Bộ câu hỏi chương Trưng Trắc — SOURCE OF TRUTH: file "DATA các nhân vật.xlsx",
// sheet "1 Trưng trắc" (team gửi 29/09/2026), cột STT / Câu hỏi / Đáp án A–D /
// Đáp án đúng / Giải thích ngắn gọn. Chép NGUYÊN VĂN bằng script (không gõ tay),
// không viết lại; nghi sai thì hỏi team (TT-QUIZ-01).
//   stt      số thứ tự trong sheet.
//   answers  đúng thứ tự A–D của sheet; dialogue.js xáo khi hiện.
//   correct  chỉ số đáp án đúng trong `answers` (0 = A).
// Chỉ chép các câu ĐANG DÙNG (team duyệt 29/09): bộ màn 1 = thời kỳ trước/trong
// khởi nghĩa; bộ màn 2 = câu gắn với từng NPC. Không dùng: câu về Mã Viện/Lãng
// Bạc/năm 43/hậu thế (15–17, 19–22, 25, 28, 33, 34, 37, 38, 40, 42, 48, 49),
// sau chiến thắng (13, 47), câu 41 (đáp án lưu dạng số ngày Excel + nội dung
// đáng ngờ — chờ team).

export const QUESTIONS = {
  1: {stt: 1, question: "Hai Bà Trưng có tên thật là gì?", answers: ["Trưng Trắc, Trưng Nhị", "Lê Chân, Bát Nàn", "Thiều Hoa, Xuân Nương", "Triệu Ẩu, Triệu Trinh"], correct: 0, explain: "Tên thật của hai chị em là Trưng Trắc và Trưng Nhị."},
  2: {stt: 2, question: "Quê quán của Hai Bà Trưng ở đâu?", answers: ["Chu Diên", "Luy Lâu", "Mê Linh", "Hoa Lư"], correct: 2, explain: "Hai bà sinh ra tại vùng Mê Linh, nay thuộc Hà Nội / Vĩnh Phúc."},
  3: {stt: 3, question: "Cha của Hai Bà Trưng giữ chức vụ gì?", answers: ["Huyện lệnh", "Lạc tướng", "Thái thú", "Thứ sử"], correct: 1, explain: "Cha của hai bà là Lạc tướng vùng Mê Linh."},
  4: {stt: 4, question: "Chồng của bà Trưng Trắc tên là gì?", answers: ["Thi Sách", "Triệu Quang Phục", "Lý Nam Đế", "Khúc Hạo"], correct: 0, explain: "Chồng bà là Thi Sách, con trai Lạc tướng vùng Chu Diên."},
  5: {stt: 5, question: "Quê hương của Thi Sách nằm ở vùng nào?", answers: ["Mê Linh", "Luy Lâu", "Giao Chỉ", "Chu Diên"], correct: 3, explain: "Thi Sách là con trai Lạc tướng Chu Diên (vùng Hưng Yên, Hà Nam ngày nay)."},
  6: {stt: 6, question: "Cuộc khởi nghĩa Hai Bà Trưng bùng nổ vào năm nào?", answers: ["Năm 40 SCN", "Năm 248 SCN", "Năm 544 SCN", "Năm 938 SCN"], correct: 0, explain: "Khởi nghĩa bùng nổ vào mùa xuân năm 40 SCN."},
  7: {stt: 7, question: "Kẻ thù chính mà cuộc khởi nghĩa Hai Bà Trưng hướng tới là tên Thái thú nào?", answers: ["Tích Quang", "Nhâm Diên", "Tô Định", "Mã Viện"], correct: 2, explain: "Thái thú Tô Định tàn ác, tham lam là nguyên nhân trực tiếp dẫn đến khởi nghĩa."},
  8: {stt: 8, question: "Lời thề nổi tiếng của bà Trưng Trắc trước khi xuất quân diễn ra tại đâu?", answers: ["Cửa sông Bạch Đằng", "Cửa sông Hát (Hát Môn)", "Đầm Dạ Trạch", "Núi Tản Viên"], correct: 1, explain: "Bà đã đọc \"Lời thề Hát Môn\" trước toàn quân tại cửa sông Hát."},
  9: {stt: 9, question: "Câu thơ: \"Một xin rửa sạch nước thù/ Hai xin đem lại nghiệp xưa họ Hùng\" nói về ai?", answers: ["Bà Triệu", "Lê Chân", "Trưng Trắc", "Ỷ Lan"], correct: 2, explain: "Đây là 2 câu đầu trong Lời thề Hát Môn của Trưng Trắc."},
  10: {stt: 10, question: "Trụ sở chính của chính quyền đô hộ nhà Hán thời điểm đó đặt tại đâu?", answers: ["Cổ Loa", "Luy Lâu", "Long Biên", "Tống Bình"], correct: 1, explain: "Luy Lâu (Bắc Ninh ngày nay) là trị sở của Thái thú Tô Định."},
  11: {stt: 11, question: "Khi quân Hai Bà Trưng tiến đánh, Thái thú Tô Định đã có hành động gì?", answers: ["Tử chiến đến cùng", "Đầu hàng và tự sát", "Cắt tóc, cạo râu trốn về nước", "Xin viện binh"], correct: 2, explain: "Tô Định hèn nhát phải cải trang lẩn trốn vào đám loạn quân chạy về Nam Hải."},
  12: {stt: 12, question: "Khởi nghĩa thắng lợi, nghĩa quân đã chiếm được bao nhiêu thành trì?", answers: ["30 thành", "65 thành", "50 thành", "100 thành"], correct: 1, explain: "Theo sử sách, nghĩa quân chiếm được 65 thành trì ở Lĩnh Nam."},
  14: {stt: 14, question: "Nữ tướng nào là người lập ra trang An Biên (Hải Phòng ngày nay)?", answers: ["Thánh Thiên", "Bát Nàn", "Lê Chân", "Xuân Nương"], correct: 2, explain: "Nữ tướng Lê Chân là người có công khai phá lập ra vùng An Biên."},
  18: {stt: 18, question: "Đặc điểm quân đội của Hai Bà Trưng phần lớn là gì?", answers: ["Kỵ binh thiết giáp", "Lính đánh thuê", "Nghĩa binh tự nguyện, nhiều nữ giới", "Quân chính quy được huấn luyện lâu năm"], correct: 2, explain: "Quân đội chủ yếu là dân chúng tự nguyện theo về, có rất nhiều nữ tướng chỉ huy."},
  23: {stt: 23, question: "Khởi nghĩa Hai Bà Trưng là cuộc khởi nghĩa lớn thứ mấy thời kỳ Bắc thuộc?", answers: ["Lần thứ 1", "Lần thứ 2", "Lần thứ 3", "Lần thứ 4"], correct: 0, explain: "Đây là cuộc khởi nghĩa quy mô lớn đầu tiên của dân tộc ta thời Bắc thuộc."},
  24: {stt: 24, question: "Một đạo lý truyền thống nổi bật được thể hiện qua Khởi nghĩa Hai Bà Trưng là gì?", answers: ["Trọng nam khinh nữ", "Nước chảy đá mòn", "Giặc đến nhà, đàn bà cũng đánh", "Đất lành chim đậu"], correct: 2, explain: "Cuộc khởi nghĩa chứng minh vai trò và sức mạnh to lớn của phụ nữ Việt Nam."},
  26: {stt: 26, question: "Tướng Bát Nàn (Vũ Thị Thục) quê ở đâu?", answers: ["Tiên La (Thái Bình)", "Mê Linh (Hà Nội)", "An Biên (Hải Phòng)", "Chu Diên (Hưng Yên)"], correct: 0, explain: "Bà Bát Nàn là vị nữ tướng xuất thân từ vùng Tiên La, Thái Bình."},
  27: {stt: 27, question: "Trước khi lấy Thi Sách, Trưng Trắc có mối quan hệ thế nào với ông?", answers: ["Không quen biết", "Bạn thanh mai trúc mã", "Mối lái do quan nhà Hán ép", "Kẻ thù"], correct: 1, explain: "Gia đình hai Lạc tướng Mê Linh và Chu Diên vốn thân thiết từ lâu."},
  29: {stt: 29, question: "Nữ tướng Thánh Thiên được giao trọng trách gì trong quân đội Hai Bà Trưng?", answers: ["Trấn giữ vùng Hợp Phố (Quảng Ninh)", "Chỉ huy thủy quân", "Hậu cần", "Trấn giữ thành Luy Lâu"], correct: 0, explain: "Bà được giao chỉ huy đạo quân tiên phong trấn giữ vùng Hợp Phố."},
  30: {stt: 30, question: "Nước ta dưới thời Hai Bà Trưng không có quốc hiệu chính thức, nhưng lãnh thổ được gọi chung là gì?", answers: ["Giao Chỉ (Lĩnh Nam)", "Vạn Xuân", "Đại Ngu", "Đại Cồ Việt"], correct: 0, explain: "Đất nước bao gồm Giao Chỉ, Cửu Chân, Nhật Nam và Hợp Phố (gọi chung là Lĩnh Nam)."},
  31: {stt: 31, question: "Cuộc khởi nghĩa của Hai Bà Trưng lật đổ ách thống trị của triều đại phong kiến nào ở Trung Quốc?", answers: ["Nhà Tần", "Nhà Tây Hán", "Nhà Đông Hán", "Nhà Đường"], correct: 2, explain: "Lúc bấy giờ nhà Đông Hán đang cai trị nước ta."},
  32: {stt: 32, question: "Thái thú Tô Định được sử sách ghi chép là người như thế nào?", answers: ["Liêm khiết, thương dân", "Tàn bạo, tham lam tiền tài", "Giỏi võ nghệ, anh dũng", "Có tài văn chương"], correct: 1, explain: "Sử chép Tô Định là kẻ \"tham lam tàn bạo\", ép dân cống nạp ngà voi, sừng tê, ngọc trai."},
  35: {stt: 35, question: "Theo truyền thuyết, Trưng Trắc đã dùng vật gì để đánh trống xuất quân?", answers: ["Dùi sừng trâu", "Tay không", "Cây gỗ lim", "Kiếm báu"], correct: 0, explain: "Truyền thuyết kể bà dùng dùi sừng trâu đánh trống đồng thúc quân."},
  36: {stt: 36, question: "Nữ tướng Lê Thị Hoa trấn giữ vùng nào trong khởi nghĩa Hai Bà Trưng?", answers: ["Lãng Bạc", "Nga Sơn (Thanh Hóa)", "Chu Diên", "Đồ Sơn"], correct: 1, explain: "Bà trấn giữ vùng Nga Sơn, chặn đánh viện binh giặc từ phía Nam."},
  39: {stt: 39, question: "Ai là người đã chém đầu Thi Sách?", answers: ["Mã Viện", "Tô Định", "Tích Quang", "Nhâm Diên"], correct: 1, explain: "Tô Định sát hại Thi Sách nhằm khủng bố tinh thần Lạc tướng hai vùng Mê Linh - Chu Diên."},
  43: {stt: 43, question: "Ý nghĩa lịch sử quan trọng nhất của khởi nghĩa Hai Bà Trưng là gì?", answers: ["Mở ra kỷ nguyên phong kiến", "Phá vỡ ách thống trị, thức tỉnh tinh thần dân tộc", "Buộc nhà Hán bồi thường", "Chiếm được Trung Quốc"], correct: 1, explain: "Đánh thức tinh thần dân tộc, khẳng định khả năng tự giải phóng của người Việt."},
  44: {stt: 44, question: "Trang phục đặc trưng của Hai Bà Trưng trong các tranh vẽ dân gian thường mặc áo màu gì?", answers: ["Đen", "Trắng", "Vàng", "Vàng hoặc Đỏ"], correct: 3, explain: "Hai Bà thường được phác họa mặc áo bào vàng hoặc đỏ, cưỡi voi chiến."},
  45: {stt: 45, question: "Nữ tướng Thiều Hoa có nguồn gốc xuất thân từ đâu?", answers: ["Quan lại", "Nông dân/Người hầu", "Hoàng tộc", "Thương nhân"], correct: 1, explain: "Bà xuất thân từ dân nghèo, đi tu rồi tập hợp dân nghèo theo Hai Bà khởi nghĩa."},
  46: {stt: 46, question: "Con voi mà Hai Bà Trưng cưỡi lúc ra trận được dân gian mô tả là voi có mấy ngà?", answers: ["1 ngà", "2 ngà", "4 ngà", "9 ngà"], correct: 1, explain: "Voi chiến bình thường có 2 ngà, gắn liền với hình tượng uy dũng của Hai Bà."},
  50: {stt: 50, question: "Chiến thắng của Hai Bà Trưng để lại bài học lớn nhất về gì cho các đời sau?", answers: ["Nghệ thuật đàm phán", "Khối đại đoàn kết toàn dân tộc", "Kỹ thuật đóng tàu", "Giao thương quốc tế"], correct: 1, explain: "Sức mạnh kết nối mọi tầng lớp, nam nữ, các vùng miền để tạo nên sức mạnh vô địch."}
};

// Màn 1: mỗi lượt rút ngẫu nhiên LEVEL1_QUIZ.count câu trong bộ này (config.js).
export const LEVEL1_QUESTION_POOL = [2, 3, 6, 7, 10, 11, 12, 18, 23, 24, 26, 29, 30, 31, 32, 35, 36, 43, 44, 45, 46, 50];

// Màn 2: câu hỏi chặn đường trước mỗi NPC — rút 1 câu trong bộ của NPC đó.
export const NPC_QUESTION_POOLS = {
  thiSach: [4, 5, 27, 39],
  leChan: [14],
  trungNhi: [1, 8, 9]
};
