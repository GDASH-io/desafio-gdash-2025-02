import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Button } from "./ui/button";

const Navbar: React.FC = () => {
  const { logout, isAuthenticated } = useAuth();

  return (
    <header className="bg-[#28364F] shadow-md">
      <div className="container mx-auto flex justify-between items-center p-4">
        <div className="flex items-center space-x-4">
          <Link to="/dashboard">
            <img
              src="https://gdash.io/wp-content/uploads/2025/02/logo.gdash_.white_.png"
              alt="GDASH Logo"
              className="h-8 md:h-10"
            />
          </Link>
          <Link
            to="/dashboard"
            className="text-gray-100 hover:text-[#50E3D2] transition-all duration-500"
          >
            Dashboard
          </Link>
          <Link
            to="/users"
            className="text-gray-100 hover:text-[#50E3D2] transition-all duration-500"
          >
            Usuários
          </Link>
          <Link
            to="/explorar"
            className="text-gray-100 hover:text-[#50E3D2] transition-all duration-500"
          >
            Explorar (SWAPI)
          </Link>
        </div>

        {isAuthenticated && (
          <Button
            variant={"gdash"}
            className="hover:bg-opacity-80"
            onClick={logout}
          >
            Logout
          </Button>
        )}
      </div>
    </header>
  );
};

export default Navbar;
