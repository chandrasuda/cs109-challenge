
import { Stock, StockData, ReturnData } from "@/types/portfolio";

// Simulate API call to fetch stock data
export const fetchStockData = async (
  tickers: string[],
  startDate: Date,
  endDate: Date
): Promise<Record<string, Stock>> => {
  // This is a mock implementation
  // In a real app, this would call an API or service like yfinance
  
  const stocks: Record<string, Stock> = {};
  
  try {
    // For demo purposes, generate random stock data
    for (const ticker of tickers) {
      const data: StockData[] = generateMockStockData(startDate, endDate, ticker);
      
      stocks[ticker] = {
        ticker,
        name: getStockName(ticker),
        data
      };
    }
    
    return stocks;
  } catch (error) {
    console.error("Error fetching stock data:", error);
    throw new Error("Failed to fetch stock data");
  }
};

// Mock function to generate realistic looking stock data
function generateMockStockData(startDate: Date, endDate: Date, ticker: string): StockData[] {
  const data: StockData[] = [];
  
  // Generate random starting price based on ticker (for realistic values)
  let seedMultiplier = 1;
  for (let i = 0; i < ticker.length; i++) {
    seedMultiplier += ticker.charCodeAt(i) / 100;
  }
  
  // Starting price between $50-$500 based on ticker
  let price = 50 + (Math.random() * 450 * (seedMultiplier % 1));
  
  // Generate daily data between start and end dates
  const currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    // Skip weekends
    if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
      // Add some randomness to price movement
      // More volatile for certain tickers
      const volatility = ticker.includes("^") ? 0.02 : 0.01;
      const change = price * volatility * (Math.random() - 0.5);
      price += change;
      
      // Ensure price doesn't go below 1
      price = Math.max(price, 1);
      
      data.push({
        date: currentDate.toISOString().split('T')[0],
        close: parseFloat(price.toFixed(2)),
        high: parseFloat((price + Math.random() * 2).toFixed(2)),
        low: parseFloat((price - Math.random() * 2).toFixed(2)),
        open: parseFloat((price - change).toFixed(2)),
        volume: Math.floor(Math.random() * 1000000) + 100000
      });
    }
    
    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return data;
}

// Helper to get stock name from ticker
function getStockName(ticker: string): string {
  const names: Record<string, string> = {
    "AAPL": "Apple Inc.",
    "MSFT": "Microsoft Corporation",
    "GOOG": "Alphabet Inc.",
    "GOOGL": "Alphabet Inc.",
    "AMZN": "Amazon.com, Inc.",
    "META": "Meta Platforms, Inc.",
    "TSLA": "Tesla, Inc.",
    "NVDA": "NVIDIA Corporation",
    "^GSPC": "S&P 500 Index",
    "^DJI": "Dow Jones Industrial Average",
    "^IXIC": "NASDAQ Composite"
  };
  
  return names[ticker] || `${ticker} Stock`;
}

// Convert stock data to return data for analysis
export const calculateReturns = (stocks: Record<string, Stock>): ReturnData[] => {
  if (!stocks || Object.keys(stocks).length === 0) {
    return [];
  }
  
  // Get all dates from the first stock
  const firstTicker = Object.keys(stocks)[0];
  if (!stocks[firstTicker]?.data?.length) {
    return [];
  }
  
  const returns: ReturnData[] = [];
  const allDates = stocks[firstTicker].data!.map(d => d.date);
  
  // Initialize returns array with dates
  allDates.slice(1).forEach(date => {
    returns.push({ date });
  });
  
  // Calculate returns for each stock
  Object.keys(stocks).forEach(ticker => {
    const stockData = stocks[ticker].data;
    if (!stockData || stockData.length < 2) return;
    
    for (let i = 1; i < stockData.length; i++) {
      const previousClose = stockData[i-1].close;
      const currentClose = stockData[i].close;
      const returnValue = (currentClose - previousClose) / previousClose;
      
      returns[i-1][ticker] = returnValue;
    }
  });
  
  return returns;
};
