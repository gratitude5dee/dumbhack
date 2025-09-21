import { supabase } from '@/integrations/supabase/client';
import { Fish, UserSubmission, SortOption, FilterOption } from '@/types/fish';
import { getOrCreateFingerprint } from '@/lib/fingerprint';

export class FishService {
  static async submitFish(
    imageData: string,
    drawingData: any,
    userData?: { name: string; phone: string },
    aiScore?: number,
    aiConfidence?: number
  ): Promise<Fish | null> {
    try {
      const fingerprint = getOrCreateFingerprint();
      
      // Convert base64 to blob
      const base64Data = imageData.split(',')[1];
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'image/png' });

      // Upload image to storage
      const fileName = `fish_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.png`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('fish-images')
        .upload(fileName, blob);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('fish-images')
        .getPublicUrl(fileName);

      let submissionId = null;

      // Create user submission record if userData provided
      if (userData && (userData.name || userData.phone)) {
        const { data: submission, error: submissionError } = await supabase
          .from('user_submissions')
          .insert([{
            user_name: userData.name || null,
            phone_number: userData.phone || null,
            client_fingerprint: fingerprint,
          }])
          .select()
          .single();

        if (submissionError) {
          console.error('Error creating user submission:', submissionError);
        } else {
          submissionId = submission.id;
        }
      }

      // Create fish record
      const fishData = {
        image_url: publicUrl,
        drawing_data: drawingData,
        ai_score: aiScore,
        ai_confidence: aiConfidence,
        is_fish: aiScore ? aiScore > 0.5 : false,
        client_fingerprint: fingerprint,
        drawing_duration: drawingData?.duration || 0,
        canvas_dimensions: drawingData?.dimensions || { width: 400, height: 240 },
        submission_id: submissionId,
      };

      const { data, error } = await supabase
        .from('fish')
        .insert([fishData])
        .select()
        .single();

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      // Update anonymous session
      await this.updateAnonymousSession(fingerprint, 'fish_created');

      return data as Fish;
    } catch (error) {
      console.error('Error submitting fish:', error);
      return null;
    }
  }

  static async getFish(
    limit: number = 20,
    offset: number = 0,
    sortBy: SortOption = 'recent',
    filter: FilterOption = 'all'
  ): Promise<Fish[]> {
    try {
      let query = supabase
        .from('fish')
        .select('*')
        .eq('is_visible', true);

      // Apply filters
      if (filter === 'fish-only') {
        query = query.eq('is_fish', true);
      } else if (filter === 'high-score') {
        query = query.gte('ai_score', 0.7);
      }

      // Apply sorting
      switch (sortBy) {
        case 'popular':
          query = query.order('vote_count', { ascending: false });
          break;
        case 'hot':
          // Hot algorithm: recent + popular
          query = query.order('created_at', { ascending: false })
                      .order('vote_count', { ascending: false });
          break;
        case 'random':
          // Note: PostgreSQL random() function
          query = query.order('created_at', { ascending: false }); // Fallback to recent for now
          break;
        default: // 'recent'
          query = query.order('created_at', { ascending: false });
      }

      query = query.range(offset, offset + limit - 1);

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching fish:', error);
        throw error;
      }

      return (data as Fish[]) || [];
    } catch (error) {
      console.error('Error in getFish:', error);
      return [];
    }
  }

  static async voteFish(fishId: string, voteType: 'up' | 'down'): Promise<boolean> {
    try {
      const fingerprint = getOrCreateFingerprint();

      // Check if already voted
      const { data: existingVote } = await supabase
        .from('votes')
        .select('id')
        .eq('fish_id', fishId)
        .eq('client_fingerprint', fingerprint)
        .single();

      if (existingVote) {
        console.log('Already voted on this fish');
        return false;
      }

      // Cast vote
      const { error } = await supabase
        .from('votes')
        .insert([{
          fish_id: fishId,
          client_fingerprint: fingerprint,
          vote_type: voteType,
        }]);

      if (error) {
        console.error('Error voting:', error);
        throw error;
      }

      // Update anonymous session
      await this.updateAnonymousSession(fingerprint, 'votes_cast');

      return true;
    } catch (error) {
      console.error('Error in voteFish:', error);
      return false;
    }
  }

  static async incrementViewCount(fishId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('fish')
        .update({ view_count: (supabase as any).rpc('increment', { x: 1, field_name: 'view_count' }) })
        .eq('id', fishId);

      if (error) {
        console.error('Error incrementing view count:', error);
      }
    } catch (error) {
      console.error('Error in incrementViewCount:', error);
    }
  }

  private static async updateAnonymousSession(
    fingerprint: string,
    field: 'fish_created' | 'votes_cast'
  ): Promise<void> {
    try {
      // Try to get existing session first
      const { data: existingSession } = await supabase
        .from('anonymous_sessions')
        .select('*')
        .eq('fingerprint', fingerprint)
        .single();

      if (existingSession) {
        // Update existing session
        const updateData = {
          [field]: field === 'fish_created' ? existingSession.fish_created + 1 : existingSession.votes_cast + 1,
          last_active: new Date().toISOString()
        };
        
        await supabase
          .from('anonymous_sessions')
          .update(updateData)
          .eq('fingerprint', fingerprint);
      } else {
        // Create new session
        const insertData = {
          fingerprint,
          fish_created: field === 'fish_created' ? 1 : 0,
          votes_cast: field === 'votes_cast' ? 1 : 0,
        };
        
        await supabase
          .from('anonymous_sessions')
          .insert([insertData]);
      }
    } catch (error) {
      console.error('Error updating anonymous session:', error);
    }
  }

  static async deleteFish(fishId: string): Promise<boolean> {
    try {
      // Soft delete by setting is_visible to false
      const { error } = await supabase
        .from('fish')
        .update({ is_visible: false, updated_at: new Date().toISOString() })
        .eq('id', fishId);

      if (error) {
        console.error('Error deleting fish:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteFish:', error);
      return false;
    }
  }

  static async getStats() {
    try {
      const { data: totalFish } = await supabase
        .from('fish')
        .select('id', { count: 'exact' })
        .eq('is_visible', true);

      const { data: totalVotes } = await supabase
        .from('votes')
        .select('id', { count: 'exact' });

      const { data: activeSessions } = await supabase
        .from('anonymous_sessions')
        .select('id', { count: 'exact' })
        .gte('last_active', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      return {
        totalFish: totalFish?.length || 0,
        totalVotes: totalVotes?.length || 0,
        activeUsers: activeSessions?.length || 0,
      };
    } catch (error) {
      console.error('Error getting stats:', error);
      return { totalFish: 0, totalVotes: 0, activeUsers: 0 };
    }
  }
}