import { useState } from "react";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Home, CalendarDays } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function Sidebar() {
  const navigate = useNavigate();
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

  const buttons = [
    { icon: Home, label: "Dashboard", route: "/dashboard" },
    { icon: CalendarDays, label: "Forecast", route: "/forecast" },
  ];

  return (
    <>
      <div
        className={`
          hidden md:flex flex-col justify-between
          transition-all duration-300 ease-in-out
          bg-gradient-to-br from-blue-700 to-indigo-900 text-white
          backdrop-blur-xl border-r border-white/20 shadow-lg fixed h-screen
          ${isSidebarExpanded ? "w-64" : "w-20"}
        `}
        onMouseEnter={() => setIsSidebarExpanded(true)}
        onMouseLeave={() => setIsSidebarExpanded(false)}
      >
        <div className="flex flex-col items-center mt-6 gap-8 w-full">
          <Avatar
            className={`flex-shrink-0 transition-all duration-300 ${isSidebarExpanded ? "w-20 h-20" : "w-12 h-12"}`}
          >
            <AvatarFallback className="bg-blue-600">F</AvatarFallback>
          </Avatar>


          <div className="flex flex-col w-full px-2 gap-5 mt-4">
            {buttons.map((btn, i) => (
              <Button
                onClick={() => navigate(btn.route)}
                key={i}
                variant="ghost"
                className="flex items-center w-full justify-start p-4 h-12 rounded-xl hover:bg-white/20 hover:text-white transition-all duration-300"
              >
                <div className="flex items-center w-full">
                  <btn.icon
                    className={`transition-all duration-300 ${isSidebarExpanded ? "w-7 h-7" : "w-8 h-8"}`}
                  />
                  <span className={`transition-all duration-300 text-[17px] whitespace-nowrap overflow-hidden ml-4 ${isSidebarExpanded ? "opacity-100 max-w-[150px]" : "opacity-0 max-w-0"}`}>
                    {btn.label}
                  </span>
                </div>
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex md:hidden fixed top-0 left-0 w-full bg-gradient-to-br from-blue-700 to-indigo-900 text-white backdrop-blur-xl border-b border-white/20 shadow-lg z-50">
        <div className="flex items-center justify-around w-full p-2">
          {buttons.map((btn, i) => (
            <button
              key={i}
              onClick={() => navigate(btn.route)}
              className="flex flex-col items-center justify-center p-2 hover:bg-white/20 rounded-lg transition"
            >
              <btn.icon className="w-6 h-6"/>
              <span className="text-xs mt-1">{btn.label}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
