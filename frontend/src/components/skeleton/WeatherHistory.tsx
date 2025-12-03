import { Skeleton } from "@/components/ui/skeleton";
export function WeatherHistorySkeleton() {
  return (
    <div className="flex flex-col space-y-3">
      <Skeleton className="h-[625px] w-full rounded-xl bg-amber-200" />
    </div>
  );
}
