
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, ChevronDown, MenuIcon, Search, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Sidebar } from './Sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { LanguageToggle } from '@/components/LanguageToggle';
import { t } from '@/utils/translations';
import { useAuth } from '@/contexts/AuthContext';

export function TopBar() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/auth');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user || !user.user_metadata) return 'U';
    
    const name = user.user_metadata.name || '';
    const lastName = user.user_metadata.last_name || '';
    
    return `${name.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || 'U';
  };

  // Get user display name
  const getUserDisplayName = () => {
    if (!user || !user.user_metadata) return t("admin");
    
    const name = user.user_metadata.name || '';
    const lastName = user.user_metadata.last_name || '';
    
    return name ? `${name} ${lastName}` : user.email?.split('@')[0] || t("admin");
  };

  return (
    <header className="h-16 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center px-4 sticky top-0 z-30 w-full">
      <div className="flex items-center gap-2 md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <MenuIcon className="h-5 w-5" />
              <span className="sr-only">תפריט ניווט</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="p-0 max-w-[250px]">
            <Sidebar />
          </SheetContent>
        </Sheet>
      </div>

      <div className={cn(
        "ml-auto flex items-center gap-4",
        isSearchOpen ? "hidden md:flex" : "flex"
      )}>
        <div className="hidden md:flex relative">
          <Search className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder={t("search")}
            className="w-64 pr-8 bg-background"
          />
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setIsSearchOpen(!isSearchOpen)}
        >
          <Search className="h-5 w-5" />
          <span className="sr-only">{t("search")}</span>
        </Button>

        <LanguageToggle />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-accent text-accent-foreground">
                3
              </Badge>
              <span className="sr-only">{t("notifications")}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>{t("notifications")}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="max-h-80 overflow-y-auto">
              {[1, 2, 3].map((i) => (
                <DropdownMenuItem key={i} className="flex flex-col items-start py-2 cursor-pointer">
                  <p className="font-medium">הרשמת חבר חדש</p>
                  <p className="text-sm text-muted-foreground">
                    ג'ון דו נרשם למנוי חדש
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    לפני 10 דקות
                  </p>
                </DropdownMenuItem>
              ))}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-1 hidden md:flex">
                <Avatar className="h-6 w-6">
                  <AvatarImage src="/placeholder.svg" alt="Avatar" />
                  <AvatarFallback>{getUserInitials()}</AvatarFallback>
                </Avatar>
                <span>{getUserDisplayName()}</span>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{t("myAccount")}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/settings')}>{t("profile")}</DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/settings')}>{t("settings")}</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                <LogOut className="h-4 w-4 mr-2" />
                {t("logout")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button variant="outline" size="sm" onClick={() => navigate('/auth')} className="hidden md:flex">
            התחברות
          </Button>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <User className="h-5 w-5" />
              <span className="sr-only">{t("userMenu")}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{t("myAccount")}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/settings')}>{t("profile")}</DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/settings')}>{t("settings")}</DropdownMenuItem>
            <DropdownMenuSeparator />
            {user ? (
              <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                <LogOut className="h-4 w-4 mr-2" />
                {t("logout")}
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem onClick={() => navigate('/auth')}>
                התחברות
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className={`${isSearchOpen ? 'flex' : 'hidden'} md:hidden absolute inset-0 p-2 bg-background`}>
        <Input
          type="search"
          placeholder={t("search")}
          className="flex-1 bg-background"
          autoFocus
        />
        <Button
          variant="ghost"
          size="icon"
          className="mr-1"
          onClick={() => setIsSearchOpen(false)}
        >
          <span className="sr-only">{t("close")}</span>
          <ChevronDown className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}
