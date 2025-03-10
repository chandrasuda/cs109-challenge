
import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";

interface SimulationControlsProps {
  numPortfolios: number;
  riskFreeRate: number;
  simulateShock: boolean;
  shockPercentage: number;
  onChange: (key: string, value: number | boolean) => void;
}

export function SimulationControls({
  numPortfolios,
  riskFreeRate,
  simulateShock,
  shockPercentage,
  onChange,
}: SimulationControlsProps) {
  const [localNumPortfolios, setLocalNumPortfolios] = useState(
    numPortfolios.toString()
  );
  const [localRiskFreeRate, setLocalRiskFreeRate] = useState(
    riskFreeRate.toString()
  );
  const [localShockPct, setLocalShockPct] = useState(
    Math.abs(shockPercentage * 100).toString()
  );

  // Handle slider changes
  const handlePortfolioSliderChange = (value: number[]) => {
    const newValue = value[0];
    setLocalNumPortfolios(newValue.toString());
    onChange("numPortfolios", newValue);
  };

  // Handle direct input changes with validation
  const handlePortfolioInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalNumPortfolios(value);
    
    const parsed = parseInt(value);
    if (!isNaN(parsed) && parsed >= 100 && parsed <= 20000) {
      onChange("numPortfolios", parsed);
    }
  };

  const handleRiskFreeRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalRiskFreeRate(value);
    
    const parsed = parseFloat(value);
    if (!isNaN(parsed) && parsed >= 0 && parsed <= 0.1) {
      onChange("riskFreeRate", parsed);
    }
  };

  const handleShockPctChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalShockPct(value);
    
    const parsed = parseFloat(value);
    if (!isNaN(parsed) && parsed >= 0 && parsed <= 100) {
      onChange("shockPercentage", -parsed / 100);
    }
  };

  return (
    <div className="space-y-8 animate-in">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="num-portfolios" className="font-medium">
            Number of Portfolios
          </Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                Controls how many random portfolios to simulate. Higher values provide more accurate results but require more computation.
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="grid grid-cols-[1fr_100px] gap-4 items-center">
          <Slider
            id="num-portfolios"
            min={100}
            max={20000}
            step={100}
            value={[numPortfolios]}
            onValueChange={handlePortfolioSliderChange}
          />
          <Input
            value={localNumPortfolios}
            onChange={handlePortfolioInputChange}
            type="number"
            min={100}
            max={20000}
            className="h-9"
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="risk-free-rate" className="font-medium">
            Risk-Free Rate
          </Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                The theoretical rate of return of an investment with zero risk, typically set to the yield of a 3-month treasury bill (e.g., 0.025 for 2.5%).
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Input
          id="risk-free-rate"
          value={localRiskFreeRate}
          onChange={handleRiskFreeRateChange}
          type="number"
          min={0}
          max={0.1}
          step={0.001}
          className="h-9"
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="shock-simulation" className="font-medium">
            Simulate Market Shock
          </Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                Simulates a sudden market downturn to analyze how your portfolio would perform in a crisis scenario.
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="shock-simulation"
            checked={simulateShock}
            onCheckedChange={(checked) => onChange("simulateShock", checked)}
          />
          <Label htmlFor="shock-simulation">
            {simulateShock ? "Enabled" : "Disabled"}
          </Label>
        </div>

        {simulateShock && (
          <div className="pt-2 pl-6 space-y-2 animate-slide-down">
            <Label htmlFor="shock-percentage" className="text-sm font-normal">
              Shock Percentage (%)
            </Label>
            <Input
              id="shock-percentage"
              value={localShockPct}
              onChange={handleShockPctChange}
              type="number"
              min={0}
              max={100}
              className="h-8"
            />
            <p className="text-xs text-muted-foreground">
              Simulating a {localShockPct}% market decline
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
