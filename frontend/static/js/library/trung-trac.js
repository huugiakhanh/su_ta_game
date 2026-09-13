// NOTE FIX CODE: Xử lý hiệu ứng cuộn chuyển động trượt mượt cho từng thẻ
document.addEventListener('DOMContentLoaded', () => {
    
    const epicCards = document.querySelectorAll('.epic-card');

    // Khởi tạo người quan sát vị trí cuộn trang (Intersection Observer)
    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -80px 0px', // Kích hoạt sớm hơn một chút khi thẻ chuẩn bị lọt vào màn hình
        threshold: 0.12
    };

    const cardObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Thêm class 'active' để chạy animation trong CSS
                entry.target.classList.add('active');
                
                // Sau khi hiệu ứng đã hiện hoàn toàn thì ngừng theo dõi thẻ đó
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Bắt đầu quan sát từng thẻ
    epicCards.forEach(card => {
        cardObserver.observe(card);
    });
});