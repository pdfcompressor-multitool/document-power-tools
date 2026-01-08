import { useState, useRef, useCallback } from "react";
import { saveAs } from "file-saver";
import * as pdfjsLib from "pdfjs-dist";
import { PDFDocument } from "pdf-lib";
import ToolLayout from "@/components/ToolLayout";
import FileUpload from "@/components/FileUpload";
import { Button } from "@/components/ui/button";
import { Loader2, Pen, Upload, Download, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.mjs",
  import.meta.url
).toString();

const SEOContent = () => (
  <div className="mt-12 space-y-8 text-sm">
    <section>
      <h2 className="text-xl font-semibold text-foreground mb-3">
        Sign PDF Documents Online
      </h2>
      <p className="text-muted-foreground leading-relaxed">
        Add your signature to PDF documents directly in your browser. Draw a signature 
        or upload a signature image, then place it anywhere on your document. Perfect 
        for contracts, agreements, and official documents.
      </p>
    </section>
    
    <section>
      <h2 className="text-xl font-semibold text-foreground mb-3">
        Common Use Cases
      </h2>
      <ul className="text-muted-foreground space-y-2">
        <li>• Sign contracts and agreements digitally</li>
        <li>• Add signatures to official documents</li>
        <li>• Sign rental agreements and leases</li>
        <li>• Authorize purchase orders and invoices</li>
        <li>• Sign consent forms and applications</li>
      </ul>
    </section>
  </div>
);

interface SignaturePosition {
  x: number;
  y: number;
  width: number;
  height: number;
  page: number;
}

const SignPDF = () => {
  const [processing, setProcessing] = useState(false);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfPages, setPdfPages] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null);
  const [signaturePosition, setSignaturePosition] = useState<SignaturePosition | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pdfContainerRef = useRef<HTMLDivElement>(null);
  const signatureInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const loadPDF = async (file: File) => {
    setProcessing(true);
    setPdfFile(file);
    setSignaturePosition(null);
    
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const pages: string[] = [];
      
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d")!;
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        
        await page.render({ canvasContext: ctx, viewport } as any).promise;
        pages.push(canvas.toDataURL("image/png"));
      }
      
      setPdfPages(pages);
      setCurrentPage(0);
    } catch (error) {
      toast({
        title: "Failed to Load PDF",
        description: "The PDF file could not be loaded.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setIsDrawing(true);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#000";
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    ctx.closePath();
    
    // Check if canvas has any drawing
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const hasDrawing = imageData.data.some((value, index) => index % 4 === 3 && value > 0);
    
    if (hasDrawing) {
      setSignatureDataUrl(canvas.toDataURL("image/png"));
    }
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignatureDataUrl(null);
    setSignaturePosition(null);
  };

  const uploadSignature = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      setSignatureDataUrl(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handlePdfClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!signatureDataUrl || !pdfContainerRef.current || isDragging || isResizing) return;
    
    const rect = pdfContainerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Only place if clicking on an empty area (not on existing signature)
    if (!signaturePosition) {
      setSignaturePosition({
        x: x - 75,
        y: y - 25,
        width: 150,
        height: 50,
        page: currentPage,
      });
    }
  }, [signatureDataUrl, currentPage, signaturePosition, isDragging, isResizing]);

  const handleSignatureDragStart = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (!signaturePosition) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    setIsDragging(true);
  };

  const handleSignatureDrag = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !pdfContainerRef.current || !signaturePosition) return;
    
    const rect = pdfContainerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - dragOffset.x;
    const y = e.clientY - rect.top - dragOffset.y;
    
    setSignaturePosition({
      ...signaturePosition,
      x: Math.max(0, Math.min(x, rect.width - signaturePosition.width)),
      y: Math.max(0, Math.min(y, rect.height - signaturePosition.height)),
    });
  }, [isDragging, dragOffset, signaturePosition]);

  const handleSignatureDragEnd = () => {
    setIsDragging(false);
  };

  const handleResize = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setIsResizing(true);
  };

  const handleResizeMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isResizing || !pdfContainerRef.current || !signaturePosition) return;
    
    const rect = pdfContainerRef.current.getBoundingClientRect();
    const width = e.clientX - rect.left - signaturePosition.x;
    const height = e.clientY - rect.top - signaturePosition.y;
    
    setSignaturePosition({
      ...signaturePosition,
      width: Math.max(50, Math.min(width, 300)),
      height: Math.max(20, Math.min(height, 150)),
    });
  }, [isResizing, signaturePosition]);

  const handleResizeEnd = () => {
    setIsResizing(false);
  };

  const downloadSignedPDF = async () => {
    if (!pdfFile || !signatureDataUrl || !signaturePosition) return;
    
    setProcessing(true);
    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      
      // Convert signature to PNG
      const signatureImage = await pdfDoc.embedPng(signatureDataUrl);
      
      const page = pdfDoc.getPage(signaturePosition.page);
      const { width, height } = page.getSize();
      
      // Get the displayed PDF dimensions
      const container = pdfContainerRef.current;
      if (!container) throw new Error("Container not found");
      
      const displayedImage = container.querySelector("img");
      if (!displayedImage) throw new Error("Image not found");
      
      const displayWidth = displayedImage.clientWidth;
      const displayHeight = displayedImage.clientHeight;
      
      // Scale signature position and size to PDF coordinates
      const scaleX = width / displayWidth;
      const scaleY = height / displayHeight;
      
      const sigX = signaturePosition.x * scaleX;
      const sigY = height - (signaturePosition.y + signaturePosition.height) * scaleY;
      const sigWidth = signaturePosition.width * scaleX;
      const sigHeight = signaturePosition.height * scaleY;
      
      page.drawImage(signatureImage, {
        x: sigX,
        y: sigY,
        width: sigWidth,
        height: sigHeight,
      });
      
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });
      saveAs(blob, `signed_${pdfFile.name}`);
      
      toast({
        title: "PDF Signed Successfully",
        description: "Your signed PDF has been downloaded.",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Failed to Sign PDF",
        description: "There was an error creating the signed PDF.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolLayout
      title="Sign PDF Online"
      description="Add your signature to PDF documents. Draw or upload a signature and place it anywhere on the document."
      seoContent={<SEOContent />}
    >
      <div className="space-y-6">
        {!pdfFile ? (
          <FileUpload
            onFileSelect={loadPDF}
            accept=".pdf"
            maxSize={20}
          />
        ) : (
          <>
            {/* Signature Drawing Area */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Pen className="w-4 h-4" />
                  Draw Your Signature
                </label>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => signatureInputRef.current?.click()}
                  >
                    <Upload className="w-4 h-4 mr-1" />
                    Upload Image
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearSignature}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Clear
                  </Button>
                </div>
              </div>
              
              <input
                ref={signatureInputRef}
                type="file"
                accept="image/*"
                onChange={uploadSignature}
                className="hidden"
              />
              
              <canvas
                ref={canvasRef}
                width={400}
                height={150}
                className="w-full max-w-md border-2 border-dashed border-border rounded-lg cursor-crosshair bg-white"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
              />
              
              {signatureDataUrl && !signaturePosition && (
                <p className="text-sm text-muted-foreground">
                  Click on the PDF below to place your signature
                </p>
              )}
            </div>
            
            {/* PDF Preview with Signature Placement */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">
                  Page {currentPage + 1} of {pdfPages.length}
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 0}
                    onClick={() => setCurrentPage(currentPage - 1)}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === pdfPages.length - 1}
                    onClick={() => setCurrentPage(currentPage + 1)}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <div
                ref={pdfContainerRef}
                className="relative border border-border rounded-lg overflow-hidden cursor-pointer bg-white"
                onClick={handlePdfClick}
                onMouseMove={(e) => {
                  handleSignatureDrag(e);
                  handleResizeMove(e);
                }}
                onMouseUp={() => {
                  handleSignatureDragEnd();
                  handleResizeEnd();
                }}
                onMouseLeave={() => {
                  handleSignatureDragEnd();
                  handleResizeEnd();
                }}
              >
                <img
                  src={pdfPages[currentPage]}
                  alt={`Page ${currentPage + 1}`}
                  className="w-full"
                  draggable={false}
                />
                
                {signatureDataUrl && signaturePosition && signaturePosition.page === currentPage && (
                  <div
                    className="absolute border-2 border-primary bg-white/80 cursor-move"
                    style={{
                      left: signaturePosition.x,
                      top: signaturePosition.y,
                      width: signaturePosition.width,
                      height: signaturePosition.height,
                    }}
                    onMouseDown={handleSignatureDragStart}
                  >
                    <img
                      src={signatureDataUrl}
                      alt="Signature"
                      className="w-full h-full object-contain"
                      draggable={false}
                    />
                    <div
                      className="absolute bottom-0 right-0 w-4 h-4 bg-primary cursor-se-resize"
                      onMouseDown={handleResize}
                    />
                  </div>
                )}
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setPdfFile(null);
                  setPdfPages([]);
                  setSignatureDataUrl(null);
                  setSignaturePosition(null);
                }}
              >
                Upload Different PDF
              </Button>
              
              <Button
                onClick={downloadSignedPDF}
                disabled={!signaturePosition || processing}
                className="flex-1"
              >
                {processing ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Download className="w-4 h-4 mr-2" />
                )}
                Download Signed PDF
              </Button>
            </div>
          </>
        )}
        
        {processing && !pdfFile && (
          <div className="flex items-center justify-center gap-3 py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading PDF...</p>
          </div>
        )}
        
        <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
          <p>
            <strong className="text-foreground">Privacy:</strong> All processing happens in your browser. 
            Your documents and signatures never leave your device.
          </p>
        </div>
      </div>
    </ToolLayout>
  );
};

export default SignPDF;
