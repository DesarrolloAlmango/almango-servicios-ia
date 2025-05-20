
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Servicios from "./pages/Servicios";
import { ThemeProvider } from "./hooks/useTheme";

// Configure the query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

const App = () => {
  // Initialize global variables for cross-component communication
  useEffect(() => {
    // Clear any previous values on app start
    window.lastSelectedServiceId = undefined;
    window.lastSelectedCategoryName = undefined;
    
    // Add global event to handle category selection (for debugging purposes)
    const handleCategorySelected = (e: CustomEvent) => {
      console.log("App received category selected event:", e.detail);
    };
    
    const handleOpenCategory = (e: CustomEvent) => {
      console.log("App received open category event:", e.detail);
    };
    
    document.addEventListener('categorySelected', handleCategorySelected as EventListener);
    document.addEventListener('openCategory', handleOpenCategory as EventListener);
    
    // Handle any global initialization
    console.log("App initialized with event listeners");
    
    return () => {
      document.removeEventListener('categorySelected', handleCategorySelected as EventListener);
      document.removeEventListener('openCategory', handleOpenCategory as EventListener);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/servicios" element={<Servicios />} />
              <Route path="/servicios/:userId/:commerceId" element={<Servicios />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
