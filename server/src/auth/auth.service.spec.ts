import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { LoginInput, RegisterInput } from './dto/auth.dto';
import { User, PreRegisteredStudent } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

jest.mock('bcryptjs');

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;

  const mockUser: User = {
    id: '1',
    email: 'test@example.com',
    password: 'hashedPassword',
    name: 'Test User',
    role: "STUDENT",
    universityId: '12345',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPreRegisteredStudent: PreRegisteredStudent = {
    id: '1',
    fullName: 'Test Student',
    universityId: '12345',
    isUsed: false,
    createdAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findByEmail: jest.fn(),
            findById: jest.fn(),
            create: jest.fn(),
            findPreRegisteredStudent: jest.fn(),
            markPreRegisteredStudentAsUsed: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
    jwtService = module.get(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateUser', () => {
    it('should validate user with correct credentials', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser('test@example.com', 'password');

      expect(result).toEqual(mockUser);
      expect(usersService.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(bcrypt.compare).toHaveBeenCalledWith('password', 'hashedPassword');
    });

    it('should return null for non-existent user', async () => {
      usersService.findByEmail.mockResolvedValue(null);

      const result = await service.validateUser('nonexistent@example.com', 'password');

      expect(result).toBeNull();
      expect(usersService.findByEmail).toHaveBeenCalledWith('nonexistent@example.com');
    });

    it('should return null for incorrect password', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.validateUser('test@example.com', 'wrongpassword');

      expect(result).toBeNull();
      expect(bcrypt.compare).toHaveBeenCalledWith('wrongpassword', 'hashedPassword');
    });
  });

  describe('login', () => {
    const loginInput: LoginInput = {
      email: 'test@example.com',
      password: 'password',
    };

    it('should login successfully with valid credentials', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jwtService.sign.mockReturnValue('jwt-token');

      const result = await service.login(loginInput);

      expect(result).toEqual({
        accessToken: 'jwt-token',
        user: {
          id: mockUser.id,
          email: mockUser.email,
          name: mockUser.name,
          role: mockUser.role,
          universityId: mockUser.universityId,
          isActive: mockUser.isActive,
          createdAt: mockUser.createdAt.toISOString(),
        },
      });
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
      });
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      usersService.findByEmail.mockResolvedValue(null);

      await expect(service.login(loginInput)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for inactive user', async () => {
      const inactiveUser = { ...mockUser, isActive: false };
      usersService.findByEmail.mockResolvedValue(inactiveUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      await expect(service.login(loginInput)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('register', () => {
    const registerInput: RegisterInput = {
      email: 'new@example.com',
      password: 'password123',
      name: 'New User',
      universityId: '12345',
    };

    it('should register successfully with valid data', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      usersService.findPreRegisteredStudent.mockResolvedValue(mockPreRegisteredStudent);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      usersService.create.mockResolvedValue(mockUser);
      usersService.markPreRegisteredStudentAsUsed.mockResolvedValue({
        ...mockPreRegisteredStudent,
        isUsed: true,
      });
      jwtService.sign.mockReturnValue('jwt-token');

      const result = await service.register(registerInput);

      expect(result).toEqual({
        accessToken: 'jwt-token',
        user: {
          id: mockUser.id,
          email: mockUser.email,
          name: mockUser.name,
          role: mockUser.role,
          universityId: mockUser.universityId,
          isActive: mockUser.isActive,
          createdAt: mockUser.createdAt.toISOString(),
        },
      });
      expect(usersService.create).toHaveBeenCalledWith({
        email: registerInput.email,
        password: 'hashedPassword',
        name: registerInput.name,
        universityId: registerInput.universityId,
        role: 'STUDENT',
      });
      expect(usersService.markPreRegisteredStudentAsUsed).toHaveBeenCalledWith(
        registerInput.universityId,
      );
    });

    it('should throw ConflictException for existing email', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser);

      await expect(service.register(registerInput)).rejects.toThrow(ConflictException);
    });

    it('should throw UnauthorizedException for invalid university ID', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      usersService.findPreRegisteredStudent.mockResolvedValue(null);

      await expect(service.register(registerInput)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw ConflictException for already used university ID', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      usersService.findPreRegisteredStudent.mockResolvedValue({
        ...mockPreRegisteredStudent,
        isUsed: true,
      });

      await expect(service.register(registerInput)).rejects.toThrow(ConflictException);
    });

    it('should register without university ID', async () => {
      const registerInputWithoutId = {
        ...registerInput,
        universityId: undefined,
      };
      usersService.findByEmail.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      usersService.create.mockResolvedValue(mockUser);
      jwtService.sign.mockReturnValue('jwt-token');

      const result = await service.register(registerInputWithoutId);

      expect(result).toBeDefined();
      expect(usersService.findPreRegisteredStudent).not.toHaveBeenCalled();
      expect(usersService.markPreRegisteredStudentAsUsed).not.toHaveBeenCalled();
    });
  });

  describe('getCurrentUser', () => {
    it('should return user by ID', async () => {
      usersService.findById.mockResolvedValue(mockUser);

      const result = await service.getCurrentUser('1');

      expect(result).toEqual(mockUser);
      expect(usersService.findById).toHaveBeenCalledWith('1');
    });

    it('should return null for non-existent user', async () => {
      usersService.findById.mockResolvedValue(null);

      const result = await service.getCurrentUser('nonexistent');

      expect(result).toBeNull();
    });
  });
}); 