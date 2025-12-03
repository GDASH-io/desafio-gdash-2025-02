import { Skeleton } from "@/components/ui/skeleton";
export function InsightsSkeleton() {
  return (
    <div className="flex flex-col space-y-3">
      <Skeleton className="h-[325px] w-full rounded-xl bg-amber-200" />
    </div>
  );
}
