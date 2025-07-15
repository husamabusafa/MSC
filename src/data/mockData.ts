import { User, Level, Course, FlashcardDeck, Quiz, Question, Answer, Book, ProductCategory, Product, PreRegisteredStudent, GpaSubject, BookOrder, Order } from '../types';

export const mockUsers: User[] = [
  {
    id: '1',
    email: 'student@example.com',
    name: 'Ahmed Hassan',
    role: 'student',
    universityId: 'ST001',
    createdAt: '2024-01-15T10:00:00Z',
    isActive: true
  },
  {
    id: '2',
    email: 'admin@example.com',
    name: 'Dr. Sarah Johnson',
    role: 'admin',
    createdAt: '2024-01-10T08:00:00Z',
    isActive: true
  }
];

export const mockPreRegisteredStudents: PreRegisteredStudent[] = [
  {
    id: '1',
    fullName: 'Omar Al-Rashid',
    universityId: 'ST002',
    isUsed: false
  },
  {
    id: '2',
    fullName: 'Fatima Ibrahim',
    universityId: 'ST003',
    isUsed: false
  }
];

export const mockLevels: Level[] = [
  {
    id: '1',
    name: 'First Year',
    description: 'Foundation courses for first-year students',
    order: 1,
    isVisible: true,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'Second Year',
    description: 'Intermediate level courses',
    order: 2,
    isVisible: true,
    createdAt: '2024-01-01T00:00:00Z'
  }
];

export const mockCourses: Course[] = [
  {
    id: '1',
    name: 'Introduction to Computer Science',
    description: 'Basic concepts of computer science and programming',
    levelId: '1',
    isVisible: true,
    createdAt: '2024-01-02T00:00:00Z'
  },
  {
    id: '2',
    name: 'Mathematics I',
    description: 'Fundamental mathematics for engineering students',
    levelId: '1',
    isVisible: true,
    createdAt: '2024-01-02T00:00:00Z'
  },
  {
    id: '3',
    name: 'Data Structures',
    description: 'Advanced data structures and algorithms',
    levelId: '2',
    isVisible: true,
    createdAt: '2024-01-02T00:00:00Z'
  }
];

export const mockFlashcardDecks: FlashcardDeck[] = [
  {
    id: '1',
    name: 'Programming Basics',
    description: 'Essential programming concepts',
    courseId: '1',
    isVisible: true,
    createdAt: '2024-01-03T00:00:00Z',
    cards: [
      {
        id: '1',
        question: 'What is a variable?',
        answer: 'A storage location with an associated name that contains data',
        deckId: '1',
        order: 1
      },
      {
        id: '2',
        question: 'What is an algorithm?',
        answer: 'A step-by-step procedure for solving a problem',
        deckId: '1',
        order: 2
      }
    ]
  }
];

export const mockQuizzes: Quiz[] = [
  {
    id: '1',
    title: 'CS Fundamentals Quiz',
    description: 'Test your knowledge of computer science basics',
    courseId: '1',
    isVisible: true,
    createdAt: '2024-01-04T00:00:00Z',
    questions: []
  }
];

export const mockQuestions: Question[] = [
  {
    id: '1',
    text: 'Which of the following is a programming language?',
    quizId: '1',
    order: 1,
    explanation: 'Python is a high-level programming language.',
    answers: [
      {
        id: '1',
        text: 'Python',
        questionId: '1',
        isCorrect: true,
        order: 1
      },
      {
        id: '2',
        text: 'HTML',
        questionId: '1',
        isCorrect: false,
        order: 2
      },
      {
        id: '3',
        text: 'CSS',
        questionId: '1',
        isCorrect: false,
        order: 3
      }
    ]
  }
];

export const mockGpaSubjects: GpaSubject[] = [
  {
    id: '1',
    yearName: 'First Year',
    subjectName: 'Mathematics I',
    creditHours: 3,
    order: 1
  },
  {
    id: '2',
    yearName: 'First Year',
    subjectName: 'Physics I',
    creditHours: 3,
    order: 2
  },
  {
    id: '3',
    yearName: 'First Year',
    subjectName: 'Computer Science Fundamentals',
    creditHours: 4,
    order: 3
  }
];

export const mockBooks: Book[] = [
  {
    id: '1',
    title: 'Introduction to Algorithms',
    slug: 'introduction-to-algorithms',
    author: 'Thomas H. Cormen',
    coverImage: 'https://images.pexels.com/photos/256541/pexels-photo-256541.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'A comprehensive introduction to algorithms and data structures',
    totalCopies: 5,
    availableCopies: 3,
    isVisible: true,
    createdAt: '2024-01-05T00:00:00Z'
  },
  {
    id: '2',
    title: 'Clean Code',
    slug: 'clean-code',
    author: 'Robert C. Martin',
    coverImage: 'https://images.pexels.com/photos/4050291/pexels-photo-4050291.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'A handbook of agile software craftsmanship',
    totalCopies: 3,
    availableCopies: 2,
    isVisible: true,
    createdAt: '2024-01-05T00:00:00Z'
  }
];

export const mockBookOrders: BookOrder[] = [
  {
    id: '1',
    studentId: '1',
    bookId: '1',
    status: 'pending',
    studentNotes: 'Need this for upcoming exam',
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-01-10T10:00:00Z'
  }
];

export const mockProductCategories: ProductCategory[] = [
  {
    id: '1',
    name: 'Stationery',
    description: 'Office and study supplies',
    isVisible: true,
    createdAt: '2024-01-06T00:00:00Z'
  },
  {
    id: '2',
    name: 'Textbooks',
    description: 'Academic textbooks and reference materials',
    isVisible: true,
    createdAt: '2024-01-06T00:00:00Z'
  }
];

export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Scientific Calculator',
    slug: 'scientific-calculator',
    description: 'Advanced scientific calculator for engineering students',
    image: 'https://images.pexels.com/photos/6238050/pexels-photo-6238050.jpeg?auto=compress&cs=tinysrgb&w=400',
    price: 45.99,
    categoryId: '1',
    isVisible: true,
    isSpecialOffer: true,
    createdAt: '2024-01-07T00:00:00Z'
  },
  {
    id: '2',
    name: 'Notebook Set',
    slug: 'notebook-set',
    description: 'Pack of 3 premium notebooks for note-taking',
    image: 'https://images.pexels.com/photos/4050428/pexels-photo-4050428.jpeg?auto=compress&cs=tinysrgb&w=400',
    price: 12.99,
    categoryId: '1',
    isVisible: true,
    isSpecialOffer: false,
    createdAt: '2024-01-07T00:00:00Z'
  }
];

export const mockOrders: Order[] = [
  {
    id: '1',
    studentId: '1',
    items: [
      {
        id: '1',
        orderId: '1',
        productId: '1',
        quantity: 1,
        price: 45.99
      }
    ],
    total: 45.99,
    status: 'pending',
    studentNotes: 'Please deliver to room 205',
    createdAt: '2024-01-10T14:00:00Z',
    updatedAt: '2024-01-10T14:00:00Z'
  }
];

// Helper function to get related data
export const getRelatedData = () => {
  // Add level references to courses
  const coursesWithLevels = mockCourses.map(course => ({
    ...course,
    level: mockLevels.find(level => level.id === course.levelId)
  }));

  // Add course references to flashcard decks
  const flashcardDecksWithCourses = mockFlashcardDecks.map(deck => ({
    ...deck,
    course: coursesWithLevels.find(course => course.id === deck.courseId)
  }));

  // Add course references to quizzes and questions to quizzes
  const quizzesWithCourses = mockQuizzes.map(quiz => ({
    ...quiz,
    course: coursesWithLevels.find(course => course.id === quiz.courseId),
    questions: mockQuestions.filter(question => question.quizId === quiz.id)
  }));

  // Add category references to products
  const productsWithCategories = mockProducts.map(product => ({
    ...product,
    category: mockProductCategories.find(category => category.id === product.categoryId)
  }));

  // Add student and book references to book orders
  const bookOrdersWithReferences = mockBookOrders.map(order => ({
    ...order,
    student: mockUsers.find(user => user.id === order.studentId),
    book: mockBooks.find(book => book.id === order.bookId)
  }));

  // Add student and product references to orders
  const ordersWithReferences = mockOrders.map(order => ({
    ...order,
    student: mockUsers.find(user => user.id === order.studentId),
    items: order.items.map(item => ({
      ...item,
      product: productsWithCategories.find(product => product.id === item.productId)
    }))
  }));

  return {
    users: mockUsers,
    preRegisteredStudents: mockPreRegisteredStudents,
    levels: mockLevels,
    courses: coursesWithLevels,
    flashcardDecks: flashcardDecksWithCourses,
    quizzes: quizzesWithCourses,
    questions: mockQuestions,
    gpaSubjects: mockGpaSubjects,
    books: mockBooks,
    bookOrders: bookOrdersWithReferences,
    productCategories: mockProductCategories,
    products: productsWithCategories,
    orders: ordersWithReferences
  };
};