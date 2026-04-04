import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const ADMIN_SUPABASE_URL = 'https://bwgsahkgkgoupekhnruj.supabase.co';
const ADMIN_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3Z3NhaGtna2dvdXBla2hucnVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxMjM0NjEsImV4cCI6MjA5MDY5OTQ2MX0.w5dt7fi3p7vLhRGLzJ5dgtyNBdOuJCga3Z6D4BMhLbE';

// Secondary client for shared admin panel database (data operations only)
// Auth still uses the primary Lovable Cloud client
export const adminDb = createClient<Database>(ADMIN_SUPABASE_URL, ADMIN_SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});
