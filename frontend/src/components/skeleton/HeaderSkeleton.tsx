import { Skeleton } from "@/components/ui/skeleton";

export function HeaderSkeleton() {
  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-full bg-amber-200" />

          <div>
            <Skeleton className="h-5 w-40 mb-1 bg-amber-200" />
            <Skeleton className="h-4 w-28 bg-amber-200" />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-9 rounded-full bg-amber-200" />
            <Skeleton className="h-4 w-24 hidden sm:inline" />
          </div>

          <Skeleton className="h-8 w-20 hidden sm:inline bg-amber-200" />

          <Skeleton className="h-9 w-9 rounded-md bg-amber-200  " />
        </div>
      </div>
    </header>
  );
}
