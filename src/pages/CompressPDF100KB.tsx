import { useState } from "react";
import { saveAs } from "file-saver";
import * as pdfjsLib from "pdfjs-dist";
import { jsPDF } from "jspdf";
import ToolLayout from "@/components/ToolLayout";
import FileUpload from "@/components/FileUpload";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

const CompressPDF100KB = () => {
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();

  const targetSize = 100 * 1024; // 100KB in bytes

  const compressToTargetSize = async (file: File) => {
    setProcessing(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const numPages = pdf.numPages;
      
      // Binary search for optimal quality
      let minQuality = 5;
      let maxQuality = 95;
      let bestBlob: Blob | null = null;
      let bestQuality = minQuality;
      
      // First, try with minimum quality to see if target is achievable
      const minBlob = await createCompressedPDF(pdf, numPages, minQuality);
      
      if (minBlob.size > targetSize) {
        // Can't achieve target even with minimum quality
        bestBlob = minBlob;
        toast({
          title: "Target size not achievable",
          description: `Minimum possible size is ${(minBlob.size / 1024).toFixed(0)}KB. Try removing pages or using a smaller PDF.`,
        });
      } else {
        // Binary search for optimal quality
        while (maxQuality - minQuality > 5) {
          const midQuality = Math.floor((minQuality + maxQuality) / 2);
          const blob = await createCompressedPDF(pdf, numPages, midQuality);
          
          if (blob.size <= targetSize) {
            bestBlob = blob;
            bestQuality = midQuality;
            minQuality = midQuality;
          } else {
            maxQuality = midQuality;
          }
        }
        
        // Final pass with best quality
        if (!bestBlob) {
          bestBlob = await createCompressedPDF(pdf, numPages, minQuality);
        }
        
        toast({
          title: "Success!",
          description: `Compressed to ${(bestBlob.size / 1024).toFixed(0)}KB with ${bestQuality}% quality`,
        });
      }
      
      if (bestBlob) {
        saveAs(bestBlob, `compressed_100kb_${file.name}`);
      }
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

  const createCompressedPDF = async (pdf: pdfjsLib.PDFDocumentProxy, numPages: number, quality: number): Promise<Blob> => {
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
      const pageViewport = page.getViewport({ scale: 1 });
      
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d')!;
      canvas.height = pageViewport.height;
      canvas.width = pageViewport.width;
      
      await page.render({
        canvasContext: context,
        viewport: pageViewport,
        canvas: canvas,
      } as any).promise;
      
      const imgData = canvas.toDataURL('image/jpeg', quality / 100);
      
      if (i > 1) {
        doc.addPage([pageViewport.width, pageViewport.height]);
      }
      
      doc.addImage(imgData, 'JPEG', 0, 0, pageViewport.width, pageViewport.height);
    }
    
    return doc.output('blob');
  };

  return (
    <ToolLayout
      title="Compress PDF to 100KB"
      description="Automatically compress your PDF to approximately 100KB"
    >
      <div className="space-y-6">
        <FileUpload
          onFileSelect={compressToTargetSize}
          accept=".pdf"
          maxSize={50}
        />
        
        {processing && (
          <div className="flex items-center justify-center gap-3 py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <p className="text-lg text-muted-foreground">Finding optimal compression...</p>
          </div>
        )}
        
        <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
          <p><strong>Note:</strong> 100KB is very small. This works best for text-only PDFs with few pages. Complex PDFs may not reach this target.</p>
        </div>
      </div>
    </ToolLayout>
  );
};

export default CompressPDF100KB;
