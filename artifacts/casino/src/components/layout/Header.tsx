import { useUser } from "@clerk/react";
import { Bell, Search } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";

export function Header() {
  const { user } = useUser();

  return (
    <header className="h-16 border-b border-border bg-background/50 backdrop-blur-md sticky top-0 z-10 flex items-center justify-between px-6">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search games..." 
            className="pl-9 bg-black/20 border-white/5 focus-visible:ring-1 focus-visible:ring-primary/50 transition-all rounded-full h-9"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 rounded-full hover:bg-white/5 transition-colors">
          <Bell className="h-5 w-5 text-muted-foreground" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary shadow-[0_0_5px_rgba(138,43,226,1)]"></span>
        </button>
        
        <div className="h-8 w-px bg-border mx-1"></div>

        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end">
            <span className="text-sm font-medium leading-none">{user?.fullName || user?.username || 'Player'}</span>
            <span className="text-xs text-muted-foreground">VIP Bronze</span>
          </div>
          <Avatar className="h-9 w-9 border border-primary/20 shadow-[0_0_10px_rgba(138,43,226,0.2)] cursor-pointer">
            <AvatarImage src={user?.imageUrl} />
            <AvatarFallback className="bg-primary/20 text-primary">
              {user?.firstName?.charAt(0) || 'P'}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
