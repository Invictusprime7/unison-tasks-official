/**
 * Usage Examples for Supabase Server Role Key Functionality
 * This file shows how to use the server-side Supabase operations
 */

import { 
  supabaseServer, 
  serverOperations, 
  isSupabaseServerConfigured 
} from '../integrations/supabase/server';

import {
  UserManagementService,
  AITemplateService,
  FileManagementService,
  AnalyticsService,
  SystemMaintenanceService
} from '../services/supabaseAdminService';

// Example 1: Check if server configuration is ready
export function checkServerConfiguration() {
  console.log('🔧 Supabase Server Configuration:');
  console.log('✅ Configured:', isSupabaseServerConfigured);
  
  if (!isSupabaseServerConfigured) {
    console.error('❌ Server not configured. Please check SUPABASE_SERVICE_ROLE_KEY');
    return false;
  }
  
  return true;
}

// Example 2: Admin User Management
export async function exampleUserManagement() {
  console.log('👤 Testing User Management...');
  
  try {
    // Create a new user with admin role
    const newUser = await UserManagementService.createUserWithRole(
      'admin@example.com', 
      'secure-password-123',
      'admin'
    );
    console.log('✅ User created:', newUser.user.email);
    
    // List all users with pagination
    const users = await UserManagementService.getUsersWithPagination(1, 10);
    console.log('✅ Total users:', users.total);
    
    // Update user role
    await UserManagementService.updateUserRole(newUser.user.id, 'moderator');
    console.log('✅ User role updated');
    
    // Note: In real usage, you probably don't want to immediately delete the user
    // await UserManagementService.deleteUserCompletely(newUser.user.id);
    
  } catch (error) {
    console.error('❌ User management failed:', error.message);
  }
}

// Example 3: Direct Database Operations (bypasses RLS)
export async function exampleDirectOperations() {
  console.log('🗄️ Testing Direct Database Operations...');
  
  try {
    // Direct query with admin privileges
    const templates = await serverOperations.directQuery('ai_templates', {
      select: 'id, title, status, created_at',
      limit: 5,
      order: { column: 'created_at', ascending: false }
    });
    
    console.log('✅ Templates retrieved:', templates.data?.length);
    
    // Direct insert (bypassing RLS)
    const { error } = await supabaseServer
      .from('ai_templates')
      .insert({
        title: 'Admin Template',
        content: '{"type": "admin", "generated": true}',
        status: 'approved',
        is_public: true,
        user_id: '00000000-0000-0000-0000-000000000000' // System user
      });
      
    if (!error) {
      console.log('✅ Admin template inserted');
    }
    
  } catch (error) {
    console.error('❌ Direct operations failed:', error.message);
  }
}

// Example 4: File Management with Admin Access
export async function exampleFileManagement() {
  console.log('📁 Testing File Management...');
  
  try {
    // Example: Upload system assets
    const sampleContent = Buffer.from('System asset content');
    const uploadResult = await FileManagementService.uploadSystemAsset(
      sampleContent,
      'system-logo.png'
    );
    
    console.log('✅ System asset uploaded:', uploadResult.path);
    
    // Cleanup orphaned files
    const cleanupResult = await FileManagementService.cleanupOrphanedFiles('user-uploads');
    console.log('✅ Cleanup completed:', cleanupResult.message);
    
    // Generate bulk download URLs
    const urls = await FileManagementService.generateBulkDownloadUrls(
      'system-assets', 
      ['logo.png', 'banner.jpg']
    );
    console.log('✅ Bulk URLs generated:', urls.length);
    
  } catch (error) {
    console.error('❌ File management failed:', error.message);
  }
}

// Example 5: Analytics and Reporting
export async function exampleAnalytics() {
  console.log('📊 Testing Analytics...');
  
  try {
    // Get dashboard statistics
    const stats = await AnalyticsService.getDashboardStats();
    console.log('✅ Dashboard stats:', stats);
    
    // Get user activity report
    const activity = await AnalyticsService.getUserActivityReport(7); // Last 7 days
    console.log('✅ Activity report:', activity.total_activities, 'activities');
    
    // Get template analytics (if RPC function exists)
    try {
      const templateStats = await AITemplateService.getTemplateAnalytics();
      console.log('✅ Template analytics:', templateStats);
    } catch (e) {
      console.log('ℹ️ Template analytics RPC not available');
    }
    
  } catch (error) {
    console.error('❌ Analytics failed:', error.message);
  }
}

// Example 6: System Health Monitoring
export async function exampleHealthCheck() {
  console.log('🏥 Testing System Health...');
  
  try {
    const health = await SystemMaintenanceService.performHealthCheck();
    console.log('✅ System health:', health.status);
    console.log('📋 Health checks:', health.checks);
    
    // Perform maintenance
    const sessionCleanup = await SystemMaintenanceService.cleanupExpiredSessions();
    console.log('✅ Session cleanup:', sessionCleanup.status);
    
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
  }
}

// Example 7: Template Moderation
export async function exampleTemplateModeration() {
  console.log('🛡️ Testing Template Moderation...');
  
  try {
    // Get all templates including private ones
    const allTemplates = await AITemplateService.getAllTemplates(true);
    console.log('✅ All templates retrieved:', allTemplates?.length);
    
    // Find a template to moderate
    const pendingTemplate = allTemplates?.find(t => t.status === 'pending');
    
    if (pendingTemplate) {
      // Approve template
      await AITemplateService.updateTemplateStatus(
        pendingTemplate.id,
        'approved',
        'Approved by admin'
      );
      console.log('✅ Template approved:', pendingTemplate.title);
    }
    
  } catch (error) {
    console.error('❌ Template moderation failed:', error.message);
  }
}

// Example 8: Custom Database Functions
export async function exampleCustomFunctions() {
  console.log('⚡ Testing Custom Functions...');
  
  try {
    // Example: Call a custom Supabase function
    const result = await supabaseServer.functions.invoke('admin-dashboard', {
      body: { action: 'get-stats', timeframe: '30d' }
    });
    
    console.log('✅ Custom function called:', result.data);
    
  } catch (error) {
    console.log('ℹ️ Custom function not available or failed:', error.message);
  }
}

// Main demo function that runs all examples
export async function runServerFunctionalityDemo() {
  console.log('🚀 Starting Supabase Server Functionality Demo...\n');
  
  // Check configuration first
  if (!checkServerConfiguration()) {
    return;
  }
  
  console.log('\n' + '='.repeat(50));
  
  // Run all examples
  await exampleUserManagement();
  console.log('\n' + '-'.repeat(30));
  
  await exampleDirectOperations();
  console.log('\n' + '-'.repeat(30));
  
  await exampleFileManagement();
  console.log('\n' + '-'.repeat(30));
  
  await exampleAnalytics();
  console.log('\n' + '-'.repeat(30));
  
  await exampleHealthCheck();
  console.log('\n' + '-'.repeat(30));
  
  await exampleTemplateModeration();
  console.log('\n' + '-'.repeat(30));
  
  await exampleCustomFunctions();
  
  console.log('\n' + '='.repeat(50));
  console.log('✅ Demo completed!');
}

// Quick test function for development
export async function quickServerTest() {
  console.log('⚡ Quick Server Test...');
  
  if (!checkServerConfiguration()) {
    return false;
  }
  
  try {
    // Test basic database connection
    const { data, error } = await supabaseServer
      .from('profiles')
      .select('count')
      .limit(1);
      
    if (error) throw error;
    
    console.log('✅ Server connection successful');
    return true;
  } catch (error) {
    console.error('❌ Server test failed:', error.message);
    return false;
  }
}

// Export for use in other files
export default {
  runDemo: runServerFunctionalityDemo,
  quickTest: quickServerTest,
  checkConfig: checkServerConfiguration
};