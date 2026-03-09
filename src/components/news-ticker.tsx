'use client';

import { useState, useEffect } from 'react';
import { Flame, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';

export type NewsItem = {
  type: 'checkout' | 'event';
  text: string;
  link?: string;
};

interface NewsTickerProps {
  items: NewsItem[];
}

const icons = {
  checkout: <Flame className="h-3.5 w-3.5 text-orange-500 fill-orange-500/20 drop-shadow-[0_0_5px_rgba(249,115,22,0.5)]" />,
  event: <Trophy className="h-3.5 w-3.5 text-gold drop-shadow-[0_0_5px_rgba(255,215,0,0.5)]" />,
};

export function NewsTicker({ items }: NewsTickerProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [mode, setMode] = useState(0); // 0: normal, 1: slow, 2: stop

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!items || items.length === 0) return null;

  const tickerItems = [...items, ...items, ...items];

  const handleToggle = () => {
    setMode((prev) => (prev + 1) % 3);
  };

  return (
    <div 
      className="relative w-full h-11 bg-black/40 backdrop-blur-2xl border-y border-white/5 flex items-center overflow-hidden select-none cursor-pointer rounded-xl"
      onClick={handleToggle}
    >
      <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
      
      <div 
        className={cn(
          "flex animate-ticker whitespace-nowrap py-3",
          !isMounted && "opacity-0"
        )}
        style={{ 
          animationPlayState: mode === 2 ? 'paused' : 'running',
          animationDuration: mode === 1 ? '720s' : '240s'
        }}
      >
        {tickerItems.map((item, index) => (
          <div
            key={`${item.text}-${index}`}
            className={cn(
              "flex items-center gap-3 mx-16 text-[10px] md:text-[11px] font-bold uppercase tracking-[0.25em] transition-all duration-500 hover:text-primary hover:scale-105",
              mode === 1 ? "text-primary/80" : "text-muted-foreground/60",
              mode === 2 ? "text-primary" : ""
            )}
          >
            <div className="shrink-0">{icons[item.type]}</div>
            <span className="font-headline tracking-tighter text-sm">{item.text}</span>
            <div className="h-1.5 w-1.5 rounded-full bg-primary/20 ml-8 animate-pulse" />
          </div>
        ))}
      </div>
      
      {!isMounted && (
        <div className="absolute inset-0 flex gap-12 px-8 items-center">
          <div className="h-3 w-full bg-white/5 rounded-full animate-pulse" />
        </div>
      )}
    </div>
  );
}
