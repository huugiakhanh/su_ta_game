// Cuộn xuống phần tiến trình lịch sử
function scrollToTimeline() {
    document.querySelector('.content-section')?.scrollIntoView({ behavior: 'smooth' });
}

// Chuyển đổi giữa các Tab Giai Đoạn
function openEra(event, tabId) {
    document.querySelectorAll('.era-content').forEach(content => content.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(button => button.classList.remove('active'));
    
    const targetTab = document.getElementById(tabId);
    if (targetTab) targetTab.classList.add('active');
    if (event && event.currentTarget) event.currentTarget.classList.add('active');
}

// Pop-up thông tin nhân vật
function openEraModal(name, detail) {
    alert(`${name}\n${detail}`);
}

// Khởi tạo các sự kiện cuộn trang khi web tải xong
document.addEventListener('DOMContentLoaded', () => {
    function revealOnScroll() {
        const windowHeight = window.innerHeight;
        document.querySelectorAll('.reveal').forEach(element => {
            if (element.getBoundingClientRect().top < windowHeight - 100) {
                element.classList.add('active');
            }
        });
    }

    function updateBackButton() {
        const button = document.getElementById('btnBackToGame');
        if (!button) return;
        const nearBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 150;
        button.style.opacity = nearBottom ? '1' : '0';
        button.style.pointerEvents = nearBottom ? 'auto' : 'none';
    }

    window.addEventListener('scroll', revealOnScroll);
    window.addEventListener('scroll', updateBackButton);
    
    // Thực hiện kiểm tra ngay khi vừa vào trang
    revealOnScroll();
    updateBackButton();
});