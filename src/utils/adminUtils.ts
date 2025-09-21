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
}

// Immediately trigger the image cleanup
AdminUtils.clearAllFishImages()
  .then(result => {
    console.log('✅ Fish images and thumbnails cleanup completed:', result);
  })
  .catch(error => {
    console.error('❌ Fish images and thumbnails cleanup failed:', error);
  });