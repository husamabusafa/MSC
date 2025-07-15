import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateLevelInput,
  UpdateLevelInput,
  CreateCourseInput,
  UpdateCourseInput,
  CreateFlashcardDeckInput,
  UpdateFlashcardDeckInput,
  CreateQuizInput,
  UpdateQuizInput,
  CreateGpaSubjectInput,
  UpdateGpaSubjectInput,
  CreateFlashcardInput,
  CreateQuestionInput,
  CreateAnswerInput,
} from './dto/academic.dto';

@Injectable()
export class AcademicService {
  constructor(private readonly prisma: PrismaService) {}

  // =============== LEVEL OPERATIONS ===============
  async createLevel(createLevelInput: CreateLevelInput) {
    // Check if order already exists
    const existingLevel = await this.prisma.level.findUnique({
      where: { order: createLevelInput.order },
    });

    if (existingLevel) {
      throw new BadRequestException(`Level with order ${createLevelInput.order} already exists`);
    }

    return this.prisma.level.create({
      data: {
        ...createLevelInput,
      },
      include: {
        courses: {
          include: {
            flashcardDecks: true,
            quizzes: true,
          },
        },
      },
    });
  }

  async getAllLevels() {
    return this.prisma.level.findMany({
      orderBy: { order: 'asc' },
      include: {
        courses: {
          include: {
            flashcardDecks: true,
            quizzes: true,
          },
        },
      },
    });
  }

  async getLevelById(id: string) {
    const level = await this.prisma.level.findUnique({
      where: { id },
      include: {
        courses: {
          include: {
            flashcardDecks: true,
            quizzes: true,
          },
        },
      },
    });

    if (!level) {
      throw new NotFoundException(`Level with ID ${id} not found`);
    }

    return level;
  }

  async updateLevel(id: string, updateLevelInput: UpdateLevelInput) {
    const level = await this.prisma.level.findUnique({ where: { id } });
    if (!level) {
      throw new NotFoundException(`Level with ID ${id} not found`);
    }

    // Check if order already exists (if updating order)
    if (updateLevelInput.order && updateLevelInput.order !== level.order) {
      const existingLevel = await this.prisma.level.findUnique({
        where: { order: updateLevelInput.order },
      });

      if (existingLevel) {
        throw new BadRequestException(`Level with order ${updateLevelInput.order} already exists`);
      }
    }

    return this.prisma.level.update({
      where: { id },
      data: updateLevelInput,
      include: {
        courses: {
          include: {
            flashcardDecks: true,
            quizzes: true,
          },
        },
      },
    });
  }

  async deleteLevel(id: string) {
    const level = await this.prisma.level.findUnique({ where: { id } });
    if (!level) {
      throw new NotFoundException(`Level with ID ${id} not found`);
    }

    return this.prisma.level.delete({ where: { id } });
  }

  // =============== COURSE OPERATIONS ===============
  async createCourse(createCourseInput: CreateCourseInput) {
    // Check if level exists
    const level = await this.prisma.level.findUnique({
      where: { id: createCourseInput.levelId },
    });

    if (!level) {
      throw new NotFoundException(`Level with ID ${createCourseInput.levelId} not found`);
    }

    return this.prisma.course.create({
      data: {
        ...createCourseInput,
      },
      include: {
        level: true,
        flashcardDecks: true,
        quizzes: true,
      },
    });
  }

  async getAllCourses() {
    return this.prisma.course.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        level: true,
        flashcardDecks: true,
        quizzes: true,
      },
    });
  }

  async getCourseById(id: string) {
    const course = await this.prisma.course.findUnique({
      where: { id },
      include: {
        level: true,
        flashcardDecks: {
          include: {
            cards: true,
          },
        },
        quizzes: {
          include: {
            questions: {
              include: {
                answers: true,
              },
            },
          },
        },
      },
    });

    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }

    return course;
  }

  async getCoursesByLevel(levelId: string) {
    return this.prisma.course.findMany({
      where: { levelId },
      include: {
        level: true,
        flashcardDecks: true,
        quizzes: true,
      },
    });
  }

  async updateCourse(id: string, updateCourseInput: UpdateCourseInput) {
    const course = await this.prisma.course.findUnique({ where: { id } });
    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }

    // Check if new level exists (if updating levelId)
    if (updateCourseInput.levelId) {
      const level = await this.prisma.level.findUnique({
        where: { id: updateCourseInput.levelId },
      });

      if (!level) {
        throw new NotFoundException(`Level with ID ${updateCourseInput.levelId} not found`);
      }
    }

    return this.prisma.course.update({
      where: { id },
      data: updateCourseInput,
      include: {
        level: true,
        flashcardDecks: true,
        quizzes: true,
      },
    });
  }

  async deleteCourse(id: string) {
    const course = await this.prisma.course.findUnique({ where: { id } });
    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }

    return this.prisma.course.delete({ where: { id } });
  }

  // =============== FLASHCARD OPERATIONS ===============
  async createFlashcardDeck(createFlashcardDeckInput: CreateFlashcardDeckInput) {
    // Check if course exists
    const course = await this.prisma.course.findUnique({
      where: { id: createFlashcardDeckInput.courseId },
    });

    if (!course) {
      throw new NotFoundException(`Course with ID ${createFlashcardDeckInput.courseId} not found`);
    }

    return this.prisma.flashcardDeck.create({
      data: {
        name: createFlashcardDeckInput.name,
        description: createFlashcardDeckInput.description,
        courseId: createFlashcardDeckInput.courseId,
        isVisible: createFlashcardDeckInput.isVisible ?? true,
        cards: createFlashcardDeckInput.cards ? {
          create: createFlashcardDeckInput.cards,
        } : undefined,
      },
      include: {
        course: true,
        cards: true,
      },
    });
  }

  async getAllFlashcardDecks() {
    return this.prisma.flashcardDeck.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        course: {
          include: {
            level: true,
          },
        },
        cards: true,
      },
    });
  }

  async getFlashcardDeckById(id: string) {
    const deck = await this.prisma.flashcardDeck.findUnique({
      where: { id },
      include: {
        course: {
          include: {
            level: true,
          },
        },
        cards: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!deck) {
      throw new NotFoundException(`Flashcard deck with ID ${id} not found`);
    }

    return deck;
  }

  async getFlashcardDecksByCourse(courseId: string) {
    return this.prisma.flashcardDeck.findMany({
      where: { courseId },
      include: {
        course: true,
        cards: true,
      },
    });
  }

  async updateFlashcardDeck(id: string, updateFlashcardDeckInput: UpdateFlashcardDeckInput) {
    const deck = await this.prisma.flashcardDeck.findUnique({ where: { id } });
    if (!deck) {
      throw new NotFoundException(`Flashcard deck with ID ${id} not found`);
    }

    // Check if new course exists (if updating courseId)
    if (updateFlashcardDeckInput.courseId) {
      const course = await this.prisma.course.findUnique({
        where: { id: updateFlashcardDeckInput.courseId },
      });

      if (!course) {
        throw new NotFoundException(`Course with ID ${updateFlashcardDeckInput.courseId} not found`);
      }
    }

    return this.prisma.flashcardDeck.update({
      where: { id },
      data: updateFlashcardDeckInput,
      include: {
        course: true,
        cards: true,
      },
    });
  }

  async deleteFlashcardDeck(id: string) {
    const deck = await this.prisma.flashcardDeck.findUnique({ where: { id } });
    if (!deck) {
      throw new NotFoundException(`Flashcard deck with ID ${id} not found`);
    }

    return this.prisma.flashcardDeck.delete({ where: { id } });
  }

  // =============== QUIZ OPERATIONS ===============
  async createQuiz(createQuizInput: CreateQuizInput) {
    // Check if course exists
    const course = await this.prisma.course.findUnique({
      where: { id: createQuizInput.courseId },
    });

    if (!course) {
      throw new NotFoundException(`Course with ID ${createQuizInput.courseId} not found`);
    }

    return this.prisma.quiz.create({
      data: {
        title: createQuizInput.title,
        description: createQuizInput.description,
        courseId: createQuizInput.courseId,
        isVisible: createQuizInput.isVisible ?? true,
        hasDuration: createQuizInput.hasDuration ?? false,
        durationMinutes: createQuizInput.durationMinutes,
        questions: createQuizInput.questions ? {
          create: createQuizInput.questions.map(question => ({
            text: question.text,
            image: question.image,
            explanation: question.explanation,
            explanationImage: question.explanationImage,
            order: question.order,
            answers: {
              create: question.answers,
            },
          })),
        } : undefined,
      },
      include: {
        course: true,
        questions: {
          include: {
            answers: true,
          },
        },
      },
    });
  }

  async getAllQuizzes() {
    return this.prisma.quiz.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        course: {
          include: {
            level: true,
          },
        },
        questions: {
          include: {
            answers: true,
          },
        },
      },
    });
  }

  async getQuizById(id: string) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id },
      include: {
        course: {
          include: {
            level: true,
          },
        },
        questions: {
          orderBy: { order: 'asc' },
          include: {
            answers: {
              orderBy: { order: 'asc' },
            },
          },
        },
      },
    });

    if (!quiz) {
      throw new NotFoundException(`Quiz with ID ${id} not found`);
    }

    return quiz;
  }

  async getQuizzesByCourse(courseId: string) {
    return this.prisma.quiz.findMany({
      where: { courseId },
      include: {
        course: true,
        questions: {
          include: {
            answers: true,
          },
        },
      },
    });
  }

  async updateQuiz(id: string, updateQuizInput: UpdateQuizInput) {
    const quiz = await this.prisma.quiz.findUnique({ where: { id } });
    if (!quiz) {
      throw new NotFoundException(`Quiz with ID ${id} not found`);
    }

    // Check if new course exists (if updating courseId)
    if (updateQuizInput.courseId) {
      const course = await this.prisma.course.findUnique({
        where: { id: updateQuizInput.courseId },
      });

      if (!course) {
        throw new NotFoundException(`Course with ID ${updateQuizInput.courseId} not found`);
      }
    }

    return this.prisma.quiz.update({
      where: { id },
      data: updateQuizInput,
      include: {
        course: true,
        questions: {
          include: {
            answers: true,
          },
        },
      },
    });
  }

  async deleteQuiz(id: string) {
    const quiz = await this.prisma.quiz.findUnique({ where: { id } });
    if (!quiz) {
      throw new NotFoundException(`Quiz with ID ${id} not found`);
    }

    return this.prisma.quiz.delete({ where: { id } });
  }

  // =============== GPA SUBJECT OPERATIONS ===============
  async createGpaSubject(createGpaSubjectInput: CreateGpaSubjectInput) {
    // Check if order already exists
    const existingSubject = await this.prisma.gpaSubject.findUnique({
      where: { order: createGpaSubjectInput.order },
    });

    if (existingSubject) {
      throw new BadRequestException(`GPA subject with order ${createGpaSubjectInput.order} already exists`);
    }

    return this.prisma.gpaSubject.create({
      data: {
        ...createGpaSubjectInput,
      },
    });
  }

  async getAllGpaSubjects() {
    return this.prisma.gpaSubject.findMany({
      orderBy: { order: 'asc' },
    });
  }

  async getGpaSubjectById(id: string) {
    const subject = await this.prisma.gpaSubject.findUnique({
      where: { id },
    });

    if (!subject) {
      throw new NotFoundException(`GPA subject with ID ${id} not found`);
    }

    return subject;
  }

  async updateGpaSubject(id: string, updateGpaSubjectInput: UpdateGpaSubjectInput) {
    const subject = await this.prisma.gpaSubject.findUnique({ where: { id } });
    if (!subject) {
      throw new NotFoundException(`GPA subject with ID ${id} not found`);
    }

    // Check if order already exists (if updating order)
    if (updateGpaSubjectInput.order && updateGpaSubjectInput.order !== subject.order) {
      const existingSubject = await this.prisma.gpaSubject.findUnique({
        where: { order: updateGpaSubjectInput.order },
      });

      if (existingSubject) {
        throw new BadRequestException(`GPA subject with order ${updateGpaSubjectInput.order} already exists`);
      }
    }

    return this.prisma.gpaSubject.update({
      where: { id },
      data: updateGpaSubjectInput,
    });
  }

  async deleteGpaSubject(id: string) {
    const subject = await this.prisma.gpaSubject.findUnique({ where: { id } });
    if (!subject) {
      throw new NotFoundException(`GPA subject with ID ${id} not found`);
    }

    return this.prisma.gpaSubject.delete({ where: { id } });
  }

  // =============== QUIZ QUESTION OPERATIONS ===============
  async getQuizQuestions(quizId: string) {
    return this.prisma.question.findMany({
      where: { quizId },
      orderBy: { order: 'asc' },
      include: {
        answers: {
          orderBy: { order: 'asc' },
        },
      },
    });
  }

  async getQuizQuestionById(id: string) {
    const question = await this.prisma.question.findUnique({
      where: { id },
      include: {
        answers: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!question) {
      throw new NotFoundException(`Quiz question with ID ${id} not found`);
    }

    return question;
  }

  async createQuizQuestion(createQuizQuestionInput: CreateQuestionInput & { quizId: string }) {
    return this.prisma.question.create({
      data: {
        text: createQuizQuestionInput.text,
        image: createQuizQuestionInput.image,
        explanation: createQuizQuestionInput.explanation,
        explanationImage: createQuizQuestionInput.explanationImage,
        order: createQuizQuestionInput.order,
        quizId: createQuizQuestionInput.quizId,
        answers: {
          create: createQuizQuestionInput.answers?.map((answer, index) => ({
            ...answer,
            order: index + 1,
          })) || [],
        },
      },
      include: {
        answers: {
          orderBy: { order: 'asc' },
        },
      },
    });
  }

  async updateQuizQuestion(id: string, updateQuizQuestionInput: CreateQuestionInput) {
    const question = await this.prisma.question.findUnique({ where: { id } });
    if (!question) {
      throw new NotFoundException(`Quiz question with ID ${id} not found`);
    }

    // Delete existing answers and create new ones
    await this.prisma.quizAnswer.deleteMany({ where: { questionId: id } });

    return this.prisma.question.update({
      where: { id },
      data: {
        ...updateQuizQuestionInput,
        answers: {
          create: updateQuizQuestionInput.answers?.map((answer, index) => ({
            ...answer,
            order: index + 1,
          })) || [],
        },
      },
      include: {
        answers: {
          orderBy: { order: 'asc' },
        },
      },
    });
  }

  async deleteQuizQuestion(id: string) {
    const question = await this.prisma.question.findUnique({ where: { id } });
    if (!question) {
      throw new NotFoundException(`Quiz question with ID ${id} not found`);
    }

    return this.prisma.question.delete({ where: { id } });
  }

  // =============== FLASHCARD OPERATIONS ===============
  async getFlashcards(deckId: string) {
    return this.prisma.flashcard.findMany({
      where: { deckId },
      orderBy: { order: 'asc' },
    });
  }

  async getFlashcardById(id: string) {
    const flashcard = await this.prisma.flashcard.findUnique({
      where: { id },
    });

    if (!flashcard) {
      throw new NotFoundException(`Flashcard with ID ${id} not found`);
    }

    return flashcard;
  }

  async createFlashcard(createFlashcardInput: CreateFlashcardInput & { deckId: string }) {
    return this.prisma.flashcard.create({
      data: {
        question: createFlashcardInput.question,
        answer: createFlashcardInput.answer,
        order: createFlashcardInput.order,
        deckId: createFlashcardInput.deckId,
      },
    });
  }

  async updateFlashcard(id: string, updateFlashcardInput: CreateFlashcardInput) {
    const flashcard = await this.prisma.flashcard.findUnique({ where: { id } });
    if (!flashcard) {
      throw new NotFoundException(`Flashcard with ID ${id} not found`);
    }

    return this.prisma.flashcard.update({
      where: { id },
      data: {
        question: updateFlashcardInput.question,
        answer: updateFlashcardInput.answer,
        order: updateFlashcardInput.order,
      },
    });
  }

  async deleteFlashcard(id: string) {
    const flashcard = await this.prisma.flashcard.findUnique({ where: { id } });
    if (!flashcard) {
      throw new NotFoundException(`Flashcard with ID ${id} not found`);
    }

    return this.prisma.flashcard.delete({ where: { id } });
  }
} 