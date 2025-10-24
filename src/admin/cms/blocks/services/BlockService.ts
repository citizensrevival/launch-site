import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../../../../core/types/database.types';
import { BaseService } from '../../../../core/services/BaseService';
import { BlockFiltersSchema, CreateBlockInputSchema, UpdateBlockInputSchema } from '../schemas/block.schemas';
import type { Block, CreateBlockInput, UpdateBlockInput, BlockFilters, BlockSortOptions, BlockListResponse, BlockResponse } from '../types/block.types';

export class BlockService extends BaseService {
  constructor(supabase: SupabaseClient<Database>) {
    super(supabase);
  }

  /**
   * List blocks with optional filtering, sorting, and pagination.
   */
  public async listBlocks(
    filters: BlockFilters = {},
    sortBy: BlockSortOptions = { field: 'created_at', direction: 'desc' },
    limit: number = 50,
    offset: number = 0
  ): Promise<{ success: true; data: BlockListResponse } | { success: false; error: string }> {
    try {
      const validatedFilters = BlockFiltersSchema.parse(filters);

      let query = this.supabase
        .from('block')
        .select('*', { count: 'exact' });

      // Apply filters
      if (validatedFilters.type) {
        query = query.eq('type', validatedFilters.type);
      }
      if (validatedFilters.tag) {
        query = query.eq('tag', validatedFilters.tag);
      }
      if (validatedFilters.is_system !== undefined) {
        query = query.eq('is_system', validatedFilters.is_system);
      }
      if (validatedFilters.system_key) {
        query = query.eq('system_key', validatedFilters.system_key);
      }
      if (validatedFilters.created_by) {
        query = query.eq('created_by', validatedFilters.created_by);
      }
      if (validatedFilters.date_from) {
        query = query.gte('created_at', validatedFilters.date_from);
      }
      if (validatedFilters.date_to) {
        query = query.lte('created_at', validatedFilters.date_to);
      }
      if (validatedFilters.search) {
        query = query.or(`type.ilike.%${validatedFilters.search}%,tag.ilike.%${validatedFilters.search}%,system_key.ilike.%${validatedFilters.search}%`);
      }

      // Apply sorting
      query = query.order(sortBy.field, { ascending: sortBy.direction === 'asc' });

      // Apply pagination
      query = query.range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) {
        return this.handleError(error, 'listBlocks');
      }

      const result: BlockListResponse = {
        blocks: data || [],
        totalCount: count || 0,
        hasMore: (count || 0) > offset + limit,
      };

      return this.success(result);
    } catch (error) {
      return this.handleError(error, 'listBlocks');
    }
  }

  /**
   * Get a single block by ID.
   */
  public async getBlock(id: string): Promise<{ success: true; data: BlockResponse } | { success: false; error: string }> {
    try {
      const { data, error } = await this.supabase
        .from('block')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        return this.handleError(error, 'getBlock');
      }

      if (!data) {
        return { success: false, error: 'Block not found' };
      }

      return this.success(data);
    } catch (error) {
      return this.handleError(error, 'getBlock');
    }
  }

  /**
   * Create a new block.
   */
  public async createBlock(input: CreateBlockInput): Promise<{ success: true; data: BlockResponse } | { success: false; error: string }> {
    try {
      const validatedInput = CreateBlockInputSchema.parse(input);

      const { data, error } = await this.supabase
        .from('block')
        .insert({
          ...validatedInput,
          updated_by: validatedInput.created_by, // Assuming created_by is also the updater
        })
        .select()
        .single();

      if (error) {
        return this.handleError(error, 'createBlock');
      }

      return this.success(data);
    } catch (error) {
      return this.handleError(error, 'createBlock');
    }
  }

  /**
   * Update an existing block.
   */
  public async updateBlock(id: string, updates: UpdateBlockInput): Promise<{ success: true; data: BlockResponse } | { success: false; error: string }> {
    try {
      const validatedUpdates = UpdateBlockInputSchema.parse(updates);

      const { data, error } = await this.supabase
        .from('block')
        .update({
          ...validatedUpdates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return this.handleError(error, 'updateBlock');
      }

      if (!data) {
        return { success: false, error: 'Block not found' };
      }

      return this.success(data);
    } catch (error) {
      return this.handleError(error, 'updateBlock');
    }
  }

  /**
   * Delete a block.
   */
  public async deleteBlock(id: string): Promise<{ success: true; data: { id: string } } | { success: false; error: string }> {
    try {
      const { error } = await this.supabase
        .from('block')
        .delete()
        .eq('id', id);

      if (error) {
        return this.handleError(error, 'deleteBlock');
      }

      return this.success({ id });
    } catch (error) {
      return this.handleError(error, 'deleteBlock');
    }
  }

  /**
   * Get block usage count (where the block is used).
   */
  public async getBlockUsage(blockId: string): Promise<{ success: true; data: { usage_count: number } } | { success: false; error: string }> {
    try {
      // This would typically query a usage tracking table or join with page_slots
      // For now, return a placeholder
      const { data, error } = await this.supabase
        .from('page_slot')
        .select('id', { count: 'exact' })
        .eq('block_id', blockId);

      if (error) {
        return this.handleError(error, 'getBlockUsage');
      }

      return this.success({ usage_count: data?.length || 0 });
    } catch (error) {
      return this.handleError(error, 'getBlockUsage');
    }
  }

  /**
   * Check if a block is being used anywhere.
   */
  public async isBlockInUse(blockId: string): Promise<{ success: true; data: { in_use: boolean } } | { success: false; error: string }> {
    try {
      const usageResult = await this.getBlockUsage(blockId);
      if (!usageResult.success) {
        return usageResult;
      }

      return this.success({ in_use: usageResult.data.usage_count > 0 });
    } catch (error) {
      return this.handleError(error, 'isBlockInUse');
    }
  }
}
