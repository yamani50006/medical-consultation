import { motion, useReducedMotion } from "framer-motion";

const shapes = [
  "left-[8%] top-28 h-32 w-32 bg-cyan-400/18",
  "right-[12%] top-44 h-24 w-24 bg-emerald-400/18",
  "left-[20%] bottom-24 h-16 w-16 bg-sky-400/12",
  "right-[18%] bottom-12 h-40 w-40 bg-teal-500/12"
];

export default function FloatingShapes() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {shapes.map((shape, index) => (
        <motion.div
          key={shape}
          data-float-shape
          className={`absolute rounded-full blur-3xl ${shape}`}
          animate={
            reduceMotion
              ? undefined
              : {
                  y: [0, -14 - index * 2, 0],
                  x: [0, index % 2 === 0 ? 10 : -8, 0]
                }
          }
          transition={
            reduceMotion
              ? undefined
              : {
                  duration: 7 + index,
                  repeat: Infinity,
                  ease: "easeInOut"
                }
          }
        />
      ))}
      <div className="absolute inset-x-0 top-0 h-72 bg-grid-fade opacity-60 dark:opacity-35" />
    </div>
  );
}
