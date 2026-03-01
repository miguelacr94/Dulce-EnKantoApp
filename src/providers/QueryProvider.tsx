import React from 'react';
import { QueryClient, QueryClientProvider, QueryCache } from '@tanstack/react-query';
import { logger } from '@/app/core/logging';
import { errorHandler } from '@/app/core/errors';

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      logger.error('Query error', error as Error, { queryKey: query.queryKey });
    },
  }),
  defaultOptions: {
    queries: {
      retry: (failureCount, error: any) => {
        if (failureCount >= 3) return false;
        if (error?.code === 'NETWORK_ERROR') return true;
        return failureCount < 2;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: false,
      onError: (error) => {
        logger.error('Mutation error', error as Error);
      },
    },
  },
});

interface QueryProviderProps {
  children: React.ReactNode;
}

export const QueryProvider: React.FC<QueryProviderProps> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

export default queryClient;
