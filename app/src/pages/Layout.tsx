import { cn } from "@/lib/utils";
import { useSidebar } from "@/hooks/useSidebar";
import { Sidebar } from "@/components/Sidebar";
import { MobileHeader } from "@/components/MobileHeader";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user, sidebarOpen, setSidebarOpen, navigation, handleLogout } =
    useSidebar();

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <div
        className={cn(
          "fixed inset-0 z-50 bg-gray-900/50 lg:hidden transition-opacity",
          sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setSidebarOpen(false)}
      />

      <Sidebar
        user={user}
        sidebarOpen={sidebarOpen}
        navigation={navigation}
        onClose={() => setSidebarOpen(false)}
        onLogout={handleLogout}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <MobileHeader onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
