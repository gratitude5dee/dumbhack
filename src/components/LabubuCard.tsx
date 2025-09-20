import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, MessageCircle, Eye, Calendar } from 'lucide-react';
import { Fish } from '@/types/fish';
import { cn } from '@/lib/utils';

interface LabubuCardProps {
  fish: Fish;
  onVote?: (fishId: string, voteType: 'up' | 'down') => void;
  showActions?: boolean;
  className?: string;
}

export const LabubuCard: React.FC<LabubuCardProps> = ({
  fish,
  onVote,
  showActions = true,
  className,
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);

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

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'bg-card border border-border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow',
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
            <span>{formatDate(fish.created_at)}</span>
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

        {/* Vote Actions */}
        {showActions && (
          <div className="flex justify-center gap-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleVote('up')}
              disabled={hasVoted}
              className={cn(
                'p-2 rounded-full border transition-colors',
                hasVoted
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:bg-green-50 hover:border-green-500 hover:text-green-600'
              )}
            >
              <Heart className="w-4 h-4" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleVote('down')}
              disabled={hasVoted}
              className={cn(
                'p-2 rounded-full border transition-colors',
                hasVoted
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:bg-red-50 hover:border-red-500 hover:text-red-600'
              )}
            >
              <MessageCircle className="w-4 h-4 rotate-180" />
            </motion.button>
          </div>
        )}
      </div>
    </motion.div>
  );
};