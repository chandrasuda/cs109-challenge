
import { cn } from "@/lib/utils";

export function Footer() {
  return (
    <footer className="border-t py-6 md:py-8">
      <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          {/* Removed "Built with precision and care" text */}
        </div>
        <div className="text-center text-sm text-muted-foreground md:text-right flex flex-col">
          <p>Developed by Chandra Suda for CS109 Project</p>
          <p>&copy; {new Date().getFullYear()}</p>
          {/* Removed "Created with modern design principles" text */}
        </div>
      </div>
    </footer>
  );
}
