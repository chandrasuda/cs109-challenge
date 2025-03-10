
export interface Stock {
  ticker: string;
  name?: string;
  data?: StockData[];
}

export interface StockData {
  date: string;
  close: number;
  volume?: number;
  high?: number;
  low?: number;
  open?: number;
}

export interface PortfolioSettings {
  tickers: string[];
  startDate: Date;
  endDate: Date;
  numPortfolios: number;
  riskFreeRate: number;
  simulateShock: boolean;
  shockPercentage?: number;
}

export interface PortfolioResult {
  return: number;
  volatility: number;
  sharpeRatio: number;
  weights: Record<string, number>;
}

export interface SimulationResult {
  portfolios: PortfolioResult[];
  efficientFrontier: PortfolioResult[];
  optimalPortfolio: PortfolioResult;
  minVolatilityPortfolio?: PortfolioResult;
  shockPortfolio?: PortfolioResult;
}

export interface ReturnData {
  date: string;
  [key: string]: any; // For each ticker
}

export interface BayesianUpdate {
  ticker: string;
  priorMean: number;
  priorStd: number;
  posteriorMean: number;
  posteriorStd: number;
}
