import { gql } from '@apollo/client';

// Library Management Types
export interface Book {
  id: string;
  title: string;
  slug: string;
  author: string;
  coverImage?: string;
  description: string;
  totalCopies: number;
  availableCopies: number;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
  bookOrders?: BookOrder[];
}

export interface BookOrder {
  id: string;
  studentId: string;
  bookId: string;
  status: string;
  studentNotes?: string;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
  student?: UserReference;
  book?: Book;
}

export interface UserReference {
  id: string;
  name: string;
  email: string;
  universityId?: string;
}

export interface BooksResponse {
  books: Book[];
  total: number;
}

export interface BookOrdersResponse {
  bookOrders: BookOrder[];
  total: number;
}

export interface CreateBookInput {
  title: string;
  author: string;
  coverImage?: string;
  description: string;
  totalCopies: number;
  availableCopies: number;
  isVisible: boolean;
}

export interface UpdateBookInput {
  title?: string;
  author?: string;
  coverImage?: string;
  description?: string;
  totalCopies?: number;
  availableCopies?: number;
  isVisible?: boolean;
}

export interface BooksFilterInput {
  search?: string;
  isVisible?: boolean;
  isAvailable?: boolean;
}

export interface CreateBookOrderInput {
  bookId: string;
  studentNotes?: string;
}

export interface UpdateBookOrderInput {
  status?: 'PENDING' | 'APPROVED' | 'BORROWED' | 'RETURNED' | 'REJECTED';
  studentNotes?: string;
  adminNotes?: string;
}

export interface BookOrdersFilterInput {
  search?: string;
  status?: 'PENDING' | 'APPROVED' | 'BORROWED' | 'RETURNED' | 'REJECTED';
  studentId?: string;
  bookId?: string;
}

export interface LibraryStats {
  totalBooks: number;
  totalCopies: number;
  availableCopies: number;
  borrowedCopies: number;
  pendingOrders: number;
  approvedOrders: number;
  rejectedOrders: number;
}

// Book Management Queries
export const GET_BOOKS = gql`
  query GetBooks($filters: BooksFilterInput) {
    books(filters: $filters) {
      books {
        id
        title
        slug
        author
        coverImage
        description
        totalCopies
        availableCopies
        isVisible
        createdAt
        updatedAt
        bookOrders {
          id
          studentId
          status
          student {
            id
            name
            email
            universityId
          }
        }
      }
      total
    }
  }
`;

export const GET_BOOK = gql`
  query GetBook($id: ID!) {
    book(id: $id) {
      id
      title
      slug
      author
      coverImage
      description
      totalCopies
      availableCopies
      isVisible
      createdAt
      updatedAt
      bookOrders {
        id
        studentId
        status
        studentNotes
        adminNotes
        createdAt
        updatedAt
        student {
          id
          name
          email
          universityId
        }
      }
    }
  }
`;

// Book Management Mutations
export const CREATE_BOOK = gql`
  mutation CreateBook($createBookInput: CreateBookInput!) {
    createBook(createBookInput: $createBookInput) {
      id
      title
      slug
      author
      coverImage
      description
      totalCopies
      availableCopies
      isVisible
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_BOOK = gql`
  mutation UpdateBook($id: ID!, $updateBookInput: UpdateBookInput!) {
    updateBook(id: $id, updateBookInput: $updateBookInput) {
      id
      title
      slug
      author
      coverImage
      description
      totalCopies
      availableCopies
      isVisible
      createdAt
      updatedAt
    }
  }
`;

export const DELETE_BOOK = gql`
  mutation DeleteBook($id: ID!) {
    deleteBook(id: $id)
  }
`;

// Book Order Management Queries
export const GET_BOOK_ORDERS = gql`
  query GetBookOrders($filters: BookOrdersFilterInput) {
    bookOrders(filters: $filters) {
      bookOrders {
        id
        studentId
        bookId
        status
        studentNotes
        adminNotes
        createdAt
        updatedAt
        student {
          id
          name
          email
          universityId
        }
        book {
          id
          title
          slug
          author
          coverImage
          description
          totalCopies
          availableCopies
          isVisible
          createdAt
          updatedAt
        }
      }
      total
    }
  }
`;

export const GET_BOOK_ORDER = gql`
  query GetBookOrder($id: ID!) {
    bookOrder(id: $id) {
      id
      studentId
      bookId
      status
      studentNotes
      adminNotes
      createdAt
      updatedAt
      student {
        id
        name
        email
        universityId
      }
      book {
        id
        title
        slug
        author
        coverImage
        description
        totalCopies
        availableCopies
        isVisible
        createdAt
        updatedAt
      }
    }
  }
`;

export const GET_MY_BOOK_ORDERS = gql`
  query GetMyBookOrders {
    myBookOrders {
      id
      studentId
      bookId
      status
      studentNotes
      adminNotes
      createdAt
      updatedAt
      book {
        id
        title
        slug
        author
        coverImage
        description
        totalCopies
        availableCopies
        isVisible
        createdAt
        updatedAt
      }
    }
  }
`;

// Book Order Management Mutations
export const CREATE_BOOK_ORDER = gql`
  mutation CreateBookOrder($createBookOrderInput: CreateBookOrderInput!) {
    createBookOrder(createBookOrderInput: $createBookOrderInput) {
      id
      studentId
      bookId
      status
      studentNotes
      adminNotes
      createdAt
      updatedAt
      student {
        id
        name
        email
        universityId
      }
      book {
        id
        title
        slug
        author
        coverImage
        description
        totalCopies
        availableCopies
        isVisible
        createdAt
        updatedAt
      }
    }
  }
`;

export const UPDATE_BOOK_ORDER = gql`
  mutation UpdateBookOrder($id: ID!, $updateBookOrderInput: UpdateBookOrderInput!) {
    updateBookOrder(id: $id, updateBookOrderInput: $updateBookOrderInput) {
      id
      studentId
      bookId
      status
      studentNotes
      adminNotes
      createdAt
      updatedAt
      student {
        id
        name
        email
        universityId
      }
      book {
        id
        title
        slug
        author
        coverImage
        description
        totalCopies
        availableCopies
        isVisible
        createdAt
        updatedAt
      }
    }
  }
`;

export const DELETE_BOOK_ORDER = gql`
  mutation DeleteBookOrder($id: ID!) {
    deleteBookOrder(id: $id)
  }
`;

// Library Statistics Query
export const GET_LIBRARY_STATS = gql`
  query GetLibraryStats {
    libraryStats {
      totalBooks
      totalCopies
      availableCopies
      borrowedCopies
      pendingOrders
      approvedOrders
      rejectedOrders
    }
  }
`; 