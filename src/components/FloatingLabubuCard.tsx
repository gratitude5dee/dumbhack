import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, MessageCircle, Eye, Trash2, Clock } from 'lucide-react';
import { Fish } from '@/types/fish';
import { cn } from '@/lib/utils';
import { useMasterUserStore } from '@/stores/masterUserStore';
import { useToast } from '@/hooks/use-toast';

interface FloatingLabubuCardProps {
  fish: Fish;
  onVote: (fishId: string, voteType: 'up' | 'down') => void | Promise<void>;
  onDelete?: (fishId: string) => void;
  className?: string;
}

export const FloatingLabubuCard: React.FC<FloatingLabubuCardProps> = ({ fish, onVote, onDelete, className }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const { isMasterUser } = useMasterUserStore();
  const { toast } = useToast();

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
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

  const handleDelete = () => {
    if (!isMasterUser) return;
    try {
      onDelete?.(fish.id);
      toast({ title: 'Labubu Deleted', description: 'The Labubu has been successfully removed.' });
    } catch (e) {
      toast({ title: 'Delete Failed', description: 'Could not delete the Labubu. Please try again.', variant: 'destructive' });
    }
  };

  return (
    <motion.div
      className={cn('relative', className)}
      tabIndex={0}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      onFocus={() => setShowTooltip(true)}
      onBlur={() => setShowTooltip(false)}
      whileHover={{ scale: 1.03 }}
      transition={{ duration: 0.12 }}
    >
      <div className="relative">
        <motion.div
          className={cn(
            'w-28 h-28 rounded-2xl overflow-hidden shadow-sm bg-white/90 backdrop-blur-sm will-change-transform',
            !imageLoaded && 'animate-pulse bg-gray-200'
          )}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: imageLoaded ? 1 : 0.7, scale: 1 }}
          transition={{ duration: 0.25 }}
        >
          <img
            src={fish.thumbnail_url || fish.image_url}
            alt={`Labubu by Anonymous`}
            className="w-full h-full object-contain p-1"
            onLoad={() => setImageLoaded(true)}
            loading="lazy"
          />

          {fish.ai_score !== undefined && (
            <div className="absolute -top-1 -right-1 bg-green-400/90 text-white text-xs px-1.5 py-0.5 rounded-full font-bold shadow-sm">
              {Math.round((fish.ai_score || 0) * 100)}%
            </div>
          )}

          {typeof fish.vote_count === 'number' && fish.vote_count !== 0 && (
            <div
              className={cn(
                'absolute -bottom-1 -left-1 text-xs px-2 py-1 rounded-full font-bold shadow-sm backdrop-blur-sm',
                fish.vote_count > 0 ? 'bg-green-500/90 text-white' : 'bg-red-500/90 text-white'
              )}
            >
              {fish.vote_count > 0 ? '+' : ''}{fish.vote_count}
            </div>
          )}
        </motion.div>

        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 z-50"
          >
            <div className="bg-black/80 text-white text-xs rounded-lg px-3 py-2 shadow-2xl backdrop-blur-sm min-w-max">
              <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-black/80 rotate-45"></div>
              <div className="space-y-1.5">
                {fish.user_name && (
                  <div className="font-semibold text-blue-200">
                    By {fish.user_name}
                  </div>
                )}
                
                <div className="flex items-center gap-3 text-gray-300">
                  <div className="flex items-center gap-1">
                    <Heart className="w-3 h-3" />
                    <span>{fish.upvotes ?? 0}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    <span>{fish.view_count ?? 0}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{formatDate(fish.created_at)}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: showTooltip ? 1 : 0, y: showTooltip ? 0 : -6 }}
          className="absolute -top-2 left-1/2 transform -translate-x-1/2 flex gap-1 z-40"
        >
          <button
            onClick={() => handleVote('up')}
            disabled={hasVoted}
            aria-label={`Upvote ${fish.user_name ?? 'labubu'}`}
            className={cn(
              'p-2 rounded-full bg-white/95 border shadow-sm backdrop-blur-sm transition-colors',
              hasVoted ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-50 hover:border-green-400 hover:text-green-600'
            )}
            title="Upvote"
          >
            <Heart className="w-3 h-3" />
          </button>

          <button
            onClick={() => handleVote('down')}
            disabled={hasVoted}
            aria-label={`Downvote ${fish.user_name ?? 'labubu'}`}
            className={cn(
              'p-2 rounded-full bg-white/95 border shadow-sm backdrop-blur-sm transition-colors',
              hasVoted ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-50 hover:border-red-400 hover:text-red-600'
            )}
            title="Downvote"
          >
            <MessageCircle className="w-3 h-3 rotate-180" />
          </button>

          {isMasterUser && (
            <button
              onClick={handleDelete}
              disabled={fish.ai_score ? fish.ai_score >= 0.3 : false}
              className={cn(
                'p-1.5 rounded-full border shadow-sm backdrop-blur-sm transition-colors',
                fish.ai_score && fish.ai_score >= 0.3
                  ? 'bg-gray-400 text-gray-600 border-gray-400 cursor-not-allowed opacity-50'
                  : 'bg-red-500 text-white border-red-500 hover:bg-red-600'
              )}
              title={fish.ai_score && fish.ai_score >= 0.3 ? `Cannot delete: ${Math.round((fish.ai_score || 0) * 100)}% similarity too high` : 'Delete this drawing'}
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};