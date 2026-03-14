import { useContext } from "react";
import { ThemeContext } from "../context/ThemeProvider";

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("يجب استخدام useTheme داخل ThemeProvider.");
  }

  return context;
}
