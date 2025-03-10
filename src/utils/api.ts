import { Stock, StockData, ReturnData } from "@/types/portfolio";

// Base URL for the proxy server
const PROXY_BASE_URL = 'http://localhost:3000/api';

// Format date for Twelve Data API (YYYY-MM-DD format)
function formatDateForAPI(date: Date): string {
  return date.toISOString().split('T')[0];
}

// Fetch real stock data through our proxy server
export const fetchStockData = async (
  tickers: string[],
  startDate: Date,
  endDate: Date
): Promise<Record<string, Stock>> => {
  const stocks: Record<string, Stock> = {};
  
  try {
    console.log("Fetching stock data through proxy server...");
    
    // Format dates for Twelve Data API
    const formattedStartDate = formatDateForAPI(startDate);
    const formattedEndDate = formatDateForAPI(endDate);
    
    // Process each ticker
    for (const ticker of tickers) {
      console.log(`Fetching data for ${ticker}...`);
      
      try {
        // Request stock data through our proxy
        const response = await fetch(
          `${PROXY_BASE_URL}/stock/${ticker}?startDate=${formattedStartDate}&endDate=${formattedEndDate}`
        );

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.details || `HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data.chart?.result?.[0]) {
          throw new Error('Invalid data format received from proxy');
        }
        
        const result = data.chart.result[0];
        const { timestamp, indicators } = result;
        const quote = indicators.quote[0];
        const adjClose = indicators.adjclose[0].adjclose;
        
        // Convert Twelve Data response to our format
        const stockData: StockData[] = timestamp.map((time: number, i: number) => ({
          date: new Date(time * 1000).toISOString().split('T')[0],
          open: Number(quote.open[i].toFixed(2)),
          high: Number(quote.high[i].toFixed(2)),
          low: Number(quote.low[i].toFixed(2)),
          close: Number(adjClose[i].toFixed(2)),
          volume: quote.volume[i]
        })).filter(d => 
          !isNaN(d.open) && !isNaN(d.high) && 
          !isNaN(d.low) && !isNaN(d.close) && 
          !isNaN(d.volume)
        );

        // Get company name
        let companyName = getDefaultStockName(ticker);
        try {
          const companyResponse = await fetch(`${PROXY_BASE_URL}/company/${ticker}`);
          if (companyResponse.ok) {
            const companyData = await companyResponse.json();
            if (companyData.quoteResponse?.result?.[0]) {
              companyName = companyData.quoteResponse.result[0].longName || 
                           companyData.quoteResponse.result[0].shortName || 
                           companyName;
            }
          }
        } catch (companyError) {
          console.warn(`Using default name for ${ticker} due to error:`, companyError);
        }
        
        stocks[ticker] = {
          ticker,
          name: companyName,
          data: stockData
        };
        
        console.log(`Successfully fetched ${stockData.length} data points for ${ticker}`);
        
        // Add delay between requests to respect API rate limits
        await new Promise(resolve => setTimeout(resolve, 250));
      } catch (error) {
        console.error(`Error fetching ${ticker} data:`, error);
        throw new Error(`Failed to fetch data for ${ticker}: ${error.message}`);
      }
    }
    
    return stocks;
  } catch (error) {
    console.error("Error in stock data fetching:", error);
    throw new Error(`Unable to fetch stock data: ${error.message}`);
  }
};

// Helper to get stock name from ticker
function getDefaultStockName(ticker: string): string {
  const names: Record<string, string> = {
    "AAPL": "Apple Inc.",
    "MSFT": "Microsoft Corporation",
    "GOOG": "Alphabet Inc.",
    "GOOGL": "Alphabet Inc.",
    "AMZN": "Amazon.com, Inc.",
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
  const tickers = Object.keys(stocks);
  
  // Initialize returns array with dates and empty ticker properties
  allDates.slice(1).forEach(date => {
    const returnPoint: ReturnData = { date };
    // Initialize all ticker properties to avoid undefined
    tickers.forEach(ticker => {
      returnPoint[ticker] = 0; // Initialize with 0
    });
    returns.push(returnPoint);
  });
  
  // Calculate returns for each stock
  tickers.forEach(ticker => {
    const stockData = stocks[ticker].data;
    if (!stockData || stockData.length < 2) return;
    
    for (let i = 1; i < stockData.length; i++) {
      const previousClose = stockData[i-1].close;
      const currentClose = stockData[i].close;
      const returnValue = (currentClose - previousClose) / previousClose;
      
      if (i-1 < returns.length) {
        returns[i-1][ticker] = returnValue;
      }
    }
  });
  
  return returns;
};
