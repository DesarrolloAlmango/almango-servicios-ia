
import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type Theme = "dark" | "light";

type ThemeContextType = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const ThemeContext = createContext<ThemeContextType>({
  theme: "light",
  setTheme: () => {},
});

interface ThemeProviderProps {
  children: ReactNode;
  forceDarkMode?: boolean;
}

export const ThemeProvider = ({ children, forceDarkMode = false }: ThemeProviderProps) => {
  const [theme, setTheme] = useState<Theme>(() => {
    if (forceDarkMode) return "dark";
    
    // Check local storage if not forcing dark mode
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem("theme") as Theme;
      if (savedTheme === "dark" || savedTheme === "light") {
        return savedTheme;
      }
    }
    
    // Default to light
    return "light";
  });

  useEffect(() => {
    // If forceDarkMode is enabled, ensure we're using dark theme
    if (forceDarkMode && theme !== "dark") {
      setTheme("dark");
      return;
    }
    
    // Apply theme to document
    const root = window.document.documentElement;
    root.classList.remove("dark", "light");
    root.classList.add(theme);
    
    // Apply dark class to body if needed
    if (theme === "dark") {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
    
    // Only save to localStorage if not forcing dark mode
    if (!forceDarkMode) {
      localStorage.setItem("theme", theme);
    }
    
    console.log("Theme applied:", theme, forceDarkMode ? "(forced dark mode)" : "");
  }, [theme, forceDarkMode]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
