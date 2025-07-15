import { Field, InputType, ObjectType, Int, Float } from '@nestjs/graphql';
import { IsString, IsBoolean, IsInt, IsOptional, IsArray, Min } from 'class-validator';

// =============== LEVEL DTOs ===============
@ObjectType()
export class LevelResponse {
  @Field()
  id: string;

  @Field()
  name: string;

  @Field()
  description: string;

  @Field(() => Int)
  order: number;

  @Field()
  isVisible: boolean;

  @Field()
  createdAt: string;

  @Field()
  updatedAt: string;

  @Field(() => [CourseResponse], { nullable: true })
  courses?: CourseResponse[];
}

@InputType()
export class CreateLevelInput {
  @Field()
  @IsString()
  name: string;

  @Field()
  @IsString()
  description: string;

  @Field(() => Int)
  @IsInt()
  @Min(1)
  order: number;

  @Field({ defaultValue: true })
  @IsBoolean()
  @IsOptional()
  isVisible?: boolean;
}

@InputType()
export class UpdateLevelInput {
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  name?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  @Field(() => Int, { nullable: true })
  @IsInt()
  @Min(1)
  @IsOptional()
  order?: number;

  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  isVisible?: boolean;
}

// =============== COURSE DTOs ===============
@ObjectType()
export class CourseResponse {
  @Field()
  id: string;

  @Field()
  name: string;

  @Field()
  description: string;

  @Field()
  levelId: string;

  @Field()
  isVisible: boolean;

  @Field()
  createdAt: string;

  @Field()
  updatedAt: string;

  @Field(() => LevelResponse, { nullable: true })
  level?: LevelResponse;

  @Field(() => [FlashcardDeckResponse], { nullable: true })
  flashcardDecks?: FlashcardDeckResponse[];

  @Field(() => [QuizResponse], { nullable: true })
  quizzes?: QuizResponse[];
}

@InputType()
export class CreateCourseInput {
  @Field()
  @IsString()
  name: string;

  @Field()
  @IsString()
  description: string;

  @Field()
  @IsString()
  levelId: string;

  @Field({ defaultValue: true })
  @IsBoolean()
  @IsOptional()
  isVisible?: boolean;
}

@InputType()
export class UpdateCourseInput {
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  name?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  levelId?: string;

  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  isVisible?: boolean;
}

// =============== FLASHCARD DTOs ===============
@ObjectType()
export class FlashcardResponse {
  @Field()
  id: string;

  @Field()
  question: string;

  @Field()
  answer: string;

  @Field()
  deckId: string;

  @Field(() => Int)
  order: number;
}

@ObjectType()
export class FlashcardDeckResponse {
  @Field()
  id: string;

  @Field()
  name: string;

  @Field()
  description: string;

  @Field()
  courseId: string;

  @Field()
  isVisible: boolean;

  @Field()
  createdAt: string;

  @Field()
  updatedAt: string;

  @Field(() => CourseResponse, { nullable: true })
  course?: CourseResponse;

  @Field(() => [FlashcardResponse], { nullable: true })
  cards?: FlashcardResponse[];
}

@InputType()
export class CreateFlashcardInput {
  @Field()
  @IsString()
  question: string;

  @Field()
  @IsString()
  answer: string;

  @Field(() => Int)
  @IsInt()
  @Min(1)
  order: number;
}

@InputType()
export class UpdateFlashcardInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  question?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  answer?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  order?: number;
}

@InputType()
export class CreateFlashcardDeckInput {
  @Field()
  @IsString()
  name: string;

  @Field()
  @IsString()
  description: string;

  @Field()
  @IsString()
  courseId: string;

  @Field({ defaultValue: true })
  @IsBoolean()
  @IsOptional()
  isVisible?: boolean;

  @Field(() => [CreateFlashcardInput], { nullable: true })
  @IsArray()
  @IsOptional()
  cards?: CreateFlashcardInput[];
}

@InputType()
export class UpdateFlashcardDeckInput {
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  name?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  courseId?: string;

  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  isVisible?: boolean;
}

// =============== QUIZ DTOs ===============
@ObjectType()
export class AnswerResponse {
  @Field()
  id: string;

  @Field()
  text: string;

  @Field()
  questionId: string;

  @Field()
  isCorrect: boolean;

  @Field(() => Int)
  order: number;
}

@ObjectType()
export class QuestionResponse {
  @Field()
  id: string;

  @Field()
  text: string;

  @Field({ nullable: true })
  image?: string;

  @Field({ nullable: true })
  explanation?: string;

  @Field({ nullable: true })
  explanationImage?: string;

  @Field()
  quizId: string;

  @Field(() => Int)
  order: number;

  @Field(() => [AnswerResponse], { nullable: true })
  answers?: AnswerResponse[];
}

@ObjectType()
export class QuizResponse {
  @Field()
  id: string;

  @Field()
  title: string;

  @Field()
  description: string;

  @Field()
  courseId: string;

  @Field()
  isVisible: boolean;

  @Field({ nullable: true })
  hasDuration?: boolean;

  @Field(() => Int, { nullable: true })
  durationMinutes?: number;

  @Field({ nullable: true })
  showAnswersImmediately?: boolean;

  @Field()
  createdAt: string;

  @Field()
  updatedAt: string;

  @Field(() => CourseResponse, { nullable: true })
  course?: CourseResponse;

  @Field(() => [QuestionResponse], { nullable: true })
  questions?: QuestionResponse[];
}

@ObjectType()
export class QuizQuestionResponse {
  @Field()
  id: string;

  @Field()
  text: string;

  @Field({ nullable: true })
  image?: string;

  @Field({ nullable: true })
  explanation?: string;

  @Field({ nullable: true })
  explanationImage?: string;

  @Field(() => Int)
  order: number;

  @Field()
  quizId: string;

  @Field()
  createdAt: string;

  @Field()
  updatedAt: string;

  @Field(() => [AnswerResponse], { nullable: true })
  answers?: AnswerResponse[];
}

@InputType()
export class CreateAnswerInput {
  @Field()
  @IsString()
  text: string;

  @Field()
  @IsBoolean()
  isCorrect: boolean;

  @Field(() => Int)
  @IsInt()
  @Min(1)
  order: number;
}

@InputType()
export class CreateQuestionInput {
  @Field()
  @IsString()
  text: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  image?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  explanation?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  explanationImage?: string;

  @Field(() => Int)
  @IsInt()
  @Min(1)
  order: number;

  @Field(() => [CreateAnswerInput])
  @IsArray()
  answers: CreateAnswerInput[];
}

@InputType()
export class CreateQuizInput {
  @Field()
  @IsString()
  title: string;

  @Field()
  @IsString()
  description: string;

  @Field()
  @IsString()
  courseId: string;

  @Field({ defaultValue: true })
  @IsBoolean()
  @IsOptional()
  isVisible?: boolean;

  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  hasDuration?: boolean;

  @Field(() => Int, { nullable: true })
  @IsInt()
  @Min(1)
  @IsOptional()
  durationMinutes?: number;

  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  showAnswersImmediately?: boolean;

  @Field(() => [CreateQuestionInput], { nullable: true })
  @IsArray()
  @IsOptional()
  questions?: CreateQuestionInput[];
}

@InputType()
export class CreateQuizQuestionInput {
  @Field()
  @IsString()
  text: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  image?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  explanation?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  explanationImage?: string;

  @Field(() => Int)
  @IsInt()
  @Min(1)
  order: number;

  @Field()
  @IsString()
  quizId: string;

  @Field(() => [CreateAnswerInput])
  @IsArray()
  answers: CreateAnswerInput[];
}

@InputType()
export class UpdateQuizQuestionInput {
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  text?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  image?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  explanation?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  explanationImage?: string;

  @Field({ nullable: true })
  @IsInt()
  @Min(1)
  @IsOptional()
  order?: number;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  quizId?: string;

  @Field(() => [CreateAnswerInput], { nullable: true })
  @IsArray()
  @IsOptional()
  answers?: CreateAnswerInput[];
}

@InputType()
export class UpdateQuizInput {
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  title?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  courseId?: string;

  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  isVisible?: boolean;

  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  hasDuration?: boolean;

  @Field(() => Int, { nullable: true })
  @IsInt()
  @Min(1)
  @IsOptional()
  durationMinutes?: number;

  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  showAnswersImmediately?: boolean;
}

// =============== QUIZ ATTEMPT DTOs ===============
@ObjectType()
export class QuizAttemptResponse {
  @Field()
  id: string;

  @Field()
  quizId: string;

  @Field()
  studentId: string;

  @Field(() => Int)
  score: number;

  @Field(() => Int)
  totalQuestions: number;

  @Field()
  completedAt: string;

  @Field(() => QuizResponse, { nullable: true })
  quiz?: QuizResponse;

  @Field(() => [QuizAnswerResponse], { nullable: true })
  answers?: QuizAnswerResponse[];
}

@ObjectType()
export class QuizAnswerResponse {
  @Field()
  id: string;

  @Field()
  attemptId: string;

  @Field()
  questionId: string;

  @Field()
  answerId: string;

  @Field()
  isCorrect: boolean;
}

@InputType()
export class CreateQuizAttemptInput {
  @Field()
  @IsString()
  quizId: string;

  @Field(() => [QuizAnswerInput])
  @IsArray()
  answers: QuizAnswerInput[];
}

@InputType()
export class QuizAnswerInput {
  @Field()
  @IsString()
  questionId: string;

  @Field()
  @IsString()
  answerId: string;
}

// =============== GPA SUBJECT DTOs ===============
@ObjectType()
export class GpaSubjectResponse {
  @Field()
  id: string;

  @Field()
  yearName: string;

  @Field()
  subjectName: string;

  @Field(() => Int)
  creditHours: number;

  @Field(() => Int)
  order: number;
}

@InputType()
export class CreateGpaSubjectInput {
  @Field()
  @IsString()
  yearName: string;

  @Field()
  @IsString()
  subjectName: string;

  @Field(() => Int)
  @IsInt()
  @Min(1)
  creditHours: number;

  @Field(() => Int)
  @IsInt()
  @Min(1)
  order: number;
}

@InputType()
export class UpdateGpaSubjectInput {
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  yearName?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  subjectName?: string;

  @Field(() => Int, { nullable: true })
  @IsInt()
  @Min(1)
  @IsOptional()
  creditHours?: number;

  @Field(() => Int, { nullable: true })
  @IsInt()
  @Min(1)
  @IsOptional()
  order?: number;
} 