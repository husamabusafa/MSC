import { Field, InputType, ObjectType, ID, Float, Int, registerEnumType } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsOptional, IsNumber, IsBoolean, IsEnum, IsArray, ValidateNested, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { UserReference } from '../../users/dto/user.dto';

// Enums
export enum OrderStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

registerEnumType(OrderStatus, {
  name: 'OrderStatus',
  description: 'Order status enum',
});

// Base classes

@ObjectType()
export class ProductCategoryReference {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  description: string;
}

@ObjectType()
export class ProductReference {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  slug: string;

  @Field(() => Float)
  price: number;

  @Field({ nullable: true })
  image?: string;
}

// Input DTOs
@InputType()
export class CreateProductCategoryInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  name: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  description: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isVisible?: boolean;
}

@InputType()
export class UpdateProductCategoryInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  name?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isVisible?: boolean;
}

@InputType()
export class ProductCategoriesFilterInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  search?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isVisible?: boolean;
}

@InputType()
export class CreateProductInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  name: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  description: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  image?: string;

  @Field(() => Float)
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  price: number;

  @Field(() => ID)
  @IsNotEmpty()
  @IsString()
  categoryId: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isVisible?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isSpecialOffer?: boolean;
}

@InputType()
export class UpdateProductInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  name?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  image?: string;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isVisible?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isSpecialOffer?: boolean;
}

@InputType()
export class ProductsFilterInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  search?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isVisible?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isSpecialOffer?: boolean;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxPrice?: number;
}

@InputType()
export class OrderItemInput {
  @Field(() => ID)
  @IsNotEmpty()
  @IsString()
  productId: string;

  @Field(() => Int)
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Max(100)
  quantity: number;
}

@InputType()
export class CreateOrderInput {
  @Field(() => [OrderItemInput])
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemInput)
  items: OrderItemInput[];

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  studentNotes?: string;
}

@InputType()
export class UpdateOrderInput {
  @Field(() => OrderStatus, { nullable: true })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

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
export class OrdersFilterInput {
  @Field(() => OrderStatus, { nullable: true })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsString()
  studentId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  search?: string;
}

// Output DTOs
@ObjectType()
export class ProductCategoryResponse {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  description: string;

  @Field()
  isVisible: boolean;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => [ProductResponse], { nullable: true })
  products?: ProductResponse[];
}

@ObjectType()
export class ProductCategoriesResponse {
  @Field(() => [ProductCategoryResponse])
  categories: ProductCategoryResponse[];

  @Field(() => Int)
  total: number;
}

@ObjectType()
export class ProductResponse {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  slug: string;

  @Field()
  description: string;

  @Field({ nullable: true })
  image?: string;

  @Field(() => Float)
  price: number;

  @Field(() => ID)
  categoryId: string;

  @Field()
  isVisible: boolean;

  @Field()
  isSpecialOffer: boolean;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => ProductCategoryResponse, { nullable: true })
  category?: ProductCategoryResponse;
}

@ObjectType()
export class ProductsResponse {
  @Field(() => [ProductResponse])
  products: ProductResponse[];

  @Field(() => Int)
  total: number;
}

@ObjectType()
export class OrderItemResponse {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  orderId: string;

  @Field(() => ID)
  productId: string;

  @Field(() => Int)
  quantity: number;

  @Field(() => Float)
  price: number;

  @Field(() => ProductResponse, { nullable: true })
  product?: ProductResponse;
}

@ObjectType()
export class OrderResponse {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  studentId: string;

  @Field(() => Float)
  total: number;

  @Field(() => OrderStatus)
  status: OrderStatus;

  @Field({ nullable: true })
  studentNotes?: string;

  @Field({ nullable: true })
  adminNotes?: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => [OrderItemResponse])
  items: OrderItemResponse[];

  @Field(() => UserReference, { nullable: true })
  student?: UserReference;
}

@ObjectType()
export class OrdersResponse {
  @Field(() => [OrderResponse])
  orders: OrderResponse[];

  @Field(() => Int)
  total: number;
}

@ObjectType()
export class StoreStatsResponse {
  @Field(() => Int)
  totalCategories: number;

  @Field(() => Int)
  totalProducts: number;

  @Field(() => Int)
  totalOrders: number;

  @Field(() => Int)
  pendingOrders: number;

  @Field(() => Int)
  completedOrders: number;

  @Field(() => Int)
  cancelledOrders: number;

  @Field(() => Float)
  totalRevenue: number;

  @Field(() => Float)
  pendingRevenue: number;
}

@ObjectType()
export class CartItemResponse {
  @Field(() => ID)
  productId: string;

  @Field(() => Int)
  quantity: number;

  @Field(() => Float)
  price: number;

  @Field(() => Float)
  total: number;

  @Field(() => ProductResponse)
  product: ProductResponse;
}

@ObjectType()
export class CartResponse {
  @Field(() => [CartItemResponse])
  items: CartItemResponse[];

  @Field(() => Float)
  total: number;

  @Field(() => Int)
  itemCount: number;
} 