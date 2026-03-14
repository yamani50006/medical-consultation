import { LogOut, ShieldCheck, Stethoscope, UserRound } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import useAuth from "../../hooks/useAuth";
import { formatRole } from "../../utils/status";

const roleIcons = {
  ADMIN: ShieldCheck,
  DOCTOR: Stethoscope,
  PATIENT: UserRound
};

export default function UserMenu() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const RoleIcon = roleIcons[user?.role] || UserRound;
  const initials = user?.fullName
    ?.split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!ref.current?.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  return (
    <div ref={ref} className="relative z-[70]">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex max-w-[240px]  items-center gap-2 rounded-full border border-border/70 bg-card/80 px-4 py-2 text-left shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
      >
        <span className="grid size-9 place-items-center rounded-full bg-gradient-to-br from-primary to-accent text-xs font-bold text-primary-foreground">
          {initials || "MC"}
        </span>
        <span className="hidden max-w-[150px] pr-2 lg:block text-center">
          <span className="block truncate text-sm font-semibold leading-none ">{user?.fullName}</span>
          <span className="mt-1 block text-xs uppercase tracking-[0.16em] text-muted-foreground">
            {formatRole(user?.role)}
          </span>
        </span>
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.18 }}
            className="absolute right-0 top-16 z-[80] w-[min(18rem,calc(100vw-1.5rem))] max-w-[calc(100vw-1.5rem)] rounded-[28px] border border-border/70 bg-popover/95 p-3 shadow-2xl backdrop-blur-xl"
          >
            <div className="rounded-3xl bg-secondary/70 p-4">
              <div className="flex items-center gap-3">
                <div className="grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-primary to-accent text-primary-foreground">
                  <RoleIcon className="size-5" />
                </div>
                <div>
                  <p className="font-semibold">{user?.fullName}</p>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={logout}
              className="mt-3 flex w-full items-center justify-between rounded-2xl px-4 py-3 text-sm font-medium text-foreground transition-colors duration-200 hover:bg-secondary"
            >
              <span>تسجيل الخروج</span>
              <LogOut className="size-4" />
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
