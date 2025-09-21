import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, MessageCircle, Eye, Calendar, Trash2 } from 'lucide-react';
import { Fish } from '@/types/fish';
import { cn } from '@/lib/utils';
import { useMasterUserStore } from '@/stores/masterUserStore';
import { FishService } from '@/services/fishService';
import { useToast } from '@/hooks/use-toast';

interface LabubuCardProps {
  fish: Fish;
  onVote: (fishId: string, voteType: 'up' | 'down') => void;
  onDelete?: (fishId: string) => void;
  showActions?: boolean;
  className?: string;
}

export const LabubuCard: React.FC<LabubuCardProps> = ({ fish, onVote, onDelete, showActions = true, className }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const { isMasterUser } = useMasterUserStore();
  const { toast } = useToast();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const handleVote = (voteType: 'up' | 'down') => {
    if (hasVoted || !onVote) return;
    onVote(fish.id, voteType);
    setHasVoted(true);
  };

  const handleDelete = async () => {
    if (!isMasterUser) return;
    
    const success = await FishService.deleteFish(fish.id);
    if (success) {
      toast({
        title: 'Labubu Deleted',
        description: 'The Labubu has been successfully removed.',
      });
      onDelete?.(fish.id);
    } else {
      toast({
        title: 'Delete Failed',
        description: 'Could not delete the Labubu. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'relative bg-card border border-border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow group',
        className
      )}
    >
      {/* Labubu Image */}
      <div className="relative mb-3">
        <div
          className={cn(
            'aspect-[5/3] bg-accent rounded-md overflow-hidden',
            !imageLoaded && 'animate-pulse'
          )}
        >
          <img
            src={fish.thumbnail_url || fish.image_url}
            alt={`Labubu ${fish.id}`}
            className="w-full h-full object-contain"
            onLoad={() => setImageLoaded(true)}
            loading="lazy"
          />
        </div>
        
        {/* AI Score Badge */}
        {fish.ai_score && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium"
          >
            {Math.round(fish.ai_score * 100)}%
          </motion.div>
        )}
      </div>

      {/* Labubu Info */}
      <div className="space-y-2">
        {/* Stats Row */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Heart className="w-3 h-3" />
              <span>{fish.upvotes}</span>
            </div>
            <div className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              <span>{fish.view_count}</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>
              {formatDate(fish.created_at)}
            </span>
          </div>
        </div>

        {/* Vote Score */}
        <div className="text-center">
          <span
            className={cn(
              'text-lg font-bold',
              fish.vote_count > 0 ? 'text-green-600' : 
              fish.vote_count < 0 ? 'text-red-600' : 'text-muted-foreground'
            )}
          >
            {fish.vote_count > 0 ? '+' : ''}{fish.vote_count}
          </span>
        </div>

        {/* Master User Proximity Indicator - Only visible on hover */}
        {isMasterUser && fish.ai_score && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-purple-500 text-white text-xs px-3 py-1 rounded-full font-medium shadow-lg backdrop-blur-sm"
            >
              Similarity: {Math.round(fish.ai_score * 100)}%
              {fish.ai_score < 0.3 && (
                <span className="ml-1 text-red-200">⚠️ Can Delete</span>
              )}
            </motion.div>
          </div>
        )}

        {/* Voting Actions - Only visible on hover */}
        {showActions && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1 }}
              className="flex gap-3"
            >
            <motion.button
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleVote('up')}
              disabled={hasVoted}
              className={cn(
                'p-2 rounded-full bg-white/95 border-2 transition-colors shadow-lg backdrop-blur-sm',
                hasVoted
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:bg-green-50 hover:border-green-500 hover:text-green-600'
              )}
            >
              <Heart className="w-5 h-5" fill="currentColor" />
            </motion.button>
            <motion.button
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleVote('down')}
                disabled={hasVoted}
                className={cn(
                  'p-2 rounded-full bg-white/95 border-2 transition-colors shadow-lg backdrop-blur-sm',
                  hasVoted
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:bg-red-50 hover:border-red-500 hover:text-red-600'
                )}
              >
                <MessageCircle className="w-5 h-5 rotate-180" fill="currentColor" />
              </motion.button>
              {isMasterUser && (
                <motion.button
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleDelete}
                  disabled={fish.ai_score ? fish.ai_score >= 0.3 : false}
                  className={cn(
                    'p-2 rounded-full border-2 transition-colors shadow-lg backdrop-blur-sm',
                    fish.ai_score && fish.ai_score >= 0.3
                      ? 'bg-gray-400 text-gray-600 border-gray-400 cursor-not-allowed opacity-50'
                      : 'bg-red-500 text-white border-red-500 hover:bg-red-600 hover:border-red-600'
                  )}
                  title={fish.ai_score && fish.ai_score >= 0.3 ? `Cannot delete: ${Math.round(fish.ai_score * 100)}% similarity too high` : 'Delete this drawing'}
                >
                  <Trash2 className="w-5 h-5" />
                </motion.button>
              )}
              </motion.div>
            </div>
          )}
      </div>
    </motion.div>
  );
};