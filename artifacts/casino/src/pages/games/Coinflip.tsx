import { AppLayout } from "@/components/layout/AppLayout";
import { useState } from "react";
import { usePlayCoinflip, getGetWalletQueryKey, getGetMyStatsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function CoinflipGame() {
  const [wager, setWager] = useState("10");
  const [currency, setCurrency] = useState<"ETH" | "BTC" | "SOL" | "USDC">("USDC");
  const [choice, setChoice] = useState<"heads" | "tails">("heads");
  const [isFlipping, setIsFlipping] = useState(false);
  const [outcome, setOutcome] = useState<"heads" | "tails" | null>(null);

  const playCoinflip = usePlayCoinflip();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handlePlay = () => {
    setIsFlipping(true);
    setOutcome(null);
    playCoinflip.mutate({
      data: { wager, currency, choice }
    }, {
      onSuccess: (res) => {
        // Delay to show animation
        setTimeout(() => {
          setOutcome(res.outcome);
          setIsFlipping(false);
          
          if (res.won) {
            toast({
              title: "You Won!",
              description: `Coin landed on ${res.outcome.toUpperCase()}. Payout: ${res.payout} ${currency}`,
              className: "bg-success/20 text-success border-success/30",
            });
          } else {
            toast({
              title: "You Lost",
              description: `Coin landed on ${res.outcome.toUpperCase()}.`,
              variant: "destructive",
            });
          }
          queryClient.invalidateQueries({ queryKey: getGetWalletQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetMyStatsQueryKey() });
        }, 1500);
      },
      onError: (err: any) => {
        setIsFlipping(false);
        toast({
          title: "Error",
          description: err.message || "Failed to place bet",
          variant: "destructive",
        });
      }
    });
  };

  // Rotation calculation for the 3D coin
  const getRotation = () => {
    if (isFlipping) return 'rotateY(1800deg)'; // Spin rapidly 5 times
    if (outcome === 'tails') return 'rotateY(180deg)';
    return 'rotateY(0deg)';
  };

  return (
    <AppLayout>
      <style dangerouslySetInnerHTML={{__html: `
        .preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
      `}} />
      <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Coinflip</h1>
          <p className="text-muted-foreground mt-1">Double your money with a 50/50 chance.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 bg-card/50 backdrop-blur-sm border-white/5 shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-transparent pointer-events-none"></div>
            <CardContent className="p-8 h-[400px] flex flex-col items-center justify-center relative z-10 perspective-[1000px]">
              
              <div className="relative w-48 h-48 mx-auto mb-8 preserve-3d" 
                   style={{ 
                     transition: isFlipping ? 'transform 1.5s cubic-bezier(0.4, 0, 0.2, 1)' : 'transform 0.5s ease-out', 
                     transform: getRotation() 
                   }}>
                {/* Heads Side */}
                <div className="absolute inset-0 backface-hidden rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center border-[10px] border-yellow-700 shadow-2xl">
                  <div className="w-full h-full rounded-full border-2 border-yellow-300/50 flex flex-col items-center justify-center m-2">
                    <span className="text-4xl font-black text-yellow-900 drop-shadow-md">HEADS</span>
                  </div>
                </div>
                {/* Tails Side */}
                <div className="absolute inset-0 backface-hidden rounded-full bg-gradient-to-br from-slate-300 to-slate-500 flex items-center justify-center border-[10px] border-slate-600 shadow-2xl" 
                     style={{ transform: 'rotateY(180deg)' }}>
                  <div className="w-full h-full rounded-full border-2 border-slate-200/50 flex flex-col items-center justify-center m-2">
                    <span className="text-4xl font-black text-slate-800 drop-shadow-md">TAILS</span>
                  </div>
                </div>
              </div>

            </CardContent>
          </Card>

          <Card className="bg-card border-white/5 shadow-xl">
            <CardContent className="p-6 space-y-6">
              <div className="space-y-3">
                <label className="text-sm font-medium text-muted-foreground">Bet Amount</label>
                <div className="flex gap-2">
                  <Input 
                    type="number" 
                    value={wager} 
                    onChange={(e) => setWager(e.target.value)} 
                    className="bg-black/20 border-white/10 font-mono text-lg"
                  />
                  <Select value={currency} onValueChange={(v: any) => setCurrency(v)}>
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

              <div className="space-y-3">
                <label className="text-sm font-medium text-muted-foreground">Pick a Side</label>
                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    variant={choice === "heads" ? "default" : "outline"}
                    className={cn(
                      "h-14 font-bold text-lg",
                      choice === "heads" ? "bg-yellow-500 hover:bg-yellow-600 text-yellow-950 border-transparent shadow-[0_0_15px_rgba(234,179,8,0.4)]" : "border-white/10 bg-black/20"
                    )}
                    onClick={() => setChoice("heads")}
                  >
                    HEADS
                  </Button>
                  <Button 
                    variant={choice === "tails" ? "default" : "outline"}
                    className={cn(
                      "h-14 font-bold text-lg",
                      choice === "tails" ? "bg-slate-400 hover:bg-slate-500 text-slate-950 border-transparent shadow-[0_0_15px_rgba(148,163,184,0.4)]" : "border-white/10 bg-black/20"
                    )}
                    onClick={() => setChoice("tails")}
                  >
                    TAILS
                  </Button>
                </div>
              </div>

              <div className="bg-black/20 rounded-lg p-4 border border-white/5 flex justify-between items-center mt-6">
                <span className="text-sm text-muted-foreground">Payout</span>
                <span className="font-bold text-foreground">
                  2.00x
                </span>
              </div>

              <Button 
                className="w-full h-14 text-lg font-bold bg-primary hover:bg-primary/90 text-white shadow-[0_0_20px_rgba(138,43,226,0.4)] transition-all hover:scale-[1.02]"
                onClick={handlePlay}
                disabled={isFlipping || playCoinflip.isPending || !wager || parseFloat(wager) <= 0}
              >
                {isFlipping || playCoinflip.isPending ? <Loader2 className="animate-spin h-6 w-6" /> : "Flip Coin"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
