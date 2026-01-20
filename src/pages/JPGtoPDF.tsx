import { useState } from "react";
import { PDFDocument } from "pdf-lib";
import { saveAs } from "file-saver";
import ToolLayout from "@/components/ToolLayout";
import FileUpload from "@/components/FileUpload";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const SEOContent = () => (
  <div className="mt-12 space-y-8 text-sm">
    <section>
      <h2 className="text-xl font-semibold text-foreground mb-3">
        Convert JPG to PDF – Photos to Document Format
      </h2>
      <p className="text-muted-foreground leading-relaxed">
        Quickly convert JPG and PNG images to PDF format for document submissions. 
        Perfect for converting scanned documents, photos of certificates, 
        ID cards, and other images into universally accepted PDF format.
      </p>
      <p className="text-muted-foreground leading-relaxed mt-3">
        After converting, you may want to <a href="#/pdf-compressor" className="text-primary hover:underline">compress the PDF</a> to 
        meet file size requirements for government portals.
      </p>
    </section>
    
    <section>
      <h2 className="text-xl font-semibold text-foreground mb-3">
        Common Use Cases
      </h2>
      <ul className="text-muted-foreground space-y-2">
        <li>• Convert scanned documents to PDF for official submissions</li>
        <li>• Create PDF from photos of certificates and diplomas</li>
        <li>• Convert ID card and passport photos to PDF format</li>
        <li>• Create PDF documents from mobile phone photos</li>
        <li>• Convert receipts and invoices to PDF for records</li>
      </ul>
    </section>
    
    <section>
      <h2 className="text-xl font-semibold text-foreground mb-3">
        Privacy & Security
      </h2>
      <p className="text-muted-foreground leading-relaxed">
        Your images are converted to PDF entirely in your browser. No files are 
        uploaded to external servers, and no data is stored. The conversion happens 
        instantly on your device.
      </p>
    </section>
  </div>
);

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
        title: "Conversion Complete",
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
      description="Convert images to PDF format for document submissions and official forms."
      seoTitle="Convert JPG to PDF Free – Image to Document | DocFlow"
      seoDescription="Convert JPG and PNG images to PDF for document submissions. Free browser-based converter—no uploads, instant download."
      seoContent={<SEOContent />}
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
            <p className="text-muted-foreground">Converting to PDF...</p>
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default JPGtoPDF;
