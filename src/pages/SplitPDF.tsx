import { useState } from "react";
import { PDFDocument } from "pdf-lib";
import { saveAs } from "file-saver";
import ToolLayout from "@/components/ToolLayout";
import FileUpload from "@/components/FileUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const SplitPDF = () => {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [splitRanges, setSplitRanges] = useState<string>("");
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();

  const handleFileSelect = async (selectedFile: File) => {
    setFile(selectedFile);
    const arrayBuffer = await selectedFile.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    setPageCount(pdfDoc.getPageCount());
  };

  const splitPDF = async () => {
    if (!file) return;

    setProcessing(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      
      // Parse ranges (e.g., "1-3,5,7-9")
      const ranges = splitRanges.split(",").map(r => r.trim());
      
      for (let i = 0; i < ranges.length; i++) {
        const range = ranges[i];
        const newPdf = await PDFDocument.create();
        
        if (range.includes("-")) {
          const [start, end] = range.split("-").map(n => parseInt(n) - 1);
          for (let pageNum = start; pageNum <= end; pageNum++) {
            const [copiedPage] = await newPdf.copyPages(pdfDoc, [pageNum]);
            newPdf.addPage(copiedPage);
          }
        } else {
          const pageNum = parseInt(range) - 1;
          const [copiedPage] = await newPdf.copyPages(pdfDoc, [pageNum]);
          newPdf.addPage(copiedPage);
        }
        
        const pdfBytes = await newPdf.save();
        const blob = new Blob([pdfBytes as BlobPart], { type: "application/pdf" });
        saveAs(blob, `split_${i + 1}_${file.name}`);
      }
      
      toast({
        title: "PDF Split Successfully!",
        description: `Created ${ranges.length} new PDF file(s).`,
      });
    } catch (error) {
      toast({
        title: "Split Failed",
        description: "Check your page ranges and try again.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolLayout
      title="Split PDF"
      description="Divide large PDF files into smaller, manageable parts"
    >
      <div className="space-y-6">
        <FileUpload
          onFileSelect={handleFileSelect}
          accept=".pdf"
          maxSize={50}
        />
        
        {pageCount > 0 && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Total pages: <strong className="text-foreground">{pageCount}</strong>
            </p>
            
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Page Ranges to Extract
              </label>
              <Input
                type="text"
                placeholder="e.g., 1-3, 5, 7-9"
                value={splitRanges}
                onChange={(e) => setSplitRanges(e.target.value)}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Separate ranges with commas. Use hyphens for ranges (e.g., "1-3,5,7-9")
              </p>
            </div>
            
            <Button
              onClick={splitPDF}
              disabled={!splitRanges || processing}
              className="w-full bg-primary hover:bg-primary-dark text-primary-foreground font-semibold py-6"
            >
              {processing ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Splitting PDF...
                </>
              ) : (
                "Split PDF"
              )}
            </Button>
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default SplitPDF;
