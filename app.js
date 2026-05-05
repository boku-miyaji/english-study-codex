const phrases = [
  {
    id: 1,
    en: "Could you send me the updated schedule?",
    ja: "更新された予定表を送っていただけますか。",
    blank: "Could you send me the updated ____?",
    answer: "schedule",
    category: "Work",
    level: "TOEIC 500",
    note: "Could you ...? は丁寧な依頼の基本形。",
  },
  {
    id: 2,
    en: "I'm looking forward to the meeting.",
    ja: "会議を楽しみにしています。",
    blank: "I'm looking ____ to the meeting.",
    answer: "forward",
    category: "Business",
    level: "TOEIC 600",
    note: "look forward to はメールでも会話でもよく使う。",
  },
  {
    id: 3,
    en: "Let me check the details first.",
    ja: "まず詳細を確認させてください。",
    blank: "Let me check the ____ first.",
    answer: "details",
    category: "Work",
    level: "TOEIC 500",
    note: "Let me ... は自然にワンクッション置ける表現。",
  },
  {
    id: 4,
    en: "The train has been delayed due to heavy rain.",
    ja: "大雨のため電車が遅れています。",
    blank: "The train has been ____ due to heavy rain.",
    answer: "delayed",
    category: "Travel",
    level: "TOEIC 650",
    note: "due to は理由を簡潔に伝える表現。",
  },
  {
    id: 5,
    en: "Please make sure the invoice is attached.",
    ja: "請求書が添付されていることを確認してください。",
    blank: "Please make sure the invoice is ____.",
    answer: "attached",
    category: "Email",
    level: "TOEIC 700",
    note: "make sure は確認依頼の定番。",
  },
  {
    id: 6,
    en: "Would it be possible to reschedule our call?",
    ja: "電話の予定を変更することは可能でしょうか。",
    blank: "Would it be possible to ____ our call?",
    answer: "reschedule",
    category: "Business",
    level: "TOEIC 700",
    note: "Would it be possible to ...? はとても丁寧。",
  },
  {
    id: 7,
    en: "I need to confirm the reservation.",
    ja: "予約を確認する必要があります。",
    blank: "I need to confirm the ____.",
    answer: "reservation",
    category: "Travel",
    level: "TOEIC 550",
    note: "confirm は予約、予定、内容の確認に幅広く使える。",
  },
  {
    id: 8,
    en: "The report is due by Friday.",
    ja: "報告書の締め切りは金曜日です。",
    blank: "The report is ____ by Friday.",
    answer: "due",
    category: "Work",
    level: "TOEIC 600",
    note: "due は締め切りや支払い期限で頻出。",
  },
  {
    id: 9,
    en: "Could you give me a quick update?",
    ja: "簡単に進捗を教えていただけますか。",
    blank: "Could you give me a quick ____?",
    answer: "update",
    category: "Meeting",
    level: "TOEIC 600",
    note: "quick update は会議やチャットで便利。",
  },
  {
    id: 10,
    en: "I appreciate your prompt response.",
    ja: "迅速なご返信に感謝します。",
    blank: "I appreciate your prompt ____.",
    answer: "response",
    category: "Email",
    level: "TOEIC 750",
    note: "appreciate は thank you より少しフォーマル。",
  },
  {
    id: 11,
    en: "This product is currently out of stock.",
    ja: "この商品は現在在庫切れです。",
    blank: "This product is currently out of ____.",
    answer: "stock",
    category: "Shopping",
    level: "TOEIC 550",
    note: "out of stock はECや店舗でよく見る表現。",
  },
  {
    id: 12,
    en: "Let's go over the main points.",
    ja: "要点を確認しましょう。",
    blank: "Let's go ____ the main points.",
    answer: "over",
    category: "Meeting",
    level: "TOEIC 650",
    note: "go over は確認する、見直すという意味。",
  },
];

const storeKey = "furetan-progress-v1";
const initialProgress = {
  learned: [],
  hard: [],
  correct: 0,
  wrong: 0,
  attempts: {},
  dueAt: {},
  lastStudied: new Date().toISOString().slice(0, 10),
};

let progress = loadProgress();
let currentIndex = 0;
let quizMode = "choice";
let currentQuiz = null;

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

function loadProgress() {
  try {
    return { ...initialProgress, ...JSON.parse(localStorage.getItem(storeKey)) };
  } catch {
    return { ...initialProgress };
  }
}

function saveProgress() {
  localStorage.setItem(storeKey, JSON.stringify(progress));
  renderStats();
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function addDays(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function duePhraseIds() {
  const now = today();
  return phrases
    .filter((phrase) => {
      const dueAt = progress.dueAt[phrase.id];
      return progress.hard.includes(phrase.id) || !dueAt || dueAt <= now;
    })
    .map((phrase) => phrase.id);
}

function phraseState(id) {
  return {
    learned: progress.learned.includes(id),
    hard: progress.hard.includes(id),
    attempts: progress.attempts[id] || { correct: 0, wrong: 0 },
  };
}

function nextDuePhrase() {
  const dueIds = duePhraseIds();
  const hard = phrases.find((phrase) => progress.hard.includes(phrase.id) && dueIds.includes(phrase.id));
  if (hard) return hard;
  const due = phrases.find((phrase) => dueIds.includes(phrase.id));
  if (due) return due;
  return phrases[currentIndex % phrases.length];
}

function renderLearn() {
  const phrase = nextDuePhrase();
  currentIndex = phrases.findIndex((item) => item.id === phrase.id);
  $("#phraseCategory").textContent = phrase.category;
  $("#phraseLevel").textContent = phrase.level;
  $("#phraseJa").textContent = phrase.ja;
  $("#phraseEn").textContent = phrase.en;
  $("#phraseNote").textContent = phrase.note;
}

function markPhrase(kind) {
  const phrase = phrases[currentIndex];
  if (kind === "known") {
    progress.learned = unique([...progress.learned, phrase.id]);
    progress.hard = progress.hard.filter((id) => id !== phrase.id);
    const attempts = progress.attempts[phrase.id] || { correct: 0, wrong: 0 };
    progress.dueAt[phrase.id] = addDays(attempts.correct >= 2 ? 7 : 3);
  } else {
    progress.hard = unique([...progress.hard, phrase.id]);
    progress.dueAt[phrase.id] = today();
  }
  currentIndex = (currentIndex + 1) % phrases.length;
  saveProgress();
  renderLearn();
  renderReview();
}

function unique(items) {
  return [...new Set(items)];
}

function speakCurrent() {
  const phrase = phrases[currentIndex];
  if (!("speechSynthesis" in window)) return;
  speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(phrase.en);
  utterance.lang = "en-US";
  utterance.rate = 0.86;
  speechSynthesis.speak(utterance);
}

function switchView(view) {
  $$(".tab").forEach((tab) => tab.classList.toggle("active", tab.dataset.view === view));
  $$(".view").forEach((panel) => panel.classList.remove("active"));
  $(`#${view}View`).classList.add("active");
  if (location.hash.slice(1) !== view) {
    history.replaceState(null, "", `#${view}`);
  }
  if (view === "quiz") renderQuiz();
  if (view === "review") renderReview();
  if (view === "stats") renderStats();
}

function renderQuiz() {
  const pool = progress.hard.length
    ? phrases.filter((phrase) => progress.hard.includes(phrase.id))
    : phrases.filter((phrase) => duePhraseIds().includes(phrase.id));
  const quizPool = pool.length ? pool : phrases;
  currentQuiz = quizPool[Math.floor(Math.random() * quizPool.length)];
  $("#feedback").textContent = "";
  $("#feedback").className = "feedback";

  if (quizMode === "choice") renderChoiceQuiz(currentQuiz);
  if (quizMode === "blank") renderBlankQuiz(currentQuiz);
  if (quizMode === "type") renderTypeQuiz(currentQuiz);
}

function renderChoiceQuiz(phrase) {
  $("#quizLabel").textContent = "日本語から英語";
  $("#quizPrompt").textContent = phrase.ja;
  const choices = shuffle([
    phrase.en,
    ...shuffle(phrases.filter((item) => item.id !== phrase.id)).slice(0, 3).map((item) => item.en),
  ]);
  $("#quizBody").innerHTML = `<div class="choice-grid">${choices
    .map((choice) => `<button class="choice" type="button">${choice}</button>`)
    .join("")}</div>`;

  $$(".choice").forEach((button) => {
    button.addEventListener("click", () => {
      const ok = button.textContent === phrase.en;
      button.classList.add(ok ? "correct" : "wrong");
      $$(".choice").forEach((item) => {
        if (item.textContent === phrase.en) item.classList.add("correct");
        item.disabled = true;
      });
      recordAnswer(phrase.id, ok);
      showFeedback(ok, phrase.en);
    });
  });
}

function renderBlankQuiz(phrase) {
  $("#quizLabel").textContent = "穴埋め";
  $("#quizPrompt").textContent = phrase.ja;
  $("#quizBody").innerHTML = `
    <p class="blank-line">${phrase.blank}</p>
    <input class="blank-input" id="blankInput" autocomplete="off" autocapitalize="none" placeholder="answer" />
    <button class="check-button" id="checkBlankBtn" type="button">判定</button>
  `;
  $("#checkBlankBtn").addEventListener("click", () => {
    const ok = normalize($("#blankInput").value) === normalize(phrase.answer);
    recordAnswer(phrase.id, ok);
    showFeedback(ok, phrase.en);
  });
}

function renderTypeQuiz(phrase) {
  $("#quizLabel").textContent = "瞬間英作文";
  $("#quizPrompt").textContent = phrase.ja;
  $("#quizBody").innerHTML = `
    <input class="type-input" id="typeInput" autocomplete="off" autocapitalize="none" placeholder="English phrase" />
    <button class="check-button" id="checkTypeBtn" type="button">判定</button>
  `;
  $("#checkTypeBtn").addEventListener("click", () => {
    const ok = normalize($("#typeInput").value) === normalize(phrase.en);
    recordAnswer(phrase.id, ok);
    showFeedback(ok, phrase.en);
  });
}

function normalize(value) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[.,!?]/g, "")
    .replace(/\s+/g, " ");
}

function recordAnswer(id, ok) {
  const attempts = progress.attempts[id] || { correct: 0, wrong: 0 };
  if (ok) {
    progress.correct += 1;
    attempts.correct += 1;
    progress.learned = unique([...progress.learned, id]);
    progress.hard = progress.hard.filter((hardId) => hardId !== id);
    progress.dueAt[id] = addDays(attempts.correct >= 2 ? 7 : attempts.correct === 1 ? 3 : 1);
  } else {
    progress.wrong += 1;
    attempts.wrong += 1;
    progress.hard = unique([...progress.hard, id]);
    progress.dueAt[id] = today();
  }
  progress.attempts[id] = attempts;
  saveProgress();
  renderReview();
}

function showFeedback(ok, answer) {
  $("#feedback").textContent = ok ? "正解" : `正解: ${answer}`;
  $("#feedback").className = `feedback ${ok ? "good" : "bad"}`;
}

function renderReview() {
  const hardPhrases = phrases.filter((phrase) => progress.hard.includes(phrase.id));
  if (!hardPhrases.length) {
    $("#reviewList").innerHTML = `<div class="empty">苦手フレーズはありません</div>`;
    return;
  }
  $("#reviewList").innerHTML = hardPhrases
    .map(
      (phrase) => `
        <article class="review-item">
          <strong>${phrase.en}</strong>
          <p>${phrase.ja}</p>
        </article>
      `,
    )
    .join("");
}

function renderStats() {
  const total = progress.correct + progress.wrong;
  const accuracy = total ? Math.round((progress.correct / total) * 100) : 0;
  $("#dueCount").textContent = String(duePhraseIds().length);
  $("#accuracy").textContent = `${accuracy}%`;
  $("#streak").textContent = "1日";
  $("#learnedTotal").textContent = String(progress.learned.length);
  $("#hardTotal").textContent = String(progress.hard.length);
  $("#correctTotal").textContent = String(progress.correct);
  $("#wrongTotal").textContent = String(progress.wrong);

  const categories = [...new Set(phrases.map((phrase) => phrase.category))];
  $("#categoryBars").innerHTML = categories
    .map((category) => {
      const categoryPhrases = phrases.filter((phrase) => phrase.category === category);
      const learned = categoryPhrases.filter((phrase) => progress.learned.includes(phrase.id)).length;
      const pct = Math.round((learned / categoryPhrases.length) * 100);
      return `
        <div class="bar-row">
          <header><span>${category}</span><span>${pct}%</span></header>
          <div class="bar-track"><div class="bar-fill" style="width: ${pct}%"></div></div>
        </div>
      `;
    })
    .join("");
}

function shuffle(items) {
  return [...items].sort(() => Math.random() - 0.5);
}

function resetProgress() {
  if (!confirm("進捗をリセットしますか？")) return;
  progress = { ...initialProgress, attempts: {}, lastStudied: new Date().toISOString().slice(0, 10) };
  saveProgress();
  renderLearn();
  renderQuiz();
  renderReview();
}

$$(".tab").forEach((tab) => tab.addEventListener("click", () => switchView(tab.dataset.view)));
$$(".pill").forEach((pill) => {
  pill.addEventListener("click", () => {
    quizMode = pill.dataset.quiz;
    $$(".pill").forEach((item) => item.classList.toggle("active", item === pill));
    renderQuiz();
  });
});

$("#knownBtn").addEventListener("click", () => markPhrase("known"));
$("#hardBtn").addEventListener("click", () => markPhrase("hard"));
$("#speakBtn").addEventListener("click", speakCurrent);
$("#nextQuizBtn").addEventListener("click", renderQuiz);
$("#resetBtn").addEventListener("click", resetProgress);
window.addEventListener("hashchange", () => {
  const view = location.hash.slice(1);
  if (["learn", "quiz", "review", "stats"].includes(view)) switchView(view);
});

renderLearn();
renderQuiz();
renderReview();
renderStats();
if (["quiz", "review", "stats"].includes(location.hash.slice(1))) {
  switchView(location.hash.slice(1));
}
