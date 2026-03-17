import { Check, Laptop, Moon, Sun } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTheme } from "../../hooks/useTheme";
import { cn } from "../../utils/cn";

const options = [
  { value: "light", label: "فاتح", icon: Sun },
  { value: "dark", label: "داكن", icon: Moon },
  { value: "system", label: "النظام", icon: Laptop }
];

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const panelRef = useRef(null);
  const [panelPosition, setPanelPosition] = useState({ top: 0, right: 0 });

  const active = options.find((option) => option.value === theme) || options[2];
  const ActiveIcon = active.icon;

  useEffect(() => {
    const handlePointerDown = (event) => {
      const clickedTrigger = ref.current?.contains(event.target);
      const clickedPanel = panelRef.current?.contains(event.target);

      if (!clickedTrigger && !clickedPanel) {
        setOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    const updatePosition = () => {
      const rect = ref.current?.getBoundingClientRect();
      if (!rect) {
        return;
      }

      setPanelPosition({
        top: rect.bottom + 12,
        right: Math.max(window.innerWidth - rect.right, 12)
      });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative z-[70]">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border/70 bg-card/80 text-foreground shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
        aria-label="تبديل المظهر"
        aria-expanded={open}
      >
        <ActiveIcon className="size-4" />
      </button>

      {open
        ? createPortal(
            <div
              ref={panelRef}
              style={panelPosition}
              className="fixed z-[120] w-40 max-w-[calc(100vw-1.5rem)] rounded-3xl border border-border/70 bg-popover/95 p-2 shadow-2xl backdrop-blur-xl"
            >
              {options.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      setTheme(option.value);
                      setOpen(false);
                    }}
                    className={cn(
                      "flex w-full items-center justify-between rounded-2xl px-3 py-2.5 text-sm transition-colors duration-200",
                      option.value === theme
                        ? "bg-primary/10 text-primary"
                        : "text-foreground/85 hover:bg-secondary"
                    )}
                  >
                    <span className="flex items-center gap-2">
                      <Icon className="size-4" />
                      {option.label}
                    </span>
                    {option.value === theme ? <Check className="size-4" /> : null}
                  </button>
                );
              })}
            </div>,
            document.body
          )
        : null}
    </div>
  );
}
