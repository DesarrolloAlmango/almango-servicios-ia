import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useLocation } from "react-router-dom";

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
  const location = useLocation();
  const isServiciosPage = location.pathname.includes('/servicios');
  
  const [theme, setTheme] = useState<Theme>(() => {
    // If on Servicios page, default to dark mode
    if (isServiciosPage) {
      return "dark";
    }
    
    // Otherwise, check local storage first
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

  // Effect to update theme when navigating to/from Servicios page
  useEffect(() => {
    if (isServiciosPage && theme === "light") {
      setTheme("dark");
    }
  }, [isServiciosPage]);

  useEffect(() => {
    // Save to localStorage
    localStorage.setItem("theme", theme);
    
    // Apply to document
    const root = window.document.documentElement;
    
    // First remove both classes
    root.classList.remove("dark", "light");
    
    // Then add the current theme
    root.classList.add(theme);
    
    // Additionally, for dark mode, add a class to the body
    if (theme === "dark") {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
    
    console.log("Theme changed to:", theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
