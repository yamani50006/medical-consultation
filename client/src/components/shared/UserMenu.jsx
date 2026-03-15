import { LogOut, ShieldCheck, Stethoscope, UserCircle2, UserRound } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { formatRole } from "../../utils/status";
import ProfileAvatar from "./ProfileAvatar";

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
        <ProfileAvatar
          src={user?.profileImageUrl}
          name={user?.fullName}
          className="size-9 text-xs"
          fallbackClassName="text-xs font-bold"
        />
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
                <div className="relative">
                  <ProfileAvatar
                    src={user?.profileImageUrl}
                    name={user?.fullName}
                    className="size-12"
                    fallbackClassName="font-semibold"
                  />
                  <span className="absolute -bottom-1 -right-1 grid size-5 place-items-center rounded-full bg-background text-primary shadow-sm">
                    <RoleIcon className="size-3.5" />
                  </span>
                </div>
                <div>
                  <p className="font-semibold">{user?.fullName}</p>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                </div>
              </div>
            </div>

            <Link
              to="/profile"
              onClick={() => setOpen(false)}
              className="mt-3 flex w-full items-center justify-between rounded-2xl px-4 py-3 text-sm font-medium text-foreground transition-colors duration-200 hover:bg-secondary"
            >
              <span>الملف الشخصي</span>
              <UserCircle2 className="size-4" />
            </Link>

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
