
import { PortfolioResult } from "@/types/portfolio";
import { Progress } from "@/components/ui/progress";
import { ArrowTrendingUp, ArrowTrendingDown } from "lucide-react";

interface PortfolioWeightsProps {
  portfolio: PortfolioResult;
}

function getRandomColor(seed: string) {
  // Generate a consistent color based on the ticker string
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const h = Math.abs(hash) % 360;
  return `hsl(${h}, 70%, 60%)`;
}

export function PortfolioWeights({ portfolio }: PortfolioWeightsProps) {
  // Sort weights by allocation percentage (descending)
  const sortedWeights = Object.entries(portfolio.weights)
    .sort((a, b) => b[1] - a[1])
    .map(([ticker, weight]) => ({
      ticker,
      weight,
      color: getRandomColor(ticker),
    }));

  return (
    <div className="space-y-4 animate-in">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <h3 className="text-lg font-medium">Portfolio Metrics</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Expected Annual Return</span>
              <span className="font-medium">
                {(portfolio.return * 100).toFixed(2)}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Annual Volatility</span>
              <span className="font-medium">
                {(portfolio.volatility * 100).toFixed(2)}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Sharpe Ratio</span>
              <span className="font-medium">{portfolio.sharpeRatio.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-medium">Risk Assessment</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Return</span>
              <div className="flex items-center">
                {portfolio.return > 0.05 ? (
                  <span className="text-green-500 flex items-center space-x-1">
                    <ArrowTrendingUp className="h-4 w-4" />
                    <span>High</span>
                  </span>
                ) : portfolio.return > 0.02 ? (
                  <span className="text-yellow-500">Medium</span>
                ) : (
                  <span className="text-red-500 flex items-center space-x-1">
                    <ArrowTrendingDown className="h-4 w-4" />
                    <span>Low</span>
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Risk</span>
              <div className="flex items-center">
                {portfolio.volatility > 0.2 ? (
                  <span className="text-red-500">High</span>
                ) : portfolio.volatility > 0.1 ? (
                  <span className="text-yellow-500">Medium</span>
                ) : (
                  <span className="text-green-500">Low</span>
                )}
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Efficiency</span>
              <div className="flex items-center">
                {portfolio.sharpeRatio > 1 ? (
                  <span className="text-green-500">Excellent</span>
                ) : portfolio.sharpeRatio > 0.5 ? (
                  <span className="text-yellow-500">Good</span>
                ) : (
                  <span className="text-red-500">Poor</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="pt-4">
        <h3 className="text-lg font-medium mb-3">Asset Allocation</h3>
        <div className="space-y-3">
          {sortedWeights.map(({ ticker, weight, color }) => (
            <div key={ticker} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>{ticker}</span>
                <span className="font-medium">{(weight * 100).toFixed(1)}%</span>
              </div>
              <Progress 
                value={weight * 100} 
                max={100}
                className="h-2" 
                style={{ backgroundColor: `${color}30` }}
                indicatorClassName="transition-all duration-500" 
                indicatorStyle={{ backgroundColor: color }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
