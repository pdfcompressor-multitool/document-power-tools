import { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import { Button } from "./ui/button";
import { useSEO } from "@/hooks/useSEO";
import StructuredData from "./StructuredData";

interface HowToStep {
  name: string;
  text: string;
}

interface FAQItem {
  question: string;
  answer: string;
}

interface ToolLayoutProps {
  title: string;
  description: string;
  seoTitle?: string;
  seoDescription?: string;
  seoContent?: ReactNode;
  children: ReactNode;
  howToSteps?: HowToStep[];
  faqItems?: FAQItem[];
}

const ToolLayout = ({ 
  title, 
  description, 
  seoTitle, 
  seoDescription, 
  seoContent, 
  children,
  howToSteps,
  faqItems,
}: ToolLayoutProps) => {
  const location = useLocation();
  const pageTitle = seoTitle || `${title} – Free Online Tool | DocFlow`;
  const pageDescription = seoDescription || description;

  useSEO({ title: pageTitle, description: pageDescription });

  // Build breadcrumbs
  const breadcrumbs = [
    { name: "Home", url: "/#/" },
    { name: title, url: `/#${location.pathname}` },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      {/* Structured Data */}
      <StructuredData
        type="BreadcrumbList"
        breadcrumbs={breadcrumbs}
      />
      {howToSteps && howToSteps.length > 0 && (
        <StructuredData
          type="HowTo"
          name={`How to ${title}`}
          description={pageDescription}
          howToSteps={howToSteps}
        />
      )}
      {faqItems && faqItems.length > 0 && (
        <StructuredData
          type="FAQPage"
          faqItems={faqItems}
        />
      )}
      
      <main className="flex-1 py-12 bg-background">
        <div className="container mx-auto px-6 max-w-4xl">
          {/* Breadcrumb navigation for accessibility */}
          <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex items-center gap-2 text-sm text-muted-foreground">
              <li>
                <Link to="/" className="hover:text-foreground transition-colors">
                  Home
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <span className="text-foreground font-medium">{title}</span>
              </li>
            </ol>
          </nav>
          
          <Button
            asChild
            variant="ghost"
            className="mb-6 text-muted-foreground hover:text-foreground"
          >
            <Link to="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              All tools
            </Link>
          </Button>
          
          <div className="mb-10">
            <h1 className="text-3xl md:text-4xl font-bold mb-3 text-foreground">
              {title}
            </h1>
            <p className="text-lg text-muted-foreground">
              {description}
            </p>
          </div>
          
          <div className="bg-card rounded-lg border border-border p-6 md:p-8 mb-10">
            {children}
          </div>
          
          {seoContent && (
            <article className="prose prose-invert max-w-none">
              {seoContent}
            </article>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ToolLayout;