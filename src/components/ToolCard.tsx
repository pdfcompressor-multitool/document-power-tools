import { Link } from "react-router-dom";
import { LucideIcon } from "lucide-react";

interface ToolCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  link: string;
  highlight?: boolean;
}

const ToolCard = ({ title, description, icon: Icon, link, highlight }: ToolCardProps) => {
  return (
    <Link 
      to={link}
      className={`
        group relative bg-card rounded-xl p-8 
        transition-all duration-300 ease-out
        hover:shadow-2xl hover:-translate-y-2
        border border-border hover:border-primary
        overflow-hidden
        ${highlight ? 'tool-card-highlight' : 'tool-card-default'}
      `}
    >
      {/* Top colored bar */}
      <div className={`
        absolute top-0 left-0 w-full h-1 
        transition-all duration-300 group-hover:h-2
        ${highlight ? 'bg-accent' : 'bg-primary'}
      `} />
      
      {/* Icon wrapper */}
      <div className={`
        w-16 h-16 rounded-xl flex items-center justify-center mb-6
        shadow-lg transition-all duration-300
        ${highlight 
          ? 'bg-gradient-to-br from-accent to-accent-dark' 
          : 'bg-gradient-to-br from-primary to-primary-dark'
        }
      `}>
        <Icon className="w-9 h-9 text-white" strokeWidth={2} />
      </div>
      
      <h3 className="text-xl font-bold mb-3 text-foreground tracking-tight">
        {title}
      </h3>
      <p className="text-muted-foreground leading-relaxed">
        {description}
      </p>
    </Link>
  );
};

export default ToolCard;
