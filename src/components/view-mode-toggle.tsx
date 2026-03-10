'use client';

import { Monitor, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useIsClient } from '@/hooks/use-is-client';
import { useIsMobile, MOBILE_VIEW_OVERRIDE_KEY } from '@/hooks/use-mobile';

interface ViewModeToggleProps {
  className?: string;
  showLabels?: boolean;
}

export function ViewModeToggle({ className, showLabels = false }: ViewModeToggleProps) {
  const isClient = useIsClient();
  const isMobile = useIsMobile();

  const setViewMode = (mode: 'desktop' | 'mobile') => {
    if (typeof window === 'undefined') return;
    sessionStorage.setItem(MOBILE_VIEW_OVERRIDE_KEY, mode);
    window.dispatchEvent(new CustomEvent('viewmodechange'));
  };

  return (
    <div className={cn("flex items-center gap-1 bg-black/40 p-1.5 rounded-2xl border border-white/10 shadow-inner", className)}>
      <Button
        variant="ghost"
        size={showLabels ? "default" : "sm"}
        className={cn(
          "px-3 rounded-xl transition-all duration-300 interactive-scale gap-2",
          isClient && !isMobile 
            ? "bg-primary text-primary-foreground shadow-lg" 
            : "text-muted-foreground opacity-40 hover:opacity-100",
          !showLabels && "w-10 px-0 h-9"
        )}
        onClick={() => setViewMode('desktop')}
        title="Режим компьютера"
      >
        <Monitor className="h-4 w-4" />
        {showLabels && <span className="text-xs font-bold uppercase tracking-tight">ПК</span>}
      </Button>
      <Button
        variant="ghost"
        size={showLabels ? "default" : "sm"}
        className={cn(
          "px-3 rounded-xl transition-all duration-300 interactive-scale gap-2",
          isClient && isMobile 
            ? "bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.5)]" 
            : "text-muted-foreground opacity-40 hover:opacity-100",
          !showLabels && "w-10 px-0 h-9"
        )}
        onClick={() => setViewMode('mobile')}
        title="Мобильный режим"
      >
        <Smartphone className="h-4 w-4" />
        {showLabels && <span className="text-xs font-bold uppercase tracking-tight">Смартфон</span>}
      </Button>
    </div>
  );
}
