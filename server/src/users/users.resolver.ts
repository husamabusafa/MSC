import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards, ForbiddenException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '@prisma/client';
import { UsersService } from './users.service';
import {
  CreateUserInput,
  UpdateUserInput,
  UpdateProfileInput,
  UsersFilterInput,
  UserResponse,
  UsersResponse,
} from './dto/user.dto';

@Resolver()
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  // User management queries (Admin only)
  @Query(() => UsersResponse)
  @UseGuards(JwtAuthGuard)
  async users(
    @Args('filters', { type: () => UsersFilterInput, nullable: true }) filters: UsersFilterInput = {},
    @CurrentUser() user: User,
  ): Promise<UsersResponse> {
    const isAdmin = ['SUPER_ADMIN', 'ACADEMIC_ADMIN', 'LIBRARY_ADMIN', 'STORE_ADMIN'].includes(user.role);
    if (!isAdmin) {
      throw new ForbiddenException('Admin access required');
    }

    const { users, total } = await this.usersService.getUsersWithFilters(filters);

    return {
      users: users.map(u => ({
        id: u.id,
        email: u.email,
        name: u.name,
        role: u.role,
        universityId: u.universityId,
        isActive: u.isActive,
        createdAt: u.createdAt.toISOString(),
        updatedAt: u.updatedAt.toISOString(),
      })),
      total,
    };
  }

  @Query(() => UserResponse)
  @UseGuards(JwtAuthGuard)
  async user(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: User,
  ): Promise<UserResponse> {
    const isAdmin = ['SUPER_ADMIN', 'ACADEMIC_ADMIN', 'LIBRARY_ADMIN', 'STORE_ADMIN'].includes(user.role);
    if (!isAdmin) {
      throw new ForbiddenException('Admin access required');
    }

    const foundUser = await this.usersService.findById(id);
    if (!foundUser) {
      throw new Error('User not found');
    }

    return {
      id: foundUser.id,
      email: foundUser.email,
      name: foundUser.name,
      role: foundUser.role,
      universityId: foundUser.universityId,
      isActive: foundUser.isActive,
      createdAt: foundUser.createdAt.toISOString(),
      updatedAt: foundUser.updatedAt.toISOString(),
    };
  }

  // User management mutations (Admin only)
  @Mutation(() => UserResponse)
  @UseGuards(JwtAuthGuard)
  async createUser(
    @Args('createUserInput') createUserInput: CreateUserInput,
    @CurrentUser() user: User,
  ): Promise<UserResponse> {
    const isAdmin = ['SUPER_ADMIN', 'ACADEMIC_ADMIN', 'LIBRARY_ADMIN', 'STORE_ADMIN'].includes(user.role);
    if (!isAdmin) {
      throw new ForbiddenException('Admin access required');
    }

    const newUser = await this.usersService.createUser(createUserInput);

    return {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      universityId: newUser.universityId,
      isActive: newUser.isActive,
      createdAt: newUser.createdAt.toISOString(),
      updatedAt: newUser.updatedAt.toISOString(),
    };
  }

  @Mutation(() => UserResponse)
  @UseGuards(JwtAuthGuard)
  async updateUser(
    @Args('id', { type: () => ID }) id: string,
    @Args('updateUserInput') updateUserInput: UpdateUserInput,
    @CurrentUser() user: User,
  ): Promise<UserResponse> {
    const isAdmin = ['SUPER_ADMIN', 'ACADEMIC_ADMIN', 'LIBRARY_ADMIN', 'STORE_ADMIN'].includes(user.role);
    if (!isAdmin) {
      throw new ForbiddenException('Admin access required');
    }

    const updatedUser = await this.usersService.updateUser(id, updateUserInput);

    return {
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      role: updatedUser.role,
      universityId: updatedUser.universityId,
      isActive: updatedUser.isActive,
      createdAt: updatedUser.createdAt.toISOString(),
      updatedAt: updatedUser.updatedAt.toISOString(),
    };
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async deleteUser(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: User,
  ): Promise<boolean> {
    const isAdmin = ['SUPER_ADMIN', 'ACADEMIC_ADMIN', 'LIBRARY_ADMIN', 'STORE_ADMIN'].includes(user.role);
    if (!isAdmin) {
      throw new ForbiddenException('Admin access required');
    }

    // Prevent admin from deleting themselves
    if (user.id === id) {
      throw new ForbiddenException('Cannot delete your own account');
    }

    return this.usersService.deleteUser(id);
  }

  @Mutation(() => UserResponse)
  @UseGuards(JwtAuthGuard)
  async activateUser(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: User,
  ): Promise<UserResponse> {
    const isAdmin = ['SUPER_ADMIN', 'ACADEMIC_ADMIN', 'LIBRARY_ADMIN', 'STORE_ADMIN'].includes(user.role);
    if (!isAdmin) {
      throw new ForbiddenException('Admin access required');
    }

    const activatedUser = await this.usersService.activateUser(id);

    return {
      id: activatedUser.id,
      email: activatedUser.email,
      name: activatedUser.name,
      role: activatedUser.role,
      universityId: activatedUser.universityId,
      isActive: activatedUser.isActive,
      createdAt: activatedUser.createdAt.toISOString(),
      updatedAt: activatedUser.updatedAt.toISOString(),
    };
  }

  @Mutation(() => UserResponse)
  @UseGuards(JwtAuthGuard)
  async deactivateUser(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: User,
  ): Promise<UserResponse> {
    const isAdmin = ['SUPER_ADMIN', 'ACADEMIC_ADMIN', 'LIBRARY_ADMIN', 'STORE_ADMIN'].includes(user.role);
    if (!isAdmin) {
      throw new ForbiddenException('Admin access required');
    }

    // Prevent admin from deactivating themselves
    if (user.id === id) {
      throw new ForbiddenException('Cannot deactivate your own account');
    }

    const deactivatedUser = await this.usersService.deactivateUser(id);

    return {
      id: deactivatedUser.id,
      email: deactivatedUser.email,
      name: deactivatedUser.name,
      role: deactivatedUser.role,
      universityId: deactivatedUser.universityId,
      isActive: deactivatedUser.isActive,
      createdAt: deactivatedUser.createdAt.toISOString(),
      updatedAt: deactivatedUser.updatedAt.toISOString(),
    };
  }

  // Profile management (Students can update their own profile)
  @Mutation(() => UserResponse)
  @UseGuards(JwtAuthGuard)
  async updateProfile(
    @Args('updateProfileInput') updateProfileInput: UpdateProfileInput,
    @CurrentUser() user: User,
  ): Promise<UserResponse> {
    const updatedUser = await this.usersService.updateProfile(user.id, updateProfileInput);

    return {
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      role: updatedUser.role,
      universityId: updatedUser.universityId,
      isActive: updatedUser.isActive,
      createdAt: updatedUser.createdAt.toISOString(),
      updatedAt: updatedUser.updatedAt.toISOString(),
    };
  }


} 