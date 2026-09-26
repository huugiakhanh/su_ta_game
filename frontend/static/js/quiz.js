let allQuestions = [];      // Chứa toàn bộ câu hỏi từ JSON
let activeQuestions = [];   // Chứa các câu hỏi đã được random cho lượt chơi này
let currentIndex = 0;
let score = 0;
let canAnswer = true;

// 1. Tải toàn bộ dữ liệu ngay khi mở trang
async function loadQuestions() {
    try {
        const response = await fetch('/static/assets/question/trung-trac-question.json');
        if (!response.ok) throw new Error("Không thể tải file JSON");
        
        allQuestions = await response.json();
        
        // Cập nhật giới hạn tối đa cho thanh kéo bằng đúng tổng số câu hỏi có trong file
        const slider = document.getElementById("question-slider");
        slider.max = allQuestions.length;
        
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
    
    // Đổi giao diện
    document.getElementById("setup-screen").classList.add("hidden");
    document.getElementById("quiz-screen").classList.remove("hidden");
    
    showQuestion();
}

// 4. Render câu hỏi
function showQuestion() {
    canAnswer = true;
    const currentQ = activeQuestions[currentIndex];

    document.getElementById("question-progress").innerText = `Câu ${currentIndex + 1} / ${activeQuestions.length}`;
    document.getElementById("score-display").innerText = `Điểm: ${score}`;
    document.getElementById("question-text").innerText = currentQ.question;
    
    const explanationBox = document.getElementById("explanation-box");
    explanationBox.classList.add("hidden");

    const container = document.getElementById("options-container");
    container.innerHTML = ""; 

    currentQ.options.forEach((opt, idx) => {
        const btn = document.createElement("button");
        btn.className = "option-btn";
        btn.innerText = opt;
        btn.onclick = () => selectAnswer(idx);
        container.appendChild(btn);
    });
}

// 5. Xử lý khi chọn đáp án
function selectAnswer(selectedIndex) {
    if (!canAnswer) return;
    canAnswer = false; 

    const currentQ = activeQuestions[currentIndex];
    const buttons = document.querySelectorAll(".option-btn");
    const explanationBox = document.getElementById("explanation-box");

    if (selectedIndex === currentQ.correct) {
        score += 10;
        buttons[selectedIndex].classList.add("correct-choice");
    } else {
        buttons[selectedIndex].classList.add("wrong-choice");
        buttons[currentQ.correct].classList.add("correct-choice"); 
    }

    if (currentQ.explanation) {
        explanationBox.innerText = currentQ.explanation;
        explanationBox.classList.remove("hidden");
    }

    document.getElementById("score-display").innerText = `Điểm: ${score}`;

    // Tự động chuyển câu sau 2.5 giây
    setTimeout(() => {
        currentIndex++;
        if (currentIndex < activeQuestions.length) {
            showQuestion();
        } else {
            finishQuiz();
        }
    }, 2500);
}

// 6. Hoàn thành
function finishQuiz() {
    document.getElementById("quiz-screen").classList.add("hidden");
    const resultScreen = document.getElementById("result-screen");
    resultScreen.classList.remove("hidden");
    
    const maxScore = activeQuestions.length * 10;
    document.getElementById("final-score").innerText = `Bạn đạt được: ${score} / ${maxScore} điểm!`;
}

// Chạy hàm khi trang web tải xong
window.onload = loadQuestions;