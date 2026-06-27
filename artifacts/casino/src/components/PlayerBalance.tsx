import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Wallet as WalletIcon } from "lucide-react";

interface PlayerBalanceProps {
  wallet: any;
  isLoading: boolean;
  compact?: boolean;
}

export default function PlayerBalance({ wallet, isLoading, compact = false }: PlayerBalanceProps) {
  if (isLoading) {
    return (
      <Card className={cn("bg-gradient-to-r from-blue-900/30 to-purple-900/30 border-blue-500/30", compact && "mb-2")}>
        <CardContent className={cn("pt-6", compact ? "pb-4" : "pb-6")}>
          <div className="flex items-center gap-2 mb-3">
            <WalletIcon className="h-5 w-5 text-blue-400" />
            <span className="text-sm font-semibold text-gray-300">Player Balance</span>
          </div>
          <Skeleton className="h-8 w-32" />
        </CardContent>
      </Card>
    );
  }

  const balances = wallet?.balances || [];
  const totalBalanceUsd = balances.reduce((acc: number, b: any) => {
    const mockPrices: Record<string, number> = { ETH: 3000, BTC: 60000, SOL: 150, USDC: 1 };
    return acc + (parseFloat(b.balance) * (mockPrices[b.currency] || 0));
  }, 0);

  if (compact) {
    return (
      <div className="flex items-center gap-4 p-3 rounded-lg bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-500/30">
        <div className="flex items-center gap-2">
          <WalletIcon className="h-4 w-4 text-blue-400" />
          <span className="text-xs font-semibold text-gray-400">Balance:</span>
        </div>
        <span className="text-sm font-bold text-blue-200">${totalBalanceUsd?.toFixed(2) || "0.00"}</span>
        <div className="flex gap-2 ml-auto">
          {balances.slice(0, 3).map((balance: any) => (
            <div key={balance.currency} className="flex items-center gap-1 px-2 py-1 rounded bg-black/40 border border-white/10">
              <span className="text-xs font-semibold text-gray-300">{balance.currency}:</span>
              <span className="text-xs font-bold text-white">{parseFloat(balance.balance).toFixed(3)}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <Card className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 border-blue-500/30 shadow-lg">
      <CardContent className="pt-6 pb-6">
        <div className="flex items-center gap-2 mb-4">
          <WalletIcon className="h-5 w-5 text-blue-400" />
          <span className="text-sm font-semibold text-gray-300">Player Balance</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Total USD */}
          <div className="bg-black/40 rounded-lg p-4 border border-blue-500/20">
            <p className="text-xs text-gray-400 mb-1">Total (USD)</p>
            <p className="text-2xl font-bold text-blue-300">${totalBalanceUsd?.toFixed(2) || "0.00"}</p>
          </div>

          {/* Individual balances */}
          {balances.map((balance: any) => {
            const mockPrices: Record<string, number> = { ETH: 3000, BTC: 60000, SOL: 150, USDC: 1 };
            const price = mockPrices[balance.currency] || 0;
            const usdValue = (parseFloat(balance.balance) * price).toFixed(2);

            return (
              <div key={balance.currency} className="bg-black/40 rounded-lg p-4 border border-purple-500/20">
                <p className="text-xs text-gray-400 mb-1">{balance.currency}</p>
                <p className="text-lg font-bold text-purple-300">{parseFloat(balance.balance).toFixed(4)}</p>
                <p className="text-xs text-gray-500 mt-1">≈ ${usdValue}</p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
