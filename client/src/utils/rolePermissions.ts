export type AdminRole = 'SUPER_ADMIN' | 'ACADEMIC_ADMIN' | 'LIBRARY_ADMIN' | 'STORE_ADMIN';

export interface Permission {
  dashboard: boolean;
      users: boolean;
    registrationRequests: boolean;
  notifications: boolean;
  academic: {
    levels: boolean;
    courses: boolean;
    flashcards: boolean;
    quizzes: boolean;
    gpaSubjects: boolean;
  };
  library: {
    books: boolean;
    bookOrders: boolean;
  };
  store: {
    productCategories: boolean;
    products: boolean;
    orders: boolean;
  };
}

export const rolePermissions: Record<AdminRole, Permission> = {
  SUPER_ADMIN: {
    dashboard: true,
    users: true,
    registrationRequests: true,
    notifications: true,
    academic: {
      levels: true,
      courses: true,
      flashcards: true,
      quizzes: true,
      gpaSubjects: true,
    },
    library: {
      books: true,
      bookOrders: true,
    },
    store: {
      productCategories: true,
      products: true,
      orders: true,
    },
  },
  ACADEMIC_ADMIN: {
    dashboard: true,
    users: false,
    registrationRequests: false,
    notifications: false,
    academic: {
      levels: true,
      courses: true,
      flashcards: true,
      quizzes: true,
      gpaSubjects: true,
    },
    library: {
      books: false,
      bookOrders: false,
    },
    store: {
      productCategories: false,
      products: false,
      orders: false,
    },
  },
  LIBRARY_ADMIN: {
    dashboard: true,
    users: false,
    registrationRequests: false,
    notifications: false,
    academic: {
      levels: false,
      courses: false,
      flashcards: false,
      quizzes: false,
      gpaSubjects: false,
    },
    library: {
      books: true,
      bookOrders: true,
    },
    store: {
      productCategories: false,
      products: false,
      orders: false,
    },
  },
  STORE_ADMIN: {
    dashboard: true,
    users: false,
    registrationRequests: false,
    notifications: false,
    academic: {
      levels: false,
      courses: false,
      flashcards: false,
      quizzes: false,
      gpaSubjects: false,
    },
    library: {
      books: false,
      bookOrders: false,
    },
    store: {
      productCategories: true,
      products: true,
      orders: true,
    },
  },
};

export const getUserPermissions = (role: string): Permission => {
  return rolePermissions[role as AdminRole] || rolePermissions.STORE_ADMIN;
};

export const hasPermission = (userRole: string, permission: string): boolean => {
  const permissions = getUserPermissions(userRole);
  
  // Navigate the permission object using the permission path
  const permissionPath = permission.split('.');
  let current: any = permissions;
  
  for (const path of permissionPath) {
    if (current && typeof current === 'object' && path in current) {
      current = current[path];
    } else {
      return false;
    }
  }
  
  return current === true;
}; 