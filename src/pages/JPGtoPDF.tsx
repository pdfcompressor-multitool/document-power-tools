import { useState } from "react";
import { PDFDocument } from "pdf-lib";
import { saveAs } from "file-saver";
import ToolLayout from "@/components/ToolLayout";
import FileUpload from "@/components/FileUpload";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const JPGtoPDF = () => {
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();

  const convertToPDF = async (file: File) => {
    setProcessing(true);
    try {
      const pdfDoc = await PDFDocument.create();
      const imageBytes = await file.arrayBuffer();
      
      let image;
      if (file.type === "image/jpeg" || file.type === "image/jpg") {
        image = await pdfDoc.embedJpg(imageBytes);
      } else if (file.type === "image/png") {
        image = await pdfDoc.embedPng(imageBytes);
      } else {
        throw new Error("Unsupported image format");
      }
      
      const page = pdfDoc.addPage([image.width, image.height]);
      page.drawImage(image, {
        x: 0,
        y: 0,
        width: image.width,
        height: image.height,
      });
      
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as BlobPart], { type: "application/pdf" });
      
      const fileName = file.name.replace(/\.[^/.]+$/, ".pdf");
      saveAs(blob, fileName);
      
      toast({
        title: "Conversion Successful!",
        description: "Your image has been converted to PDF.",
      });
    } catch (error) {
      toast({
        title: "Conversion Failed",
        description: "There was an error converting your image.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolLayout
      title="JPG to PDF"
      description="Convert your image files into a single PDF document"
    >
      <div className="space-y-6">
        <FileUpload
          onFileSelect={convertToPDF}
          accept="image/jpeg,image/jpg,image/png"
          maxSize={20}
        />
        
        {processing && (
          <div className="flex items-center justify-center gap-3 py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <p className="text-lg text-muted-foreground">Converting to PDF...</p>
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default JPGtoPDF;
