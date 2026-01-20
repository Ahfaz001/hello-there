import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, Users, Shield, Zap, Globe, Clock } from 'lucide-react';

const features = [
  {
    icon: FileText,
    title: 'Rich Notes',
    description: 'Create and organize notes with a clean, intuitive interface',
  },
  {
    icon: Users,
    title: 'Real-time Collaboration',
    description: 'Work together with your team in real-time with live updates',
  },
  {
    icon: Shield,
    title: 'Role-based Access',
    description: 'Control who can view and edit with Admin, Editor, and Viewer roles',
  },
  {
    icon: Globe,
    title: 'Share Anywhere',
    description: 'Create shareable read-only links for easy distribution',
  },
  {
    icon: Clock,
    title: 'Activity Tracking',
    description: 'Keep track of all changes with detailed activity logs',
  },
  {
    icon: Zap,
    title: 'Instant Search',
    description: 'Find any note instantly with powerful search capabilities',
  },
];

const HomePage: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="container py-20 md:py-32">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Collaborate on notes in{' '}
            <span className="text-gradient">real-time</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            A powerful collaborative notes application for teams. Create, edit, and share notes with real-time synchronization and role-based access control.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isAuthenticated ? (
              <Button asChild size="lg">
                <Link to="/notes">Go to My Notes</Link>
              </Button>
            ) : (
              <>
                <Button asChild size="lg">
                  <Link to="/register">Get Started Free</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link to="/login">Sign In</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container py-16 md:py-24">
        <h2 className="text-3xl font-bold text-center mb-12">
          Everything you need for collaborative note-taking
        </h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Card key={feature.title} className="group hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4 mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold">{feature.title}</h3>
                </div>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-16 md:py-24">
        <Card className="bg-primary text-primary-foreground">
          <CardContent className="py-12 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
            <p className="text-primary-foreground/80 mb-6 max-w-md mx-auto">
              Join thousands of teams who use CollabNotes to work together more effectively.
            </p>
            {!isAuthenticated && (
              <Button asChild size="lg" variant="secondary">
                <Link to="/register">Create Free Account</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <span className="font-semibold">CollabNotes</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} CollabNotes. Built for collaboration.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
