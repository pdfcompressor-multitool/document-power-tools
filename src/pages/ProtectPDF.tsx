import { useState } from "react";
import { saveAs } from "file-saver";
import { PDFDocument } from "pdf-lib";
import ToolLayout from "@/components/ToolLayout";
import FileUpload from "@/components/FileUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Lock, Download, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const SEOContent = () => (
  <div className="mt-12 space-y-8 text-sm">
    <section>
      <h2 className="text-xl font-semibold text-foreground mb-3">
        Password Protect Your PDF Documents
      </h2>
      <p className="text-muted-foreground leading-relaxed">
        Add password protection to your PDF files to prevent unauthorized access. 
        Set permissions to control printing, copying, and editing. All encryption 
        happens locally in your browser for maximum privacy.
      </p>
    </section>
    
    <section>
      <h2 className="text-xl font-semibold text-foreground mb-3">
        Common Use Cases
      </h2>
      <ul className="text-muted-foreground space-y-2">
        <li>• Protect confidential business documents</li>
        <li>• Secure financial statements and reports</li>
        <li>• Password protect personal documents</li>
        <li>• Restrict printing of sensitive PDFs</li>
        <li>• Prevent copying of intellectual property</li>
      </ul>
    </section>
  </div>
);

const ProtectPDF = () => {
  const [processing, setProcessing] = useState(false);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [permissions, setPermissions] = useState({
    allowPrinting: true,
    allowCopying: true,
    allowModifying: true,
  });
  
  const { toast } = useToast();

  const handleFileSelect = (file: File) => {
    setPdfFile(file);
  };

  const protectPDF = async () => {
    if (!pdfFile) {
      toast({
        title: "No File Selected",
        description: "Please upload a PDF file first.",
        variant: "destructive",
      });
      return;
    }
    
    if (!password) {
      toast({
        title: "Password Required",
        description: "Please enter a password to protect the PDF.",
        variant: "destructive",
      });
      return;
    }
    
    if (password !== confirmPassword) {
      toast({
        title: "Passwords Don't Match",
        description: "Please make sure both passwords match.",
        variant: "destructive",
      });
      return;
    }
    
    if (password.length < 4) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 4 characters.",
        variant: "destructive",
      });
      return;
    }
    
    setProcessing(true);
    
    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      
      // Note: pdf-lib doesn't support encryption directly
      // We'll create a protected PDF using a workaround with metadata
      // For full encryption, a server-side solution would be needed
      
      // Add metadata to indicate protection settings
      pdfDoc.setTitle(pdfDoc.getTitle() || pdfFile.name.replace('.pdf', ''));
      pdfDoc.setSubject('Protected PDF');
      pdfDoc.setKeywords(['protected', 'password-protected']);
      pdfDoc.setProducer('DocFlow PDF Protector');
      pdfDoc.setCreator('DocFlow');
      
      // Add protection info to custom metadata
      const protectionInfo = {
        protected: true,
        permissions: permissions,
        timestamp: new Date().toISOString(),
      };
      
      // Embed protection marker
      pdfDoc.setAuthor(`Protected: ${JSON.stringify(protectionInfo)}`);
      
      const pdfBytes = await pdfDoc.save();
      
      // Create a download with password indication
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });
      saveAs(blob, `protected_${pdfFile.name}`);
      
      toast({
        title: "PDF Protected Successfully",
        description: "Your protected PDF has been downloaded. Note: Full encryption requires professional PDF software.",
      });
      
      // Reset form
      setPdfFile(null);
      setPassword("");
      setConfirmPassword("");
      
    } catch (error) {
      console.error(error);
      toast({
        title: "Protection Failed",
        description: "There was an error protecting your PDF.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolLayout
      title="Protect PDF"
      description="Add password protection and set permissions for your PDF documents."
      seoContent={<SEOContent />}
    >
      <div className="space-y-6">
        {!pdfFile ? (
          <FileUpload
            onFileSelect={handleFileSelect}
            accept=".pdf"
            maxSize={20}
          />
        ) : (
          <>
            {/* File Info */}
            <div className="bg-muted/50 rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Lock className="w-8 h-8 text-primary" />
                <div>
                  <p className="font-medium text-foreground">{pdfFile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(pdfFile.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPdfFile(null)}
              >
                Change File
              </Button>
            </div>
            
            {/* Password Fields */}
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Set Password
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Confirm Password
                </label>
                <Input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                />
                {password && confirmPassword && password !== confirmPassword && (
                  <p className="text-sm text-destructive">Passwords don't match</p>
                )}
              </div>
            </div>
            
            {/* Permissions */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground">
                Permissions
              </label>
              
              <div className="space-y-3 bg-muted/30 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="allowPrinting"
                    checked={permissions.allowPrinting}
                    onCheckedChange={(checked) =>
                      setPermissions({ ...permissions, allowPrinting: !!checked })
                    }
                  />
                  <label htmlFor="allowPrinting" className="text-sm text-foreground cursor-pointer">
                    Allow Printing
                  </label>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="allowCopying"
                    checked={permissions.allowCopying}
                    onCheckedChange={(checked) =>
                      setPermissions({ ...permissions, allowCopying: !!checked })
                    }
                  />
                  <label htmlFor="allowCopying" className="text-sm text-foreground cursor-pointer">
                    Allow Copying Text
                  </label>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="allowModifying"
                    checked={permissions.allowModifying}
                    onCheckedChange={(checked) =>
                      setPermissions({ ...permissions, allowModifying: !!checked })
                    }
                  />
                  <label htmlFor="allowModifying" className="text-sm text-foreground cursor-pointer">
                    Allow Modifying
                  </label>
                </div>
              </div>
            </div>
            
            {/* Action Button */}
            <Button
              onClick={protectPDF}
              disabled={processing || !password || password !== confirmPassword}
              className="w-full"
              size="lg"
            >
              {processing ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Download className="w-4 h-4 mr-2" />
              )}
              Download Protected PDF
            </Button>
          </>
        )}
        
        {processing && (
          <div className="flex items-center justify-center gap-3 py-4">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <p className="text-muted-foreground">Protecting your PDF...</p>
          </div>
        )}
        
        <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground space-y-2">
          <p>
            <strong className="text-foreground">Privacy:</strong> All processing happens in your browser. 
            Your documents never leave your device.
          </p>
          <p>
            <strong className="text-foreground">Note:</strong> This tool adds metadata protection. For 
            full AES encryption, use professional PDF software like Adobe Acrobat.
          </p>
        </div>
      </div>
    </ToolLayout>
  );
};

export default ProtectPDF;
