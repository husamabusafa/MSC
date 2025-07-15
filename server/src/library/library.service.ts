import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Book, BookOrder, User, Prisma } from '@prisma/client';
import { 
  CreateBookInput, 
  UpdateBookInput, 
  BooksFilterInput,
  CreateBookOrderInput,
  UpdateBookOrderInput,
  BookOrdersFilterInput,
  BookOrderStatus
} from './dto/library.dto';

@Injectable()
export class LibraryService {
  constructor(private readonly prisma: PrismaService) {}

  // Helper function to generate slug from title
  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  // Helper function to ensure unique slug
  private async generateUniqueSlug(baseSlug: string, excludeId?: string): Promise<string> {
    let slug = baseSlug;
    let counter = 1;

    while (true) {
      const existingBook = await this.prisma.book.findUnique({
        where: { slug },
      });

      if (!existingBook || (excludeId && existingBook.id === excludeId)) {
        return slug;
      }

      slug = `${baseSlug}-${counter}`;
      counter++;
    }
  }

  // Book Management Methods
  async createBook(createBookInput: CreateBookInput): Promise<Book> {
    const { title, author, coverImage, description, totalCopies, availableCopies, isVisible } = createBookInput;

    // Generate unique slug
    const baseSlug = this.generateSlug(title);
    const uniqueSlug = await this.generateUniqueSlug(baseSlug);

    // Validate that availableCopies doesn't exceed totalCopies
    if (availableCopies > totalCopies) {
      throw new BadRequestException('Available copies cannot exceed total copies');
    }

    return this.prisma.book.create({
      data: {
        title,
        slug: uniqueSlug,
        author,
        coverImage,
        description,
        totalCopies,
        availableCopies,
        isVisible,
      },
    });
  }

  async updateBook(id: string, updateBookInput: UpdateBookInput): Promise<Book> {
    const book = await this.prisma.book.findUnique({
      where: { id },
    });

    if (!book) {
      throw new NotFoundException('Book not found');
    }

    const { title, author, coverImage, description, totalCopies, availableCopies, isVisible } = updateBookInput;

    // Generate new slug if title is being updated
    let slug = book.slug;
    if (title && title !== book.title) {
      const baseSlug = this.generateSlug(title);
      slug = await this.generateUniqueSlug(baseSlug, id);
    }

    // Validate that availableCopies doesn't exceed totalCopies
    const newTotalCopies = totalCopies ?? book.totalCopies;
    const newAvailableCopies = availableCopies ?? book.availableCopies;
    
    if (newAvailableCopies > newTotalCopies) {
      throw new BadRequestException('Available copies cannot exceed total copies');
    }

    // Check if we're reducing total copies below borrowed copies
    const borrowedCopies = newTotalCopies - newAvailableCopies;
    if (totalCopies && totalCopies < borrowedCopies) {
      throw new BadRequestException('Cannot reduce total copies below currently borrowed copies');
    }

    return this.prisma.book.update({
      where: { id },
      data: {
        title,
        slug,
        author,
        coverImage,
        description,
        totalCopies,
        availableCopies,
        isVisible,
      },
    });
  }

  async deleteBook(id: string): Promise<boolean> {
    const book = await this.prisma.book.findUnique({
      where: { id },
      include: {
        bookOrders: {
          where: {
            status: {
              in: ['PENDING', 'APPROVED', 'BORROWED'],
            },
          },
        },
      },
    });

    if (!book) {
      throw new NotFoundException('Book not found');
    }

    // Check if there are active book orders
    if (book.bookOrders.length > 0) {
      throw new BadRequestException('Cannot delete book with active orders');
    }

    await this.prisma.book.delete({
      where: { id },
    });

    return true;
  }

  async getBookById(id: string): Promise<any> {
    return this.prisma.book.findUnique({
      where: { id },
      include: {
        bookOrders: {
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
        },
      },
    });
  }

  async getBooksWithFilters(filters: BooksFilterInput): Promise<{ books: any[]; total: number }> {
    const { search, isVisible, isAvailable } = filters;

    const where: Prisma.BookWhereInput = {};

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { author: { contains: search } },
        { description: { contains: search } },
      ];
    }

    if (isVisible !== undefined) {
      where.isVisible = isVisible;
    }

    if (isAvailable !== undefined) {
      if (isAvailable) {
        where.availableCopies = { gt: 0 };
      } else {
        where.availableCopies = { lte: 0 };
      }
    }

    const [books, total] = await Promise.all([
      this.prisma.book.findMany({
        where,
        include: {
          bookOrders: {
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
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.book.count({ where }),
    ]);

    return { books, total };
  }

  async getAllBooks(): Promise<Book[]> {
    return this.prisma.book.findMany({
      include: {
        bookOrders: {
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
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Book Order Management Methods
  async createBookOrder(studentId: string, createBookOrderInput: CreateBookOrderInput): Promise<BookOrder> {
    const { bookId, studentNotes } = createBookOrderInput;

    // Check if book exists and is available
    const book = await this.prisma.book.findUnique({
      where: { id: bookId },
    });

    if (!book) {
      throw new NotFoundException('Book not found');
    }

    if (!book.isVisible) {
      throw new BadRequestException('Book is not available for borrowing');
    }

    if (book.availableCopies <= 0) {
      throw new BadRequestException('No copies available');
    }

    // Check if student already has a pending or active order for this book
    const existingOrder = await this.prisma.bookOrder.findFirst({
      where: {
        studentId,
        bookId,
        status: {
          in: ['PENDING', 'APPROVED', 'BORROWED'],
        },
      },
    });

    if (existingOrder) {
      throw new ConflictException('You already have an active order for this book');
    }

    return this.prisma.bookOrder.create({
      data: {
        studentId,
        bookId,
        studentNotes,
        status: 'PENDING',
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            universityId: true,
          },
        },
        book: true,
      },
    });
  }

  async updateBookOrder(id: string, updateBookOrderInput: UpdateBookOrderInput): Promise<BookOrder> {
    const bookOrder = await this.prisma.bookOrder.findUnique({
      where: { id },
      include: {
        book: true,
      },
    });

    if (!bookOrder) {
      throw new NotFoundException('Book order not found');
    }

    const { status, studentNotes, adminNotes } = updateBookOrderInput;

    // Handle status transitions and inventory management
    if (status && status !== bookOrder.status) {
      await this.handleStatusTransition(bookOrder, status);
    }

    return this.prisma.bookOrder.update({
      where: { id },
      data: {
        status,
        studentNotes,
        adminNotes,
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            universityId: true,
          },
        },
        book: true,
      },
    });
  }

  private async handleStatusTransition(bookOrder: BookOrder & { book: Book }, newStatus: BookOrderStatus): Promise<void> {
    const { book } = bookOrder;

    // Handle inventory changes based on status transitions
    if (bookOrder.status === 'APPROVED' && newStatus === 'BORROWED') {
      // Book is being borrowed - reduce available copies
      if (book.availableCopies <= 0) {
        throw new BadRequestException('No copies available to borrow');
      }
      
      await this.prisma.book.update({
        where: { id: book.id },
        data: {
          availableCopies: book.availableCopies - 1,
        },
      });
    } else if (bookOrder.status === 'BORROWED' && newStatus === 'RETURNED') {
      // Book is being returned - increase available copies
      await this.prisma.book.update({
        where: { id: book.id },
        data: {
          availableCopies: book.availableCopies + 1,
        },
      });
    } else if (bookOrder.status === 'BORROWED' && newStatus === 'REJECTED') {
      // Book order is being rejected after borrowing - increase available copies
      await this.prisma.book.update({
        where: { id: book.id },
        data: {
          availableCopies: book.availableCopies + 1,
        },
      });
    }
  }

  async deleteBookOrder(id: string): Promise<boolean> {
    const bookOrder = await this.prisma.bookOrder.findUnique({
      where: { id },
      include: {
        book: true,
      },
    });

    if (!bookOrder) {
      throw new NotFoundException('Book order not found');
    }

    // If book is borrowed, return it to inventory
    if (bookOrder.status === 'BORROWED') {
      await this.prisma.book.update({
        where: { id: bookOrder.bookId },
        data: {
          availableCopies: bookOrder.book.availableCopies + 1,
        },
      });
    }

    await this.prisma.bookOrder.delete({
      where: { id },
    });

    return true;
  }

  async getBookOrderById(id: string): Promise<BookOrder | null> {
    return this.prisma.bookOrder.findUnique({
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
        book: true,
      },
    });
  }

  async getBookOrdersWithFilters(filters: BookOrdersFilterInput): Promise<{ bookOrders: any[]; total: number }> {
    const { search, status, studentId, bookId } = filters;

    const where: Prisma.BookOrderWhereInput = {};

    if (search) {
      where.OR = [
        { student: { name: { contains: search } } },
        { student: { email: { contains: search } } },
        { student: { universityId: { contains: search } } },
        { book: { title: { contains: search } } },
        { book: { author: { contains: search } } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (studentId) {
      where.studentId = studentId;
    }

    if (bookId) {
      where.bookId = bookId;
    }

    const [bookOrders, total] = await Promise.all([
      this.prisma.bookOrder.findMany({
        where,
        include: {
          student: {
            select: {
              id: true,
              name: true,
              email: true,
              universityId: true,
            },
          },
          book: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.bookOrder.count({ where }),
    ]);

    return { bookOrders, total };
  }

  async getStudentBookOrders(studentId: string): Promise<any[]> {
    return this.prisma.bookOrder.findMany({
      where: { studentId },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            universityId: true,
          },
        },
        book: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Statistics Methods
  async getLibraryStats(): Promise<{
    totalBooks: number;
    totalCopies: number;
    availableCopies: number;
    borrowedCopies: number;
    pendingOrders: number;
    approvedOrders: number;
    rejectedOrders: number;
  }> {
    const [
      booksData,
      pendingOrders,
      approvedOrders,
      rejectedOrders,
    ] = await Promise.all([
      this.prisma.book.aggregate({
        _count: { id: true },
        _sum: { 
          totalCopies: true,
          availableCopies: true,
        },
      }),
      this.prisma.bookOrder.count({ where: { status: 'PENDING' } }),
      this.prisma.bookOrder.count({ where: { status: 'APPROVED' } }),
      this.prisma.bookOrder.count({ where: { status: 'REJECTED' } }),
    ]);

    const totalBooks = booksData._count.id;
    const totalCopies = booksData._sum.totalCopies || 0;
    const availableCopies = booksData._sum.availableCopies || 0;
    const borrowedCopies = totalCopies - availableCopies;

    return {
      totalBooks,
      totalCopies,
      availableCopies,
      borrowedCopies,
      pendingOrders,
      approvedOrders,
      rejectedOrders,
    };
  }
} 