import { Card, CardContent } from "../ui/card";
import { Skeleton } from "../ui/skeleton";

export const WeatherCardSkeleton = () => {
  return (
    <Card className="overflow-hidden">
      <CardContent className="px-6 py-2">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <Skeleton className="h-5 w-5 rounded-full" />
              <Skeleton className="h-4 w-24" />
            </div>
            <div className="space-y-1">
              <Skeleton className="h-9 w-20" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
