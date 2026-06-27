import { AppLayout } from "@/components/layout/AppLayout";
import { useState } from "react";
import { usePlaySlots, getGetWalletQueryKey, getGetMyStatsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const SYMBOLS = ["7️⃣", "🍒", "🍋", "💎", "⭐", "🔔"];

export default function SlotsGame() {
  const [wager, setWager] = useState("10");
  const [currency, setCurrency] = useState<"ETH" | "BTC" | "SOL" | "USDC">("USDC");
  const [reels, setReels] = useState<string[]>(["7️⃣", "7️⃣", "7️⃣"]);
  const [isSpinning, setIsSpinning] = useState(false);

  const playSlots = usePlaySlots();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handlePlay = () => {
    setIsSpinning(true);
    
    // Fake rolling effect
    const rollInterval = setInterval(() => {
      setReels([
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
      ]);
    }, 100);

    playSlots.mutate({
      data: { wager, currency }
    }, {
      onSuccess: (res) => {
        setTimeout(() => {
          clearInterval(rollInterval);
          setReels(res.reels);
          setIsSpinning(false);
          
          if (res.won) {
            toast({
              title: "JACKPOT!",
              description: `${res.multiplier}x Multiplier! Payout: ${res.payout} ${currency}`,
              className: "bg-success/20 text-success border-success/30",
            });
          } else {
            toast({
              title: "No luck",
              description: "Try again!",
              variant: "destructive",
            });
          }
          queryClient.invalidateQueries({ queryKey: getGetWalletQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetMyStatsQueryKey() });
        }, 1500);
      },
      onError: (err: any) => {
        clearInterval(rollInterval);
        setIsSpinning(false);
        toast({
          title: "Error",
          description: err.message || "Failed to place bet",
          variant: "destructive",
        });
      }
    });
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Slots</h1>
          <p className="text-muted-foreground mt-1">Spin the reels for huge multipliers.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 bg-card/50 backdrop-blur-sm border-white/5 shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent pointer-events-none"></div>
            <CardContent className="p-8 h-[400px] flex flex-col items-center justify-center relative z-10">
              
              {/* Slot Machine Frame */}
              <div className="bg-black/40 p-6 rounded-3xl border-[8px] border-primary shadow-[0_0_50px_rgba(138,43,226,0.3)] flex gap-4 overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/50 z-10 pointer-events-none"></div>
                {reels.map((symbol, i) => (
                  <div key={i} className="bg-white/10 w-24 h-32 rounded-xl border border-white/20 flex items-center justify-center relative">
                    <span className={cn(
                      "text-6xl filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]",
                      isSpinning && "animate-[bounce_0.2s_infinite]"
                    )} style={{ animationDelay: `${i * 0.1}s` }}>
                      {symbol}
                    </span>
                  </div>
                ))}
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

              <div className="bg-black/20 rounded-lg p-4 border border-white/5 flex flex-col gap-2 mt-6 text-sm text-muted-foreground">
                <div className="flex justify-between"><span>3x 7️⃣</span> <span className="font-bold text-accent">50x</span></div>
                <div className="flex justify-between"><span>3x 💎</span> <span className="font-bold text-blue-400">20x</span></div>
                <div className="flex justify-between"><span>3x ⭐</span> <span className="font-bold text-yellow-400">10x</span></div>
                <div className="flex justify-between"><span>Any 3 Match</span> <span className="font-bold text-white">5x</span></div>
                <div className="flex justify-between"><span>2x Match</span> <span className="font-bold text-white">2x</span></div>
              </div>

              <Button 
                className="w-full h-14 text-lg font-bold bg-primary hover:bg-primary/90 text-white shadow-[0_0_20px_rgba(138,43,226,0.4)] transition-all hover:scale-[1.02]"
                onClick={handlePlay}
                disabled={isSpinning || playSlots.isPending || !wager || parseFloat(wager) <= 0}
              >
                {isSpinning || playSlots.isPending ? <Loader2 className="animate-spin h-6 w-6" /> : <><Zap className="mr-2 h-5 w-5" /> SPIN</>}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
