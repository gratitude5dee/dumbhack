import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Key } from 'lucide-react';
import { FloatingLabubuCard } from '@/components/FloatingLabubuCard';
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
          <div className="absolute inset-x-6 top-32 bottom-6 bg-gradient-to-b from-blue-100/30 to-blue-200/40 rounded-3xl border border-blue-200/40 overflow-visible shadow-2xl backdrop-blur-sm">
            {/* Enhanced aquatic background elements */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-1/4 left-1/6 w-20 h-20 bg-cyan-300/40 rounded-full blur-xl animate-pulse"></div>
              <div className="absolute top-3/4 right-1/4 w-16 h-16 bg-blue-300/40 rounded-full blur-lg animate-pulse delay-1000"></div>
              <div className="absolute top-1/2 left-3/4 w-24 h-24 bg-teal-300/40 rounded-full blur-2xl animate-pulse delay-2000"></div>
              <div className="absolute top-1/6 right-1/6 w-12 h-12 bg-blue-400/40 rounded-full blur-md animate-pulse delay-500"></div>
            </div>

            <AnimatePresence>
              {fish.map((fishItem, index) => {
                // Deterministic pseudo-random function based on fish ID
                const seedHash = (str: string) => {
                  let hash = 0;
                  for (let i = 0; i < str.length; i++) {
                    const char = str.charCodeAt(i);
                    hash = ((hash << 5) - hash) + char;
                    hash = hash & hash; // Convert to 32-bit integer
                  }
                  return Math.abs(hash);
                };
                
                const seed = seedHash(fishItem.id + index.toString());
                const pseudoRandom = (offset = 0) => ((seed + offset) * 9301 + 49297) % 233280 / 233280;
                
                // Enhanced distribution algorithm for better spacing
                const goldenRatio = (1 + Math.sqrt(5)) / 2;
                const angle = index * 2 * Math.PI / goldenRatio;
                const maxRadius = Math.min(35, 8 + index * 1.5); // More gradual spiral
                const radius = Math.sqrt(index + 1) * (maxRadius / 8);
                
                // Convert polar to cartesian with better bounds
                let baseX = 50 + (radius * Math.cos(angle));
                let baseY = 50 + (radius * Math.sin(angle));
                
                // Add deterministic offset to prevent perfect grid
                const offsetX = (pseudoRandom(1) - 0.5) * 20;
                const offsetY = (pseudoRandom(2) - 0.5) * 20;
                
                const finalX = Math.max(8, Math.min(88, baseX + offsetX));
                const finalY = Math.max(8, Math.min(88, baseY + offsetY));
                
                // Deterministic floating parameters
                const floatDuration = 18 + pseudoRandom(3) * 25; // 18-43 seconds
                const floatDelay = (index * 0.3) + pseudoRandom(4) * 3; // Staggered start
                
                // Deterministic floating paths
                const pathVariationX = 6 + pseudoRandom(5) * 12; // 6-18% movement
                const pathVariationY = 4 + pseudoRandom(6) * 10; // 4-14% movement
                
                return (
                  <motion.div
                    key={fishItem.id}
                    initial={{ 
                      opacity: 0, 
                      x: `${finalX}%`, 
                      y: `${finalY}%`,
                      scale: 0.8
                    }}
                    animate={{ 
                      opacity: 1,
                      x: [
                        `${finalX}%`, 
                        `${Math.max(5, Math.min(90, finalX + pathVariationX))}%`,
                        `${Math.max(5, Math.min(90, finalX - pathVariationX/2))}%`,
                        `${finalX}%`
                      ],
                      y: [
                        `${finalY}%`, 
                        `${Math.max(5, Math.min(90, finalY + pathVariationY))}%`,
                        `${Math.max(5, Math.min(90, finalY - pathVariationY/2))}%`,
                        `${finalY}%`
                      ],
                      scale: [1, 1.05, 0.95, 1]
                    }}
                    transition={{ 
                      duration: floatDuration,
                      delay: floatDelay,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="absolute"
                  >
                    <FloatingLabubuCard
                      fish={fishItem}
                      onVote={handleVote}
                      onDelete={isMasterUser ? handleDelete : undefined}
                    />
                  </motion.div>
                );
              })}
            </AnimatePresence>
            
            {/* Enhanced tank decorations */}
            <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-emerald-200/30 via-teal-200/20 to-transparent"></div>
            <div className="absolute top-6 right-8 text-blue-400/50 text-5xl animate-bounce" style={{ animationDelay: '0s', animationDuration: '3s' }}>🫧</div>
            <div className="absolute top-24 left-12 text-cyan-300/40 text-3xl animate-bounce" style={{ animationDelay: '1s', animationDuration: '4s' }}>🫧</div>
            <div className="absolute bottom-24 right-16 text-blue-300/60 text-4xl animate-bounce" style={{ animationDelay: '2s', animationDuration: '3.5s' }}>🫧</div>
            <div className="absolute top-32 right-1/3 text-teal-400/30 text-2xl animate-bounce" style={{ animationDelay: '0.5s', animationDuration: '5s' }}>🫧</div>
            <div className="absolute bottom-40 left-1/4 text-cyan-400/40 text-3xl animate-bounce" style={{ animationDelay: '1.5s', animationDuration: '4.5s' }}>🫧</div>
            
            {/* Subtle water ripple effects */}
            <div className="absolute top-0 left-0 w-full h-full">
              <div className="absolute top-1/4 left-1/3 w-32 h-1 bg-white/10 rounded-full blur-sm animate-pulse"></div>
              <div className="absolute top-2/3 right-1/4 w-24 h-1 bg-white/10 rounded-full blur-sm animate-pulse delay-1000"></div>
            </div>
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
      <MasterUserLogin 
        isOpen={showMasterLogin} 
        onClose={() => setShowMasterLogin(false)} 
      />
    </div>
  );
}