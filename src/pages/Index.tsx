
import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { StockInput } from "@/components/StockInput";
import { DateRangePicker } from "@/components/DateRangePicker";
import { SimulationControls } from "@/components/SimulationControls";
import { StockChart } from "@/components/StockChart";
import { PortfolioChart } from "@/components/PortfolioChart";
import { PortfolioWeights } from "@/components/PortfolioWeights";
import { BayesianTable } from "@/components/BayesianTable";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/use-toast";
import { PlayCircle, RefreshCw, BarChart3 } from "lucide-react";

import { fetchStockData, calculateReturns } from "@/utils/api";
import { runPortfolioSimulation, runBayesianUpdates } from "@/utils/portfolio";
import type {
  Stock,
  PortfolioSettings,
  SimulationResult,
  ReturnData,
  BayesianUpdate,
} from "@/types/portfolio";

const Index = () => {
  // State for portfolio settings
  const [settings, setSettings] = useState<PortfolioSettings>({
    tickers: ["AAPL", "MSFT", "GOOG", "AMZN", "META"],
    startDate: new Date(new Date().setFullYear(new Date().getFullYear() - 3)),
    endDate: new Date(),
    numPortfolios: 5000,
    riskFreeRate: 0.025,
    simulateShock: false,
    shockPercentage: -0.1,
  });

  // State for simulation results
  const [stockData, setStockData] = useState<Record<string, Stock>>({});
  const [returnData, setReturnData] = useState<ReturnData[]>([]);
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const [bayesianUpdates, setBayesianUpdates] = useState<BayesianUpdate[]>([]);
  const [loading, setLoading] = useState(false);
  const [simulationRun, setSimulationRun] = useState(false);

  // Handle settings changes
  const handleTickersChange = (tickers: string[]) => {
    setSettings((prev) => ({ ...prev, tickers }));
  };

  const handleStartDateChange = (date: Date) => {
    setSettings((prev) => ({ ...prev, startDate: date }));
  };

  const handleEndDateChange = (date: Date) => {
    setSettings((prev) => ({ ...prev, endDate: date }));
  };

  const handleControlChange = (key: string, value: number | boolean) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  // Run simulation
  const runSimulation = async () => {
    try {
      setLoading(true);
      
      // Basic validation
      if (settings.tickers.length < 2) {
        toast({
          title: "Not enough stocks",
          description: "Please select at least 2 stocks for portfolio diversification.",
          variant: "destructive",
        });
        return;
      }
      
      // Fetch stock data
      const data = await fetchStockData(
        settings.tickers,
        settings.startDate,
        settings.endDate
      );
      setStockData(data);
      
      // Calculate returns
      const returns = calculateReturns(data);
      setReturnData(returns);
      
      // Run Bayesian updates
      const updates = runBayesianUpdates(returns, settings.tickers);
      setBayesianUpdates(updates);
      
      // Run portfolio simulation
      const result = runPortfolioSimulation(settings, returns);
      setSimulationResult(result);
      
      setSimulationRun(true);
      
      toast({
        title: "Simulation Complete",
        description: `Successfully simulated ${settings.numPortfolios.toLocaleString()} portfolios.`,
      });
    } catch (error) {
      console.error("Simulation error:", error);
      toast({
        title: "Simulation Failed",
        description: "An error occurred while running the simulation.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-16 md:py-24 px-6">
          <div className="max-w-screen-xl mx-auto text-center space-y-6">
            <div className="inline-block mb-6">
              <div className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium animate-fade-in">
                Advanced Portfolio Analysis
              </div>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight animate-slide-down">
              Optimize Your Investment Portfolio
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto animate-slide-down">
              Using modern portfolio theory, Bayesian inference, and Monte Carlo simulations to find the optimal asset allocation.
            </p>
            
            <div className="pt-6 animate-slide-up">
              <Button 
                size="lg" 
                className="rounded-full px-8"
                onClick={() => document.getElementById("simulation")?.scrollIntoView({ behavior: "smooth" })}
              >
                Get Started
              </Button>
            </div>
          </div>
        </section>
        
        {/* Main Content */}
        <section 
          id="simulation" 
          className="py-12 px-6 bg-secondary/50"
        >
          <div className="max-w-screen-xl mx-auto space-y-12">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold">Portfolio Simulation</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Enter your investment parameters to run a Monte Carlo simulation and find the optimal portfolio allocation.
              </p>
            </div>
            
            <Card className="glass border border-border/30 shadow-glass-lg">
              <CardHeader>
                <CardTitle>Configure Your Portfolio</CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Select Stocks</h3>
                  <StockInput 
                    value={settings.tickers} 
                    onChange={handleTickersChange} 
                  />
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Date Range</h3>
                  <DateRangePicker 
                    startDate={settings.startDate}
                    endDate={settings.endDate}
                    onStartDateChange={handleStartDateChange}
                    onEndDateChange={handleEndDateChange}
                  />
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Simulation Parameters</h3>
                  <SimulationControls 
                    numPortfolios={settings.numPortfolios}
                    riskFreeRate={settings.riskFreeRate}
                    simulateShock={settings.simulateShock}
                    shockPercentage={settings.shockPercentage}
                    onChange={handleControlChange}
                  />
                </div>
                
                <div className="pt-4 flex justify-center">
                  <Button 
                    size="lg" 
                    onClick={runSimulation} 
                    disabled={loading}
                    className="rounded-full px-8 transition-all"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Simulating...
                      </>
                    ) : (
                      <>
                        <PlayCircle className="mr-2 h-5 w-5" />
                        Run Simulation
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
        
        {/* Results Section - Conditionally rendered */}
        {simulationRun && (
          <>
            <section id="analysis" className="py-12 px-6">
              <div className="max-w-screen-xl mx-auto space-y-12">
                <div className="text-center space-y-4">
                  <h2 className="text-3xl font-bold">Stock Analysis</h2>
                  <p className="text-muted-foreground max-w-2xl mx-auto">
                    Historical price performance and daily returns of selected stocks.
                  </p>
                </div>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Stock Prices & Returns</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <StockChart stocks={stockData} />
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Bayesian Return Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <BayesianTable updates={bayesianUpdates} />
                  </CardContent>
                </Card>
              </div>
            </section>
            
            <section id="optimization" className="py-12 px-6 bg-secondary/50">
              <div className="max-w-screen-xl mx-auto space-y-12">
                <div className="text-center space-y-4">
                  <h2 className="text-3xl font-bold">Portfolio Optimization</h2>
                  <p className="text-muted-foreground max-w-2xl mx-auto">
                    Efficient frontier and optimal portfolio based on the Sharpe ratio.
                  </p>
                </div>
                
                {simulationResult && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle>Efficient Frontier</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <PortfolioChart data={simulationResult} />
                      </CardContent>
                    </Card>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle>Optimal Portfolio (Max Sharpe Ratio)</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <PortfolioWeights portfolio={simulationResult.optimalPortfolio} />
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader>
                          <CardTitle>Minimum Volatility Portfolio</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <PortfolioWeights portfolio={simulationResult.minVolatilityPortfolio!} />
                        </CardContent>
                      </Card>
                    </div>
                  </>
                )}
              </div>
            </section>
          </>
        )}
        
        {/* About Section */}
        <section className="py-12 px-6">
          <div className="max-w-screen-xl mx-auto space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-4">About Portfolio Explorer</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                This application implements advanced portfolio optimization techniques from modern finance theory.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border border-border/30">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                    <BarChart3 className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Modern Portfolio Theory</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Utilizes Harry Markowitz's Nobel Prize-winning framework to optimize asset allocation based on expected returns and risk.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border border-border/30">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-6 w-6 text-primary"
                    >
                      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                      <line x1="4" y1="22" x2="4" y2="15" />
                    </svg>
                  </div>
                  <CardTitle>Bayesian Inference</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Improves return estimates by updating prior beliefs with new market data, resulting in more robust forecasts.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border border-border/30">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-6 w-6 text-primary"
                    >
                      <path d="M2 22h20" />
                      <path d="M3 2h1c3.7 0 6.7 3 6.7 6.7 0 3.7 3 6.7 6.7 6.7h2.6" />
                      <path d="M18 16l4 4-4 4" />
                    </svg>
                  </div>
                  <CardTitle>Monte Carlo Simulation</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Generates thousands of potential portfolios to explore the risk-return space and identify optimal allocations.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
