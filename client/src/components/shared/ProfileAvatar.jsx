import { UserRound } from "lucide-react";
import { cn } from "../../utils/cn";

function getInitials(name = "") {
  return name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function ProfileAvatar({ src, name, className, fallbackClassName, iconClassName }) {
  const initials = getInitials(name);

  if (src) {
    return (
      <img
        src={src}
        alt={name ? `Profile of ${name}` : "Profile"}
        className={cn("rounded-full object-cover", className)}
      />
    );
  }

  return (
    <div
      className={cn(
        "grid place-items-center rounded-full bg-gradient-to-br from-primary to-accent text-primary-foreground",
        fallbackClassName,
        className
      )}
    >
      {initials ? <span className="font-bold">{initials}</span> : <UserRound className={cn("size-5", iconClassName)} />}
    </div>
  );
}
