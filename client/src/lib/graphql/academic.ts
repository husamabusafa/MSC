import { gql } from '@apollo/client';

// =============== LEVEL QUERIES ===============
export const GET_LEVELS = gql`
  query GetLevels {
    levels {
      id
      name
      description
      order
      isVisible
      createdAt
      updatedAt
      courses {
        id
        name
        description
        isVisible
        createdAt
        updatedAt
      }
    }
  }
`;

export const GET_LEVEL = gql`
  query GetLevel($id: ID!) {
    level(id: $id) {
      id
      name
      description
      order
      isVisible
      createdAt
      updatedAt
      courses {
        id
        name
        description
        isVisible
        createdAt
        updatedAt
      }
    }
  }
`;

export const CREATE_LEVEL = gql`
  mutation CreateLevel($createLevelInput: CreateLevelInput!) {
    createLevel(createLevelInput: $createLevelInput) {
      id
      name
      description
      order
      isVisible
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_LEVEL = gql`
  mutation UpdateLevel($id: ID!, $updateLevelInput: UpdateLevelInput!) {
    updateLevel(id: $id, updateLevelInput: $updateLevelInput) {
      id
      name
      description
      order
      isVisible
      createdAt
      updatedAt
    }
  }
`;

export const DELETE_LEVEL = gql`
  mutation DeleteLevel($id: ID!) {
    deleteLevel(id: $id)
  }
`;

// =============== COURSE QUERIES ===============
export const GET_COURSES = gql`
  query GetCourses {
    courses {
      id
      name
      description
      levelId
      isVisible
      createdAt
      updatedAt
      level {
        id
        name
        description
        order
      }
    }
  }
`;

export const GET_COURSE = gql`
  query GetCourse($id: ID!) {
    course(id: $id) {
      id
      name
      description
      levelId
      isVisible
      createdAt
      updatedAt
      level {
        id
        name
        description
        order
      }
      flashcardDecks {
        id
        name
        description
        isVisible
        cards {
          id
          question
          answer
          order
        }
      }
      quizzes {
        id
        title
        description
        isVisible
        questions {
          id
          text
          image
          explanation
          explanationImage
          order
          answers {
            id
            text
            isCorrect
            order
          }
        }
      }
    }
  }
`;

export const GET_COURSES_BY_LEVEL = gql`
  query GetCoursesByLevel($levelId: ID!) {
    coursesByLevel(levelId: $levelId) {
      id
      name
      description
      levelId
      isVisible
      createdAt
      updatedAt
      level {
        id
        name
        description
        order
      }
    }
  }
`;

export const CREATE_COURSE = gql`
  mutation CreateCourse($createCourseInput: CreateCourseInput!) {
    createCourse(createCourseInput: $createCourseInput) {
      id
      name
      description
      levelId
      isVisible
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_COURSE = gql`
  mutation UpdateCourse($id: ID!, $updateCourseInput: UpdateCourseInput!) {
    updateCourse(id: $id, updateCourseInput: $updateCourseInput) {
      id
      name
      description
      levelId
      isVisible
      createdAt
      updatedAt
    }
  }
`;

export const DELETE_COURSE = gql`
  mutation DeleteCourse($id: ID!) {
    deleteCourse(id: $id)
  }
`;

// =============== FLASHCARD QUERIES ===============
export const GET_FLASHCARD_DECKS = gql`
  query GetFlashcardDecks {
    flashcardDecks {
      id
      name
      description
      courseId
      isVisible
      createdAt
      updatedAt
      course {
        id
        name
        level {
          id
          name
        }
      }
      cards {
        id
        question
        answer
        order
      }
    }
  }
`;

export const GET_FLASHCARD_DECK = gql`
  query GetFlashcardDeck($id: ID!) {
    flashcardDeck(id: $id) {
      id
      name
      description
      courseId
      isVisible
      createdAt
      updatedAt
      course {
        id
        name
        level {
          id
          name
        }
      }
      cards {
        id
        question
        answer
        order
      }
    }
  }
`;

export const GET_FLASHCARD_DECKS_BY_COURSE = gql`
  query GetFlashcardDecksByCourse($courseId: ID!) {
    flashcardDecksByCourse(courseId: $courseId) {
      id
      name
      description
      courseId
      isVisible
      createdAt
      updatedAt
      cards {
        id
        question
        answer
        order
      }
    }
  }
`;

export const CREATE_FLASHCARD_DECK = gql`
  mutation CreateFlashcardDeck($createFlashcardDeckInput: CreateFlashcardDeckInput!) {
    createFlashcardDeck(createFlashcardDeckInput: $createFlashcardDeckInput) {
      id
      name
      description
      courseId
      isVisible
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_FLASHCARD_DECK = gql`
  mutation UpdateFlashcardDeck($id: ID!, $updateFlashcardDeckInput: UpdateFlashcardDeckInput!) {
    updateFlashcardDeck(id: $id, updateFlashcardDeckInput: $updateFlashcardDeckInput) {
      id
      name
      description
      courseId
      isVisible
      createdAt
      updatedAt
    }
  }
`;

export const DELETE_FLASHCARD_DECK = gql`
  mutation DeleteFlashcardDeck($id: ID!) {
    deleteFlashcardDeck(id: $id)
  }
`;

// =============== QUIZ QUERIES ===============
export const GET_QUIZZES = gql`
  query GetQuizzes {
    quizzes {
      id
      title
      description
      courseId
      isVisible
      createdAt
      updatedAt
      course {
        id
        name
        level {
          id
          name
        }
      }
      questions {
        id
        text
        image
        explanation
        explanationImage
        order
        answers {
          id
          text
          isCorrect
          order
        }
      }
    }
  }
`;

export const GET_QUIZ = gql`
  query GetQuiz($id: ID!) {
    quiz(id: $id) {
      id
      title
      description
      courseId
      isVisible
      createdAt
      updatedAt
      course {
        id
        name
        level {
          id
          name
        }
      }
      questions {
        id
        text
        image
        explanation
        explanationImage
        order
        answers {
          id
          text
          isCorrect
          order
        }
      }
    }
  }
`;

export const GET_QUIZZES_BY_COURSE = gql`
  query GetQuizzesByCourse($courseId: ID!) {
    quizzesByCourse(courseId: $courseId) {
      id
      title
      description
      courseId
      isVisible
      createdAt
      updatedAt
      questions {
        id
        text
        image
        explanation
        explanationImage
        order
        answers {
          id
          text
          isCorrect
          order
        }
      }
    }
  }
`;

export const CREATE_QUIZ = gql`
  mutation CreateQuiz($createQuizInput: CreateQuizInput!) {
    createQuiz(createQuizInput: $createQuizInput) {
      id
      title
      description
      courseId
      isVisible
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_QUIZ = gql`
  mutation UpdateQuiz($id: ID!, $updateQuizInput: UpdateQuizInput!) {
    updateQuiz(id: $id, updateQuizInput: $updateQuizInput) {
      id
      title
      description
      courseId
      isVisible
      createdAt
      updatedAt
    }
  }
`;

export const DELETE_QUIZ = gql`
  mutation DeleteQuiz($id: ID!) {
    deleteQuiz(id: $id)
  }
`;

// =============== GPA SUBJECT QUERIES ===============
export const GET_GPA_SUBJECTS = gql`
  query GetGpaSubjects {
    gpaSubjects {
      id
      yearName
      subjectName
      creditHours
      order
    }
  }
`;

export const GET_GPA_SUBJECT = gql`
  query GetGpaSubject($id: ID!) {
    gpaSubject(id: $id) {
      id
      yearName
      subjectName
      creditHours
      order
    }
  }
`;

export const CREATE_GPA_SUBJECT = gql`
  mutation CreateGpaSubject($createGpaSubjectInput: CreateGpaSubjectInput!) {
    createGpaSubject(createGpaSubjectInput: $createGpaSubjectInput) {
      id
      yearName
      subjectName
      creditHours
      order
    }
  }
`;

export const UPDATE_GPA_SUBJECT = gql`
  mutation UpdateGpaSubject($id: ID!, $updateGpaSubjectInput: UpdateGpaSubjectInput!) {
    updateGpaSubject(id: $id, updateGpaSubjectInput: $updateGpaSubjectInput) {
      id
      yearName
      subjectName
      creditHours
      order
    }
  }
`;

export const DELETE_GPA_SUBJECT = gql`
  mutation DeleteGpaSubject($id: ID!) {
    deleteGpaSubject(id: $id)
  }
`;

// =============== TYPESCRIPT INTERFACES ===============
export interface Level {
  id: string;
  name: string;
  description: string;
  order: number;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
  courses?: Course[];
}

export interface Course {
  id: string;
  name: string;
  description: string;
  levelId: string;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
  level?: Level;
  flashcardDecks?: FlashcardDeck[];
  quizzes?: Quiz[];
}

export interface FlashcardDeck {
  id: string;
  name: string;
  description: string;
  courseId: string;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
  course?: Course;
  cards?: Flashcard[];
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
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
  course?: Course;
  questions?: Question[];
}

export interface Question {
  id: string;
  text: string;
  image?: string;
  explanation?: string;
  explanationImage?: string;
  quizId: string;
  order: number;
  answers?: Answer[];
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