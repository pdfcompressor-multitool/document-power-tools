import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";
import { Loader2 } from "lucide-react";

// Eager load the homepage for fast initial render
import Index from "./pages/Index";

// Lazy load all tool pages for better code splitting
const PDFCompressor = lazy(() => import("./pages/PDFCompressor"));
const CompressPDF200KB = lazy(() => import("./pages/CompressPDF200KB"));
const CompressPDF100KB = lazy(() => import("./pages/CompressPDF100KB"));
const JPGtoPDF = lazy(() => import("./pages/JPGtoPDF"));
const PDFtoJPG = lazy(() => import("./pages/PDFtoJPG"));
const ImageCompressor = lazy(() => import("./pages/ImageCompressor"));
const MergePDF = lazy(() => import("./pages/MergePDF"));
const SplitPDF = lazy(() => import("./pages/SplitPDF"));
const SignPDF = lazy(() => import("./pages/SignPDF"));
const ProtectPDF = lazy(() => import("./pages/ProtectPDF"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

// Loading fallback component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-background">
    <div className="flex flex-col items-center gap-4">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
      <p className="text-muted-foreground">Loading...</p>
    </div>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />

      {/* GitHub Pages SAFE router */}
      <HashRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/pdf-compressor" element={<PDFCompressor />} />
            <Route path="/compress-pdf-200kb" element={<CompressPDF200KB />} />
            <Route path="/compress-pdf-100kb" element={<CompressPDF100KB />} />
            <Route path="/jpg-to-pdf" element={<JPGtoPDF />} />
            <Route path="/pdf-to-jpg" element={<PDFtoJPG />} />
            <Route path="/image-compressor" element={<ImageCompressor />} />
            <Route path="/merge-pdf" element={<MergePDF />} />
            <Route path="/split-pdf" element={<SplitPDF />} />
            <Route path="/sign-pdf" element={<SignPDF />} />
            <Route path="/protect-pdf" element={<ProtectPDF />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </HashRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;