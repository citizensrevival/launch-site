import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from './types/database.types';
import { SupabaseConfig } from './types/supabase.types';

function loadConfig(): SupabaseConfig {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!url) {
    throw new Error(
      'VITE_SUPABASE_URL environment variable is required. ' +
        'Please set it in your .env.local file or environment variables.'
    );
  }

  if (!anonKey) {
    throw new Error(
      'VITE_SUPABASE_ANON_KEY environment variable is required. ' +
        'Please set it in your .env.local file or environment variables.'
    );
  }

  return { url, anonKey };
}

const config = loadConfig();

export const supabase: SupabaseClient<Database> = createClient<Database>(
  config.url,
  config.anonKey
);
