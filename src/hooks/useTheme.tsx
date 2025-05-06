
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

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    // Check local storage first
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem("theme") as Theme;
      if (savedTheme === "dark" || savedTheme === "light") {
        return savedTheme;
      }
      
      // Check system preference
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return "dark";
      }
    }
    
    // Default to light
    return "light";
  });

  useEffect(() => {
    // Save to localStorage
    localStorage.setItem("theme", theme);
    
    // Apply to document
    const root = window.document.documentElement;
    
    // First remove both classes
    root.classList.remove("dark", "light");
    
    // Then add the current theme
    root.classList.add(theme);
    
    // Note: We don't add dark class to body anymore
    // This is now handled per-page with conditional classes
    
    console.log("Theme changed to:", theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
