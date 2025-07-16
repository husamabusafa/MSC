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

export const CREATE_REGISTRATION_REQUEST_MUTATION = gql`
  mutation CreateRegistrationRequest($input: CreateRegistrationRequestInput!) {
    createRegistrationRequest(input: $input) {
      message
      success
    }
  }
`;

export const GET_ALL_REGISTRATION_REQUESTS_QUERY = gql`
  query GetAllRegistrationRequests {
    getAllRegistrationRequests {
      id
      email
      name
      universityId
      status
      adminNotes
      createdAt
      updatedAt
    }
  }
`;

export const APPROVE_REGISTRATION_REQUEST_MUTATION = gql`
  mutation ApproveRegistrationRequest($input: ApproveRegistrationRequestInput!) {
    approveRegistrationRequest(input: $input) {
      id
      email
      name
      universityId
      status
      adminNotes
      createdAt
      updatedAt
    }
  }
`;

export const REJECT_REGISTRATION_REQUEST_MUTATION = gql`
  mutation RejectRegistrationRequest($input: RejectRegistrationRequestInput!) {
    rejectRegistrationRequest(input: $input) {
      id
      email
      name
      universityId
      status
      adminNotes
      createdAt
      updatedAt
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

export const GET_REGISTRATION_REQUESTS_COUNT_QUERY = gql`
  query GetRegistrationRequestsCount {
    registrationRequestsCount {
      pending
      total
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

export interface CreateRegistrationRequestInput {
  email: string;
  password: string;
  name: string;
  universityId?: string;
}

export interface ApproveRegistrationRequestInput {
  requestId: string;
  adminNotes?: string;
}

export interface RejectRegistrationRequestInput {
  requestId: string;
  adminNotes?: string;
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

export interface RegistrationRequestResponse {
  id: string;
  email: string;
  name: string;
  universityId?: string;
  status: string;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RegistrationRequestSubmissionResponse {
  message: string;
  success: boolean;
}

export interface RegistrationRequestsCountResponse {
  pending: number;
  total: number;
} 