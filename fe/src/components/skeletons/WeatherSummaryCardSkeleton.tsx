import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Skeleton } from "../ui/skeleton";

export const WeatherSummaryCardSkeleton = () => {
  return (
    <Card className="border-2 shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl">
          <Skeleton className="h-8 w-48" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between flex-wrap px-6">
          {[...Array(4)].map((_, index) => (
            <div
              key={index}
              className="flex flex-col items-center gap-2 p-4 rounded-lg bg-background/50"
            >
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-3 w-20" />
              <div className="flex items-baseline gap-1">
                <Skeleton className="h-8 w-12" />
                <Skeleton className="h-4 w-8" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
