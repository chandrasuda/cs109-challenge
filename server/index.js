import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();
const TWELVE_DATA_API_KEY = 'a1162ea848064d32907b4b6662692bff';
const TWELVE_DATA_BASE_URL = 'https://api.twelvedata.com';

// Enable CORS for your frontend
app.use(cors({
  origin: ['http://localhost:8080', 'http://localhost:8082'],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Accept']
}));

// Stock data endpoint
app.get('/api/stock/:ticker', async (req, res) => {
  const { ticker } = req.params;
  const { startDate, endDate } = req.query;
  
  try {
    // Twelve Data time_series endpoint
    const url = `${TWELVE_DATA_BASE_URL}/time_series?symbol=${ticker}&interval=1day&start_date=${startDate}&end_date=${endDate}&apikey=${TWELVE_DATA_API_KEY}`;
    
    console.log(`Fetching stock data from Twelve Data: ${ticker}`);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Twelve Data API responded with status ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.code === 400 || data.code === 429) {
      throw new Error(data.message || 'API error occurred');
    }
    
    if (!data.values || !Array.isArray(data.values)) {
      throw new Error('Invalid data format received from Twelve Data');
    }
    
    // Sort values by datetime in ascending order (oldest to newest)
    const sortedValues = [...data.values].sort((a, b) => 
      new Date(a.datetime).getTime() - new Date(b.datetime).getTime()
    );
    
    // Transform the data to match our expected format
    const transformedData = {
      chart: {
        result: [{
          timestamp: sortedValues.map(v => new Date(v.datetime).getTime() / 1000),
          indicators: {
            quote: [{
              open: sortedValues.map(v => parseFloat(v.open) || null),
              high: sortedValues.map(v => parseFloat(v.high) || null),
              low: sortedValues.map(v => parseFloat(v.low) || null),
              close: sortedValues.map(v => parseFloat(v.close) || null),
              volume: sortedValues.map(v => parseInt(v.volume) || 0)
            }],
            adjclose: [{
              adjclose: sortedValues.map(v => parseFloat(v.close) || null)
            }]
          }
        }]
      }
    };
    
    res.json(transformedData);
  } catch (error) {
    console.error(`Error fetching stock data for ${ticker}:`, error);
    res.status(500).json({ 
      error: error.message,
      details: `Failed to fetch stock data for ${ticker}`
    });
  }
});

// Company info endpoint
app.get('/api/company/:ticker', async (req, res) => {
  const { ticker } = req.params;
  
  try {
    // Get symbol info from Twelve Data
    const url = `${TWELVE_DATA_BASE_URL}/symbol_search?symbol=${ticker}&apikey=${TWELVE_DATA_API_KEY}`;
    
    console.log(`Fetching company info from Twelve Data: ${ticker}`);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Twelve Data API responded with status ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.code === 400 || data.code === 429) {
      throw new Error(data.message || 'API error occurred');
    }
    
    // Find exact match for the ticker
    const matchingSymbol = data.data?.find(item => 
      item.symbol.toUpperCase() === ticker.toUpperCase()
    );
    
    if (!matchingSymbol) {
      throw new Error('No company data available');
    }
    
    // Transform to match expected format
    const result = {
      quoteResponse: {
        result: [{
          longName: matchingSymbol.instrument_name || ticker,
          shortName: matchingSymbol.symbol,
          symbol: ticker
        }]
      }
    };
    
    res.json(result);
  } catch (error) {
    console.error(`Error fetching company info for ${ticker}:`, error);
    const statusCode = error.message.includes('No company data') ? 404 : 500;
    res.status(statusCode).json({ 
      error: error.message,
      details: `Failed to fetch company info for ${ticker}`
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
});