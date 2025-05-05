
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Servicios from "./pages/Servicios";
import { ThemeProvider } from "./hooks/useTheme";

const queryClient = new QueryClient();

// Component that forces dark mode only on the services page
const ThemedApp = () => {
  const location = useLocation();
  const isServicesPage = location.pathname.includes('/servicios');
  
  return (
    <ThemeProvider forceDarkMode={isServicesPage}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/servicios" element={<Servicios />} />
          <Route path="/servicios/:userId/:commerceId" element={<Servicios />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </ThemeProvider>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <ThemedApp />
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
