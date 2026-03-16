import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { LogOut, Menu, Sparkles, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useConversationStore } from "../../features/chat/conversation.store";
import { useNotificationStore } from "../../features/notifications/notifications.store";
import useAuth from "../../hooks/useAuth";
import { formatRole } from "../../utils/status";
import { cn } from "../../utils/cn";
import Button from "../ui/Button";
import LogoMark from "./LogoMark";
import ProfileAvatar from "./ProfileAvatar";
import ThemeToggle from "./ThemeToggle";
import UserMenu from "./UserMenu";

export default function AppHeader() {
  const { user, isAuthenticated, logout } = useAuth();
  const unreadConversations = useConversationStore((state) => state.meta.unreadCount || 0);
  const unreadNotifications = useNotificationStore((state) => state.meta.unreadCount || 0);
  const location = useLocation();
  const reduceMotion = useReducedMotion();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const links = useMemo(
    () =>
      [
        { to: "/posts", label: "المنشورات", show: true },
        { to: "/profile", label: "الملف الشخصي", show: isAuthenticated },
        { to: "/dashboard", label: "لوحة التحكم", show: isAuthenticated },
        {
          to: user?.role === "PATIENT" ? "/patient/treatment-plans" : "/doctor/treatment-plans",
          label: "الخطط العلاجية",
          show: isAuthenticated && user?.role !== "ADMIN"
        },
        { to: "/groups", label: "المجموعات", show: isAuthenticated && user?.role !== "ADMIN" },
        { to: "/doctor-posts", label: "استوديو الطبيب", show: user?.role === "DOCTOR" },
        { to: "/consultations", label: "الاستشارات", show: isAuthenticated && user?.role !== "ADMIN" },
        {
          to: "/conversations",
          label: "المحادثات",
          badgeCount: unreadConversations,
          show: isAuthenticated && user?.role !== "ADMIN"
        },
        { to: "/appointments", label: "المواعيد", show: isAuthenticated && user?.role !== "ADMIN" },
        {
          to: "/notifications",
          label: "الإشعارات",
          badgeCount: unreadNotifications,
          show: isAuthenticated && user?.role !== "ADMIN"
        },
        {
          to: user?.role === "PATIENT" ? "/patient/reviews" : "/doctor/reviews",
          label: "التقييمات",
          show: user?.role === "PATIENT" || user?.role === "DOCTOR"
        },
        { to: "/admin/dashboard", label: "لوحة الإدارة", show: user?.role === "ADMIN" },
        { to: "/admin/doctors", label: "إدارة الأطباء", show: user?.role === "ADMIN" },
        { to: "/admin/pending-doctors", label: "الطلبات المعلقة", show: user?.role === "ADMIN" }
      ].filter((item) => item.show),
    [isAuthenticated, unreadConversations, unreadNotifications, user?.role]
  );

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
            "relative overflow-visible rounded-[30px] border px-3 py-3 transition-all duration-300 sm:px-5 lg:px-6",
            isScrolled
              ? "glass-panel border-border/70 shadow-card"
              : "border-border/50 bg-background/65 shadow-[0_18px_60px_-34px_rgba(15,23,42,0.28)] backdrop-blur-xl"
          )}
        >
          <div className="flex items-center justify-between gap-3">
            <Link to="/" className="min-w-0 shrink">
              <LogoMark />
            </Link>

            <div className="flex items-center gap-2">
              <ThemeToggle />

              <div className="hidden items-center gap-2 lg:flex">
                {isAuthenticated ? <UserMenu /> : <GuestActions />}
              </div>

              <button
                type="button"
                onClick={() => setMobileOpen((prev) => !prev)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-border/70 bg-card/80 text-foreground shadow-sm transition-all duration-300 hover:border-primary/30 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 lg:hidden"
                aria-label={mobileOpen ? "إغلاق القائمة" : "فتح القائمة"}
                aria-expanded={mobileOpen}
              >
                {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
              </button>
            </div>
          </div>

          <div className="mt-4 hidden border-t border-border/60 pt-4 lg:block">
            <nav className="flex flex-wrap items-center gap-2">
              {links.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      "inline-flex items-center justify-center rounded-2xl border px-4 py-2.5 text-sm font-medium transition-all duration-300",
                      isActive
                        ? "border-primary/25 bg-primary/10 text-primary shadow-sm"
                        : "border-transparent text-muted-foreground hover:border-border/70 hover:bg-secondary/70 hover:text-foreground"
                    )
                  }
                >
                  <NavLabel label={item.label} badgeCount={item.badgeCount} />
                </NavLink>
              ))}
            </nav>
          </div>

          <AnimatePresence initial={false}>
            {mobileOpen ? (
              <motion.div
                initial={reduceMotion ? false : { opacity: 0, y: -10 }}
                animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
                className="mt-4 border-t border-border/60 pt-4 lg:hidden"
              >
                {isAuthenticated ? (
                  <div className="mb-4 rounded-[24px] border border-border/60 bg-secondary/45 p-4">
                    <div className="flex items-center gap-3">
                      <ProfileAvatar
                        src={user?.profileImageUrl}
                        name={user?.fullName}
                        className="size-12"
                        fallbackClassName="font-semibold"
                      />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold ">{user?.fullName}</p>
                        <p className="mt-1 truncate text-xs text-muted-foreground">{user?.email}</p>
                        <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary/80">
                          {formatRole(user?.role)}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : null}

                <nav className="grid gap-2 sm:grid-cols-2">
                  {links.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      className={({ isActive }) =>
                        cn(
                          "inline-flex min-h-12 items-center justify-between rounded-[20px] border px-4 py-3 text-sm font-medium transition-all duration-300",
                          isActive
                            ? "border-primary/25 bg-primary/10 text-primary"
                            : "border-border/60 bg-card/65 text-foreground hover:border-primary/20 hover:bg-secondary/70"
                        )
                      }
                    >
                      <NavLabel label={item.label} badgeCount={item.badgeCount} />
                    </NavLink>
                  ))}
                </nav>

                <div className="mt-4">
                  {isAuthenticated ? (
                    <Button
                      type="button"
                      variant="ghost"
                      className="w-full justify-between rounded-[20px] border border-border/60 bg-card/65 px-4"
                      onClick={logout}
                    >
                      <LogOut className="size-4" />
                      تسجيل الخروج
                    </Button>
                  ) : (
                    <GuestActions mobile />
                  )}
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </motion.header>
  );
}

function NavLabel({ label, badgeCount = 0 }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span>{label}</span>
      {badgeCount ? (
        <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-primary/12 px-2 py-0.5 text-[11px] font-bold text-primary">
          {badgeCount}
        </span>
      ) : null}
    </span>
  );
}

function GuestActions({ mobile = false }) {
  return (
    <div className={cn("gap-2", mobile ? "grid grid-cols-1 sm:grid-cols-3" : "flex items-center")}>
      <Button asChild variant="ghost" size="sm" className={mobile ? "w-full" : ""}>
        <Link to="/login">تسجيل الدخول</Link>
      </Button>
      <Button asChild variant="secondary" size="sm" className={mobile ? "w-full" : ""}>
        <Link to="/register/patient">حساب مريض</Link>
      </Button>
      <Button asChild size="sm" className={mobile ? "w-full" : ""}>
        <Link to="/register/doctor" className="inline-flex items-center gap-2">
          <Sparkles className="size-4" />
          حساب طبيب
        </Link>
      </Button>
    </div>
  );
}
