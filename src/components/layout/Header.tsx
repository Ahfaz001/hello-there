import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { FileText, LogOut, Settings, Activity, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export const Header: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl group">
          <div className="p-1.5 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
            CollabNotes
          </span>
        </Link>

        <nav className="ml-8 hidden md:flex items-center gap-1">
          {isAuthenticated && (
            <>
              {user?.role !== 'admin' && (
                <Link to="/notes">
                  <Button 
                    variant={isActive('/notes') ? 'secondary' : 'ghost'} 
                    size="sm"
                    className={cn(
                      "font-medium",
                      isActive('/notes') && "bg-primary/10 text-primary hover:bg-primary/15"
                    )}
                  >
                    My Notes
                  </Button>
                </Link>
              )}
              <Link to="/activity">
                <Button 
                  variant={isActive('/activity') ? 'secondary' : 'ghost'} 
                  size="sm"
                  className={cn(
                    "font-medium",
                    isActive('/activity') && "bg-primary/10 text-primary hover:bg-primary/15"
                  )}
                >
                  Activity
                </Button>
              </Link>
              {user?.role === 'admin' && (
                <Link to="/admin">
                  <Button 
                    variant={isActive('/admin') ? 'secondary' : 'ghost'} 
                    size="sm"
                    className={cn(
                      "font-medium",
                      isActive('/admin') && "bg-primary/10 text-primary hover:bg-primary/15"
                    )}
                  >
                    Admin
                  </Button>
                </Link>
              )}
            </>
          )}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 pl-2 pr-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-primary-foreground font-semibold text-sm shadow-md">
                    {user?.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden md:inline font-medium">{user?.name}</span>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-3 py-3 bg-muted/50 rounded-t-md -mt-1 -mx-1 mb-1">
                  <p className="font-semibold">{user?.name}</p>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                  <div className="mt-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary capitalize">
                      {user?.role}
                    </span>
                  </div>
                </div>
                {user?.role !== 'admin' && (
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link to="/notes" className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      My Notes
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link to="/activity" className="flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Activity
                  </Link>
                </DropdownMenuItem>
                {user?.role === 'admin' && (
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link to="/admin" className="flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Admin Panel
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={handleLogout} 
                  className="text-destructive cursor-pointer focus:text-destructive focus:bg-destructive/10"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" asChild>
                <Link to="/login">Login</Link>
              </Button>
              <Button asChild className="shadow-md">
                <Link to="/register">Sign Up</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};