# TRA CỨU + BỘ CÂU HỎI MỚI — CHƯƠNG 5 MAI HẮC ĐẾ

Ngày: 07/11/2026 • Trạng thái: **ĐÃ THAY VÀO GAME** (người dùng duyệt 07/11/2026), thay 50 câu Excel
Bản dữ liệu: `frontend/static/assets/question/mai-hac-de-question.json`. Mục 2: 4 đề xuất đã chốt 07/11/2026; Thúc Bảo còn chờ team cho biết nguồn.

## 1. Kết luận

Tôi soạn bộ 50 câu mới theo 3 nguyên tắc: chỉ hỏi điều có nguồn; chỗ các sách lệch nhau thì nêu rõ "theo sách nào"; truyền thuyết thì ghi "tương truyền". Đối chiếu nguồn cho thấy nhiều câu Excel sai hoặc không có căn cứ, và **4 điểm thiết kế chương 5 cũng bị ảnh hưởng** (mục 2).

**Độ chắc chắn:** cao với các sự kiện sử nhà Đường và sách giáo khoa cùng ghi. Trung bình với phần Toàn thư, Cương mục vì tôi đọc qua bài trích dẫn, chưa đọc bản dịch đầy đủ. Sách giáo khoa cũng đọc qua VietJack, chưa đọc bản in. Trung bình tới thấp với phần gia đình, tướng lĩnh vì chỉ có truyền thuyết và nguồn thứ cấp.

## 2. Phát hiện ảnh hưởng thiết kế chương (đã chốt theo đề xuất)

| # | Phát hiện | Ảnh hưởng | Đề xuất |
|---|---|---|---|
| 1 | **Mốc năm.** Sách giáo khoa Lịch sử 6 ghi bùng nổ 713, bị đàn áp 722. Nghệ An kỷ niệm 1310 năm (713–2023). Toàn thư, Cương mục chép 722; Lê Mạnh Chiến phản bác cách đọc "Khai Nguyên sơ" = 713 | Quyết định 6 đã đổi thẻ 713 → 722 theo Excel. Với học sinh, 713 mới khớp sách giáo khoa | Khôi phục **713** ở dòng thời gian, `/history`, sửa thẻ chọn tướng và câu mở đầu thành 713 |
| 2 | **Chuyện cống vải.** GS Phan Huy Lê không tìm thấy bằng chứng tin cậy; quốc sử triều Nguyễn không nói tới. Bài Báo Nghệ An cũng bác. Dương Quý Phi sinh năm 719 | Đoạn "gánh vải mở màn", tên màn 1, thành tựu `MHD_CLEAR_1`, thoại người mẹ đều dựa vào chuyện này | Giữ cơ chế gánh nặng, đổi thành **gánh cống phẩm** (trang thư viện đã viết vậy). Tên trong `009` đổi bằng migration mới |
| 3 | **Thúc Bảo.** Không tìm thấy tên này trong sử liệu nào đã tra; Wikipedia liệt kê tướng khác (Phòng Hậu, Thôi Thặng...) nhưng không rõ nguồn gốc | NPC màn 2, trang thư viện | Team cho biết nguồn. Không có thì đổi thành tướng hư cấu ghi rõ, hoặc Đinh Thế |
| 4 | **Xưng đế.** Sách giáo khoa: xưng đế, xây thành Vạn An làm quốc đô, không gắn với trận Tống Bình. A1 cho xưng đế sau khi hạ Tống Bình | Cutscene màn 3 | Đổi thành "cờ Hắc Đế tung bay trên thành Tống Bình" |

Điểm khác, không đổi thiết kế: **"32 vạn" không có trong nguồn nào** (Tân Đường thư 40 vạn, Toàn thư 30 vạn, còn "32" là số châu), nên lý do đúng ở MHD-00 §4.3 cần sửa. Việc Quang Sở Khách bỏ chạy về nước chỉ thấy ở nguồn thứ cấp; Tân Đường thư lại chép ông hợp quân với Dương Tư Húc. Cái chết của Mai Thúc Loan có hai bản: sử Đường chép bị chém, dân gian kể lâm bệnh trong rừng. Người mẹ: tương truyền mất khi ông còn nhỏ, tên bà cũng lệch giữa các nguồn, nhưng có lăng và đền thờ thân mẫu ở Nam Đàn.

## 3. Sử liệu theo từng nguồn

| Nguồn | Ghi gì |
|---|---|
| [Cựu Đường thư q.8](https://zh.wikisource.org/wiki/舊唐書/卷8) | Tháng 8 năm Khai Nguyên 10 (722), Bùi Y Tiên tâu việc Mai Thúc Loan vây đánh châu huyện; sai Dương Tư Húc đi đánh |
| [Cựu Đường thư q.184](https://zh.wikisource.org/wiki/舊唐書/卷184) | Đầu Khai Nguyên, Mai Huyền Thành xưng Hắc Đế, thông mưu với Lâm Ấp, Chân Lạp, chiếm phủ An Nam; Dương Tư Húc mộ hơn 10 vạn quân, theo đường Phục Ba, bắt và chém, chất xác thành kinh quan |
| [Tân Đường thư q.207](https://zh.wikisource.org/wiki/新唐書/卷207) | Thêm 32 châu, nước Kim Lân, quân hiệu 40 vạn, hợp quân với đại đô hộ Quang Sở Khách |
| [Tư trị thông giám q.212](https://zh.wikisource.org/wiki/資治通鑑/卷212) | Năm 722, Mai Thúc Yên; hơn 10 vạn quân; chém, chất xác |
| Toàn thư (qua [Tiền Phong](https://tienphong.vn/xa-hoi/phong-su/615043/Viet-nhan-1300-nam-mot-su-kien-tpp.html), [Phan Bá Lương](https://nghiencuulichsu.com/2017/03/24/su-viet-voi-tuong-giac-mai-thuc-loan/)) | Năm 722, "tướng giặc", chiếm châu, xưng Hắc Đế, liên kết Lâm Ấp, Chân Lạp, 30 vạn quân |
| [Phan Huy Lê](https://his.ussh.vnu.edu.vn/vi/news/nguyen-viet-hoang/khao-cuu-lai-cuoc-khoi-nghia-mai-thuc-loan-gs-vs-phan-huy-le-5743.html) | Lập luận 713–722; bác cống vải; nghi các con số; nêu giai đoạn cuối ở Vạn An chưa kiểm chứng được |
| [Lịch sử 6 Kết nối tri thức](https://vietjack.com/lich-su-6-ket-noi/cau-hoi-9-trang-76-lich-su-lop-6-ket-noi-tri-thuc.jsp) | 713 bùng nổ ở Hoan Châu, xưng đế, xây thành Vạn An, làm chủ Tống Bình; 722 Dương Tư Húc đàn áp |
| [Báo Nghệ An](https://baonghean.vn/en/bai-2-khoi-nghia-hoan-chau-10044247.html) | Kết luận bùng nổ 713, bác cống vải; dẫn hội thảo 2008 của ĐH Vinh và Viện Sử học về mốc thất bại 722 |

## 4. Đối chiếu 50 câu Excel

| Câu Excel | Vấn đề | Xử lý trong bộ mới |
|---|---|---|
| 7, 36, 46 | Coi cống vải là sự thật | Bỏ; thay bằng câu hỏi về chuyện đó là truyền thuyết |
| 8 | Dương Quý Phi sinh 719, lệch niên đại | Bỏ |
| 49 | Bỏ lệ cống vải chỉ là "tương truyền" | Bỏ |
| 48 | "Khởi nghĩa phu trạm": không tìm thấy nguồn | Bỏ |
| 14 | "32 vạn" không có nguồn | Thay bằng câu so sánh 40 vạn / 30 vạn và câu 32 châu |
| 9, 27 | 722 mâu thuẫn 713–722 | Hỏi riêng từng mốc, nêu rõ theo sách nào |
| 13, 34 | "Nhà Đường mệnh Hỏa": không có nguồn | Bỏ phần ngũ hành, giữ giải thích nước da đen của sử triều Nguyễn |
| 22 | Sử Đường chép bị chém | Thành 2 câu, mỗi câu nêu rõ nguồn |
| 25 | "Bắt dân đắp gò": sử chỉ chép chất xác | Viết lại |
| 30 | Nghĩa tên Vạn An: không có nguồn | Thay bằng câu đối chọi với Trường An (mức B) |
| 31 | Mai táng ở núi Vệ Sơn: chưa xác minh | Bỏ |
| 38 | Lời Lê Văn Hưu: không có nguồn; Ngô Thì Sĩ còn phê phán Lê Văn Hưu | Bỏ; thay bằng câu về Ngô Thì Sĩ |
| 42 | Thúc Bảo: không có nguồn | Bỏ |
| 26, 41 | Tên đơn vị hành chính đã đổi năm 2025 | Bỏ; chỉ dùng "Nam Đàn, Nghệ An" |
| 21 | Rút về Vạn An: giai đoạn cuối chưa kiểm chứng | Bỏ |
| 15, 23 và các câu sự kiện khác | Có nguồn hoặc đã ghi "tương truyền" | Giữ ý, viết lại |
| Phương án "Đi bằng máy bay", "Đường trải nhựa" | Đáp án sai quá lộ | Phương án sai nay đều cùng thời, cùng loại |

**Chưa tra được:** bản dịch đầy đủ Toàn thư, Cương mục, *Việt điện u linh*; bản in sách giáo khoa; các tham luận hội thảo 2008. Câu 50 (Tiết Anh, Hoắc Đan) chỉ có một nguồn thứ cấp nên team nên cân nhắc.


## 5. Bộ 50 câu

Mức: **A** sử liệu gốc hoặc sách giáo khoa; **B** nghiên cứu, báo chính thống; **C** truyền thuyết, câu hỏi đã ghi rõ "tương truyền". ✅ là đáp án đúng.

### Màn 1 (rút 4 câu/lượt) — câu 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35

**1. Mai Hắc Đế có tên thường gọi là gì?** _(mức A)_

- A. Mai Thúc Huy
- B. Mai Kỳ Sơn
- C. Phùng Hưng
- D. Mai Thúc Loan ✅

Giải thích: Sử Việt và sách giáo khoa gọi ông là Mai Thúc Loan.

Nguồn: [Lịch sử 6 Kết nối tri thức, Bài 16 (qua VietJack)](https://vietjack.com/lich-su-6-ket-noi/cau-hoi-9-trang-76-lich-su-lop-6-ket-noi-tri-thuc.jsp); [Phan Huy Lê, Khảo cứu lại cuộc khởi nghĩa Mai Thúc Loan (ĐH KHXH&NV)](https://his.ussh.vnu.edu.vn/vi/news/nguyen-viet-hoang/khao-cuu-lai-cuoc-khoi-nghia-mai-thuc-loan-gs-vs-phan-huy-le-5743.html)

**2. Cựu Đường thư, phần truyện Dương Tư Húc, chép tên thủ lĩnh An Nam xưng Hắc Đế là gì?** _(mức A)_

- A. Mai Thúc Huy
- B. Mai Kỳ Sơn
- C. Mai Huyền Thành ✅
- D. Mai Hoàn

Giải thích: Sử nhà Đường chép nhiều tên khác nhau: Mai Huyền Thành, Mai Thúc Loan.

Nguồn: [Cựu Đường thư, q.184 (truyện Dương Tư Húc)](https://zh.wikisource.org/wiki/舊唐書/卷184); [Cựu Đường thư, q.8 (bản kỷ Huyền Tông)](https://zh.wikisource.org/wiki/舊唐書/卷8)

**3. Mai Thúc Loan tự xưng danh hiệu gì?** _(mức A)_

- A. Dạ Trạch Vương
- B. Hắc Đế ✅
- C. Bố Cái Đại Vương
- D. Nam Việt Đế

Giải thích: Cả sử Trung Hoa và sử Việt đều chép ông xưng Hắc Đế.

Nguồn: [Cựu Đường thư, q.184 (truyện Dương Tư Húc)](https://zh.wikisource.org/wiki/舊唐書/卷184); [Tân Đường thư, q.207 (truyện Dương Tư Húc)](https://zh.wikisource.org/wiki/新唐書/卷207); [Báo Tiền Phong, Viết nhân 1.300 năm một sự kiện](https://tienphong.vn/xa-hoi/phong-su/615043/Viet-nhan-1300-nam-mot-su-kien-tpp.html)

**4. Danh hiệu "Hắc Đế" có nghĩa là gì?** _(mức B)_

- A. Vua Biển
- B. Vua Đen ✅
- C. Vua Núi
- D. Vua Rồng

Giải thích: "Hắc" là màu đen, "Đế" là vua.

Nguồn: [Phan Huy Lê, Khảo cứu lại cuộc khởi nghĩa Mai Thúc Loan (ĐH KHXH&NV)](https://his.ussh.vnu.edu.vn/vi/news/nguyen-viet-hoang/khao-cuu-lai-cuoc-khoi-nghia-mai-thuc-loan-gs-vs-phan-huy-le-5743.html)

**5. Sử triều Nguyễn giải thích tên "Hắc Đế" là do đâu?** _(mức B)_

- A. Vì ông có nước da đen ✅
- B. Vì ông hay đánh ban đêm
- C. Vì quân Đường đặt tên
- D. Vì ông sinh ở núi đá đen

Giải thích: Sử triều Nguyễn liên hệ tên gọi này với nước da đen của ông.

Nguồn: [Phan Huy Lê, Khảo cứu lại cuộc khởi nghĩa Mai Thúc Loan (ĐH KHXH&NV)](https://his.ussh.vnu.edu.vn/vi/news/nguyen-viet-hoang/khao-cuu-lai-cuoc-khoi-nghia-mai-thuc-loan-gs-vs-phan-huy-le-5743.html)

**6. Khi Mai Thúc Loan khởi nghĩa, nước ta đang bị triều đại nào đô hộ?** _(mức A)_

- A. Nhà Hán
- B. Nhà Lương
- C. Nhà Minh
- D. Nhà Đường ✅

Giải thích: Khởi nghĩa chống ách đô hộ của nhà Đường.

Nguồn: [Lịch sử 6 Kết nối tri thức, Bài 16 (qua VietJack)](https://vietjack.com/lich-su-6-ket-noi/cau-hoi-9-trang-76-lich-su-lop-6-ket-noi-tri-thuc.jsp); [Cựu Đường thư, q.8 (bản kỷ Huyền Tông)](https://zh.wikisource.org/wiki/舊唐書/卷8)

**7. Vua nhà Đường sai tướng đi đánh Mai Thúc Loan là ai?** _(mức A)_

- A. Đường Thái Tông
- B. Đường Cao Tông
- C. Đường Huyền Tông ✅
- D. Đường Trung Tông

Giải thích: Việc này chép trong bản kỷ Huyền Tông của Cựu Đường thư.

Nguồn: [Cựu Đường thư, q.8 (bản kỷ Huyền Tông)](https://zh.wikisource.org/wiki/舊唐書/卷8)

**8. Sử nhà Đường chép cuộc nổi dậy của Mai Thúc Loan vào niên hiệu nào?** _(mức A)_

- A. Trinh Quán
- B. Vĩnh Huy
- C. Khai Nguyên ✅
- D. Thiên Bảo

Giải thích: Sử Đường ghi "đầu niên hiệu Khai Nguyên" và năm Khai Nguyên thứ 10.

Nguồn: [Cựu Đường thư, q.184 (truyện Dương Tư Húc)](https://zh.wikisource.org/wiki/舊唐書/卷184); [Cựu Đường thư, q.8 (bản kỷ Huyền Tông)](https://zh.wikisource.org/wiki/舊唐書/卷8)

**9. Sử nhà Đường gọi vùng đất nước ta khi đó là gì?** _(mức A)_

- A. Vạn Xuân
- B. An Nam ✅
- C. Đại Cồ Việt
- D. Văn Lang

Giải thích: Sử Đường chép Mai Thúc Loan là thủ lĩnh ở An Nam.

Nguồn: [Cựu Đường thư, q.184 (truyện Dương Tư Húc)](https://zh.wikisource.org/wiki/舊唐書/卷184); [Tân Đường thư, q.207 (truyện Dương Tư Húc)](https://zh.wikisource.org/wiki/新唐書/卷207)

**10. Trị sở của An Nam đô hộ phủ thời đó ở đâu?** _(mức A)_

- A. Tống Bình ✅
- B. Luy Lâu
- C. Cổ Loa
- D. Mê Linh

Giải thích: Tống Bình là trị sở chính quyền đô hộ, nay thuộc Hà Nội.

Nguồn: [Phan Huy Lê, Khảo cứu lại cuộc khởi nghĩa Mai Thúc Loan (ĐH KHXH&NV)](https://his.ussh.vnu.edu.vn/vi/news/nguyen-viet-hoang/khao-cuu-lai-cuoc-khoi-nghia-mai-thuc-loan-gs-vs-phan-huy-le-5743.html); [Lịch sử 6 Kết nối tri thức, Bài 16 (qua VietJack)](https://vietjack.com/lich-su-6-ket-noi/cau-hoi-9-trang-76-lich-su-lop-6-ket-noi-tri-thuc.jsp)

**11. Thành Tống Bình ngày nay thuộc thành phố nào?** _(mức A)_

- A. Vinh
- B. Huế
- C. Hải Phòng
- D. Hà Nội ✅

Giải thích: Tống Bình nằm ở vùng Hà Nội ngày nay.

Nguồn: [Phan Huy Lê, Khảo cứu lại cuộc khởi nghĩa Mai Thúc Loan (ĐH KHXH&NV)](https://his.ussh.vnu.edu.vn/vi/news/nguyen-viet-hoang/khao-cuu-lai-cuoc-khoi-nghia-mai-thuc-loan-gs-vs-phan-huy-le-5743.html)

**12. Theo Tân Đường thư, quan An Nam đại đô hộ thời đó là ai?** _(mức A)_

- A. Tô Định
- B. Tiêu Tư
- C. Mã Viện
- D. Quang Sở Khách ✅

Giải thích: Tân Đường thư chép Dương Tư Húc hợp quân với đại đô hộ Quang Sở Khách.

Nguồn: [Tân Đường thư, q.207 (truyện Dương Tư Húc)](https://zh.wikisource.org/wiki/新唐書/卷207)

**13. Theo sách Lịch sử 6 (Kết nối tri thức), khởi nghĩa Mai Thúc Loan bùng nổ năm nào?** _(mức A)_

- A. 722
- B. 766
- C. 713 ✅
- D. 938

Giải thích: Sách ghi bùng nổ năm 713. Sử cũ như Toàn thư chép việc này ở năm 722.

Nguồn: [Lịch sử 6 Kết nối tri thức, Bài 16 (qua VietJack)](https://vietjack.com/lich-su-6-ket-noi/cau-hoi-9-trang-76-lich-su-lop-6-ket-noi-tri-thuc.jsp); [Báo Nghệ An, Khởi nghĩa Hoan Châu (bài 2)](https://baonghean.vn/en/bai-2-khoi-nghia-hoan-chau-10044247.html)

**14. Nhà Đường đem quân đàn áp, khiến khởi nghĩa thất bại vào năm nào?** _(mức A)_

- A. 713
- B. 722 ✅
- C. 766
- D. 791

Giải thích: Cựu Đường thư chép việc sai Dương Tư Húc đi đánh vào năm Khai Nguyên 10 (722).

Nguồn: [Cựu Đường thư, q.8 (bản kỷ Huyền Tông)](https://zh.wikisource.org/wiki/舊唐書/卷8); [Lịch sử 6 Kết nối tri thức, Bài 16 (qua VietJack)](https://vietjack.com/lich-su-6-ket-noi/cau-hoi-9-trang-76-lich-su-lop-6-ket-noi-tri-thuc.jsp)

**15. Đại Việt sử ký toàn thư chép việc Mai Thúc Loan xưng Hắc Đế vào năm nào?** _(mức A)_

- A. 722 ✅
- B. 713
- C. 544
- D. 938

Giải thích: Toàn thư ghi năm Nhâm Tuất, Khai Nguyên 10, tức năm 722.

Nguồn: [Báo Tiền Phong, Viết nhân 1.300 năm một sự kiện](https://tienphong.vn/xa-hoi/phong-su/615043/Viet-nhan-1300-nam-mot-su-kien-tpp.html); [Phan Bá Lương, Sử Việt với “tướng giặc” Mai Thúc Loan](https://nghiencuulichsu.com/2017/03/24/su-viet-voi-tuong-giac-mai-thuc-loan/)

**16. Theo sách Lịch sử 6, chính quyền độc lập của Mai Thúc Loan giữ được bao lâu?** _(mức A)_

- A. Gần 10 năm ✅
- B. Khoảng 1 năm
- C. Hơn 20 năm
- D. Khoảng 50 năm

Giải thích: Từ 713 đến 722, gần 10 năm.

Nguồn: [Lịch sử 6 Kết nối tri thức, bảng hệ thống (qua VietJack)](https://vietjack.com/lich-su-6-ket-noi/luyen-tap-1-trang-77-lich-su-lop-6-ket-noi-tri-thuc.jsp); [Phan Huy Lê, Khảo cứu lại cuộc khởi nghĩa Mai Thúc Loan (ĐH KHXH&NV)](https://his.ussh.vnu.edu.vn/vi/news/nguyen-viet-hoang/khao-cuu-lai-cuoc-khoi-nghia-mai-thuc-loan-gs-vs-phan-huy-le-5743.html)

**17. Sau khi làm chủ Hoan Châu, nghĩa quân tiến ra Bắc làm chủ thành nào?** _(mức A)_

- A. Long Biên
- B. Luy Lâu
- C. Cổ Loa
- D. Tống Bình ✅

Giải thích: Nghĩa quân đánh đuổi chính quyền đô hộ, làm chủ Tống Bình.

Nguồn: [Lịch sử 6 Kết nối tri thức, Bài 16 (qua VietJack)](https://vietjack.com/lich-su-6-ket-noi/cau-hoi-9-trang-76-lich-su-lop-6-ket-noi-tri-thuc.jsp); [Phan Huy Lê, Khảo cứu lại cuộc khởi nghĩa Mai Thúc Loan (ĐH KHXH&NV)](https://his.ussh.vnu.edu.vn/vi/news/nguyen-viet-hoang/khao-cuu-lai-cuoc-khoi-nghia-mai-thuc-loan-gs-vs-phan-huy-le-5743.html)

**18. Tướng nhà Đường được sai đi đàn áp Mai Thúc Loan là ai?** _(mức A)_

- A. Trần Bá Tiên
- B. Lục Dận
- C. Dương Tư Húc ✅
- D. Tô Định

Giải thích: Sử Đường và sách giáo khoa đều nêu Dương Tư Húc.

Nguồn: [Cựu Đường thư, q.8 (bản kỷ Huyền Tông)](https://zh.wikisource.org/wiki/舊唐書/卷8); [Lịch sử 6 Kết nối tri thức, Bài 16 (qua VietJack)](https://vietjack.com/lich-su-6-ket-noi/cau-hoi-9-trang-76-lich-su-lop-6-ket-noi-tri-thuc.jsp)

**19. Dương Tư Húc vốn là người thế nào trong triều Đường?** _(mức A)_

- A. Một thư sinh đỗ đạt
- B. Một hoạn quan cầm quân ✅
- C. Một hoàng tử
- D. Một thương nhân

Giải thích: Ông là hoạn quan, giữ chức kiêm Nội thị.

Nguồn: [Cựu Đường thư, q.184 (truyện Dương Tư Húc)](https://zh.wikisource.org/wiki/舊唐書/卷184); [Cựu Đường thư, q.8 (bản kỷ Huyền Tông)](https://zh.wikisource.org/wiki/舊唐書/卷8)

**20. Theo Cựu Đường thư, Dương Tư Húc chiêu mộ được bao nhiêu quân ở Lĩnh Nam?** _(mức A)_

- A. Khoảng 1 vạn
- B. Hơn 10 vạn ✅
- C. Khoảng 3 vạn
- D. Hơn 50 vạn

Giải thích: Ông mộ con em các thủ lĩnh địa phương, được hơn mười vạn người.

Nguồn: [Cựu Đường thư, q.184 (truyện Dương Tư Húc)](https://zh.wikisource.org/wiki/舊唐書/卷184); [Tư trị thông giám, q.212](https://zh.wikisource.org/wiki/資治通鑑/卷212)

**21. Quân Dương Tư Húc đi theo đường cũ của vị tướng nào để đánh bất ngờ?** _(mức A)_

- A. Mã Viện ✅
- B. Triệu Đà
- C. Lưu Phương
- D. Trần Bá Tiên

Giải thích: Sử Đường chép đi theo đường cũ của Phục Ba tướng quân Mã Viện.

Nguồn: [Tân Đường thư, q.207 (truyện Dương Tư Húc)](https://zh.wikisource.org/wiki/新唐書/卷207); [Cựu Đường thư, q.184 (truyện Dương Tư Húc)](https://zh.wikisource.org/wiki/舊唐書/卷184)

**22. Dương Tư Húc hợp quân với ai để đánh Mai Thúc Loan?** _(mức A)_

- A. Tiêu Tư
- B. Lục Dận
- C. Trương Phụ
- D. Quang Sở Khách ✅

Giải thích: Tân Đường thư chép ông hợp quân với đại đô hộ Quang Sở Khách.

Nguồn: [Tân Đường thư, q.207 (truyện Dương Tư Húc)](https://zh.wikisource.org/wiki/新唐書/卷207)

**23. Sau khi thắng, quân Đường làm gì với xác nghĩa quân?** _(mức A)_

- A. Thả trôi xuống sông
- B. Đem về Trường An
- C. Chất thành gò kinh quan để thị uy ✅
- D. Trả lại cho gia đình

Giải thích: Sử Đường đều chép việc chất xác thành gò gọi là kinh quan.

Nguồn: [Cựu Đường thư, q.184 (truyện Dương Tư Húc)](https://zh.wikisource.org/wiki/舊唐書/卷184); [Tân Đường thư, q.207 (truyện Dương Tư Húc)](https://zh.wikisource.org/wiki/新唐書/卷207); [Tư trị thông giám, q.212](https://zh.wikisource.org/wiki/資治通鑑/卷212)

**24. Theo Cựu Đường thư, thủ lĩnh Mai Huyền Thành có kết cục thế nào?** _(mức A)_

- A. Chạy sang Lâm Ấp
- B. Đầu hàng và được phong quan
- C. Bị bắt và chém trước trận ✅
- D. Mất tích trên biển

Giải thích: Đây là ghi chép của sử nhà Đường. Dân gian Việt lại kể khác.

Nguồn: [Cựu Đường thư, q.184 (truyện Dương Tư Húc)](https://zh.wikisource.org/wiki/舊唐書/卷184); [Tư trị thông giám, q.212](https://zh.wikisource.org/wiki/資治通鑑/卷212)

**25. Dân gian Việt kể Mai Hắc Đế mất như thế nào?** _(mức C)_

- A. Tử trận trên sông Hồng
- B. Lui vào rừng rồi lâm bệnh qua đời ✅
- C. Tự vẫn ở thành Tống Bình
- D. Chết già ở quê nhà

Giải thích: Đây là lời truyền của dân gian, khác với sử nhà Đường.

Nguồn: [Wikipedia tiếng Việt, Mai Thúc Loan (nguồn thứ cấp)](https://vi.wikipedia.org/wiki/Mai_Thúc_Loan); [Báo Tiền Phong, Viết nhân 1.300 năm một sự kiện](https://tienphong.vn/xa-hoi/phong-su/615043/Viet-nhan-1300-nam-mot-su-kien-tpp.html)

**26. Tương truyền ai nối ngôi Mai Hắc Đế để tiếp tục chống Đường?** _(mức C)_

- A. Mai Thúc Huy (Mai Thiếu Đế) ✅
- B. Khúc Thừa Dụ
- C. Phùng Hưng
- D. Dương Đình Nghệ

Giải thích: Tương truyền con ông là Mai Thúc Huy được tôn lên, gọi là Mai Thiếu Đế.

Nguồn: [Wikipedia tiếng Việt, Mai Thúc Loan (nguồn thứ cấp)](https://vi.wikipedia.org/wiki/Mai_Thúc_Loan); [Lê Thái Dũng, Những điều ít biết về vương triều của Mai Hắc Đế (trang Bảo tàng Lịch sử)](https://baotanglichsu.vn/vi/Articles/3096/6906/nhung-djieu-it-biet-ve-vuong-trieu-cua-mai-hac-dje.html); [Báo Tiền Phong, Viết nhân 1.300 năm một sự kiện](https://tienphong.vn/xa-hoi/phong-su/615043/Viet-nhan-1300-nam-mot-su-kien-tpp.html)

**27. Đại Việt sử ký toàn thư gọi Mai Thúc Loan là gì?** _(mức A)_

- A. Thánh vương
- B. Đại vương
- C. Quốc công
- D. Tướng giặc ✅

Giải thích: Toàn thư dùng chữ này vì chép theo sử nhà Đường.

Nguồn: [Phan Bá Lương, Sử Việt với “tướng giặc” Mai Thúc Loan](https://nghiencuulichsu.com/2017/03/24/su-viet-voi-tuong-giac-mai-thuc-loan/); [Báo Tiền Phong, Viết nhân 1.300 năm một sự kiện](https://tienphong.vn/xa-hoi/phong-su/615043/Viet-nhan-1300-nam-mot-su-kien-tpp.html)

**28. Sử gia nào phản đối việc gọi Mai Thúc Loan là "tướng giặc"?** _(mức B)_

- A. Lê Văn Hưu
- B. Ngô Sĩ Liên
- C. Tư Mã Quang
- D. Ngô Thì Sĩ ✅

Giải thích: Ngô Thì Sĩ, tác giả Đại Việt sử ký tiền biên, cho cách gọi đó là sai.

Nguồn: [Phan Huy Lê, Khảo cứu lại cuộc khởi nghĩa Mai Thúc Loan (ĐH KHXH&NV)](https://his.ussh.vnu.edu.vn/vi/news/nguyen-viet-hoang/khao-cuu-lai-cuoc-khoi-nghia-mai-thuc-loan-gs-vs-phan-huy-le-5743.html); [Báo Tiền Phong, Viết nhân 1.300 năm một sự kiện](https://tienphong.vn/xa-hoi/phong-su/615043/Viet-nhan-1300-nam-mot-su-kien-tpp.html)

**29. GS Phan Huy Lê nhận định thế nào về chuyện cống vải gây ra khởi nghĩa?** _(mức B)_

- A. Đã được sử nhà Đường xác nhận
- B. Có ghi trong Đại Việt sử ký toàn thư
- C. Chưa có bằng chứng tin cậy ✅
- D. Do chính Mai Thúc Loan kể lại

Giải thích: Ông cho rằng nguyên nhân sâu xa là sự bóc lột của ách đô hộ.

Nguồn: [Phan Huy Lê, Khảo cứu lại cuộc khởi nghĩa Mai Thúc Loan (ĐH KHXH&NV)](https://his.ussh.vnu.edu.vn/vi/news/nguyen-viet-hoang/khao-cuu-lai-cuoc-khoi-nghia-mai-thuc-loan-gs-vs-phan-huy-le-5743.html); [Báo Tiền Phong, Viết nhân 1.300 năm một sự kiện](https://tienphong.vn/xa-hoi/phong-su/615043/Viet-nhan-1300-nam-mot-su-kien-tpp.html); [Báo Nghệ An, Khởi nghĩa Hoan Châu (bài 2)](https://baonghean.vn/en/bai-2-khoi-nghia-hoan-chau-10044247.html)

**30. Chuyện dân phu gánh vải cống nạp trong khởi nghĩa Mai Thúc Loan thuộc loại tư liệu nào?** _(mức C)_

- A. Chép trong Cựu Đường thư
- B. Truyền thuyết dân gian ✅
- C. Chép trong Toàn thư
- D. Khắc trên bia đời Đường

Giải thích: Các quốc sử không chép chuyện này, nhiều nhà sử học không công nhận.

Nguồn: [Báo Tiền Phong, Viết nhân 1.300 năm một sự kiện](https://tienphong.vn/xa-hoi/phong-su/615043/Viet-nhan-1300-nam-mot-su-kien-tpp.html); [Phan Huy Lê, Khảo cứu lại cuộc khởi nghĩa Mai Thúc Loan (ĐH KHXH&NV)](https://his.ussh.vnu.edu.vn/vi/news/nguyen-viet-hoang/khao-cuu-lai-cuoc-khoi-nghia-mai-thuc-loan-gs-vs-phan-huy-le-5743.html)

**31. Theo GS Phan Huy Lê, nguyên nhân sâu xa của khởi nghĩa là gì?** _(mức B)_

- A. Sự áp bức, bóc lột của chính quyền đô hộ ✅
- B. Tranh chấp giữa các dòng họ
- C. Mất mùa do hạn hán
- D. Nhà Đường đổi tên nước

Giải thích: Ông bác nguyên nhân cống vải và nhấn vào ách bóc lột nói chung.

Nguồn: [Phan Huy Lê, Khảo cứu lại cuộc khởi nghĩa Mai Thúc Loan (ĐH KHXH&NV)](https://his.ussh.vnu.edu.vn/vi/news/nguyen-viet-hoang/khao-cuu-lai-cuoc-khoi-nghia-mai-thuc-loan-gs-vs-phan-huy-le-5743.html); [Báo Nghệ An, Khởi nghĩa Hoan Châu (bài 2)](https://baonghean.vn/en/bai-2-khoi-nghia-hoan-chau-10044247.html)

**32. Theo sách Lịch sử 6, ý nghĩa của khởi nghĩa Mai Thúc Loan là gì?** _(mức A)_

- A. Cổ vũ tinh thần giành độc lập hoàn toàn đầu thế kỉ X ✅
- B. Chấm dứt vĩnh viễn thời Bắc thuộc
- C. Lập ra nhà Đinh
- D. Mở đầu nhà Lý

Giải thích: Khởi nghĩa để lại kinh nghiệm cho các cuộc đấu tranh sau này.

Nguồn: [Lịch sử 6 Kết nối tri thức, bảng hệ thống (qua VietJack)](https://vietjack.com/lich-su-6-ket-noi/luyen-tap-1-trang-77-lich-su-lop-6-ket-noi-tri-thuc.jsp)

**33. Lễ hội đền Vua Mai ở Nam Đàn tổ chức vào dịp nào?** _(mức A)_

- A. Rằm tháng Tám
- B. Mùng 10 tháng Ba
- C. Tết Đoan Ngọ
- D. Rằm tháng Giêng ✅

Giải thích: Lễ hội thường diễn ra từ 13 đến 15 tháng Giêng âm lịch.

Nguồn: [Báo Nhân Dân, Đặc sắc lễ hội đền Vua Mai năm 2025](https://nhandan.vn/dac-sac-le-hoi-den-vua-mai-nam-2025-post859508.html); [Báo Tiền Phong, Viết nhân 1.300 năm một sự kiện](https://tienphong.vn/xa-hoi/phong-su/615043/Viet-nhan-1300-nam-mot-su-kien-tpp.html)

**34. Đền thờ Vua Mai Hắc Đế được xếp hạng di tích nào?** _(mức B)_

- A. Di sản thiên nhiên thế giới
- B. Di tích cấp huyện
- C. Di tích quốc gia đặc biệt ✅
- D. Bảo tàng tư nhân

Giải thích: Lễ đón bằng xếp hạng tổ chức đầu năm 2023.

Nguồn: [Báo Văn Hóa, Kỷ niệm 1310 năm khởi nghĩa Hoan Châu](https://baovanhoa.vn/doi-song-van-hoa/nghe-an-trang-trong-ky-niem-1310-nam-khoi-nghia-hoan-chau-va-don-nhan-bang-di-tich-quoc-gia-dac-biet-den-tho-vua-mai-hac-de-16381.html); [Báo Văn Hóa, Khai hội Đền Vua Mai năm 2026](https://baovanhoa.vn/van-hoa/khai-hoi-den-vua-mai-nam-2026-207845.html)

**35. Ở lễ hội đền Vua Mai có môn thi truyền thống nào dưới chân núi Đụn?** _(mức B)_

- A. Đua thuyền
- B. Đấu vật ✅
- C. Chọi trâu
- D. Bắn nỏ

Giải thích: Sới vật dưới chân núi Đụn thu hút đông người xem.

Nguồn: [Báo Văn Hóa, Khai hội Đền Vua Mai năm 2026](https://baovanhoa.vn/van-hoa/khai-hoi-den-vua-mai-nam-2026-207845.html); [Báo Nhân Dân, Đặc sắc lễ hội đền Vua Mai năm 2025](https://nhandan.vn/dac-sac-le-hoi-den-vua-mai-nam-2025-post859508.html)

### NPC Mẹ — xuất thân — câu 36, 37, 38, 39, 40

**36. Sách cũ chép gốc gia đình Mai Thúc Loan ở vùng nào?** _(mức B)_

- A. Mê Linh (Hà Nội)
- B. Mai Phụ (Hà Tĩnh) ✅
- C. Chu Diên (Hưng Yên)
- D. Đường Lâm (Hà Nội)

Giải thích: Mai Phụ là vùng ven biển Hà Tĩnh ngày nay.

Nguồn: [Phan Huy Lê, Khảo cứu lại cuộc khởi nghĩa Mai Thúc Loan (ĐH KHXH&NV)](https://his.ussh.vnu.edu.vn/vi/news/nguyen-viet-hoang/khao-cuu-lai-cuoc-khoi-nghia-mai-thuc-loan-gs-vs-phan-huy-le-5743.html); [Báo Hà Tĩnh, Mai Thúc Loan (Thế kỷ VIII)](https://baohatinh.vn/mai-thuc-loan-the-ky-viii-post47572.html)

**37. Tương truyền gia đình bên mẹ Mai Thúc Loan ở Mai Phụ làm nghề gì?** _(mức C)_

- A. Làm muối ✅
- B. Đúc đồng
- C. Dệt lụa
- D. Làm gốm

Giải thích: Mai Phụ là vùng làm muối ven biển.

Nguồn: [Phan Huy Lê, Khảo cứu lại cuộc khởi nghĩa Mai Thúc Loan (ĐH KHXH&NV)](https://his.ussh.vnu.edu.vn/vi/news/nguyen-viet-hoang/khao-cuu-lai-cuoc-khoi-nghia-mai-thuc-loan-gs-vs-phan-huy-le-5743.html); [Báo Hà Tĩnh, Mai Thúc Loan (Thế kỷ VIII)](https://baohatinh.vn/mai-thuc-loan-the-ky-viii-post47572.html)

**38. Tương truyền Mai Thúc Loan lớn lên ở vùng nào?** _(mức C)_

- A. Thạch Hà (Hà Tĩnh)
- B. Hoa Lư (Ninh Bình)
- C. Chu Diên (Hưng Yên)
- D. Nam Đàn (Nghệ An) ✅

Giải thích: Tương truyền mẹ con ông dời về Ngọc Trừng, vùng Nam Đàn.

Nguồn: [Báo Hà Tĩnh, Mai Thúc Loan (Thế kỷ VIII)](https://baohatinh.vn/mai-thuc-loan-the-ky-viii-post47572.html); [Phan Huy Lê, Khảo cứu lại cuộc khởi nghĩa Mai Thúc Loan (ĐH KHXH&NV)](https://his.ussh.vnu.edu.vn/vi/news/nguyen-viet-hoang/khao-cuu-lai-cuoc-khoi-nghia-mai-thuc-loan-gs-vs-phan-huy-le-5743.html)

**39. Tương truyền ai nuôi Mai Thúc Loan sau khi ông mồ côi?** _(mức C)_

- A. Phùng Hạp Khanh
- B. Tiết Anh
- C. Đinh Thế ✅
- D. Hoắc Đan

Giải thích: Đinh Thế là bạn của cha ông, sau gả con gái cho ông.

Nguồn: [Báo Pháp Luật, Bí mật xung quanh cuộc đời ông 'vua Đen'](https://baophapluat.vn/bi-mat-xung-quanh-cuoc-doi-ong-vua-den-post289725.html); [Wikipedia tiếng Việt, Mai Thúc Loan (nguồn thứ cấp)](https://vi.wikipedia.org/wiki/Mai_Thúc_Loan)

**40. Tương truyền thuở trẻ Mai Thúc Loan nổi tiếng với môn võ nào?** _(mức C)_

- A. Bắn cung
- B. Đấu kiếm
- C. Đô vật ✅
- D. Cưỡi ngựa

Giải thích: Tương truyền ông mở lò vật để tập hợp trai tráng.

Nguồn: [Wikipedia tiếng Việt, Mai Thúc Loan (nguồn thứ cấp)](https://vi.wikipedia.org/wiki/Mai_Thúc_Loan)

### NPC Thúc Bảo — căn cứ — câu 41, 42, 43, 44, 45

**41. Khởi nghĩa Mai Thúc Loan bắt đầu từ vùng nào?** _(mức A)_

- A. Giao Châu
- B. Hoan Châu ✅
- C. Phong Châu
- D. Ái Châu

Giải thích: Quân khởi nghĩa nhanh chóng làm chủ vùng Hoan Châu.

Nguồn: [Lịch sử 6 Kết nối tri thức, Bài 16 (qua VietJack)](https://vietjack.com/lich-su-6-ket-noi/cau-hoi-9-trang-76-lich-su-lop-6-ket-noi-tri-thuc.jsp); [Phan Huy Lê, Khảo cứu lại cuộc khởi nghĩa Mai Thúc Loan (ĐH KHXH&NV)](https://his.ussh.vnu.edu.vn/vi/news/nguyen-viet-hoang/khao-cuu-lai-cuoc-khoi-nghia-mai-thuc-loan-gs-vs-phan-huy-le-5743.html)

**42. Vùng Hoan Châu nay thuộc địa phương nào?** _(mức A)_

- A. Nghệ An – Hà Tĩnh ✅
- B. Thanh Hóa – Ninh Bình
- C. Quảng Nam – Đà Nẵng
- D. Hà Nội – Bắc Ninh

Giải thích: Sách giáo khoa ghi Hoan Châu nay thuộc Nghệ An – Hà Tĩnh.

Nguồn: [Lịch sử 6 Kết nối tri thức, Bài 16 (qua VietJack)](https://vietjack.com/lich-su-6-ket-noi/cau-hoi-9-trang-76-lich-su-lop-6-ket-noi-tri-thuc.jsp)

**43. Mai Thúc Loan xây thành nào làm quốc đô?** _(mức A)_

- A. Thành Cổ Loa
- B. Thành Hoa Lư
- C. Thành Đại La
- D. Thành Vạn An ✅

Giải thích: Ông xưng đế và xây thành Vạn An làm quốc đô.

Nguồn: [Lịch sử 6 Kết nối tri thức, Bài 16 (qua VietJack)](https://vietjack.com/lich-su-6-ket-noi/cau-hoi-9-trang-76-lich-su-lop-6-ket-noi-tri-thuc.jsp); [Phan Huy Lê, Khảo cứu lại cuộc khởi nghĩa Mai Thúc Loan (ĐH KHXH&NV)](https://his.ussh.vnu.edu.vn/vi/news/nguyen-viet-hoang/khao-cuu-lai-cuoc-khoi-nghia-mai-thuc-loan-gs-vs-phan-huy-le-5743.html)

**44. Tên kinh đô Vạn An được cho là để đối chọi với kinh đô nào của nhà Đường?** _(mức B)_

- A. Lạc Dương
- B. Kiến Khang
- C. Biện Kinh
- D. Trường An ✅

Giải thích: Một số nghiên cứu cho rằng tên này đối lại với Trường An.

Nguồn: [Lê Thái Dũng, Những điều ít biết về vương triều của Mai Hắc Đế (trang Bảo tàng Lịch sử)](https://baotanglichsu.vn/vi/Articles/3096/6906/nhung-djieu-it-biet-ve-vuong-trieu-cua-mai-hac-dje.html)

**45. Dãy núi nào được nhắc đến là căn cứ cuối cùng của nghĩa quân?** _(mức B)_

- A. Tam Đảo
- B. Lam Sơn
- C. Hùng Sơn ✅
- D. Yên Tử

Giải thích: Hùng Sơn còn gọi là núi Đụn, ở Nam Đàn.

Nguồn: [Lê Thái Dũng, Những điều ít biết về vương triều của Mai Hắc Đế (trang Bảo tàng Lịch sử)](https://baotanglichsu.vn/vi/Articles/3096/6906/nhung-djieu-it-biet-ve-vuong-trieu-cua-mai-hac-dje.html)

### NPC Sứ giả — liên minh — câu 46, 47, 48, 49, 50

**46. Sử nhà Đường chép Mai Thúc Loan liên kết với hai nước nào?** _(mức A)_

- A. Nam Chiếu và Lâm Ấp
- B. Lâm Ấp và Chân Lạp ✅
- C. Chân Lạp và Nam Hán
- D. Nam Hán và Nam Chiếu

Giải thích: Cựu Đường thư, Tân Đường thư và Toàn thư đều nêu hai nước này.

Nguồn: [Cựu Đường thư, q.184 (truyện Dương Tư Húc)](https://zh.wikisource.org/wiki/舊唐書/卷184); [Tân Đường thư, q.207 (truyện Dương Tư Húc)](https://zh.wikisource.org/wiki/新唐書/卷207); [Báo Tiền Phong, Viết nhân 1.300 năm một sự kiện](https://tienphong.vn/xa-hoi/phong-su/615043/Viet-nhan-1300-nam-mot-su-kien-tpp.html)

**47. Ngoài Lâm Ấp và Chân Lạp, Tân Đường thư còn nêu tên nước nào?** _(mức A)_

- A. Kim Lân ✅
- B. Nam Chiếu
- C. Phù Nam
- D. Cao Ly

Giải thích: Tân Đường thư thêm nước Kim Lân.

Nguồn: [Tân Đường thư, q.207 (truyện Dương Tư Húc)](https://zh.wikisource.org/wiki/新唐書/卷207)

**48. Theo Tân Đường thư, Mai Thúc Loan huy động dân chúng của bao nhiêu châu?** _(mức A)_

- A. 32 châu ✅
- B. 5 châu
- C. 12 châu
- D. 64 châu

Giải thích: Sách chép ông tập hợp dân 32 châu.

Nguồn: [Tân Đường thư, q.207 (truyện Dương Tư Húc)](https://zh.wikisource.org/wiki/新唐書/卷207)

**49. Hai bộ sử ghi số quân của Mai Thúc Loan khác nhau thế nào?** _(mức A)_

- A. Tân Đường thư 10 vạn, Toàn thư 5 vạn
- B. Cả hai đều ghi 32 vạn
- C. Cả hai đều ghi 100 vạn
- D. Tân Đường thư 40 vạn, Toàn thư 30 vạn ✅

Giải thích: GS Phan Huy Lê cho rằng các con số này có thể bị thổi phồng.

Nguồn: [Tân Đường thư, q.207 (truyện Dương Tư Húc)](https://zh.wikisource.org/wiki/新唐書/卷207); [Báo Tiền Phong, Viết nhân 1.300 năm một sự kiện](https://tienphong.vn/xa-hoi/phong-su/615043/Viet-nhan-1300-nam-mot-su-kien-tpp.html); [Phan Huy Lê, Khảo cứu lại cuộc khởi nghĩa Mai Thúc Loan (ĐH KHXH&NV)](https://his.ussh.vnu.edu.vn/vi/news/nguyen-viet-hoang/khao-cuu-lai-cuoc-khoi-nghia-mai-thuc-loan-gs-vs-phan-huy-le-5743.html)

**50. Theo Việt điện u linh bản tân đính, ai được cử đi liên lạc với hai nước phiên?** _(mức B)_

- A. Phùng Hưng và Phùng Hải
- B. Mai Thúc Huy và Mai Kỳ Sơn
- C. Tiết Anh và Hoắc Đan ✅
- D. Đinh Thế và Thôi Thặng

Giải thích: Bài của Lê Thái Dũng dẫn tư liệu này, sử nhà Đường không chép.

Nguồn: [Lê Thái Dũng, Những điều ít biết về vương triều của Mai Hắc Đế (trang Bảo tàng Lịch sử)](https://baotanglichsu.vn/vi/Articles/3096/6906/nhung-djieu-it-biet-ve-vuong-trieu-cua-mai-hac-dje.html)
