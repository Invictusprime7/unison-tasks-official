// Server-side Supabase client with service role key
// This client has admin privileges and bypasses RLS (Row Level Security)
// Use ONLY on server-side or in secure environments

import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Type definitions for server operations
interface UserMetadata {
  [key: string]: unknown;
}

interface QueryOptions {
  select?: string;
  eq?: { column: string; value: unknown };
  order?: { column: string; ascending: boolean };
  limit?: number;
}

interface UploadOptions {
  cacheControl?: string;
  upsert?: boolean;
  contentType?: string;
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;

// Validate environment variables
if (!SUPABASE_URL || SUPABASE_URL === 'https://placeholder.supabase.co') {
  console.error('❌ Missing or invalid VITE_SUPABASE_URL environment variable');
  console.error('Current value:', SUPABASE_URL);
  console.error('Please check your environment variables');
}

if (!SUPABASE_SERVICE_ROLE_KEY || SUPABASE_SERVICE_ROLE_KEY === 'placeholder-service-key') {
  console.error('❌ Missing or invalid SUPABASE_SERVICE_ROLE_KEY environment variable');
  console.error('This client requires service role key for admin operations');
  console.error('Please check your environment variables');
}

// Create server client with service role key
export const supabaseServer = createClient<Database>(
  SUPABASE_URL || 'https://placeholder.supabase.co',
  SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-key',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    }
  }
);

// Export a flag to check if server client is properly configured
export const isSupabaseServerConfigured = Boolean(
  SUPABASE_URL && 
  SUPABASE_SERVICE_ROLE_KEY && 
  SUPABASE_URL !== 'https://placeholder.supabase.co' &&
  SUPABASE_SERVICE_ROLE_KEY !== 'placeholder-service-key'
);

// Server-side utility functions
export const serverOperations = {
  // Admin user operations
  async createUser(email: string, password: string, userData?: UserMetadata) {
    if (!isSupabaseServerConfigured) {
      throw new Error('Supabase server client not configured');
    }

    const { data, error } = await supabaseServer.auth.admin.createUser({
      email,
      password,
      user_metadata: userData,
      email_confirm: true
    });

    if (error) throw error;
    return data;
  },

  // Admin user management
  async deleteUser(userId: string) {
    if (!isSupabaseServerConfigured) {
      throw new Error('Supabase server client not configured');
    }

    const { data, error } = await supabaseServer.auth.admin.deleteUser(userId);
    if (error) throw error;
    return data;
  },

  // Update user metadata
  async updateUserMetadata(userId: string, metadata: UserMetadata) {
    if (!isSupabaseServerConfigured) {
      throw new Error('Supabase server client not configured');
    }

    const { data, error } = await supabaseServer.auth.admin.updateUserById(userId, {
      user_metadata: metadata
    });

    if (error) throw error;
    return data;
  },

  // List all users (admin only)
  async listUsers(page = 1, perPage = 1000) {
    if (!isSupabaseServerConfigured) {
      throw new Error('Supabase server client not configured');
    }

    const { data, error } = await supabaseServer.auth.admin.listUsers({
      page,
      perPage
    });

    if (error) throw error;
    return data;
  },

  // Bypass RLS for direct database operations
  async directQuery(table: string, query?: QueryOptions) {
    if (!isSupabaseServerConfigured) {
      throw new Error('Supabase server client not configured');
    }

    let queryOperation = supabaseServer.from(table).select(query?.select || '*');
    
    if (query?.eq) {
      queryOperation = queryOperation.eq(query.eq.column, query.eq.value);
    }
    
    if (query?.order) {
      queryOperation = queryOperation.order(query.order.column, { ascending: query.order.ascending });
    }
    
    if (query?.limit) {
      queryOperation = queryOperation.limit(query.limit);
    }
    
    return await queryOperation;
  },

  // Generate secure download URL for private files
  async createSignedUrl(bucket: string, path: string, expiresIn = 3600) {
    if (!isSupabaseServerConfigured) {
      throw new Error('Supabase server client not configured');
    }

    const { data, error } = await supabaseServer.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn);

    if (error) throw error;
    return data;
  },

  // Upload files with admin privileges
  async uploadFile(bucket: string, path: string, file: File | Buffer, options?: UploadOptions) {
    if (!isSupabaseServerConfigured) {
      throw new Error('Supabase server client not configured');
    }

    const { data, error } = await supabaseServer.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false,
        ...options
      });

    if (error) throw error;
    return data;
  },

  // Delete files with admin privileges
  async deleteFile(bucket: string, paths: string[]) {
    if (!isSupabaseServerConfigured) {
      throw new Error('Supabase server client not configured');
    }

    const { data, error } = await supabaseServer.storage
      .from(bucket)
      .remove(paths);

    if (error) throw error;
    return data;
  }
};

// Server-side RPC functions
export const serverRPC = {
  // Call Supabase functions with admin privileges
  async callFunction(functionName: string, params?: Record<string, unknown>) {
    if (!isSupabaseServerConfigured) {
      throw new Error('Supabase server client not configured');
    }

    const { data, error } = await supabaseServer.functions.invoke(functionName, {
      body: params,
    });

    if (error) throw error;
    return data;
  }
};

// Export the server client for direct access if needed
export default supabaseServer;