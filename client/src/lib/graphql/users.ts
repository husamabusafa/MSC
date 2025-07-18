import { gql } from '@apollo/client';

// User Management Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  universityId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UsersResponse {
  users: User[];
  total: number;
}

export interface CreateUserInput {
  email: string;
  password: string;
  name: string;
  universityId?: string;
  role: 'STUDENT' | 'SUPER_ADMIN' | 'ACADEMIC_ADMIN' | 'LIBRARY_ADMIN' | 'STORE_ADMIN';
  isActive: boolean;
}

export interface UpdateUserInput {
  email?: string;
  password?: string;
  name?: string;
  universityId?: string;
  role?: 'STUDENT' | 'SUPER_ADMIN' | 'ACADEMIC_ADMIN' | 'LIBRARY_ADMIN' | 'STORE_ADMIN';
  isActive?: boolean;
}

export interface UpdateProfileInput {
  name?: string;
  email?: string;
  password?: string;
}

export interface UsersFilterInput {
  search?: string;
  role?: 'STUDENT' | 'SUPER_ADMIN' | 'ACADEMIC_ADMIN' | 'LIBRARY_ADMIN' | 'STORE_ADMIN';
  isActive?: boolean;
}



// User Management Queries
export const GET_USERS = gql`
  query GetUsers($filters: UsersFilterInput) {
    users(filters: $filters) {
      users {
        id
        email
        name
        role
        universityId
        isActive
        createdAt
        updatedAt
      }
      total
    }
  }
`;

export const GET_USER = gql`
  query GetUser($id: ID!) {
    user(id: $id) {
      id
      email
      name
      role
      universityId
      isActive
      createdAt
      updatedAt
    }
  }
`;

// User Management Mutations
export const CREATE_USER = gql`
  mutation CreateUser($createUserInput: CreateUserInput!) {
    createUser(createUserInput: $createUserInput) {
      id
      email
      name
      role
      universityId
      isActive
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_USER = gql`
  mutation UpdateUser($id: ID!, $updateUserInput: UpdateUserInput!) {
    updateUser(id: $id, updateUserInput: $updateUserInput) {
      id
      email
      name
      role
      universityId
      isActive
      createdAt
      updatedAt
    }
  }
`;

export const DELETE_USER = gql`
  mutation DeleteUser($id: ID!) {
    deleteUser(id: $id)
  }
`;

export const ACTIVATE_USER = gql`
  mutation ActivateUser($id: ID!) {
    activateUser(id: $id) {
      id
      email
      name
      role
      universityId
      isActive
      createdAt
      updatedAt
    }
  }
`;

export const DEACTIVATE_USER = gql`
  mutation DeactivateUser($id: ID!) {
    deactivateUser(id: $id) {
      id
      email
      name
      role
      universityId
      isActive
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_PROFILE = gql`
  mutation UpdateProfile($updateProfileInput: UpdateProfileInput!) {
    updateProfile(updateProfileInput: $updateProfileInput) {
      id
      email
      name
      role
      universityId
      isActive
      createdAt
      updatedAt
    }
  }
`;

 