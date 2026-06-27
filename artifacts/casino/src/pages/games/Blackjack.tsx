import { AppLayout } from "@/components/layout/AppLayout";
import { useState } from "react";
import { useStartBlackjack, useBlackjackAction, getGetWalletQueryKey, getGetMyStatsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function BlackjackGame() {
  const [wager, setWager] = useState("10");
  const [currency, setCurrency] = useState<"ETH" | "BTC" | "SOL" | "USDC">("USDC");
  const [gameState, setGameState] = useState<any>(null); // Type BlackjackState

  const startBlackjack = useStartBlackjack();
  const blackjackAction = useBlackjackAction(gameState?.sessionId || "");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const isPlaying = gameState && gameState.status === "playing";

  const handleStart = () => {
    startBlackjack.mutate({
      data: { wager, currency: currency as any }
    }, {
      onSuccess: (res) => {
        setGameState(res);
        queryClient.invalidateQueries({ queryKey: getGetWalletQueryKey() });
      },
      onError: (err: any) => {
        toast({
          title: "Error",
          description: err.message || "Failed to start game",
          variant: "destructive",
        });
      }
    });
  };

  const handleAction = (action: "hit" | "stand" | "double") => {
    if (!gameState?.sessionId) return;
    blackjackAction.mutate({
      data: { action }
    }, {
      onSuccess: (res) => {
        setGameState(res);
        if (res.status !== "playing") {
          queryClient.invalidateQueries({ queryKey: getGetWalletQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetMyStatsQueryKey() });
          
          if (res.status === "player_win" || res.status === "blackjack") {
            toast({ title: "You Won!", description: `Payout: ${res.payout} ${res.currency}`, className: "bg-success/20 text-success border-success/30" });
          } else if (res.status === "push") {
            toast({ title: "Push", description: "Bet refunded." });
          } else {
            toast({ title: "You Lost", description: "Dealer wins.", variant: "destructive" });
          }
        }
      },
      onError: (err: any) => {
        toast({ title: "Error", description: err.message || "Action failed", variant: "destructive" });
      }
    });
  };

  const renderCard = (card: string) => {
    const isRed = card.includes("♥️") || card.includes("♦️");
    return (
      <div key={card} className="w-16 h-24 bg-white rounded-lg border border-gray-200 flex items-center justify-center shadow-lg shadow-black/50 transform transition-all hover:-translate-y-2">
        <span className={cn("text-2xl font-bold", isRed ? "text-red-600" : "text-slate-900")}>
          {card}
        </span>
      </div>
    );
  };

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Blackjack</h1>
          <p className="text-muted-foreground mt-1">Beat the dealer to 21.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 bg-[#0a2e1f] border-green-900 shadow-2xl relative overflow-hidden">
            <CardContent className="p-8 min-h-[500px] flex flex-col justify-between relative z-10">
              
              {!gameState ? (
                <div className="flex-1 flex items-center justify-center text-green-700 font-bold text-4xl uppercase tracking-widest opacity-20 rotate-[-15deg]">
                  Place your bet
                </div>
              ) : (
                <>
                  {/* Dealer */}
                  <div className="flex flex-col items-center space-y-4 mt-4">
                    <div className="bg-black/40 px-4 py-1 rounded-full text-white/80 text-sm font-medium">
                      Dealer: {gameState.status === 'playing' ? '?' : gameState.dealerScore}
                    </div>
                    <div className="flex justify-center gap-2">
                      {gameState.dealerCards.map(renderCard)}
                    </div>
                  </div>

                  {/* Status Center */}
                  <div className="py-8 flex justify-center">
                    {gameState.status !== "playing" && (
                      <div className="bg-black/60 backdrop-blur-md px-8 py-4 rounded-xl border border-white/10 text-2xl font-black uppercase tracking-wider text-white shadow-2xl animate-in zoom-in duration-300">
                        {gameState.status.replace("_", " ")}
                      </div>
                    )}
                  </div>

                  {/* Player */}
                  <div className="flex flex-col items-center space-y-4 mb-4">
                    <div className="flex justify-center gap-2">
                      {gameState.playerCards.map(renderCard)}
                    </div>
                    <div className="bg-primary px-4 py-1 rounded-full text-white font-bold shadow-[0_0_10px_rgba(138,43,226,0.5)]">
                      You: {gameState.playerScore}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="bg-card border-white/5 shadow-xl flex flex-col">
            <CardContent className="p-6 flex-1 flex flex-col justify-center space-y-8">
              {!isPlaying ? (
                <>
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-muted-foreground">Bet Amount</label>
                    <div className="flex gap-2">
                      <Input 
                        type="number" 
                        value={wager} 
                        onChange={(e) => setWager(e.target.value)} 
                        className="bg-black/20 border-white/10 font-mono text-lg"
                        disabled={isPlaying}
                      />
                      <Select value={currency} onValueChange={(v: any) => setCurrency(v)} disabled={isPlaying}>
                        <SelectTrigger className="w-[100px] bg-black/20 border-white/10">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USDC">USDC</SelectItem>
                          <SelectItem value="ETH">ETH</SelectItem>
                          <SelectItem value="BTC">BTC</SelectItem>
                          <SelectItem value="SOL">SOL</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button 
                    className="w-full h-14 text-lg font-bold bg-primary hover:bg-primary/90 text-white shadow-[0_0_20px_rgba(138,43,226,0.4)] transition-all hover:scale-[1.02]"
                    onClick={handleStart}
                    disabled={startBlackjack.isPending || !wager || parseFloat(wager) <= 0}
                  >
                    {startBlackjack.isPending ? <Loader2 className="animate-spin h-6 w-6" /> : "Deal Cards"}
                  </Button>
                </>
              ) : (
                <div className="space-y-4">
                  <Button 
                    className="w-full h-12 font-bold bg-success hover:bg-success/90 text-success-foreground"
                    onClick={() => handleAction("hit")}
                    disabled={blackjackAction.isPending}
                  >
                    HIT
                  </Button>
                  <Button 
                    className="w-full h-12 font-bold bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                    onClick={() => handleAction("stand")}
                    disabled={blackjackAction.isPending}
                  >
                    STAND
                  </Button>
                  <Button 
                    className="w-full h-12 font-bold bg-accent hover:bg-accent/90 text-accent-foreground"
                    onClick={() => handleAction("double")}
                    disabled={blackjackAction.isPending}
                  >
                    DOUBLE DOWN
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
