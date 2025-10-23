// CMS Utility Functions

import { supabase } from '../../shell/lib/supabase';

/**
 * Generate a UUID v4
 * @returns A valid UUID v4 string
 */
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Validate if a string is a valid UUID
 * @param uuid The string to validate
 * @returns True if valid UUID, false otherwise
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Generate a temporary ID for blocks that need to be created
 * @returns A temporary ID string
 */
export function generateTempId(): string {
  return `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get the full URL for an asset stored in Supabase Storage
 * @param storageKey The storage key of the asset
 * @param siteId The site ID
 * @returns The full URL to the asset
 */
export function getAssetUrl(storageKey: string, siteId: string): string {
  const { data } = supabase.storage.from(siteId).getPublicUrl(storageKey);
  return data.publicUrl;
}

/**
 * Get the full URL for an asset variant stored in Supabase Storage
 * @param storageKey The storage key of the asset
 * @param siteId The site ID
 * @param variant The variant name (thumbnail, small, medium, large)
 * @returns The full URL to the asset variant
 */
export function getAssetVariantUrl(storageKey: string, siteId: string, variant: string): string {
  const { data } = supabase.storage.from(siteId).getPublicUrl(`variants/${variant}/${storageKey}`);
  return data.publicUrl;
}