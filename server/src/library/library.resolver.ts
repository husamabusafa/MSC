// @ts-nocheck
import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards, ForbiddenException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '@prisma/client';
import { LibraryService } from './library.service';
import {
  CreateBookInput,
  UpdateBookInput,
  BooksFilterInput,
  CreateBookOrderInput,
  UpdateBookOrderInput,
  BookOrdersFilterInput,
  BookResponse,
  BooksResponse,
  BookOrderResponse,
  BookOrdersResponse,
  LibraryStatsResponse,
} from './dto/library.dto';

@Resolver()
export class LibraryResolver {
  constructor(private readonly libraryService: LibraryService) {}

  // Book Management Queries
  @Query(() => BooksResponse)
  async books(
    @Args('filters', { type: () => BooksFilterInput, nullable: true }) filters: BooksFilterInput = {},
  ): Promise<BooksResponse> {
    const { books, total } = await this.libraryService.getBooksWithFilters(filters);

    return {
      books: books.map(book => ({
        id: book.id,
        title: book.title,
        slug: book.slug,
        author: book.author,
        coverImage: book.coverImage,
        description: book.description,
        totalCopies: book.totalCopies,
        availableCopies: book.availableCopies,
        isVisible: book.isVisible,
        createdAt: book.createdAt.toISOString(),
        updatedAt: book.updatedAt.toISOString(),
        bookOrders: book.bookOrders?.map(order => ({
          id: order.id,
          studentId: order.studentId,
          bookId: order.bookId,
          status: order.status,
          studentNotes: order.studentNotes,
          adminNotes: order.adminNotes,
          createdAt: order.createdAt.toISOString(),
          updatedAt: order.updatedAt.toISOString(),
          student: order.student ? {
            id: order.student.id,
            name: order.student.name,
            email: order.student.email,
            universityId: order.student.universityId,
          } : undefined,
        })),
      })),
      total,
    };
  }

  @Query(() => BookResponse)
  async book(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<BookResponse> {
    const book = await this.libraryService.getBookById(id);
    if (!book) {
      throw new Error('Book not found');
    }

    return {
      id: book.id,
      title: book.title,
      slug: book.slug,
      author: book.author,
      coverImage: book.coverImage,
      description: book.description,
      totalCopies: book.totalCopies,
      availableCopies: book.availableCopies,
      isVisible: book.isVisible,
      createdAt: book.createdAt.toISOString(),
      updatedAt: book.updatedAt.toISOString(),
      bookOrders: book.bookOrders?.map(order => ({
        id: order.id,
        studentId: order.studentId,
        bookId: order.bookId,
        status: order.status,
        studentNotes: order.studentNotes,
        adminNotes: order.adminNotes,
        createdAt: order.createdAt.toISOString(),
        updatedAt: order.updatedAt.toISOString(),
        student: order.student ? {
          id: order.student.id,
          name: order.student.name,
          email: order.student.email,
          universityId: order.student.universityId,
        } : undefined,
      })),
    };
  }

  // Book Management Mutations (Admin only)
  @Mutation(() => BookResponse)
  @UseGuards(JwtAuthGuard)
  async createBook(
    @Args('createBookInput') createBookInput: CreateBookInput,
    @CurrentUser() user: User,
  ): Promise<BookResponse> {
    const isAdmin = ['SUPER_ADMIN', 'ACADEMIC_ADMIN', 'LIBRARY_ADMIN', 'STORE_ADMIN'].includes(user.role);
    if (!isAdmin) {
      throw new ForbiddenException('Admin access required');
    }

    const book = await this.libraryService.createBook(createBookInput);

    return {
      id: book.id,
      title: book.title,
      slug: book.slug,
      author: book.author,
      coverImage: book.coverImage,
      description: book.description,
      totalCopies: book.totalCopies,
      availableCopies: book.availableCopies,
      isVisible: book.isVisible,
      createdAt: book.createdAt.toISOString(),
      updatedAt: book.updatedAt.toISOString(),
    };
  }

  @Mutation(() => BookResponse)
  @UseGuards(JwtAuthGuard)
  async updateBook(
    @Args('id', { type: () => ID }) id: string,
    @Args('updateBookInput') updateBookInput: UpdateBookInput,
    @CurrentUser() user: User,
  ): Promise<BookResponse> {
    const isAdmin = ['SUPER_ADMIN', 'ACADEMIC_ADMIN', 'LIBRARY_ADMIN', 'STORE_ADMIN'].includes(user.role);
    if (!isAdmin) {
      throw new ForbiddenException('Admin access required');
    }

    const book = await this.libraryService.updateBook(id, updateBookInput);

    return {
      id: book.id,
      title: book.title,
      slug: book.slug,
      author: book.author,
      coverImage: book.coverImage,
      description: book.description,
      totalCopies: book.totalCopies,
      availableCopies: book.availableCopies,
      isVisible: book.isVisible,
      createdAt: book.createdAt.toISOString(),
      updatedAt: book.updatedAt.toISOString(),
    };
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async deleteBook(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: User,
  ): Promise<boolean> {
    const isAdmin = ['SUPER_ADMIN', 'ACADEMIC_ADMIN', 'LIBRARY_ADMIN', 'STORE_ADMIN'].includes(user.role);
    if (!isAdmin) {
      throw new ForbiddenException('Admin access required');
    }

    return this.libraryService.deleteBook(id);
  }

  // Book Order Management Queries
  @Query(() => BookOrdersResponse)
  @UseGuards(JwtAuthGuard)
  async bookOrders(
    @Args('filters', { type: () => BookOrdersFilterInput, nullable: true }) filters: BookOrdersFilterInput = {},
    @CurrentUser() user: User,
  ): Promise<BookOrdersResponse> {
    // Students can only see their own orders
    if (user.role === 'STUDENT') {
      filters.studentId = user.id;
    }

    const { bookOrders, total } = await this.libraryService.getBookOrdersWithFilters(filters);

    return {
      // @ts-ignore
      bookOrders: bookOrders.map(order => ({
        id: order.id,
        studentId: order.studentId,
        bookId: order.bookId,
        status: order.status,
        studentNotes: order.studentNotes,
        adminNotes: order.adminNotes,
        createdAt: order.createdAt.toISOString(),
        updatedAt: order.updatedAt.toISOString(),
        student: order.student ? {
          id: order.student.id,
          name: order.student.name,
          email: order.student.email,
          universityId: order.student.universityId,
        } : undefined,
        book: order.book ? {
          id: order.book.id,
          title: order.book.title,
          slug: order.book.slug,
          author: order.book.author,
          coverImage: order.book.coverImage,
          description: order.book.description,
          totalCopies: order.book.totalCopies,
          availableCopies: order.book.availableCopies,
          isVisible: order.book.isVisible,
          createdAt: order.book.createdAt.toISOString(),
          updatedAt: order.book.updatedAt.toISOString(),
        } : undefined,
      })),
      total,
    };
  }

  @Query(() => BookOrderResponse)
  @UseGuards(JwtAuthGuard)
  async bookOrder(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: User,
  ): Promise<BookOrderResponse> {
    const bookOrder = await this.libraryService.getBookOrderById(id);
    if (!bookOrder) {
      throw new Error('Book order not found');
    }

    // Students can only see their own orders
    if (user.role === 'STUDENT' && bookOrder.studentId !== user.id) {
      throw new ForbiddenException('Access denied');
    }

    return {
      id: bookOrder.id,
      studentId: bookOrder.studentId,
      bookId: bookOrder.bookId,
      status: bookOrder.status,
      studentNotes: bookOrder.studentNotes,
      adminNotes: bookOrder.adminNotes,
      createdAt: bookOrder.createdAt.toISOString(),
      updatedAt: bookOrder.updatedAt.toISOString(),
      student: bookOrder.student ? {
        id: bookOrder.student.id,
        name: bookOrder.student.name,
        email: bookOrder.student.email,
        universityId: bookOrder.student.universityId,
      } : undefined,
      book: bookOrder.book ? {
        id: bookOrder.book.id,
        title: bookOrder.book.title,
        slug: bookOrder.book.slug,
        author: bookOrder.book.author,
        coverImage: bookOrder.book.coverImage,
        description: bookOrder.book.description,
        totalCopies: bookOrder.book.totalCopies,
        availableCopies: bookOrder.book.availableCopies,
        isVisible: bookOrder.book.isVisible,
        createdAt: bookOrder.book.createdAt.toISOString(),
        updatedAt: bookOrder.book.updatedAt.toISOString(),
      } : undefined,
    };
  }

  @Query(() => [BookOrderResponse])
  @UseGuards(JwtAuthGuard)
  async myBookOrders(
    @CurrentUser() user: User,
  ): Promise<BookOrderResponse[]> {
    const bookOrders = await this.libraryService.getStudentBookOrders(user.id);

    return bookOrders.map(order => ({
      id: order.id,
      studentId: order.studentId,
      bookId: order.bookId,
      status: order.status,
      studentNotes: order.studentNotes,
      adminNotes: order.adminNotes,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
      book: order.book ? {
        id: order.book.id,
        title: order.book.title,
        slug: order.book.slug,
        author: order.book.author,
        coverImage: order.book.coverImage,
        description: order.book.description,
        totalCopies: order.book.totalCopies,
        availableCopies: order.book.availableCopies,
        isVisible: order.book.isVisible,
        createdAt: order.book.createdAt.toISOString(),
        updatedAt: order.book.updatedAt.toISOString(),
      } : undefined,
    }));
  }

  // Book Order Management Mutations
  @Mutation(() => BookOrderResponse)
  @UseGuards(JwtAuthGuard)
  async createBookOrder(
    @Args('createBookOrderInput') createBookOrderInput: CreateBookOrderInput,
    @CurrentUser() user: User,
  ): Promise<BookOrderResponse> {
    if (user.role !== 'STUDENT') {
      throw new ForbiddenException('Only students can create book orders');
    }

    const bookOrder = await this.libraryService.createBookOrder(user.id, createBookOrderInput);

    return {
      id: bookOrder.id,
      studentId: bookOrder.studentId,
      bookId: bookOrder.bookId,
      status: bookOrder.status,
      studentNotes: bookOrder.studentNotes,
      adminNotes: bookOrder.adminNotes,
      createdAt: bookOrder.createdAt.toISOString(),
      updatedAt: bookOrder.updatedAt.toISOString(),
      student: bookOrder.student ? {
        id: bookOrder.student.id,
        name: bookOrder.student.name,
        email: bookOrder.student.email,
        universityId: bookOrder.student.universityId,
      } : undefined,
      book: bookOrder.book ? {
        id: bookOrder.book.id,
        title: bookOrder.book.title,
        slug: bookOrder.book.slug,
        author: bookOrder.book.author,
        coverImage: bookOrder.book.coverImage,
        description: bookOrder.book.description,
        totalCopies: bookOrder.book.totalCopies,
        availableCopies: bookOrder.book.availableCopies,
        isVisible: bookOrder.book.isVisible,
        createdAt: bookOrder.book.createdAt.toISOString(),
        updatedAt: bookOrder.book.updatedAt.toISOString(),
      } : undefined,
    };
  }

  @Mutation(() => BookOrderResponse)
  @UseGuards(JwtAuthGuard)
  async updateBookOrder(
    @Args('id', { type: () => ID }) id: string,
    @Args('updateBookOrderInput') updateBookOrderInput: UpdateBookOrderInput,
    @CurrentUser() user: User,
  ): Promise<BookOrderResponse> {
    const existingOrder = await this.libraryService.getBookOrderById(id);
    if (!existingOrder) {
      throw new Error('Book order not found');
    }

    // Students can only update their own orders (student notes only)
    if (user.role === 'STUDENT') {
      if (existingOrder.studentId !== user.id) {
        throw new ForbiddenException('Access denied');
      }
      // Students can only update student notes
      if (updateBookOrderInput.status || updateBookOrderInput.adminNotes) {
        throw new ForbiddenException('Students can only update student notes');
      }
    }

    const bookOrder = await this.libraryService.updateBookOrder(id, updateBookOrderInput);

    return {
      id: bookOrder.id,
      studentId: bookOrder.studentId,
      bookId: bookOrder.bookId,
      status: bookOrder.status,
      studentNotes: bookOrder.studentNotes,
      adminNotes: bookOrder.adminNotes,
      createdAt: bookOrder.createdAt.toISOString(),
      updatedAt: bookOrder.updatedAt.toISOString(),
      student: bookOrder.student ? {
        id: bookOrder.student.id,
        name: bookOrder.student.name,
        email: bookOrder.student.email,
        universityId: bookOrder.student.universityId,
      } : undefined,
      book: bookOrder.book ? {
        id: bookOrder.book.id,
        title: bookOrder.book.title,
        slug: bookOrder.book.slug,
        author: bookOrder.book.author,
        coverImage: bookOrder.book.coverImage,
        description: bookOrder.book.description,
        totalCopies: bookOrder.book.totalCopies,
        availableCopies: bookOrder.book.availableCopies,
        isVisible: bookOrder.book.isVisible,
        createdAt: bookOrder.book.createdAt.toISOString(),
        updatedAt: bookOrder.book.updatedAt.toISOString(),
      } : undefined,
    };
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async deleteBookOrder(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: User,
  ): Promise<boolean> {
    const isAdmin = ['SUPER_ADMIN', 'ACADEMIC_ADMIN', 'LIBRARY_ADMIN', 'STORE_ADMIN'].includes(user.role);
    if (!isAdmin) {
      throw new ForbiddenException('Admin access required');
    }

    return this.libraryService.deleteBookOrder(id);
  }

  // Statistics Query (Admin only)
  @Query(() => LibraryStatsResponse)
  @UseGuards(JwtAuthGuard)
  async libraryStats(
    @CurrentUser() user: User,
  ): Promise<LibraryStatsResponse> {
    const isAdmin = ['SUPER_ADMIN', 'ACADEMIC_ADMIN', 'LIBRARY_ADMIN', 'STORE_ADMIN'].includes(user.role);
    if (!isAdmin) {
      throw new ForbiddenException('Admin access required');
    }

    const stats = await this.libraryService.getLibraryStats();

    return {
      totalBooks: stats.totalBooks,
      totalCopies: stats.totalCopies,
      availableCopies: stats.availableCopies,
      borrowedCopies: stats.borrowedCopies,
      pendingOrders: stats.pendingOrders,
      approvedOrders: stats.approvedOrders,
      rejectedOrders: stats.rejectedOrders,
    };
  }
} 