import { useUser } from "@clerk/react";
import { Bell, Sun, Moon, Search } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { useTheme } from "@/components/theme-provider";

export function Header() {
  const { user } = useUser();
  const { theme, setTheme } = useTheme();

  const isDark = theme === "dark";

  return (
    <header className="h-16 border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-10 flex items-center justify-between px-6">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search games..."
            className="pl-9 h-9 rounded-full bg-muted/60 border-border focus-visible:ring-1 focus-visible:ring-primary/50 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Dark mode toggle */}
        <button
          onClick={() => setTheme(isDark ? "light" : "dark")}
          className="p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          aria-label="Toggle theme"
        >
          {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>

        <button className="relative p-2 rounded-full hover:bg-muted transition-colors">
          <Bell className="h-5 w-5 text-muted-foreground" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary"></span>
        </button>

        <div className="h-6 w-px bg-border mx-1"></div>

        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end">
            <span className="text-sm font-medium leading-none">{user?.fullName || user?.username || 'Player'}</span>
            <span className="text-xs text-muted-foreground">VIP Bronze</span>
          </div>
          <Avatar className="h-9 w-9 border-2 border-primary/30 cursor-pointer">
            <AvatarImage src={user?.imageUrl} />
            <AvatarFallback className="bg-primary/10 text-primary font-bold">
              {user?.firstName?.charAt(0) || 'P'}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
