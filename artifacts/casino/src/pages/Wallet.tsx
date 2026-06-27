import { AppLayout } from "@/components/layout/AppLayout";
import { useGetWallet } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowDownToLine, ArrowUpFromLine, Wallet as WalletIcon } from "lucide-react";
import { Link } from "wouter";

export default function WalletPage() {
  const { data: wallet, isLoading } = useGetWallet();

  const totalBalanceUsd = wallet?.balances.reduce((acc, b) => {
    const mockPrices: Record<string, number> = { ETH: 3000, BTC: 60000, SOL: 150, USDC: 1 };
    return acc + (parseFloat(b.balance) * (mockPrices[b.currency] || 0));
  }, 0);

  return (
    <AppLayout>
      <div className="space-y-8 animate-in fade-in duration-500">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Wallet</h1>
          <p className="text-muted-foreground mt-1">Manage your balances.</p>
        </div>

        <Card className="bg-card border-primary/20 shadow-[0_0_20px_rgba(138,43,226,0.15)] max-w-3xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-muted-foreground text-sm font-medium flex items-center gap-2">
              <WalletIcon className="h-4 w-4" />
              Estimated Total Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-10 w-[200px]" />
            ) : (
              <div className="text-4xl font-bold text-foreground">
                ${totalBalanceUsd?.toFixed(2) || "0.00"}
              </div>
            )}
            
            <div className="flex gap-4 mt-8">
              <Link href="/deposit">
                <Button className="bg-primary hover:bg-primary/90 gap-2">
                  <ArrowDownToLine className="h-4 w-4" />
                  Deposit
                </Button>
              </Link>
              <Link href="/withdraw">
                <Button variant="outline" className="border-border hover:bg-white/5 gap-2">
                  <ArrowUpFromLine className="h-4 w-4" />
                  Withdraw
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <h2 className="text-xl font-bold tracking-tight mt-8 mb-4">Balances</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {isLoading ? (
            Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-32 w-full" />)
          ) : (
            wallet?.balances.map((balance) => (
              <Card key={balance.currency} className="bg-card border-white/5 hover:border-primary/50 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-sm text-primary">
                      {balance.currency}
                    </div>
                    <span className="text-xs text-muted-foreground bg-white/5 px-2 py-1 rounded-md">
                      {balance.network}
                    </span>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{parseFloat(balance.balance).toFixed(4)}</div>
                    <div className="text-sm text-muted-foreground">
                      {balance.currency}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </AppLayout>
  );
}
