
import { BayesianUpdate } from "@/types/portfolio";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";

interface BayesianTableProps {
  updates: BayesianUpdate[];
}

export function BayesianTable({ updates }: BayesianTableProps) {
  if (!updates || updates.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4 animate-in">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Bayesian Return Estimates</h3>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center text-sm text-muted-foreground cursor-help">
                <Info className="h-4 w-4 mr-1" />
                <span>What is this?</span>
              </div>
            </TooltipTrigger>
            <TooltipContent side="left" className="max-w-xs">
              <p>
                Bayesian updating improves return estimates by combining historical data (prior) with recent performance (evidence).
                The posterior values represent our updated beliefs about expected returns after considering the latest market information.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ticker</TableHead>
              <TableHead className="text-right">Prior Mean</TableHead>
              <TableHead className="text-right">Prior Std</TableHead>
              <TableHead className="text-right">Posterior Mean</TableHead>
              <TableHead className="text-right">Posterior Std</TableHead>
              <TableHead className="text-right">Change</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {updates.map((update) => {
              const change = update.posteriorMean - update.priorMean;
              const percentChange = (change / Math.abs(update.priorMean)) * 100;
              
              return (
                <TableRow key={update.ticker}>
                  <TableCell className="font-medium">{update.ticker}</TableCell>
                  <TableCell className="text-right">
                    {(update.priorMean * 100).toFixed(2)}%
                  </TableCell>
                  <TableCell className="text-right">
                    {(update.priorStd * 100).toFixed(2)}%
                  </TableCell>
                  <TableCell className="text-right">
                    {(update.posteriorMean * 100).toFixed(2)}%
                  </TableCell>
                  <TableCell className="text-right">
                    {(update.posteriorStd * 100).toFixed(2)}%
                  </TableCell>
                  <TableCell 
                    className={`text-right ${
                      change > 0 
                        ? "text-green-600" 
                        : change < 0 
                        ? "text-red-600" 
                        : ""
                    }`}
                  >
                    {change > 0 ? "+" : ""}
                    {percentChange.toFixed(1)}%
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
