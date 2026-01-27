import { useState } from "react";
import { saveAs } from "file-saver";
import * as pdfjsLib from "pdfjs-dist";
import { jsPDF } from "jspdf";
import ToolLayout from "@/components/ToolLayout";
import FileUpload from "@/components/FileUpload";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.mjs",
  import.meta.url
).toString();

const SEOContent = () => (
  <div className="mt-12 space-y-8 text-sm">
    <section>
      <h2 className="text-xl font-semibold text-foreground mb-3">
        Compress PDF Online – Reduce File Size for Email and Forms
      </h2>
      <p className="text-muted-foreground leading-relaxed">
        Our PDF compressor helps you reduce file sizes for job application portals, 
        college admission forms, and government document submissions. Whether you need 
        to compress PDF for Aadhaar card upload, passport applications, or PAN card 
        submissions, this tool delivers optimal compression without quality loss.
      </p>
      <p className="text-muted-foreground leading-relaxed mt-3">
        Need stricter size limits? Try our <a href="#/compress-pdf-200kb" className="text-primary hover:underline">Compress to 200KB</a> or <a href="#/compress-pdf-100kb" className="text-primary hover:underline">Compress to 100KB</a> tools 
        for government form uploads with strict file size requirements.
      </p>
    </section>
    
    <section>
      <h2 className="text-xl font-semibold text-foreground mb-3">
        How PDF Compression Works
      </h2>
      <p className="text-muted-foreground leading-relaxed">
        The compressor converts each PDF page to an optimized image format, then 
        rebuilds the document with your chosen quality level. Lower quality settings 
        produce smaller files—perfect for online forms with strict size limits. 
        For documents with text only, even 50% quality often looks identical to the original.
      </p>
    </section>
    
    <section>
      <h2 className="text-xl font-semibold text-foreground mb-3">
        Why Use DocFlow for PDF Compression?
      </h2>
      <ul className="text-muted-foreground space-y-2">
        <li>• <strong>100% Private:</strong> Files never leave your device—all processing happens in your browser</li>
        <li>• <strong>No Account Required:</strong> Use instantly without registration or email</li>
        <li>• <strong>No File Uploads:</strong> Unlike other tools, we don't upload your documents to external servers</li>
        <li>• <strong>Fast Processing:</strong> Compress PDFs in seconds, not minutes</li>
        <li>• <strong>Adjustable Quality:</strong> Choose the compression level that works for your needs</li>
      </ul>
    </section>
  </div>
);

const PDFCompressor = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [quality, setQuality] = useState([70]);
  const { toast } = useToast();

  const compressPDF = async () => {
    if (!selectedFile) return;
    
    setProcessing(true);
    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const numPages = pdf.numPages;
      
      const firstPage = await pdf.getPage(1);
      const viewport = firstPage.getViewport({ scale: 1 });
      const isLandscape = viewport.width > viewport.height;
      
      const doc = new jsPDF({
        orientation: isLandscape ? 'landscape' : 'portrait',
        unit: 'pt',
        format: [viewport.width, viewport.height]
      });
      
      for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i);
        const pageViewport = page.getViewport({ scale: 1.5 });
        
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d')!;
        canvas.height = pageViewport.height;
        canvas.width = pageViewport.width;
        
        await page.render({
          canvasContext: context,
          viewport: pageViewport,
          canvas: canvas,
        } as any).promise;
        
        const imgData = canvas.toDataURL('image/jpeg', quality[0] / 100);
        
        if (i > 1) {
          const currentViewport = page.getViewport({ scale: 1 });
          doc.addPage([currentViewport.width, currentViewport.height]);
        }
        
        const currentPageViewport = page.getViewport({ scale: 1 });
        doc.addImage(imgData, 'JPEG', 0, 0, currentPageViewport.width, currentPageViewport.height);
      }
      
      const compressedBlob = doc.output('blob');
      const originalSize = selectedFile.size;
      const reduction = ((originalSize - compressedBlob.size) / originalSize * 100).toFixed(1);
      
      saveAs(compressedBlob, `compressed_${selectedFile.name}`);
      
      toast({
        title: "PDF Compressed",
        description: `Size reduced by ${reduction}%. Original: ${(originalSize / 1024 / 1024).toFixed(2)}MB → Compressed: ${(compressedBlob.size / 1024 / 1024).toFixed(2)}MB`,
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Compression Failed",
        description: "There was an error compressing your PDF.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
  };

  const howToSteps = [
    { name: "Upload your PDF", text: "Click the upload area or drag and drop your PDF file. Maximum file size is 50MB." },
    { name: "Adjust quality", text: "Use the slider to set compression level. Lower quality means smaller file size." },
    { name: "Compress", text: "Click 'Compress PDF' to process your file locally in your browser." },
    { name: "Download", text: "Your compressed PDF will automatically download when ready." },
  ];

  const faqItems = [
    { question: "Is my PDF uploaded to a server?", answer: "No. All processing happens entirely in your browser. Your files never leave your device, ensuring complete privacy." },
    { question: "What quality setting should I use?", answer: "For text documents, 50-60% quality usually works well. For documents with images, try 70-80% for good balance between size and quality." },
    { question: "How small can I compress my PDF?", answer: "The compression ratio depends on your original PDF. For strict size limits, try our Compress to 100KB or 200KB tools." },
  ];

  return (
    <ToolLayout
      title="PDF Compressor"
      description="Reduce PDF file size by adjusting image quality. Perfect for job applications and government forms."
      seoTitle="Compress PDF Online Free – Reduce File Size | DocFlow"
      seoDescription="Free PDF compressor for job applications, government forms, and email attachments. Compress PDF files securely in your browser—no uploads, no account required."
      seoContent={<SEOContent />}
      howToSteps={howToSteps}
      faqItems={faqItems}
    >
      <div className="space-y-6">
        <FileUpload
          onFileSelect={handleFileSelect}
          accept=".pdf"
          maxSize={50}
        />
        
        {selectedFile && !processing && (
          <div className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-1">Selected: {selectedFile.name}</p>
              <p className="text-sm text-muted-foreground">Size: {(selectedFile.size / 1024 / 1024).toFixed(2)}MB</p>
            </div>
            
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground">Quality: {quality[0]}%</label>
              <Slider
                value={quality}
                onValueChange={setQuality}
                min={10}
                max={100}
                step={5}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">Lower quality = smaller file size</p>
            </div>
            
            <Button onClick={compressPDF} className="w-full">
              Compress PDF
            </Button>
          </div>
        )}
        
        {processing && (
          <div className="flex items-center justify-center gap-3 py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <p className="text-muted-foreground">Compressing your PDF...</p>
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default PDFCompressor;
