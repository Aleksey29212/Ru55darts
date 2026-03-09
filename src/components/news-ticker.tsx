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
  checkout: <Flame className="h-4 w-4 text-orange-500 fill-orange-500/20 drop-shadow-[0_0_8px_rgba(249,115,22,0.6)]" />,
  event: <Trophy className="h-4 w-4 text-gold drop-shadow-[0_0_8px_rgba(255,215,0,0.6)]" />,
};

export function NewsTicker({ items }: NewsTickerProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [mode, setMode] = useState(0); // 0: normal, 1: slow, 2: stop

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!items || items.length === 0) return null;

  // Тройное дублирование для гарантии бесшовного цикла при медленной скорости
  const tickerItems = [...items, ...items, ...items];

  const handleToggle = () => {
    setMode((prev) => (prev + 1) % 3);
  };

  return (
    <div 
      className="relative w-full h-12 bg-black/60 backdrop-blur-3xl border-y border-white/10 flex items-center overflow-hidden select-none cursor-pointer rounded-xl group"
      onClick={handleToggle}
      title="Нажмите, чтобы замедлить или остановить"
    >
      {/* Усиленные маски для плавности */}
      <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-background via-background/80 to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-background via-background/80 to-transparent z-10 pointer-events-none" />
      
      <div 
        className={cn(
          "flex animate-ticker whitespace-nowrap py-3",
          !isMounted && "opacity-0"
        )}
        style={{ 
          animationPlayState: mode === 2 ? 'paused' : 'running',
          animationDuration: mode === 1 ? '960s' : '480s'
        }}
      >
        {tickerItems.map((item, index) => (
          <div
            key={`${item.text}-${index}`}
            className={cn(
              "flex items-center gap-4 mx-24 transition-all duration-700",
              mode === 1 ? "text-primary scale-105" : "text-muted-foreground/80",
              mode === 2 ? "text-primary brightness-125" : "group-hover:text-primary/90"
            )}
          >
            <div className="shrink-0 transform transition-transform group-hover:scale-110">
              {icons[item.type]}
            </div>
            <span className="font-headline tracking-tight text-base md:text-lg uppercase">
              {item.text}
            </span>
            <div className="h-2 w-2 rounded-full bg-primary/30 ml-12 animate-pulse shadow-[0_0_10px_rgba(var(--primary),0.5)]" />
          </div>
        ))}
      </div>
      
      {!isMounted && (
        <div className="absolute inset-0 flex gap-16 px-12 items-center">
          <div className="h-4 w-full bg-white/5 rounded-full animate-pulse" />
        </div>
      )}
    </div>
  );
}
