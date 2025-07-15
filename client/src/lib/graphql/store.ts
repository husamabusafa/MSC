import { gql } from '@apollo/client';

// TypeScript interfaces
export interface ProductCategory {
  id: string;
  name: string;
  description: string;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
  products?: Product[];
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  image?: string;
  price: number;
  categoryId: string;
  isVisible: boolean;
  isSpecialOffer: boolean;
  createdAt: string;
  updatedAt: string;
  category?: ProductCategory;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: number;
  product?: Product;
}

export interface Order {
  id: string;
  studentId: string;
  total: number;
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  studentNotes?: string;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  student?: {
    id: string;
    name: string;
    email: string;
    universityId?: string;
  };
}

export interface StoreStats {
  totalCategories: number;
  totalProducts: number;
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
  pendingRevenue: number;
}

export interface CartItem {
  productId: string;
  quantity: number;
  price: number;
  total: number;
  product: Product;
}

export interface Cart {
  items: CartItem[];
  total: number;
  itemCount: number;
}

// Input types
export interface CreateProductCategoryInput {
  name: string;
  description: string;
  isVisible?: boolean;
}

export interface UpdateProductCategoryInput {
  name?: string;
  description?: string;
  isVisible?: boolean;
}

export interface ProductCategoriesFilter {
  search?: string;
  isVisible?: boolean;
}

export interface CreateProductInput {
  name: string;
  description: string;
  image?: string;
  price: number;
  categoryId: string;
  isVisible?: boolean;
  isSpecialOffer?: boolean;
}

export interface UpdateProductInput {
  name?: string;
  description?: string;
  image?: string;
  price?: number;
  categoryId?: string;
  isVisible?: boolean;
  isSpecialOffer?: boolean;
}

export interface ProductsFilter {
  search?: string;
  categoryId?: string;
  isVisible?: boolean;
  isSpecialOffer?: boolean;
  minPrice?: number;
  maxPrice?: number;
}

export interface OrderItemInput {
  productId: string;
  quantity: number;
}

export interface CreateOrderInput {
  items: OrderItemInput[];
  studentNotes?: string;
}

export interface UpdateOrderInput {
  status?: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  studentNotes?: string;
  adminNotes?: string;
}

export interface OrdersFilter {
  status?: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  studentId?: string;
  search?: string;
}

// Product Category Queries
export const GET_PRODUCT_CATEGORIES = gql`
  query GetProductCategories($filter: ProductCategoriesFilterInput) {
    productCategories(filter: $filter) {
      categories {
        id
        name
        description
        isVisible
        createdAt
        updatedAt
        products {
          id
          name
          slug
          price
          image
          isVisible
          isSpecialOffer
        }
      }
      total
    }
  }
`;

export const GET_PRODUCT_CATEGORY = gql`
  query GetProductCategory($id: ID!) {
    productCategory(id: $id) {
      id
      name
      description
      isVisible
      createdAt
      updatedAt
      products {
        id
        name
        slug
        description
        image
        price
        isVisible
        isSpecialOffer
        createdAt
        updatedAt
      }
    }
  }
`;

export const GET_AVAILABLE_PRODUCT_CATEGORIES = gql`
  query GetAvailableProductCategories($filter: ProductCategoriesFilterInput) {
    availableProductCategories(filter: $filter) {
      categories {
        id
        name
        description
        isVisible
        createdAt
        updatedAt
        products {
          id
          name
          slug
          price
          image
          isSpecialOffer
        }
      }
      total
    }
  }
`;

// Product Category Mutations
export const CREATE_PRODUCT_CATEGORY = gql`
  mutation CreateProductCategory($input: CreateProductCategoryInput!) {
    createProductCategory(input: $input) {
      id
      name
      description
      isVisible
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_PRODUCT_CATEGORY = gql`
  mutation UpdateProductCategory($id: ID!, $input: UpdateProductCategoryInput!) {
    updateProductCategory(id: $id, input: $input) {
      id
      name
      description
      isVisible
      createdAt
      updatedAt
    }
  }
`;

export const DELETE_PRODUCT_CATEGORY = gql`
  mutation DeleteProductCategory($id: ID!) {
    deleteProductCategory(id: $id)
  }
`;

// Product Queries
export const GET_PRODUCTS = gql`
  query GetProducts($filter: ProductsFilterInput) {
    products(filter: $filter) {
      products {
        id
        name
        slug
        description
        image
        price
        categoryId
        isVisible
        isSpecialOffer
        createdAt
        updatedAt
        category {
          id
          name
          description
        }
      }
      total
    }
  }
`;

export const GET_PRODUCT = gql`
  query GetProduct($id: ID!) {
    product(id: $id) {
      id
      name
      slug
      description
      image
      price
      categoryId
      isVisible
      isSpecialOffer
      createdAt
      updatedAt
      category {
        id
        name
        description
      }
    }
  }
`;

export const GET_PRODUCT_BY_SLUG = gql`
  query GetProductBySlug($slug: String!) {
    productBySlug(slug: $slug) {
      id
      name
      slug
      description
      image
      price
      categoryId
      isVisible
      isSpecialOffer
      createdAt
      updatedAt
      category {
        id
        name
        description
      }
    }
  }
`;

export const GET_AVAILABLE_PRODUCTS = gql`
  query GetAvailableProducts($filter: ProductsFilterInput) {
    availableProducts(filter: $filter) {
      products {
        id
        name
        slug
        description
        image
        price
        categoryId
        isVisible
        isSpecialOffer
        createdAt
        updatedAt
        category {
          id
          name
          description
        }
      }
      total
    }
  }
`;

export const GET_SPECIAL_OFFERS = gql`
  query GetSpecialOffers($filter: ProductsFilterInput) {
    specialOffers(filter: $filter) {
      products {
        id
        name
        slug
        description
        image
        price
        categoryId
        isVisible
        isSpecialOffer
        createdAt
        updatedAt
        category {
          id
          name
          description
        }
      }
      total
    }
  }
`;

export const GET_PRODUCTS_BY_CATEGORY = gql`
  query GetProductsByCategory($categoryId: ID!, $filter: ProductsFilterInput) {
    productsByCategory(categoryId: $categoryId, filter: $filter) {
      products {
        id
        name
        slug
        description
        image
        price
        categoryId
        isVisible
        isSpecialOffer
        createdAt
        updatedAt
        category {
          id
          name
          description
        }
      }
      total
    }
  }
`;

// Product Mutations
export const CREATE_PRODUCT = gql`
  mutation CreateProduct($input: CreateProductInput!) {
    createProduct(input: $input) {
      id
      name
      slug
      description
      image
      price
      categoryId
      isVisible
      isSpecialOffer
      createdAt
      updatedAt
      category {
        id
        name
        description
      }
    }
  }
`;

export const UPDATE_PRODUCT = gql`
  mutation UpdateProduct($id: ID!, $input: UpdateProductInput!) {
    updateProduct(id: $id, input: $input) {
      id
      name
      slug
      description
      image
      price
      categoryId
      isVisible
      isSpecialOffer
      createdAt
      updatedAt
      category {
        id
        name
        description
      }
    }
  }
`;

export const DELETE_PRODUCT = gql`
  mutation DeleteProduct($id: ID!) {
    deleteProduct(id: $id)
  }
`;

// Order Queries
export const GET_ORDERS = gql`
  query GetOrders($filter: OrdersFilterInput) {
    orders(filter: $filter) {
      orders {
        id
        studentId
        total
        status
        studentNotes
        adminNotes
        createdAt
        updatedAt
        items {
          id
          orderId
          productId
          quantity
          price
          product {
            id
            name
            slug
            image
            price
            category {
              id
              name
            }
          }
        }
        student {
          id
          name
          email
          universityId
        }
      }
      total
    }
  }
`;

export const GET_ORDER = gql`
  query GetOrder($id: ID!) {
    order(id: $id) {
      id
      studentId
      total
      status
      studentNotes
      adminNotes
      createdAt
      updatedAt
      items {
        id
        orderId
        productId
        quantity
        price
        product {
          id
          name
          slug
          description
          image
          price
          category {
            id
            name
          }
        }
      }
      student {
        id
        name
        email
        universityId
      }
    }
  }
`;

export const GET_MY_ORDERS = gql`
  query GetMyOrders {
    myOrders {
      orders {
        id
        studentId
        total
        status
        studentNotes
        adminNotes
        createdAt
        updatedAt
        items {
          id
          orderId
          productId
          quantity
          price
          product {
            id
            name
            slug
            image
            price
            category {
              id
              name
            }
          }
        }
      }
      total
    }
  }
`;

// Order Mutations
export const CREATE_ORDER = gql`
  mutation CreateOrder($input: CreateOrderInput!) {
    createOrder(input: $input) {
      id
      studentId
      total
      status
      studentNotes
      adminNotes
      createdAt
      updatedAt
      items {
        id
        orderId
        productId
        quantity
        price
        product {
          id
          name
          slug
          image
          price
          category {
            id
            name
          }
        }
      }
    }
  }
`;

export const UPDATE_ORDER = gql`
  mutation UpdateOrder($id: ID!, $input: UpdateOrderInput!) {
    updateOrder(id: $id, input: $input) {
      id
      studentId
      total
      status
      studentNotes
      adminNotes
      createdAt
      updatedAt
      items {
        id
        orderId
        productId
        quantity
        price
        product {
          id
          name
          slug
          image
          price
          category {
            id
            name
          }
        }
      }
      student {
        id
        name
        email
        universityId
      }
    }
  }
`;

export const DELETE_ORDER = gql`
  mutation DeleteOrder($id: ID!) {
    deleteOrder(id: $id)
  }
`;

// Statistics Queries
export const GET_STORE_STATS = gql`
  query GetStoreStats {
    storeStats {
      totalCategories
      totalProducts
      totalOrders
      pendingOrders
      completedOrders
      cancelledOrders
      totalRevenue
      pendingRevenue
    }
  }
`;

// Cart Utilities
export const CALCULATE_CART = gql`
  query CalculateCart($items: [OrderItemInput!]!) {
    calculateCart(items: $items) {
      items {
        productId
        quantity
        price
        total
        product {
          id
          name
          slug
          image
          price
          category {
            id
            name
          }
        }
      }
      total
      itemCount
    }
  }
`; 