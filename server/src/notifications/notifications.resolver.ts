import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards, ForbiddenException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '@prisma/client';
import { NotificationsService } from './notifications.service';
import {
  NotificationResponse,
  NotificationsResponse,
  CreateNotificationInput,
  UpdateNotificationInput,
  NotificationsFilterInput,
  NotificationsCountResponse,
} from './dto/notifications.dto';

@Resolver()
export class NotificationsResolver {
  constructor(private readonly notificationsService: NotificationsService) {}

  // =============== NOTIFICATION QUERIES ===============
  @Query(() => NotificationsResponse)
  @UseGuards(JwtAuthGuard)
  async notifications(
    @Args('filters', { type: () => NotificationsFilterInput, nullable: true }) 
    filters: NotificationsFilterInput = {},
    @CurrentUser() user: User,
  ): Promise<NotificationsResponse> {
    const isAdmin = ['SUPER_ADMIN', 'ACADEMIC_ADMIN', 'LIBRARY_ADMIN', 'STORE_ADMIN'].includes(user.role);
    if (!isAdmin) {
      throw new ForbiddenException('Admin access required');
    }

    const { notifications, total } = await this.notificationsService.getAllNotifications(filters);

    return {
      notifications: notifications.map(notification => ({
        ...notification,
        createdAt: notification.createdAt.toISOString(),
        updatedAt: notification.updatedAt.toISOString(),
      })),
      total,
    };
  }

  @Query(() => NotificationsCountResponse)
  @UseGuards(JwtAuthGuard)
  async notificationsCount(@CurrentUser() user: User): Promise<NotificationsCountResponse> {
    const isAdmin = ['SUPER_ADMIN', 'ACADEMIC_ADMIN', 'LIBRARY_ADMIN', 'STORE_ADMIN'].includes(user.role);
    if (!isAdmin) {
      throw new ForbiddenException('Admin access required');
    }

    return this.notificationsService.getNotificationsCount();
  }

  @Query(() => NotificationResponse)
  @UseGuards(JwtAuthGuard)
  async notification(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: User,
  ): Promise<NotificationResponse> {
    const isAdmin = ['SUPER_ADMIN', 'ACADEMIC_ADMIN', 'LIBRARY_ADMIN', 'STORE_ADMIN'].includes(user.role);
    if (!isAdmin) {
      throw new ForbiddenException('Admin access required');
    }

    const notification = await this.notificationsService.getNotificationById(id);

    return {
      ...notification,
      createdAt: notification.createdAt.toISOString(),
      updatedAt: notification.updatedAt.toISOString(),
    };
  }

  // Query for students to get their notifications
  @Query(() => [NotificationResponse])
  @UseGuards(JwtAuthGuard)
  async myNotifications(
    @CurrentUser() user: User,
  ): Promise<NotificationResponse[]> {
    if (user.role !== 'STUDENT') {
      throw new ForbiddenException('Student access required');
    }

    // For students, we need to get their level first
    // This is a simplified approach - in a real app, you might want to store user's level
    // For now, let's return all general notifications (levelId = null)
    const notifications = await this.notificationsService.getAllNotifications({
      isActive: true,
    });

    return notifications.notifications
      .filter(notification => notification.levelId === null)
      .map(notification => ({
        ...notification,
        createdAt: notification.createdAt.toISOString(),
        updatedAt: notification.updatedAt.toISOString(),
      }));
  }

  // =============== NOTIFICATION MUTATIONS ===============
  @Mutation(() => NotificationResponse)
  @UseGuards(JwtAuthGuard)
  async createNotification(
    @Args('createNotificationInput') createNotificationInput: CreateNotificationInput,
    @CurrentUser() user: User,
  ): Promise<NotificationResponse> {
    const isAdmin = ['SUPER_ADMIN', 'ACADEMIC_ADMIN', 'LIBRARY_ADMIN', 'STORE_ADMIN'].includes(user.role);
    if (!isAdmin) {
      throw new ForbiddenException('Admin access required');
    }

    const notification = await this.notificationsService.createNotification(createNotificationInput);

    return {
      ...notification,
      createdAt: notification.createdAt.toISOString(),
      updatedAt: notification.updatedAt.toISOString(),
    };
  }

  @Mutation(() => NotificationResponse)
  @UseGuards(JwtAuthGuard)
  async updateNotification(
    @Args('id', { type: () => ID }) id: string,
    @Args('updateNotificationInput') updateNotificationInput: UpdateNotificationInput,
    @CurrentUser() user: User,
  ): Promise<NotificationResponse> {
    const isAdmin = ['SUPER_ADMIN', 'ACADEMIC_ADMIN', 'LIBRARY_ADMIN', 'STORE_ADMIN'].includes(user.role);
    if (!isAdmin) {
      throw new ForbiddenException('Admin access required');
    }

    const notification = await this.notificationsService.updateNotification(id, updateNotificationInput);

    return {
      ...notification,
      createdAt: notification.createdAt.toISOString(),
      updatedAt: notification.updatedAt.toISOString(),
    };
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async deleteNotification(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: User,
  ): Promise<boolean> {
    const isAdmin = ['SUPER_ADMIN', 'ACADEMIC_ADMIN', 'LIBRARY_ADMIN', 'STORE_ADMIN'].includes(user.role);
    if (!isAdmin) {
      throw new ForbiddenException('Admin access required');
    }

    return await this.notificationsService.deleteNotification(id);
  }
} 