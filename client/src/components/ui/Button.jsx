import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "../../utils/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold transition-all duration-300",
  {
    variants: {
      variant: {
        primary:
          "border border-primary/20 bg-primary text-primary-foreground shadow-glow hover:bg-primary/90",
        secondary:
          "border border-border/70 bg-card/80 text-card-foreground hover:border-primary/30 hover:bg-card",
        ghost:
          "border border-transparent bg-transparent text-foreground hover:border-border/70 hover:bg-secondary/60",
        danger:
          "border border-destructive/20 bg-destructive text-destructive-foreground hover:bg-destructive/90"
      },
      size: {
        sm: "h-9 px-4",
        md: "h-11 px-5",
        lg: "h-12 px-6 text-[15px]"
      }
    },
    defaultVariants: {
      variant: "primary",
      size: "md"
    }
  }
);

export default function Button({
  children,
  variant,
  size,
  className,
  asChild = false,
  ...props
}) {
  const reduceMotion = useReducedMotion();
  if (asChild) {
    return (
      <Slot className={cn(buttonVariants({ variant, size }), className)} {...props}>
        {children}
      </Slot>
    );
  }

  return (
    <motion.button
      className={cn(buttonVariants({ variant, size }), "will-change-transform", className)}
      whileHover={reduceMotion || props.disabled ? undefined : { y: -2, scale: 1.02 }}
      whileTap={reduceMotion || props.disabled ? undefined : { scale: 0.985 }}
      {...props}
    >
      {children}
    </motion.button>
  );
}
