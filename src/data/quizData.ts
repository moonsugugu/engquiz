import { QuizQuestion } from '../types';

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    word: 'Breakfast',
    phonetic: '[브렉퍼스트]',
    koreanMeaning: '아침 식사',
    questionText: '아침에 일어나서 하루를 힘차게 시작하며 먹는 밥을 영어로 무엇이라고 할까요?',
    emoji: '🍳',
    category: '식생활',
    options: ['Breakfast', 'Dinner', 'Lunch', 'Snack'],
    correctAnswerIndex: 0,
    explanation: 'Breakfast는 "아침밥"이라는 뜻이에요. (Lunch는 점심, Dinner는 저녁, Snack은 간식입니다.)',
    exampleSentence: 'I eat delicious breakfast with milk.',
    exampleTranslation: '나는 우유와 함께 맛있는 아침밥을 먹어요.'
  },
  {
    id: 2,
    word: 'Library',
    phonetic: '[라이브러리]',
    koreanMeaning: '도서관',
    questionText: '학교나 동네에서 재미있는 책을 빌리거나 조용히 책을 읽을 수 있는 장소는 어디일까요?',
    emoji: '📚',
    category: '학교와 장소',
    options: ['Hospital', 'Bakery', 'Library', 'Airport'],
    correctAnswerIndex: 2,
    explanation: 'Library는 "도서관"이에요. (Hospital은 병원, Bakery는 빵집, Airport는 공항이에요.)',
    exampleSentence: 'We read storybooks in the school library.',
    exampleTranslation: '우리는 학교 도서관에서 동화책을 읽어요.'
  },
  {
    id: 3,
    word: 'Umbrella',
    phonetic: '[엄브렐라]',
    koreanMeaning: '우산',
    questionText: '하늘에서 주룩주룩 비가 내릴 때 비를 맞지 않도록 머리 위로 펼쳐 쓰는 물건은 무엇일까요?',
    emoji: '☔',
    category: '날씨와 물건',
    options: ['Backpack', 'Clock', 'Mirror', 'Umbrella'],
    correctAnswerIndex: 3,
    explanation: 'Umbrella는 "우산"이에요. (Backpack은 배낭/책가방, Clock은 시계, Mirror는 거울이에요.)',
    exampleSentence: 'Take your yellow umbrella on a rainy day.',
    exampleTranslation: '비 오는 날에는 노란 우산을 챙기세요.'
  },
  {
    id: 4,
    word: 'Pencil',
    phonetic: '[펜슬]',
    koreanMeaning: '연필',
    questionText: '공책에 또박또박 글씨를 쓰거나 예쁜 그림을 그릴 때 손에 쥐고 쓰는 필기도구는 무엇일까요?',
    emoji: '✏️',
    category: '학용품',
    options: ['Eraser', 'Pencil', 'Ruler', 'Scissors'],
    correctAnswerIndex: 1,
    explanation: 'Pencil은 "연필"이에요. (Eraser는 지우개, Ruler는 자, Scissors는 가위입니다.)',
    exampleSentence: 'I write my homework with a sharp pencil.',
    exampleTranslation: '나는 뾰족한 연필로 숙제를 써요.'
  },
  {
    id: 5,
    word: 'Bicycle',
    phonetic: '[바이시클]',
    koreanMeaning: '자전거',
    questionText: '두 발로 페달을 힘차게 밟아 굴리며 시원한 바람을 가르는 바퀴 2개 달린 탈것은 무엇일까요?',
    emoji: '🚲',
    category: '교통수단',
    options: ['Airplane', 'Bicycle', 'Submarine', 'Train'],
    correctAnswerIndex: 1,
    explanation: 'Bicycle은 "자전거"예요. 보통 줄여서 Bike라고도 많이 불러요. (Airplane은 비행기, Submarine은 잠수함, Train은 기차예요.)',
    exampleSentence: 'I ride my bicycle in the park with my friends.',
    exampleTranslation: '나는 공원에서 친구들과 자전거를 타요.'
  }
];
