import { useState } from "react";
import { PDFDocument } from "pdf-lib";
import { saveAs } from "file-saver";
import ToolLayout from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Upload, Loader2, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const SEOContent = () => (
  <div className="mt-12 space-y-8 text-sm">
    <section>
      <h2 className="text-xl font-semibold text-foreground mb-3">
        Merge PDF Files Online – Combine Multiple PDFs
      </h2>
      <p className="text-muted-foreground leading-relaxed">
        Combine multiple PDF files into a single document for easier organization 
        and sharing. Perfect for combining scanned pages, creating document packages, 
        or consolidating reports into one file.
      </p>
      <p className="text-muted-foreground leading-relaxed mt-3">
        After merging, you may want to <a href="#/pdf-compressor" className="text-primary hover:underline">compress the PDF</a> to 
        reduce file size, or <a href="#/protect-pdf" className="text-primary hover:underline">add password protection</a> for security.
      </p>
    </section>
    
    <section>
      <h2 className="text-xl font-semibold text-foreground mb-3">
        Common Use Cases
      </h2>
      <ul className="text-muted-foreground space-y-2">
        <li>• Combine multiple scanned pages into one document</li>
        <li>• Merge contract pages from different sources</li>
        <li>• Create document packages for job applications</li>
        <li>• Consolidate monthly reports into annual documents</li>
        <li>• Combine multiple invoices for accounting records</li>
      </ul>
    </section>
    
    <section>
      <h2 className="text-xl font-semibold text-foreground mb-3">
        Privacy & Security
      </h2>
      <p className="text-muted-foreground leading-relaxed">
        Your PDFs are merged entirely in your browser. No files are uploaded to 
        external servers, ensuring complete privacy for sensitive documents.
      </p>
    </section>
  </div>
);

const MergePDF = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles([...files, ...Array.from(e.target.files)]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const mergePDFs = async () => {
    if (files.length < 2) {
      toast({
        title: "Need more files",
        description: "Please upload at least 2 PDF files to merge.",
        variant: "destructive",
      });
      return;
    }

    setProcessing(true);
    try {
      const mergedPdf = await PDFDocument.create();
      
      for (const file of files) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }
      
      const mergedPdfBytes = await mergedPdf.save();
      const blob = new Blob([mergedPdfBytes as BlobPart], { type: "application/pdf" });
      
      saveAs(blob, "merged.pdf");
      
      toast({
        title: "PDFs Merged",
        description: `Combined ${files.length} PDF files.`,
      });
      
      setFiles([]);
    } catch (error) {
      toast({
        title: "Merge Failed",
        description: "There was an error merging your PDFs.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const howToSteps = [
    { name: "Upload PDFs", text: "Click the upload area to select multiple PDF files you want to merge." },
    { name: "Arrange order", text: "Review the file list. Files will be merged in the order shown." },
    { name: "Merge", text: "Click 'Merge PDFs' to combine all files into a single document." },
    { name: "Download", text: "Your merged PDF will download automatically." },
  ];

  const faqItems = [
    { question: "How many PDFs can I merge at once?", answer: "There's no strict limit, but very large combined documents may take longer to process. For best results, keep the total under 100MB." },
    { question: "Will the merged PDF maintain quality?", answer: "Yes, merging doesn't compress or alter the original pages—they're combined exactly as they are." },
    { question: "Can I reorder the PDFs before merging?", answer: "Currently, files are merged in the order you upload them. Upload files in your desired order for best results." },
  ];

  return (
    <ToolLayout
      title="Merge PDF"
      description="Combine multiple PDF documents into a single file."
      seoTitle="Merge PDF Files Online Free – Combine PDFs | DocFlow"
      seoDescription="Combine multiple PDF files into one document. Free browser-based tool—no uploads, no account required. Perfect for document packages."
      seoContent={<SEOContent />}
      howToSteps={howToSteps}
      faqItems={faqItems}
    >
      <div className="space-y-6">
        <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors bg-muted/30">
          <input
            type="file"
            accept=".pdf"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            id="pdf-upload"
          />
          <label htmlFor="pdf-upload" className="cursor-pointer">
            <div className="flex flex-col items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                <Upload className="w-7 h-7 text-primary" />
              </div>
              <div>
                <p className="text-base font-medium text-foreground mb-1">
                  Click to add PDF files
                </p>
                <p className="text-sm text-muted-foreground">
                  Upload multiple PDFs to merge them
                </p>
              </div>
            </div>
          </label>
        </div>

        {files.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-medium text-foreground text-sm">
              Files to merge ({files.length}):
            </h3>
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-muted rounded-lg"
              >
                <span className="text-sm truncate flex-1">{file.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        <Button
          onClick={mergePDFs}
          disabled={files.length < 2 || processing}
          className="w-full"
        >
          {processing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Merging PDFs...
            </>
          ) : (
            `Merge ${files.length} PDF${files.length !== 1 ? "s" : ""}`
          )}
        </Button>
      </div>
    </ToolLayout>
  );
};

export default MergePDF;
