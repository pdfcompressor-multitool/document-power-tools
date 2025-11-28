import { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import { Button } from "./ui/button";

interface ToolLayoutProps {
  title: string;
  description: string;
  children: ReactNode;
}

const ToolLayout = ({ title, description, children }: ToolLayoutProps) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1 py-12 bg-background">
        <div className="container mx-auto px-6 max-w-4xl">
          <Button
            asChild
            variant="ghost"
            className="mb-8 text-muted-foreground hover:text-primary"
          >
            <Link to="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to all tools
            </Link>
          </Button>
          
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight text-foreground">
              {title}
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {description}
            </p>
          </div>
          
          <div className="bg-card rounded-2xl shadow-xl border border-border p-8 md:p-12">
            {children}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ToolLayout;
