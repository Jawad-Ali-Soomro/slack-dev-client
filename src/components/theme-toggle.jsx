import { Moon, Sun } from "lucide-react";
import { m, AnimatePresence } from "framer-motion";
import { useTheme } from "../contexts/theme-context";

export const ThemeToggle = ({ className = "" }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <m.button
      onClick={toggleTheme}
      className={`border rounded-[15px] cursor-pointer hover:shadow-lg border-gray-300 dark:border-gray-700 ${className}`}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
    >
      <AnimatePresence mode="wait" initial={false}>
        {theme === "light" ? (
          <m.div
            key="moon"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Moon className="w-4 h-4 icon" />
          </m.div>
        ) : (
          <m.div
            key="sun"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Sun className="w-4 h-4 icon" />
          </m.div>
        )}
      </AnimatePresence>
    </m.button>
  );
};
