import { useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import { saveAs } from "file-saver";
import ToolLayout from "@/components/ToolLayout";
import FileUpload from "@/components/FileUpload";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Set worker path
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const PDFtoJPG = () => {
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();

  const convertToJPG = async (file: File) => {
    setProcessing(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: 2.0 });
        
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        const renderContext = {
          canvasContext: context!,
          viewport: viewport,
          canvas: canvas,
        };
        
        await page.render(renderContext).promise;
        
        canvas.toBlob((blob) => {
          if (blob) {
            const fileName = file.name.replace(".pdf", `_page_${pageNum}.jpg`);
            saveAs(blob, fileName);
          }
        }, "image/jpeg", 0.95);
      }
      
      toast({
        title: "Conversion Successful!",
        description: `Converted ${pdf.numPages} page(s) to JPG.`,
      });
    } catch (error) {
      toast({
        title: "Conversion Failed",
        description: "There was an error converting your PDF.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolLayout
      title="PDF to JPG"
      description="Extract images or convert PDF pages to JPG format"
    >
      <div className="space-y-6">
        <FileUpload
          onFileSelect={convertToJPG}
          accept=".pdf"
          maxSize={50}
        />
        
        {processing && (
          <div className="flex items-center justify-center gap-3 py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <p className="text-lg text-muted-foreground">Converting to JPG...</p>
          </div>
        )}
        
        <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
          <p><strong>Note:</strong> Each page will be saved as a separate JPG file.</p>
        </div>
      </div>
    </ToolLayout>
  );
};

export default PDFtoJPG;
