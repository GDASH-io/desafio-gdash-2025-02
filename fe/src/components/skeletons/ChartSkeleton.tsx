import { Card, CardContent } from "../ui/card";
import { Skeleton } from "../ui/skeleton";

export const ChartSkeleton = () => {
  const heights = [65, 80, 55, 90, 70, 85, 60, 75, 95, 50, 70, 80];
  
  return (
    <Card>
      <CardContent>
        <div className="space-y-2">
          {/* Chart area */}
          <div className="h-[300px] flex items-end justify-between gap-2 px-4">
            {heights.map((height, index) => (
              <Skeleton
                key={index}
                className="w-full"
                style={{
                  height: `${height}%`,
                }}
              />
            ))}
          </div>
          
          {/* X-axis labels */}
          <div className="flex justify-between px-4 pt-2">
            {[...Array(6)].map((_, index) => (
              <Skeleton key={index} className="h-3 w-12" />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
