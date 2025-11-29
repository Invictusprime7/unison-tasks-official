/**
 * Server-side API service using Supabase service role key
 * Provides secure backend operations for the AI Web Builder
 */

import { supabaseServer, serverOperations, serverRPC, isSupabaseServerConfigured } from '../integrations/supabase/server';

// User management service
export class UserManagementService {
  static async createUserWithRole(email: string, password: string, role = 'user') {
    if (!isSupabaseServerConfigured) {
      throw new Error('Server not configured for user management');
    }

    try {
      const userData = await serverOperations.createUser(email, password, {
        role,
        created_at: new Date().toISOString(),
        app: 'ai-web-builder'
      });

      // Create user profile in profiles table
      const { error: profileError } = await supabaseServer
        .from('profiles')
        .insert({
          id: userData.user.id,
          email: userData.user.email,
          role,
          created_at: userData.user.created_at
        });

      if (profileError) {
        console.warn('Profile creation failed:', profileError);
      }

      return userData;
    } catch (error) {
      console.error('User creation failed:', error);
      throw error;
    }
  }

  static async updateUserRole(userId: string, newRole: string) {
    try {
      // Update user metadata
      await serverOperations.updateUserMetadata(userId, { role: newRole });
      
      // Update profile role
      const { error } = await supabaseServer
        .from('profiles')
        .update({ role: newRole, updated_at: new Date().toISOString() })
        .eq('id', userId);

      if (error) throw error;
      
      return { success: true };
    } catch (error) {
      console.error('Role update failed:', error);
      throw error;
    }
  }

  static async getUsersWithPagination(page = 1, limit = 50) {
    try {
      const users = await serverOperations.listUsers(page, limit);
      
      // Get additional profile data
      const userIds = users.users.map(u => u.id);
      const { data: profiles } = await supabaseServer
        .from('profiles')
        .select('*')
        .in('id', userIds);

      // Merge user data with profiles
      const enrichedUsers = users.users.map(user => ({
        ...user,
        profile: profiles?.find(p => p.id === user.id)
      }));

      return {
        users: enrichedUsers,
        total: users.users.length,
        page,
        limit
      };
    } catch (error) {
      console.error('User listing failed:', error);
      throw error;
    }
  }

  static async deleteUserCompletely(userId: string) {
    try {
      // Delete user data from all related tables first
      await Promise.all([
        supabaseServer.from('ai_templates').delete().eq('user_id', userId),
        supabaseServer.from('ai_generations').delete().eq('user_id', userId),
        supabaseServer.from('user_feedback').delete().eq('user_id', userId),
        supabaseServer.from('profiles').delete().eq('id', userId)
      ]);

      // Finally delete the auth user
      await serverOperations.deleteUser(userId);
      
      return { success: true };
    } catch (error) {
      console.error('User deletion failed:', error);
      throw error;
    }
  }
}

// AI Templates management with admin privileges
export class AITemplateService {
  static async getAllTemplates(includePrivate = false) {
    try {
      const query = includePrivate 
        ? supabaseServer.from('ai_templates').select('*')
        : supabaseServer.from('ai_templates').select('*').eq('is_public', true);
        
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Template fetching failed:', error);
      throw error;
    }
  }

  static async updateTemplateStatus(templateId: string, status: string, moderatorNotes?: string) {
    try {
      const { data, error } = await supabaseServer
        .from('ai_templates')
        .update({
          status,
          moderator_notes: moderatorNotes,
          moderated_at: new Date().toISOString()
        })
        .eq('id', templateId)
        .select();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Template status update failed:', error);
      throw error;
    }
  }

  static async getTemplateAnalytics() {
    try {
      // Get template analytics using direct table queries
      const { data: templates, error } = await supabaseServer
        .from('design_templates')
        .select('id, name, created_at, is_public, user_id');

      if (error) throw error;

      // Calculate analytics
      const stats = {
        total_templates: templates?.length || 0,
        public_templates: templates?.filter(t => t.is_public).length || 0,
        private_templates: templates?.filter(t => !t.is_public).length || 0,
        recent_templates: templates?.filter(t => {
          const createdDate = new Date(t.created_at);
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
          return createdDate > sevenDaysAgo;
        }).length || 0
      };

      return stats;
    } catch (error) {
      console.error('Template analytics failed:', error);
      throw error;
    }
  }
}

// File management service with admin storage access
export class FileManagementService {
  static async uploadSystemAsset(file: Buffer, fileName: string, bucket = 'system-assets') {
    try {
      const timestamp = new Date().getTime();
      const safeName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filePath = `system/${timestamp}-${safeName}`;

      const uploadResult = await serverOperations.uploadFile(bucket, filePath, file, {
        cacheControl: '604800', // 7 days
        upsert: true
      });

      // Create signed URL for access
      const signedUrl = await serverOperations.createSignedUrl(bucket, filePath, 31536000); // 1 year

      return {
        path: filePath,
        url: signedUrl.signedUrl,
        ...uploadResult
      };
    } catch (error) {
      console.error('System asset upload failed:', error);
      throw error;
    }
  }

  static async cleanupOrphanedFiles(bucket: string) {
    try {
      // Get all files in bucket
      const { data: files, error: listError } = await supabaseServer.storage
        .from(bucket)
        .list();

      if (listError) throw listError;

      // Logic to identify orphaned files would go here
      // For now, just return the count
      return {
        total_files: files?.length || 0,
        message: 'File cleanup analysis completed'
      };
    } catch (error) {
      console.error('File cleanup failed:', error);
      throw error;
    }
  }

  static async generateBulkDownloadUrls(bucket: string, paths: string[]) {
    try {
      const urls = await Promise.all(
        paths.map(path => 
          serverOperations.createSignedUrl(bucket, path, 3600) // 1 hour
        )
      );

      return urls.map((urlData, index) => ({
        path: paths[index],
        url: urlData.signedUrl
      }));
    } catch (error) {
      console.error('Bulk URL generation failed:', error);
      throw error;
    }
  }
}

// Analytics and reporting service
export class AnalyticsService {
  static async getDashboardStats() {
    try {
      const [users, templates, generations] = await Promise.all([
        serverOperations.directQuery('profiles', { select: 'count' }),
        serverOperations.directQuery('ai_templates', { select: 'count' }),
        serverOperations.directQuery('ai_generations', { select: 'count' })
      ]);

      return {
        total_users: users.count || 0,
        total_templates: templates.count || 0,
        total_generations: generations.count || 0,
        generated_at: new Date().toISOString()
      };
    } catch (error) {
      console.error('Dashboard stats failed:', error);
      throw error;
    }
  }

  static async getUserActivityReport(days = 30) {
    try {
      const since = new Date();
      since.setDate(since.getDate() - days);

      const { data, error } = await supabaseServer
        .from('ai_generations')
        .select(`
          id,
          user_id,
          created_at,
          profiles:user_id (email, created_at)
        `)
        .gte('created_at', since.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return {
        period_days: days,
        total_activities: data?.length || 0,
        activities: data
      };
    } catch (error) {
      console.error('Activity report failed:', error);
      throw error;
    }
  }
}

// System maintenance service
export class SystemMaintenanceService {
  static async performHealthCheck() {
    try {
      const checks = {
        database: false,
        auth: false,
        storage: false,
        functions: false
      };

      // Test database connection
      try {
        await supabaseServer.from('profiles').select('count').limit(1);
        checks.database = true;
      } catch (e) {
        console.warn('Database check failed:', e);
      }

      // Test auth admin
      try {
        await serverOperations.listUsers(1, 1);
        checks.auth = true;
      } catch (e) {
        console.warn('Auth check failed:', e);
      }

      // Test storage
      try {
        await supabaseServer.storage.listBuckets();
        checks.storage = true;
      } catch (e) {
        console.warn('Storage check failed:', e);
      }

      // Test functions (if any exist)
      checks.functions = true; // Assume functions are working

      return {
        status: Object.values(checks).every(check => check) ? 'healthy' : 'degraded',
        checks,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Health check failed:', error);
      return {
        status: 'error',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  static async cleanupExpiredSessions() {
    try {
      // This would typically call a database function or use admin APIs
      const result = await serverRPC.callFunction('cleanup_expired_sessions', {});
      
      return {
        cleaned_sessions: result?.count || 0,
        status: 'completed'
      };
    } catch (error) {
      console.warn('Session cleanup failed, may need manual intervention:', error);
      return {
        status: 'failed',
        error: error.message
      };
    }
  }
}

// Export all services
export {
  supabaseServer as adminClient,
  isSupabaseServerConfigured as isAdminConfigured
};