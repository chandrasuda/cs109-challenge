
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X, Plus, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface StockInputProps {
  value: string[];
  onChange: (value: string[]) => void;
}

const POPULAR_STOCKS = [
  { ticker: "AAPL", name: "Apple" },
  { ticker: "MSFT", name: "Microsoft" },
  { ticker: "GOOG", name: "Google" },
  { ticker: "AMZN", name: "Amazon" },
  { ticker: "META", name: "Meta" },
  { ticker: "TSLA", name: "Tesla" },
  { ticker: "NVDA", name: "NVIDIA" },
  { ticker: "^GSPC", name: "S&P 500" },
];

export function StockInput({ value, onChange }: StockInputProps) {
  const [inputValue, setInputValue] = useState("");

  const handleAddStock = () => {
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
    if (!value.includes(ticker)) {
      onChange([...value, ticker]);
    }
  };

  return (
    <div className="space-y-4 animate-in">
      <div className="flex items-center space-x-2">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Add stock ticker (e.g., AAPL)"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="pl-9"
          />
        </div>
        <Button 
          onClick={handleAddStock} 
          size="icon" 
          variant="outline"
          className="shrink-0"
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
        <p className="text-sm text-muted-foreground mb-2">Popular stocks:</p>
        <div className="flex flex-wrap gap-2">
          {POPULAR_STOCKS.map((stock) => (
            <button
              key={stock.ticker}
              onClick={() => handleAddPopularStock(stock.ticker)}
              disabled={value.includes(stock.ticker)}
              className={`px-3 py-1 text-xs rounded-full transition-colors border
                ${
                  value.includes(stock.ticker)
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
