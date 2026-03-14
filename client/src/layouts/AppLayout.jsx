import { AnimatePresence, motion } from "framer-motion";
import { useLocation, useOutlet } from "react-router-dom";
import { usePageTransition } from "../hooks/usePageTransition";
import Navbar from "../components/shared/Navbar";
import FloatingShapes from "../components/shared/FloatingShapes";

export default function AppLayout() {
  const outlet = useOutlet();
  const location = useLocation();
  const { variants } = usePageTransition();

  return (
    <div className="relative min-h-screen">
      <FloatingShapes />
      <Navbar />
      <main className="container pb-16 pt-4 sm:pt-6">
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
