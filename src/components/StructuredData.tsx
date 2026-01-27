import { useEffect } from "react";

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface HowToStep {
  name: string;
  text: string;
}

interface FAQItem {
  question: string;
  answer: string;
}

interface StructuredDataProps {
  type: "HowTo" | "FAQPage" | "BreadcrumbList" | "SoftwareApplication";
  name?: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  howToSteps?: HowToStep[];
  faqItems?: FAQItem[];
  toolUrl?: string;
}

const BASE_URL = "https://file-artisan-kit.lovable.app";

export const StructuredData = ({
  type,
  name,
  description,
  breadcrumbs,
  howToSteps,
  faqItems,
  toolUrl,
}: StructuredDataProps) => {
  useEffect(() => {
    const scriptId = `structured-data-${type}`;
    
    // Remove existing script if present
    const existingScript = document.getElementById(scriptId);
    if (existingScript) {
      existingScript.remove();
    }

    let data: object | null = null;

    switch (type) {
      case "BreadcrumbList":
        if (breadcrumbs && breadcrumbs.length > 0) {
          data = {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": breadcrumbs.map((item, index) => ({
              "@type": "ListItem",
              "position": index + 1,
              "name": item.name,
              "item": `${BASE_URL}${item.url}`,
            })),
          };
        }
        break;

      case "HowTo":
        if (name && howToSteps && howToSteps.length > 0) {
          data = {
            "@context": "https://schema.org",
            "@type": "HowTo",
            "name": name,
            "description": description,
            "step": howToSteps.map((step, index) => ({
              "@type": "HowToStep",
              "position": index + 1,
              "name": step.name,
              "text": step.text,
            })),
            "tool": {
              "@type": "HowToTool",
              "name": "DocFlow - Free PDF Tools",
            },
          };
        }
        break;

      case "FAQPage":
        if (faqItems && faqItems.length > 0) {
          data = {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": faqItems.map((item) => ({
              "@type": "Question",
              "name": item.question,
              "acceptedAnswer": {
                "@type": "Answer",
                "text": item.answer,
              },
            })),
          };
        }
        break;

      case "SoftwareApplication":
        if (name && toolUrl) {
          data = {
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": name,
            "applicationCategory": "UtilitiesApplication",
            "operatingSystem": "Web Browser",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD",
            },
            "description": description,
            "url": `${BASE_URL}${toolUrl}`,
          };
        }
        break;
    }

    if (data) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.type = "application/ld+json";
      script.textContent = JSON.stringify(data);
      document.head.appendChild(script);
    }

    // Cleanup on unmount
    return () => {
      const script = document.getElementById(scriptId);
      if (script) {
        script.remove();
      }
    };
  }, [type, name, description, breadcrumbs, howToSteps, faqItems, toolUrl]);

  return null;
};

export default StructuredData;