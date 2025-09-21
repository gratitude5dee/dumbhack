import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface SubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (userData: { name: string; phone: string }) => void;
  isSubmitting: boolean;
  imagePreview?: string;
}

export const SubmissionModal: React.FC<SubmissionModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  imagePreview
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const isMobile = useIsMobile();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && phone.trim()) {
      onSubmit({ name: name.trim(), phone: phone.trim() });
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setName('');
      setPhone('');
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className={cn(
        "sm:max-w-md",
        isMobile && "w-[95vw] max-w-[95vw] rounded-t-xl rounded-b-none fixed bottom-0 top-auto transform-none"
      )}>
        <DialogHeader className={isMobile ? "text-center pb-2" : ""}>
          <DialogTitle className="text-center text-lg font-semibold">
            Share Your Labubu!
          </DialogTitle>
        </DialogHeader>
        
        <div className={cn("space-y-4", isMobile && "space-y-6")}>
          {imagePreview && (
            <motion.div 
              className="flex justify-center"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className={cn(
                "border-2 border-primary/20 rounded-lg overflow-hidden bg-muted",
                isMobile ? "w-56 h-36" : "w-48 h-32"
              )}>
                <img 
                  src={imagePreview} 
                  alt="Your Labubu drawing" 
                  className="w-full h-full object-contain"
                />
              </div>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className={cn("space-y-4", isMobile && "space-y-5")}>
            <div className="space-y-2">
              <Label htmlFor="name" className={isMobile ? "text-base font-medium" : ""}>
                Your Name *
              </Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                required
                disabled={isSubmitting}
                className={cn(
                  "transition-all",
                  isMobile && "h-12 text-base"
                )}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className={isMobile ? "text-base font-medium" : ""}>
                Phone Number *
              </Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter your phone number"
                required
                disabled={isSubmitting}
                className={cn(
                  "transition-all",
                  isMobile && "h-12 text-base"
                )}
              />
            </div>

            <div className={cn(
              "flex gap-3 pt-4",
              isMobile && "pt-6 gap-4"
            )}>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
                className={cn(
                  "flex-1",
                  isMobile && "h-12 text-base font-medium"
                )}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!name.trim() || !phone.trim() || isSubmitting}
                className={cn(
                  "flex-1",
                  isMobile && "h-12 text-base font-medium"
                )}
              >
                {isSubmitting ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
                  />
                ) : (
                  isMobile ? 'Add!' : 'Add to Collection!'
                )}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};