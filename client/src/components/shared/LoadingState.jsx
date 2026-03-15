import Skeleton from "../ui/Skeleton";
import { cn } from "../../utils/cn";

export default function LoadingState({ rows = 3, className, compact = false }) {
  return (
    <div className={cn("space-y-3", className)}>
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className={cn(
            "rounded-[26px] border border-border/60 bg-card/40 p-4",
            compact ? "space-y-3" : "space-y-4 p-5"
          )}
        >
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className={cn("w-full", compact ? "h-12" : "h-20")} />
        </div>
      ))}
    </div>
  );
}
