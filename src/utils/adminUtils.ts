import { supabase } from '@/integrations/supabase/client';

export class AdminUtils {
  static async clearUserSubmissionFish(): Promise<void> {
    try {
      console.log('Triggering cleanup of user submission fish...');
      
      const { data, error } = await supabase.functions.invoke('clear-user-submission-fish', {
        body: {}
      });

      if (error) {
        console.error('Error clearing user submission fish:', error);
        throw error;
      }

      console.log('Cleanup completed successfully:', data);
      return data;
    } catch (error) {
      console.error('Failed to clear user submission fish:', error);
      throw error;
    }
  }
}

// Immediately trigger the cleanup
AdminUtils.clearUserSubmissionFish()
  .then(result => {
    console.log('✅ User submission fish cleanup completed:', result);
  })
  .catch(error => {
    console.error('❌ User submission fish cleanup failed:', error);
  });