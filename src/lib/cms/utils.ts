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
 * Generates a URL for a specific asset variant (thumbnail, small, medium, large)
 * Falls back to original asset URL if variant doesn't exist
 */
export function getAssetVariantUrl(storageKey: string, siteId: string, variant: 'thumbnail' | 'small' | 'medium' | 'large' = 'thumbnail'): string {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  
  if (!supabaseUrl) {
    console.error('VITE_SUPABASE_URL is not configured');
    return '';
  }
  
  // Generate variant storage key
  // Original: assets/my-photo-1234567890-abc123.png
  // Variant:  assets/my-photo-1234567890-abc123-thumbnail.jpg
  const lastDotIndex = storageKey.lastIndexOf('.');
  const basePath = lastDotIndex !== -1 ? storageKey.substring(0, lastDotIndex) : storageKey;
  const variantKey = `${basePath}-${variant}.jpg`;
  
  const baseUrl = supabaseUrl.replace(/\/$/, '');
  const bucketName = `site-${siteId.replace(/-/g, '')}`;
  return `${baseUrl}/storage/v1/object/public/${bucketName}/${variantKey}`;
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
