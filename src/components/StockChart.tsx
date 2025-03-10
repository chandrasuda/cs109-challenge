
import { useState, useEffect } from "react";
import { Stock } from "@/types/portfolio";
import {
  CartesianGrid,
  Label,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface StockChartProps {
  stocks: Record<string, Stock>;
}

interface DataPoint {
  date: string;
  [key: string]: string | number;
}

// Generate unique colors for chart lines
function getLineColor(index: number, total: number): string {
  const hue = (index * 360) / (total || 1);
  return `hsl(${hue}, 70%, 60%)`;
}

export function StockChart({ stocks }: StockChartProps) {
  const [priceData, setPriceData] = useState<DataPoint[]>([]);
  const [returnData, setReturnData] = useState<DataPoint[]>([]);
  
  useEffect(() => {
    if (!stocks || Object.keys(stocks).length === 0) {
      return;
    }
    
    // Prepare price data for visualization
    const tickers = Object.keys(stocks);
    const firstStock = stocks[tickers[0]];
    if (!firstStock.data) return;
    
    // Create a map of all dates from the first stock
    const pricePoints: DataPoint[] = firstStock.data.map(d => ({ date: d.date }));
    
    // Add price data for each stock
    tickers.forEach((ticker) => {
      const stock = stocks[ticker];
      if (!stock.data) return;
      
      stock.data.forEach((dataPoint, i) => {
        if (i < pricePoints.length) {
          pricePoints[i][ticker] = dataPoint.close;
        }
      });
    });
    
    setPriceData(pricePoints);
    
    // Calculate and prepare return data
    const returnPoints: DataPoint[] = [];
    
    tickers.forEach((ticker) => {
      const stock = stocks[ticker];
      if (!stock.data || stock.data.length < 2) return;
      
      for (let i = 1; i < stock.data.length; i++) {
        const prevPrice = stock.data[i-1].close;
        const currPrice = stock.data[i].close;
        const returnValue = (currPrice - prevPrice) / prevPrice;
        
        if (i - 1 >= returnPoints.length) {
          returnPoints.push({ date: stock.data[i].date });
        }
        
        if (i - 1 < returnPoints.length) {
          returnPoints[i-1][ticker] = returnValue;
        }
      }
    });
    
    setReturnData(returnPoints);
  }, [stocks]);

  return (
    <div className="h-[400px] w-full animate-in">
      <Tabs defaultValue="price">
        <TabsList>
          <TabsTrigger value="price">Price History</TabsTrigger>
          <TabsTrigger value="returns">Returns</TabsTrigger>
        </TabsList>
        
        <TabsContent value="price" className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={priceData}
              margin={{
                top: 20,
                right: 20,
                left: 20,
                bottom: 20,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                tickCount={5}
                tickFormatter={(tick) => {
                  const date = new Date(tick);
                  return date.toLocaleDateString('en-US', { 
                    year: '2-digit', 
                    month: 'short'
                  });
                }}
              >
                <Label value="Date" offset={-10} position="insideBottom" />
              </XAxis>
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                formatter={(value: number) => [`$${value.toFixed(2)}`, ""]}
                labelFormatter={(label) => {
                  const date = new Date(label);
                  return date.toLocaleDateString('en-US', { 
                    weekday: 'short',
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric'
                  });
                }}
              />
              <Legend />
              
              {Object.keys(stocks).map((ticker, index, arr) => (
                <Line
                  key={ticker}
                  type="monotone"
                  dataKey={ticker}
                  name={ticker}
                  stroke={getLineColor(index, arr.length)}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 5 }}
                  animationDuration={1500}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </TabsContent>
        
        <TabsContent value="returns" className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={returnData}
              margin={{
                top: 20,
                right: 20,
                left: 20,
                bottom: 20,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                tickCount={5}
                tickFormatter={(tick) => {
                  const date = new Date(tick);
                  return date.toLocaleDateString('en-US', { 
                    year: '2-digit', 
                    month: 'short'
                  });
                }}
              >
                <Label value="Date" offset={-10} position="insideBottom" />
              </XAxis>
              <YAxis 
                tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
                tick={{ fontSize: 12 }}
              />
              <Tooltip 
                formatter={(value: number) => [`${(value * 100).toFixed(2)}%`, ""]}
                labelFormatter={(label) => {
                  const date = new Date(label);
                  return date.toLocaleDateString('en-US', { 
                    weekday: 'short',
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric'
                  });
                }}
              />
              <Legend />
              
              {Object.keys(stocks).map((ticker, index, arr) => (
                <Line
                  key={ticker}
                  type="monotone"
                  dataKey={ticker}
                  name={ticker}
                  stroke={getLineColor(index, arr.length)}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 5 }}
                  animationDuration={1500}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </TabsContent>
      </Tabs>
    </div>
  );
}
