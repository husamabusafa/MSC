import { Resolver, Mutation, Args, Query, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { 
  LoginInput, 
  RegisterInput, 
  AuthResponse, 
  AuthUserResponse, 
  CreateRegistrationRequestInput, 
  ApproveRegistrationRequestInput, 
  RejectRegistrationRequestInput,
  RegistrationRequestResponse,
  RegistrationRequestSubmissionResponse,
  RegistrationRequestsCountResponse
} from './dto/auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { User } from '@prisma/client';
import { ForbiddenException } from '@nestjs/common';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => AuthResponse)
  async login(@Args('loginInput') loginInput: LoginInput): Promise<AuthResponse> {
    return this.authService.login(loginInput);
  }

  @Mutation(() => AuthResponse)
  async register(@Args('registerInput') registerInput: RegisterInput): Promise<AuthResponse> {
    return this.authService.register(registerInput);
  }

  @Mutation(() => RegistrationRequestSubmissionResponse)
  async createRegistrationRequest(
    @Args('input') input: CreateRegistrationRequestInput
  ): Promise<RegistrationRequestSubmissionResponse> {
    return this.authService.createRegistrationRequest(input);
  }

  @Query(() => [RegistrationRequestResponse])
  @UseGuards(JwtAuthGuard)
  async getAllRegistrationRequests(@CurrentUser() user: User): Promise<RegistrationRequestResponse[]> {
    const isAdmin = ['SUPER_ADMIN', 'ACADEMIC_ADMIN', 'LIBRARY_ADMIN', 'STORE_ADMIN'].includes(user.role);
    if (!isAdmin) {
      throw new ForbiddenException('Admin access required');
    }
    return this.authService.getAllRegistrationRequests();
  }

  @Query(() => RegistrationRequestsCountResponse)
  @UseGuards(JwtAuthGuard)
  async registrationRequestsCount(@CurrentUser() user: User): Promise<RegistrationRequestsCountResponse> {
    const isAdmin = ['SUPER_ADMIN', 'ACADEMIC_ADMIN', 'LIBRARY_ADMIN', 'STORE_ADMIN'].includes(user.role);
    if (!isAdmin) {
      throw new ForbiddenException('Admin access required');
    }
    return this.authService.getRegistrationRequestsCount();
  }

  @Mutation(() => RegistrationRequestResponse)
  @UseGuards(JwtAuthGuard)
  async approveRegistrationRequest(
    @Args('input') input: ApproveRegistrationRequestInput,
    @CurrentUser() user: User
  ): Promise<RegistrationRequestResponse> {
    const isAdmin = ['SUPER_ADMIN', 'ACADEMIC_ADMIN', 'LIBRARY_ADMIN', 'STORE_ADMIN'].includes(user.role);
    if (!isAdmin) {
      throw new ForbiddenException('Admin access required');
    }
    return this.authService.approveRegistrationRequest(input);
  }

  @Mutation(() => RegistrationRequestResponse)
  @UseGuards(JwtAuthGuard)
  async rejectRegistrationRequest(
    @Args('input') input: RejectRegistrationRequestInput,
    @CurrentUser() user: User
  ): Promise<RegistrationRequestResponse> {
    const isAdmin = ['SUPER_ADMIN', 'ACADEMIC_ADMIN', 'LIBRARY_ADMIN', 'STORE_ADMIN'].includes(user.role);
    if (!isAdmin) {
      throw new ForbiddenException('Admin access required');
    }
    return this.authService.rejectRegistrationRequest(input);
  }

  @Query(() => AuthUserResponse)
  @UseGuards(JwtAuthGuard)
  async me(@CurrentUser() user: User): Promise<AuthUserResponse> {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      universityId: user.universityId,
      isActive: user.isActive,
      createdAt: user.createdAt.toISOString(),
    };
  }
} 