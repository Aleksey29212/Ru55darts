import * as React from 'react';
import { cn } from '@/lib/utils';

export const DartboardIcon = React.forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>(
  ({ className, ...props }, ref) => (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('h-8 w-8', className)}
      {...props}
    >
      {/* Контур головы совы: величественный силуэт */}
      <path d="M12 22c5.5 0 10-4.5 10-10 0-1.2-.2-2.5-.6-3.6L19 3h-3.5l-3.5 3-3.5-3H5l-2.4 5.4C2.2 9.5 2 10.8 2 12c0 5.5 4.5 10 10 10z" />
      
      {/* ГЛАЗА: Мудрый прищур (выразительные арочные веки) */}
      <path d="M5.5 13.5c1.5-1.5 3.5-1.5 5 0" className="text-primary/90" strokeWidth="1.2" />
      <path d="M13.5 13.5c1.5-1.5 3.5-1.5 5 0" className="text-primary/90" strokeWidth="1.2" />
      
      {/* ЗРАЧКИ: Сфокусированный взгляд профессионального игрока */}
      <circle cx="8" cy="14.5" r="1.2" fill="currentColor" stroke="none" className="animate-pulse" />
      <circle cx="16" cy="14.5" r="1.2" fill="currentColor" stroke="none" className="animate-pulse" />
      
      {/* Клюв: острый и решительный */}
      <path d="M11 16.5l1 2.5 1-2.5z" fill="currentColor" stroke="none" />
      
      {/* Детализация: ушки-кисточки */}
      <path d="M7.5 5.5l0.5 1.5" className="opacity-60" />
      <path d="M16.5 5.5l-0.5 1.5" className="opacity-60" />
    </svg>
  )
);
DartboardIcon.displayName = 'DartboardIcon';