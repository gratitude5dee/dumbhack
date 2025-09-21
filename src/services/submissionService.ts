import { supabase } from '@/integrations/supabase/client';

export class SubmissionService {
  static async clearAllSubmissions(): Promise<{ success: boolean; deletedCount?: number; message?: string; error?: string }> {
    try {
      const { data, error } = await supabase.functions.invoke('clear-submissions', {
        method: 'POST'
      });

      if (error) {
        console.error('Error calling clear submissions function:', error);
        return {
          success: false,
          error: error.message || 'Failed to clear submissions'
        };
      }

      return data;
    } catch (error) {
      console.error('Unexpected error clearing submissions:', error);
      return {
        success: false,
        error: 'An unexpected error occurred while clearing submissions'
      };
    }
  }
}