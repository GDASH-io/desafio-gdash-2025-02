import { Badge } from "@/components/ui/badge";
import type { Launch } from "@/lib/externalApi";

export const StatusBadge = (launch: Launch | null) => {
    if (!launch) return null;
    if (launch.upcoming) {
      return <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-100 text-xs py-1 px-2">Upcoming</Badge>;}
    
    if (launch.success) {
      return <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100 text-xs py-1 px-2">Success</Badge>;}
    
    return <Badge variant="secondary" className="bg-red-100 text-red-800 hover:bg-red-100 text-xs py-1 px-2">Failed</Badge>;
  }