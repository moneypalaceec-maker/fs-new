import { AppLayout } from "@/components/layout/AppLayout";
import { useState } from "react";
import {
  useStartBlackjack,
  useBlackjackAction,
  getGetWalletQueryKey,
  getGetMyStatsQueryKey,
  useGetWallet,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import PlayerBalance from "@/components/PlayerBalance";

export default function BlackjackGame() {
  const [wager, setWager] = useState("10");
  const [currency, setCurrency] = useState<"ETH" | "BTC" | "SOL" | "USDC">(
    "USDC",
  );
  const [gameState, setGameState] = useState<any>(null); // Type BlackjackState
  const { data: wallet, isLoading: isLoadingWallet } = useGetWallet();

  const startBlackjack = useStartBlackjack();
  const blackjackAction = useBlackjackAction(gameState?.sessionId || "");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const isPlaying = gameState && gameState.status === "playing";

  const handleStart = () => {
    startBlackjack.mutate(
      {
        data: { wager, currency: currency as any },
      },
      {
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
        },
      },
    );
  };

  const handleAction = (action: "hit" | "stand" | "double") => {
    if (!gameState?.sessionId) return;
    blackjackAction.mutate(
      {
        sessionId: gameState.sessionId,
        data: { action },
      },
      {
        onSuccess: (res) => {
          setGameState(res);
          if (res.status !== "playing") {
            queryClient.invalidateQueries({ queryKey: getGetWalletQueryKey() });
            queryClient.invalidateQueries({
              queryKey: getGetMyStatsQueryKey(),
            });

            if (res.status === "player_win" || res.status === "blackjack") {
              toast({
                title: "You Won!",
                description: `Payout: ${res.payout} ${res.currency}`,
                className: "bg-success/20 text-success border-success/30",
              });
            } else if (res.status === "player_bust") {
              toast({
                title: "You Busted!",
                description: "Better luck next time.",
                variant: "destructive",
              });
            } else if (res.status === "dealer_bust") {
              toast({
                title: "Dealer Busted!",
                description: `You win! Payout: ${res.payout} ${res.currency}`,
                className: "bg-success/20 text-success border-success/30",
              });
            } else {
              toast({
                title: "Push",
                description: "Your bet is returned.",
              });
            }
          }
        },
        onError: (err: any) => {
          toast({
            title: "Error",
            description: err.message || "Action failed",
            variant: "destructive",
          });
        },
      },
    );
  };

  const handleNewGame = () => {
    setGameState(null);
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
        {/* Player Balance Display - Compact Version */}
        <PlayerBalance wallet={wallet} isLoading={isLoadingWallet} compact />

        <div>
          <h1 className="text-3xl font-bold tracking-tight">Blackjack</h1>
          <p className="text-muted-foreground mt-1">
            Classic blackjack game. Beat the dealer without going over 21.
          </p>
        </div>

        {!isPlaying && !gameState ? (
          // Setup Form
          <Card className="bg-card border-border/50 shadow-md">
            <CardContent className="pt-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Wager Amount
                  </label>
                  <Input
                    type="number"
                    value={wager}
                    onChange={(e) => setWager(e.target.value)}
                    className="w-full"
                    placeholder="Enter wager"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Currency
                  </label>
                  <Select
                    value={currency}
                    onValueChange={(val: any) => setCurrency(val)}
                  >
                    <SelectTrigger>
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
                onClick={handleStart}
                disabled={startBlackjack.isPending}
                className="w-full bg-primary hover:bg-primary/90"
                size="lg"
              >
                {startBlackjack.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Deal Hand
              </Button>
            </CardContent>
          </Card>
        ) : gameState ? (
          // Game State Display
          <div className="space-y-6">
            {/* Game Info */}
            <Card className="bg-card border-border/50 shadow-md">
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <p className="text-xs text-muted-foreground">Wager</p>
                    <p className="text-lg font-bold">
                      {gameState.wager} {gameState.currency}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Your Hand</p>
                    <p className="text-lg font-bold text-blue-400">
                      {gameState.playerTotal}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Dealer Showing
                    </p>
                    <p className="text-lg font-bold text-orange-400">
                      {gameState.dealerShowing || "?"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Status</p>
                    <p
                      className={cn(
                        "text-lg font-bold",
                        gameState.status === "player_win" ||
                          gameState.status === "blackjack"
                          ? "text-success"
                          : gameState.status === "player_bust"
                            ? "text-destructive"
                            : "text-primary",
                      )}
                    >
                      {gameState.status === "player_win"
                        ? "Won"
                        : gameState.status === "blackjack"
                          ? "Blackjack!"
                          : gameState.status === "player_bust"
                            ? "Bust"
                            : gameState.status === "push"
                              ? "Push"
                              : "Playing"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Cards Display */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Player Cards */}
              <Card className="bg-gradient-to-br from-blue-900/30 to-blue-900/10 border-blue-500/30">
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-blue-300 mb-4">
                    Your Hand
                  </h3>
                  <div className="grid grid-cols-4 gap-2 mb-4">
                    {gameState.playerCards?.map((card: string, idx: number) => (
                      <div
                        key={idx}
                        className="aspect-[2/3] bg-white rounded-lg flex items-center justify-center font-bold text-blue-900 text-lg"
                      >
                        {card}
                      </div>
                    ))}
                  </div>
                  <p className="text-2xl font-bold text-blue-400">
                    Total: {gameState.playerTotal}
                  </p>
                </CardContent>
              </Card>

              {/* Dealer Cards */}
              <Card className="bg-gradient-to-br from-orange-900/30 to-orange-900/10 border-orange-500/30">
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-orange-300 mb-4">
                    Dealer Hand
                  </h3>
                  <div className="grid grid-cols-4 gap-2 mb-4">
                    {gameState.dealerCards?.map((card: string, idx: number) => (
                      <div
                        key={idx}
                        className={cn(
                          "aspect-[2/3] rounded-lg flex items-center justify-center font-bold text-lg",
                          isPlaying && idx === 1
                            ? "bg-gray-800 text-gray-600"
                            : "bg-white text-orange-900",
                        )}
                      >
                        {isPlaying && idx === 1 ? "?" : card}
                      </div>
                    ))}
                  </div>
                  <p className="text-2xl font-bold text-orange-400">
                    {isPlaying ? "?" : `Total: ${gameState.dealerTotal}`}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Action Buttons */}
            {isPlaying && (
              <Card className="bg-card border-border/50 shadow-md">
                <CardContent className="pt-6">
                  <div className="flex gap-4 flex-wrap">
                    <Button
                      onClick={() => handleAction("hit")}
                      disabled={blackjackAction.isPending}
                      variant="outline"
                    >
                      {blackjackAction.isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : null}
                      Hit
                    </Button>
                    <Button
                      onClick={() => handleAction("stand")}
                      disabled={blackjackAction.isPending}
                      variant="outline"
                    >
                      Stand
                    </Button>
                    <Button
                      onClick={() => handleAction("double")}
                      disabled={blackjackAction.isPending}
                      variant="outline"
                    >
                      Double
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Payout Display */}
            {gameState.status !== "playing" &&
              gameState.payout !== undefined && (
                <Card
                  className={cn(
                    "shadow-md",
                    gameState.status === "player_win" ||
                      gameState.status === "blackjack"
                      ? "bg-success/10 border-success/30"
                      : gameState.status === "player_bust"
                        ? "bg-destructive/10 border-destructive/30"
                        : "bg-card border-border/50",
                  )}
                >
                  <CardContent className="pt-6 text-center">
                    <p className="text-sm text-muted-foreground mb-2">Payout</p>
                    <p
                      className={cn(
                        "text-3xl font-bold",
                        gameState.status === "player_win" ||
                          gameState.status === "blackjack"
                          ? "text-success"
                          : gameState.status === "player_bust"
                            ? "text-destructive"
                            : "text-foreground",
                      )}
                    >
                      {gameState.payout} {gameState.currency}
                    </p>
                  </CardContent>
                </Card>
              )}

            {/* New Game Button */}
            {gameState.status !== "playing" && (
              <Button
                onClick={handleNewGame}
                className="w-full bg-primary hover:bg-primary/90"
                size="lg"
              >
                Play Again
              </Button>
            )}
          </div>
        ) : null}
      </div>
    </AppLayout>
  );
}
