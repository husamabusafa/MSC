import { gql } from '@apollo/client';

export const LOGIN_MUTATION = gql`
  mutation Login($loginInput: LoginInput!) {
    login(loginInput: $loginInput) {
      accessToken
      user {
        id
        email
        name
        role
        universityId
        isActive
        createdAt
      }
    }
  }
`;

export const REGISTER_MUTATION = gql`
  mutation Register($registerInput: RegisterInput!) {
    register(registerInput: $registerInput) {
      accessToken
      user {
        id
        email
        name
        role
        universityId
        isActive
        createdAt
      }
    }
  }
`;

export const GET_ME_QUERY = gql`
  query GetMe {
    me {
      id
      email
      name
      role
      universityId
      isActive
      createdAt
    }
  }
`;

// TypeScript types for the GraphQL operations
export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  name: string;
  universityId: string;
}

export interface AuthResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    universityId?: string;
    isActive: boolean;
    createdAt: string;
  };
}

export interface UserResponse {
  id: string;
  email: string;
  name: string;
  role: string;
  universityId?: string;
  isActive: boolean;
  createdAt: string;
} 