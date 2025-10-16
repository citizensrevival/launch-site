// CMS Utility Functions
// Helper functions for CMS operations

/**
 * Generates a proper Supabase storage URL for an asset
 */
export function getAssetUrl(storageKey: string, siteId: string): string {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  
  if (!supabaseUrl) {
    console.error('VITE_SUPABASE_URL is not configured');
    return '';
  }
  
  // Remove trailing slash from URL if present
  const baseUrl = supabaseUrl.replace(/\/$/, '');
  
  const bucketName = `site-${siteId.replace(/-/g, '')}`;
  return `${baseUrl}/storage/v1/object/public/${bucketName}/${storageKey}`;
}

/**
 * Generates a signed URL for private assets (if needed in the future)
 */
export function getSignedAssetUrl(storageKey: string, siteId: string, _expiresIn: number = 3600): string {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  
  if (!supabaseUrl) {
    console.error('VITE_SUPABASE_URL is not configured');
    return '';
  }
  
  // For now, return the public URL
  // In the future, this could generate signed URLs for private assets
  return getAssetUrl(storageKey, siteId);
}
