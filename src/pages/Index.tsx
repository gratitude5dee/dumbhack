import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { DrawingCanvas } from '@/components/DrawingCanvas';
import { FishService } from '@/services/fishService';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

const Index = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isMobile = useIsMobile();
  const { toast } = useToast();

  const handleSubmitLabubu = async (
    imageData: string, 
    drawingData: any, 
    userData?: { name: string; phone: string }
  ) => {
    setIsSubmitting(true);
    try {
      // Simulate AI classification for now (will be replaced with actual ONNX inference)
      const mockAiScore = Math.random() * 0.8 + 0.1; // Random score between 0.1-0.9
      const mockAiConfidence = Math.random() * 0.3 + 0.7; // Random confidence 0.7-1.0

      const labubu = await FishService.submitFish(
        imageData,
        drawingData,
        userData,
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
      {/* Main Content */}
      <main className={cn(
        "max-w-4xl mx-auto px-4 py-12",
        isMobile && "px-3 py-6"
      )}>
        <div className={cn(
          "text-center space-y-8",
          isMobile && "space-y-6"
        )}>
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            <h1 className={cn(
              "font-bold text-foreground",
              isMobile ? "text-3xl" : "text-4xl md:text-5xl"
            )}>
              Draw a Labubu!
            </h1>
            <h2 className={cn(
              "text-muted-foreground",
              isMobile ? "text-lg" : "text-xl md:text-2xl"
            )}>
              (the cute plush character)
            </h2>
            <p className={cn(
              "text-muted-foreground max-w-2xl mx-auto leading-relaxed",
              isMobile ? "text-sm px-4" : "text-lg"
            )}>
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
            <div className={cn(
              "flex justify-center gap-4",
              isMobile && "flex-col items-center gap-3 px-4"
            )}>
              <Link
                to="/tank"
                className={cn(
                  "px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors",
                  isMobile && "w-full max-w-xs min-h-[48px] flex items-center justify-center"
                )}
              >
                View Collection
              </Link>
              <Link
                to="/rankings"
                className={cn(
                  "px-6 py-3 border border-border rounded-lg font-medium hover:bg-accent transition-colors",
                  isMobile && "w-full max-w-xs min-h-[48px] flex items-center justify-center"
                )}
              >
                Vote on Labubus
              </Link>
            </div>
            <p className={cn(
              "text-muted-foreground",
              isMobile ? "text-xs" : "text-sm"
            )}>
              No account required • Anonymous drawing • Community voting
            </p>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Index;
