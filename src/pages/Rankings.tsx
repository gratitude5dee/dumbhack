import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Trophy, Medal, Award } from 'lucide-react';
import { LabubuCard } from '@/components/LabubuCard';
import { FishService } from '@/services/fishService';
import { Fish, SortOption, FilterOption } from '@/types/fish';
import { useToast } from '@/hooks/use-toast';

export default function Rankings() {
  const [fish, setFish] = useState<Fish[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortOption>('popular');
  const [filter, setFilter] = useState<FilterOption>('all');
  const { toast } = useToast();

  const loadFish = async (sort: SortOption = 'popular', filterBy: FilterOption = 'all') => {
    setLoading(true);
    try {
      const fishData = await FishService.getFish(100, 0, sort, filterBy);
      setFish(fishData);
    } catch (error) {
      console.error('Error loading fish:', error);
      toast({
        title: "Error",
        description: "Failed to load rankings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFish(sortBy, filter);
  }, [sortBy, filter]);

  const handleVote = async (fishId: string, voteType: 'up' | 'down') => {
    const success = await FishService.voteFish(fishId, voteType);
    if (success) {
        toast({
          title: "Vote recorded!",
          description: `You voted ${voteType} on this labubu.`,
        });
      // Refresh fish data to show updated vote counts
      loadFish(sortBy, filter);
    } else {
        toast({
          title: "Cannot vote",
          description: "You may have already voted on this labubu.",
          variant: "destructive",
        });
    }
  };

  const getRankIcon = (index: number) => {
    if (index === 0) return <Trophy className="w-5 h-5 text-yellow-500" />;
    if (index === 1) return <Medal className="w-5 h-5 text-gray-400" />;
    if (index === 2) return <Award className="w-5 h-5 text-amber-600" />;
    return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-muted-foreground">#{index + 1}</span>;
  };

  const sortOptions = [
    { value: 'popular' as SortOption, label: 'Most Popular' },
    { value: 'recent' as SortOption, label: 'Recent' },
    { value: 'hot' as SortOption, label: 'Trending' },
  ];

  const filterOptions = [
    { value: 'all' as FilterOption, label: 'All Labubus' },
    { value: 'fish-only' as FilterOption, label: 'Labubu Only' },
    { value: 'high-score' as FilterOption, label: 'High AI Score' },
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
                🐰 DrawALabubu.com
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
                to="/tank" 
                className="px-4 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
              >
                Collection
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
            🏆 Labubu Rankings
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-muted-foreground mb-6"
          >
            Vote on labubu drawings from our creative community
          </motion.p>

          {/* Controls */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            {/* Sort Controls */}
            <div className="flex justify-center gap-2 flex-wrap">
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
            </div>

            {/* Filter Controls */}
            <div className="flex justify-center gap-2 flex-wrap">
              {filterOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setFilter(option.value)}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                    filter === option.value
                      ? 'bg-accent text-accent-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-accent'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        )}

        {/* Top 3 Podium */}
        {!loading && fish.length >= 3 && sortBy === 'popular' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-12"
          >
            <h2 className="text-2xl font-bold text-center mb-6">🏆 Top Artists</h2>
            <div className="flex justify-center items-end gap-4 max-w-4xl mx-auto">
              {/* Second Place */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                className="flex-1 max-w-sm"
              >
                <div className="bg-gradient-to-b from-gray-100 to-gray-200 rounded-t-lg p-4 h-24 flex items-end justify-center">
                  <Medal className="w-8 h-8 text-gray-400" />
                </div>
                <LabubuCard fish={fish[1]} onVote={handleVote} />
              </motion.div>

              {/* First Place */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
                className="flex-1 max-w-sm"
              >
                <div className="bg-gradient-to-b from-yellow-200 to-yellow-400 rounded-t-lg p-4 h-32 flex items-end justify-center">
                  <Trophy className="w-10 h-10 text-yellow-600" />
                </div>
                <LabubuCard fish={fish[0]} onVote={handleVote} />
              </motion.div>

              {/* Third Place */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 }}
                className="flex-1 max-w-sm"
              >
                <div className="bg-gradient-to-b from-amber-100 to-amber-200 rounded-t-lg p-4 h-20 flex items-end justify-center">
                  <Award className="w-7 h-7 text-amber-600" />
                </div>
                <LabubuCard fish={fish[2]} onVote={handleVote} />
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Full Rankings List */}
        {!loading && fish.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="text-xl font-semibold mb-6 text-center">
              {sortBy === 'popular' && fish.length > 3 ? 'Complete Rankings' : 'All Labubus'}
            </h2>
            <div className="space-y-4">
              {(sortBy === 'popular' && fish.length > 3 ? fish.slice(3) : fish).map((fishItem, index) => {
                const actualIndex = sortBy === 'popular' && fish.length > 3 ? index + 3 : index;
                return (
                  <motion.div
                    key={fishItem.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: actualIndex * 0.05 }}
                    className="flex items-center gap-4 bg-white rounded-lg p-4 shadow-sm border border-border"
                  >
                    {/* Rank */}
                    <div className="flex items-center justify-center min-w-[40px]">
                      {getRankIcon(actualIndex)}
                    </div>

                    {/* Fish Card */}
                    <div className="flex-1">
                      <LabubuCard
                        fish={fishItem}
                        onVote={handleVote}
                        showActions={true}
                        className="shadow-none border-0 bg-transparent p-0"
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Empty State */}
        {!loading && fish.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="text-6xl mb-4">🏆</div>
            <h3 className="text-xl font-semibold mb-2">No labubus to rank yet</h3>
            <p className="text-muted-foreground mb-6">
              Be the first to submit a labubu and start the competition!
            </p>
            <Link
              to="/"
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              Draw Your Labubu
            </Link>
          </motion.div>
        )}

        {/* Call to Action */}
        {fish.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="text-center mt-12 pt-8 border-t border-border"
          >
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              🎨 Join the Competition
            </Link>
          </motion.div>
        )}
      </main>
    </div>
  );
}