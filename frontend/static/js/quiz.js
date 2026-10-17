let allQuestions = [];      // Chứa toàn bộ câu hỏi từ JSON
let activeQuestions = [];   // Chứa các câu hỏi đã được random cho lượt chơi này
let currentIndex = 0;
let score = 0;
let canAnswer = true;
let correctCount = 0;

// Đồng hồ (SUTA-QUIZ-LB): chỉ tính thời gian suy nghĩ — từ lúc hiện câu hỏi tới lúc
// chọn đáp án, không tính 3,5 s xem giải thích. Dùng xếp hạng khi hoà số câu đúng.
let quizTime = 0;          // giây đã cộng dồn của các câu đã trả lời
let questionShownAt = 0;   // performance.now() lúc hiện câu đang hỏi
let clockTimer = null;

function elapsedSeconds() {
    return quizTime + (canAnswer ? (performance.now() - questionShownAt) / 1000 : 0);
}

function formatClock(seconds) {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
}

function updateClock() {
    document.getElementById("time-display").innerText = `⏱ ${formatClock(elapsedSeconds())}`;
}

// Bộ câu hỏi theo chương (BT-ENGINE E2). `excluded`: id câu team loại hẳn
// (Bà Triệu — người dùng chốt 17/10, docs/SUTA_BT_TASK_00.md §3.3); lọc ở đây, không sửa file JSON.
const QUIZ_BANKS = {
    'trung-trac': { url: '/static/assets/question/trung-trac-question.json', excluded: [] },
    'ba-trieu': { url: '/static/assets/question/ba-trieu-question.json', excluded: [15, 33, 37, 41, 45] },
};
const DEFAULT_CHAPTER = 'trung-trac';
let currentChapter = null;
let loadToken = 0;

// Chương chọn sẵn từ `?chapter=<slug>` (nút từ trang khác), sai thì về mặc định.
function chapterFromUrl() {
    const chapter = new URLSearchParams(window.location.search).get('chapter');
    return QUIZ_BANKS[chapter] ? chapter : DEFAULT_CHAPTER;
}

function markChapterButtons(chapter, loading) {
    document.querySelectorAll(".btn-chapter").forEach(button => {
        button.classList.toggle("is-active", button.dataset.chapter === chapter);
        button.disabled = loading;
    });
}

// 1. Tải bộ câu hỏi của chương (lúc mở trang và mỗi lần đổi chương)
async function selectChapter(chapter) {
    if (!QUIZ_BANKS[chapter] || chapter === currentChapter) return;
    const bank = QUIZ_BANKS[chapter];
    const token = ++loadToken;
    markChapterButtons(chapter, true);
    try {
        const response = await fetch(bank.url);
        if (!response.ok) throw new Error("Không thể tải file JSON");

        const questions = (await response.json()).filter(q => !bank.excluded.includes(q.id));
        if (token !== loadToken) return;
        allQuestions = questions;
        currentChapter = chapter;
        markChapterButtons(chapter, false);

        // Cập nhật giới hạn tối đa cho thanh kéo bằng đúng tổng số câu hỏi của chương
        const slider = document.getElementById("question-slider");
        slider.max = allQuestions.length;
        setQuestionCount(parseInt(slider.value));

        // Mở màn hình setup
        showSetupScreen();
    } catch (error) {
        console.error("Lỗi tải file câu hỏi:", error);
        document.getElementById("setup-screen").innerHTML = "<h3 style='color:red'>Lỗi kết nối dữ liệu. Vui lòng tải lại trang!</h3>";
    }
}

// 2. Các hàm điều khiển màn hình Thiết lập (Setup)
function showSetupScreen() {
    document.getElementById("setup-screen").classList.remove("hidden");
    document.getElementById("quiz-screen").classList.add("hidden");
    document.getElementById("result-screen").classList.add("hidden");
}

function updateSliderValue(val) {
    document.getElementById("slider-value").innerText = val;
}

function setQuestionCount(num) {
    const slider = document.getElementById("question-slider");
    // Đảm bảo không chọn quá số câu hiện có trong database
    num = Math.min(num, allQuestions.length);
    slider.value = num;
    updateSliderValue(num);
}

// Hàm xáo trộn mảng thuật toán Fisher-Yates (Đảm bảo random đều, không trùng lặp)
function shuffleArray(array) {
    let shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// 3. Bắt đầu màn chơi
function startQuiz() {
    const numQuestions = parseInt(document.getElementById("question-slider").value);
    
    // Xáo trộn toàn bộ ngân hàng câu hỏi
    const shuffledQuestions = shuffleArray(allQuestions);
    
    // Cắt lấy đúng số lượng câu người dùng chọn
    activeQuestions = shuffledQuestions.slice(0, numQuestions);
    
    // Reset điểm và index
    currentIndex = 0;
    score = 0;
    correctCount = 0;
    quizTime = 0;
    clearInterval(clockTimer);
    clockTimer = setInterval(updateClock, 250);
    
    // Đổi giao diện
    document.getElementById("setup-screen").classList.add("hidden");
    document.getElementById("quiz-screen").classList.remove("hidden");
    
    showQuestion();
}

// 4. Render câu hỏi (ĐÃ THÊM LOGIC XÁO TRỘN ĐÁP ÁN)
function showQuestion() {
    canAnswer = true;
    const currentQ = activeQuestions[currentIndex];
    questionShownAt = performance.now();
    updateClock();

    document.getElementById("question-progress").innerText = `Câu ${currentIndex + 1} / ${activeQuestions.length}`;
    document.getElementById("score-display").innerText = `Điểm: ${score}`;
    document.getElementById("question-text").innerText = currentQ.question;
    
    const explanationBox = document.getElementById("explanation-box");
    explanationBox.classList.add("hidden");

    const container = document.getElementById("options-container");
    container.innerHTML = ""; 

    // --- BƯỚC XÁO TRỘN VỊ TRÍ ĐÁP ÁN ---
    // 1. Tạo một mảng tạm chứa nội dung đáp án và cờ đánh dấu đâu là đáp án đúng gốc
    let optionsWithStatus = currentQ.options.map((optText, originalIndex) => {
        return {
            text: optText,
            isCorrect: (originalIndex === currentQ.correct)
        };
    });

    // 2. Xáo trộn ngẫu nhiên mảng tạm này
    let shuffledOptions = shuffleArray(optionsWithStatus);

    // 3. Tìm xem đáp án đúng hiện tại đã bị đảo tới vị trí (index) số mấy
    currentQ.currentCorrectIndex = shuffledOptions.findIndex(opt => opt.isCorrect === true);

    // 4. Tạo nút bấm dựa trên danh sách đã xáo trộn
    shuffledOptions.forEach((optObj, newIndex) => {
        const btn = document.createElement("button");
        btn.className = "option-btn";
        btn.innerText = optObj.text; // Hiển thị nội dung chữ
        btn.onclick = () => selectAnswer(newIndex); // Gắn sự kiện click với vị trí mới
        container.appendChild(btn);
    });
}

// 5. Xử lý khi chọn đáp án
function selectAnswer(selectedIndex) {
    if (!canAnswer) return;
    quizTime += (performance.now() - questionShownAt) / 1000;
    canAnswer = false; 
    updateClock();

    const currentQ = activeQuestions[currentIndex];
    const buttons = document.querySelectorAll(".option-btn");
    const explanationBox = document.getElementById("explanation-box");

    let isCorrect = (selectedIndex === currentQ.currentCorrectIndex);
    
    // Đổi màu các nút
    buttons.forEach((btn, index) => {
        if (index === currentQ.currentCorrectIndex) {
            btn.classList.add("correct-choice"); // Đáp án đúng -> Xanh lá
        } else if (index === selectedIndex) {
            btn.classList.add("wrong-choice");   // Ô chọn sai -> Đỏ
        } else {
            btn.style.opacity = "0.4";           // Làm mờ các ô không được chọn
        }
    });

    // Lấy nội dung text của đáp án đúng để in ra màn hình
    const correctText = buttons[currentQ.currentCorrectIndex].innerText;

    // Reset lại class của hộp giải thích (hiển thị hộp)
    explanationBox.classList.remove("hidden", "explain-correct", "explain-wrong");

    // Xóa câu "Đáp án đúng là A/B/C/D" bị fix cứng từ Excel
    let expText = currentQ.explanation || "";
    if (expText.includes("Đáp án đúng là")) {
        expText = ""; // Bỏ đi vì ta đã có câu thông báo chi tiết bên dưới
    }

    // Xử lý thông báo và điểm
    if (isCorrect) {
        score += 10;
        correctCount++;
        explanationBox.classList.add("explain-correct");
        explanationBox.innerHTML = `<strong>🎉 CHÍNH XÁC!</strong><br>${expText}`;
    } else {
        explanationBox.classList.add("explain-wrong");
        explanationBox.innerHTML = `<strong>❌ SAI RỒI! Đáp án đúng là: ${correctText}</strong><br>${expText}`;
    }

    document.getElementById("score-display").innerText = `Điểm: ${score}`;

    // Chuyển câu sau 3.5 giây
    setTimeout(() => {
        currentIndex++;
        if (currentIndex < activeQuestions.length) {
            showQuestion();
        } else {
            finishQuiz();
        }
    }, 3500); 
}

// 6. Hoàn thành
function finishQuiz() {
    document.getElementById("quiz-screen").classList.add("hidden");
    const resultScreen = document.getElementById("result-screen");
    resultScreen.classList.remove("hidden");
    
    const maxScore = activeQuestions.length * 10;
    document.getElementById("final-score").innerText = `Bạn đạt được: ${score} / ${maxScore} điểm!`;
    clearInterval(clockTimer);
    document.getElementById("final-time").innerText =
        `Đúng ${correctCount} / ${activeQuestions.length} câu · Thời gian: ${formatClock(quizTime)}`;
    submitQuizResult(activeQuestions.length, correctCount, quizTime);
}

// Gửi kết quả lên bảng xếp hạng Quiz (SUTA-QUIZ-LB). Khách (401) -> nhắc đăng nhập.
async function submitQuizResult(questionCount, correct, seconds) {
    const status = document.getElementById("save-status");
    status.innerText = "Đang lưu kết quả...";
    try {
        const response = await fetch('/api/quiz/result', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                question_count: questionCount,
                correct_count: correct,
                time_seconds: Math.max(seconds, 0.01),
            }),
        });
        if (response.status === 401) {
            status.innerText = "Đăng nhập ở trang chủ để kết quả được tính vào bảng xếp hạng.";
        } else if (response.ok) {
            status.innerText = "Đã lưu vào bảng xếp hạng Quiz!";
        } else {
            throw new Error(`HTTP ${response.status}`);
        }
    } catch (error) {
        console.error("Lỗi lưu kết quả quiz:", error);
        status.innerText = "Không lưu được kết quả, vui lòng thử lại sau.";
    }
}

// Chạy hàm khi trang web tải xong
window.onload = () => selectChapter(chapterFromUrl());