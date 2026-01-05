import { Search, LogOut, Settings, UserCircle, Sun, Moon, Bell, Globe } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface HeaderProps {
  title: string;
}

export function Header({ title }: HeaderProps) {
  const { user, role, signOut } = useAuth();
  const { language, setLanguage } = useLanguage();
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(false);
  const [hasNotifications] = useState(true);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const getInitials = (email: string) => {
    return email.slice(0, 2).toUpperCase();
  };

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'id' : 'en');
  };

  return (
    <header className="h-14 border-b border-border bg-card/95 backdrop-blur-sm flex items-center justify-between px-4 md:px-6 sticky top-0 z-40">
      {/* Left: Title */}
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold text-foreground hidden sm:block">{title}</h1>
      </div>

      {/* Center: Quick Actions */}
      <div className="hidden lg:flex items-center gap-1 bg-muted/50 rounded-full p-1">
        <Button
          variant="ghost"
          size="sm"
          className="rounded-full px-4 h-8 text-sm font-medium hover:bg-primary hover:text-primary-foreground"
          onClick={() => navigate('/sales')}
        >
          Jual
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="rounded-full px-4 h-8 text-sm font-medium hover:bg-primary hover:text-primary-foreground"
          onClick={() => navigate('/purchases')}
        >
          Beli
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="rounded-full px-4 h-8 text-sm font-medium hover:bg-primary hover:text-primary-foreground"
          onClick={() => navigate('/expenses')}
        >
          Biaya
        </Button>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Cari..."
            className="w-48 lg:w-56 pl-8 h-9 bg-muted/50 border-0 focus-visible:ring-1"
          />
        </div>

        {/* Language Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleLanguage}
          className="h-9 w-9 rounded-full"
        >
          <Globe className="w-4 h-4" />
        </Button>

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="h-9 w-9 rounded-full"
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </Button>

        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-full relative"
        >
          <Bell className="w-4 h-4" />
          {hasNotifications && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" />
          )}
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 h-9 pl-1 pr-3 rounded-full hover:bg-muted">
              <Avatar className="w-7 h-7">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                  {user?.email ? getInitials(user.email) : 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="hidden lg:flex flex-col items-start">
                <span className="font-medium text-sm leading-none">
                  {user?.email?.split('@')[0] || 'User'}
                </span>
                <Badge 
                  variant="secondary" 
                  className={cn(
                    "text-[10px] h-4 px-1.5 mt-0.5 capitalize",
                    role === 'owner' && "bg-amber-100 text-amber-700",
                    role === 'admin' && "bg-blue-100 text-blue-700",
                    role === 'staff' && "bg-gray-100 text-gray-700"
                  )}
                >
                  {role || 'staff'}
                </Badge>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{user?.email?.split('@')[0]}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/profile" className="flex items-center cursor-pointer">
                <UserCircle className="w-4 h-4 mr-2" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/settings" className="flex items-center cursor-pointer">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-destructive cursor-pointer focus:text-destructive"
              onClick={handleSignOut}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
