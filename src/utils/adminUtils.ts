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

  static async clearAllFishImages(): Promise<void> {
    try {
      console.log('Triggering cleanup of all fish images and thumbnails...');
      
      const { data, error } = await supabase.functions.invoke('clear-all-fish-images', {
        body: {}
      });

      if (error) {
        console.error('Error clearing fish images:', error);
        throw error;
      }

      console.log('Image cleanup completed successfully:', data);
      return data;
    } catch (error) {
      console.error('Failed to clear fish images:', error);
      throw error;
    }
  }

  static async clearAllSubmissions(): Promise<void> {
    try {
      console.log('Triggering cleanup of all user submissions...');
      
      const { data, error } = await supabase.functions.invoke('clear-submissions', {
        body: {}
      });

      if (error) {
        console.error('Error clearing submissions:', error);
        throw error;
      }

      console.log('Submissions cleanup completed successfully:', data);
      return data;
    } catch (error) {
      console.error('Failed to clear submissions:', error);
      throw error;
    }
  }
}

// Clear all submissions to start fresh
AdminUtils.clearAllSubmissions()
  .then(result => {
    console.log('✅ All submissions cleared - starting fresh:', result);
  })
  .catch(error => {
    console.error('❌ Failed to clear submissions:', error);
  });