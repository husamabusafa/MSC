export interface User {
  id: string;
  email: string;
  name: string;
  role: 'STUDENT' | 'SUPER_ADMIN' | 'ACADEMIC_ADMIN' | 'LIBRARY_ADMIN' | 'STORE_ADMIN';
  universityId?: string;
  createdAt: string;
  isActive: boolean;
}



export interface Level {
  id: string;
  name: string;
  description: string;
  order: number;
  isVisible: boolean;
  createdAt: string;
}

export interface Course {
  id: string;
  name: string;
  description: string;
  levelId: string;
  level?: Level;
  isVisible: boolean;
  createdAt: string;
}

export interface FlashcardDeck {
  id: string;
  name: string;
  description: string;
  courseId: string;
  course?: Course;
  cards: Flashcard[];
  isVisible: boolean;
  createdAt: string;
}

export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  deckId: string;
  order: number;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  courseId: string;
  course?: Course;
  questions: Question[];
  isVisible: boolean;
  hasDuration?: boolean;
  durationMinutes?: number;
  showAnswersImmediately?: boolean;
  createdAt: string;
}

export interface Question {
  id: string;
  text: string;
  image?: string;
  explanation?: string;
  explanationImage?: string;
  quizId: string;
  order: number;
  answers: Answer[];
}

export interface Answer {
  id: string;
  text: string;
  questionId: string;
  isCorrect: boolean;
  order: number;
}

export interface GpaSubject {
  id: string;
  yearName: string;
  subjectName: string;
  creditHours: number;
  order: number;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  levelId?: string;
  levelName?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Book {
  id: string;
  title: string;
  slug: string;
  author: string;
  coverImage?: string;
  description: string;
  totalCopies: number;
  availableCopies: number;
  isVisible: boolean;
  createdAt: string;
}

export interface BookOrder {
  id: string;
  studentId: string;
  student?: User;
  bookId: string;
  book?: Book;
  status: 'pending' | 'approved' | 'returned' | 'cancelled';
  studentNotes?: string;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  description: string;
  isVisible: boolean;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  image?: string;
  price: number;
  categoryId: string;
  category?: ProductCategory;
  isVisible: boolean;
  isSpecialOffer: boolean;
  createdAt: string;
}

export interface Order {
  id: string;
  studentId: string;
  student?: User;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'completed' | 'cancelled';
  studentNotes?: string;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  product?: Product;
  quantity: number;
  price: number;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

export interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export interface I18nContextType {
  language: 'en' | 'ar';
  setLanguage: (lang: 'en' | 'ar') => void;
  t: (key: string) => string;
  dir: 'ltr' | 'rtl';
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  studentId: string;
  answers: QuizAnswer[];
  score: number;
  totalQuestions: number;
  completedAt: string;
}

export interface QuizAnswer {
  questionId: string;
  answerId: string;
  isCorrect: boolean;
}