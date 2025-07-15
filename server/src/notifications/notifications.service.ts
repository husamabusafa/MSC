import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { 
  CreateNotificationInput, 
  UpdateNotificationInput, 
  NotificationsFilterInput 
} from './dto/notifications.dto';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async getAllNotifications(filters: NotificationsFilterInput = {}) {
    const where: any = {};

    if (filters.levelId) {
      where.levelId = filters.levelId;
    }

    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search } },
        { message: { contains: filters.search } },
      ];
    }

    const [notifications, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        include: {
          level: {
            select: {
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.notification.count({ where }),
    ]);

    return {
      notifications: notifications.map(notification => ({
        ...notification,
        levelName: notification.level?.name || null,
      })),
      total,
    };
  }

  async getNotificationById(id: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id },
      include: {
        level: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!notification) {
      throw new Error('Notification not found');
    }

    return {
      ...notification,
      levelName: notification.level?.name || null,
    };
  }

  async createNotification(data: CreateNotificationInput) {
    const notification = await this.prisma.notification.create({
      data: {
        title: data.title,
        message: data.message,
        levelId: data.levelId || null,
        isActive: data.isActive ?? true,
      },
      include: {
        level: {
          select: {
            name: true,
          },
        },
      },
    });

    return {
      ...notification,
      levelName: notification.level?.name || null,
    };
  }

  async updateNotification(id: string, data: UpdateNotificationInput) {
    const notification = await this.prisma.notification.update({
      where: { id },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.message && { message: data.message }),
        ...(data.levelId !== undefined && { levelId: data.levelId || null }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
      include: {
        level: {
          select: {
            name: true,
          },
        },
      },
    });

    return {
      ...notification,
      levelName: notification.level?.name || null,
    };
  }

  async deleteNotification(id: string) {
    await this.prisma.notification.delete({
      where: { id },
    });
    return true;
  }

  async getNotificationsByLevel(levelId: string) {
    const notifications = await this.prisma.notification.findMany({
      where: {
        OR: [
          { levelId: levelId },
          { levelId: null }, // General notifications for all levels
        ],
        isActive: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return notifications;
  }
} 