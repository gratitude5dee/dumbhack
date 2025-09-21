import React, { useState, useEffect, useCallback, useRef } from 'react';
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

  const loadFish = useCallback(async (sort: SortOption = 'recent') => {
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
        title: 'Error',
        description: 'Failed to load labubus. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadFish(sortBy);
  }, [sortBy, loadFish]);

  // Refs for DOM nodes and per-fish position/velocity state (percent-based)
  const nodeRefs = useRef<Map<string, HTMLDivElement | null>>(new Map());
  const posRef = useRef<Record<string, { left: number; top: number; vx: number; vy: number; scale: number }>>({});

  const seedHash = (str: string) => {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < str.length; i++) {
      h = Math.imul(h ^ str.charCodeAt(i), 16777619);
    }
    return Math.abs(h >>> 0);
  };

  const pseudoRandomFromSeed = (seed: number, n = 0) => {
    const a = 1664525;
    const c = 1013904223;
    let value = (seed + n) >>> 0;
    value = (Math.imul(a, value) + c) >>> 0;
    return (value % 100000) / 100000;
  };

  // Initialize positions and velocities when fish list changes
  useEffect(() => {
    fish.forEach((f, i) => {
      const seed = seedHash(f.id + String(i));
      const r1 = pseudoRandomFromSeed(seed, 1);
      const r2 = pseudoRandomFromSeed(seed, 2);
      const left = 5 + r1 * 90; // percent
      const top = 5 + r2 * 90; // percent

      // velocities in percent-per-second (randomized)
      const speedBase = 8 + pseudoRandomFromSeed(seed, 3) * 14; // percent/sec magnitude
      const angle = pseudoRandomFromSeed(seed, 4) * Math.PI * 2;
      const vx = Math.cos(angle) * speedBase;
      const vy = Math.sin(angle) * (speedBase * (0.6 + pseudoRandomFromSeed(seed, 5) * 0.8));

      // scale for subtle size differences
      const scale = 0.9 + pseudoRandomFromSeed(seed, 6) * 0.4;

      // If already tracked, keep current pos/vel; otherwise initialize
      if (!posRef.current[f.id]) {
        posRef.current[f.id] = { left, top, vx, vy, scale };
      } else {
        // preserve current left/top but update velocity slightly
        posRef.current[f.id].vx = vx;
        posRef.current[f.id].vy = vy;
        posRef.current[f.id].scale = scale;
      }
    });
  }, [fish]);

  // RAF loop to update positions and write to DOM directly for smooth motion
  useEffect(() => {
    let rafId: number | null = null;
    let last = performance.now();

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000); // clamp delta to avoid big jumps
      last = now;

      const entries = Object.entries(posRef.current);
      for (const [id, state] of entries) {
        let { left, top, vx, vy } = state;

        left += vx * dt;
        top += vy * dt;

        // Bounce off percent boundaries (5% - 95%) to keep cards visible
        if (left <= 3) {
          left = 3;
          vx = Math.abs(vx) * (0.7 + Math.random() * 0.6);
        } else if (left >= 97) {
          left = 97;
          vx = -Math.abs(vx) * (0.7 + Math.random() * 0.6);
        }

        if (top <= 3) {
          top = 3;
          vy = Math.abs(vy) * (0.7 + Math.random() * 0.6);
        } else if (top >= 97) {
          top = 97;
          vy = -Math.abs(vy) * (0.7 + Math.random() * 0.6);
        }

        // write back
        state.left = left;
        state.top = top;
        state.vx = vx;
        state.vy = vy;

        const node = nodeRefs.current.get(id);
        if (node) {
          node.style.left = `${left}%`;
          node.style.top = `${top}%`;
          // keep centering transform on parent so framer-motion inside won't overwrite it
        }
      }

      rafId = requestAnimationFrame(tick);
    };

    if (fish.length > 0) rafId = requestAnimationFrame(tick);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [fish]);

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
              {fish.map((fishItem) => {
                const id = fishItem.id;

                return (
                  <div
                    key={id}
                    ref={(el) => nodeRefs.current.set(id, el)}
                    // initial placement will be driven by RAF loop; fallback to center
                    style={{ position: 'absolute', left: `${posRef.current[id]?.left ?? 50}%`, top: `${posRef.current[id]?.top ?? 50}%`, transform: 'translate(-50%, -50%)' }}
                  >
                    <FloatingLabubuCard
                      fish={fishItem}
                      onVote={handleVote}
                      onDelete={isMasterUser ? handleDelete : undefined}
                    />
                  </div>
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
              <div className="absolute top-2/3 right-1/4 w-24 h-1 bg-white/10 rounded-full blur-sm animate-pulse delay-1000"></div>
            </div>
          </div>
        )}

        {/* Draw Your Own Labubu button moved below tank */}
        {fish.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-center mt-8"
          >
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              🎨 Draw Your Own Labubu
            </Link>
          </motion.div>
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
      </main>

      {/* Moved decorative element below tank */}
      <div className="w-32 h-1 bg-white/10 rounded-full blur-sm animate-pulse mx-auto mt-4"></div>

      {/* Master User Login Modal */}
      <MasterUserLogin 
        isOpen={showMasterLogin} 
        onClose={() => setShowMasterLogin(false)} 
      />
    </div>
  );
}