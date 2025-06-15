// Lấy các phần tử HTML cần thiết
const subjectSelect = document.getElementById("subject-select");
const weekSelect = document.getElementById("week-select");
const questionContainer = document.getElementById("question-container");
const submitButton = document.getElementById("submit-button");
// const savePdfButton = document.getElementById("save-pdf-button"); // Đã bỏ
const resultPanel = document.getElementById("result-panel");

let currentQuestions = []; // Biến để lưu trữ các câu hỏi hiện tại

// Mảng các câu khen ngợi
const correctFeedbackPhrases = [
  "Fantastic job, Alex! You got it!",
  "Woohoo! That's super correct!",
  "Awesome! You're a superstar!",
  "Great work! Keep shining!",
  "You're amazing! Absolutely right!",
  "Excellent! That's exactly it!",
  "Perfect score for that one! Go Alex!",
  "Nailed it! So smart!",
  "Hooray! Correct answer!",
  "Superb! You're a winner!",
];

// Mảng các câu động viên khi sai
const incorrectFeedbackPhrases = [
  "Oops, not quite! Keep trying!",
  "Almost there! Learn from this one!",
  "Don't worry, practice makes perfect!",
  "Good try! Let's see the correct answer.",
  "That's okay! We all make mistakes. You'll get it next time!",
  "Chin up! You're learning a lot!",
  "Close one! Time to learn something new!",
  "Think positive! Every mistake helps you learn!",
];

// New arrays for overall score feedback
const lowScoreFeedback = [
    "Great effort, Alex! Keep practicing, you're getting closer!",
    "Learning is a journey, Alex! Every step counts. You'll get there!",
    "Don't give up, superstar! This is just the beginning. Try again, you've got this!",
    "You're doing wonderfully just by trying! Let's review and grow stronger!",
    "Awesome job completing the test, Alex! Let's learn from these questions together!",
    "Every try makes you smarter! You're on your way to becoming an English master!",
];

const mediumScoreFeedback = [
    "Good job, Alex! You're really understanding a lot. Keep up the great work!",
    "You're doing very well, Alex! A little more practice and you'll be a pro!",
    "Fantastic progress! You're learning so much. Let's aim even higher next time!",
    "Way to go, Alex! Your hard work is paying off. Keep building those skills!",
    "Super! You're picking things up quickly. Keep challenging yourself!",
];

const highScoreFeedback = [
    "Absolutely brilliant, Alex! You're a true English whiz!",
    "Wow! What an amazing score, Alex! You're incredibly smart!",
    "You aced it, superstar! Truly outstanding work!",
    "Unbelievable! You're a champion, Alex! Keep up the excellent learning!",
    "Magnificent! Your dedication shines through! So proud of you!",
    "Pure genius! You totally rocked this test, Alex!",
];

// Hiển thị thông báo hướng dẫn ban đầu khi trang tải lần đầu
function showInitialInstruction() {
  questionContainer.innerHTML = `
    <div style="text-align: center; padding: 40px; background-color: #ffe0b2; border-radius: 12px; border: 2px dashed #ff9800; color: #e65100; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
        <p style="font-size: 2.2em; font-weight: bold; margin-bottom: 20px;">Hey Alex! 👋 Let's learn!</p>
        <p style="font-size: 1.5em; margin-top: 15px; color: #4a148c;">Choose a <strong>Subject</strong> and a <strong>Week</strong> from the dropdown lists above to start your awesome test!</p>
        <p style="font-size: 1.2em; margin-top: 10px; color: #777;">Mom has prepared some fun challenges just for you!</p>
    </div>
  `;
  resultPanel.innerHTML = ""; // Clear previous results
  resultPanel.style.display = 'none'; // Hide result panel
}

// Hàm để nạp và hiển thị câu hỏi
function loadQuestions() {
  const selectedSubject = subjectSelect.value;
  const selectedWeek = weekSelect.value;

  // Nếu chưa có môn học hoặc tuần nào được chọn, hiển thị hướng dẫn
  if (!selectedSubject || !selectedWeek) {
    showInitialInstruction();
    currentQuestions = []; // Reset questions
    return;
  }

  const jsonUrl = `data/${selectedWeek}/${selectedSubject}.json`;

  // Hiển thị thông báo đang tải
  questionContainer.innerHTML = "<p style='text-align: center; font-size: 1.5em; color: #555; margin-top: 30px;'>Loading awesome questions... just a sec!</p>";
  resultPanel.innerHTML = ""; // Clear previous results
  resultPanel.style.display = 'none'; // Hide result panel


  fetch(jsonUrl)
    .then((response) => {
      if (!response.ok) {
        // Kiểm tra lỗi HTTP (ví dụ: 404 Not Found)
        throw new Error(`HTTP error! Status: ${response.status} - Could not load ${jsonUrl}. Please check the file path and ensure it's there.`);
      }
      return response.json();
    })
    .then((data) => {
      // Khởi tạo trạng thái cho mỗi câu hỏi khi tải
      currentQuestions = data.map(q => ({
          ...q, // Sao chép tất cả các thuộc tính hiện có
          isAnswered: false, // Thêm thuộc tính để theo dõi đã trả lời chưa
          isCorrect: false // Thêm thuộc tính để theo dõi có đúng không
      }));

      if (!currentQuestions || currentQuestions.length === 0) {
        questionContainer.innerHTML = `<p style="color: orange; text-align: center; font-size: 1.5em; margin-top: 30px;">Uh oh! No questions found for ${selectedSubject} in ${selectedWeek}. Maybe try another week?</p>`;
      } else {
        displayQuestions(currentQuestions);
      }
    })
    .catch((error) => {
      console.error("Error loading JSON:", error);
      questionContainer.innerHTML = `<p style="color: red; text-align: center; font-size: 1.5em; margin-top: 30px;">Woops! Something went wrong loading questions. Error: ${error.message}</p>`;
    });
}

// Hàm để hiển thị câu hỏi
function displayQuestions(questions) {
  // Xóa nội dung cũ trong questionContainer
  questionContainer.innerHTML = "";

  // Duyệt qua từng câu hỏi trong mảng questions
  questions.forEach((question, index) => {
    // Tạo một phần tử div để chứa câu hỏi
    const questionDiv = document.createElement("div");
    questionDiv.classList.add("question"); // Thêm class "question" để định dạng CSS
    questionDiv.dataset.questionIndex = index; // Lưu index của câu hỏi
    questionDiv.style.position = 'relative'; // Quan trọng cho emoji absolute

    // Tạo một phần tử p để hiển thị nội dung câu hỏi
    const questionText = document.createElement("p");
    questionText.textContent = `${index + 1}. ${question.text}`; // Thêm số thứ tự câu hỏi
    questionDiv.appendChild(questionText);

    // Tạo các phần tử HTML tùy thuộc vào loại câu hỏi
    switch (question.type) {
      case "mcq":
        question.options.forEach((option) => {
          const radioInput = document.createElement("input");
          radioInput.type = "radio";
          radioInput.name = `question-${index}`; // Đặt name để nhóm các radio button
          radioInput.value = option;
          radioInput.id = `q${index}-option-${option.replace(/\s+/g, '-')}`; // Thêm ID duy nhất

          const label = document.createElement("label");
          label.htmlFor = radioInput.id; // Liên kết label với input
          label.textContent = option;
          label.prepend(radioInput); // Đặt radio button ở đầu đáp án

          questionDiv.appendChild(label);
        });
        break;

      case "truefalse":
        // Tạo các nút radio cho True và False
        const trueLabel = document.createElement("label");
        const trueInput = document.createElement("input");
        trueInput.type = "radio";
        trueInput.name = `question-${index}`;
        trueInput.value = "true"; // Giá trị là string "true"
        trueInput.id = `q${index}-true`;
        trueLabel.htmlFor = trueInput.id;
        trueLabel.prepend(trueInput);
        trueLabel.append(" True"); // Thêm text " True"
        questionDiv.appendChild(trueLabel);

        const falseLabel = document.createElement("label");
        const falseInput = document.createElement("input");
        falseInput.type = "radio";
        falseInput.name = `question-${index}`;
        falseInput.value = "false"; // Giá trị là string "false"
        falseInput.id = `q${index}-false`;
        falseLabel.htmlFor = falseInput.id;
        falseLabel.prepend(falseInput);
        falseLabel.append(" False"); // Thêm text " False"
        questionDiv.appendChild(falseLabel);
        break;

      case "fillin":
        // Tạo một ô input riêng biệt cho fill-in
        const fillInInput = document.createElement("input");
        fillInInput.type = "text"; // Giữ là text để cho phép nhập các ký tự khác nếu cần, nhưng sẽ parse số
        fillInInput.name = `question-${index}`;
        fillInInput.classList.add("fill-in-blank-standalone"); // New class for standalone blank
        fillInInput.placeholder = "Type your answer here"; // A helpful placeholder
        questionDiv.appendChild(fillInInput);
        break;

      case "WriteAnswer":
        const writeAnswerTextarea = document.createElement("textarea");
        writeAnswerTextarea.name = `question-${index}`;
        writeAnswerTextarea.rows = "4"; // Số hàng mặc định
        writeAnswerTextarea.classList.add("write-answer-textarea");
        writeAnswerTextarea.placeholder = "Write your answer here...";
        questionDiv.appendChild(writeAnswerTextarea);
        break;
    }

    // Tạo một nút "Check Answer"
    const checkButton = document.createElement("button");
    checkButton.textContent = "Check Answer";
    checkButton.classList.add("check-answer-button");
    checkButton.addEventListener("click", () => {
      checkAnswer(question, index, checkButton); // Truyền nút vào hàm
    });
    questionDiv.appendChild(checkButton);

    // Thêm questionDiv vào questionContainer
    questionContainer.appendChild(questionDiv);
  });
}

// Hàm để kiểm tra đáp án
function checkAnswer(question, index, checkButton) { // Thêm checkButton làm tham số
  // Lấy div chứa câu hỏi cụ thể này
  const questionDiv = document.querySelector(`.question[data-question-index="${index}"]`);

  // Xóa thông báo kết quả cũ (nếu có)
  const existingResultMessage = questionDiv.querySelector(".result-message");
  if (existingResultMessage) {
    existingResultMessage.remove();
  }
  // Xóa emoji cũ (nếu có)
  const existingEmoji = questionDiv.querySelector(".feedback-emoji");
  if (existingEmoji) {
    existingEmoji.remove();
  }

  let userAnswer;
  let inputElements; // Biến để lưu trữ phần tử input/textarea (có thể là NodeList)

  // Lấy đáp án của người dùng tùy thuộc vào loại câu hỏi
  switch (question.type) {
    case "mcq":
    case "truefalse":
      const selectedRadio = questionDiv.querySelector(
        `input[name="question-${index}"]:checked`
      );
      if (selectedRadio) {
        userAnswer = selectedRadio.value;
        inputElements = questionDiv.querySelectorAll(`input[name="question-${index}"]`);
      } else {
        const resultParagraph = createResultMessage("Hey! Don't forget to pick an answer!", "orange");
        questionDiv.appendChild(resultParagraph);
        return; // Dừng việc kiểm tra đáp án
      }
      break;

    case "fillin":
      const fillInInput = questionDiv.querySelector(
        `input[name="question-${index}"]`
      );
      if (fillInInput) {
        userAnswer = fillInInput.value.trim(); // Lấy giá trị và loại bỏ khoảng trắng
        inputElements = [fillInInput]; // Bọc vào mảng để xử lý chung
      } else {
        userAnswer = "";
      }
      if (userAnswer === "") {
        const resultParagraph = createResultMessage("Oops! Please fill in the blank before checking.", "orange");
        questionDiv.appendChild(resultParagraph);
        return;
      }
      break;

    case "WriteAnswer":
      const writeAnswerTextarea = questionDiv.querySelector(
        `textarea[name="question-${index}"]`
      );
      if (writeAnswerTextarea) {
        userAnswer = writeAnswerTextarea.value.trim();
        inputElements = [writeAnswerTextarea]; // Bọc vào mảng để xử lý chung
      } else {
        userAnswer = "";
      }
      if (userAnswer === "") {
        const resultParagraph = createResultMessage("Almost there! Write your answer first.", "orange");
        questionDiv.appendChild(resultParagraph);
        return;
      }
      break;
  }

  // Kiểm tra đáp án
  let isCorrect = false;
  let formattedCorrectAnswer = String(question.answer); // Mặc định là chuỗi, sẽ định dạng lại nếu là số

  if (question.type === "truefalse") {
    const userAnswerBool = (userAnswer === "true");
    isCorrect = (userAnswerBool === question.answer);
  } else if (question.type === "fillin" && typeof question.answer === 'number') {
      // Xử lý đặc biệt cho câu hỏi toán dạng fillin với đáp án là số
      // Loại bỏ dấu chấm, phẩy, và các ký tự không phải số để parse
      const cleanedUserAnswer = userAnswer.replace(/[.,]/g, ''); // Remove commas and dots
      const parsedUserAnswer = parseInt(cleanedUserAnswer, 10); // Parse as integer

      isCorrect = parsedUserAnswer === question.answer;

      // Định dạng đáp án đúng với dấu chấm phân cách hàng nghìn cho hiển thị
      formattedCorrectAnswer = question.answer.toLocaleString('vi-VN'); // Sử dụng locale 'vi-VN' cho dấu chấm
  } else {
    // Xử lý cho MCQ, WriteAnswer, hoặc fillin với đáp án dạng chuỗi
    isCorrect = userAnswer.toLowerCase() === String(question.answer).toLowerCase();
  }


  // Cập nhật trạng thái câu hỏi trong mảng currentQuestions
  const qToUpdate = currentQuestions.find((q, i) => i === index);
  if (qToUpdate) {
      qToUpdate.isAnswered = true;
      qToUpdate.isCorrect = isCorrect;
  }


  // Hiển thị kết quả
  let resultMessageText;
  let resultMessageColor;
  // Use formattedCorrectAnswer for display in the explanation
  let explanationText = `The correct answer is: ${formattedCorrectAnswer}. ${question.explanation}`;

  if (isCorrect) {
    resultMessageText = correctFeedbackPhrases[Math.floor(Math.random() * correctFeedbackPhrases.length)];
    resultMessageColor = "green";
    // Trigger confetti!
    if (typeof confetti !== 'undefined') {
        const rect = checkButton.getBoundingClientRect();
        const x = (rect.left + rect.right) / 2 / window.innerWidth;
        const y = (rect.top + rect.bottom) / 2 / window.innerHeight;
        confetti({
            particleCount: 150, // More particles
            spread: 90, // Wider spread
            origin: { x, y }, // Origin from the button
            colors: ['#FFD700', '#FF4500', '#32CD32', '#1E90FF', '#FF1493'], // Fun colors
            disableForReducedMotion: true
        });
    }
  } else {
    resultMessageText = incorrectFeedbackPhrases[Math.floor(Math.random() * incorrectFeedbackPhrases.length)];
    resultMessageColor = "red";
    // Show a sad emoji/icon
    const sadEmoji = document.createElement('span');
    sadEmoji.textContent = '😔'; // Sad emoji
    sadEmoji.classList.add('feedback-emoji'); // Add class for styling
    questionDiv.appendChild(sadEmoji);

    // Fade out after a delay
    setTimeout(() => {
        sadEmoji.style.opacity = '0';
        setTimeout(() => sadEmoji.remove(), 1000); // Remove after fade out
    }, 1500); // Show for 1.5 seconds, then start fading
  }

  const resultParagraph = createResultMessage(resultMessageText, resultMessageColor, explanationText);
  questionDiv.appendChild(resultParagraph);

  // Disable inputs and check button after checking
  if (checkButton) {
      checkButton.disabled = true;
      checkButton.textContent = "Checked!"; // Simpler text
  }

  if (inputElements) {
      inputElements.forEach(input => {
          if (input.type === 'radio' || input.type === 'checkbox') {
              input.disabled = true;
          } else {
              input.readOnly = true;
              input.style.backgroundColor = "#e9ecef"; // Grey out input
          }
      });
  }
}

// Helper function to create result message paragraph
function createResultMessage(text, color, explanation = '') {
  const p = document.createElement("p");
  p.classList.add("result-message");

  // Tạo một thẻ span riêng cho phần thông báo chính (Excellent! / Oops!)
  const feedbackSpan = document.createElement("span");
  feedbackSpan.classList.add("feedback-text"); // Thêm class mới để định dạng CSS
  feedbackSpan.style.color = color;
  feedbackSpan.textContent = text; // Sử dụng textContent để an toàn hơn
  p.appendChild(feedbackSpan);

  if (explanation) {
    // Tạo một thẻ i riêng cho phần giải thích
    const explanationI = document.createElement("i");
    explanationI.classList.add("explanation-text"); // Class đã có, sẽ đảm bảo xuống dòng và nghiêng
    explanationI.textContent = explanation; // Sử dụng textContent để an toàn hơn
    p.appendChild(explanationI);
  }
  return p;
}


// Gọi hàm hiển thị hướng dẫn ban đầu khi trang web được tải
window.addEventListener("load", showInitialInstruction);

// Gọi hàm loadQuestions khi môn học hoặc tuần được chọn
subjectSelect.addEventListener("change", loadQuestions);
weekSelect.addEventListener("change", loadQuestions);

// Xử lý sự kiện khi nút "Show My Score!" được bấm
submitButton.addEventListener("click", () => {
  let totalCorrect = 0;
  let totalAnsweredQuestions = 0; // Số câu hỏi đã được kiểm tra (bấm Check Answer)
  let totalQuestions = currentQuestions.length;
  let score = 0;

  if (totalQuestions === 0) {
      resultPanel.innerHTML = "<p style='color: orange; text-align: center; font-size: 1.2em;'>No questions loaded yet! Select a subject and week first.</p>";
      resultPanel.style.display = 'block';
      resultPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
  }

  // Kiểm tra xem tất cả các câu hỏi đã được kiểm tra chưa
  const allAnswered = currentQuestions.every(q => q.isAnswered);

  // Xóa nội dung cũ của resultPanel trước khi hiển thị kết quả mới
  resultPanel.innerHTML = "";

  if (!allAnswered) {
    // Hiển thị cảnh báo nếu chưa trả lời hết
    const warningDiv = document.createElement('div');
    warningDiv.classList.add('score-summary-warning');
    warningDiv.innerHTML = `
      <p style="font-size: 1.5em; font-weight: bold; color: #e65100;">Hold on, Alex! 👋</p>
      <p style="font-size: 1.2em; color: #4a148c;">It looks like you haven't clicked 'Check Answer' for all questions yet. Please do that first to get your full score!</p>
      <p style="font-size: 1em; color: #777; margin-top: 10px;">(Only questions you've checked will be counted below.)</p>
      <hr style="margin: 15px 0; border: 0; border-top: 1px dashed #ffc107;">
    `;
    resultPanel.appendChild(warningDiv);
  }

  // Tính điểm cho các câu đã được trả lời
  currentQuestions.forEach(q => {
      if (q.isAnswered) { // Chỉ tính điểm cho các câu đã được "Check Answer"
          totalAnsweredQuestions++;
          if (q.isCorrect) {
              totalCorrect++;
              score += 10; // 10 điểm cho mỗi câu đúng
          }
      }
  });

  // Calculate percentage based on total questions in the test, not just answered ones
  const percentageCorrect = (totalCorrect / totalQuestions) * 100;
  let feedbackPhrase;
  let feedbackColor;
  let scoreSummaryClass;

  if (percentageCorrect < 70) {
      feedbackPhrase = lowScoreFeedback[Math.floor(Math.random() * lowScoreFeedback.length)];
      feedbackColor = '#f44336'; // Red
      scoreSummaryClass = 'score-summary-low';
  } else if (percentageCorrect >= 70 && percentageCorrect < 90) {
      feedbackPhrase = mediumScoreFeedback[Math.floor(Math.random() * mediumScoreFeedback.length)];
      feedbackColor = '#ffc107'; // Amber
      scoreSummaryClass = 'score-summary-medium';
  } else { // 90% trở lên
      feedbackPhrase = highScoreFeedback[Math.floor(Math.random() * highScoreFeedback.length)];
      feedbackColor = '#4CAF50'; // Green
      scoreSummaryClass = 'score-summary-high';
  }


  const summaryDiv = document.createElement('div');
  summaryDiv.classList.add('score-summary', scoreSummaryClass); // Add score-specific class


  summaryDiv.innerHTML = `
      <p style="font-size: 2.2em; font-weight: bold; color: ${feedbackColor}; margin-bottom: 10px;">🎉 Your Awesome Result! 🎉</p>
      <p style="font-size: 1.8em; color: #3f51b5;">${feedbackPhrase}</p>
      <p style="font-size: 1.6em; color: #3f51b5; margin-top: 15px;">You got <strong>${totalCorrect}</strong> out of <strong>${totalQuestions}</strong> questions correct!</p>
      <p style="font-size: 1.6em; color: #3f51b5;">Your total score is: <strong>${score} / ${totalQuestions * 10}</strong> points!</p>
      <p style="font-size: 1.2em; color: #777; margin-top: 25px;">Keep up the great work, Alex! Every bit of practice makes you super smart!</p>
  `;
  resultPanel.appendChild(summaryDiv);
  resultPanel.style.display = 'block'; // Đảm bảo result panel hiển thị

  resultPanel.scrollIntoView({ behavior: 'smooth', block: 'start' }); // Cuộn đến phần kết quả
});