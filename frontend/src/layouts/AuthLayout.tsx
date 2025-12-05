import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function AuthLayout() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header PRIMEIRO - vai de ponta a ponta */}
      <header
        className="h-16 flex items-center justify-between px-8 flex-shrink-0 w-full"
        style={{
          backgroundImage: `url(/assets/03_0044_TOP-BAR.png)`,
          backgroundSize: "100% 100%",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="flex items-center gap-3">
          <img src="/assets/01_0009_LOGO.png" alt="Logo" className="h-8" />
          <span className="text-xl font-bold text-white tracking-tight">
            GDASH<span className="font-light">WEATHER</span>
          </span>
        </div>

        <div className="flex items-center gap-5">
          <span className="text-sm text-white/90">
            {user?.email || "admin@gdash.com"}
          </span>
          <button
            onClick={handleLogout}
            className="hover:opacity-80 transition-opacity"
            style={{ width: "85px", height: "34px" }}
          >
            <img
              src="/assets/03_0025_SAIR.png"
              alt="Sair"
              className="w-full h-full object-contain"
            />
          </button>
        </div>
      </header>

      {/* Sidebar + Conteúdo EMBAIXO do header */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside
          className="w-80 flex-shrink-0"
          style={{
            backgroundImage: `url(/assets/03_0046_BG.png)`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div
            className="h-full"
            style={{
              backgroundImage: `url(/assets/03_0045_SIDE-BOX.png)`,
              backgroundSize: "100% 100%",
              backgroundRepeat: "no-repeat",
            }}
          >
            <div className="pt-28 px-6 space-y-3">
              {/* Dashboard */}
              <button
                onClick={() => navigate("/dashboard")}
                className={`w-full relative ${
                  isActive("/dashboard") ? "" : "hover:opacity-80"
                } transition-opacity`}
                style={{ height: "56px" }}
              >
                <img
                  src={
                    isActive("/dashboard")
                      ? "/assets/03_0036_BOTÃO-LATERAL-1.png"
                      : "/assets/03_0031_BOTÃO-LATERAL-02.png"
                  }
                  alt=""
                  className="absolute inset-0 w-full h-full object-contain"
                />
                <img
                  src="/assets/03_0032_Dashboard.png"
                  alt="Dashboard"
                  className="absolute left-12 top-1/2 transform -translate-y-1/2 h-3"
                />
                <img
                  src="/assets/03_0006_CLOUD.png"
                  alt=""
                  className="absolute right-8 top-1/2 transform -translate-y-1/2 h-5"
                />
              </button>

              {/* Usuários */}
              <button
                onClick={() => navigate("/users")}
                className={`w-full relative ${
                  isActive("/users") ? "" : "hover:opacity-80"
                } transition-opacity`}
                style={{ height: "56px" }}
              >
                <img
                  src={
                    isActive("/users")
                      ? "/assets/03_0036_BOTÃO-LATERAL-1.png"
                      : "/assets/03_0031_BOTÃO-LATERAL-02.png"
                  }
                  alt=""
                  className="absolute inset-0 w-full h-full object-contain"
                />
                <img
                  src="/assets/03_0030_Usuários.png"
                  alt="Usuários"
                  className="absolute left-12 top-1/2 transform -translate-y-1/2 h-3"
                />
                <img
                  src="/assets/03_0008_AVATAR.png"
                  alt=""
                  className="absolute right-8 top-1/2 transform -translate-y-1/2 h-5"
                />
              </button>

              {/* Explorar */}
              <button
                onClick={() => navigate("/explorar")}
                className={`w-full relative ${
                  isActive("/explorar") ? "" : "hover:opacity-80"
                } transition-opacity`}
                style={{ height: "56px" }}
              >
                <img
                  src={
                    isActive("/explorar")
                      ? "/assets/03_0036_BOTÃO-LATERAL-1.png"
                      : "/assets/03_0031_BOTÃO-LATERAL-02.png"
                  }
                  alt=""
                  className="absolute inset-0 w-full h-full object-contain"
                />
                <img
                  src="/assets/03_0028_Explorar.png"
                  alt="Explorar"
                  className="absolute left-12 top-1/2 transform -translate-y-1/2 h-4"
                />
                <img
                  src="/assets/03_0009_GLOBO.png"
                  alt=""
                  className="absolute right-8 top-1/2 transform -translate-y-1/2 h-5"
                />
              </button>
            </div>
          </div>
        </aside>

        {/* Área principal de conteúdo */}
        <div
          className="flex-1"
          style={{
            backgroundImage: `url(/assets/03_0046_BG.png)`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <main className="h-full overflow-auto p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
