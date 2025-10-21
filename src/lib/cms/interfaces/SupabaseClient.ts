// Interface for Supabase client to enable dependency injection and testing
export interface SupabaseClient {
  auth: {
    getUser(): Promise<{ data: { user: any } }>;
  };
  from(table: string): {
    select(columns?: string): any;
    insert(data: any): any;
    update(data: any): any;
    delete(): any;
    eq(column: string, value: any): any;
    single(): any;
  };
  rpc(functionName: string, params?: any): any;
  storage: {
    from(bucket: string): {
      upload(path: string, file: File): any;
      download(path: string): any;
      remove(paths: string[]): any;
    };
  };
}

// Factory function to create Supabase client
export function createSupabaseClient(): SupabaseClient {
  // This would import the actual Supabase client
  // For now, this is a placeholder
  throw new Error('Not implemented - use actual Supabase client');
}

// Mock client for testing
export function createMockSupabaseClient(): SupabaseClient {
  // Use global vi from vitest test environment
  const mockFn = (globalThis as any).vi?.fn || (() => {
    throw new Error('vi is not available. Make sure you are running in a test environment.');
  });
  
  return {
    auth: {
      getUser: mockFn().mockResolvedValue({ data: { user: { id: 'test-user-id' } } })
    },
    from: mockFn().mockReturnValue({
      select: mockFn().mockReturnThis(),
      insert: mockFn().mockReturnThis(),
      update: mockFn().mockReturnThis(),
      delete: mockFn().mockReturnThis(),
      eq: mockFn().mockReturnThis(),
      single: mockFn().mockResolvedValue({ data: {}, error: null })
    }),
    rpc: mockFn().mockResolvedValue({ data: true, error: null }),
    storage: {
      from: mockFn().mockReturnValue({
        upload: mockFn().mockResolvedValue({ data: { path: 'test-path' }, error: null }),
        download: mockFn().mockResolvedValue({ data: new Blob(), error: null }),
        remove: mockFn().mockResolvedValue({ data: [], error: null })
      })
    }
  };
}
