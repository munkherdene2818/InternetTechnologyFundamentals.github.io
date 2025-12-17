const wordDisplay = document.querySelector(".word-display");
const keyboardDiv = document.querySelector(".keyboard");
const hangmanImage = document.querySelector(".hangman-img");
const guessesDisplay = document.querySelector("#guesses-display");
const stageDisplay = document.querySelector("#stage-display");
const gameModal = document.querySelector(".game-modal");
const modalTitle = document.querySelector("#modal-title");
const modalText = document.querySelector("#modal-text");
const modalNext = document.querySelector("#modal-next");
const modalRestart = document.querySelector("#modal-restart");

const hintText = document.querySelector("#hint-text");
const wrongLettersEl = document.querySelector("#wrong-letters");
const statusText = document.querySelector("#status-text");
const timerDisplay = document.querySelector("#timer-display");
const stageBox = document.querySelector(".stage");

const nextWordBtn = document.querySelector("#next-word");
const restartBtn = document.querySelector("#restart-game");

const mongolQuiz = [


  { word: "көрри", hint: "3pt goat" },
  { word: "жордан", hint: "Ямаа" },
  { word: "кобе", hint: "Black Mamba" },
  { word: "леброн", hint: "You are my sunshine(үеэ андуурсан өвгөн)" },
  { word: "яннис", hint: "Грекийн бурхан" },
  { word: "дурант", hint: "Гилжгий толгойт" },
  { word: "дончич", hint: "шүүгчийн нөхөр" },

  { word: "индианна", hint: "Бүх цаг үеийн хамгийн утаа баг" },
  { word: "нохой бевэрли", hint: "Баяраагийн хамаатний ах" },
];


const MN_LETTERS = "а б в г д е ё ж з и й к л м н о ө п р с т у ү ф х ц ч ш щ ъ ы ь э ю я".split(" ");

const maxGuesses = 6;
const totalStages = 5;
const gameTimeLimit = 180; 

let runWords = [];       
let stageIndex = 0;      
let currentWord = "";
let chars = [];
let revealed = [];
let revealedCount = 0;

let wrongGuessCount = 0; 
let wrongLetters = [];   
let timerInterval = null;

function shuffle(arr){
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--){
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
}

function updateHangmanImage() {
  const idx = Math.min(1 + wrongGuessCount, 7); 
  hangmanImage.src = `zurag${idx}.png`;
}

function flashStatus(text) {
  statusText.textContent = text;
}

function resetKeyboard() {
  keyboardDiv.querySelectorAll("button").forEach(btn => {
    btn.disabled = false;
    btn.removeAttribute("data-state");
  });
}

function disableKeyboardAll() {
  keyboardDiv.querySelectorAll("button").forEach(btn => (btn.disabled = true));
}

function buildWordUI() {
  wordDisplay.innerHTML = chars.map(() => `<li class="letter"></li>`).join("");
}

function markLetterAt(index, letter) {
  const li = wordDisplay.querySelectorAll("li")[index];
  li.textContent = letter.toUpperCase();
  li.classList.add("guessed");
}

function startTimer() {
  clearInterval(timerInterval);
  let timeLeft = gameTimeLimit;
  timerDisplay.textContent = formatTime(timeLeft);

  timerInterval = setInterval(() => {
    timeLeft -= 1;
    timerDisplay.textContent = formatTime(Math.max(timeLeft, 0));
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      gameOver(false, true);
    }
  }, 1000);
}

function showModal(title, messageHtml, showNext, showRestart) {
  modalTitle.textContent = title;
  modalText.innerHTML = messageHtml;
  modalNext.hidden = !showNext;
  modalRestart.hidden = !showRestart;
  gameModal.classList.add("show");
}

function hideModal() {
  gameModal.classList.remove("show");
}

function startNewRun() {

  const pool = shuffle(mongolQuiz);
  runWords = pool.slice(0, totalStages);
  stageIndex = 0;

  wrongGuessCount = 0;      
  updateHangmanImage();
  guessesDisplay.textContent = `${wrongGuessCount} / ${maxGuesses}`;

  loadStage(stageIndex);
}

function loadStage(idx) {
  const { word, hint } = runWords[idx];
  currentWord = String(word).toLowerCase();
  chars = [...currentWord];

  revealed = Array(chars.length).fill(false);
  revealedCount = 0;

  
  wrongLetters = [];
  wrongLettersEl.textContent = "—";

  hintText.textContent = hint;
  stageDisplay.textContent = `${idx + 1} / ${totalStages}`;

  buildWordUI();
  resetKeyboard();

  updateHangmanImage();
  guessesDisplay.textContent = `${wrongGuessCount} / ${maxGuesses}`;

  flashStatus("Үсэг сонгоорой…");
  nextWordBtn.disabled = true;

  hideModal();
  startTimer();
}

function revealNextOccurrence(letter) {
  
  const i = chars.findIndex((ch, idx) => ch === letter && !revealed[idx]);
  if (i === -1) return false;
  revealed[i] = true;
  revealedCount += 1;
  markLetterAt(i, letter);
  return true;
}

function hasMoreHidden(letter) {
  return chars.some((ch, idx) => ch === letter && !revealed[idx]);
}

function punchShake() {
  stageBox.classList.add("shake");
  setTimeout(() => stageBox.classList.remove("shake"), 220);
}

function checkStageWin() {
  if (revealedCount === chars.length) {
    clearInterval(timerInterval);
    disableKeyboardAll();

    
    nextWordBtn.disabled = false;

    if (stageIndex < totalStages - 1) {
      showModal(
        `✅ ${stageIndex + 1}-р үе амжилттай!`,
        `Та үгийг бүтээв: <b>${currentWord.toUpperCase()}</b><br/><span style="opacity:.85">Одоо дараагийн үг рүү орно.</span>`,
        true,
        false
      );
    } else {
      showModal(
        "🏆 ТА ЯЛЛАА!",
        `Та 5/5 үгийг дарааллан таалаа!<br/>Нийт алдаа: <b>${wrongGuessCount} / ${maxGuesses}</b>`,
        false,
        true
      );
    }
    return true;
  }
  return false;
}

function gameOver(isVictory, isTimeout = false) {
  clearInterval(timerInterval);
  disableKeyboardAll();
  nextWordBtn.disabled = true;

  if (isVictory) {
    showModal("🏆 ТА ЯЛЛАА!", `Нийт алдаа: <b>${wrongGuessCount} / ${maxGuesses}</b>`, false, true);
    return;
  }

  const reason = isTimeout ? "⏳ Хугацаа дууслаа!" : "💀 Алдаа 6 хүрлээ!";
  showModal(
    "Тоглоом дууслаа",
    `${reason}<br/>Та <b>${stageIndex + 1} / ${totalStages}</b> үе дээр дууслаа.<br/>Сүүлийн зөв үг: <b>${currentWord.toUpperCase()}</b>`,
    false,
    true
  );
}

function initGame(button, clickedLetter) {
  const letter = clickedLetter.toLowerCase();

  
  if (chars.includes(letter)) {
    const opened = revealNextOccurrence(letter);
    if (!opened) return; 

    button.setAttribute("data-state", "good");
    flashStatus("Зөв! ✅");

    
    if (!hasMoreHidden(letter)) {
      button.disabled = true;
    }

    checkStageWin();
    return;
  }

  
  wrongGuessCount += 1;
  wrongLetters.push(letter);

  button.setAttribute("data-state", "bad");
  button.disabled = true;

  guessesDisplay.textContent = `${wrongGuessCount} / ${maxGuesses}`;
  wrongLettersEl.textContent = wrongLetters.map(l => l.toUpperCase()).join(" • ");

  updateHangmanImage();
  punchShake();
  flashStatus("Буруу… ❌");

  if (wrongGuessCount >= maxGuesses) return gameOver(false, false);
}

function buildKeyboard() {
  keyboardDiv.innerHTML = "";
  MN_LETTERS.forEach((L) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = L.toUpperCase();
    btn.dataset.letter = L.toLowerCase();
    keyboardDiv.appendChild(btn);

    btn.addEventListener("click", (e) => initGame(e.target, btn.dataset.letter));
  });
}


window.addEventListener("keydown", (e) => {
  const key = String(e.key || "").toLowerCase();
  if (!MN_LETTERS.includes(key)) return;

  const btn = keyboardDiv.querySelector(`button[data-letter="${CSS.escape(key)}"]`);
  if (btn && !btn.disabled) btn.click();
});

function goNextStage() {
  if (stageIndex >= totalStages - 1) return;
  stageIndex += 1;
  loadStage(stageIndex);
}

modalNext.addEventListener("click", goNextStage);
nextWordBtn.addEventListener("click", goNextStage);

modalRestart.addEventListener("click", startNewRun);
restartBtn.addEventListener("click", startNewRun);


buildKeyboard();
startNewRun();
