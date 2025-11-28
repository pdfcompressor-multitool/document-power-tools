import ToolLayout from "@/components/ToolLayout";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

const PDFtoWord = () => {
  return (
    <ToolLayout
      title="PDF to Word"
      description="Transform PDFs into editable Microsoft Word files"
    >
      <Alert className="border-accent/30 bg-accent/10">
        <Info className="h-5 w-5 text-accent" />
        <AlertDescription className="text-foreground">
          <p className="font-semibold mb-2">Coming Soon!</p>
          <p className="text-sm">
            PDF to Word conversion requires advanced OCR and formatting
            preservation. This feature will be available in the next update.
            For now, you can use online services like Adobe Acrobat or
            Smallpdf to convert your PDF files to Word format.
          </p>
        </AlertDescription>
      </Alert>
    </ToolLayout>
  );
};

export default PDFtoWord;
