import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User, Prisma } from '@prisma/client';
import { hash } from 'bcryptjs';
import { 
  CreateUserInput, 
  UpdateUserInput, 
  UpdateProfileInput, 
  UsersFilterInput
} from './dto/user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  // Existing methods
  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async create(data: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.create({
      data,
    });
  }

  async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }



  async findAllUsers(): Promise<User[]> {
    return this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async deactivateUser(id: string): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async activateUser(id: string): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data: { isActive: true },
    });
  }

  // Enhanced user management methods
  async createUser(createUserInput: CreateUserInput): Promise<User> {
    const { email, password, name, universityId, role, isActive } = createUserInput;

    // Check if user already exists
    const existingUser = await this.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }



    // Hash password
    const hashedPassword = await hash(password, 10);

    // Create user
    const user = await this.create({
      email,
      password: hashedPassword,
      name,
      universityId,
      role,
      isActive,
    });



    return user;
  }

  async updateUser(id: string, updateUserInput: UpdateUserInput): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { email, password, name, universityId, role, isActive } = updateUserInput;

    // Check if email is being changed and if it's already taken
    if (email && email !== user.email) {
      const existingUser = await this.findByEmail(email);
      if (existingUser) {
        throw new ConflictException('Email is already taken');
      }
    }



    // Hash password if provided
    const hashedPassword = password ? await hash(password, 10) : undefined;

    const updatedUser = await this.update(id, {
      email,
      password: hashedPassword,
      name,
      universityId,
      role,
      isActive,
    });



    return updatedUser;
  }

  async deleteUser(id: string): Promise<boolean> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.prisma.user.delete({
      where: { id },
    });

    return true;
  }

  async getUsersWithFilters(filters: UsersFilterInput): Promise<{ users: User[]; total: number }> {
    const { search, role, isActive } = filters;

    const where: Prisma.UserWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { universityId: { contains: search } },
      ];
    }

    if (role) {
      where.role = role;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return { users, total };
  }

  async updateProfile(userId: string, updateProfileInput: UpdateProfileInput): Promise<User> {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { email, password, name } = updateProfileInput;

    // Check if email is being changed and if it's already taken
    if (email && email !== user.email) {
      const existingUser = await this.findByEmail(email);
      if (existingUser) {
        throw new ConflictException('Email is already taken');
      }
    }

    // Hash password if provided
    const hashedPassword = password ? await hash(password, 10) : undefined;

    return this.update(userId, {
      email,
      password: hashedPassword,
      name,
    });
  }


} 