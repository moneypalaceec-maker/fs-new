import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, Gamepad2, Shield, Zap, Flame, Trophy, Coins } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden selection:bg-primary/30">
      {/* Navbar */}
      <nav className="border-b border-white/5 bg-background/50 backdrop-blur-md fixed w-full z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center shadow-[0_0_20px_rgba(138,43,226,0.6)]">
              <Gamepad2 className="text-white h-6 w-6" />
            </div>
            <span className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
              EnvyCasino
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/sign-in">
              <Button variant="ghost" className="text-white hover:text-white/80 hover:bg-white/5 rounded-full px-6">
                Sign In
              </Button>
            </Link>
            <Link href="/sign-up">
              <Button className="bg-primary hover:bg-primary/90 text-white rounded-full px-6 shadow-[0_0_15px_rgba(138,43,226,0.4)] transition-all hover:shadow-[0_0_25px_rgba(138,43,226,0.6)] hover:scale-105">
                Play Now
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[100px] pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-primary mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Flame className="h-4 w-4 text-accent" />
            <span className="text-sm font-medium">The Next Generation of Crypto Gaming</span>
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-bold tracking-tight mb-6 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
            High Stakes. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Instant Payouts.</span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
            Enter the VIP lounge of crypto casinos. Provably fair games, multi-currency wallet, and a dark, electric experience designed for high rollers.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300">
            <Link href="/sign-up">
              <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-lg rounded-full bg-primary hover:bg-primary/90 text-white shadow-[0_0_20px_rgba(138,43,226,0.5)] transition-all hover:shadow-[0_0_30px_rgba(138,43,226,0.7)] hover:scale-105 gap-2">
                Start Winning <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/games">
              <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 px-8 text-lg rounded-full border-white/10 bg-white/5 hover:bg-white/10 hover:text-white transition-all backdrop-blur-sm gap-2">
                View Games <Gamepad2 className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Featured Games */}
      <div className="py-24 bg-black/40 border-y border-white/5 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Provably Fair Games</h2>
            <p className="text-muted-foreground">Every roll, flip, and spin is cryptographically verifiable.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: "Dice", desc: "Classic slider dice", icon: Trophy, color: "text-purple-500", bg: "bg-purple-500/10", border: "border-purple-500/20" },
              { name: "Coinflip", desc: "Heads or tails 3D", icon: Coins, color: "text-yellow-500", bg: "bg-yellow-500/10", border: "border-yellow-500/20" },
              { name: "Blackjack", desc: "Beat the dealer", icon: Gamepad2, color: "text-green-500", bg: "bg-green-500/10", border: "border-green-500/20" },
              { name: "Slots", desc: "3-reel multiplier", icon: Zap, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20" }
            ].map((game, i) => (
              <div key={i} className={`p-6 rounded-2xl bg-card border ${game.border} hover:border-primary/50 transition-all duration-300 hover:-translate-y-2 group cursor-pointer`}>
                <div className={`h-12 w-12 rounded-xl ${game.bg} ${game.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <game.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-2">{game.name}</h3>
                <p className="text-muted-foreground text-sm">{game.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(138,43,226,0.2)]">
                <Zap className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">Lightning Fast</h3>
              <p className="text-muted-foreground">Instant deposits and withdrawals across ETH, BTC, SOL, and USDC.</p>
            </div>
            <div className="text-center">
              <div className="mx-auto h-16 w-16 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(0,255,255,0.2)]">
                <Shield className="h-8 w-8 text-accent" />
              </div>
              <h3 className="text-xl font-bold mb-3">Bank-Grade Security</h3>
              <p className="text-muted-foreground">Cold storage for funds, rigorous KYC, and industry-leading encryption.</p>
            </div>
            <div className="text-center">
              <div className="mx-auto h-16 w-16 rounded-full bg-pink-500/10 border border-pink-500/20 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(236,72,153,0.2)]">
                <Trophy className="h-8 w-8 text-pink-500" />
              </div>
              <h3 className="text-xl font-bold mb-3">VIP Rewards</h3>
              <p className="text-muted-foreground">Earn rakeback, exclusive bonuses, and rank up your VIP status as you play.</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="border-t border-white/5 py-12 bg-black/50 text-center text-sm text-muted-foreground">
        <p>© 2024 EnvyCasino. All rights reserved.</p>
        <p className="mt-2 text-xs">Gambling can be addictive. Play responsibly.</p>
      </footer>
    </div>
  );
}
