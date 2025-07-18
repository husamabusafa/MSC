import { ApolloClient, InMemoryCache, createHttpLink, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { getToken, removeToken } from './jwt';

// Create HTTP link to the GraphQL server
const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:3900';
const graphqlUri = import.meta.env.VITE_GRAPHQL_URL || `${serverUrl}/graphql`;
console.log('🔗 Apollo Client connecting to:', graphqlUri);

const httpLink = createHttpLink({
  uri: graphqlUri,
});

// Auth link to add JWT token to headers
const authLink = setContext((_, { headers }) => {
  const token = getToken();
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

// Error link to handle GraphQL errors
const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
  console.log('🔍 Apollo Error Link triggered');
  console.log('Operation:', operation.operationName);
  console.log('Variables:', operation.variables);
  
  if (graphQLErrors) {
    console.error('📋 GraphQL Errors:', graphQLErrors);
    graphQLErrors.forEach(({ message, locations, path }) => {
      console.error(`GraphQL error: Message: ${message}, Location: ${locations}, Path: ${path}`);
    });
  }

  if (networkError) {
    console.error('🌐 Network Error:', networkError);
    console.error('Network error details:', {
      name: networkError.name,
      message: networkError.message,
      stack: networkError.stack,
      statusCode: 'statusCode' in networkError ? networkError.statusCode : 'N/A'
    });
    
    // Handle authentication errors
    if ('statusCode' in networkError && networkError.statusCode === 401) {
      // Clear token and redirect to login
      removeToken();
      window.location.href = '/';
    }
  }
});

// Create Apollo Client instance
export const apolloClient = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',
    },
    query: {
      errorPolicy: 'all',
    },
  },
}); 