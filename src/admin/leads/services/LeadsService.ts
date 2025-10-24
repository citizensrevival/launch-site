import { supabase } from '../../../core/supabase';

export interface DashboardCounts {
  total: number;
  vendors: number;
  sponsors: number;
  volunteers: number;
}

export class LeadsService {
  private supabase = supabase;

  async getDashboardCounts(): Promise<{ success: true; data: DashboardCounts } | { success: false; error: string }> {
    // Stub implementation
    return {
      success: true,
      data: {
        total: 0,
        vendors: 0,
        sponsors: 0,
        volunteers: 0,
      },
    };
  }

  async exportLeadsToCSV(): Promise<{ success: true; data: string } | { success: false; error: string }> {
    // Stub implementation
    return {
      success: true,
      data: 'csv,data,here',
    };
  }
}

// Export factory function for compatibility
export function createLeadsAdminService() {
  return new LeadsService();
}