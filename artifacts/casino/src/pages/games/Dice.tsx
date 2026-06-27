import { AppLayout } from "@/components/layout/AppLayout";
import { useState } from "react";
import { usePlayDice, getGetWalletQueryKey, getGetMyStatsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Dices } from "lucide-react";
import { cn } from "@/lib/utils";

export default function DiceGame() {
  const [wager, setWager] = useState("10");
  const [currency, setCurrency] = useState<"ETH" | "BTC" | "SOL" | "USDC">("USDC");
  const [winChance, setWinChance] = useState(50);
  const [isOver, setIsOver] = useState(true);
  const [lastRoll, setLastRoll] = useState<number | null>(null);
  const [isRolling, setIsRolling] = useState(false);

  const playDice = usePlayDice();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const multiplier = 99 / winChance;
  const targetNumber = isOver ? 100 - winChance : winChance;

  const handlePlay = () => {
    setIsRolling(true);
    playDice.mutate({
      data: { wager, currency, winChance, isOver }
    }, {
      onSuccess: (res) => {
        setLastRoll(res.roll);
        setTimeout(() => {
          setIsRolling(false);
          if (res.won) {
            toast({
              title: "You Won!",
              description: `Roll: ${res.roll} | Payout: ${res.payout} ${currency}`,
              className: "bg-success/20 text-success border-success/30",
            });
          } else {
            toast({
              title: "You Lost",
              description: `Roll: ${res.roll}`,
              variant: "destructive",
            });
          }
          queryClient.invalidateQueries({ queryKey: getGetWalletQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetMyStatsQueryKey() });
        }, 600); // Fake animation delay
      },
      onError: (err: any) => {
        setIsRolling(false);
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
          <h1 className="text-3xl font-bold tracking-tight">Dice</h1>
          <p className="text-muted-foreground mt-1">Roll the dice to hit your target.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Game Area */}
          <Card className="lg:col-span-2 bg-card/50 backdrop-blur-sm border-white/5 shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent pointer-events-none"></div>
            <CardContent className="p-8 h-[400px] flex flex-col items-center justify-center relative z-10">
              <div className="text-center mb-8">
                <p className="text-muted-foreground font-medium uppercase tracking-wider text-sm mb-2">
                  Target: {isOver ? "Over" : "Under"} {targetNumber}
                </p>
                <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                  {multiplier.toFixed(4)}x
                </div>
                <p className="text-muted-foreground mt-2">Multiplier</p>
              </div>

              <div className={cn(
                "h-40 w-40 rounded-full flex items-center justify-center border-4 shadow-[0_0_50px_rgba(138,43,226,0.3)] transition-all duration-300",
                isRolling ? "animate-spin border-primary text-primary" : 
                lastRoll !== null ? (lastRoll > targetNumber && isOver) || (lastRoll <= targetNumber && !isOver) ? "border-success text-success shadow-[0_0_50px_rgba(34,197,94,0.3)] scale-110" : "border-destructive text-destructive shadow-[0_0_50px_rgba(239,68,68,0.3)]" :
                "border-white/10 text-white/50"
              )}>
                {isRolling ? (
                  <Dices className="h-16 w-16" />
                ) : (
                  <span className="text-6xl font-bold">{lastRoll ?? "?"}</span>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Controls */}
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

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-muted-foreground">Win Chance: {winChance}%</label>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-8 border-white/10 bg-black/20"
                    onClick={() => setIsOver(!isOver)}
                  >
                    Switch to {isOver ? "Under" : "Over"}
                  </Button>
                </div>
                <Slider 
                  value={[winChance]} 
                  min={1} 
                  max={98} 
                  step={1} 
                  onValueChange={(vals) => setWinChance(vals[0])} 
                  className="py-4"
                />
              </div>

              <div className="bg-black/20 rounded-lg p-4 border border-white/5 flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Potential Profit</span>
                <span className="font-bold text-success">
                  {((parseFloat(wager || "0") * multiplier) - parseFloat(wager || "0")).toFixed(4)} {currency}
                </span>
              </div>

              <Button 
                className="w-full h-14 text-lg font-bold bg-primary hover:bg-primary/90 text-white shadow-[0_0_20px_rgba(138,43,226,0.4)] transition-all hover:scale-[1.02]"
                onClick={handlePlay}
                disabled={isRolling || playDice.isPending || !wager || parseFloat(wager) <= 0}
              >
                {isRolling || playDice.isPending ? <Loader2 className="animate-spin h-6 w-6" /> : "Roll Dice"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
