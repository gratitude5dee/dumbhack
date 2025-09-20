import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FishCard } from '@/components/FishCard';
import { FishService } from '@/services/fishService';
import { Fish, SortOption } from '@/types/fish';
import { useToast } from '@/hooks/use-toast';

export default function Tank() {
  const [fish, setFish] = useState<Fish[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [stats, setStats] = useState({ totalFish: 0, totalVotes: 0, activeUsers: 0 });
  const { toast } = useToast();

  const loadFish = async (sort: SortOption = 'recent') => {
    setLoading(true);
    try {
      const fishData = await FishService.getFish(50, 0, sort, 'all');
      setFish(fishData);
      
      // Load stats
      const statsData = await FishService.getStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error loading fish:', error);
      toast({
        title: "Error",
        description: "Failed to load fish. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFish(sortBy);
  }, [sortBy]);

  const handleVote = async (fishId: string, voteType: 'up' | 'down') => {
    const success = await FishService.voteFish(fishId, voteType);
    if (success) {
      toast({
        title: "Vote recorded!",
        description: `You voted ${voteType} on this fish.`,
      });
      // Refresh fish data to show updated vote counts
      loadFish(sortBy);
    } else {
      toast({
        title: "Cannot vote",
        description: "You may have already voted on this fish.",
        variant: "destructive",
      });
    }
  };

  const sortOptions = [
    { value: 'recent' as SortOption, label: 'Recent' },
    { value: 'popular' as SortOption, label: 'Popular' },
    { value: 'hot' as SortOption, label: 'Hot' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/">
              <motion.h1 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent"
              >
                🐠 DrawAFish.com
              </motion.h1>
            </Link>
            <nav className="flex items-center gap-4">
              <Link 
                to="/" 
                className="px-4 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
              >
                Draw
              </Link>
              <Link 
                to="/rankings" 
                className="px-4 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
              >
                Rankings
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-4xl font-bold mb-4"
          >
            Community Fish Tank 🐠
          </motion.h1>
          
          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex justify-center gap-8 mb-6 text-sm text-muted-foreground"
          >
            <div>
              <span className="font-bold text-lg text-foreground">{stats.totalFish}</span>
              <div>Fish Swimming</div>
            </div>
            <div>
              <span className="font-bold text-lg text-foreground">{stats.totalVotes}</span>
              <div>Total Votes</div>
            </div>
            <div>
              <span className="font-bold text-lg text-foreground">{stats.activeUsers}</span>
              <div>Active Artists</div>
            </div>
          </motion.div>

          {/* Sort Controls */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex justify-center gap-2 mb-8"
          >
            {sortOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setSortBy(option.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  sortBy === option.value
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-white border border-border hover:bg-accent'
                }`}
              >
                {option.label}
              </button>
            ))}
          </motion.div>
        </div>

        {/* Fish Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={sortBy}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
            >
              {fish.map((fishItem, index) => (
                <motion.div
                  key={fishItem.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <FishCard
                    fish={fishItem}
                    onVote={handleVote}
                    showActions={true}
                  />
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        )}

        {/* Empty State */}
        {!loading && fish.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="text-6xl mb-4">🐠</div>
            <h3 className="text-xl font-semibold mb-2">No fish in the tank yet</h3>
            <p className="text-muted-foreground mb-6">
              Be the first to add a fish to the community tank!
            </p>
            <Link
              to="/"
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              Draw Your First Fish
            </Link>
          </motion.div>
        )}

        {/* Call to Action */}
        {fish.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-center mt-12 pt-8 border-t border-border"
          >
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              🎨 Draw Your Own Fish
            </Link>
          </motion.div>
        )}
      </main>
    </div>
  );
}