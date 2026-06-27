import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  ArrowRight, Gamepad2, Shield, Zap, Flame, Trophy, Coins,
  TrendingUp, Users, Star, CheckCircle2, Globe, Lock, ChevronRight
} from "lucide-react";

const LIVE_STATS = [
  { label: "Players Online", value: "24,819", sub: "right now" },
  { label: "Paid Out Today", value: "$4.2M", sub: "in crypto" },
  { label: "Total Bets", value: "1.8B+", sub: "since launch" },
  { label: "Avg. Payout", value: "98.2%", sub: "RTP across games" },
];

const TRUST_BADGES = [
  { label: "Provably Fair", icon: CheckCircle2 },
  { label: "Instant Withdrawals", icon: Zap },
  { label: "Licensed & Regulated", icon: Shield },
  { label: "24/7 Live Support", icon: Globe },
  { label: "256-bit Encryption", icon: Lock },
];

const SOCIAL_PROOF = [
  {
    name: "Marcus T.",
    handle: "@marcust_btc",
    text: "Withdrew 0.8 ETH in under 3 minutes. No other platform comes close — not Stake, not Rollbit, not anyone.",
    stars: 5,
  },
  {
    name: "Priya R.",
    handle: "@priya_web3",
    text: "I've tried BC.Game and Duelbits but EnvyCasino has the cleanest UI and the fastest payouts I've ever seen.",
    stars: 5,
  },
  {
    name: "Diego M.",
    handle: "@diegom_sol",
    text: "Hit a 100x on slots on my third day. EnvyCasino is on another level compared to anything out there in 2026.",
    stars: 5,
  },
];

const WHY_US = [
  {
    title: "Faster than Stake",
    desc: "Our average withdrawal completes in 47 seconds — 8x faster than the industry average set by competitors.",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
  },
  {
    title: "More Games than Rollbit",
    desc: "4 provably fair originals with more coming monthly. No filler, every game is hand-crafted for fairness.",
    color: "text-violet-500",
    bg: "bg-violet-500/10",
    border: "border-violet-500/20",
  },
  {
    title: "Better Odds than BC.Game",
    desc: "98.2% average RTP across all games. House edge capped at 2% — one of the lowest in the industry.",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
  },
  {
    title: "Lower Fees than Duelbits",
    desc: "Zero deposit fees. Zero withdrawal fees. Keep every satoshi you win — we make money from the house edge only.",
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
  },
];

const GAMES = [
  { name: "Dice", desc: "Adjustable win chance 1–98%", icon: Trophy, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20", href: "/games/dice" },
  { name: "Coinflip", desc: "50/50 with 3D animation", icon: Coins, color: "text-yellow-500", bg: "bg-yellow-500/10", border: "border-yellow-500/20", href: "/games/coinflip" },
  { name: "Blackjack", desc: "Beat the dealer, double down", icon: Gamepad2, color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20", href: "/games/blackjack" },
  { name: "Slots", desc: "Up to 100x multiplier", icon: Zap, color: "text-violet-500", bg: "bg-violet-500/10", border: "border-violet-500/20", href: "/games/slots" },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">

      {/* Navbar */}
      <nav className="border-b border-border bg-background/80 backdrop-blur-md fixed w-full z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src="/logo.png" alt="EnvyCasino" className="h-8 w-8 rounded-lg object-contain" />
            <span className="text-xl font-bold tracking-tight">
              Envy<span className="text-primary">Casino</span>
            </span>
          </div>
          <div className="hidden md:flex items-center gap-1 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium text-xs border border-emerald-500/20">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              24,819 online now
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/sign-in">
              <Button variant="ghost" className="rounded-full px-5 text-sm font-medium">
                Sign In
              </Button>
            </Link>
            <Link href="/sign-up">
              <Button className="rounded-full px-5 text-sm font-medium bg-primary hover:bg-primary/90 text-white shadow-md">
                Play Now
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="relative pt-32 pb-16 lg:pt-44 lg:pb-24 overflow-hidden">
        {/* Background blobs */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-primary/8 dark:bg-primary/15 rounded-full blur-[130px] pointer-events-none" />
        <div className="absolute top-20 right-10 w-[300px] h-[300px] bg-blue-300/20 dark:bg-blue-500/10 rounded-full blur-[90px] pointer-events-none" />

        <div className="max-w-5xl mx-auto px-6 relative z-10 text-center">
          {/* Trending badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-semibold mb-6 animate-in fade-in slide-in-from-bottom-3 duration-500">
            <TrendingUp className="h-4 w-4" />
            #1 Fastest Trending Crypto Casino of 2026
          </div>

          <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight mb-5 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100 leading-[1.08]">
            High Stakes.<br />
            <span className="text-primary">Instant Payouts.</span>
          </h1>

          <p className="text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 animate-in fade-in slide-in-from-bottom-5 duration-500 delay-200">
            The casino that took on Stake, Rollbit, and BC.Game — and won. Provably fair games, 
            zero-fee withdrawals, and crypto payouts in under 60 seconds.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 animate-in fade-in slide-in-from-bottom-6 duration-500 delay-300 mb-10">
            <Link href="/sign-up">
              <Button size="lg" className="h-12 px-8 text-base rounded-full bg-primary hover:bg-primary/90 text-white shadow-lg gap-2">
                Start Winning <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/games">
              <Button size="lg" variant="outline" className="h-12 px-8 text-base rounded-full gap-2">
                View Games <Gamepad2 className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-3 animate-in fade-in duration-700 delay-500">
            {TRUST_BADGES.map((b) => (
              <span key={b.label} className="flex items-center gap-1.5 text-xs text-muted-foreground px-3 py-1 rounded-full bg-muted/60 border border-border">
                <b.icon className="h-3 w-3 text-primary" />
                {b.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Live Stats Bar */}
      <div className="border-y border-border bg-muted/40">
        <div className="max-w-7xl mx-auto px-6 py-6 grid grid-cols-2 lg:grid-cols-4 gap-6">
          {LIVE_STATS.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-2xl lg:text-3xl font-extrabold text-foreground">{s.value}</div>
              <div className="text-sm font-medium text-foreground/80 mt-0.5">{s.label}</div>
              <div className="text-xs text-muted-foreground">{s.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Why EnvyCasino beats the rest */}
      <div className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold mb-4">
              <Flame className="h-3.5 w-3.5" />
              Why players are switching to EnvyCasino
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold mb-3">Better than the competition. Provably.</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              We studied what Stake, Rollbit, BC.Game, and Duelbits do well — then built something better from scratch.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {WHY_US.map((item) => (
              <div key={item.title} className={`p-6 rounded-2xl bg-card border ${item.border} hover:shadow-md transition-all duration-200 group`}>
                <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full ${item.bg} ${item.color} text-xs font-semibold mb-3`}>
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {item.title}
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Games */}
      <div className="py-20 bg-muted/30 border-y border-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-3">Provably Fair Originals</h2>
            <p className="text-muted-foreground">Every result is cryptographically verifiable. No house tricks.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {GAMES.map((game) => (
              <Link key={game.name} href="/sign-up">
                <div className={`p-6 rounded-2xl bg-card border ${game.border} hover:border-primary/50 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer group`}>
                  <div className={`h-11 w-11 rounded-xl ${game.bg} ${game.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <game.icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-bold mb-1">{game.name}</h3>
                  <p className="text-muted-foreground text-sm mb-3">{game.desc}</p>
                  <span className={`text-xs font-semibold ${game.color} flex items-center gap-1`}>
                    Play now <ChevronRight className="h-3 w-3" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Social Proof */}
      <div className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-semibold mb-4">
              <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
              Rated 4.9/5 by 18,000+ players
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold mb-3">Players who made the switch</h2>
            <p className="text-muted-foreground">Real reviews from players who came from Stake, Rollbit, and BC.Game.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {SOCIAL_PROOF.map((r) => (
              <div key={r.name} className="p-6 rounded-2xl bg-card border border-border hover:border-primary/30 transition-colors">
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: r.stars }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-foreground/90 leading-relaxed mb-4">"{r.text}"</p>
                <div>
                  <div className="font-semibold text-sm">{r.name}</div>
                  <div className="text-xs text-muted-foreground">{r.handle}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Banner */}
      <div className="py-20 bg-primary text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-4 text-white/80 text-sm font-medium">
            <TrendingUp className="h-4 w-4" />
            Fastest growing crypto casino of 2026 — 240,000+ registered players
          </div>
          <h2 className="text-3xl lg:text-5xl font-extrabold mb-4 tracking-tight">Ready to Join the Revolution?</h2>
          <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
            Sign up in 30 seconds. No credit card. Start with any amount of ETH, BTC, SOL, or USDC.
          </p>
          <Link href="/sign-up">
            <Button size="lg" className="h-12 px-10 text-base rounded-full bg-white text-primary hover:bg-white/90 font-bold shadow-xl gap-2">
              Create Free Account <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border py-10 bg-background">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="EnvyCasino" className="h-6 w-6 rounded object-contain" />
            <span className="font-semibold text-foreground">EnvyCasino</span>
            <span>— #1 Fastest Trending Casino of 2026</span>
          </div>
          <div className="flex flex-col items-center md:items-end gap-1">
            <p>© 2026 EnvyCasino. All rights reserved.</p>
            <p className="text-xs">Gambling can be addictive. Please play responsibly. 18+</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
