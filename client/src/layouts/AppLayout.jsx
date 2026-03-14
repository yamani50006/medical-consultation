import { AnimatePresence, motion } from "framer-motion";
import { useLocation, useOutlet } from "react-router-dom";
import { usePageTransition } from "../hooks/usePageTransition";
import AppHeader from "../components/shared/AppHeader";
import FloatingShapes from "../components/shared/FloatingShapes";

export default function AppLayout() {
  const outlet = useOutlet();
  const location = useLocation();
  const { variants } = usePageTransition();

  return (
    <div className="relative min-h-screen">
      <FloatingShapes />
      <AppHeader />
      <main className="container pb-16 pt-5 sm:pt-6 lg:pt-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            {outlet}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
