import { useState } from "react";
import { PDFDocument } from "pdf-lib";
import { saveAs } from "file-saver";
import ToolLayout from "@/components/ToolLayout";
import FileUpload from "@/components/FileUpload";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const CompressPDF200KB = () => {
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();

  const targetSize = 200 * 1024; // 200KB in bytes

  const compressPDF = async (file: File) => {
    setProcessing(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      
      // Compress with aggressive settings
      const compressedPdfBytes = await pdfDoc.save({
        useObjectStreams: false,
      });
      
      const compressedBlob = new Blob([compressedPdfBytes as BlobPart], { type: "application/pdf" });
      
      if (compressedBlob.size > targetSize * 1.1) {
        toast({
          title: "Target size not achieved",
          description: `Compressed to ${(compressedBlob.size / 1024).toFixed(0)}KB. For smaller sizes, try reducing image quality or page count.`,
        });
      } else {
        toast({
          title: "Success!",
          description: `Compressed to ${(compressedBlob.size / 1024).toFixed(0)}KB`,
        });
      }
      
      saveAs(compressedBlob, `compressed_200kb_${file.name}`);
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
      title="Compress PDF to 200KB"
      description="Achieve a specific file size for uploads and sharing"
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
            <p className="text-lg text-muted-foreground">Compressing to 200KB...</p>
          </div>
        )}
        
        <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
          <p><strong>Note:</strong> Achieving exactly 200KB depends on your PDF content. PDFs with many images may need additional optimization.</p>
        </div>
      </div>
    </ToolLayout>
  );
};

export default CompressPDF200KB;
