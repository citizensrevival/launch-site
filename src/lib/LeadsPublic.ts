import { SupabaseClient, createClient } from '@supabase/supabase-js';
import { CreateLeadInput, Lead, DatabaseError } from './types';
import { ConfigProvider } from './supabase';

/**
 * Public leads service for submitting new leads
 * This class handles lead creation and basic validation
 */
export class LeadsPublic {
  private supabase: SupabaseClient;

  constructor(configProvider: ConfigProvider) {
    const config = configProvider.getSupabaseConfig();
    this.supabase = this.createClient(config);
  }

  private createClient(config: any) {
    return createClient(config.url, config.anonKey);
  }

  /**
   * Validates email format
   */
  private validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validates required fields for lead creation
   */
  private validateLeadInput(input: CreateLeadInput): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!input.email || !this.validateEmail(input.email)) {
      errors.push('Valid email is required');
    }

    if (!input.lead_kind) {
      errors.push('Lead kind is required');
    }

    if (input.phone && !/^[\+]?[1-9][\d]{0,15}$/.test(input.phone.replace(/[\s\-\(\)]/g, ''))) {
      errors.push('Invalid phone number format');
    }

    if (input.website && !/^https?:\/\/.+/.test(input.website)) {
      errors.push('Website must be a valid URL starting with http:// or https://');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Creates a new lead in the database
   */
  async createLead(input: CreateLeadInput): Promise<{ success: boolean; data?: Lead; error?: DatabaseError }> {
    try {
      // Validate input
      const validation = this.validateLeadInput(input);
      if (!validation.isValid) {
        return {
          success: false,
          error: {
            message: 'Validation failed',
            details: validation.errors.join(', '),
          },
        };
      }

      // Prepare data for insertion
      const leadData = {
        lead_kind: input.lead_kind,
        business_name: input.business_name || null,
        contact_name: input.contact_name || null,
        email: input.email,
        phone: input.phone || null,
        website: input.website || null,
        social_links: input.social_links || null,
        source_path: input.source_path || null,
        tags: input.tags || null,
        meta: input.meta || null,
      };

      // Insert into database
      console.log('Attempting to insert lead with data:', leadData);
      
      const { data, error } = await this.supabase
        .from('leads')
        .insert([leadData])
        .select()
        .single();
      
      console.log('Insert result:', { data, error });

      if (error) {
        return {
          success: false,
          error: {
            message: error.message,
            code: error.code,
            details: error.details,
          },
        };
      }

      return {
        success: true,
        data: data as Lead,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Unknown error occurred',
        },
      };
    }
  }

  /**
   * Checks if an email already exists in the system
   */
  async emailExists(email: string): Promise<{ exists: boolean; error?: DatabaseError }> {
    try {
      const { data, error } = await this.supabase
        .from('leads')
        .select('id')
        .eq('email', email)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" error
        return {
          exists: false,
          error: {
            message: error.message,
            code: error.code,
          },
        };
      }

      return {
        exists: !!data,
      };
    } catch (error) {
      return {
        exists: false,
        error: {
          message: error instanceof Error ? error.message : 'Unknown error occurred',
        },
      };
    }
  }

  /**
   * Gets a lead by ID (public access for confirmation purposes)
   */
  async getLeadById(id: string): Promise<{ success: boolean; data?: Lead; error?: DatabaseError }> {
    try {
      const { data, error } = await this.supabase
        .from('leads')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        return {
          success: false,
          error: {
            message: error.message,
            code: error.code,
          },
        };
      }

      return {
        success: true,
        data: data as Lead,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Unknown error occurred',
        },
      };
    }
  }
}
