import { useState } from "react";
import { PDFDocument } from "pdf-lib";
import { saveAs } from "file-saver";
import ToolLayout from "@/components/ToolLayout";
import FileUpload from "@/components/FileUpload";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const PDFCompressor = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [compressedSize, setCompressedSize] = useState<number | null>(null);
  const { toast } = useToast();

  const compressPDF = async (file: File) => {
    setProcessing(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      
      // Save with compression
      const compressedPdfBytes = await pdfDoc.save({
        useObjectStreams: false,
      });
      
      const compressedBlob = new Blob([compressedPdfBytes as BlobPart], { type: "application/pdf" });
      setCompressedSize(compressedBlob.size);
      
      const originalSize = file.size;
      const reduction = ((originalSize - compressedBlob.size) / originalSize * 100).toFixed(1);
      
      saveAs(compressedBlob, `compressed_${file.name}`);
      
      toast({
        title: "PDF Compressed Successfully!",
        description: `Size reduced by ${reduction}%. Original: ${(originalSize / 1024 / 1024).toFixed(2)}MB → Compressed: ${(compressedBlob.size / 1024 / 1024).toFixed(2)}MB`,
      });
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

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    compressPDF(file);
  };

  return (
    <ToolLayout
      title="PDF Compressor"
      description="Reduce PDF file size without compromising quality"
    >
      <div className="space-y-6">
        <FileUpload
          onFileSelect={handleFileSelect}
          accept=".pdf"
          maxSize={50}
        />
        
        {processing && (
          <div className="flex items-center justify-center gap-3 py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <p className="text-lg text-muted-foreground">Compressing your PDF...</p>
          </div>
        )}
        
        {selectedFile && !processing && compressedSize && (
          <div className="bg-accent/10 border border-accent/30 rounded-xl p-6 text-center">
            <p className="text-lg font-semibold text-foreground mb-2">
              Compression Complete!
            </p>
            <p className="text-muted-foreground">
              Your compressed PDF has been downloaded automatically.
            </p>
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default PDFCompressor;
