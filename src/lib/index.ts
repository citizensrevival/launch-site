/**
 * Main export file for the leads library
 */

// Types
export * from './types';

// Supabase configuration
export * from './supabase';

// Lead services
export { LeadsPublic } from './LeadsPublic';
export { LeadsAdmin } from './LeadsAdmin';

// Factory functions for easy instantiation
import { EnvironmentConfigProvider } from './supabase';
import { LeadsPublic } from './LeadsPublic';
import { LeadsAdmin } from './LeadsAdmin';

/**
 * Creates a LeadsPublic instance with environment configuration
 */
export function createLeadsPublicService(): LeadsPublic {
  const configProvider = new EnvironmentConfigProvider();
  return new LeadsPublic(configProvider);
}

/**
 * Creates a LeadsAdmin instance with environment configuration
 */
export function createLeadsAdminService(): LeadsAdmin {
  const configProvider = new EnvironmentConfigProvider();
  return new LeadsAdmin(configProvider);
}
