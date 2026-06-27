import { AppLayout } from "@/components/layout/AppLayout";
import { useListTransactions, ListTransactionsParams } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, ExternalLink } from "lucide-react";

export default function TransactionsPage() {
  const [params, setParams] = useState<ListTransactionsParams>({ page: 1, limit: 10 });
  const { data: pageData, isLoading } = useListTransactions(params);

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-500/20 text-yellow-500 border-yellow-500/20",
    confirmed: "bg-success/20 text-success border-success/20",
    failed: "bg-destructive/20 text-destructive border-destructive/20"
  };

  const typeColors: Record<string, string> = {
    deposit: "text-success",
    win: "text-success",
    withdrawal: "text-destructive",
    loss: "text-destructive",
    bet: "text-muted-foreground"
  };

  return (
    <AppLayout>
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
            <p className="text-muted-foreground mt-1">Your complete transaction history.</p>
          </div>
          
          <div className="flex items-center gap-4">
            <Select 
              value={params.type as string || "all"} 
              onValueChange={(val) => setParams(p => ({ ...p, page: 1, type: val === "all" ? undefined : val as any }))}
            >
              <SelectTrigger className="w-[140px] bg-card border-border">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="deposit">Deposits</SelectItem>
                <SelectItem value="withdrawal">Withdrawals</SelectItem>
                <SelectItem value="bet">Bets</SelectItem>
                <SelectItem value="win">Wins</SelectItem>
                <SelectItem value="loss">Losses</SelectItem>
              </SelectContent>
            </Select>

            <Select 
              value={params.currency as string || "all"} 
              onValueChange={(val) => setParams(p => ({ ...p, page: 1, currency: val === "all" ? undefined : val as any }))}
            >
              <SelectTrigger className="w-[120px] bg-card border-border">
                <SelectValue placeholder="All Coins" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Coins</SelectItem>
                <SelectItem value="BTC">BTC</SelectItem>
                <SelectItem value="ETH">ETH</SelectItem>
                <SelectItem value="SOL">SOL</SelectItem>
                <SelectItem value="USDC">USDC</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Card className="bg-card border-white/5 overflow-hidden">
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-black/20">
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden md:table-cell">Date</TableHead>
                  <TableHead className="hidden md:table-cell text-right">Reference</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array(5).fill(0).map((_, i) => (
                    <TableRow key={i} className="border-border">
                      <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                      <TableCell className="hidden md:table-cell"><Skeleton className="h-6 w-32" /></TableCell>
                      <TableCell className="hidden md:table-cell text-right"><Skeleton className="h-6 w-16 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : pageData?.items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                      No transactions found.
                    </TableCell>
                  </TableRow>
                ) : (
                  pageData?.items.map((tx) => (
                    <TableRow key={tx.id} className="border-border hover:bg-white/5">
                      <TableCell className="capitalize font-medium">
                        <span className={typeColors[tx.type]}>{tx.type}</span>
                        {tx.gameType && <span className="text-muted-foreground text-xs ml-2">({tx.gameType})</span>}
                      </TableCell>
                      <TableCell className="font-bold">
                        {tx.amount} {tx.currency}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={statusColors[tx.status]}>
                          {tx.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                        {new Date(tx.createdAt).toLocaleString()}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-right">
                        {tx.txHash ? (
                          <a href={`#`} className="text-primary hover:underline inline-flex items-center gap-1 text-sm font-mono" title={tx.txHash}>
                            {tx.txHash.substring(0, 8)}... <ExternalLink className="h-3 w-3" />
                          </a>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            
            {pageData && pageData.total > 0 && (
              <div className="p-4 border-t border-border flex items-center justify-between bg-black/10">
                <div className="text-sm text-muted-foreground">
                  Showing <span className="font-medium text-foreground">{(pageData.page - 1) * pageData.limit + 1}</span> to <span className="font-medium text-foreground">{Math.min(pageData.page * pageData.limit, pageData.total)}</span> of <span className="font-medium text-foreground">{pageData.total}</span>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setParams(p => ({ ...p, page: Math.max(1, (p.page || 1) - 1) }))}
                    disabled={pageData.page <= 1}
                  >
                    <ArrowLeft className="h-4 w-4 mr-1" /> Prev
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setParams(p => ({ ...p, page: (p.page || 1) + 1 }))}
                    disabled={pageData.page * pageData.limit >= pageData.total}
                  >
                    Next <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
