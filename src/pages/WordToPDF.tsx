import ToolLayout from "@/components/ToolLayout";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

const WordToPDF = () => {
  return (
    <ToolLayout
      title="Word to PDF"
      description="Convert Microsoft Word documents to PDF format"
    >
      <Alert className="border-accent/30 bg-accent/10">
        <Info className="h-5 w-5 text-accent" />
        <AlertDescription className="text-foreground">
          <p className="font-semibold mb-2">Coming Soon!</p>
          <p className="text-sm">
            Word to PDF conversion requires server-side processing. This feature
            will be available in the next update. For now, you can use Microsoft
            Word's built-in "Save as PDF" feature or online services like
            Google Docs to convert your Word documents.
          </p>
        </AlertDescription>
      </Alert>
    </ToolLayout>
  );
};

export default WordToPDF;
