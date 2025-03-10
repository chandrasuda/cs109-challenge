
import { cn } from "@/lib/utils";

export function Footer() {
  return (
    <footer className="border-t py-6 md:py-8">
      <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            Built with precision and care. All portfolio simulations are for educational purposes only.
          </p>
        </div>
        <p className="text-center text-sm text-muted-foreground md:text-left">
          Created with modern design principles. &copy; {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  );
}
