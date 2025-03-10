
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300 py-4 px-6",
        scrolled 
          ? "bg-background/80 backdrop-blur-md border-b" 
          : "bg-transparent"
      )}
    >
      <div className="flex items-center justify-between max-w-screen-xl mx-auto">
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold">P</span>
          </div>
          <span className="font-semibold text-lg">
            Portfolio Explorer
          </span>
        </div>
        
        <nav className="hidden md:flex items-center space-x-6">
          <a 
            href="#simulation" 
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Simulation
          </a>
          <a 
            href="#analysis" 
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Analysis
          </a>
          <a 
            href="#optimization" 
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Optimization
          </a>
        </nav>
      </div>
    </header>
  );
}
