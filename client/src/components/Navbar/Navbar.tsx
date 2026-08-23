import { Link, useLocation } from "react-router-dom";
import { Shield, BarChart3, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

const Navbar = () => {
  const location = useLocation();

  return (
    <header className="border-b border-white/[0.06] bg-[#080808]/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.05]">
            <Shield
              className="h-5 w-5 text-zinc-300"
              strokeWidth={1.5}
            />
          </div>

          <span className="font-semibold tracking-tight text-white">
            Vanish
          </span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-1">
          <Button
            asChild
            variant="ghost"
            className={
              location.pathname === "/"
                ? "text-white hover:bg-white/[0.06]"
                : "text-zinc-500 hover:bg-white/[0.04] hover:text-white"
            }
          >
            <Link to="/">
              <Plus className="mr-2 h-4 w-4" />
              Create
            </Link>
          </Button>

          <Button
            asChild
            variant="ghost"
            className={
              location.pathname === "/dashboard"
                ? "text-white hover:bg-white/[0.06]"
                : "text-zinc-500 hover:bg-white/[0.04] hover:text-white"
            }
          >
            <Link to="/dashboard">
              <BarChart3 className="mr-2 h-4 w-4" />
              Dashboard
            </Link>
          </Button>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;