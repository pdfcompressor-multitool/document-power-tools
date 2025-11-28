import { useState } from "react";
import { saveAs } from "file-saver";
import * as pdfjsLib from "pdfjs-dist";
import { Document, Packer, Paragraph, TextRun } from "docx";
import ToolLayout from "@/components/ToolLayout";
import FileUpload from "@/components/FileUpload";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

const PDFtoWord = () => {
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();

  const convertToWord = async (file: File) => {
    setProcessing(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const numPages = pdf.numPages;
      
      const paragraphs: Paragraph[] = [];
      
      // Extract text from each page
      for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        
        // Group text items by their y position to form lines
        const lines: Map<number, string[]> = new Map();
        
        textContent.items.forEach((item: any) => {
          if ('str' in item && item.str.trim()) {
            const y = Math.round(item.transform[5]);
            if (!lines.has(y)) {
              lines.set(y, []);
            }
            lines.get(y)!.push(item.str);
          }
        });
        
        // Sort lines by y position (top to bottom)
        const sortedYPositions = Array.from(lines.keys()).sort((a, b) => b - a);
        
        // Add page header
        if (numPages > 1) {
          paragraphs.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: `--- Page ${i} ---`,
                  bold: true,
                  size: 24,
                }),
              ],
              spacing: { before: 400, after: 200 },
            })
          );
        }
        
        // Create paragraphs from lines
        sortedYPositions.forEach((y) => {
          const lineText = lines.get(y)!.join(' ');
          if (lineText.trim()) {
            paragraphs.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: lineText,
                    size: 24, // 12pt
                  }),
                ],
                spacing: { after: 120 },
              })
            );
          }
        });
      }
      
      // Create Word document
      const doc = new Document({
        sections: [
          {
            properties: {},
            children: paragraphs,
          },
        ],
      });
      
      // Generate and save the document
      const blob = await Packer.toBlob(doc);
      const fileName = file.name.replace(/\.pdf$/i, '.docx');
      saveAs(blob, fileName);
      
      toast({
        title: "Conversion Successful!",
        description: `${file.name} has been converted to Word format.`,
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Conversion Failed",
        description: "There was an error converting your PDF. The file may be corrupted or password-protected.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolLayout
      title="PDF to Word"
      description="Convert PDF documents to editable Microsoft Word format (.docx)"
    >
      <div className="space-y-6">
        <FileUpload
          onFileSelect={convertToWord}
          accept=".pdf"
          maxSize={20}
        />
        
        {processing && (
          <div className="flex items-center justify-center gap-3 py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <p className="text-lg text-muted-foreground">Extracting text and creating Word document...</p>
          </div>
        )}
        
        <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
          <p><strong>Note:</strong> This tool extracts text content from PDFs. Images, complex layouts, and special formatting may not be preserved. Works best with text-based PDFs.</p>
          <p className="mt-2"><strong>Tip:</strong> For scanned PDFs or image-based documents, OCR processing is not available in this version.</p>
        </div>
      </div>
    </ToolLayout>
  );
};

export default PDFtoWord;
