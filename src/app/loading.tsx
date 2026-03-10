
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function Loading() {
  return (
    <div className="flex-1 container py-8 space-y-12">
      {/* News Ticker Skeleton */}
      <Skeleton className="h-11 w-full rounded-xl" />

      {/* Partners Display Skeleton */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-40 rounded-lg shrink-0" />
          ))}
        </div>
      </div>

      {/* Player Selector Skeleton */}
      <Card className="glassmorphism border-white/5">
        <CardHeader className="space-y-2">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Skeleton className="h-10 flex-grow" />
            <Skeleton className="h-10 w-32" />
          </div>
        </CardContent>
      </Card>

      {/* League Panels Skeleton */}
      <div className="space-y-8">
        <div className="flex gap-3 overflow-hidden">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 min-w-[200px] rounded-full shrink-0" />
          ))}
        </div>
        
        <div className="space-y-24">
          {Array.from({ length: 2 }).map((_, i) => (
            <section key={i} className="space-y-8">
              <div className="flex items-center gap-4">
                <div className="h-px flex-1 bg-white/5" />
                <Skeleton className="h-8 w-48" />
                <div className="h-px flex-1 bg-white/5" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Skeleton className="h-[300px] rounded-[3rem]" />
                <Skeleton className="h-[300px] rounded-[3rem]" />
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
