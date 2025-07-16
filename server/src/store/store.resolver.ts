import { Resolver, Query, Mutation, Args, ID, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { StoreService } from './store.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import {
  CreateProductCategoryInput,
  UpdateProductCategoryInput,
  ProductCategoriesFilterInput,
  CreateProductInput,
  UpdateProductInput,
  ProductsFilterInput,
  CreateOrderInput,
  UpdateOrderInput,
  OrdersFilterInput,
  OrderItemInput,
  ProductCategoryResponse,
  ProductCategoriesResponse,
  ProductResponse,
  ProductsResponse,
  OrderResponse,
  OrdersResponse,
  StoreStatsResponse,
  CartResponse,
} from './dto/store.dto';
import { ForbiddenException } from '@nestjs/common';

@Resolver()
export class StoreResolver {
  constructor(private readonly storeService: StoreService) {}

  // Product Category Queries
  @Query(() => ProductCategoriesResponse)
  async productCategories(
    @Args('filter', { type: () => ProductCategoriesFilterInput, nullable: true })
    filter?: ProductCategoriesFilterInput,
  ): Promise<ProductCategoriesResponse> {
    return this.storeService.getProductCategories(filter);
  }

  @Query(() => ProductCategoryResponse)
  async productCategory(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<ProductCategoryResponse> {
    return this.storeService.getProductCategory(id);
  }

  // Product Category Mutations (Admin only)
  @Mutation(() => ProductCategoryResponse)
  @UseGuards(JwtAuthGuard)
  async createProductCategory(
    @Args('input') input: CreateProductCategoryInput,
    @CurrentUser() user: any,
  ): Promise<ProductCategoryResponse> {
    const isAdmin = ['SUPER_ADMIN', 'ACADEMIC_ADMIN', 'LIBRARY_ADMIN', 'STORE_ADMIN'].includes(user.role);
    if (!isAdmin) {
      throw new ForbiddenException('Admin access required');
    }
    return this.storeService.createProductCategory(input);
  }

  @Mutation(() => ProductCategoryResponse)
  @UseGuards(JwtAuthGuard)
  async updateProductCategory(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateProductCategoryInput,
    @CurrentUser() user: any,
  ): Promise<ProductCategoryResponse> {
    const isAdmin = ['SUPER_ADMIN', 'ACADEMIC_ADMIN', 'LIBRARY_ADMIN', 'STORE_ADMIN'].includes(user.role);
    if (!isAdmin) {
      throw new ForbiddenException('Admin access required');
    }
    return this.storeService.updateProductCategory(id, input);
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async deleteProductCategory(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: any,
  ): Promise<boolean> {
    const isAdmin = ['SUPER_ADMIN', 'ACADEMIC_ADMIN', 'LIBRARY_ADMIN', 'STORE_ADMIN'].includes(user.role);
    if (!isAdmin) {
      throw new ForbiddenException('Admin access required');
    }
    return this.storeService.deleteProductCategory(id);
  }

  // Product Queries
  @Query(() => ProductsResponse)
  async products(
    @Args('filter', { type: () => ProductsFilterInput, nullable: true })
    filter?: ProductsFilterInput,
  ): Promise<ProductsResponse> {
    return this.storeService.getProducts(filter);
  }

  @Query(() => ProductResponse)
  async product(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<ProductResponse> {
    return this.storeService.getProduct(id);
  }

  @Query(() => ProductResponse)
  async productBySlug(
    @Args('slug') slug: string,
  ): Promise<ProductResponse> {
    return this.storeService.getProductBySlug(slug);
  }

  // Product Mutations (Admin only)
  @Mutation(() => ProductResponse)
  @UseGuards(JwtAuthGuard)
  async createProduct(
    @Args('input') input: CreateProductInput,
    @CurrentUser() user: any,
  ): Promise<ProductResponse> {
    const isAdmin = ['SUPER_ADMIN', 'ACADEMIC_ADMIN', 'LIBRARY_ADMIN', 'STORE_ADMIN'].includes(user.role);
    if (!isAdmin) {
      throw new ForbiddenException('Admin access required');
    }
    return this.storeService.createProduct(input);
  }

  @Mutation(() => ProductResponse)
  @UseGuards(JwtAuthGuard)
  async updateProduct(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateProductInput,
    @CurrentUser() user: any,
  ): Promise<ProductResponse> {
    const isAdmin = ['SUPER_ADMIN', 'ACADEMIC_ADMIN', 'LIBRARY_ADMIN', 'STORE_ADMIN'].includes(user.role);
    if (!isAdmin) {
      throw new ForbiddenException('Admin access required');
    }
    return this.storeService.updateProduct(id, input);
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async deleteProduct(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: any,
  ): Promise<boolean> {
    const isAdmin = ['SUPER_ADMIN', 'ACADEMIC_ADMIN', 'LIBRARY_ADMIN', 'STORE_ADMIN'].includes(user.role);
    if (!isAdmin) {
      throw new ForbiddenException('Admin access required');
    }
    return this.storeService.deleteProduct(id);
  }

  // Order Queries
  @Query(() => OrdersResponse)
  @UseGuards(JwtAuthGuard)
  async orders(
    @CurrentUser() user: any,
    @Args('filter', { type: () => OrdersFilterInput, nullable: true })
    filter?: OrdersFilterInput,
  ): Promise<OrdersResponse> {
    return this.storeService.getOrders(filter, user.id, user.role);
  }

  @Query(() => OrderResponse)
  @UseGuards(JwtAuthGuard)
  async order(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: any,
  ): Promise<OrderResponse> {
    return this.storeService.getOrder(id, user.id, user.role);
  }

  @Query(() => OrdersResponse)
  @UseGuards(JwtAuthGuard)
  async myOrders(
    @CurrentUser() user: any,
  ): Promise<OrdersResponse> {
    if (user.role !== 'STUDENT') {
      throw new Error('Only students can access their orders');
    }
    return this.storeService.getOrders(undefined, user.id, user.role);
  }

  // Order Mutations
  @Mutation(() => OrderResponse)
  @UseGuards(JwtAuthGuard)
  async createOrder(
    @Args('input') input: CreateOrderInput,
    @CurrentUser() user: any,
  ): Promise<OrderResponse> {
    if (user.role !== 'STUDENT') {
      throw new Error('Only students can create orders');
    }
    return this.storeService.createOrder(input, user.id);
  }

  @Mutation(() => OrderResponse)
  @UseGuards(JwtAuthGuard)
  async updateOrder(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateOrderInput,
    @CurrentUser() user: any,
  ): Promise<OrderResponse> {
    return this.storeService.updateOrder(id, input, user.id, user.role);
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async deleteOrder(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: any,
  ): Promise<boolean> {
    return this.storeService.deleteOrder(id, user.id, user.role);
  }

  // Statistics Queries (Admin only)
  @Query(() => StoreStatsResponse)
  @UseGuards(JwtAuthGuard)
  async storeStats(
    @CurrentUser() user: any,
  ): Promise<StoreStatsResponse> {
    const isAdmin = ['SUPER_ADMIN', 'ACADEMIC_ADMIN', 'LIBRARY_ADMIN', 'STORE_ADMIN'].includes(user.role);
    if (!isAdmin) {
      throw new ForbiddenException('Admin access required');
    }
    return this.storeService.getStoreStats();
  }

  // Cart Utilities
  @Query(() => CartResponse)
  @UseGuards(JwtAuthGuard)
  async calculateCart(
    @Args('items', { type: () => [OrderItemInput] }) items: OrderItemInput[],
    @CurrentUser() user: any,
  ): Promise<CartResponse> {
    if (user.role !== 'STUDENT') {
      throw new Error('Only students can calculate cart');
    }
    return this.storeService.calculateCart(items);
  }

  // Additional utility queries for students
  @Query(() => ProductsResponse)
  async availableProducts(
    @Args('filter', { type: () => ProductsFilterInput, nullable: true })
    filter?: ProductsFilterInput,
  ): Promise<ProductsResponse> {
    // Force isVisible: true for public product access
    const publicFilter = {
      ...filter,
      isVisible: true,
    };
    return this.storeService.getProducts(publicFilter);
  }

  @Query(() => ProductCategoriesResponse)
  async availableProductCategories(
    @Args('filter', { type: () => ProductCategoriesFilterInput, nullable: true })
    filter?: ProductCategoriesFilterInput,
  ): Promise<ProductCategoriesResponse> {
    // Force isVisible: true for public category access
    const publicFilter = {
      ...filter,
      isVisible: true,
    };
    return this.storeService.getProductCategories(publicFilter);
  }

  @Query(() => ProductsResponse)
  async specialOffers(
    @Args('filter', { type: () => ProductsFilterInput, nullable: true })
    filter?: ProductsFilterInput,
  ): Promise<ProductsResponse> {
    // Get special offers that are visible
    const specialOfferFilter = {
      ...filter,
      isVisible: true,
      isSpecialOffer: true,
    };
    return this.storeService.getProducts(specialOfferFilter);
  }

  @Query(() => ProductsResponse)
  async productsByCategory(
    @Args('categoryId', { type: () => ID }) categoryId: string,
    @Args('filter', { type: () => ProductsFilterInput, nullable: true })
    filter?: ProductsFilterInput,
  ): Promise<ProductsResponse> {
    // Get products by category that are visible
    const categoryFilter = {
      ...filter,
      categoryId,
      isVisible: true,
    };
    return this.storeService.getProducts(categoryFilter);
  }
} 