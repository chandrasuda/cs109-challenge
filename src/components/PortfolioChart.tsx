
import { useRef, useEffect } from "react";
import { PortfolioResult, SimulationResult } from "@/types/portfolio";
import {
  CartesianGrid,
  Label,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";

interface PortfolioChartProps {
  data: SimulationResult;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="glass p-3 rounded-lg border border-border">
        <div className="font-medium mb-1">Portfolio Details</div>
        <div className="text-sm space-y-1">
          <div className="grid grid-cols-2 gap-x-2">
            <span className="text-muted-foreground">Return:</span>
            <span className="font-medium">{(data.return * 100).toFixed(2)}%</span>
          </div>
          <div className="grid grid-cols-2 gap-x-2">
            <span className="text-muted-foreground">Volatility:</span>
            <span className="font-medium">{(data.volatility * 100).toFixed(2)}%</span>
          </div>
          <div className="grid grid-cols-2 gap-x-2">
            <span className="text-muted-foreground">Sharpe Ratio:</span>
            <span className="font-medium">{data.sharpeRatio.toFixed(2)}</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export function PortfolioChart({ data }: PortfolioChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  
  // Prepare data for visualization
  const formattedData = data.portfolios.map((portfolio) => ({
    volatility: portfolio.volatility,
    return: portfolio.return,
    sharpeRatio: portfolio.sharpeRatio,
    isOptimal: false,
    isMinVol: false,
  }));
  
  // Add optimal portfolio
  if (data.optimalPortfolio) {
    formattedData.push({
      volatility: data.optimalPortfolio.volatility,
      return: data.optimalPortfolio.return,
      sharpeRatio: data.optimalPortfolio.sharpeRatio,
      isOptimal: true,
      isMinVol: false,
    });
  }
  
  // Add minimum volatility portfolio
  if (data.minVolatilityPortfolio) {
    formattedData.push({
      volatility: data.minVolatilityPortfolio.volatility,
      return: data.minVolatilityPortfolio.return,
      sharpeRatio: data.minVolatilityPortfolio.sharpeRatio,
      isOptimal: false,
      isMinVol: true,
    });
  }
  
  // Format efficient frontier data
  const frontierData = data.efficientFrontier.map((portfolio) => ({
    volatility: portfolio.volatility,
    return: portfolio.return,
  }));

  return (
    <div ref={chartRef} className="w-full h-[400px] animate-in">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart
          margin={{
            top: 20,
            right: 20,
            left: 20,
            bottom: 40,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
          <XAxis
            type="number"
            dataKey="volatility"
            name="Volatility"
            domain={['auto', 'auto']}
            tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
          >
            <Label value="Volatility" offset={-20} position="insideBottom" />
          </XAxis>
          <YAxis
            type="number"
            dataKey="return"
            name="Return"
            domain={['auto', 'auto']}
            tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
          >
            <Label value="Return" angle={-90} position="insideLeft" offset={-10} />
          </YAxis>
          <ZAxis type="number" dataKey="sharpeRatio" range={[15, 15]} />
          <Tooltip content={<CustomTooltip />} />
          
          {/* Main portfolio cloud */}
          <Scatter
            name="Portfolios"
            data={formattedData.filter(d => !d.isOptimal && !d.isMinVol)}
            fill="#8884d8"
            opacity={0.3}
          />
          
          {/* Optimal Portfolio */}
          <Scatter
            name="Optimal Portfolio"
            data={formattedData.filter(d => d.isOptimal)}
            fill="#f50057"
            shape="star"
            opacity={1}
          />
          
          {/* Minimum Volatility Portfolio */}
          <Scatter
            name="Min Volatility"
            data={formattedData.filter(d => d.isMinVol)}
            fill="#00c853"
            shape="circle"
            opacity={1}
          />
          
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}
