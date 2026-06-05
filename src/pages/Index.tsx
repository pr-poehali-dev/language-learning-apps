import { useState, useRef } from "react";
import Icon from "@/components/ui/icon";

type Screen = "home" | "lesson" | "quiz" | "dialogue" | "result";
type Language = "english" | "spanish" | "french";
type Theme = "dark" | "light";

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
        { word: "Sorry", translation: "Извини", transcription: "[ˈsɒri]", emoji: "😔" },
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
        { word: "Milk", translation: "Молоко", transcription: "[mɪlk]", emoji: "🥛" },
        { word: "Cheese", translation: "Сыр", transcription: "[tʃiːz]", emoji: "🧀" },
      ],
    },
    {
      title: "Числа 1–10",
      topic: "Математика",
      icon: "🔢",
      words: [
        { word: "One", translation: "Один", transcription: "[wʌn]", emoji: "1️⃣" },
        { word: "Two", translation: "Два", transcription: "[tuː]", emoji: "2️⃣" },
        { word: "Three", translation: "Три", transcription: "[θriː]", emoji: "3️⃣" },
        { word: "Four", translation: "Четыре", transcription: "[fɔːr]", emoji: "4️⃣" },
        { word: "Five", translation: "Пять", transcription: "[faɪv]", emoji: "5️⃣" },
        { word: "Ten", translation: "Десять", transcription: "[tɛn]", emoji: "🔟" },
      ],
    },
    {
      title: "Цвета",
      topic: "Описание",
      icon: "🎨",
      words: [
        { word: "Red", translation: "Красный", transcription: "[rɛd]", emoji: "🔴" },
        { word: "Blue", translation: "Синий", transcription: "[bluː]", emoji: "🔵" },
        { word: "Green", translation: "Зелёный", transcription: "[ɡriːn]", emoji: "🟢" },
        { word: "Yellow", translation: "Жёлтый", transcription: "[ˈjɛloʊ]", emoji: "🟡" },
        { word: "Black", translation: "Чёрный", transcription: "[blæk]", emoji: "⚫" },
        { word: "White", translation: "Белый", transcription: "[waɪt]", emoji: "⚪" },
      ],
    },
    {
      title: "Семья",
      topic: "Люди и отношения",
      icon: "👨‍👩‍👧",
      words: [
        { word: "Mother", translation: "Мама", transcription: "[ˈmʌðər]", emoji: "👩" },
        { word: "Father", translation: "Папа", transcription: "[ˈfɑːðər]", emoji: "👨" },
        { word: "Sister", translation: "Сестра", transcription: "[ˈsɪstər]", emoji: "👧" },
        { word: "Brother", translation: "Брат", transcription: "[ˈbrʌðər]", emoji: "👦" },
        { word: "Friend", translation: "Друг", transcription: "[frɛnd]", emoji: "🤝" },
      ],
    },
    {
      title: "Животные",
      topic: "Природа",
      icon: "🐾",
      words: [
        { word: "Cat", translation: "Кошка", transcription: "[kæt]", emoji: "🐱" },
        { word: "Dog", translation: "Собака", transcription: "[dɒɡ]", emoji: "🐶" },
        { word: "Bird", translation: "Птица", transcription: "[bɜːrd]", emoji: "🐦" },
        { word: "Fish", translation: "Рыба", transcription: "[fɪʃ]", emoji: "🐟" },
        { word: "Horse", translation: "Лошадь", transcription: "[hɔːrs]", emoji: "🐴" },
      ],
    },
    {
      title: "Дом и комнаты",
      topic: "Быт",
      icon: "🏠",
      words: [
        { word: "House", translation: "Дом", transcription: "[haʊs]", emoji: "🏠" },
        { word: "Kitchen", translation: "Кухня", transcription: "[ˈkɪtʃɪn]", emoji: "🍳" },
        { word: "Bedroom", translation: "Спальня", transcription: "[ˈbɛdruːm]", emoji: "🛏️" },
        { word: "Window", translation: "Окно", transcription: "[ˈwɪndoʊ]", emoji: "🪟" },
        { word: "Door", translation: "Дверь", transcription: "[dɔːr]", emoji: "🚪" },
      ],
    },
    {
      title: "Транспорт",
      topic: "Передвижение",
      icon: "🚗",
      words: [
        { word: "Car", translation: "Машина", transcription: "[kɑːr]", emoji: "🚗" },
        { word: "Bus", translation: "Автобус", transcription: "[bʌs]", emoji: "🚌" },
        { word: "Train", translation: "Поезд", transcription: "[treɪn]", emoji: "🚂" },
        { word: "Plane", translation: "Самолёт", transcription: "[pleɪn]", emoji: "✈️" },
        { word: "Bike", translation: "Велосипед", transcription: "[baɪk]", emoji: "🚲" },
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
        { word: "Lo siento", translation: "Извини", transcription: "[lo ˈsjento]", emoji: "😔" },
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
        { word: "Leche", translation: "Молоко", transcription: "[ˈletʃe]", emoji: "🥛" },
        { word: "Queso", translation: "Сыр", transcription: "[ˈkeso]", emoji: "🧀" },
      ],
    },
    {
      title: "Числа",
      topic: "Математика",
      icon: "🔢",
      words: [
        { word: "Uno", translation: "Один", transcription: "[ˈuno]", emoji: "1️⃣" },
        { word: "Dos", translation: "Два", transcription: "[dos]", emoji: "2️⃣" },
        { word: "Tres", translation: "Три", transcription: "[tɾes]", emoji: "3️⃣" },
        { word: "Cuatro", translation: "Четыре", transcription: "[ˈkwatɾo]", emoji: "4️⃣" },
        { word: "Cinco", translation: "Пять", transcription: "[ˈθiŋko]", emoji: "5️⃣" },
      ],
    },
    {
      title: "Цвета",
      topic: "Описание",
      icon: "🎨",
      words: [
        { word: "Rojo", translation: "Красный", transcription: "[ˈroxo]", emoji: "🔴" },
        { word: "Azul", translation: "Синий", transcription: "[aˈθul]", emoji: "🔵" },
        { word: "Verde", translation: "Зелёный", transcription: "[ˈbeɾðe]", emoji: "🟢" },
        { word: "Amarillo", translation: "Жёлтый", transcription: "[amaˈɾiʎo]", emoji: "🟡" },
        { word: "Negro", translation: "Чёрный", transcription: "[ˈneɣɾo]", emoji: "⚫" },
      ],
    },
    {
      title: "Семья",
      topic: "Люди",
      icon: "👨‍👩‍👧",
      words: [
        { word: "Madre", translation: "Мама", transcription: "[ˈmaðɾe]", emoji: "👩" },
        { word: "Padre", translation: "Папа", transcription: "[ˈpaðɾe]", emoji: "👨" },
        { word: "Hermana", translation: "Сестра", transcription: "[eɾˈmana]", emoji: "👧" },
        { word: "Hermano", translation: "Брат", transcription: "[eɾˈmano]", emoji: "👦" },
        { word: "Amigo", translation: "Друг", transcription: "[aˈmiɣo]", emoji: "🤝" },
      ],
    },
    {
      title: "Животные",
      topic: "Природа",
      icon: "🐾",
      words: [
        { word: "Gato", translation: "Кошка", transcription: "[ˈɡato]", emoji: "🐱" },
        { word: "Perro", translation: "Собака", transcription: "[ˈpero]", emoji: "🐶" },
        { word: "Pájaro", translation: "Птица", transcription: "[ˈpaxaɾo]", emoji: "🐦" },
        { word: "Pez", translation: "Рыба", transcription: "[peθ]", emoji: "🐟" },
        { word: "Caballo", translation: "Лошадь", transcription: "[kaˈβaʎo]", emoji: "🐴" },
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
        { word: "Pardon", translation: "Извини", transcription: "[paʁdɔ̃]", emoji: "😔" },
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
        { word: "Lait", translation: "Молоко", transcription: "[lɛ]", emoji: "🥛" },
        { word: "Fromage", translation: "Сыр", transcription: "[fʁɔmaʒ]", emoji: "🧀" },
      ],
    },
    {
      title: "Числа",
      topic: "Математика",
      icon: "🔢",
      words: [
        { word: "Un", translation: "Один", transcription: "[œ̃]", emoji: "1️⃣" },
        { word: "Deux", translation: "Два", transcription: "[dø]", emoji: "2️⃣" },
        { word: "Trois", translation: "Три", transcription: "[tʁwa]", emoji: "3️⃣" },
        { word: "Quatre", translation: "Четыре", transcription: "[katʁ]", emoji: "4️⃣" },
        { word: "Cinq", translation: "Пять", transcription: "[sɛ̃k]", emoji: "5️⃣" },
      ],
    },
    {
      title: "Цвета",
      topic: "Описание",
      icon: "🎨",
      words: [
        { word: "Rouge", translation: "Красный", transcription: "[ʁuʒ]", emoji: "🔴" },
        { word: "Bleu", translation: "Синий", transcription: "[blø]", emoji: "🔵" },
        { word: "Vert", translation: "Зелёный", transcription: "[vɛʁ]", emoji: "🟢" },
        { word: "Jaune", translation: "Жёлтый", transcription: "[ʒon]", emoji: "🟡" },
        { word: "Noir", translation: "Чёрный", transcription: "[nwaʁ]", emoji: "⚫" },
      ],
    },
    {
      title: "Семья",
      topic: "Люди",
      icon: "👨‍👩‍👧",
      words: [
        { word: "Mère", translation: "Мама", transcription: "[mɛʁ]", emoji: "👩" },
        { word: "Père", translation: "Папа", transcription: "[pɛʁ]", emoji: "👨" },
        { word: "Sœur", translation: "Сестра", transcription: "[sœʁ]", emoji: "👧" },
        { word: "Frère", translation: "Брат", transcription: "[fʁɛʁ]", emoji: "👦" },
        { word: "Ami", translation: "Друг", transcription: "[ami]", emoji: "🤝" },
      ],
    },
    {
      title: "Животные",
      topic: "Природа",
      icon: "🐾",
      words: [
        { word: "Chat", translation: "Кошка", transcription: "[ʃa]", emoji: "🐱" },
        { word: "Chien", translation: "Собака", transcription: "[ʃjɛ̃]", emoji: "🐶" },
        { word: "Oiseau", translation: "Птица", transcription: "[wazo]", emoji: "🐦" },
        { word: "Poisson", translation: "Рыба", transcription: "[pwasɔ̃]", emoji: "🐟" },
        { word: "Cheval", translation: "Лошадь", transcription: "[ʃəval]", emoji: "🐴" },
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
    { question: "Как переводится слово?", word: "Red", options: ["Синий", "Зелёный", "Красный", "Жёлтый"], correct: 2 },
    { question: "Переведи: Кошка", word: "Кошка", options: ["Dog", "Bird", "Cat", "Fish"], correct: 2 },
    { question: "Как переводится слово?", word: "Mother", options: ["Брат", "Сестра", "Папа", "Мама"], correct: 3 },
    { question: "Как переводится слово?", word: "Car", options: ["Поезд", "Машина", "Автобус", "Самолёт"], correct: 1 },
    { question: "Переведи: Дом", word: "Дом", options: ["Kitchen", "Door", "House", "Window"], correct: 2 },
  ],
  spanish: [
    { question: "Как переводится слово?", word: "Hola", options: ["Привет", "Пока", "Спасибо", "Да"], correct: 0 },
    { question: "Как переводится слово?", word: "Gracias", options: ["Нет", "Пока", "Пожалуйста", "Спасибо"], correct: 3 },
    { question: "Выбери правильный перевод", word: "Adiós", options: ["Пока", "Привет", "Нет", "Да"], correct: 0 },
    { question: "Переведи: Вода", word: "Вода", options: ["Pan", "Café", "Manzana", "Agua"], correct: 3 },
    { question: "Как переводится слово?", word: "Rojo", options: ["Синий", "Зелёный", "Жёлтый", "Красный"], correct: 3 },
    { question: "Переведи: Кошка", word: "Кошка", options: ["Perro", "Pájaro", "Gato", "Pez"], correct: 2 },
    { question: "Как переводится слово?", word: "Madre", options: ["Папа", "Брат", "Сестра", "Мама"], correct: 3 },
    { question: "Как переводится слово?", word: "Dos", options: ["Один", "Два", "Три", "Четыре"], correct: 1 },
  ],
  french: [
    { question: "Как переводится слово?", word: "Bonjour", options: ["Привет", "Пока", "Спасибо", "Да"], correct: 0 },
    { question: "Как переводится слово?", word: "Merci", options: ["Пока", "Нет", "Спасибо", "Привет"], correct: 2 },
    { question: "Выбери правильный перевод", word: "Au revoir", options: ["Привет", "Пока", "Да", "Нет"], correct: 1 },
    { question: "Переведи: Хлеб", word: "Хлеб", options: ["Eau", "Pomme", "Pain", "Café"], correct: 2 },
    { question: "Как переводится слово?", word: "Rouge", options: ["Синий", "Зелёный", "Красный", "Жёлтый"], correct: 2 },
    { question: "Переведи: Кошка", word: "Кошка", options: ["Chien", "Chat", "Oiseau", "Cheval"], correct: 1 },
    { question: "Как переводится слово?", word: "Mère", options: ["Папа", "Мама", "Брат", "Сестра"], correct: 1 },
    { question: "Как переводится слово?", word: "Trois", options: ["Один", "Два", "Три", "Четыре"], correct: 2 },
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

// Фоновые круги для светлой темы
interface CircleItem { size: number; top?: string; left?: string; right?: string; bottom?: string; color: string; }
const LIGHT_CIRCLES: CircleItem[] = [
  { size: 320, top: "-10%", left: "-8%", color: "rgba(134,239,172,0.25)" },
  { size: 200, top: "5%", right: "5%", color: "rgba(147,197,253,0.3)" },
  { size: 140, top: "22%", left: "55%", color: "rgba(253,186,116,0.3)" },
  { size: 260, top: "40%", left: "-6%", color: "rgba(196,181,253,0.25)" },
  { size: 100, top: "55%", right: "10%", color: "rgba(252,165,165,0.3)" },
  { size: 180, top: "65%", left: "30%", color: "rgba(103,232,249,0.2)" },
  { size: 240, bottom: "-8%", right: "-5%", color: "rgba(253,224,71,0.2)" },
  { size: 120, bottom: "10%", left: "10%", color: "rgba(249,168,212,0.3)" },
  { size: 80, top: "80%", left: "60%", color: "rgba(134,239,172,0.35)" },
  { size: 60, top: "30%", right: "20%", color: "rgba(167,243,208,0.4)" },
];

function LightBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      {LIGHT_CIRCLES.map((c, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            width: c.size,
            height: c.size,
            borderRadius: "50%",
            background: c.color,
            top: c.top,
            left: c.left,
            right: c.right,
            bottom: c.bottom,
            filter: "blur(2px)",
            animation: `float-circle-${(i % 3) + 1} ${6 + i * 0.7}s ease-in-out infinite`,
          }}
        />
      ))}
    </div>
  );
}

export default function Index() {
  const [screen, setScreen] = useState<Screen>("home");
  const [theme, setTheme] = useState<Theme>("dark");
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

  const isLight = theme === "light";

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
        setTimeout(() => { setShowReward(false); setScreen("result"); }, 2000);
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
      if (!completedLessons.includes(lessonIdx)) setCompletedLessons((l) => [...l, lessonIdx]);
      setShowReward(true);
      setTimeout(() => { setShowReward(false); setScreen("home"); setWordIdx(0); setFlipped(false); }, 2000);
    }
  };

  const resetQuiz = () => {
    setQuizIdx(0); setSelectedAnswer(null); setCorrect(0); setLives(3); setScreen("quiz");
  };

  const level = Math.floor(xp / 100) + 1;
  const xpProgress = xp % 100;

  // Стили для светлой / тёмной темы
  const T = {
    bg: isLight ? "bg-white/80" : "bg-transparent",
    text: isLight ? "text-gray-900" : "text-white",
    textMuted: isLight ? "text-gray-500" : "text-muted-foreground",
    card: isLight
      ? "bg-white/70 border border-gray-200 shadow-sm backdrop-blur-sm rounded-2xl"
      : "card-game",
    statBadge: isLight ? "bg-white/80 border border-gray-200 shadow-sm rounded-xl" : "bg-secondary rounded-xl",
    answerBase: isLight
      ? "border-2 border-gray-200 bg-white/80 rounded-2xl cursor-pointer hover:border-green-400 hover:bg-green-50 transition-all"
      : "answer-option",
    btn: isLight
      ? "w-full py-4 text-lg font-black rounded-2xl text-white"
      : "btn-primary w-full py-4 text-lg font-black rounded-2xl",
    btnStyle: isLight
      ? { background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)", boxShadow: "0 4px 16px rgba(34,197,94,0.35)", borderBottom: "4px solid #15803d" }
      : {},
    progressTrack: isLight ? "bg-gray-200 rounded-full overflow-hidden h-3" : "progress-bar",
    progressFill: isLight
      ? "h-full rounded-full bg-gradient-to-r from-green-400 to-green-600 transition-all duration-700"
      : "progress-fill",
    langCard: (active: boolean) => isLight
      ? `rounded-2xl p-3 text-center border-2 transition-all cursor-pointer ${active ? "border-green-500 bg-green-50 shadow-md" : "border-gray-200 bg-white/70"}`
      : `card-game p-3 text-center transition-all ${active ? "border-primary glow-green" : ""}`,
    lessonCard: isLight
      ? "bg-white/70 border border-gray-200 shadow-sm rounded-2xl p-4 flex items-center gap-4 text-left w-full group hover:shadow-md hover:border-green-300 transition-all"
      : "card-game p-4 flex items-center gap-4 text-left w-full group",
    quizCard: isLight
      ? "rounded-2xl p-6 mb-6 text-center border border-purple-200 bg-purple-50/80 backdrop-blur-sm"
      : "card-game p-6 mb-6 text-center animate-fade-scale",
    dialogueNative: isLight ? "bg-gray-100 text-gray-900 rounded-2xl rounded-bl-sm" : "bg-secondary text-white rounded-2xl rounded-bl-sm",
    dialogueUser: isLight ? "bg-green-500 text-white rounded-2xl rounded-br-sm" : "bg-primary text-primary-foreground rounded-2xl rounded-br-sm",
    navBar: isLight ? "bg-white/80 border border-gray-200 shadow-sm backdrop-blur-sm rounded-2xl" : "card-game",
    navActive: isLight ? "text-green-600" : "text-primary",
    navInactive: isLight ? "text-gray-400" : "text-muted-foreground",
    streakBanner: isLight
      ? { background: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)", border: "1px solid #f59e0b" }
      : { background: "linear-gradient(135deg, hsl(25 100% 18%) 0%, hsl(35 90% 15%) 100%)", border: "1px solid hsl(35 100% 32%)" },
  };

  return (
    <div
      className="min-h-screen font-game relative overflow-hidden"
      style={isLight ? { background: "linear-gradient(135deg, #f0fdf4 0%, #eff6ff 50%, #fdf4ff 100%)" } : {}}
    >
      {isLight && <LightBackground />}

      {/* XP Floats */}
      {floats.map((f) => (
        <div key={f.id} className="xp-float" style={{ left: f.x, top: f.y }}>{f.value}</div>
      ))}

      {/* Reward overlay */}
      {showReward && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none" style={{ background: "rgba(0,0,0,0.55)" }}>
          <div className="animate-bounce-in text-center">
            <div className="text-8xl mb-4">🏆</div>
            <div className="text-4xl font-black text-yellow-400">Отлично!</div>
            <div className="text-lg text-white mt-2">Получено XP!</div>
          </div>
        </div>
      )}

      <div className="relative z-10">
        {screen === "home" && (
          <HomeScreen T={T} isLight={isLight} theme={theme} setTheme={setTheme}
            lang={selectedLang} xp={xp} xpProgress={xpProgress} level={level}
            streak={streak} gems={gems} lives={lives} lessons={currentLessons}
            completedLessons={completedLessons} onSelectLang={setSelectedLang}
            onStartLesson={(idx) => { setLessonIdx(idx); setWordIdx(0); setFlipped(false); setScreen("lesson"); }}
            onStartQuiz={resetQuiz}
            onStartDialogue={() => { setDialogueStep(0); setShowTranslation(null); setScreen("dialogue"); }}
          />
        )}
        {screen === "lesson" && currentWord && (
          <LessonScreen T={T} isLight={isLight} lesson={currentLesson} word={currentWord}
            wordIdx={wordIdx} totalWords={currentWords.length} flipped={flipped} lang={selectedLang}
            onFlip={() => setFlipped((f) => !f)} onNext={handleNextWord}
            onBack={() => setScreen("home")} onSpeak={() => speakText(currentWord.word, selectedLang)}
          />
        )}
        {screen === "quiz" && currentQuestion && (
          <QuizScreen T={T} isLight={isLight} question={currentQuestion} quizIdx={quizIdx}
            total={quizQuestions.length} lives={lives} selectedAnswer={selectedAnswer}
            onAnswer={handleAnswerSelect} onBack={() => setScreen("home")}
          />
        )}
        {screen === "dialogue" && (
          <DialogueScreen T={T} isLight={isLight} dialogue={dialogue} step={dialogueStep}
            lang={selectedLang} showTranslation={showTranslation}
            onNext={() => {
              if (dialogueStep + 1 < dialogue.length) { setDialogueStep((s) => s + 1); }
              else { setXp((x) => x + 30); setGems((g) => g + 2); setShowReward(true); setTimeout(() => { setShowReward(false); setScreen("home"); }, 2000); }
            }}
            onSpeak={(text) => speakText(text, selectedLang)}
            onToggleTranslation={(idx) => setShowTranslation(showTranslation === idx ? null : idx)}
            onBack={() => setScreen("home")}
          />
        )}
        {screen === "result" && (
          <ResultScreen T={T} isLight={isLight} correct={correct} total={quizQuestions.length}
            xpEarned={correct * 10} onRetry={resetQuiz} onHome={() => setScreen("home")}
          />
        )}
      </div>
    </div>
  );
}

// ─── HOME ───────────────────────────────────────────────────────────────────

interface ThemeStyles {
  text: string; textMuted: string; card: string; statBadge: string;
  btn: string; btnStyle: React.CSSProperties; progressTrack: string; progressFill: string;
  navBar: string; navActive: string; navInactive: string;
  langCard: (active: boolean) => string; lessonCard: string; quizCard: string;
  dialogueNative: string; dialogueUser: string; streakBanner: React.CSSProperties;
}

function HomeScreen({ T, isLight, theme, setTheme, lang, xp, xpProgress, level, streak, gems, lives, lessons, completedLessons, onSelectLang, onStartLesson, onStartQuiz, onStartDialogue }: {
  T: ThemeStyles; isLight: boolean; theme: Theme; setTheme: (t: Theme) => void;
  lang: Language; xp: number; xpProgress: number; level: number; streak: number; gems: number; lives: number;
  lessons: typeof LESSONS["english"]; completedLessons: number[];
  onSelectLang: (l: Language) => void; onStartLesson: (idx: number) => void;
  onStartQuiz: () => void; onStartDialogue: () => void;
}) {
  return (
    <div className="max-w-md mx-auto px-4 py-6 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-5 animate-slide-up">
        <div>
          <div className={`text-2xl font-black tracking-tight ${T.text}`}>LinguaQuest</div>
          <div className={`text-xs ${T.textMuted}`}>Уровень {level} · {xp} XP</div>
        </div>
        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-all hover:scale-110 ${T.statBadge}`}
            title="Сменить тему"
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </button>
          <div className={`flex items-center gap-1 px-3 py-1.5 ${T.statBadge}`}>
            <span>🔥</span><span className="font-black text-orange-500 text-sm">{streak}</span>
          </div>
          <div className={`flex items-center gap-1 px-3 py-1.5 ${T.statBadge}`}>
            <span>💎</span><span className="font-black text-cyan-500 text-sm">{gems}</span>
          </div>
          <div className={`flex items-center gap-1 px-3 py-1.5 ${T.statBadge}`}>
            <span>❤️</span><span className="font-black text-red-500 text-sm">{lives}</span>
          </div>
        </div>
      </div>

      {/* XP Bar */}
      <div className="mb-5 animate-slide-up" style={{ animationDelay: "0.05s" }}>
        <div className={`flex justify-between text-xs mb-1.5 ${T.textMuted}`}>
          <span>Уровень {level}</span><span>{xpProgress}/100 XP</span>
        </div>
        <div className={T.progressTrack}>
          <div className={T.progressFill} style={{ width: `${xpProgress}%` }} />
        </div>
      </div>

      {/* Language Selector */}
      <div className="mb-5 animate-slide-up" style={{ animationDelay: "0.08s" }}>
        <div className={`text-xs font-black uppercase tracking-widest mb-2 ${T.textMuted}`}>Язык</div>
        <div className="grid grid-cols-3 gap-2">
          {(Object.entries(LANGUAGES) as [Language, { name: string; flag: string }][]).map(([key, info]) => (
            <button key={key} onClick={() => onSelectLang(key)} className={T.langCard(lang === key)}>
              <div className="text-2xl mb-1">{info.flag}</div>
              <div className={`text-xs font-bold leading-tight ${T.text}`}>{info.name}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Streak Banner */}
      <div className="mb-5 rounded-2xl p-4 flex items-center gap-3 animate-slide-up" style={{ animationDelay: "0.12s", ...T.streakBanner }}>
        <div className="text-4xl">🔥</div>
        <div>
          <div className={`font-black ${isLight ? "text-amber-800" : "text-white"}`}>{streak}-дневная серия!</div>
          <div className={`text-xs ${isLight ? "text-amber-600" : "text-orange-300/80"}`}>Занимайся каждый день</div>
        </div>
        <div className="ml-auto badge-xp">+2x XP</div>
      </div>

      {/* Lessons */}
      <div className="mb-5 animate-slide-up" style={{ animationDelay: "0.16s" }}>
        <div className={`text-xs font-black uppercase tracking-widest mb-3 ${T.textMuted}`}>📚 Уроки</div>
        <div className="flex flex-col gap-2.5">
          {lessons.map((lesson: typeof LESSONS["english"][0], idx: number) => {
            const isDone = completedLessons.includes(idx);
            return (
              <button key={idx} onClick={() => onStartLesson(idx)} className={T.lessonCard}>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 ${isDone ? "bg-green-100" : isLight ? "bg-gray-100" : "bg-secondary"}`}>
                  {isDone ? "✅" : lesson.icon}
                </div>
                <div className="flex-1">
                  <div className={`font-bold text-sm ${T.text}`}>{lesson.title}</div>
                  <div className={`text-xs ${T.textMuted}`}>{lesson.topic} · {lesson.words.length} слов</div>
                  {isDone && <div className="text-xs text-green-600 font-bold mt-0.5">Пройдено ✓</div>}
                </div>
                <Icon name="ChevronRight" size={18} className={T.textMuted} />
              </button>
            );
          })}
        </div>
      </div>

      {/* Quiz + Dialogue */}
      <div className="grid grid-cols-2 gap-3 mb-6 animate-slide-up" style={{ animationDelay: "0.22s" }}>
        <button onClick={onStartQuiz} className={`${T.card} p-4 text-center`}
          style={isLight ? { background: "linear-gradient(135deg,#f5f3ff 0%,#ede9fe 100%)", border: "1px solid #c4b5fd" } : { background: "linear-gradient(135deg,hsl(280 50% 16%) 0%,hsl(280 40% 12%) 100%)", border: "1px solid hsl(280 50% 28%)" }}>
          <div className="text-3xl mb-2">🧠</div>
          <div className={`font-black text-sm ${T.text}`}>Тест знаний</div>
          <div className={`text-xs mt-1 ${T.textMuted}`}>+10 XP / ответ</div>
        </button>
        <button onClick={onStartDialogue} className={`${T.card} p-4 text-center`}
          style={isLight ? { background: "linear-gradient(135deg,#ecfeff 0%,#cffafe 100%)", border: "1px solid #67e8f9" } : { background: "linear-gradient(135deg,hsl(195 60% 16%) 0%,hsl(220 50% 12%) 100%)", border: "1px solid hsl(195 60% 28%)" }}>
          <div className="text-3xl mb-2">💬</div>
          <div className={`font-black text-sm ${T.text}`}>Диалог</div>
          <div className={`text-xs mt-1 ${T.textMuted}`}>+30 XP за диалог</div>
        </button>
      </div>

      {/* Bottom Nav */}
      <div className={`flex items-center justify-around py-3 ${T.navBar}`}>
        {[{ icon: "Home" as const, label: "Главная", active: true }, { icon: "BookOpen" as const, label: "Уроки", active: false }, { icon: "Trophy" as const, label: "Рейтинг", active: false }, { icon: "User" as const, label: "Профиль", active: false }].map((item) => (
          <button key={item.label} className={`flex flex-col items-center gap-1 px-3 py-1 rounded-xl ${item.active ? T.navActive : T.navInactive}`}>
            <Icon name={item.icon} size={22} />
            <span className="text-xs font-bold">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── LESSON ─────────────────────────────────────────────────────────────────

function LessonScreen({ T, isLight, lesson, word, wordIdx, totalWords, flipped, onFlip, onNext, onBack, onSpeak }: {
  T: ThemeStyles; isLight: boolean; lesson: typeof LESSONS["english"][0]; word: Word;
  wordIdx: number; totalWords: number; flipped: boolean; lang: Language;
  onFlip: () => void; onNext: (e: React.MouseEvent) => void; onBack: () => void; onSpeak: () => void;
}) {
  return (
    <div className="max-w-md mx-auto px-4 py-6 min-h-screen flex flex-col">
      <div className="flex items-center gap-3 mb-5">
        <button onClick={onBack} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${isLight ? "bg-gray-100 text-gray-500 hover:bg-gray-200" : "bg-secondary text-muted-foreground hover:text-white"}`}>
          <Icon name="ArrowLeft" size={20} />
        </button>
        <div className="flex-1">
          <div className={`font-black ${T.text}`}>{lesson.title}</div>
          <div className={`text-xs ${T.textMuted}`}>{lesson.topic}</div>
        </div>
        <div className={`text-sm font-bold ${T.textMuted}`}>{wordIdx + 1}/{totalWords}</div>
      </div>

      <div className={T.progressTrack} style={{ marginBottom: "2rem" }}>
        <div className={T.progressFill} style={{ width: `${((wordIdx + 1) / totalWords) * 100}%` }} />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-6">
        <div onClick={onFlip} className="w-full cursor-pointer" style={{ perspective: 1000 }}>
          <div style={{ transition: "transform 0.55s cubic-bezier(0.34,1.56,0.64,1)", transformStyle: "preserve-3d", transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)", position: "relative", height: 240 }}>
            {/* Front */}
            <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl"
              style={{ backfaceVisibility: "hidden", background: isLight ? "linear-gradient(135deg,#fff 0%,#f8fafc 100%)" : "linear-gradient(135deg,hsl(240 22% 16%) 0%,hsl(240 18% 11%) 100%)", border: isLight ? "2px solid #e2e8f0" : "1px solid hsl(240 15% 22%)", boxShadow: isLight ? "0 4px 24px rgba(0,0,0,0.08)" : "none" }}>
              <div className="text-6xl mb-4">{word.emoji}</div>
              <div className={`text-4xl font-black mb-2 ${T.text}`}>{word.word}</div>
              <div className={`text-sm ${T.textMuted}`}>{word.transcription}</div>
              <div className={`mt-5 text-xs ${T.textMuted} opacity-60`}>↻ Нажми для перевода</div>
            </div>
            {/* Back */}
            <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl"
              style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)", background: isLight ? "linear-gradient(135deg,#f0fdf4 0%,#dcfce7 100%)" : "linear-gradient(135deg,hsl(142 40% 11%) 0%,hsl(160 30% 9%) 100%)", border: isLight ? "2px solid #86efac" : "1px solid hsl(142 60% 22%)", boxShadow: isLight ? "0 4px 24px rgba(34,197,94,0.12)" : "none" }}>
              <div className="text-6xl mb-4">{word.emoji}</div>
              <div className="text-4xl font-black mb-2 text-green-600">{word.translation}</div>
              <div className={`text-sm ${T.textMuted}`}>{word.word}</div>
            </div>
          </div>
        </div>
        <button onClick={onSpeak} className="flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-white transition-all hover:scale-105 active:scale-95"
          style={{ background: "linear-gradient(135deg,#3b82f6 0%,#0ea5e9 100%)", boxShadow: "0 4px 16px rgba(59,130,246,0.35)" }}>
          <span className="text-xl">🔊</span> Послушать произношение
        </button>
      </div>

      <button onClick={onNext} className={T.btn} style={T.btnStyle}>
        {wordIdx + 1 < totalWords ? "Следующее слово →" : "🎉 Завершить урок!"}
      </button>
    </div>
  );
}

// ─── QUIZ ────────────────────────────────────────────────────────────────────

function QuizScreen({ T, isLight, question, quizIdx, total, lives, selectedAnswer, onAnswer, onBack }: {
  T: ThemeStyles; isLight: boolean; question: QuizQuestion; quizIdx: number; total: number;
  lives: number; selectedAnswer: number | null;
  onAnswer: (e: React.MouseEvent, idx: number) => void; onBack: () => void;
}) {
  return (
    <div className="max-w-md mx-auto px-4 py-6 min-h-screen flex flex-col">
      <div className="flex items-center gap-3 mb-5">
        <button onClick={onBack} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${isLight ? "bg-gray-100 text-gray-500 hover:bg-gray-200" : "bg-secondary text-muted-foreground hover:text-white"}`}>
          <Icon name="ArrowLeft" size={20} />
        </button>
        <div className="flex-1">
          <div className={`font-black ${T.text}`}>Тест знаний</div>
          <div className={`text-xs ${T.textMuted}`}>Вопрос {quizIdx + 1} из {total}</div>
        </div>
        <div className="flex gap-1">{Array.from({ length: 3 }).map((_, i) => <span key={i}>{i < lives ? "❤️" : "🖤"}</span>)}</div>
      </div>

      <div className={T.progressTrack} style={{ marginBottom: "2rem" }}>
        <div className={T.progressFill} style={{ width: `${(quizIdx / total) * 100}%` }} />
      </div>

      <div className={T.quizCard} style={isLight ? {} : { background: "linear-gradient(135deg,hsl(280 30% 15%) 0%,hsl(280 20% 11%) 100%)", border: "1px solid hsl(280 40% 24%)" }}>
        <div className={`text-sm mb-3 ${T.textMuted}`}>{question.question}</div>
        <div className={`text-5xl font-black ${T.text}`}>{question.word}</div>
      </div>

      <div className="flex flex-col gap-3 flex-1">
        {question.options.map((opt: string, idx: number) => {
          const isCorrect = selectedAnswer !== null && idx === question.correct;
          const isWrong = selectedAnswer !== null && idx === selectedAnswer && idx !== question.correct;
          const base = isLight
            ? `border-2 rounded-2xl p-4 flex items-center gap-4 w-full text-left transition-all cursor-pointer ${isCorrect ? "border-green-500 bg-green-50 animate-[correct-bounce_0.5s_ease]" : isWrong ? "border-red-400 bg-red-50 animate-[shake_0.4s_ease]" : "border-gray-200 bg-white/80 hover:border-green-400 hover:bg-green-50"}`
            : `answer-option p-4 flex items-center gap-4 w-full text-left${isCorrect ? " correct" : isWrong ? " wrong" : ""}`;
          return (
            <button key={idx} className={base} onClick={(e) => onAnswer(e, idx)}>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm flex-shrink-0 transition-colors ${isCorrect ? "bg-green-500 text-white" : isWrong ? "bg-red-500 text-white" : isLight ? "bg-gray-100 text-gray-600" : "bg-secondary text-muted-foreground"}`}>
                {["A", "B", "C", "D"][idx]}
              </div>
              <span className={`font-bold ${T.text}`}>{opt}</span>
              {isCorrect && <span className="ml-auto">✅</span>}
              {isWrong && <span className="ml-auto">❌</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── DIALOGUE ────────────────────────────────────────────────────────────────

function DialogueScreen({ T, isLight, dialogue, step, lang, showTranslation, onNext, onSpeak, onToggleTranslation, onBack }: {
  T: ThemeStyles; isLight: boolean; dialogue: DialogueLine[]; step: number; lang: Language;
  showTranslation: number | null; onNext: () => void; onSpeak: (t: string) => void;
  onToggleTranslation: (idx: number) => void; onBack: () => void;
}) {
  const current = dialogue[step];
  const visibleLines = dialogue.slice(0, step + 1);
  return (
    <div className="max-w-md mx-auto px-4 py-6 min-h-screen flex flex-col">
      <div className="flex items-center gap-3 mb-5">
        <button onClick={onBack} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${isLight ? "bg-gray-100 text-gray-500 hover:bg-gray-200" : "bg-secondary text-muted-foreground hover:text-white"}`}>
          <Icon name="ArrowLeft" size={20} />
        </button>
        <div className="flex-1">
          <div className={`font-black ${T.text}`}>Диалог</div>
          <div className={`text-xs ${T.textMuted}`}>Шаг {step + 1} из {dialogue.length}</div>
        </div>
        <div className="text-2xl">{LANGUAGES[lang as Language].flag}</div>
      </div>

      <div className={T.progressTrack} style={{ marginBottom: "1.25rem" }}>
        <div className={T.progressFill} style={{ width: `${((step + 1) / dialogue.length) * 100}%` }} />
      </div>

      <div className="flex-1 flex flex-col gap-3 mb-4 overflow-y-auto">
        {visibleLines.map((line: DialogueLine, idx: number) => (
          <div key={idx} className={`flex ${line.speaker === "user" ? "justify-end" : "justify-start"} animate-slide-up`}>
            {line.speaker === "native" && (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center mr-2 flex-shrink-0 mt-1 text-sm">
                {LANGUAGES[lang as Language].flag}
              </div>
            )}
            <div className="max-w-[78%]">
              <div className={`px-4 py-3 font-bold text-sm leading-snug ${line.speaker === "user" ? T.dialogueUser : T.dialogueNative}`}>
                {line.text}
              </div>
              <div className="flex items-center gap-2 mt-1 px-1">
                <button onClick={() => onToggleTranslation(idx)} className={`text-xs transition-colors hover:text-green-500 ${T.textMuted}`}>
                  {showTranslation === idx ? line.translation : "перевод"}
                </button>
                {line.speaker === "native" && (
                  <button onClick={() => onSpeak(line.text)} className="text-xs text-cyan-500 hover:text-cyan-700 transition-colors">🔊</button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl p-4 mb-4" style={isLight ? { background: "linear-gradient(135deg,#ecfeff 0%,#e0f2fe 100%)", border: "1px solid #67e8f9" } : { background: "linear-gradient(135deg,hsl(195 40% 13%) 0%,hsl(220 30% 10%) 100%)", border: "1px solid hsl(195 50% 20%)" }}>
        <div className={`text-xs mb-1 ${T.textMuted}`}>{current.speaker === "user" ? "Твоя реплика:" : "Носитель говорит:"}</div>
        <div className={`font-black ${T.text}`}>{current.text}</div>
        {current.speaker === "native" && (
          <button onClick={() => onSpeak(current.text)} className="mt-2 flex items-center gap-1.5 text-sm font-bold text-cyan-500 hover:text-cyan-700 transition-colors">🔊 Послушать</button>
        )}
      </div>

      <button onClick={onNext} className={T.btn} style={T.btnStyle}>
        {step + 1 < dialogue.length ? "Продолжить →" : "🎉 Завершить диалог!"}
      </button>
    </div>
  );
}

// ─── RESULT ──────────────────────────────────────────────────────────────────

function ResultScreen({ T, isLight, correct, total, xpEarned, onRetry, onHome }: {
  T: ThemeStyles; isLight: boolean; correct: number; total: number; xpEarned: number;
  onRetry: () => void; onHome: () => void;
}) {
  const pct = Math.round((correct / total) * 100);
  const stars = pct >= 90 ? 3 : pct >= 60 ? 2 : 1;
  return (
    <div className="max-w-md mx-auto px-4 py-6 min-h-screen flex flex-col items-center justify-center">
      <div className="animate-bounce-in text-center mb-8">
        <div className="text-8xl mb-4">{stars === 3 ? "🏆" : stars === 2 ? "🥈" : "🥉"}</div>
        <div className={`text-3xl font-black mb-3 ${T.text}`}>{stars === 3 ? "Идеально!" : stars === 2 ? "Хорошо!" : "Продолжай!"}</div>
        <div className="flex justify-center gap-2 text-4xl">
          {Array.from({ length: 3 }).map((_, i) => <span key={i} className={i < stars ? "" : "opacity-25"}>⭐</span>)}
        </div>
      </div>
      <div className="w-full grid grid-cols-3 gap-3 mb-8">
        <div className={`${T.card} p-4 text-center`}>
          <div className="text-3xl font-black text-green-500">{correct}/{total}</div>
          <div className={`text-xs mt-1 ${T.textMuted}`}>Ответов</div>
        </div>
        <div className={`${T.card} p-4 text-center`}>
          <div className="text-3xl font-black text-yellow-500">+{xpEarned}</div>
          <div className={`text-xs mt-1 ${T.textMuted}`}>XP</div>
        </div>
        <div className={`${T.card} p-4 text-center`}>
          <div className="text-3xl font-black text-cyan-500">{pct}%</div>
          <div className={`text-xs mt-1 ${T.textMuted}`}>Точность</div>
        </div>
      </div>
      <div className="w-full flex flex-col gap-3">
        <button onClick={onRetry} className={T.btn} style={T.btnStyle}>🔄 Пройти снова</button>
        <button onClick={onHome} className={`w-full py-4 text-lg font-black rounded-2xl transition-colors ${isLight ? "bg-gray-100 text-gray-700 hover:bg-gray-200" : "bg-secondary text-white hover:bg-muted"}`}>
          🏠 На главную
        </button>
      </div>
    </div>
  );
}