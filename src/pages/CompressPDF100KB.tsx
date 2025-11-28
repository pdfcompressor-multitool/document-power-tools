import { useState } from "react";
import { PDFDocument } from "pdf-lib";
import { saveAs } from "file-saver";
import ToolLayout from "@/components/ToolLayout";
import FileUpload from "@/components/FileUpload";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const CompressPDF100KB = () => {
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();

  const targetSize = 100 * 1024; // 100KB in bytes

  const compressPDF = async (file: File) => {
    setProcessing(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      
      const compressedPdfBytes = await pdfDoc.save({
        useObjectStreams: false,
      });
      
      const compressedBlob = new Blob([compressedPdfBytes as BlobPart], { type: "application/pdf" });
      
      if (compressedBlob.size > targetSize * 1.1) {
        toast({
          title: "Target size not achieved",
          description: `Compressed to ${(compressedBlob.size / 1024).toFixed(0)}KB. Try removing images or reducing page count for smaller files.`,
        });
      } else {
        toast({
          title: "Success!",
          description: `Compressed to ${(compressedBlob.size / 1024).toFixed(0)}KB`,
        });
      }
      
      saveAs(compressedBlob, `compressed_100kb_${file.name}`);
    } catch (error) {
      toast({
        title: "Compression Failed",
        description: "There was an error compressing your PDF.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolLayout
      title="Compress PDF to 100KB"
      description="Drastically reduce PDF size for minimal bandwidth"
    >
      <div className="space-y-6">
        <FileUpload
          onFileSelect={compressPDF}
          accept=".pdf"
          maxSize={50}
        />
        
        {processing && (
          <div className="flex items-center justify-center gap-3 py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <p className="text-lg text-muted-foreground">Compressing to 100KB...</p>
          </div>
        )}
        
        <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
          <p><strong>Note:</strong> Achieving 100KB requires significant compression. Text-only PDFs work best for this target size.</p>
        </div>
      </div>
    </ToolLayout>
  );
};

export default CompressPDF100KB;
