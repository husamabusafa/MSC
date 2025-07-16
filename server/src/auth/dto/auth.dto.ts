import { Field, InputType, ObjectType, Int } from '@nestjs/graphql';
import { IsEmail, IsString, MinLength, IsOptional, IsEnum } from 'class-validator';

@InputType()
export class LoginInput {
  @Field()
  @IsEmail()
  email: string;

  @Field()
  @IsString()
  @MinLength(1)
  password: string;
}

@InputType()
export class RegisterInput {
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
}

@InputType()
export class CreateRegistrationRequestInput {
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
}

@InputType()
export class ApproveRegistrationRequestInput {
  @Field()
  @IsString()
  requestId: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  adminNotes?: string;
}

@InputType()
export class RejectRegistrationRequestInput {
  @Field()
  @IsString()
  requestId: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  adminNotes?: string;
}

@ObjectType()
export class AuthUserResponse {
  @Field()
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
}

@ObjectType()
export class AuthResponse {
  @Field()
  accessToken: string;

  @Field()
  user: AuthUserResponse;
}

@ObjectType()
export class RegistrationRequestResponse {
  @Field()
  id: string;

  @Field()
  email: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  universityId?: string;

  @Field()
  status: string;

  @Field({ nullable: true })
  adminNotes?: string;

  @Field()
  createdAt: string;

  @Field()
  updatedAt: string;
}

@ObjectType()
export class RegistrationRequestSubmissionResponse {
  @Field()
  message: string;

  @Field()
  success: boolean;
}

@ObjectType()
export class RegistrationRequestsCountResponse {
  @Field(() => Int)
  pending: number;

  @Field(() => Int)
  total: number;
} 