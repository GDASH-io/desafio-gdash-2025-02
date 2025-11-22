import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

type DashboardHeaderProps = {
  setSearchQuery: (query: string) => void;
};

export function DashboardHeader({ setSearchQuery }: DashboardHeaderProps) {
  return (
    <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div className="relative w-full md:w-96">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white" />

        <Input
          placeholder="Search City..."
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-dashboard-card border-none rounded-2xl h-12 text-white placeholder:text-white focus-visible:ring-1 focus-visible:ring-dashboard-highlight w-full"
        />
      </div>
      <div className="flex items-center gap-4 self-end md:self-auto">
        <div className="bg-dashboard-card px-4 py-2 rounded-2xl flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>AD</AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium text-white">Admin User</span>
        </div>
      </div>
    </header>
  );
}
