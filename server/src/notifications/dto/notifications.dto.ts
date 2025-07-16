import { Field, InputType, ObjectType, Int } from '@nestjs/graphql';
import { IsString, IsBoolean, IsOptional, IsUUID } from 'class-validator';

// =============== NOTIFICATION DTOs ===============
@ObjectType()
export class NotificationResponse {
  @Field()
  id: string;

  @Field()
  title: string;

  @Field()
  message: string;

  @Field({ nullable: true })
  levelId?: string;

  @Field()
  isActive: boolean;

  @Field()
  createdAt: string;

  @Field()
  updatedAt: string;

  @Field({ nullable: true })
  levelName?: string;
}

@ObjectType()
export class NotificationsResponse {
  @Field(() => [NotificationResponse])
  notifications: NotificationResponse[];

  @Field(() => Int)
  total: number;
}

@InputType()
export class CreateNotificationInput {
  @Field()
  @IsString()
  title: string;

  @Field()
  @IsString()
  message: string;

  @Field({ nullable: true })
  @IsUUID()
  @IsOptional()
  levelId?: string;

  @Field({ defaultValue: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

@InputType()
export class UpdateNotificationInput {
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  title?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  message?: string;

  @Field({ nullable: true })
  @IsUUID()
  @IsOptional()
  levelId?: string;

  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

@InputType()
export class NotificationsFilterInput {
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  levelId?: string;

  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  search?: string;
}

@ObjectType()
export class NotificationsCountResponse {
  @Field(() => Int)
  active: number;

  @Field(() => Int)
  total: number;
} 