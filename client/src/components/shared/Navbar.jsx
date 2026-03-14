import { Menu, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import LogoMark from "./LogoMark";
import ThemeToggle from "./ThemeToggle";
import UserMenu from "./UserMenu";
import Button from "../ui/Button";
import { cn } from "../../utils/cn";

export default function Navbar() {
  const { user, isAuthenticated } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { to: "/posts", label: "المنشورات", show: true },
    { to: "/dashboard", label: "لوحة التحكم", show: isAuthenticated },
    { to: "/doctor-posts", label: "استوديو الطبيب", show: user?.role === "DOCTOR" },
    { to: "/consultations", label: "الاستشارات", show: isAuthenticated && user?.role !== "ADMIN" },
    { to: "/appointments", label: "المواعيد", show: isAuthenticated && user?.role !== "ADMIN" },
    { to: "/admin/pending-doctors", label: "الإدارة", show: user?.role === "ADMIN" }
  ].filter((item) => item.show);

  return (
    <motion.header
      animate={{
        y: 0,
        paddingTop: isScrolled ? 12 : 20
      }}
      className="sticky top-0 z-50"
    >
      <div className="container">
        <div
          className={cn(
            "flex flex-wrap items-center justify-between gap-4 rounded-[32px] border px-4 py-3 transition-all duration-300 sm:px-6",
            isScrolled
              ? "glass-panel border-border/70 shadow-card"
              : "border-transparent bg-transparent"
          )}
        >
          <Link to="/" className="shrink-0">
            <LogoMark />
          </Link>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border/70 bg-card/70 lg:hidden"
            aria-label="فتح التنقل"
          >
            <Menu className="size-5" />
          </button>

          <nav
            className={cn(
              "order-3 w-full items-center justify-between gap-4 lg:order-2 lg:flex lg:w-auto",
              mobileOpen ? "flex flex-col items-start" : "hidden"
            )}
          >
            <div className="flex flex-wrap items-center gap-2">
              {links.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      "rounded-full px-4 py-2 text-sm text-muted-foreground transition-all duration-300 hover:bg-secondary hover:text-foreground",
                      isActive && "bg-secondary text-foreground"
                    )
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </div>

            {!isAuthenticated ? (
              <div className="flex flex-wrap items-center gap-3">
                <ThemeToggle />
                <Button asChild variant="secondary">
                  <Link to="/login">تسجيل الدخول</Link>
                </Button>
                <Button asChild variant="secondary">
                  <Link to="/register/patient">حساب مريض</Link>
                </Button>
                <Button asChild>
                  <Link to="/register/doctor" className="inline-flex items-center gap-2">
                    <Sparkles className="size-4" />
                    حساب طبيب
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <ThemeToggle />
                <UserMenu />
              </div>
            )}
          </nav>
        </div>
      </div>
    </motion.header>
  );
}
