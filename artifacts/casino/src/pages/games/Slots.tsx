import { AppLayout } from "@/components/layout/AppLayout";
import { useState } from "react";
import { usePlaySlots, getGetWalletQueryKey, getGetMyStatsQueryKey, useGetWallet } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import PlayerBalance from "@/components/PlayerBalance";

interface SlotMachine {
  id: string;
  name: string;
  emoji: string;
  symbols: string[];
  color: string;
  bg: string;
  border: string;
  glow: string;
  payouts: { label: string; mult: string; style: string }[];
}

const SLOT_MACHINES: SlotMachine[] = [
  {
    id: "classic",
    name: "Classic 777",
    emoji: "🎰",
    symbols: ["7️⃣", "🍒", "🍋", "💎", "⭐", "🔔"],
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    border: "border-blue-500/30",
    glow: "shadow-[0_0_40px_rgba(59,130,246,0.3)]",
    payouts: [
      { label: "3× 7️⃣", mult: "50×", style: "text-blue-400 font-bold" },
      { label: "3× 💎", mult: "20×", style: "text-cyan-400 font-bold" },
      { label: "3× ⭐", mult: "10×", style: "text-yellow-400 font-bold" },
      { label: "Any 3 match", mult: "5×", style: "text-white font-semibold" },
      { label: "2 match", mult: "2×", style: "text-muted-foreground" },
    ],
  },
  {
    id: "egyptian",
    name: "Egyptian Gold",
    emoji: "🏺",
    symbols: ["🪲", "👁️", "🔺", "🏺", "😺", "🌟"],
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    glow: "shadow-[0_0_40px_rgba(245,158,11,0.3)]",
    payouts: [
      { label: "3× 👁️", mult: "75×", style: "text-amber-400 font-bold" },
      { label: "3× 🪲", mult: "25×", style: "text-yellow-300 font-bold" },
      { label: "3× 🏺", mult: "12×", style: "text-orange-400 font-bold" },
      { label: "Any 3 match", mult: "5×", style: "text-white font-semibold" },
      { label: "2 match", mult: "2×", style: "text-muted-foreground" },
    ],
  },
  {
    id: "fruit",
    name: "Fruit Frenzy",
    emoji: "🍉",
    symbols: ["🍉", "🍇", "🍊", "🍓", "🍌", "🍋"],
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
    glow: "shadow-[0_0_40px_rgba(16,185,129,0.3)]",
    payouts: [
      { label: "3× 🍉", mult: "40×", style: "text-emerald-400 font-bold" },
      { label: "3× 🍇", mult: "20×", style: "text-purple-400 font-bold" },
      { label: "3× 🍓", mult: "15×", style: "text-red-400 font-bold" },
      { label: "Any 3 match", mult: "4×", style: "text-white font-semibold" },
      { label: "2 match", mult: "1.5×", style: "text-muted-foreground" },
    ],
  },
  {
    id: "space",
    name: "Space Quest",
    emoji: "🚀",
    symbols: ["🚀", "🪐", "👽", "⭐", "☄️", "🌙"],
    color: "text-violet-500",
    bg: "bg-violet-500/10",
    border: "border-violet-500/30",
    glow: "shadow-[0_0_40px_rgba(139,92,246,0.3)]",
    payouts: [
      { label: "3× 👽", mult: "100×", style: "text-violet-400 font-bold" },
      { label: "3× 🚀", mult: "30×", style: "text-indigo-400 font-bold" },
      { label: "3× 🪐", mult: "15×", style: "text-blue-300 font-bold" },
      { label: "Any 3 match", mult: "5×", style: "text-white font-semibold" },
      { label: "2 match", mult: "2×", style: "text-muted-foreground" },
    ],
  },
  {
    id: "dragon",
    name: "Lucky Dragon",
    emoji: "🐉",
    symbols: ["🐉", "🪙", "🏮", "💚", "🌸", "🔥"],
    color: "text-rose-500",
    bg: "bg-rose-500/10",
    border: "border-rose-500/30",
    glow: "shadow-[0_0_40px_rgba(244,63,94,0.3)]",
    payouts: [
      { label: "3× 🐉", mult: "88×", style: "text-rose-400 font-bold" },
      { label: "3× 🔥", mult: "33×", style: "text-orange-400 font-bold" },
      { label: "3× 🏮", mult: "16×", style: "text-red-300 font-bold" },
      { label: "Any 3 match", mult: "5×", style: "text-white font-semibold" },
      { label: "2 match", mult: "2×", style: "text-muted-foreground" },
    ],
  },
];

export default function SlotsGame() {
  const [selectedSlot, setSelectedSlot] = useState<SlotMachine>(SLOT_MACHINES[0]);
  const [wager, setWager] = useState("10");
  const [currency, setCurrency] = useState<"ETH" | "BTC" | "SOL" | "USDC">("USDC");
  const [reels, setReels] = useState<string[]>(["7️⃣", "7️⃣", "7️⃣"]);
  const [isSpinning, setIsSpinning] = useState(false);
  const { data: wallet, isLoading: isLoadingWallet } = useGetWallet();

  const playSlots = usePlaySlots();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleSelectSlot = (slot: SlotMachine) => {
    if (isSpinning) return;
    setSelectedSlot(slot);
    setReels([slot.symbols[0], slot.symbols[0], slot.symbols[0]]);
  };

  const handlePlay = () => {
    setIsSpinning(true);

    const rollInterval = setInterval(() => {
      const s = selectedSlot.symbols;
      setReels([
        s[Math.floor(Math.random() * s.length)],
        s[Math.floor(Math.random() * s.length)],
        s[Math.floor(Math.random() * s.length)],
      ]);
    }, 100);

    playSlots.mutate(
      { data: { wager, currency } },
      {
        onSuccess: (res) => {
          setTimeout(() => {
            clearInterval(rollInterval);
            // Map server reels (uses default symbols) to this slot's symbols
            const s = selectedSlot.symbols;
            const mappedReels = res.reels.map(
              (_: string, i: number) => s[i % s.length]
            );
            if (res.won) {
              // Show matching reels
              setReels([s[0], s[0], s[0]]);
            } else {
              setReels(mappedReels);
            }
            setIsSpinning(false);

            if (res.won) {
              toast({
                title: "🎉 Winner!",
                description: `${res.multiplier}x Multiplier! Payout: ${res.payout} ${currency}`,
                className: "bg-success/20 text-success border-success/30",
              });
            } else {
              toast({ title: "No luck", description: "Try again!", variant: "destructive" });
            }
            queryClient.invalidateQueries({ queryKey: getGetWalletQueryKey() });
            queryClient.invalidateQueries({ queryKey: getGetMyStatsQueryKey() });
          }, 1500);
        },
        onError: (err: any) => {
          clearInterval(rollInterval);
          setIsSpinning(false);
          toast({ title: "Error", description: err.message || "Failed to place bet", variant: "destructive" });
        },
      }
    );
  };

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500">
        <PlayerBalance wallet={wallet} isLoading={isLoadingWallet} compact />

        <div>
          <h1 className="text-3xl font-bold tracking-tight">Slots</h1>
          <p className="text-muted-foreground mt-1">Pick a machine and spin for huge multipliers.</p>
        </div>

        {/* Slot machine selector */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {SLOT_MACHINES.map((slot) => (
            <button
              key={slot.id}
              onClick={() => handleSelectSlot(slot)}
              disabled={isSpinning}
              className={cn(
                "p-4 rounded-xl border text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md",
                slot.bg,
                selectedSlot.id === slot.id
                  ? `${slot.border} ring-2 ring-offset-0 ring-current ${slot.color} shadow-md`
                  : "border-border bg-card"
              )}
            >
              <div className="text-2xl mb-1.5">{slot.emoji}</div>
              <div className={cn("text-xs font-semibold truncate", selectedSlot.id === slot.id ? slot.color : "text-foreground")}>
                {slot.name}
              </div>
            </button>
          ))}
        </div>

        {/* Game area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Reels */}
          <Card className={cn("lg:col-span-2 border bg-card/50 backdrop-blur-sm relative overflow-hidden", selectedSlot.border)}>
            <div className={cn("absolute inset-0 opacity-30 pointer-events-none", selectedSlot.bg)} />
            <CardContent className="p-8 h-[380px] flex flex-col items-center justify-center relative z-10 gap-6">

              <div className="text-center">
                <span className="text-2xl mr-2">{selectedSlot.emoji}</span>
                <span className={cn("text-lg font-bold", selectedSlot.color)}>{selectedSlot.name}</span>
              </div>

              {/* Reels */}
              <div className={cn(
                "p-5 rounded-3xl border-[6px] flex gap-3 relative overflow-hidden",
                selectedSlot.border,
                selectedSlot.glow,
                "bg-black/60"
              )}>
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/60 z-10 pointer-events-none" />
                {reels.map((symbol, i) => (
                  <div
                    key={i}
                    className={cn(
                      "w-20 h-28 rounded-xl border flex items-center justify-center relative",
                      "bg-white/10",
                      selectedSlot.border
                    )}
                  >
                    <span
                      className={cn(
                        "text-5xl filter drop-shadow-lg select-none",
                        isSpinning && "animate-[bounce_0.15s_infinite]"
                      )}
                      style={{ animationDelay: `${i * 0.05}s` }}
                    >
                      {symbol}
                    </span>
                  </div>
                ))}
              </div>

              <div className="text-xs text-muted-foreground text-center">
                Symbols: {selectedSlot.symbols.join(" ")}
              </div>
            </CardContent>
          </Card>

          {/* Controls */}
          <Card className="bg-card border-border shadow-xl">
            <CardContent className="p-6 space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Bet Amount</label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    value={wager}
                    onChange={(e) => setWager(e.target.value)}
                    className="font-mono text-base"
                  />
                  <Select value={currency} onValueChange={(v: any) => setCurrency(v)}>
                    <SelectTrigger className="w-[95px]">
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

              {/* Payout table */}
              <div className="rounded-xl p-4 border border-border bg-muted/30 flex flex-col gap-2 text-sm">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Payouts</div>
                {selectedSlot.payouts.map((p) => (
                  <div key={p.label} className="flex justify-between items-center">
                    <span className="text-muted-foreground text-xs">{p.label}</span>
                    <span className={cn("text-xs", p.style)}>{p.mult}</span>
                  </div>
                ))}
              </div>

              <Button
                className={cn(
                  "w-full h-13 text-base font-bold text-white gap-2 transition-all hover:scale-[1.02]",
                  selectedSlot.id === "classic" && "bg-blue-600 hover:bg-blue-700",
                  selectedSlot.id === "egyptian" && "bg-amber-500 hover:bg-amber-600",
                  selectedSlot.id === "fruit" && "bg-emerald-600 hover:bg-emerald-700",
                  selectedSlot.id === "space" && "bg-violet-600 hover:bg-violet-700",
                  selectedSlot.id === "dragon" && "bg-rose-600 hover:bg-rose-700",
                )}
                onClick={handlePlay}
                disabled={isSpinning || playSlots.isPending || !wager || parseFloat(wager) <= 0}
              >
                {isSpinning || playSlots.isPending ? (
                  <Loader2 className="animate-spin h-5 w-5" />
                ) : (
                  <><Zap className="h-4 w-4" /> SPIN {selectedSlot.emoji}</>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
