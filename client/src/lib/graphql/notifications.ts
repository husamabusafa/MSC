import { gql } from '@apollo/client';

// =============== NOTIFICATION QUERIES ===============
export const GET_NOTIFICATIONS = gql`
  query GetNotifications($filters: NotificationsFilterInput) {
    notifications(filters: $filters) {
      notifications {
        id
        title
        message
        levelId
        levelName
        isActive
        createdAt
        updatedAt
      }
      total
    }
  }
`;

export const GET_NOTIFICATION = gql`
  query GetNotification($id: ID!) {
    notification(id: $id) {
      id
      title
      message
      levelId
      levelName
      isActive
      createdAt
      updatedAt
    }
  }
`;

export const GET_MY_NOTIFICATIONS = gql`
  query GetMyNotifications {
    myNotifications {
      id
      title
      message
      levelId
      levelName
      isActive
      createdAt
      updatedAt
    }
  }
`;

export const CREATE_NOTIFICATION = gql`
  mutation CreateNotification($createNotificationInput: CreateNotificationInput!) {
    createNotification(createNotificationInput: $createNotificationInput) {
      id
      title
      message
      levelId
      levelName
      isActive
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_NOTIFICATION = gql`
  mutation UpdateNotification($id: ID!, $updateNotificationInput: UpdateNotificationInput!) {
    updateNotification(id: $id, updateNotificationInput: $updateNotificationInput) {
      id
      title
      message
      levelId
      levelName
      isActive
      createdAt
      updatedAt
    }
  }
`;

export const DELETE_NOTIFICATION = gql`
  mutation DeleteNotification($id: ID!) {
    deleteNotification(id: $id)
  }
`;

export const GET_NOTIFICATIONS_COUNT = gql`
  query GetNotificationsCount {
    notificationsCount {
      active
      total
    }
  }
`;

// =============== TYPES ===============
export interface Notification {
  id: string;
  title: string;
  message: string;
  levelId?: string;
  levelName?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationsResponse {
  notifications: Notification[];
  total: number;
}

export interface CreateNotificationInput {
  title: string;
  message: string;
  levelId?: string;
  isActive?: boolean;
}

export interface UpdateNotificationInput {
  title?: string;
  message?: string;
  levelId?: string;
  isActive?: boolean;
}

export interface NotificationsFilterInput {
  levelId?: string;
  isActive?: boolean;
  search?: string;
}

export interface NotificationsCountResponse {
  active: number;
  total: number;
} 