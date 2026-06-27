import { Link, useLocation } from "wouter";
import { useUser, useClerk } from "@clerk/react";
import { 
  LayoutDashboard, Wallet, ArrowDownToLine, ArrowUpFromLine, 
  History, ShieldCheck, Gamepad2, Settings, ShieldAlert,
  LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useGetMe } from "@workspace/api-client-react";

export function Sidebar() {
  const [location] = useLocation();
  const { signOut } = useClerk();
  
  // We use useGetMe to check if admin, fallback to clerk user
  const { data: dbUser } = useGetMe();

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Wallet", href: "/wallet", icon: Wallet },
    { name: "Deposit", href: "/deposit", icon: ArrowDownToLine },
    { name: "Withdraw", href: "/withdraw", icon: ArrowUpFromLine },
    { name: "Transactions", href: "/transactions", icon: History },
    { name: "KYC Verification", href: "/verify", icon: ShieldCheck },
    { name: "Games", href: "/games", icon: Gamepad2 },
    { name: "Profile", href: "/profile", icon: Settings },
  ];

  if (dbUser?.isAdmin) {
    navigation.push({ name: "Admin Panel", href: "/admin", icon: ShieldAlert });
  }

  return (
    <div className="flex flex-col h-full w-64 bg-card border-r border-border relative z-20">
      <div className="p-6 flex items-center gap-3 border-b border-border/50">
        <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shadow-[0_0_15px_rgba(138,43,226,0.5)]">
          <Gamepad2 className="text-white h-5 w-5" />
        </div>
        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
          CryptoStake
        </span>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navigation.map((item) => {
          const isActive = location === item.href || location.startsWith(`${item.href}/`);
          return (
            <Link key={item.name} href={item.href}>
              <div
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer",
                  isActive
                    ? "bg-primary/10 text-primary shadow-[inset_2px_0_0_0_hsl(var(--primary))] border border-primary/20"
                    : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                )}
              >
                <item.icon className={cn("h-5 w-5", isActive ? "text-primary drop-shadow-[0_0_5px_rgba(138,43,226,0.5)]" : "")} />
                {item.name}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border/50">
        <button
          onClick={() => signOut({ redirectUrl: "/" })}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
        >
          <LogOut className="h-5 w-5" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
