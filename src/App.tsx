import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import CulturesPage from "./pages/CulturesPage";
import SettingsPage from "./pages/SettingsPage";
import InventoryPage from "./pages/InventoryPage";
import InventoryAdjustPage from "./pages/InventoryAdjustPage";
import AvailabilityPage from "./pages/AvailabilityPage";
import AvailabilityConfigPage from "./pages/AvailabilityConfigPage";
import HarvestWizardPage from "./pages/HarvestWizardPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <TooltipProvider>
        <Toaster />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/cultures" element={<CulturesPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/inventory" element={<InventoryPage />} />
            <Route path="/inventory/adjust" element={<InventoryAdjustPage />} />
            <Route path="/availability" element={<AvailabilityPage />} />
            <Route path="/availability/config" element={<AvailabilityConfigPage />} />
            <Route path="/harvest/new" element={<HarvestWizardPage />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
