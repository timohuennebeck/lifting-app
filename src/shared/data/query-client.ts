import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    // PowerSync watched queries push updates, so refetching is unnecessary.
    queries: { staleTime: Infinity, retry: 1 },
  },
});
