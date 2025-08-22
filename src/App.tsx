
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Provider } from 'react-redux';
import { store } from '@/store';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { useEffect } from 'react';
import { useAppDispatch } from '@/hooks/useRedux';
import { initializeDarkMode } from '@/store/slices/uiSlice';

// App bileşeninin içindeki tema başlatma logic'i için ayrı bileşen
function AppContent({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  
  useEffect(() => {
    // Tema sistemini başlat
    dispatch(initializeDarkMode());
  }, [dispatch]);
  
  return <>{children}</>;
}
import Layout from './components/layout/Layout';
import Index from "./pages/Index";
import DanisanlarPage from "./pages/DanisanlarPage";
import DanisanDetayPage from "./pages/DanisanDetayPage";
import TestlerPage from "./pages/TestlerPage";
import RaporDetayPage from "./pages/RaporDetayPage";
import AyarlarPage from "./pages/AyarlarPage";
import TestInterfacePage from "./pages/TestInterfacePage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <Provider store={store}>
      <AppContent>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter
              future={{
                v7_startTransition: true,
                v7_relativeSplatPath: true
              }}
            >
              <Routes>
                <Route path="/" element={<Layout />}>
                  <Route index element={<Index />} />
                  <Route path="/danisanlar" element={<DanisanlarPage />} />
                  <Route path="/danisan/:id" element={<DanisanDetayPage />} />
                  <Route path="/testler" element={<TestlerPage />} />
                  <Route path="/rapor/:id" element={<RaporDetayPage />} />
                  <Route path="/ayarlar" element={<AyarlarPage />} />
                </Route>
                <Route path="/test-interface/:method/:testId/:danisanId" element={<TestInterfacePage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </QueryClientProvider>
      </AppContent>
    </Provider>
  </ErrorBoundary>
);

export default App;
