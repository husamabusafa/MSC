import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { LoginInput, RegisterInput, AuthResponse } from './dto/auth.dto';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
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

    // Check if university ID is provided and if it's pre-registered
    if (universityId) {
      const preRegistered = await this.usersService.findPreRegisteredStudent(universityId);
      if (!preRegistered) {
        throw new UnauthorizedException('University ID not found in pre-registered students');
      }
      if (preRegistered.isUsed) {
        throw new ConflictException('University ID has already been used');
      }
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

    // Mark pre-registered student as used if applicable
    if (universityId) {
      await this.usersService.markPreRegisteredStudentAsUsed(universityId);
    }

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

  async getCurrentUser(userId: string): Promise<User | null> {
    return this.usersService.findById(userId);
  }
} 