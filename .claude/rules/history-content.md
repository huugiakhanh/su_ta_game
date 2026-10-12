---
paths:
  - "frontend/static/js/levels/**/questions-data.js"
  - "frontend/static/js/levels/**/dialogue-data.js"
  - "backend/data/library_heroes.json"
  - "frontend/static/assets/question/**"
  - "frontend/templates/history.html"
  - "frontend/templates/components/home/timeline.html"
---

# Nội dung lịch sử — Source of Truth của team

Các file này chứa **nội dung lịch sử**: tên người, địa danh, năm, sự kiện, câu hỏi, đáp án, giải thích, lời thoại, cốt truyện, bài viết thư viện.

- **Không tự sửa, không tự viết thêm, không "sửa cho đúng"**, kể cả lỗi chính tả hay dấu câu. Nghi ngờ sai → hỏi team, ghi vào report.
- Nội dung chép **nguyên văn** từ nguồn của team: `questions-data.js` từ file Excel (sinh bằng script); `dialogue-data.js` từ task card TT-NPC-01 mục 5 và TT-BOSS-01 mục 5.3–5.4; `library_heroes.json` từ các trang thư viện cũ.
- Đáp án đầu tiên trong `dialogue-data.js` là đáp án đúng (giao diện tự xáo).
- Thiếu nội dung → để chỗ trống/ghi `TODO_MISSING` và báo, không bịa. Ví dụ đang chờ: mục `nguyen-hue` trong thư viện (đang tạm dùng nội dung Trưng Trắc), câu 41 bộ câu hỏi Trưng Trắc (tạm loại — đáp án lưu dạng số ngày Excel).
- Được phép: đổi cấu trúc/định dạng chứa nội dung (vd. HTML → JSON) **miễn nội dung giữ nguyên từng chữ** — kiểm bằng script so sánh trước/sau, không gõ lại tay.
