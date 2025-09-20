import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Key } from 'lucide-react';
import { LabubuCard } from '@/components/LabubuCard';
import { MasterUserLogin } from '@/components/MasterUserLogin';
import { FishService } from '@/services/fishService';
import { Fish, SortOption } from '@/types/fish';
import { useToast } from '@/hooks/use-toast';
import { useMasterUserStore } from '@/stores/masterUserStore';
export default function Tank() {
  const [fish, setFish] = useState<Fish[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [showMasterLogin, setShowMasterLogin] = useState(false);
  const [stats, setStats] = useState({ totalFish: 0, totalVotes: 0, activeUsers: 0 });
  const { toast } = useToast();
  const { isMasterUser } = useMasterUserStore();

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
          description: "Failed to load labubus. Please try again.",
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
    try {
      const success = await FishService.voteFish(fishId, voteType);
      if (success) {
        // Reload fish to get updated vote counts
        await loadFish(sortBy);
        toast({
          title: 'Vote recorded!',
          description: `Your ${voteType}vote has been counted.`,
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to record vote. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = (fishId: string) => {
    setFish(prevFish => prevFish.filter(f => f.id !== fishId));
  };

  const sortOptions = [
    { value: 'recent' as SortOption, label: 'Recent' },
    { value: 'popular' as SortOption, label: 'Popular' },
    { value: 'hot' as SortOption, label: 'Hot' },
  ];

  return (
    <div className="h-screen bg-gradient-to-br from-cyan-100 via-blue-50 to-teal-100 overflow-hidden relative">
      {/* Aquatic Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 bg-blue-200 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-32 right-20 w-24 h-24 bg-cyan-200 rounded-full blur-lg animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-teal-200 rounded-full blur-2xl animate-pulse delay-2000"></div>
        <div className="absolute bottom-32 right-1/3 w-28 h-28 bg-blue-300 rounded-full blur-xl animate-pulse delay-500"></div>
        <div className="absolute top-1/2 left-1/2 w-36 h-36 bg-cyan-300 rounded-full blur-2xl animate-pulse delay-1500"></div>
      </div>
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm z-10 relative">
        <div className="px-6 py-3">
          <div className="flex items-center justify-between">
            <Link to="/">
              <motion.h1 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent"
              >
                🐰 DrawALabubu.com
              </motion.h1>
            </Link>
            <nav className="flex items-center gap-4">
              <Link 
                to="/" 
                className="px-3 py-1 text-sm font-medium text-foreground hover:text-primary transition-colors"
              >
                Draw
              </Link>
              <Link 
                to="/rankings" 
                className="px-3 py-1 text-sm font-medium text-foreground hover:text-primary transition-colors"
              >
                Rankings
              </Link>
              <button
                onClick={() => setShowMasterLogin(true)}
                className="p-2 text-muted-foreground hover:text-primary transition-colors"
                title="Master User Login"
              >
                <Key size={18} />
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="h-full relative">
        {/* Hero Section */}
        <div className="text-center py-4 px-6">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-bold mb-2"
          >
            🌊 The Labubu Tank
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-sm text-muted-foreground mb-4"
          >
            Watch your Labubu creations swim in the community tank!
          </motion.p>

          {/* Sort Controls */}
          <div className="flex justify-center gap-2 mb-4">
            {sortOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setSortBy(option.value)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  sortBy === option.value
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-white border border-border hover:bg-accent'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Floating Labubus Tank */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <div className="absolute inset-x-6 top-32 bottom-6 bg-gradient-to-b from-blue-100/50 to-blue-200/50 rounded-2xl border-4 border-blue-300/30 overflow-hidden shadow-2xl">
            <AnimatePresence>
              {fish.map((fishItem, index) => {
                // Generate random floating positions and animations across full tank
                const randomX = Math.random() * 85; // 0-85% of container width
                const randomY = Math.random() * 85; // 0-85% of container height
                const floatDuration = 10 + Math.random() * 15; // 10-25 seconds
                const floatDelay = Math.random() * 8; // 0-8 seconds delay
                
                // Create more varied floating paths
                const pathVariationX = 25 + Math.random() * 30; // 25-55% movement range
                const pathVariationY = 20 + Math.random() * 25; // 20-45% movement range
                
                return (
                  <motion.div
                    key={fishItem.id}
                    initial={{ 
                      opacity: 0, 
                      x: `${randomX}%`, 
                      y: `${randomY}%`,
                      scale: 0.9
                    }}
                    animate={{ 
                      opacity: 1,
                      x: [
                        `${randomX}%`, 
                        `${Math.max(0, Math.min(85, randomX + pathVariationX))}%`,
                        `${Math.max(0, Math.min(85, randomX - pathVariationX/2))}%`,
                        `${randomX}%`
                      ],
                      y: [
                        `${randomY}%`, 
                        `${Math.max(0, Math.min(85, randomY + pathVariationY))}%`,
                        `${Math.max(0, Math.min(85, randomY - pathVariationY/2))}%`,
                        `${randomY}%`
                      ],
                      scale: [1, 1.02, 0.98, 1],
                      rotate: [0, 2, -2, 1, -1, 0]
                    }}
                    transition={{ 
                      duration: floatDuration,
                      delay: floatDelay,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="absolute w-48 h-auto cursor-pointer"
                    whileHover={{ scale: 1.1, zIndex: 10 }}
                  >
                    <LabubuCard
                      fish={fishItem}
                      onVote={handleVote}
                      onDelete={isMasterUser ? handleDelete : undefined}
                      showActions={true}
                      className="hover:shadow-2xl transition-shadow duration-300"
                    />
                  </motion.div>
                );
              })}
            </AnimatePresence>
            
            {/* Tank decorations */}
            <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-green-200/40 to-transparent"></div>
            <div className="absolute top-4 right-4 text-blue-400/60 text-6xl">🫧</div>
            <div className="absolute top-20 left-8 text-blue-300/40 text-4xl">🫧</div>
            <div className="absolute bottom-20 right-12 text-blue-300/50 text-5xl">🫧</div>
          </div>
        )}

        {/* Empty State */}
        {!loading && fish.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="text-6xl mb-4">🐰</div>
            <h3 className="text-xl font-semibold mb-2">No labubus in the collection yet</h3>
            <p className="text-muted-foreground mb-6">
              Be the first to add a labubu to the community collection!
            </p>
            <Link
              to="/"
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              Draw Your First Labubu
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
              🎨 Draw Your Own Labubu
            </Link>
          </motion.div>
        )}
      </main>

      {/* Master User Login Modal */}
       {showMasterLogin && (
         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
           <div className="max-w-md w-full">
             <MasterUserLogin onClose={() => setShowMasterLogin(false)} />
           </div>
         </div>
       )}
    </div>
  );
}