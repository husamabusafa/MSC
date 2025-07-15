import { Field, InputType, ObjectType, ID, Int, Float } from '@nestjs/graphql';
import { IsString, IsInt, IsOptional, IsBoolean, IsEnum, Min, IsUrl } from 'class-validator';
import { UserReference } from '../../users/dto/user.dto';

// Enums
export enum BookOrderStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  BORROWED = 'BORROWED',
  RETURNED = 'RETURNED',
  REJECTED = 'REJECTED'
}

// Input DTOs for Books
@InputType()
export class CreateBookInput {
  @Field()
  @IsString()
  title: string;

  @Field()
  @IsString()
  author: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUrl()
  coverImage?: string;

  @Field()
  @IsString()
  description: string;

  @Field(() => Int, { defaultValue: 1 })
  @IsInt()
  @Min(1)
  totalCopies: number;

  @Field(() => Int, { defaultValue: 1 })
  @IsInt()
  @Min(0)
  availableCopies: number;

  @Field({ defaultValue: true })
  @IsBoolean()
  isVisible: boolean;
}

@InputType()
export class UpdateBookInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  title?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  author?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUrl()
  coverImage?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  totalCopies?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  availableCopies?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isVisible?: boolean;
}

@InputType()
export class BooksFilterInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  search?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isVisible?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;
}

// Input DTOs for Book Orders
@InputType()
export class CreateBookOrderInput {
  @Field(() => ID)
  @IsString()
  bookId: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  studentNotes?: string;
}

@InputType()
export class UpdateBookOrderInput {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsEnum(BookOrderStatus)
  status?: BookOrderStatus;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  studentNotes?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  adminNotes?: string;
}

@InputType()
export class BookOrdersFilterInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  search?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsEnum(BookOrderStatus)
  status?: BookOrderStatus;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsString()
  studentId?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsString()
  bookId?: string;
}

// Output DTOs for Books
@ObjectType()
export class BookResponse {
  @Field(() => ID)
  id: string;

  @Field()
  title: string;

  @Field()
  slug: string;

  @Field()
  author: string;

  @Field({ nullable: true })
  coverImage?: string;

  @Field()
  description: string;

  @Field(() => Int)
  totalCopies: number;

  @Field(() => Int)
  availableCopies: number;

  @Field()
  isVisible: boolean;

  @Field()
  createdAt: string;

  @Field()
  updatedAt: string;

  @Field(() => [BookOrderResponse], { nullable: true })
  bookOrders?: BookOrderResponse[];
}

@ObjectType()
export class BooksResponse {
  @Field(() => [BookResponse])
  books: BookResponse[];

  @Field(() => Int)
  total: number;
}

// User reference for book orders

// Output DTOs for Book Orders
@ObjectType()
export class BookOrderResponse {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  studentId: string;

  @Field(() => ID)
  bookId: string;

  @Field()
  status: string;

  @Field({ nullable: true })
  studentNotes?: string;

  @Field({ nullable: true })
  adminNotes?: string;

  @Field()
  createdAt: string;

  @Field()
  updatedAt: string;

  @Field(() => UserReference, { nullable: true })
  student?: UserReference;

  @Field(() => BookResponse, { nullable: true })
  book?: BookResponse;
}

@ObjectType()
export class BookOrdersResponse {
  @Field(() => [BookOrderResponse])
  bookOrders: BookOrderResponse[];

  @Field(() => Int)
  total: number;
}

// Statistics DTOs
@ObjectType()
export class LibraryStatsResponse {
  @Field(() => Int)
  totalBooks: number;

  @Field(() => Int)
  totalCopies: number;

  @Field(() => Int)
  availableCopies: number;

  @Field(() => Int)
  borrowedCopies: number;

  @Field(() => Int)
  pendingOrders: number;

  @Field(() => Int)
  approvedOrders: number;

  @Field(() => Int)
  rejectedOrders: number;
} 