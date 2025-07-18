import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../prisma/prisma.service';
import { 
  LoginInput, 
  RegisterInput, 
  AuthResponse, 
  CreateRegistrationRequestInput, 
  ApproveRegistrationRequestInput, 
  RejectRegistrationRequestInput,
  RegistrationRequestResponse,
  RegistrationRequestSubmissionResponse
} from './dto/auth.dto';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.usersService.findByEmail(email);
    if (!user) return null;

    const isPasswordValid = await compare(password, user.password);
    if (!isPasswordValid) return null;

    return user;
  }

  async login(loginInput: LoginInput): Promise<AuthResponse> {
    const { email, password } = loginInput;
    
    const user = await this.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        universityId: user.universityId,
        isActive: user.isActive,
        createdAt: user.createdAt.toISOString(),
      },
    };
  }

  async register(registerInput: RegisterInput): Promise<AuthResponse> {
    const { email, password, name, universityId } = registerInput;

    // Check if user already exists
    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }



    // Hash password
    const hashedPassword = await hash(password, 10);

    // Create user
    const user = await this.usersService.create({
      email,
      password: hashedPassword,
      name,
      universityId,
      role: 'STUDENT',
    });



    // Generate JWT token
    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        universityId: user.universityId,
        isActive: user.isActive,
        createdAt: user.createdAt.toISOString(),
      },
    };
  }

  async createRegistrationRequest(input: CreateRegistrationRequestInput): Promise<RegistrationRequestSubmissionResponse> {
    const { email, password, name, universityId } = input;

    // Check if user already exists
    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Check if there's already a pending request for this email
    const existingRequest = await this.prisma.registrationRequest.findUnique({
      where: { email },
    });
    if (existingRequest) {
      if (existingRequest.status === 'PENDING') {
        throw new ConflictException('A registration request for this email is already pending approval');
      }
      // If the previous request was rejected, allow a new one
      if (existingRequest.status === 'REJECTED') {
        await this.prisma.registrationRequest.delete({
          where: { id: existingRequest.id },
        });
      }
    }

    // Hash password
    const hashedPassword = await hash(password, 10);

    // Create registration request
    await this.prisma.registrationRequest.create({
      data: {
        email,
        password: hashedPassword,
        name,
        universityId,
        status: 'PENDING',
      },
    });

    return {
      message: 'Registration request submitted successfully. Please wait for admin approval.',
      success: true,
    };
  }

  async getAllRegistrationRequests(): Promise<RegistrationRequestResponse[]> {
    const requests = await this.prisma.registrationRequest.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return requests.map(request => ({
      id: request.id,
      email: request.email,
      name: request.name,
      universityId: request.universityId,
      status: request.status,
      adminNotes: request.adminNotes,
      createdAt: request.createdAt.toISOString(),
      updatedAt: request.updatedAt.toISOString(),
    }));
  }

  async getRegistrationRequestsCount(): Promise<{ pending: number; total: number }> {
    const [pending, total] = await Promise.all([
      this.prisma.registrationRequest.count({
        where: { status: 'PENDING' },
      }),
      this.prisma.registrationRequest.count(),
    ]);

    return { pending, total };
  }

  async approveRegistrationRequest(input: ApproveRegistrationRequestInput): Promise<RegistrationRequestResponse> {
    const { requestId, adminNotes } = input;

    const request = await this.prisma.registrationRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      throw new BadRequestException('Registration request not found');
    }

    if (request.status !== 'PENDING') {
      throw new BadRequestException('Registration request has already been processed');
    }

    // Check if user with this email doesn't exist (in case admin approved elsewhere)
    const existingUser = await this.usersService.findByEmail(request.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Create user
    const user = await this.usersService.create({
      email: request.email,
      password: request.password, // Already hashed
      name: request.name,
      universityId: request.universityId,
      role: 'STUDENT',
    });

    // Update registration request status
    const updatedRequest = await this.prisma.registrationRequest.update({
      where: { id: requestId },
      data: {
        status: 'APPROVED',
        adminNotes,
      },
    });

    return {
      id: updatedRequest.id,
      email: updatedRequest.email,
      name: updatedRequest.name,
      universityId: updatedRequest.universityId,
      status: updatedRequest.status,
      adminNotes: updatedRequest.adminNotes,
      createdAt: updatedRequest.createdAt.toISOString(),
      updatedAt: updatedRequest.updatedAt.toISOString(),
    };
  }

  async rejectRegistrationRequest(input: RejectRegistrationRequestInput): Promise<RegistrationRequestResponse> {
    const { requestId, adminNotes } = input;

    const request = await this.prisma.registrationRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      throw new BadRequestException('Registration request not found');
    }

    if (request.status !== 'PENDING') {
      throw new BadRequestException('Registration request has already been processed');
    }

    // Update registration request status
    const updatedRequest = await this.prisma.registrationRequest.update({
      where: { id: requestId },
      data: {
        status: 'REJECTED',
        adminNotes,
      },
    });

    return {
      id: updatedRequest.id,
      email: updatedRequest.email,
      name: updatedRequest.name,
      universityId: updatedRequest.universityId,
      status: updatedRequest.status,
      adminNotes: updatedRequest.adminNotes,
      createdAt: updatedRequest.createdAt.toISOString(),
      updatedAt: updatedRequest.updatedAt.toISOString(),
    };
  }

  async getCurrentUser(userId: string): Promise<User | null> {
    return this.usersService.findById(userId);
  }
} 