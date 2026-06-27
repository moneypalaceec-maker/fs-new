import { AppLayout } from "@/components/layout/AppLayout";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Gamepad2, Coins, Trophy, Zap } from "lucide-react";

export default function GamesPage() {
  const games = [
    { 
      name: "Dice", 
      desc: "Set your win chance and roll the dice. Simple, fast, provably fair.", 
      href: "/games/dice",
      icon: Trophy, 
      color: "text-purple-500", 
      bg: "bg-purple-500/10", 
      border: "border-purple-500/20",
      hover: "hover:border-purple-500/50 hover:shadow-[0_0_30px_rgba(168,85,247,0.15)]"
    },
    { 
      name: "Coinflip", 
      desc: "50/50 chance to double your money. Heads or tails?", 
      href: "/games/coinflip",
      icon: Coins, 
      color: "text-yellow-500", 
      bg: "bg-yellow-500/10", 
      border: "border-yellow-500/20",
      hover: "hover:border-yellow-500/50 hover:shadow-[0_0_30px_rgba(234,179,8,0.15)]"
    },
    { 
      name: "Blackjack", 
      desc: "The classic casino card game. Beat the dealer to 21.", 
      href: "/games/blackjack",
      icon: Gamepad2, 
      color: "text-green-500", 
      bg: "bg-green-500/10", 
      border: "border-green-500/20",
      hover: "hover:border-green-500/50 hover:shadow-[0_0_30px_rgba(34,197,94,0.15)]"
    },
    { 
      name: "Slots", 
      desc: "Spin the reels for a chance at huge multipliers.", 
      href: "/games/slots",
      icon: Zap, 
      color: "text-blue-500", 
      bg: "bg-blue-500/10", 
      border: "border-blue-500/20",
      hover: "hover:border-blue-500/50 hover:shadow-[0_0_30px_rgba(59,130,246,0.15)]"
    }
  ];

  return (
    <AppLayout>
      <div className="space-y-8 animate-in fade-in duration-500">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Games Lobby</h1>
          <p className="text-muted-foreground mt-1">Select a game to start playing.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.map((game) => (
            <Link key={game.name} href={game.href}>
              <Card className={`bg-card/50 backdrop-blur-sm border ${game.border} ${game.hover} transition-all duration-300 hover:-translate-y-1 cursor-pointer h-full overflow-hidden group relative`}>
                <div className={`absolute top-0 right-0 w-32 h-32 ${game.bg} rounded-full blur-[50px] -mr-10 -mt-10 pointer-events-none transition-opacity opacity-50 group-hover:opacity-100`}></div>
                
                <CardContent className="p-8 flex flex-col h-full relative z-10">
                  <div className={`h-16 w-16 rounded-2xl ${game.bg} ${game.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <game.icon className="h-8 w-8" />
                  </div>
                  <h2 className="text-2xl font-bold mb-3">{game.name}</h2>
                  <p className="text-muted-foreground">{game.desc}</p>
                  
                  <div className="mt-auto pt-8">
                    <div className="inline-flex items-center text-sm font-bold uppercase tracking-wider text-primary group-hover:text-white transition-colors">
                      Play Now <span className="ml-2 transform group-hover:translate-x-1 transition-transform">→</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
