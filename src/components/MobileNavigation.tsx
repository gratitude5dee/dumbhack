import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Palette, Users, Trophy, Store, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';

interface NavigationItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  description?: string;
}

const navigationItems: NavigationItem[] = [
  {
    href: '/',
    label: 'Draw',
    icon: <Palette className="w-5 h-5" />,
    description: 'Create your Labubu'
  },
  {
    href: '/tank',
    label: 'Collection',
    icon: <Users className="w-5 h-5" />,
    description: 'View all drawings'
  },
  {
    href: '/rankings',
    label: 'Rankings',
    icon: <Trophy className="w-5 h-5" />,
    description: 'Vote and rank'
  },
  {
    href: '/store',
    label: 'Store',
    icon: <Store className="w-5 h-5" />,
    description: 'Shop items'
  },
];

export const MobileNavigation: React.FC = () => {
  const location = useLocation();
  const isMobile = useIsMobile();

  const isActivePath = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  if (!isMobile) {
    // Desktop horizontal navigation
    return (
      <nav className="flex items-center justify-center gap-6 px-4 py-3 bg-background/80 backdrop-blur-sm border-b">
        {navigationItems.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200",
              "hover:bg-accent hover:text-accent-foreground",
              isActivePath(item.href) 
                ? "bg-primary text-primary-foreground shadow-sm" 
                : "text-muted-foreground"
            )}
          >
            {item.icon}
            <span className="hidden sm:inline">{item.label}</span>
          </Link>
        ))}
      </nav>
    );
  }

  // Mobile navigation with hamburger menu
  return (
    <>
      {/* Mobile header with hamburger */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-4 py-3 bg-background/95 backdrop-blur-sm border-b">
        <div className="flex items-center gap-3">
          <Sheet>
            <SheetTrigger asChild>
              <button className="p-2 hover:bg-accent rounded-lg transition-colors">
                <Menu className="w-6 h-6" />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72">
              <div className="flex flex-col gap-2 mt-8">
                <h2 className="text-lg font-semibold mb-4 px-3">DrawALabubu</h2>
                {navigationItems.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-4 rounded-lg transition-all duration-200",
                      "hover:bg-accent",
                      isActivePath(item.href) 
                        ? "bg-primary text-primary-foreground" 
                        : "text-foreground"
                    )}
                  >
                    {item.icon}
                    <div className="flex flex-col">
                      <span className="font-medium">{item.label}</span>
                      {item.description && (
                        <span className="text-sm opacity-70">{item.description}</span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </SheetContent>
          </Sheet>
          <h1 className="text-lg font-semibold">DrawALabubu</h1>
        </div>
      </header>

      {/* Bottom navigation bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-t">
        <div className="flex items-center justify-around px-2 py-2 max-w-md mx-auto">
          {navigationItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 min-h-[60px] justify-center",
                "active:scale-95", // Touch feedback
                isActivePath(item.href)
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  "p-1.5 rounded-lg transition-colors",
                  isActivePath(item.href) && "bg-primary/10"
                )}
              >
                {item.icon}
              </motion.div>
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          ))}
        </div>
        {/* Safe area padding for devices with home indicators */}
        <div className="h-safe-area-inset-bottom" />
      </nav>
    </>
  );
};