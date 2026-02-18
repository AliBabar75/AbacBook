import { Outlet, useNavigate } from "react-router-dom";
import { Sidebar } from "./Sidebar";

export function AppLayout() {
  const navigate = useNavigate();

  const handleLogout = () => {
 
    localStorage.removeItem("auth_token");
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex w-full bg-background">
      <Sidebar onLogout={handleLogout} />
      <main className="flex-1 lg:ml-0 overflow-auto">
        <div className="p-6 lg:p-8 animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
