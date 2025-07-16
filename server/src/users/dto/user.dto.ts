import { Field, InputType, ObjectType, ID } from '@nestjs/graphql';
import { IsEmail, IsString, MinLength, IsOptional, IsBoolean, IsEnum } from 'class-validator';

// Enums
export enum UserRole {
  STUDENT = 'STUDENT',
  SUPER_ADMIN = 'SUPER_ADMIN',
  ACADEMIC_ADMIN = 'ACADEMIC_ADMIN',
  LIBRARY_ADMIN = 'LIBRARY_ADMIN',
  STORE_ADMIN = 'STORE_ADMIN'
}

// Common reference types
@ObjectType()
export class UserReference {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  email: string;

  @Field({ nullable: true })
  universityId?: string;
}

// Input DTOs
@InputType()
export class CreateUserInput {
  @Field()
  @IsEmail()
  email: string;

  @Field()
  @IsString()
  @MinLength(8)
  password: string;

  @Field()
  @IsString()
  @MinLength(1)
  name: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  universityId?: string;

  @Field(() => String, { defaultValue: UserRole.STUDENT })
  @IsEnum(UserRole)
  role: UserRole;

  @Field({ defaultValue: true })
  @IsBoolean()
  isActive: boolean;
}

@InputType()
export class UpdateUserInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsEmail()
  email?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MinLength(1)
  name?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  universityId?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

@InputType()
export class UpdateProfileInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MinLength(1)
  name?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsEmail()
  email?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string;
}

@InputType()
export class UsersFilterInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  search?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

@InputType()
export class CreatePreRegisteredStudentInput {
  @Field()
  @IsString()
  @MinLength(1)
  fullName: string;

  @Field()
  @IsString()
  @MinLength(1)
  universityId: string;
}

@InputType()
export class UpdatePreRegisteredStudentInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MinLength(1)
  fullName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MinLength(1)
  universityId?: string;
}

@InputType()
export class PreRegisteredStudentsFilterInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  search?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isUsed?: boolean;
}

// Output DTOs
@ObjectType()
export class UserResponse {
  @Field(() => ID)
  id: string;

  @Field()
  email: string;

  @Field()
  name: string;

  @Field()
  role: string;

  @Field({ nullable: true })
  universityId?: string;

  @Field()
  isActive: boolean;

  @Field()
  createdAt: string;

  @Field()
  updatedAt: string;
}

@ObjectType()
export class PreRegisteredStudentResponse {
  @Field(() => ID)
  id: string;

  @Field()
  fullName: string;

  @Field()
  universityId: string;

  @Field()
  isUsed: boolean;

  @Field()
  createdAt: string;
}

@ObjectType()
export class UsersResponse {
  @Field(() => [UserResponse])
  users: UserResponse[];

  @Field()
  total: number;
}

@ObjectType()
export class PreRegisteredStudentsResponse {
  @Field(() => [PreRegisteredStudentResponse])
  preRegisteredStudents: PreRegisteredStudentResponse[];

  @Field()
  total: number;
} 