// @ts-nocheck
import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '@prisma/client';
import { AcademicService } from './academic.service';
import {
  // Level DTOs
  LevelResponse,
  CreateLevelInput,
  UpdateLevelInput,
  // Course DTOs
  CourseResponse,
  CreateCourseInput,
  UpdateCourseInput,
  // Flashcard DTOs
  FlashcardDeckResponse,
  CreateFlashcardDeckInput,
  UpdateFlashcardDeckInput,
  FlashcardResponse,
  CreateFlashcardInput,
  UpdateFlashcardInput,
  // Quiz DTOs
  QuizResponse,
  CreateQuizInput,
  UpdateQuizInput,
  QuizQuestionResponse,
  CreateQuizQuestionInput,
  UpdateQuizQuestionInput,
  // GPA Subject DTOs
  GpaSubjectResponse,
  CreateGpaSubjectInput,
  UpdateGpaSubjectInput,
} from './dto/academic.dto';

@Resolver()
export class AcademicResolver {
  constructor(private readonly academicService: AcademicService) {}

  // =============== LEVEL RESOLVERS ===============
  @Query(() => [LevelResponse])
  async levels(): Promise<LevelResponse[]> {
    const levels = await this.academicService.getAllLevels();
    return levels.map(level => ({
      ...level,
      createdAt: level.createdAt.toISOString(),
      updatedAt: level.updatedAt.toISOString(),
    }));
  }

  @Query(() => LevelResponse)
  async level(@Args('id', { type: () => ID }) id: string): Promise<LevelResponse> {
    const level = await this.academicService.getLevelById(id);
    return {
      ...level,
      createdAt: level.createdAt.toISOString(),
      updatedAt: level.updatedAt.toISOString(),
    };
  }

  @Mutation(() => LevelResponse)
  @UseGuards(JwtAuthGuard)
  async createLevel(
    @Args('createLevelInput') createLevelInput: CreateLevelInput,
    @CurrentUser() user: User,
  ): Promise<LevelResponse> {
    if (user.role !== 'ADMIN') {
      throw new Error('Only admins can create levels');
    }

    const level = await this.academicService.createLevel(createLevelInput);
    return {
      ...level,
      createdAt: level.createdAt.toISOString(),
      updatedAt: level.updatedAt.toISOString(),
    };
  }

  @Query(() => LevelResponse)
  async levelWithCourses(@Args('id', { type: () => ID }) id: string): Promise<LevelResponse> {
    const level = await this.academicService.getLevelById(id);
    return {
      ...level,
      createdAt: level.createdAt.toISOString(),
      updatedAt: level.updatedAt.toISOString(),
      courses: level.courses?.map(course => ({
        ...course,
        createdAt: course.createdAt.toISOString(),
        updatedAt: course.updatedAt.toISOString(),
        flashcardDecks: course.flashcardDecks?.map(deck => ({
          ...deck,
          createdAt: deck.createdAt.toISOString(),
          updatedAt: deck.updatedAt.toISOString(),
        })),
        quizzes: course.quizzes?.map(quiz => ({
          ...quiz,
          createdAt: quiz.createdAt.toISOString(),
          updatedAt: quiz.updatedAt.toISOString(),
        })),
      })),
    } as any;
  }

  @Mutation(() => LevelResponse)
  @UseGuards(JwtAuthGuard)
  async updateLevel(
    @Args('id', { type: () => ID }) id: string,
    @Args('updateLevelInput') updateLevelInput: UpdateLevelInput,
    @CurrentUser() user: User,
  ): Promise<LevelResponse> {
    if (user.role !== 'ADMIN') {
      throw new Error('Only admins can update levels');
    }

    const level = await this.academicService.updateLevel(id, updateLevelInput);
    return {
      ...level,
      createdAt: level.createdAt.toISOString(),
      updatedAt: level.updatedAt.toISOString(),
      courses: level.courses?.map(course => ({
        ...course,
        createdAt: course.createdAt.toISOString(),
        updatedAt: course.updatedAt.toISOString(),
        flashcardDecks: course.flashcardDecks?.map(deck => ({
          ...deck,
          createdAt: deck.createdAt.toISOString(),
          updatedAt: deck.updatedAt.toISOString(),
        })),
        quizzes: course.quizzes?.map(quiz => ({
          ...quiz,
          createdAt: quiz.createdAt.toISOString(),
          updatedAt: quiz.updatedAt.toISOString(),
        })),
      })),
    } as any;
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async deleteLevel(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: User,
  ): Promise<boolean> {
    if (user.role !== 'ADMIN') {
      throw new Error('Only admins can delete levels');
    }

    await this.academicService.deleteLevel(id);
    return true;
  }

  // =============== COURSE RESOLVERS ===============
  @Query(() => [CourseResponse])
  async courses(): Promise<CourseResponse[]> {
    const courses = await this.academicService.getAllCourses();
    return courses.map(course => ({
      ...course,
      createdAt: course.createdAt.toISOString(),
      updatedAt: course.updatedAt.toISOString(),
      level: course.level ? {
        ...course.level,
        createdAt: course.level.createdAt.toISOString(),
        updatedAt: course.level.updatedAt.toISOString(),
      } : undefined,
      flashcardDecks: course.flashcardDecks?.map(deck => ({
        ...deck,
        createdAt: deck.createdAt.toISOString(),
        updatedAt: deck.updatedAt.toISOString(),
      })),
      quizzes: course.quizzes?.map(quiz => ({
        ...quiz,
        createdAt: quiz.createdAt.toISOString(),
        updatedAt: quiz.updatedAt.toISOString(),
      })),
    }));
  }

  @Query(() => CourseResponse)
  async course(@Args('id', { type: () => ID }) id: string): Promise<CourseResponse> {
    const course = await this.academicService.getCourseById(id);
    return {
      ...course,
      createdAt: course.createdAt.toISOString(),
      updatedAt: course.updatedAt.toISOString(),
      level: course.level ? {
        ...course.level,
        createdAt: course.level.createdAt.toISOString(),
        updatedAt: course.level.updatedAt.toISOString(),
      } : undefined,
      flashcardDecks: course.flashcardDecks?.map(deck => ({
        ...deck,
        createdAt: deck.createdAt.toISOString(),
        updatedAt: deck.updatedAt.toISOString(),
      })),
      quizzes: course.quizzes?.map(quiz => ({
        ...quiz,
        createdAt: quiz.createdAt.toISOString(),
        updatedAt: quiz.updatedAt.toISOString(),
      })),
    };
  }

  @Query(() => [CourseResponse])
  async coursesByLevel(@Args('levelId', { type: () => ID }) levelId: string): Promise<CourseResponse[]> {
    const courses = await this.academicService.getCoursesByLevel(levelId);
    return courses.map(course => ({
      ...course,
      createdAt: course.createdAt.toISOString(),
      updatedAt: course.updatedAt.toISOString(),
      level: course.level ? {
        ...course.level,
        createdAt: course.level.createdAt.toISOString(),
        updatedAt: course.level.updatedAt.toISOString(),
      } : undefined,
      flashcardDecks: course.flashcardDecks?.map(deck => ({
        ...deck,
        createdAt: deck.createdAt.toISOString(),
        updatedAt: deck.updatedAt.toISOString(),
      })),
      quizzes: course.quizzes?.map(quiz => ({
        ...quiz,
        createdAt: quiz.createdAt.toISOString(),
        updatedAt: quiz.updatedAt.toISOString(),
      })),
    }));
  }

  @Mutation(() => CourseResponse)
  @UseGuards(JwtAuthGuard)
  async createCourse(
    @Args('createCourseInput') createCourseInput: CreateCourseInput,
    @CurrentUser() user: User,
  ): Promise<CourseResponse> {
    if (user.role !== 'ADMIN') {
      throw new Error('Only admins can create courses');
    }

    const course = await this.academicService.createCourse(createCourseInput);
    return {
      ...course,
      createdAt: course.createdAt.toISOString(),
      updatedAt: course.updatedAt.toISOString(),
      level: course.level ? {
        ...course.level,
        createdAt: course.level.createdAt.toISOString(),
        updatedAt: course.level.updatedAt.toISOString(),
      } : undefined,
      flashcardDecks: course.flashcardDecks?.map(deck => ({
        ...deck,
        createdAt: deck.createdAt.toISOString(),
        updatedAt: deck.updatedAt.toISOString(),
      })),
      quizzes: course.quizzes?.map(quiz => ({
        ...quiz,
        createdAt: quiz.createdAt.toISOString(),
        updatedAt: quiz.updatedAt.toISOString(),
      })),
    };
  }

  @Mutation(() => CourseResponse)
  @UseGuards(JwtAuthGuard)
  async updateCourse(
    @Args('id', { type: () => ID }) id: string,
    @Args('updateCourseInput') updateCourseInput: UpdateCourseInput,
    @CurrentUser() user: User,
  ): Promise<CourseResponse> {
    if (user.role !== 'ADMIN') {
      throw new Error('Only admins can update courses');
    }

    const course = await this.academicService.updateCourse(id, updateCourseInput);
    return {
      ...course,
      createdAt: course.createdAt.toISOString(),
      updatedAt: course.updatedAt.toISOString(),
      level: course.level ? {
        ...course.level,
        createdAt: course.level.createdAt.toISOString(),
        updatedAt: course.level.updatedAt.toISOString(),
      } : undefined,
      flashcardDecks: course.flashcardDecks?.map(deck => ({
        ...deck,
        createdAt: deck.createdAt.toISOString(),
        updatedAt: deck.updatedAt.toISOString(),
      })),
      quizzes: course.quizzes?.map(quiz => ({
        ...quiz,
        createdAt: quiz.createdAt.toISOString(),
        updatedAt: quiz.updatedAt.toISOString(),
      })),
    };
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async deleteCourse(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: User,
  ): Promise<boolean> {
    if (user.role !== 'ADMIN') {
      throw new Error('Only admins can delete courses');
    }

    await this.academicService.deleteCourse(id);
    return true;
  }

  // =============== FLASHCARD RESOLVERS ===============
  @Query(() => [FlashcardDeckResponse])
  async flashcardDecks(): Promise<FlashcardDeckResponse[]> {
    const decks = await this.academicService.getAllFlashcardDecks();
    return decks.map(deck => ({
      ...deck,
      createdAt: deck.createdAt.toISOString(),
      updatedAt: deck.updatedAt.toISOString(),
      course: deck.course ? {
        ...deck.course,
        createdAt: deck.course.createdAt.toISOString(),
        updatedAt: deck.course.updatedAt.toISOString(),
        level: deck.course.level ? {
          ...deck.course.level,
          createdAt: deck.course.level.createdAt.toISOString(),
          updatedAt: deck.course.level.updatedAt.toISOString(),
        } : undefined,
      } : undefined,
    }));
  }

  @Query(() => FlashcardDeckResponse)
  async flashcardDeck(@Args('id', { type: () => ID }) id: string): Promise<FlashcardDeckResponse> {
    const deck = await this.academicService.getFlashcardDeckById(id);
    return {
      ...deck,
      createdAt: deck.createdAt.toISOString(),
      updatedAt: deck.updatedAt.toISOString(),
      course: deck.course ? {
        ...deck.course,
        createdAt: deck.course.createdAt.toISOString(),
        updatedAt: deck.course.updatedAt.toISOString(),
        level: deck.course.level ? {
          ...deck.course.level,
          createdAt: deck.course.level.createdAt.toISOString(),
          updatedAt: deck.course.level.updatedAt.toISOString(),
        } : undefined,
      } : undefined,
    };
  }

  @Query(() => [FlashcardDeckResponse])
  async flashcardDecksByCourse(@Args('courseId', { type: () => ID }) courseId: string): Promise<FlashcardDeckResponse[]> {
    const decks = await this.academicService.getFlashcardDecksByCourse(courseId);
    return decks.map(deck => ({
      ...deck,
      createdAt: deck.createdAt.toISOString(),
      updatedAt: deck.updatedAt.toISOString(),
      course: deck.course ? {
        ...deck.course,
        createdAt: deck.course.createdAt.toISOString(),
        updatedAt: deck.course.updatedAt.toISOString(),
        level: deck.course.level ? {
          ...deck.course.level,
          createdAt: deck.course.level.createdAt.toISOString(),
          updatedAt: deck.course.level.updatedAt.toISOString(),
        } : undefined,
      } : undefined,
    }));
  }

  @Mutation(() => FlashcardDeckResponse)
  @UseGuards(JwtAuthGuard)
  async createFlashcardDeck(
    @Args('createFlashcardDeckInput') createFlashcardDeckInput: CreateFlashcardDeckInput,
    @CurrentUser() user: User,
  ): Promise<FlashcardDeckResponse> {
    if (user.role !== 'ADMIN') {
      throw new Error('Only admins can create flashcard decks');
    }

    const deck = await this.academicService.createFlashcardDeck(createFlashcardDeckInput);
    return {
      ...deck,
      createdAt: deck.createdAt.toISOString(),
      updatedAt: deck.updatedAt.toISOString(),
      course: deck.course ? {
        ...deck.course,
        createdAt: deck.course.createdAt.toISOString(),
        updatedAt: deck.course.updatedAt.toISOString(),
        level: deck.course.level ? {
          ...deck.course.level,
          createdAt: deck.course.level.createdAt.toISOString(),
          updatedAt: deck.course.level.updatedAt.toISOString(),
        } : undefined,
      } : undefined,
    };
  }

  @Mutation(() => FlashcardDeckResponse)
  @UseGuards(JwtAuthGuard)
  async updateFlashcardDeck(
    @Args('id', { type: () => ID }) id: string,
    @Args('updateFlashcardDeckInput') updateFlashcardDeckInput: UpdateFlashcardDeckInput,
    @CurrentUser() user: User,
  ): Promise<FlashcardDeckResponse> {
    if (user.role !== 'ADMIN') {
      throw new Error('Only admins can update flashcard decks');
    }

    const deck = await this.academicService.updateFlashcardDeck(id, updateFlashcardDeckInput);
    return {
      ...deck,
      createdAt: deck.createdAt.toISOString(),
      updatedAt: deck.updatedAt.toISOString(),
      course: deck.course ? {
        ...deck.course,
        createdAt: deck.course.createdAt.toISOString(),
        updatedAt: deck.course.updatedAt.toISOString(),
        level: deck.course.level ? {
          ...deck.course.level,
          createdAt: deck.course.level.createdAt.toISOString(),
          updatedAt: deck.course.level.updatedAt.toISOString(),
        } : undefined,
      } : undefined,
    };
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async deleteFlashcardDeck(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: User,
  ): Promise<boolean> {
    if (user.role !== 'ADMIN') {
      throw new Error('Only admins can delete flashcard decks');
    }

    await this.academicService.deleteFlashcardDeck(id);
    return true;
  }

  // =============== QUIZ RESOLVERS ===============
  @Query(() => [QuizResponse])
  async quizzes(): Promise<QuizResponse[]> {
    const quizzes = await this.academicService.getAllQuizzes();
    return quizzes.map(quiz => ({
      ...quiz,
      createdAt: quiz.createdAt.toISOString(),
      updatedAt: quiz.updatedAt.toISOString(),
      course: quiz.course ? {
        ...quiz.course,
        createdAt: quiz.course.createdAt.toISOString(),
        updatedAt: quiz.course.updatedAt.toISOString(),
        level: quiz.course.level ? {
          ...quiz.course.level,
          createdAt: quiz.course.level.createdAt.toISOString(),
          updatedAt: quiz.course.level.updatedAt.toISOString(),
        } : undefined,
      } : undefined,
    }));
  }

  @Query(() => QuizResponse)
  async quiz(@Args('id', { type: () => ID }) id: string): Promise<QuizResponse> {
    const quiz = await this.academicService.getQuizById(id);
    return {
      ...quiz,
      createdAt: quiz.createdAt.toISOString(),
      updatedAt: quiz.updatedAt.toISOString(),
      course: quiz.course ? {
        ...quiz.course,
        createdAt: quiz.course.createdAt.toISOString(),
        updatedAt: quiz.course.updatedAt.toISOString(),
        level: quiz.course.level ? {
          ...quiz.course.level,
          createdAt: quiz.course.level.createdAt.toISOString(),
          updatedAt: quiz.course.level.updatedAt.toISOString(),
        } : undefined,
      } : undefined,
    };
  }

  @Query(() => [QuizResponse])
  async quizzesByCourse(@Args('courseId', { type: () => ID }) courseId: string): Promise<QuizResponse[]> {
    const quizzes = await this.academicService.getQuizzesByCourse(courseId);
    return quizzes.map(quiz => ({
      ...quiz,
      createdAt: quiz.createdAt.toISOString(),
      updatedAt: quiz.updatedAt.toISOString(),
      course: quiz.course ? {
        ...quiz.course,
        createdAt: quiz.course.createdAt.toISOString(),
        updatedAt: quiz.course.updatedAt.toISOString(),
        level: quiz.course.level ? {
          ...quiz.course.level,
          createdAt: quiz.course.level.createdAt.toISOString(),
          updatedAt: quiz.course.level.updatedAt.toISOString(),
        } : undefined,
      } : undefined,
    }));
  }

  @Mutation(() => QuizResponse)
  @UseGuards(JwtAuthGuard)
  async createQuiz(
    @Args('createQuizInput') createQuizInput: CreateQuizInput,
    @CurrentUser() user: User,
  ): Promise<QuizResponse> {
    if (user.role !== 'ADMIN') {
      throw new Error('Only admins can create quizzes');
    }

    const quiz = await this.academicService.createQuiz(createQuizInput);
    return {
      ...quiz,
      createdAt: quiz.createdAt.toISOString(),
      updatedAt: quiz.updatedAt.toISOString(),
      course: quiz.course ? {
        ...quiz.course,
        createdAt: quiz.course.createdAt.toISOString(),
        updatedAt: quiz.course.updatedAt.toISOString(),
        level: quiz.course.level ? {
          ...quiz.course.level,
          createdAt: quiz.course.level.createdAt.toISOString(),
          updatedAt: quiz.course.level.updatedAt.toISOString(),
        } : undefined,
      } : undefined,
    };
  }

  @Mutation(() => QuizResponse)
  @UseGuards(JwtAuthGuard)
  async updateQuiz(
    @Args('id', { type: () => ID }) id: string,
    @Args('updateQuizInput') updateQuizInput: UpdateQuizInput,
    @CurrentUser() user: User,
  ): Promise<QuizResponse> {
    if (user.role !== 'ADMIN') {
      throw new Error('Only admins can update quizzes');
    }

    const quiz = await this.academicService.updateQuiz(id, updateQuizInput);
    return {
      ...quiz,
      createdAt: quiz.createdAt.toISOString(),
      updatedAt: quiz.updatedAt.toISOString(),
      course: quiz.course ? {
        ...quiz.course,
        createdAt: quiz.course.createdAt.toISOString(),
        updatedAt: quiz.course.updatedAt.toISOString(),
        level: quiz.course.level ? {
          ...quiz.course.level,
          createdAt: quiz.course.level.createdAt.toISOString(),
          updatedAt: quiz.course.level.updatedAt.toISOString(),
        } : undefined,
      } : undefined,
    };
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async deleteQuiz(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: User,
  ): Promise<boolean> {
    if (user.role !== 'ADMIN') {
      throw new Error('Only admins can delete quizzes');
    }

    await this.academicService.deleteQuiz(id);
    return true;
  }

  // =============== QUIZ QUESTION RESOLVERS ===============
  @Query(() => [QuizQuestionResponse])
  async quizQuestions(@Args('quizId', { type: () => ID }) quizId: string): Promise<QuizQuestionResponse[]> {
    const questions = await this.academicService.getQuizQuestions(quizId);
    return questions.map(question => ({
      ...question,
      createdAt: question.createdAt.toISOString(),
      updatedAt: question.updatedAt.toISOString(),
    }));
  }

  @Query(() => QuizQuestionResponse)
  async quizQuestion(@Args('id', { type: () => ID }) id: string): Promise<QuizQuestionResponse> {
    const question = await this.academicService.getQuizQuestionById(id);
    return {
      ...question,
      createdAt: question.createdAt.toISOString(),
      updatedAt: question.updatedAt.toISOString(),
    };
  }

  @Mutation(() => QuizQuestionResponse)
  @UseGuards(JwtAuthGuard)
  async createQuizQuestion(
    @Args('createQuizQuestionInput') createQuizQuestionInput: CreateQuizQuestionInput,
    @CurrentUser() user: User,
  ): Promise<QuizQuestionResponse> {
    if (user.role !== 'ADMIN') {
      throw new Error('Only admins can create quiz questions');
    }

    const question = await this.academicService.createQuizQuestion(createQuizQuestionInput);
    return {
      ...question,
      createdAt: question.createdAt.toISOString(),
      updatedAt: question.updatedAt.toISOString(),
    };
  }

  @Mutation(() => QuizQuestionResponse)
  @UseGuards(JwtAuthGuard)
  async updateQuizQuestion(
    @Args('id', { type: () => ID }) id: string,
    @Args('updateQuizQuestionInput') updateQuizQuestionInput: UpdateQuizQuestionInput,
    @CurrentUser() user: User,
  ): Promise<QuizQuestionResponse> {
    if (user.role !== 'ADMIN') {
      throw new Error('Only admins can update quiz questions');
    }

    const question = await this.academicService.updateQuizQuestion(id, updateQuizQuestionInput);
    return {
      ...question,
      createdAt: question.createdAt.toISOString(),
      updatedAt: question.updatedAt.toISOString(),
    };
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async deleteQuizQuestion(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: User,
  ): Promise<boolean> {
    if (user.role !== 'ADMIN') {
      throw new Error('Only admins can delete quiz questions');
    }

    await this.academicService.deleteQuizQuestion(id);
    return true;
  }

  // =============== FLASHCARD RESOLVERS ===============
  @Query(() => [FlashcardResponse])
  async flashcards(@Args('deckId', { type: () => ID }) deckId: string): Promise<FlashcardResponse[]> {
    const flashcards = await this.academicService.getFlashcards(deckId);
    return flashcards.map(flashcard => ({
      ...flashcard,
      createdAt: flashcard.createdAt.toISOString(),
      updatedAt: flashcard.updatedAt.toISOString(),
    }));
  }

  @Query(() => FlashcardResponse)
  async flashcard(@Args('id', { type: () => ID }) id: string): Promise<FlashcardResponse> {
    const flashcard = await this.academicService.getFlashcardById(id);
    return {
      ...flashcard,
      createdAt: flashcard.createdAt.toISOString(),
      updatedAt: flashcard.updatedAt.toISOString(),
    };
  }

  @Mutation(() => FlashcardResponse)
  @UseGuards(JwtAuthGuard)
  async createFlashcard(
    @Args('createFlashcardInput') createFlashcardInput: CreateFlashcardInput,
    @CurrentUser() user: User,
  ): Promise<FlashcardResponse> {
    if (user.role !== 'ADMIN') {
      throw new Error('Only admins can create flashcards');
    }

    const flashcard = await this.academicService.createFlashcard(createFlashcardInput);
    return {
      ...flashcard,
      createdAt: flashcard.createdAt.toISOString(),
      updatedAt: flashcard.updatedAt.toISOString(),
    };
  }

  @Mutation(() => FlashcardResponse)
  @UseGuards(JwtAuthGuard)
  async updateFlashcard(
    @Args('id', { type: () => ID }) id: string,
    @Args('updateFlashcardInput', { type: () => UpdateFlashcardInput }) updateFlashcardInput: UpdateFlashcardInput,
    @CurrentUser() user: User,
  ): Promise<FlashcardResponse> {
    if (user.role !== 'ADMIN') {
      throw new Error('Only admins can update flashcards');
    }

    const flashcard = await this.academicService.updateFlashcard(id, updateFlashcardInput);
    return {
      ...flashcard,
      createdAt: flashcard.createdAt.toISOString(),
      updatedAt: flashcard.updatedAt.toISOString(),
    };
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async deleteFlashcard(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: User,
  ): Promise<boolean> {
    if (user.role !== 'ADMIN') {
      throw new Error('Only admins can delete flashcards');
    }

    await this.academicService.deleteFlashcard(id);
    return true;
  }

  // =============== GPA SUBJECT RESOLVERS ===============
  @Query(() => [GpaSubjectResponse])
  async gpaSubjects(): Promise<GpaSubjectResponse[]> {
    const subjects = await this.academicService.getAllGpaSubjects();
    return subjects.map(subject => ({
      ...subject,
      createdAt: subject.createdAt.toISOString(),
      updatedAt: subject.updatedAt.toISOString(),
    }));
  }

  @Query(() => GpaSubjectResponse)
  async gpaSubject(@Args('id', { type: () => ID }) id: string): Promise<GpaSubjectResponse> {
    const subject = await this.academicService.getGpaSubjectById(id);
    return {
      ...subject,
      createdAt: subject.createdAt.toISOString(),
      updatedAt: subject.updatedAt.toISOString(),
    };
  }

  @Mutation(() => GpaSubjectResponse)
  @UseGuards(JwtAuthGuard)
  async createGpaSubject(
    @Args('createGpaSubjectInput') createGpaSubjectInput: CreateGpaSubjectInput,
    @CurrentUser() user: User,
  ): Promise<GpaSubjectResponse> {
    if (user.role !== 'ADMIN') {
      throw new Error('Only admins can create GPA subjects');
    }

    const subject = await this.academicService.createGpaSubject(createGpaSubjectInput);
    return {
      ...subject,
      createdAt: subject.createdAt.toISOString(),
      updatedAt: subject.updatedAt.toISOString(),
    };
  }

  @Mutation(() => GpaSubjectResponse)
  @UseGuards(JwtAuthGuard)
  async updateGpaSubject(
    @Args('id', { type: () => ID }) id: string,
    @Args('updateGpaSubjectInput') updateGpaSubjectInput: UpdateGpaSubjectInput,
    @CurrentUser() user: User,
  ): Promise<GpaSubjectResponse> {
    if (user.role !== 'ADMIN') {
      throw new Error('Only admins can update GPA subjects');
    }

    const subject = await this.academicService.updateGpaSubject(id, updateGpaSubjectInput);
    return {
      ...subject,
      createdAt: subject.createdAt.toISOString(),
      updatedAt: subject.updatedAt.toISOString(),
    };
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async deleteGpaSubject(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: User,
  ): Promise<boolean> {
    if (user.role !== 'ADMIN') {
      throw new Error('Only admins can delete GPA subjects');
    }

    await this.academicService.deleteGpaSubject(id);
    return true;
  }
} 