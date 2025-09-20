import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { DrawingCanvas } from '@/components/DrawingCanvas';
import { FishService } from '@/services/fishService';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmitLabubu = async (imageData: string, drawingData: any) => {
    setIsSubmitting(true);
    try {
      // Simulate AI classification for now (will be replaced with actual ONNX inference)
      const mockAiScore = Math.random() * 0.8 + 0.1; // Random score between 0.1-0.9
      const mockAiConfidence = Math.random() * 0.3 + 0.7; // Random confidence 0.7-1.0

      const labubu = await FishService.submitFish(
        imageData,
        drawingData,
        mockAiScore,
        mockAiConfidence
      );

      if (labubu) {
        toast({
          title: "Labubu submitted successfully!",
          description: "Your labubu is now displayed in the collection.",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to submit your labubu. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Submit error:', error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <motion.h1 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent"
            >
              🐰 DrawALabubu.com
            </motion.h1>
            <nav className="flex items-center gap-4">
              <Link 
                to="/tank" 
                className="px-4 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
              >
                Collection
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
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center space-y-8">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">
              Draw a Labubu!
            </h1>
            <h2 className="text-xl md:text-2xl text-muted-foreground">
              (the cute plush character)
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Create your labubu drawing and display it in our community collection. 
              Our AI will analyze your drawing and other users can vote on your creation!
            </p>
          </motion.div>

          {/* Drawing Canvas */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="max-w-md mx-auto"
          >
            <DrawingCanvas
              onSubmit={handleSubmitLabubu}
              aiEnabled={true}
              className="mb-8"
            />
          </motion.div>

          {/* Loading State */}
          {isSubmitting && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center space-y-2"
            >
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
              <p className="text-sm text-muted-foreground">Adding your labubu...</p>
            </motion.div>
          )}

          {/* Call to Action */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-4"
          >
            <div className="flex justify-center gap-4">
              <Link
                to="/tank"
                className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                View Collection
              </Link>
              <Link
                to="/rankings"
                className="px-6 py-3 border border-border rounded-lg font-medium hover:bg-accent transition-colors"
              >
                Vote on Labubus
              </Link>
            </div>
            <p className="text-sm text-muted-foreground">
              No account required • Anonymous drawing • Community voting
            </p>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Index;
