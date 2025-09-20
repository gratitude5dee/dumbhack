import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useMasterUserStore } from '@/stores/masterUserStore';

interface MasterUserLoginProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MasterUserLogin({ isOpen, onClose }: MasterUserLoginProps) {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { authenticate } = useMasterUserStore();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const success = authenticate(password);
    
    if (success) {
      toast({
        title: 'Authentication Successful',
        description: 'You are now logged in as a master user.',
      });
      setPassword('');
      onClose();
    } else {
      toast({
        title: 'Authentication Failed',
        description: 'Invalid password. Please try again.',
        variant: 'destructive',
      });
    }

    setIsLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-background border rounded-lg shadow-lg w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Master User Login</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter master password"
              disabled={isLoading}
            />
          </div>
          
          <div className="flex gap-2">
            <Button type="submit" disabled={isLoading || !password} className="flex-1">
              {isLoading ? 'Authenticating...' : 'Login'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}