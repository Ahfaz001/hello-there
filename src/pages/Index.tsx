import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, Users, Shield, Zap, Globe, Clock, ArrowRight, Sparkles } from 'lucide-react';

const features = [
  {
    icon: FileText,
    title: 'Rich Notes',
    description: 'Create and organize notes with a clean, intuitive interface',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Users,
    title: 'Real-time Collaboration',
    description: 'Work together with your team in real-time with live updates',
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    icon: Shield,
    title: 'Role-based Access',
    description: 'Control who can view and edit with Admin, Editor, and Viewer roles',
    gradient: 'from-orange-500 to-red-500',
  },
  {
    icon: Globe,
    title: 'Share Anywhere',
    description: 'Create shareable read-only links for easy distribution',
    gradient: 'from-green-500 to-emerald-500',
  },
  {
    icon: Clock,
    title: 'Activity Tracking',
    description: 'Keep track of all changes with detailed activity logs',
    gradient: 'from-indigo-500 to-purple-500',
  },
  {
    icon: Zap,
    title: 'Instant Search',
    description: 'Find any note instantly with powerful search capabilities',
    gradient: 'from-yellow-500 to-orange-500',
  },
];

const HomePage: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary/10 rounded-full blur-3xl opacity-50" />
        
        <div className="container relative py-24 md:py-36">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8 animate-fade-in">
              <Sparkles className="h-4 w-4" />
              <span>Real-time collaborative notes platform</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 animate-fade-in">
              Your ideas,{' '}
              <span className="text-gradient">beautifully</span>
              <br />
              organized
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-2xl mx-auto animate-fade-in">
              A powerful collaborative notes application for teams. Create, edit, and share notes with real-time synchronization.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in">
              {isAuthenticated ? (
                <Button asChild size="lg" className="h-14 px-8 text-lg group shadow-lg shadow-primary/25">
                  <Link to="/notes">
                    Go to My Notes
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              ) : (
                <>
                  <Button asChild size="lg" className="h-14 px-8 text-lg group shadow-lg shadow-primary/25">
                    <Link to="/register">
                      Get Started Free
                      <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="h-14 px-8 text-lg">
                    <Link to="/login">Sign In</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container py-20 md:py-32">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Everything you need for
            <br />
            <span className="text-gradient">collaborative note-taking</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Powerful features designed to help you and your team work together seamlessly.
          </p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <Card 
              key={feature.title} 
              className="group card-hover border-border/50 bg-card/50 backdrop-blur-sm"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardContent className="pt-8 pb-6">
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.gradient} mb-4 shadow-lg`}>
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-16 md:py-24">
        <Card className="relative overflow-hidden bg-gradient-to-br from-primary via-primary to-accent border-0 shadow-2xl shadow-primary/20">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtOS45NDEgMC0xOCA4LjA1OS0xOCAxOHM4LjA1OSAxOCAxOCAxOCAxOC04LjA1OSAxOC0xOC04LjA1OS0xOC0xOC0xOHptMCAzMmMtNy43MzIgMC0xNC02LjI2OC0xNC0xNHM2LjI2OC0xNCAxNC0xNCAxNCA2LjI2OCAxNCAxNC02LjI2OCAxNC0xNCAxNHoiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjA1Ii8+PC9nPjwvc3ZnPg==')] opacity-30" />
          <CardContent className="relative py-16 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
              Ready to get started?
            </h2>
            <p className="text-white/80 mb-8 max-w-md mx-auto text-lg">
              Join thousands of teams who use CollabNotes to work together more effectively.
            </p>
            {!isAuthenticated && (
              <Button asChild size="lg" variant="secondary" className="h-14 px-8 text-lg font-semibold shadow-lg group">
                <Link to="/register">
                  Create Free Account
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30">
        <div className="container py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <span className="text-xl font-bold">CollabNotes</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} CollabNotes. Built for collaboration.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;