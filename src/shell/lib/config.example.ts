/**
 * Example configuration file for Supabase
 * Copy this file to config.ts and fill in your actual values
 * 
 * For GitHub Pages deployment, you'll need to set these as environment variables
 * in your GitHub repository settings under Secrets and Variables > Actions
 */

export const SUPABASE_CONFIG = {
  url: 'your_supabase_project_url',
  anonKey: 'your_supabase_anon_key',
  serviceRoleKey: 'your_supabase_service_role_key', // Keep this secret!
};

/**
 * Instructions for GitHub Pages deployment:
 * 
 * 1. Go to your GitHub repository
 * 2. Click on Settings > Secrets and Variables > Actions
 * 3. Add the following repository secrets:
 *    - SUPABASE_URL: your_supabase_project_url
 *    - SUPABASE_ANON_KEY: your_supabase_anon_key
 *    - SUPABASE_SERVICE_ROLE_KEY: your_supabase_service_role_key
 * 
 * 4. Update your GitHub Actions workflow to use these secrets
 * 5. The build process will inject these values into your application
 */
