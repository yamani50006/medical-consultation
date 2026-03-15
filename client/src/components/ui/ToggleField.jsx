import { cn } from "../../utils/cn";

export default function ToggleField({
  label,
  description,
  checked,
  onChange,
  className,
  disabled = false,
  ...props
}) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-start justify-between gap-4 rounded-[22px] border border-border/70 bg-card/60 px-4 py-3 transition-colors duration-300",
        checked ? "border-primary/30 bg-primary/5" : "hover:border-primary/20",
        disabled ? "cursor-not-allowed opacity-60" : "",
        className
      )}
    >
      <div className="space-y-1">
        <p className="text-sm font-medium text-foreground">{label}</p>
        {description ? <p className="text-xs leading-6 text-muted-foreground">{description}</p> : null}
      </div>

      <span className="relative mt-1 inline-flex h-6 w-11 shrink-0 items-center">
        <input
          type="checkbox"
          className="peer sr-only"
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          {...props}
        />
        <span className="absolute inset-0 rounded-full bg-muted transition-colors duration-300 peer-checked:bg-primary" />
        <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-300 peer-checked:translate-x-5" />
      </span>
    </label>
  );
}
