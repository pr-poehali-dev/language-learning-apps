import { useState, useRef } from "react";
import Icon from "@/components/ui/icon";

type Screen = "home" | "lesson" | "quiz" | "dialogue" | "result";
type Language = "english" | "spanish" | "french";

interface Word {
  word: string;
  translation: string;
  transcription: string;
  emoji: string;
}

interface QuizQuestion {
  question: string;
  word: string;
  options: string[];
  correct: number;
}

interface DialogueLine {
  speaker: "user" | "native";
  text: string;
  translation: string;
}

const LANGUAGES: Record<Language, { name: string; flag: string }> = {
  english: { name: "Английский", flag: "🇬🇧" },
  spanish: { name: "Испанский", flag: "🇪🇸" },
  french: { name: "Французский", flag: "🇫🇷" },
};

const LESSONS: Record<Language, { title: string; topic: string; icon: string; words: Word[] }[]> = {
  english: [
    {
      title: "Приветствия",
      topic: "Базовые фразы",
      icon: "👋",
      words: [
        { word: "Hello", translation: "Привет", transcription: "[həˈloʊ]", emoji: "👋" },
        { word: "Goodbye", translation: "Пока", transcription: "[ˌɡʊdˈbaɪ]", emoji: "🙌" },
        { word: "Thank you", translation: "Спасибо", transcription: "[ˈθæŋk juː]", emoji: "🙏" },
        { word: "Please", translation: "Пожалуйста", transcription: "[pliːz]", emoji: "✨" },
      ],
    },
    {
      title: "Еда и напитки",
      topic: "Бытовая лексика",
      icon: "🍎",
      words: [
        { word: "Apple", translation: "Яблоко", transcription: "[ˈæpəl]", emoji: "🍎" },
        { word: "Water", translation: "Вода", transcription: "[ˈwɔːtər]", emoji: "💧" },
        { word: "Bread", translation: "Хлеб", transcription: "[brɛd]", emoji: "🍞" },
        { word: "Coffee", translation: "Кофе", transcription: "[ˈkɒfi]", emoji: "☕" },
      ],
    },
    {
      title: "Числа 1–4",
      topic: "Математика",
      icon: "🔢",
      words: [
        { word: "One", translation: "Один", transcription: "[wʌn]", emoji: "1️⃣" },
        { word: "Two", translation: "Два", transcription: "[tuː]", emoji: "2️⃣" },
        { word: "Three", translation: "Три", transcription: "[θriː]", emoji: "3️⃣" },
        { word: "Four", translation: "Четыре", transcription: "[fɔːr]", emoji: "4️⃣" },
      ],
    },
  ],
  spanish: [
    {
      title: "Приветствия",
      topic: "Базовые фразы",
      icon: "👋",
      words: [
        { word: "Hola", translation: "Привет", transcription: "[ˈola]", emoji: "👋" },
        { word: "Adiós", translation: "Пока", transcription: "[aˈðjos]", emoji: "🙌" },
        { word: "Gracias", translation: "Спасибо", transcription: "[ˈɡɾasjas]", emoji: "🙏" },
        { word: "Por favor", translation: "Пожалуйста", transcription: "[poɾ faˈβoɾ]", emoji: "✨" },
      ],
    },
    {
      title: "Еда",
      topic: "Бытовая лексика",
      icon: "🍎",
      words: [
        { word: "Manzana", translation: "Яблоко", transcription: "[manˈθana]", emoji: "🍎" },
        { word: "Agua", translation: "Вода", transcription: "[ˈaɣwa]", emoji: "💧" },
        { word: "Pan", translation: "Хлеб", transcription: "[pan]", emoji: "🍞" },
        { word: "Café", translation: "Кофе", transcription: "[kaˈfe]", emoji: "☕" },
      ],
    },
  ],
  french: [
    {
      title: "Приветствия",
      topic: "Базовые фразы",
      icon: "👋",
      words: [
        { word: "Bonjour", translation: "Привет / Добрый день", transcription: "[bɔ̃ʒuʁ]", emoji: "👋" },
        { word: "Au revoir", translation: "Пока", transcription: "[o ʁəvwaʁ]", emoji: "🙌" },
        { word: "Merci", translation: "Спасибо", transcription: "[mɛʁsi]", emoji: "🙏" },
        { word: "S'il vous plaît", translation: "Пожалуйста", transcription: "[silvuplɛ]", emoji: "✨" },
      ],
    },
    {
      title: "Еда",
      topic: "Бытовая лексика",
      icon: "🍎",
      words: [
        { word: "Pomme", translation: "Яблоко", transcription: "[pɔm]", emoji: "🍎" },
        { word: "Eau", translation: "Вода", transcription: "[o]", emoji: "💧" },
        { word: "Pain", translation: "Хлеб", transcription: "[pɛ̃]", emoji: "🍞" },
        { word: "Café", translation: "Кофе", transcription: "[kafe]", emoji: "☕" },
      ],
    },
  ],
};

const QUIZ_QUESTIONS: Record<Language, QuizQuestion[]> = {
  english: [
    { question: "Как переводится слово?", word: "Hello", options: ["Привет", "Пока", "Спасибо", "Да"], correct: 0 },
    { question: "Как переводится слово?", word: "Apple", options: ["Банан", "Яблоко", "Апельсин", "Груша"], correct: 1 },
    { question: "Выбери правильный перевод", word: "Thank you", options: ["Нет", "Да", "Спасибо", "Привет"], correct: 2 },
    { question: "Переведи на английский: Вода", word: "Вода", options: ["Bread", "Coffee", "Apple", "Water"], correct: 3 },
    { question: "Как переводится слово?", word: "Three", options: ["Один", "Два", "Три", "Четыре"], correct: 2 },
  ],
  spanish: [
    { question: "Как переводится слово?", word: "Hola", options: ["Привет", "Пока", "Спасибо", "Да"], correct: 0 },
    { question: "Как переводится слово?", word: "Gracias", options: ["Нет", "Пока", "Пожалуйста", "Спасибо"], correct: 3 },
    { question: "Выбери правильный перевод", word: "Adiós", options: ["Пока", "Привет", "Нет", "Да"], correct: 0 },
    { question: "Переведи: Вода", word: "Вода", options: ["Pan", "Café", "Manzana", "Agua"], correct: 3 },
  ],
  french: [
    { question: "Как переводится слово?", word: "Bonjour", options: ["Привет", "Пока", "Спасибо", "Да"], correct: 0 },
    { question: "Как переводится слово?", word: "Merci", options: ["Пока", "Нет", "Спасибо", "Привет"], correct: 2 },
    { question: "Выбери правильный перевод", word: "Au revoir", options: ["Привет", "Пока", "Да", "Нет"], correct: 1 },
    { question: "Переведи: Хлеб", word: "Хлеб", options: ["Eau", "Pomme", "Pain", "Café"], correct: 2 },
  ],
};

const DIALOGUES: Record<Language, DialogueLine[]> = {
  english: [
    { speaker: "native", text: "Hi! How are you?", translation: "Привет! Как дела?" },
    { speaker: "user", text: "I'm fine, thank you!", translation: "Я в порядке, спасибо!" },
    { speaker: "native", text: "What's your name?", translation: "Как тебя зовут?" },
    { speaker: "user", text: "My name is Alex.", translation: "Меня зовут Алекс." },
    { speaker: "native", text: "Nice to meet you!", translation: "Приятно познакомиться!" },
    { speaker: "user", text: "Nice to meet you too!", translation: "Мне тоже приятно!" },
  ],
  spanish: [
    { speaker: "native", text: "¡Hola! ¿Cómo estás?", translation: "Привет! Как дела?" },
    { speaker: "user", text: "¡Estoy bien, gracias!", translation: "Я в порядке, спасибо!" },
    { speaker: "native", text: "¿Cómo te llamas?", translation: "Как тебя зовут?" },
    { speaker: "user", text: "Me llamo Alex.", translation: "Меня зовут Алекс." },
    { speaker: "native", text: "¡Mucho gusto!", translation: "Очень приятно!" },
  ],
  french: [
    { speaker: "native", text: "Bonjour! Comment ça va?", translation: "Привет! Как дела?" },
    { speaker: "user", text: "Ça va bien, merci!", translation: "Всё хорошо, спасибо!" },
    { speaker: "native", text: "Comment tu t'appelles?", translation: "Как тебя зовут?" },
    { speaker: "user", text: "Je m'appelle Alex.", translation: "Меня зовут Алекс." },
    { speaker: "native", text: "Enchanté!", translation: "Очень приятно!" },
  ],
};

function speakText(text: string, lang: Language) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang === "english" ? "en-US" : lang === "spanish" ? "es-ES" : "fr-FR";
  utterance.rate = 0.85;
  window.speechSynthesis.speak(utterance);
}

interface XpFloatItem { id: number; x: number; y: number; value: string }

export default function Index() {
  const [screen, setScreen] = useState<Screen>("home");
  const [selectedLang, setSelectedLang] = useState<Language>("english");
  const [xp, setXp] = useState(120);
  const [streak] = useState(5);
  const [lives, setLives] = useState(3);
  const [gems, setGems] = useState(47);
  const [lessonIdx, setLessonIdx] = useState(0);
  const [wordIdx, setWordIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [quizIdx, setQuizIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [correct, setCorrect] = useState(0);
  const [dialogueStep, setDialogueStep] = useState(0);
  const [showTranslation, setShowTranslation] = useState<number | null>(null);
  const [floats, setFloats] = useState<XpFloatItem[]>([]);
  const [showReward, setShowReward] = useState(false);
  const [completedLessons, setCompletedLessons] = useState<number[]>([]);
  const floatId = useRef(0);

  const addXpFloat = (e: React.MouseEvent, value: string) => {
    const id = floatId.current++;
    setFloats((f) => [...f, { id, x: e.clientX - 20, y: e.clientY - 30, value }]);
    setTimeout(() => setFloats((f) => f.filter((fl) => fl.id !== id)), 1000);
  };

  const currentLessons = LESSONS[selectedLang];
  const currentLesson = currentLessons[lessonIdx];
  const currentWords = currentLesson?.words ?? [];
  const currentWord = currentWords[wordIdx];
  const quizQuestions = QUIZ_QUESTIONS[selectedLang];
  const currentQuestion = quizQuestions[quizIdx];
  const dialogue = DIALOGUES[selectedLang];

  const handleAnswerSelect = (e: React.MouseEvent, idx: number) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(idx);
    if (idx === currentQuestion.correct) {
      addXpFloat(e, "+10 XP ⭐");
      setXp((x) => x + 10);
      setCorrect((c) => c + 1);
    } else {
      setLives((l) => Math.max(0, l - 1));
    }
    setTimeout(() => {
      if (quizIdx + 1 < quizQuestions.length) {
        setQuizIdx((i) => i + 1);
        setSelectedAnswer(null);
      } else {
        setShowReward(true);
        setTimeout(() => {
          setShowReward(false);
          setScreen("result");
        }, 2000);
      }
    }, 900);
  };

  const handleNextWord = (e: React.MouseEvent) => {
    if (wordIdx + 1 < currentWords.length) {
      addXpFloat(e, "+5 XP");
      setXp((x) => x + 5);
      setWordIdx((i) => i + 1);
      setFlipped(false);
    } else {
      addXpFloat(e, "+50 XP 🎉");
      setXp((x) => x + 50);
      setGems((g) => g + 3);
      if (!completedLessons.includes(lessonIdx)) {
        setCompletedLessons((l) => [...l, lessonIdx]);
      }
      setShowReward(true);
      setTimeout(() => {
        setShowReward(false);
        setScreen("home");
        setWordIdx(0);
        setFlipped(false);
      }, 2000);
    }
  };

  const resetQuiz = () => {
    setQuizIdx(0);
    setSelectedAnswer(null);
    setCorrect(0);
    setLives(3);
    setScreen("quiz");
  };

  const level = Math.floor(xp / 100) + 1;
  const xpProgress = xp % 100;

  return (
    <div className="min-h-screen font-game relative overflow-hidden">
      {/* XP Floats */}
      {floats.map((f) => (
        <div
          key={f.id}
          className="xp-float"
          style={{ left: f.x, top: f.y }}
        >
          {f.value}
        </div>
      ))}

      {/* Reward overlay */}
      {showReward && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none" style={{ background: "hsl(0 0% 0% / 0.6)" }}>
          <div className="animate-bounce-in text-center">
            <div className="text-8xl mb-4">🏆</div>
            <div className="text-4xl font-black text-game-xp">Отлично!</div>
            <div className="text-lg text-white mt-2">Получено XP!</div>
          </div>
        </div>
      )}

      {screen === "home" && (
        <HomeScreen
          lang={selectedLang}
          xp={xp}
          xpProgress={xpProgress}
          level={level}
          streak={streak}
          gems={gems}
          lives={lives}
          lessons={currentLessons}
          completedLessons={completedLessons}
          onSelectLang={setSelectedLang}
          onStartLesson={(idx) => { setLessonIdx(idx); setWordIdx(0); setFlipped(false); setScreen("lesson"); }}
          onStartQuiz={resetQuiz}
          onStartDialogue={() => { setDialogueStep(0); setShowTranslation(null); setScreen("dialogue"); }}
        />
      )}

      {screen === "lesson" && currentWord && (
        <LessonScreen
          lesson={currentLesson}
          word={currentWord}
          wordIdx={wordIdx}
          totalWords={currentWords.length}
          flipped={flipped}
          lang={selectedLang}
          onFlip={() => setFlipped((f) => !f)}
          onNext={handleNextWord}
          onBack={() => setScreen("home")}
          onSpeak={() => speakText(currentWord.word, selectedLang)}
        />
      )}

      {screen === "quiz" && currentQuestion && (
        <QuizScreen
          question={currentQuestion}
          quizIdx={quizIdx}
          total={quizQuestions.length}
          lives={lives}
          selectedAnswer={selectedAnswer}
          onAnswer={handleAnswerSelect}
          onBack={() => setScreen("home")}
        />
      )}

      {screen === "dialogue" && (
        <DialogueScreen
          dialogue={dialogue}
          step={dialogueStep}
          lang={selectedLang}
          showTranslation={showTranslation}
          onNext={() => {
            if (dialogueStep + 1 < dialogue.length) {
              setDialogueStep((s) => s + 1);
            } else {
              setXp((x) => x + 30);
              setGems((g) => g + 2);
              setShowReward(true);
              setTimeout(() => {
                setShowReward(false);
                setScreen("home");
              }, 2000);
            }
          }}
          onSpeak={(text) => speakText(text, selectedLang)}
          onToggleTranslation={(idx) => setShowTranslation(showTranslation === idx ? null : idx)}
          onBack={() => setScreen("home")}
        />
      )}

      {screen === "result" && (
        <ResultScreen
          correct={correct}
          total={quizQuestions.length}
          xpEarned={correct * 10}
          onRetry={resetQuiz}
          onHome={() => setScreen("home")}
        />
      )}
    </div>
  );
}

function HomeScreen({
  lang, xp, xpProgress, level, streak, gems, lives, lessons, completedLessons,
  onSelectLang, onStartLesson, onStartQuiz, onStartDialogue,
}: {
  lang: Language; xp: number; xpProgress: number; level: number;
  streak: number; gems: number; lives: number;
  lessons: typeof LESSONS["english"]; completedLessons: number[];
  onSelectLang: (l: Language) => void; onStartLesson: (idx: number) => void;
  onStartQuiz: () => void; onStartDialogue: () => void;
}) {
  return (
    <div className="max-w-md mx-auto px-4 py-6 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-5 animate-slide-up">
        <div>
          <div className="text-2xl font-black text-white tracking-tight">LinguaQuest</div>
          <div className="text-xs text-muted-foreground">Уровень {level} · {xp} XP</div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-secondary rounded-xl px-3 py-1.5">
            <span>🔥</span>
            <span className="font-black text-orange-400 text-sm">{streak}</span>
          </div>
          <div className="flex items-center gap-1 bg-secondary rounded-xl px-3 py-1.5">
            <span>💎</span>
            <span className="font-black text-cyan-400 text-sm">{gems}</span>
          </div>
          <div className="flex items-center gap-1 bg-secondary rounded-xl px-3 py-1.5">
            <span>❤️</span>
            <span className="font-black text-red-400 text-sm">{lives}</span>
          </div>
        </div>
      </div>

      {/* XP Bar */}
      <div className="mb-5 animate-slide-up" style={{ animationDelay: "0.05s" }}>
        <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
          <span>Уровень {level}</span>
          <span>{xpProgress}/100 XP</span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${xpProgress}%` }} />
        </div>
      </div>

      {/* Language Selector */}
      <div className="mb-5 animate-slide-up" style={{ animationDelay: "0.08s" }}>
        <div className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-2">Язык</div>
        <div className="grid grid-cols-3 gap-2">
          {(Object.entries(LANGUAGES) as [Language, { name: string; flag: string }][]).map(([key, info]) => (
            <button
              key={key}
              onClick={() => onSelectLang(key)}
              className={`card-game p-3 text-center transition-all ${lang === key ? "border-primary glow-green" : ""}`}
            >
              <div className="text-2xl mb-1">{info.flag}</div>
              <div className="text-xs font-bold text-white leading-tight">{info.name}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Streak Banner */}
      <div
        className="mb-5 rounded-2xl p-4 flex items-center gap-3 animate-slide-up"
        style={{ animationDelay: "0.12s", background: "linear-gradient(135deg, hsl(25 100% 18%) 0%, hsl(35 90% 15%) 100%)", border: "1px solid hsl(35 100% 32%)" }}
      >
        <div className="text-4xl">🔥</div>
        <div>
          <div className="font-black text-white">{streak}-дневная серия!</div>
          <div className="text-xs text-orange-300/80">Занимайся каждый день</div>
        </div>
        <div className="ml-auto badge-xp">+2x XP</div>
      </div>

      {/* Lessons */}
      <div className="mb-5 animate-slide-up" style={{ animationDelay: "0.16s" }}>
        <div className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-3">📚 Уроки</div>
        <div className="flex flex-col gap-2.5">
          {lessons.map((lesson, idx) => {
            const isDone = completedLessons.includes(idx);
            return (
              <button
                key={idx}
                onClick={() => onStartLesson(idx)}
                className="card-game p-4 flex items-center gap-4 text-left w-full group"
              >
                <div className={`w-13 h-13 w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 ${isDone ? "bg-primary/20" : "bg-secondary"}`}>
                  {isDone ? "✅" : lesson.icon}
                </div>
                <div className="flex-1">
                  <div className="font-bold text-white text-sm">{lesson.title}</div>
                  <div className="text-xs text-muted-foreground">{lesson.topic} · {lesson.words.length} слова</div>
                  {isDone && <div className="text-xs text-primary font-bold mt-0.5">Пройдено ✓</div>}
                </div>
                <Icon name="ChevronRight" size={18} className="text-muted-foreground group-hover:text-white transition-colors" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Quiz + Dialogue */}
      <div className="grid grid-cols-2 gap-3 mb-6 animate-slide-up" style={{ animationDelay: "0.22s" }}>
        <button
          onClick={onStartQuiz}
          className="card-game p-4 text-center"
          style={{ background: "linear-gradient(135deg, hsl(280 50% 16%) 0%, hsl(280 40% 12%) 100%)", border: "1px solid hsl(280 50% 28%)" }}
        >
          <div className="text-3xl mb-2">🧠</div>
          <div className="font-black text-white text-sm">Тест знаний</div>
          <div className="text-xs text-muted-foreground mt-1">+10 XP / ответ</div>
        </button>
        <button
          onClick={onStartDialogue}
          className="card-game p-4 text-center"
          style={{ background: "linear-gradient(135deg, hsl(195 60% 16%) 0%, hsl(220 50% 12%) 100%)", border: "1px solid hsl(195 60% 28%)" }}
        >
          <div className="text-3xl mb-2">💬</div>
          <div className="font-black text-white text-sm">Диалог</div>
          <div className="text-xs text-muted-foreground mt-1">+30 XP за диалог</div>
        </button>
      </div>

      {/* Bottom Nav */}
      <div className="card-game flex items-center justify-around py-3 animate-slide-up" style={{ animationDelay: "0.28s" }}>
        {[
          { icon: "Home" as const, label: "Главная", active: true },
          { icon: "BookOpen" as const, label: "Уроки", active: false },
          { icon: "Trophy" as const, label: "Рейтинг", active: false },
          { icon: "User" as const, label: "Профиль", active: false },
        ].map((item) => (
          <button
            key={item.label}
            className={`flex flex-col items-center gap-1 px-3 py-1 rounded-xl ${item.active ? "text-primary" : "text-muted-foreground"}`}
          >
            <Icon name={item.icon} size={22} />
            <span className="text-xs font-bold">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function LessonScreen({ lesson, word, wordIdx, totalWords, flipped, lang, onFlip, onNext, onBack, onSpeak }: {
  lesson: typeof LESSONS["english"][0]; word: Word; wordIdx: number; totalWords: number;
  flipped: boolean; lang: Language;
  onFlip: () => void; onNext: (e: React.MouseEvent) => void;
  onBack: () => void; onSpeak: () => void;
}) {
  return (
    <div className="max-w-md mx-auto px-4 py-6 min-h-screen flex flex-col">
      <div className="flex items-center gap-3 mb-5">
        <button onClick={onBack} className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground hover:text-white transition-colors">
          <Icon name="ArrowLeft" size={20} />
        </button>
        <div className="flex-1">
          <div className="font-black text-white">{lesson.title}</div>
          <div className="text-xs text-muted-foreground">{lesson.topic}</div>
        </div>
        <div className="text-sm font-bold text-muted-foreground">{wordIdx + 1}/{totalWords}</div>
      </div>

      <div className="progress-bar mb-8">
        <div className="progress-fill" style={{ width: `${((wordIdx + 1) / totalWords) * 100}%` }} />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-6">
        {/* Flip Card */}
        <div onClick={onFlip} className="w-full cursor-pointer" style={{ perspective: 1000 }}>
          <div
            style={{
              transition: "transform 0.55s cubic-bezier(0.34, 1.56, 0.64, 1)",
              transformStyle: "preserve-3d",
              transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
              position: "relative",
              height: 240,
            }}
          >
            <div
              className="absolute inset-0 card-game flex flex-col items-center justify-center"
              style={{ backfaceVisibility: "hidden", background: "linear-gradient(135deg, hsl(240 22% 16%) 0%, hsl(240 18% 11%) 100%)" }}
            >
              <div className="text-6xl mb-4">{word.emoji}</div>
              <div className="text-4xl font-black text-white mb-2">{word.word}</div>
              <div className="text-sm text-muted-foreground">{word.transcription}</div>
              <div className="mt-5 text-xs text-muted-foreground/60">↻ Нажми для перевода</div>
            </div>
            <div
              className="absolute inset-0 card-game flex flex-col items-center justify-center"
              style={{
                backfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
                background: "linear-gradient(135deg, hsl(142 40% 11%) 0%, hsl(160 30% 9%) 100%)",
                border: "1px solid hsl(142 60% 22%)",
              }}
            >
              <div className="text-6xl mb-4">{word.emoji}</div>
              <div className="text-4xl font-black text-primary mb-2">{word.translation}</div>
              <div className="text-sm text-muted-foreground">{word.word}</div>
            </div>
          </div>
        </div>

        {/* Speak Button */}
        <button
          onClick={onSpeak}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-white transition-all hover:scale-105 active:scale-95"
          style={{ background: "linear-gradient(135deg, hsl(220 80% 44%) 0%, hsl(200 80% 38%) 100%)", boxShadow: "0 4px 16px hsl(220 80% 44% / 0.35)" }}
        >
          <span className="text-xl">🔊</span>
          Послушать произношение
        </button>
      </div>

      <button onClick={onNext} className="btn-primary mt-6 w-full py-4 text-lg font-black rounded-2xl">
        {wordIdx + 1 < totalWords ? "Следующее слово →" : "🎉 Завершить урок!"}
      </button>
    </div>
  );
}

function QuizScreen({ question, quizIdx, total, lives, selectedAnswer, onAnswer, onBack }: {
  question: QuizQuestion; quizIdx: number; total: number; lives: number;
  selectedAnswer: number | null;
  onAnswer: (e: React.MouseEvent, idx: number) => void;
  onBack: () => void;
}) {
  return (
    <div className="max-w-md mx-auto px-4 py-6 min-h-screen flex flex-col">
      <div className="flex items-center gap-3 mb-5">
        <button onClick={onBack} className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground hover:text-white transition-colors">
          <Icon name="ArrowLeft" size={20} />
        </button>
        <div className="flex-1">
          <div className="font-black text-white">Тест знаний</div>
          <div className="text-xs text-muted-foreground">Вопрос {quizIdx + 1} из {total}</div>
        </div>
        <div className="flex gap-1">
          {Array.from({ length: 3 }).map((_, i) => (
            <span key={i}>{i < lives ? "❤️" : "🖤"}</span>
          ))}
        </div>
      </div>

      <div className="progress-bar mb-8">
        <div className="progress-fill" style={{ width: `${(quizIdx / total) * 100}%` }} />
      </div>

      <div
        className="card-game p-6 mb-6 text-center animate-fade-scale"
        style={{ background: "linear-gradient(135deg, hsl(280 30% 15%) 0%, hsl(280 20% 11%) 100%)", border: "1px solid hsl(280 40% 24%)" }}
      >
        <div className="text-sm text-muted-foreground mb-3">{question.question}</div>
        <div className="text-5xl font-black text-white">{question.word}</div>
      </div>

      <div className="flex flex-col gap-3 flex-1">
        {question.options.map((opt, idx) => {
          let cls = "answer-option";
          if (selectedAnswer !== null) {
            if (idx === question.correct) cls += " correct";
            else if (idx === selectedAnswer) cls += " wrong";
          }
          return (
            <button
              key={idx}
              className={`${cls} p-4 flex items-center gap-4 w-full text-left`}
              onClick={(e) => onAnswer(e, idx)}
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm flex-shrink-0 transition-colors ${
                selectedAnswer !== null && idx === question.correct
                  ? "bg-primary text-primary-foreground"
                  : selectedAnswer !== null && idx === selectedAnswer
                  ? "bg-destructive text-white"
                  : "bg-secondary text-muted-foreground"
              }`}>
                {["A", "B", "C", "D"][idx]}
              </div>
              <span className="font-bold text-white">{opt}</span>
              {selectedAnswer !== null && idx === question.correct && <span className="ml-auto">✅</span>}
              {selectedAnswer !== null && idx === selectedAnswer && idx !== question.correct && <span className="ml-auto">❌</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function DialogueScreen({ dialogue, step, lang, showTranslation, onNext, onSpeak, onToggleTranslation, onBack }: {
  dialogue: DialogueLine[]; step: number; lang: Language;
  showTranslation: number | null;
  onNext: () => void; onSpeak: (text: string) => void;
  onToggleTranslation: (idx: number) => void; onBack: () => void;
}) {
  const current = dialogue[step];
  const visibleLines = dialogue.slice(0, step + 1);

  return (
    <div className="max-w-md mx-auto px-4 py-6 min-h-screen flex flex-col">
      <div className="flex items-center gap-3 mb-5">
        <button onClick={onBack} className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground hover:text-white transition-colors">
          <Icon name="ArrowLeft" size={20} />
        </button>
        <div className="flex-1">
          <div className="font-black text-white">Диалог</div>
          <div className="text-xs text-muted-foreground">Шаг {step + 1} из {dialogue.length}</div>
        </div>
        <div className="text-2xl">{LANGUAGES[lang].flag}</div>
      </div>

      <div className="progress-bar mb-5">
        <div className="progress-fill" style={{ width: `${((step + 1) / dialogue.length) * 100}%` }} />
      </div>

      {/* Chat bubbles */}
      <div className="flex-1 flex flex-col gap-3 mb-4 overflow-y-auto">
        {visibleLines.map((line, idx) => (
          <div key={idx} className={`flex ${line.speaker === "user" ? "justify-end" : "justify-start"} animate-slide-up`}>
            {line.speaker === "native" && (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center mr-2 flex-shrink-0 mt-1 text-sm">
                {LANGUAGES[lang].flag}
              </div>
            )}
            <div className="max-w-[78%]">
              <div
                className={`px-4 py-3 rounded-2xl font-bold text-sm leading-snug ${
                  line.speaker === "user"
                    ? "bg-primary text-primary-foreground rounded-br-sm"
                    : "bg-secondary text-white rounded-bl-sm"
                }`}
              >
                {line.text}
              </div>
              <div className="flex items-center gap-2 mt-1 px-1">
                <button
                  onClick={() => onToggleTranslation(idx)}
                  className="text-xs text-muted-foreground hover:text-white transition-colors"
                >
                  {showTranslation === idx ? line.translation : "перевод"}
                </button>
                {line.speaker === "native" && (
                  <button
                    onClick={() => onSpeak(line.text)}
                    className="text-xs text-cyan-400 hover:text-white transition-colors"
                  >
                    🔊
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Current action hint */}
      <div
        className="rounded-2xl p-4 mb-4"
        style={{ background: "linear-gradient(135deg, hsl(195 40% 13%) 0%, hsl(220 30% 10%) 100%)", border: "1px solid hsl(195 50% 20%)" }}
      >
        <div className="text-xs text-muted-foreground mb-1">
          {current.speaker === "user" ? "Твоя реплика:" : "Носитель говорит:"}
        </div>
        <div className="font-black text-white">{current.text}</div>
        {current.speaker === "native" && (
          <button
            onClick={() => onSpeak(current.text)}
            className="mt-2 flex items-center gap-1.5 text-sm font-bold text-cyan-400 hover:text-white transition-colors"
          >
            🔊 Послушать
          </button>
        )}
      </div>

      <button onClick={onNext} className="btn-primary w-full py-4 text-lg font-black rounded-2xl">
        {step + 1 < dialogue.length ? "Продолжить →" : "🎉 Завершить диалог!"}
      </button>
    </div>
  );
}

function ResultScreen({ correct, total, xpEarned, onRetry, onHome }: {
  correct: number; total: number; xpEarned: number;
  onRetry: () => void; onHome: () => void;
}) {
  const pct = Math.round((correct / total) * 100);
  const stars = pct >= 90 ? 3 : pct >= 60 ? 2 : 1;

  return (
    <div className="max-w-md mx-auto px-4 py-6 min-h-screen flex flex-col items-center justify-center">
      <div className="animate-bounce-in text-center mb-8">
        <div className="text-8xl mb-4">
          {stars === 3 ? "🏆" : stars === 2 ? "🥈" : "🥉"}
        </div>
        <div className="text-3xl font-black text-white mb-3">
          {stars === 3 ? "Идеально!" : stars === 2 ? "Хорошо!" : "Продолжай!"}
        </div>
        <div className="flex justify-center gap-2 text-4xl">
          {Array.from({ length: 3 }).map((_, i) => (
            <span key={i} className={i < stars ? "" : "opacity-25"}>⭐</span>
          ))}
        </div>
      </div>

      <div className="w-full grid grid-cols-3 gap-3 mb-8">
        <div className="card-game p-4 text-center">
          <div className="text-3xl font-black text-primary">{correct}/{total}</div>
          <div className="text-xs text-muted-foreground mt-1">Ответов</div>
        </div>
        <div className="card-game p-4 text-center">
          <div className="text-3xl font-black text-yellow-400">+{xpEarned}</div>
          <div className="text-xs text-muted-foreground mt-1">XP</div>
        </div>
        <div className="card-game p-4 text-center">
          <div className="text-3xl font-black text-cyan-400">{pct}%</div>
          <div className="text-xs text-muted-foreground mt-1">Точность</div>
        </div>
      </div>

      <div className="w-full flex flex-col gap-3">
        <button onClick={onRetry} className="btn-primary w-full py-4 text-lg font-black rounded-2xl">
          🔄 Пройти снова
        </button>
        <button
          onClick={onHome}
          className="w-full py-4 text-lg font-black rounded-2xl bg-secondary text-white hover:bg-muted transition-colors"
        >
          🏠 На главную
        </button>
      </div>
    </div>
  );
}
