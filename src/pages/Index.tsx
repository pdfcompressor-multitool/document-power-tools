import { Link } from "react-router-dom";
import { 
  Minimize2, 
  ArrowDown, 
  ArrowDownCircle, 
  Image, 
  FileUp, 
  Maximize2, 
  Layers, 
  Scissors, 
  FileText, 
  File 
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ToolCard from "@/components/ToolCard";
import { Button } from "@/components/ui/button";

const Index = () => {
  const tools = [
    {
      title: "PDF Compressor",
      description: "Reduce PDF file size without compromising quality.",
      icon: Minimize2,
      link: "/pdf-compressor",
      highlight: false,
    },
    {
      title: "Compress PDF to 200KB",
      description: "Achieve a specific file size for uploads and sharing.",
      icon: ArrowDown,
      link: "/compress-pdf-200kb",
      highlight: true,
    },
    {
      title: "Compress PDF to 100KB",
      description: "Drastically reduce PDF size for minimal bandwidth.",
      icon: ArrowDownCircle,
      link: "/compress-pdf-100kb",
      highlight: true,
    },
    {
      title: "JPG to PDF",
      description: "Convert your image files into a single PDF document.",
      icon: Image,
      link: "/jpg-to-pdf",
      highlight: false,
    },
    {
      title: "PDF to JPG",
      description: "Extract images or convert PDF pages to JPG format.",
      icon: FileUp,
      link: "/pdf-to-jpg",
      highlight: false,
    },
    {
      title: "Image Compressor",
      description: "Optimize and compress JPG and PNG images easily.",
      icon: Maximize2,
      link: "/image-compressor",
      highlight: false,
    },
    {
      title: "Merge PDF",
      description: "Combine multiple PDF documents into a single file.",
      icon: Layers,
      link: "/merge-pdf",
      highlight: false,
    },
    {
      title: "Split PDF",
      description: "Divide large PDF files into smaller, manageable parts.",
      icon: Scissors,
      link: "/split-pdf",
      highlight: false,
    },
    {
      title: "Word to PDF",
      description: "Convert Microsoft Word documents to PDF format.",
      icon: FileText,
      link: "/word-to-pdf",
      highlight: false,
    },
    {
      title: "PDF to Word",
      description: "Transform PDFs into editable Microsoft Word files.",
      icon: File,
      link: "/pdf-to-word",
      highlight: false,
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary via-primary-dark to-primary-dark text-white overflow-hidden">
        {/* Subtle pattern overlay */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle at 100% 150%, hsl(var(--primary-dark)) 24%, hsl(var(--primary)) 25%, hsl(var(--primary)) 28%, hsl(var(--primary-dark)) 29%, hsl(var(--primary-dark)) 36%, hsl(var(--primary)) 36%, hsl(var(--primary)) 40%, transparent 40%, transparent)`,
            backgroundSize: '50px 100px',
          }}
        />
        
        <div className="container mx-auto px-6 py-24 md:py-32 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-black mb-6 tracking-tight leading-tight">
              Elevate Your Document Workflow.
            </h1>
            <p className="text-xl md:text-2xl mb-10 opacity-90 leading-relaxed">
              Experience powerful, elegant, and secure online tools designed to simplify your file management.
            </p>
            <Button 
              asChild
              className="bg-accent hover:bg-accent-dark text-accent-foreground font-bold text-lg px-8 py-6 rounded-xl shadow-2xl hover:shadow-accent/30 transition-all hover:-translate-y-1"
            >
              <Link to="#tools-list">Discover All Tools</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Tools Grid Section */}
      <main id="tools-list" className="flex-1 py-20 bg-background">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-black text-center mb-16 tracking-tight text-foreground">
            Your Suite of Essential Tools
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tools.map((tool) => (
              <ToolCard
                key={tool.link}
                title={tool.title}
                description={tool.description}
                icon={tool.icon}
                link={tool.link}
                highlight={tool.highlight}
              />
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
