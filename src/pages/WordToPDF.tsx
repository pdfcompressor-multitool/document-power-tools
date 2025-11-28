import { useState } from "react";
import { saveAs } from "file-saver";
import mammoth from "mammoth";
import { jsPDF } from "jspdf";
import ToolLayout from "@/components/ToolLayout";
import FileUpload from "@/components/FileUpload";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const WordToPDF = () => {
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();

  const convertToPDF = async (file: File) => {
    setProcessing(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      
      // Convert DOCX to HTML using mammoth
      const result = await mammoth.convertToHtml({ arrayBuffer });
      const html = result.value;
      
      // Create a temporary container to render HTML
      const container = document.createElement('div');
      container.innerHTML = html;
      container.style.cssText = `
        width: 595px;
        padding: 40px;
        font-family: Arial, sans-serif;
        font-size: 12px;
        line-height: 1.6;
        position: absolute;
        left: -9999px;
        background: white;
      `;
      document.body.appendChild(container);
      
      // Style the content
      const styles = document.createElement('style');
      styles.textContent = `
        h1 { font-size: 24px; margin: 20px 0 10px; }
        h2 { font-size: 20px; margin: 18px 0 8px; }
        h3 { font-size: 16px; margin: 16px 0 6px; }
        p { margin: 8px 0; }
        ul, ol { margin: 8px 0; padding-left: 20px; }
        table { border-collapse: collapse; width: 100%; margin: 10px 0; }
        td, th { border: 1px solid #ddd; padding: 8px; }
      `;
      container.appendChild(styles);
      
      // Create PDF
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'pt',
        format: 'a4'
      });
      
      // Extract text content and add to PDF
      const text = container.innerText;
      const lines = doc.splitTextToSize(text, 515);
      
      const pageHeight = 842;
      const margin = 40;
      const lineHeight = 14;
      let y = margin;
      
      lines.forEach((line: string) => {
        if (y + lineHeight > pageHeight - margin) {
          doc.addPage();
          y = margin;
        }
        doc.text(line, margin, y);
        y += lineHeight;
      });
      
      // Clean up
      document.body.removeChild(container);
      
      // Save PDF
      const blob = doc.output('blob');
      const fileName = file.name.replace(/\.(docx?|doc)$/i, '.pdf');
      saveAs(blob, fileName);
      
      toast({
        title: "Conversion Successful!",
        description: `${file.name} has been converted to PDF.`,
      });
      
      if (result.messages.length > 0) {
        console.log('Conversion warnings:', result.messages);
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Conversion Failed",
        description: "There was an error converting your Word document. Make sure it's a valid .docx file.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolLayout
      title="Word to PDF"
      description="Convert Microsoft Word documents (.docx) to PDF format"
    >
      <div className="space-y-6">
        <FileUpload
          onFileSelect={convertToPDF}
          accept=".docx,.doc"
          maxSize={20}
        />
        
        {processing && (
          <div className="flex items-center justify-center gap-3 py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <p className="text-lg text-muted-foreground">Converting to PDF...</p>
          </div>
        )}
        
        <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
          <p><strong>Supported formats:</strong> .docx files (Microsoft Word 2007+)</p>
          <p className="mt-2"><strong>Note:</strong> Complex formatting, images, and special fonts may not be preserved exactly. For best results, use simple document formatting.</p>
        </div>
      </div>
    </ToolLayout>
  );
};

export default WordToPDF;
