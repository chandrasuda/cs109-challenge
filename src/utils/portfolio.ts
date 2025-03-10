
import { PortfolioSettings, PortfolioResult, SimulationResult, ReturnData, BayesianUpdate } from "@/types/portfolio";

// Calculate portfolio performance metrics
export const calculatePortfolioPerformance = (
  weights: number[],
  meanReturns: number[],
  covMatrix: number[][],
  riskFreeRate: number
): PortfolioResult => {
  // Calculate expected return (annualized)
  let portfolioReturn = 0;
  for (let i = 0; i < weights.length; i++) {
    portfolioReturn += weights[i] * meanReturns[i];
  }
  portfolioReturn = portfolioReturn * 252; // Annualize
  
  // Calculate volatility (annualized)
  let portfolioVariance = 0;
  for (let i = 0; i < weights.length; i++) {
    for (let j = 0; j < weights.length; j++) {
      portfolioVariance += weights[i] * weights[j] * covMatrix[i][j];
    }
  }
  const portfolioVolatility = Math.sqrt(portfolioVariance) * Math.sqrt(252);
  
  // Calculate Sharpe Ratio
  const sharpeRatio = (portfolioReturn - riskFreeRate) / portfolioVolatility;
  
  // Create weights object (ticker: weight)
  const weightsObj: Record<string, number> = {};
  
  return {
    return: portfolioReturn,
    volatility: portfolioVolatility,
    sharpeRatio,
    weights: weightsObj // This will be populated with actual tickers in the simulation
  };
};

// Generate a random portfolio with weights summing to 1
const generateRandomWeights = (numAssets: number): number[] => {
  // Generate random numbers
  const weights = Array(numAssets).fill(0).map(() => Math.random());
  
  // Normalize so they sum to 1
  const sum = weights.reduce((a, b) => a + b, 0);
  return weights.map(w => w / sum);
};

// Calculate mean returns from return data
export const calculateMeanReturns = (returnData: ReturnData[], tickers: string[]): number[] => {
  const means: number[] = [];
  
  tickers.forEach(ticker => {
    let sum = 0;
    let count = 0;
    
    returnData.forEach(data => {
      if (data[ticker] !== undefined) {
        sum += data[ticker];
        count++;
      }
    });
    
    means.push(count > 0 ? sum / count : 0);
  });
  
  return means;
};

// Calculate covariance matrix from return data
export const calculateCovarianceMatrix = (
  returnData: ReturnData[],
  tickers: string[],
  meanReturns: number[]
): number[][] => {
  const numAssets = tickers.length;
  const covMatrix: number[][] = Array(numAssets).fill(0).map(() => Array(numAssets).fill(0));
  
  // Calculate covariances
  for (let i = 0; i < numAssets; i++) {
    for (let j = 0; j < numAssets; j++) {
      let sum = 0;
      let count = 0;
      
      returnData.forEach(data => {
        if (data[tickers[i]] !== undefined && data[tickers[j]] !== undefined) {
          sum += (data[tickers[i]] - meanReturns[i]) * (data[tickers[j]] - meanReturns[j]);
          count++;
        }
      });
      
      covMatrix[i][j] = count > 1 ? sum / (count - 1) : 0;
    }
  }
  
  return covMatrix;
};

// Perform Bayesian update on expected returns
export const performBayesianUpdate = (
  priorMean: number,
  priorStd: number,
  data: number[]
): { posteriorMean: number; posteriorStd: number } => {
  const n = data.length;
  if (n === 0) {
    return { posteriorMean: priorMean, posteriorStd: priorStd };
  }
  
  const sampleMean = data.reduce((sum, val) => sum + val, 0) / n;
  
  // Calculate sample variance
  let sampleVar = 0;
  for (const val of data) {
    sampleVar += Math.pow(val - sampleMean, 2);
  }
  sampleVar = n > 1 ? sampleVar / (n - 1) : 0;
  
  // Precision (inverse variance)
  const priorPrec = 1 / Math.pow(priorStd, 2);
  const samplePrec = sampleVar > 0 ? n / sampleVar : 0;
  
  const posteriorPrec = priorPrec + samplePrec;
  const posteriorStd = Math.sqrt(1 / posteriorPrec);
  const posteriorMean = ((priorMean * priorPrec) + (sampleMean * samplePrec)) * Math.pow(posteriorStd, 2);
  
  return { posteriorMean, posteriorStd };
};

// Run Bayesian updates for all tickers
export const runBayesianUpdates = (
  returnData: ReturnData[],
  tickers: string[]
): BayesianUpdate[] => {
  const updates: BayesianUpdate[] = [];
  
  tickers.forEach(ticker => {
    // Get all return values for this ticker
    const allReturns = returnData
      .filter(data => data[ticker] !== undefined)
      .map(data => data[ticker]);
    
    // Calculate prior mean and std (using all historical data)
    const priorMean = allReturns.reduce((sum, val) => sum + val, 0) / allReturns.length;
    
    let priorVar = 0;
    for (const val of allReturns) {
      priorVar += Math.pow(val - priorMean, 2);
    }
    priorVar = allReturns.length > 1 ? priorVar / (allReturns.length - 1) : 0.01;
    const priorStd = Math.sqrt(priorVar);
    
    // Use the last 30 data points for the update
    const recentData = allReturns.slice(-30);
    
    const { posteriorMean, posteriorStd } = performBayesianUpdate(
      priorMean,
      priorStd,
      recentData
    );
    
    updates.push({
      ticker,
      priorMean,
      priorStd,
      posteriorMean,
      posteriorStd
    });
  });
  
  return updates;
};

// Simulate a market shock by adjusting the return data
export const simulateMarketShock = (
  returnData: ReturnData[],
  shockPercentage: number
): ReturnData[] => {
  // Create a deep copy of the return data
  const shockedData = JSON.parse(JSON.stringify(returnData)) as ReturnData[];
  
  // Apply the shock to the last day
  if (shockedData.length > 0) {
    const lastDay = shockedData[shockedData.length - 1];
    
    Object.keys(lastDay).forEach(key => {
      if (key !== 'date') {
        lastDay[key] = lastDay[key] * (1 + shockPercentage);
      }
    });
  }
  
  return shockedData;
};

// Main function to run portfolio simulation
export const runPortfolioSimulation = (
  settings: PortfolioSettings,
  returnData: ReturnData[]
): SimulationResult => {
  const { tickers, numPortfolios, riskFreeRate, simulateShock, shockPercentage = -0.1 } = settings;
  
  // Convert return data to format needed for calculations
  let processedReturnData = returnData;
  
  // Apply shock if requested
  if (simulateShock) {
    processedReturnData = simulateMarketShock(returnData, shockPercentage);
  }
  
  // Calculate mean returns and covariance matrix
  const meanReturns = calculateMeanReturns(processedReturnData, tickers);
  const covMatrix = calculateCovarianceMatrix(processedReturnData, tickers, meanReturns);
  
  // Simulate random portfolios
  const portfolios: PortfolioResult[] = [];
  
  for (let i = 0; i < numPortfolios; i++) {
    const weights = generateRandomWeights(tickers.length);
    const portfolio = calculatePortfolioPerformance(weights, meanReturns, covMatrix, riskFreeRate);
    
    // Add ticker names to weights
    portfolio.weights = {};
    tickers.forEach((ticker, idx) => {
      portfolio.weights[ticker] = weights[idx];
    });
    
    portfolios.push(portfolio);
  }
  
  // Find the optimal portfolio (max Sharpe ratio)
  let optimalPortfolio = portfolios.reduce((best, current) => {
    return current.sharpeRatio > best.sharpeRatio ? current : best;
  }, portfolios[0]);
  
  // Find minimum volatility portfolio
  const minVolatilityPortfolio = portfolios.reduce((min, current) => {
    return current.volatility < min.volatility ? current : min;
  }, portfolios[0]);
  
  // Generate the efficient frontier
  // For this simplified version, we'll just select portfolios that are "on the frontier"
  const efficientFrontier = findEfficientFrontier(portfolios);
  
  return {
    portfolios,
    efficientFrontier,
    optimalPortfolio,
    minVolatilityPortfolio
  };
};

// Helper function to find the efficient frontier points
const findEfficientFrontier = (portfolios: PortfolioResult[]): PortfolioResult[] => {
  // Sort portfolios by volatility
  const sorted = [...portfolios].sort((a, b) => a.volatility - b.volatility);
  
  const frontier: PortfolioResult[] = [];
  let maxReturn = -Infinity;
  
  // For each volatility level, find the portfolio with the highest return
  for (let i = 0; i < sorted.length; i++) {
    if (sorted[i].return > maxReturn) {
      frontier.push(sorted[i]);
      maxReturn = sorted[i].return;
    }
  }
  
  return frontier;
};
