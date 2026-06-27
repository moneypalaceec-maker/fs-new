import { AppLayout } from "@/components/layout/AppLayout";
import { useGetMyStats, useGetMyActivity, useGetWallet } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowUpRight, ArrowDownRight, Trophy, Coins, Activity, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Dashboard() {
  const { data: stats, isLoading: isLoadingStats } = useGetMyStats();
  const { data: activity, isLoading: isLoadingActivity } = useGetMyActivity({ limit: 5 });
  const { data: wallet, isLoading: isLoadingWallet } = useGetWallet();

  const totalBalanceUsd = wallet?.balances.reduce((acc, b) => {
    // Mock USD value calculation for display
    const mockPrices: Record<string, number> = { ETH: 3000, BTC: 60000, SOL: 150, USDC: 1 };
    return acc + (parseFloat(b.balance) * (mockPrices[b.currency] || 0));
  }, 0);

  return (
    <AppLayout>
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground mt-1">Overview of your activity and balances.</p>
          </div>
        </div>

        {/* Top Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-card border-border/50 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Balance (Est)</CardTitle>
              <Coins className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              {isLoadingWallet ? (
                <Skeleton className="h-8 w-[120px]" />
              ) : (
                <div className="text-2xl font-bold">${totalBalanceUsd?.toFixed(2) || "0.00"}</div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-card border-border/50 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Wagered</CardTitle>
              <Zap className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              {isLoadingStats ? (
                <Skeleton className="h-8 w-[120px]" />
              ) : (
                <div className="text-2xl font-bold">${parseFloat(stats?.totalWagers || "0").toFixed(2)}</div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-card border-border/50 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Net Profit</CardTitle>
              <Trophy className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              {isLoadingStats ? (
                <Skeleton className="h-8 w-[120px]" />
              ) : (
                <div className={cn(
                  "text-2xl font-bold",
                  parseFloat(stats?.netProfit || "0") >= 0 ? "text-success" : "text-destructive"
                )}>
                  {parseFloat(stats?.netProfit || "0") >= 0 ? "+" : ""}${parseFloat(stats?.netProfit || "0").toFixed(2)}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-card border-border/50 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Win Rate</CardTitle>
              <Activity className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              {isLoadingStats ? (
                <Skeleton className="h-8 w-[80px]" />
              ) : (
                <div className="text-2xl font-bold">{(stats?.winRate ? stats.winRate * 100 : 0).toFixed(1)}%</div>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                {stats?.gamesPlayed || 0} games played
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <Card className="col-span-1 lg:col-span-2 bg-card border-border/50 shadow-md">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingActivity ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : activity?.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No recent activity found.
                </div>
              ) : (
                <div className="space-y-4">
                  {activity?.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-black/20 border border-white/5">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "h-10 w-10 rounded-full flex items-center justify-center",
                          item.type === 'win' || item.type === 'deposit' ? "bg-success/20 text-success" : 
                          item.type === 'loss' || item.type === 'withdrawal' ? "bg-destructive/20 text-destructive" : 
                          "bg-primary/20 text-primary"
                        )}>
                          {item.type === 'deposit' || item.type === 'win' ? <ArrowDownRight className="h-5 w-5" /> : 
                           item.type === 'withdrawal' || item.type === 'loss' ? <ArrowUpRight className="h-5 w-5" /> :
                           <Gamepad2 className="h-5 w-5" />}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{item.description}</p>
                          <p className="text-xs text-muted-foreground">{new Date(item.createdAt).toLocaleString()}</p>
                        </div>
                      </div>
                      <div className={cn(
                        "font-bold",
                        item.type === 'win' || item.type === 'deposit' ? "text-success" : 
                        item.type === 'loss' || item.type === 'withdrawal' ? "text-destructive" : 
                        "text-foreground"
                      )}>
                        {item.type === 'win' || item.type === 'deposit' ? "+" : 
                         item.type === 'loss' || item.type === 'withdrawal' ? "-" : ""}
                        {item.amount} {item.currency}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Balances */}
          <Card className="col-span-1 bg-card border-border/50 shadow-md">
            <CardHeader>
              <CardTitle>Balances</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingWallet ? (
                <div className="space-y-4">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {wallet?.balances.map((balance) => (
                    <div key={balance.currency} className="flex items-center justify-between p-3 rounded-lg bg-black/20 border border-white/5">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-xs text-primary">
                          {balance.currency}
                        </div>
                        <span className="font-medium">{balance.currency}</span>
                      </div>
                      <span className="font-bold">{parseFloat(balance.balance).toFixed(4)}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
