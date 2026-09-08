// Tính năng 1: Cuộn mượt mà từ nút "Khám phá ngay" xuống Dòng thời gian
function scrollToTimeline() {
    document.getElementById('timeline-section').scrollIntoView({ 
        behavior: 'smooth' 
    });
}

// Tính năng 2: Chuyển đổi nội dung các tab thời kỳ lịch sử
function openEra(evt, eraId) {
    // Ẩn tất cả nội dung
    const eraContents = document.getElementsByClassName("era-content");
    for (let i = 0; i < eraContents.length; i++) {
        eraContents[i].classList.remove("active");
    }

    // Xóa class active ở tất cả các nút
    const tabBtns = document.getElementsByClassName("tab-btn");
    for (let i = 0; i < tabBtns.length; i++) {
        tabBtns[i].classList.remove("active");
    }

    // Hiển thị nội dung được chọn và làm sáng nút đó
    document.getElementById(eraId).classList.add("active");
    evt.currentTarget.classList.add("active");
}

// Tính năng 3: Hiệu ứng xuất hiện (Reveal) khi cuộn trang
function revealOnScroll() {
    const reveals = document.querySelectorAll('.reveal');
    const windowHeight = window.innerHeight;
    
    reveals.forEach(reveal => {
        const revealTop = reveal.getBoundingClientRect().top;
        const revealPoint = 100; // Cách đáy màn hình 100px thì bắt đầu hiện

        if (revealTop < windowHeight - revealPoint) {
            reveal.classList.add('active');
        }
    });
}

window.addEventListener('scroll', function () {
    const btnBack = document.getElementById('btnBackToGame');
    if (!btnBack) return;

    // Tính toán khoảng cách cuộn so với chiều cao trang
    const scrollPosition = window.innerHeight + window.scrollY;
    const threshold = document.documentElement.scrollHeight - 150; // Hiện ra khi cách đáy 150px

    if (scrollPosition >= threshold) {
        btnBack.style.opacity = '1';
        btnBack.style.pointerEvents = 'auto'; // Cho phép click khi đã hiện
    } else {
        btnBack.style.opacity = '0';
        btnBack.style.pointerEvents = 'none'; // Khóa click khi đang ẩn
    }
});

// Hàm chuyển đổi nội dung giữa 4 Tab giai đoạn
function openEra(evt, tabId) {
    // Ẩn tất cả nội dung tab
    const eraContents = document.getElementsByClassName("era-content");
    for (let i = 0; i < eraContents.length; i++) {
        eraContents[i].classList.remove("active");
    }

    // Xóa trạng thái active của tất cả các nút
    const tabBtns = document.getElementsByClassName("tab-btn");
    for (let i = 0; i < tabBtns.length; i++) {
        tabBtns[i].classList.remove("active");
    }

    // Hiển thị khung nội dung được bấm và sáng nút tương ứng
    document.getElementById(tabId).classList.add("active");
    evt.currentTarget.classList.add("active");
}

// NOTE FIX CODE: Hàm cuộn mượt xuống phần Tiến Trình Lịch Sử
function scrollToTimeline() {
    const target = document.querySelector('.content-section');
    if (!target) return;

    const targetPosition = target.getBoundingClientRect().top + window.pageYOffset;
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    
    // THỜI GIAN CUỘN (Tính bằng mili-giây)
    // 500 = 0.5 giây (Cuộn nhanh)
    // 1000 = 1.0 giây (Vừa phải - Mặc định khuyên dùng)
    // 2000 = 2.0 giây (Cuộn chậm, mượt mà)
    const duration = 1000; 
    
    let start = null;

    function step(timestamp) {
        if (!start) start = timestamp;
        const progress = timestamp - start;
        
        // Công thức gia tốc giúp cuộn mượt ở đầu và cuối (Ease-In-Out)
        const easeInOutCubic = progress => progress < 0.5
            ? 4 * progress * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 3) / 2;

        const percentage = Math.min(progress / duration, 1);
        window.scrollTo(0, startPosition + distance * easeInOutCubic(percentage));

        if (progress < duration) {
            window.requestAnimationFrame(step);
        }
    }

    window.requestAnimationFrame(step);
}

// Lắng nghe sự kiện cuộn chuột để kích hoạt hiệu ứng
window.addEventListener('scroll', revealOnScroll);

// Kích hoạt ngay 1 lần khi trang vừa load xong
revealOnScroll();