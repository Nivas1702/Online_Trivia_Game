let currentCategory;
let currentQuestionIndex;
let score;
let totalTimer;
let questionTimer;
let questions;

function startQuiz(category) {
  currentCategory = category;
  currentQuestionIndex = 0;
  score = 0;

  document.getElementById('category-selection').style.display = 'none';
  document.getElementById('quiz').style.display = 'block';

  fetchTriviaQuestions(category)
    .then(data => {
      questions = data;
      startTotalTimer();
      showQuestion();
    })
    .catch(error => {
      console.log(error);
      alert('Failed to fetch trivia questions. Please try again later.');
    });
}

const categoryIds = {
  history: 23,
  science: 17,
  sports: 21,
  currentAffairs: 24
  // Add more categories and their IDs here
};

// this function is used to fetch the questions from the opentdb api//
function fetchTriviaQuestions(category) {
  const amount = 10; // Specify the number of questions to fetch
  const categoryId = categoryIds[category];

  if (!categoryId) {
    return Promise.reject(new Error('Invalid category'));
  }

  const url = `https://opentdb.com/api.php?amount=${amount}&category=${categoryId}&difficulty=medium&type=multiple`;

  return fetch(url)
    .then(response => response.json())
    .then(data => {
      if (data.response_code === 0) {
        return data.results.map(result => ({
          question: result.question,
          options: result.incorrect_answers.concat(result.correct_answer),
          answer: result.correct_answer
        }));
      } else {
        throw new Error('Failed to fetch trivia questions.');
      }
    });
}

// this function displays the questions on the view//
function showQuestion() {
  const question = questions[currentQuestionIndex];

  document.getElementById('question').textContent = question.question;

  const optionsContainer = document.getElementById('options');
  optionsContainer.innerHTML = '';

  for (let i = 0; i < question.options.length; i++) {
    const option = document.createElement('button');
    option.textContent = question.options[i];
    option.classList.add('option');
    option.onclick = () => selectAnswer(question.options[i]);
    optionsContainer.appendChild(option);
  }

  const skipButton = document.createElement('button');
  skipButton.textContent = 'Skip';
  skipButton.classList.add('skip-button');
  skipButton.onclick = skipQuestion;
  optionsContainer.appendChild(skipButton);

  const backButton = document.createElement('button');
  backButton.textContent = 'Back';
  backButton.classList.add('back-button');
  backButton.onclick = goBackToCategorySelection;
  optionsContainer.appendChild(backButton);

  startQuestionTimer();
}

// this function selects the right answer//
function selectAnswer(selectedOption) {
  const question = questions[currentQuestionIndex];

  clearInterval(questionTimer);

  if (selectedOption === question.answer) {
    document.getElementById('feedback').innerHTML = '<span class="correct-feedback">Correct!</span>';
    score++;
  } else {
    document.getElementById('feedback').innerHTML = '<span class="incorrect-feedback">Incorrect!</span> The correct answer is: <span class="correct-answer">' + question.answer + '</span>';
  }

  document.getElementById('score').textContent = 'Score: ' + score;

  currentQuestionIndex++;

  if (currentQuestionIndex < questions.length) {
    setTimeout(showQuestion, 2000);
  } else {
    setTimeout(endQuiz, 2000);
  }
}


// this function is uesd to skip to the next question//
function skipQuestion() {
  currentQuestionIndex++;

  if (currentQuestionIndex < questions.length) {
    showQuestion();
  } else {
    endQuiz();
  }
}

function goBackToCategorySelection() {
  clearInterval(totalTimer);
  clearInterval(questionTimer);
  document.getElementById('quiz').style.display = 'none';
  document.getElementById('feedback').textContent = '';
  document.getElementById('score').textContent = '';
  document.getElementById('category-selection').style.display = 'block';
}

function startQuestionTimer() {
  let timeLeft = 30; // Set the question timer duration (in seconds)
  document.getElementById('timer').textContent = timeLeft;

  clearInterval(questionTimer);

  questionTimer = setInterval(() => {
    timeLeft--;
    document.getElementById('timer').textContent = timeLeft;

    if (timeLeft === 0) {
      clearInterval(questionTimer);
      selectAnswer(null);
    }
  }, 1000);
}

function startTotalTimer() {
  let timeLeft = 5 * 60; // Set the timer duration to 5 minutes in seconds
  document.getElementById('total-timer').textContent = formatTime(timeLeft);

  clearInterval(totalTimer);

  totalTimer = setInterval(() => {
    timeLeft--;
    document.getElementById('total-timer').textContent = formatTime(timeLeft);

    if (timeLeft === 0) {
      clearInterval(totalTimer);
      endQuiz();
    }
  }, 1000);
}

function formatTime(time) {
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function endQuiz() {
  clearInterval(totalTimer);
  clearInterval(questionTimer);
  document.getElementById('quiz').style.display = 'none';
  document.getElementById('feedback').innerHTML = '';

  // Show the user's final score
  const finalScore = ((score / questions.length) * 100).toFixed(2);
  const feedbackMessage = getFeedbackMessage(finalScore);

  const scoreElement = document.createElement('p');
  scoreElement.textContent = 'Your last final score: ' + finalScore + '%';
  document.getElementById('score').appendChild(scoreElement);

  const feedbackElement = document.createElement('p');
  feedbackElement.textContent = feedbackMessage;
  feedbackElement.classList.add('feedback-message');
  document.getElementById('feedback').appendChild(feedbackElement);

  const userFeedback = prompt('Please provide your feedback on the quiz:');
  console.log('User Feedback:', userFeedback);

  // Reset the quiz
  score = 0; // Reset the score to 0
  currentQuestionIndex = 0; // Reset the current question index
  document.getElementById('category-selection').style.display = 'block';
}

function getFeedbackMessage(score) {
  if (score >= 90) {
    return 'Congratulations! You did an excellent job!';
  } else if (score >= 70) {
    return 'Great job! You did well!';
  } else if (score >= 50) {
    return 'Good effort! Keep improving!';
  } else {
    return 'Don\'t worry, keep learning and try again!';
  }
}
