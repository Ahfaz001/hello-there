import React, { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ThemeToggle } from '@/components/ThemeToggle';
import { FileText, Loader2, Mail, Lock, ArrowRight, Sparkles } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (isAuthenticated) {
    return <Navigate to="/notes" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await login(email, password);
      navigate('/notes');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-primary/90 to-accent relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtOS45NDEgMC0xOCA4LjA1OS0xOCAxOHM4LjA1OSAxOCAxOCAxOCAxOC04LjA1OSAxOC0xOC04LjA1OS0xOC0xOC0xOHptMCAzMmMtNy43MzIgMC0xNC02LjI2OC0xNC0xNHM2LjI2OC0xNCAxNC0xNCAxNCA2LjI2OCAxNCAxNC02LjI2OCAxNC0xNCAxNHoiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjA1Ii8+PC9nPjwvc3ZnPg==')] opacity-30" />
        
        <div className="absolute top-6 left-6">
          <ThemeToggle />
        </div>
        
        <div className="flex flex-col justify-center px-12 lg:px-16 relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-sm">
              <FileText className="h-10 w-10 text-white" />
            </div>
            <span className="text-4xl font-bold text-white">CollabNotes</span>
          </div>
          
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
            Your ideas,<br />
            <span className="text-white/90">beautifully organized</span>
          </h1>
          
          <p className="text-xl text-white/80 mb-8 max-w-md">
            Collaborate in real-time, organize your thoughts, and never lose a brilliant idea again.
          </p>
          
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 text-white/90">
              <div className="p-2 bg-white/10 rounded-lg">
                <Sparkles className="h-5 w-5" />
              </div>
              <span>Real-time collaboration</span>
            </div>
            <div className="flex items-center gap-3 text-white/90">
              <div className="p-2 bg-white/10 rounded-lg">
                <Sparkles className="h-5 w-5" />
              </div>
              <span>Secure & private notes</span>
            </div>
            <div className="flex items-center gap-3 text-white/90">
              <div className="p-2 bg-white/10 rounded-lg">
                <Sparkles className="h-5 w-5" />
              </div>
              <span>Share with anyone</span>
            </div>
          </div>
        </div>
        
        {/* Floating shapes */}
        <div className="absolute bottom-20 right-20 w-32 h-32 bg-white/5 rounded-full blur-xl" />
        <div className="absolute top-40 right-10 w-20 h-20 bg-accent/20 rounded-full blur-lg" />
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex flex-col min-h-screen bg-background">
        <div className="lg:hidden flex items-center justify-between p-4">
          <Link to="/" className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">CollabNotes</span>
          </Link>
          <ThemeToggle />
        </div>

        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-md space-y-8">
            <div className="text-center lg:text-left">
              <h2 className="text-3xl font-bold tracking-tight">Welcome back</h2>
              <p className="mt-2 text-muted-foreground">
                Sign in to continue to your notes
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive" className="animate-fade-in">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                      className="pl-10 h-12 bg-secondary/50 border-border/50 focus:bg-background transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                      className="pl-10 h-12 bg-secondary/50 border-border/50 focus:bg-background transition-colors"
                    />
                  </div>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 text-base font-semibold group"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  New to CollabNotes?
                </span>
              </div>
            </div>

            <Button variant="outline" asChild className="w-full h-12">
              <Link to="/register" className="text-base font-medium">
                Create an account
              </Link>
            </Button>
          </div>
        </div>

        <div className="p-6 text-center text-sm text-muted-foreground">
          © 2024 CollabNotes. All rights reserved.
        </div>
      </div>
    </div>
  );
};