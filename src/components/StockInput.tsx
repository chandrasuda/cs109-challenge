import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X, Plus, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";

interface StockInputProps {
  value: string[];
  onChange: (value: string[]) => void;
}

const MAX_STOCKS = 4;

const POPULAR_STOCKS = [
  { ticker: "AAPL", name: "Apple" },
  { ticker: "MSFT", name: "Microsoft" },
  { ticker: "GOOG", name: "Google" },
  { ticker: "AMZN", name: "Amazon" },
  { ticker: "TSLA", name: "Tesla" },
  { ticker: "NVDA", name: "NVIDIA" },
  { ticker: "^GSPC", name: "S&P 500" },
];

export function StockInput({ value, onChange }: StockInputProps) {
  const [inputValue, setInputValue] = useState("");

  const handleAddStock = () => {
    if (value.length >= MAX_STOCKS) {
      toast({
        title: "Maximum stocks reached",
        description: `You can only select up to ${MAX_STOCKS} stocks at a time.`,
        variant: "destructive",
      });
      setInputValue("");
      return;
    }

    if (inputValue.trim() && !value.includes(inputValue.trim().toUpperCase())) {
      const newValue = [...value, inputValue.trim().toUpperCase()];
      onChange(newValue);
      setInputValue("");
    }
  };

  const handleRemoveStock = (ticker: string) => {
    onChange(value.filter((t) => t !== ticker));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddStock();
    }
  };

  const handleAddPopularStock = (ticker: string) => {
    if (value.length >= MAX_STOCKS) {
      toast({
        title: "Maximum stocks reached",
        description: `You can only select up to ${MAX_STOCKS} stocks at a time.`,
        variant: "destructive",
      });
      return;
    }

    if (!value.includes(ticker)) {
      onChange([...value, ticker]);
    }
  };

  const remainingSlots = MAX_STOCKS - value.length;

  return (
    <div className="space-y-4 animate-in">
      <div className="flex items-center space-x-2">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={remainingSlots > 0 
              ? `Add stock ticker (${remainingSlots} remaining)`
              : "Maximum stocks reached"}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="pl-9"
            disabled={remainingSlots === 0}
          />
        </div>
        <Button 
          onClick={handleAddStock} 
          size="icon" 
          variant="outline"
          className="shrink-0"
          disabled={remainingSlots === 0}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Selected stocks */}
      <div className="flex flex-wrap gap-2 min-h-[40px]">
        {value.map((ticker) => (
          <Badge key={ticker} variant="secondary" className="group pl-3 h-7">
            {ticker}
            <button
              onClick={() => handleRemoveStock(ticker)}
              className="ml-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>

      {/* Popular stocks suggestions */}
      <div className="pt-2">
        <p className="text-sm text-muted-foreground mb-2">
          Popular stocks {remainingSlots > 0 ? `(${remainingSlots} slots remaining)` : "(maximum reached)"}:
        </p>
        <div className="flex flex-wrap gap-2">
          {POPULAR_STOCKS.map((stock) => (
            <button
              key={stock.ticker}
              onClick={() => handleAddPopularStock(stock.ticker)}
              disabled={value.includes(stock.ticker) || remainingSlots === 0}
              className={`px-3 py-1 text-xs rounded-full transition-colors border
                ${
                  value.includes(stock.ticker) || remainingSlots === 0
                    ? "bg-secondary text-muted-foreground cursor-not-allowed"
                    : "hover:bg-secondary/80 hover:text-accent-foreground"
                }`}
            >
              {stock.ticker}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
