import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Header = () => {
  return (
    <header className="bg-card shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <nav className="flex justify-between items-center">
          <Link to="/" className="flex items-center">
            <h1 className="text-3xl font-black tracking-tight">
              <span className="text-primary">V.K</span>
              <span className="text-foreground ml-1">Tools</span>
            </h1>
          </Link>
          
          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-muted-foreground hover:text-primary font-medium transition-colors">
              Solutions
            </Link>
            <Link to="/" className="text-muted-foreground hover:text-primary font-medium transition-colors">
              Features
            </Link>
            <Link to="/" className="text-muted-foreground hover:text-primary font-medium transition-colors">
              Contact
            </Link>
            <Button className="bg-primary hover:bg-primary-dark text-primary-foreground font-semibold shadow-lg hover:shadow-xl transition-all">
              Sign Up
            </Button>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
