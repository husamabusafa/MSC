import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
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
  OrderStatus,
  ProductCategoryResponse,
  ProductCategoriesResponse,
  ProductResponse,
  ProductsResponse,
  OrderResponse,
  OrdersResponse,
  StoreStatsResponse,
  CartItemResponse,
  CartResponse,
  OrderItemInput,
} from './dto/store.dto';
import { UserReference } from '../users/dto/user.dto';

@Injectable()
export class StoreService {
  constructor(private prisma: PrismaService) {}

  // Helper methods
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  private async ensureUniqueSlug(slug: string, excludeId?: string): Promise<string> {
    let uniqueSlug = slug;
    let counter = 1;
    
    while (true) {
      const existingProduct = await this.prisma.product.findFirst({
        where: {
          slug: uniqueSlug,
          ...(excludeId && { id: { not: excludeId } }),
        },
      });
      
      if (!existingProduct) break;
      
      uniqueSlug = `${slug}-${counter}`;
      counter++;
    }
    
    return uniqueSlug;
  }

  private calculateOrderTotal(items: OrderItemInput[], products: any[]): number {
    return items.reduce((total, item) => {
      const product = products.find(p => p.id === item.productId);
      return total + (product?.price || 0) * item.quantity;
    }, 0);
  }

  // Product Category methods
  async createProductCategory(data: CreateProductCategoryInput): Promise<any> {
    try {
      return await this.prisma.productCategory.create({
        data: {
          name: data.name,
          description: data.description,
          isVisible: data.isVisible ?? true,
        },
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new BadRequestException('Category name already exists');
      }
      throw error;
    }
  }

  async updateProductCategory(id: string, data: UpdateProductCategoryInput): Promise<any> {
    const category = await this.prisma.productCategory.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException('Product category not found');
    }

    try {
      return await this.prisma.productCategory.update({
        where: { id },
        data: {
          ...(data.name && { name: data.name }),
          ...(data.description && { description: data.description }),
          ...(data.isVisible !== undefined && { isVisible: data.isVisible }),
        },
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new BadRequestException('Category name already exists');
      }
      throw error;
    }
  }

  async deleteProductCategory(id: string): Promise<boolean> {
    const category = await this.prisma.productCategory.findUnique({
      where: { id },
      include: { products: true },
    });

    if (!category) {
      throw new NotFoundException('Product category not found');
    }

    if (category.products.length > 0) {
      throw new BadRequestException('Cannot delete category with existing products');
    }

    await this.prisma.productCategory.delete({
      where: { id },
    });

    return true;
  }

  async getProductCategories(filter?: ProductCategoriesFilterInput): Promise<ProductCategoriesResponse> {
    const where: any = {};

    if (filter?.isVisible !== undefined) {
      where.isVisible = filter.isVisible;
    }

    if (filter?.search) {
      where.OR = [
        { name: { contains: filter.search } },
        { description: { contains: filter.search } },
      ];
    }

    const [categories, total] = await Promise.all([
      this.prisma.productCategory.findMany({
        where,
        include: {
          products: {
            where: { isVisible: true },
            include: {
              category: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.productCategory.count({ where }),
    ]);

    return {
      categories: categories as any,
      total,
    };
  }

  async getProductCategory(id: string): Promise<any> {
    const category = await this.prisma.productCategory.findUnique({
      where: { id },
      include: {
        products: {
          where: { isVisible: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('Product category not found');
    }

    return category;
  }

  // Product methods
  async createProduct(data: CreateProductInput): Promise<any> {
    // Verify category exists
    const category = await this.prisma.productCategory.findUnique({
      where: { id: data.categoryId },
    });

    if (!category) {
      throw new NotFoundException('Product category not found');
    }

    const slug = this.generateSlug(data.name);
    const uniqueSlug = await this.ensureUniqueSlug(slug);

    try {
      return await this.prisma.product.create({
        data: {
          name: data.name,
          slug: uniqueSlug,
          description: data.description,
          image: data.image,
          price: data.price,
          categoryId: data.categoryId,
          isVisible: data.isVisible ?? true,
          isSpecialOffer: data.isSpecialOffer ?? false,
        },
        include: {
          category: true,
        },
      });
    } catch (error) {
      throw error;
    }
  }

  async updateProduct(id: string, data: UpdateProductInput): Promise<any> {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Verify category exists if categoryId is provided
    if (data.categoryId) {
      const category = await this.prisma.productCategory.findUnique({
        where: { id: data.categoryId },
      });

      if (!category) {
        throw new NotFoundException('Product category not found');
      }
    }

    // Generate new slug if name is being updated
    let slug = product.slug;
    if (data.name && data.name !== product.name) {
      slug = this.generateSlug(data.name);
      slug = await this.ensureUniqueSlug(slug, id);
    }

    try {
      return await this.prisma.product.update({
        where: { id },
        data: {
          ...(data.name && { name: data.name }),
          ...(data.name && { slug }),
          ...(data.description && { description: data.description }),
          ...(data.image !== undefined && { image: data.image }),
          ...(data.price !== undefined && { price: data.price }),
          ...(data.categoryId && { categoryId: data.categoryId }),
          ...(data.isVisible !== undefined && { isVisible: data.isVisible }),
          ...(data.isSpecialOffer !== undefined && { isSpecialOffer: data.isSpecialOffer }),
        },
        include: {
          category: true,
        },
      });
    } catch (error) {
      throw error;
    }
  }

  async deleteProduct(id: string): Promise<boolean> {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { orderItems: true },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (product.orderItems.length > 0) {
      throw new BadRequestException('Cannot delete product with existing orders');
    }

    await this.prisma.product.delete({
      where: { id },
    });

    return true;
  }

  async getProducts(filter?: ProductsFilterInput): Promise<ProductsResponse> {
    const where: any = {};

    if (filter?.isVisible !== undefined) {
      where.isVisible = filter.isVisible;
    }

    if (filter?.isSpecialOffer !== undefined) {
      where.isSpecialOffer = filter.isSpecialOffer;
    }

    if (filter?.categoryId) {
      where.categoryId = filter.categoryId;
    }

    if (filter?.minPrice !== undefined || filter?.maxPrice !== undefined) {
      where.price = {};
      if (filter.minPrice !== undefined) {
        where.price.gte = filter.minPrice;
      }
      if (filter.maxPrice !== undefined) {
        where.price.lte = filter.maxPrice;
      }
    }

    if (filter?.search) {
      where.OR = [
        { name: { contains: filter.search } },
        { description: { contains: filter.search } },
      ];
    }

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: {
          category: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      products,
      total,
    };
  }

  async getProduct(id: string): Promise<any> {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async getProductBySlug(slug: string): Promise<any> {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  // Order methods
  async createOrder(data: CreateOrderInput, studentId: string): Promise<any> {
    if (!data.items || data.items.length === 0) {
      throw new BadRequestException('Order must contain at least one item');
    }

    // Verify all products exist and are visible
    const productIds = data.items.map(item => item.productId);
    const products = await this.prisma.product.findMany({
      where: {
        id: { in: productIds },
        isVisible: true,
      },
    });

    if (products.length !== productIds.length) {
      throw new BadRequestException('Some products are not available');
    }

    // Calculate total
    const total = this.calculateOrderTotal(data.items, products);

    try {
      return await this.prisma.order.create({
        data: {
          studentId,
          total,
          studentNotes: data.studentNotes,
          status: OrderStatus.PENDING,
          items: {
            create: data.items.map(item => {
              const product = products.find(p => p.id === item.productId);
              return {
                productId: item.productId,
                quantity: item.quantity,
                price: product.price,
              };
            }),
          },
        },
        include: {
          items: {
            include: {
              product: {
                include: {
                  category: true,
                },
              },
            },
          },
          student: {
            select: {
              id: true,
              name: true,
              email: true,
              universityId: true,
            },
          },
        },
      });
    } catch (error) {
      throw error;
    }
  }

  async updateOrder(id: string, data: UpdateOrderInput, userId: string, userRole: string): Promise<any> {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            universityId: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Students can only update their own orders
    if (userRole === 'STUDENT' && order.studentId !== userId) {
      throw new ForbiddenException('You can only update your own orders');
    }

    // Students can only update notes if order is pending
    if (userRole === 'STUDENT' && order.status !== OrderStatus.PENDING) {
      throw new BadRequestException('You can only update notes for pending orders');
    }

    // Only admins can update order status
    if (data.status && userRole !== 'ADMIN') {
      throw new ForbiddenException('Only admins can update order status');
    }

    try {
      return await this.prisma.order.update({
        where: { id },
        data: {
          ...(data.status && { status: data.status }),
          ...(data.studentNotes !== undefined && { studentNotes: data.studentNotes }),
          ...(data.adminNotes !== undefined && { adminNotes: data.adminNotes }),
        },
        include: {
          items: {
            include: {
              product: {
                include: {
                  category: true,
                },
              },
            },
          },
          student: {
            select: {
              id: true,
              name: true,
              email: true,
              universityId: true,
            },
          },
        },
      });
    } catch (error) {
      throw error;
    }
  }

  async deleteOrder(id: string, userId: string, userRole: string): Promise<boolean> {
    const order = await this.prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Students can only delete their own pending orders
    if (userRole === 'STUDENT') {
      if (order.studentId !== userId) {
        throw new ForbiddenException('You can only delete your own orders');
      }
      if (order.status !== OrderStatus.PENDING) {
        throw new BadRequestException('You can only delete pending orders');
      }
    }

    await this.prisma.order.delete({
      where: { id },
    });

    return true;
  }

  async getOrders(filter?: OrdersFilterInput, userId?: string, userRole?: string): Promise<any> {
    const where: any = {};

    // Students can only see their own orders
    if (userRole === 'STUDENT' && userId) {
      where.studentId = userId;
    }

    if (filter?.status) {
      where.status = filter.status;
    }

    if (filter?.studentId && userRole === 'ADMIN') {
      where.studentId = filter.studentId;
    }

    if (filter?.search) {
      where.OR = [
        { studentNotes: { contains: filter.search } },
        { adminNotes: { contains: filter.search } },
        { student: { name: { contains: filter.search } } },
        { student: { email: { contains: filter.search } } },
      ];
    }

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: {
          items: {
            include: {
              product: {
                include: {
                  category: true,
                },
              },
            },
          },
          student: {
            select: {
              id: true,
              name: true,
              email: true,
              universityId: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      orders: orders as any,
      total,
    };
  }

  async getOrder(id: string, userId?: string, userRole?: string): Promise<any> {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: {
              include: {
                category: true,
              },
            },
          },
        },
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            universityId: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Students can only see their own orders
    if (userRole === 'STUDENT' && order.studentId !== userId) {
      throw new ForbiddenException('You can only view your own orders');
    }

    return order;
  }

  // Statistics methods
  async getStoreStats(): Promise<StoreStatsResponse> {
    const [
      totalCategories,
      totalProducts,
      totalOrders,
      pendingOrders,
      completedOrders,
      cancelledOrders,
      revenueData,
    ] = await Promise.all([
      this.prisma.productCategory.count(),
      this.prisma.product.count(),
      this.prisma.order.count(),
      this.prisma.order.count({ where: { status: OrderStatus.PENDING } }),
      this.prisma.order.count({ where: { status: OrderStatus.COMPLETED } }),
      this.prisma.order.count({ where: { status: OrderStatus.CANCELLED } }),
      this.prisma.order.aggregate({
        _sum: { total: true },
        where: { status: { in: [OrderStatus.PENDING, OrderStatus.COMPLETED] } },
      }),
    ]);

    const pendingRevenue = await this.prisma.order.aggregate({
      _sum: { total: true },
      where: { status: OrderStatus.PENDING },
    });

    return {
      totalCategories,
      totalProducts,
      totalOrders,
      pendingOrders,
      completedOrders,
      cancelledOrders,
      totalRevenue: revenueData._sum.total || 0,
      pendingRevenue: pendingRevenue._sum.total || 0,
    };
  }

  // Cart utilities (for frontend use)
  async calculateCart(items: OrderItemInput[]): Promise<CartResponse> {
    if (!items || items.length === 0) {
      return {
        items: [],
        total: 0,
        itemCount: 0,
      };
    }

    const productIds = items.map(item => item.productId);
    const products = await this.prisma.product.findMany({
      where: {
        id: { in: productIds },
        isVisible: true,
      },
      include: {
        category: true,
      },
    });

    const cartItems: CartItemResponse[] = items.map(item => {
      const product = products.find(p => p.id === item.productId);
      if (!product) {
        throw new NotFoundException(`Product ${item.productId} not found`);
      }

      return {
        productId: item.productId,
        quantity: item.quantity,
        price: product.price,
        total: product.price * item.quantity,
        product,
      };
    });

    const total = cartItems.reduce((sum, item) => sum + item.total, 0);
    const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    return {
      items: cartItems,
      total,
      itemCount,
    };
  }
} 