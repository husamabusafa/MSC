import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User, PreRegisteredStudent, Prisma } from '@prisma/client';
import { hash } from 'bcryptjs';
import { 
  CreateUserInput, 
  UpdateUserInput, 
  UpdateProfileInput, 
  UsersFilterInput,
  CreatePreRegisteredStudentInput,
  UpdatePreRegisteredStudentInput,
  PreRegisteredStudentsFilterInput
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

  async findPreRegisteredStudent(universityId: string): Promise<PreRegisteredStudent | null> {
    return this.prisma.preRegisteredStudent.findUnique({
      where: { universityId },
    });
  }

  async markPreRegisteredStudentAsUsed(universityId: string): Promise<PreRegisteredStudent> {
    return this.prisma.preRegisteredStudent.update({
      where: { universityId },
      data: { isUsed: true },
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

    // Check if university ID is provided and if it's pre-registered (for students)
    if (universityId && role === 'STUDENT') {
      const preRegistered = await this.findPreRegisteredStudent(universityId);
      if (!preRegistered) {
        throw new BadRequestException('University ID not found in pre-registered students');
      }
      if (preRegistered.isUsed) {
        throw new ConflictException('University ID has already been used');
      }
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

    // Mark pre-registered student as used if applicable
    if (universityId && role === 'STUDENT') {
      await this.markPreRegisteredStudentAsUsed(universityId);
    }

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

    // Check university ID constraints if being updated
    if (universityId && universityId !== user.universityId) {
      const preRegistered = await this.findPreRegisteredStudent(universityId);
      if (!preRegistered) {
        throw new BadRequestException('University ID not found in pre-registered students');
      }
      if (preRegistered.isUsed) {
        throw new ConflictException('University ID has already been used');
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

    // Mark pre-registered student as used if university ID was changed
    if (universityId && universityId !== user.universityId) {
      await this.markPreRegisteredStudentAsUsed(universityId);
    }

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

  // Pre-registered student management methods
  async createPreRegisteredStudent(createInput: CreatePreRegisteredStudentInput): Promise<PreRegisteredStudent> {
    const { fullName, universityId } = createInput;

    // Check if university ID already exists
    const existing = await this.findPreRegisteredStudent(universityId);
    if (existing) {
      throw new ConflictException('University ID already exists');
    }

    return this.prisma.preRegisteredStudent.create({
      data: {
        fullName,
        universityId,
      },
    });
  }

  async updatePreRegisteredStudent(id: string, updateInput: UpdatePreRegisteredStudentInput): Promise<PreRegisteredStudent> {
    const student = await this.prisma.preRegisteredStudent.findUnique({
      where: { id },
    });

    if (!student) {
      throw new NotFoundException('Pre-registered student not found');
    }

    const { fullName, universityId } = updateInput;

    // Check if university ID is being changed and if it's already taken
    if (universityId && universityId !== student.universityId) {
      const existing = await this.findPreRegisteredStudent(universityId);
      if (existing) {
        throw new ConflictException('University ID already exists');
      }
    }

    return this.prisma.preRegisteredStudent.update({
      where: { id },
      data: {
        fullName,
        universityId,
      },
    });
  }

  async deletePreRegisteredStudent(id: string): Promise<boolean> {
    const student = await this.prisma.preRegisteredStudent.findUnique({
      where: { id },
    });

    if (!student) {
      throw new NotFoundException('Pre-registered student not found');
    }

    await this.prisma.preRegisteredStudent.delete({
      where: { id },
    });

    return true;
  }

  async getPreRegisteredStudentsWithFilters(filters: PreRegisteredStudentsFilterInput): Promise<{ preRegisteredStudents: PreRegisteredStudent[]; total: number }> {
    const { search, isUsed } = filters;

    const where: Prisma.PreRegisteredStudentWhereInput = {};

    if (search) {
      where.OR = [
        { fullName: { contains: search } },
        { universityId: { contains: search } },
      ];
    }

    if (isUsed !== undefined) {
      where.isUsed = isUsed;
    }

    const [preRegisteredStudents, total] = await Promise.all([
      this.prisma.preRegisteredStudent.findMany({
        where,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.preRegisteredStudent.count({ where }),
    ]);

    return { preRegisteredStudents, total };
  }

  async getPreRegisteredStudentById(id: string): Promise<PreRegisteredStudent | null> {
    return this.prisma.preRegisteredStudent.findUnique({
      where: { id },
    });
  }

  async getAllPreRegisteredStudents(): Promise<PreRegisteredStudent[]> {
    return this.prisma.preRegisteredStudent.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }
} 