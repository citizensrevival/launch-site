import { BaseService } from '../../../../core/services/BaseService';
import { AssetFiltersSchema, AssetInputSchema, AssetUpdateSchema } from '../schemas/asset.schemas';
import type { Asset, AssetInput, AssetUpdate, AssetFilters, AssetSortOptions, AssetListResponse } from '../types/asset.types';

export class AssetService extends BaseService {
  /**
   * List assets with filtering, sorting, and pagination
   */
  public async listAssets(
    filters: AssetFilters = {},
    sort: AssetSortOptions = { field: 'created_at', direction: 'desc' },
    limit = 20,
    offset = 0
  ): Promise<{ success: true; data: AssetListResponse } | { success: false; error: string }> {
    try {
      // Validate filters
      const validatedFilters = AssetFiltersSchema.parse(filters);

      let query = this.supabase
        .from('cms_assets')
        .select('*', { count: 'exact' })
        .order(sort.field, { ascending: sort.direction === 'asc' })
        .range(offset, offset + limit - 1);

      // Apply filters
      if (validatedFilters.kind) {
        query = query.eq('kind', validatedFilters.kind);
      }

      if (validatedFilters.published_by) {
        query = query.eq('created_by', validatedFilters.published_by);
      }

      if (validatedFilters.date_from) {
        query = query.gte('created_at', validatedFilters.date_from);
      }

      if (validatedFilters.date_to) {
        query = query.lte('created_at', validatedFilters.date_to);
      }

      if (validatedFilters.search) {
        query = query.or(`storage_key.ilike.%${validatedFilters.search}%,alt_text.ilike.%${validatedFilters.search}%,caption.ilike.%${validatedFilters.search}%`);
      }

      const { data, error, count } = await query;

      if (error) {
        return this.handleError(error, 'listAssets');
      }

      const result: AssetListResponse = {
        assets: data || [],
        totalCount: count || 0,
        hasMore: (count || 0) > offset + limit,
      };

      return this.success(result);
    } catch (error) {
      return this.handleError(error, 'listAssets');
    }
  }

  /**
   * Get a single asset by ID
   */
  public async getAsset(id: string): Promise<{ success: true; data: Asset } | { success: false; error: string }> {
    try {
      const { data, error } = await this.supabase
        .from('cms_assets')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        return this.handleError(error, 'getAsset');
      }

      if (!data) {
        return { success: false, error: 'Asset not found' };
      }

      return this.success(data);
    } catch (error) {
      return this.handleError(error, 'getAsset');
    }
  }

  /**
   * Create a new asset
   */
  public async createAsset(input: AssetInput): Promise<{ success: true; data: Asset } | { success: false; error: string }> {
    try {
      // Validate input
      const validatedInput = AssetInputSchema.parse(input);

      const { data, error } = await this.supabase
        .from('cms_assets')
        .insert({
          ...validatedInput,
          created_by: validatedInput.published_by,
          updated_by: validatedInput.published_by,
        })
        .select()
        .single();

      if (error) {
        return this.handleError(error, 'createAsset');
      }

      return this.success(data);
    } catch (error) {
      return this.handleError(error, 'createAsset');
    }
  }

  /**
   * Update an asset
   */
  public async updateAsset(
    id: string,
    updates: AssetUpdate
  ): Promise<{ success: true; data: Asset } | { success: false; error: string }> {
    try {
      // Validate input
      const validatedUpdates = AssetUpdateSchema.parse(updates);

      const { data, error } = await this.supabase
        .from('cms_assets')
        .update({
          ...validatedUpdates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return this.handleError(error, 'updateAsset');
      }

      if (!data) {
        return { success: false, error: 'Asset not found' };
      }

      return this.success(data);
    } catch (error) {
      return this.handleError(error, 'updateAsset');
    }
  }

  /**
   * Delete an asset
   */
  public async deleteAsset(id: string): Promise<{ success: true; data: { id: string } } | { success: false; error: string }> {
    try {
      const { error } = await this.supabase
        .from('cms_assets')
        .delete()
        .eq('id', id);

      if (error) {
        return this.handleError(error, 'deleteAsset');
      }

      return this.success({ id });
    } catch (error) {
      return this.handleError(error, 'deleteAsset');
    }
  }

  /**
   * Upload an asset file and create asset record
   */
  public async uploadAsset(
    file: File,
    metadata: Partial<AssetInput>
  ): Promise<{ success: true; data: Asset } | { success: false; error: string }> {
    try {
      // Generate storage key
      const timestamp = Date.now();
      // const _extension = file.name.split('.').pop();
      const storageKey = `assets/${timestamp}-${file.name}`;

      // Upload file to storage
      const { error: uploadError } = await this.supabase.storage
        .from('assets')
        .upload(storageKey, file);

      if (uploadError) {
        return this.handleError(uploadError, 'uploadAsset');
      }

      // Create asset record
      const assetInput: AssetInput = {
        kind: metadata.kind || 'other',
        storage_key: storageKey,
        width: metadata.width,
        height: metadata.height,
        duration_ms: metadata.duration_ms,
        file_size: file.size,
        mime_type: file.type,
        alt_text: metadata.alt_text,
        caption: metadata.caption,
        published_by: metadata.published_by || 'system',
      };

      return await this.createAsset(assetInput);
    } catch (error) {
      return this.handleError(error, 'uploadAsset');
    }
  }

  /**
   * Generate variants for an asset
   */
  public async generateVariants(
    assetId: string,
    _variants: string[]
  ): Promise<{ success: true; data: Asset } | { success: false; error: string }> {
    try {
      // Get the asset first
      const assetResult = await this.getAsset(assetId);
      if (!assetResult.success) {
        return assetResult;
      }

      // For now, just return the asset as-is
      // In a real implementation, this would generate different sized variants
      return this.success(assetResult.data);
    } catch (error) {
      return this.handleError(error, 'generateVariants');
    }
  }

  /**
   * Get asset URL
   */
  public getAssetUrl(asset: Asset, _variant?: string): string {
    const { data } = this.supabase.storage
      .from('assets')
      .getPublicUrl(asset.storage_key);

    return data.publicUrl;
  }

  /**
   * Get asset thumbnail URL
   */
  public getAssetThumbnail(asset: Asset, _size = 150): string {
    // For now, return the main asset URL
    // In a real implementation, this would return a thumbnail variant
    return this.getAssetUrl(asset);
  }
}