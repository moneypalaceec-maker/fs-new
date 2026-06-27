import { Link, useLocation } from "wouter";
import { useClerk } from "@clerk/react";
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
    <div className="flex flex-col h-full w-64 bg-sidebar border-r border-sidebar-border relative z-20">
      {/* Logo */}
      <div className="p-5 flex items-center gap-3 border-b border-sidebar-border">
        <img
          src="/logo.png"
          alt="EnvyCasino"
          className="h-8 w-8 rounded-lg object-contain"
        />
        <span className="text-lg font-bold text-foreground tracking-tight">
          Envy<span className="text-primary">Casino</span>
        </span>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
        {navigation.map((item) => {
          const isActive = location === item.href || location.startsWith(`${item.href}/`);
          return (
            <Link key={item.name} href={item.href}>
              <div
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 cursor-pointer",
                  isActive
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className={cn("h-4 w-4 shrink-0", isActive ? "text-primary" : "")} />
                {item.name}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <button
          onClick={() => signOut({ redirectUrl: "/" })}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
