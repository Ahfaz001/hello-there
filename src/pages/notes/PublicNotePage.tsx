import React from 'react';
import { useParams } from 'react-router-dom';
import { usePublicNote } from '@/hooks/useNotes';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

export const PublicNotePage: React.FC = () => {
  const { shareId } = useParams<{ shareId: string }>();
  const { data: note, isLoading, error } = usePublicNote(shareId!);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !note) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Note Not Found</h2>
            <p className="text-muted-foreground">
              This note may have been deleted or the link is no longer active.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b py-4">
        <div className="container flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          <span className="font-semibold">CollabNotes</span>
          <span className="text-muted-foreground">• Shared Note</span>
        </div>
      </header>
      <main className="container py-8 max-w-3xl">
        <Card>
          <CardContent className="pt-6">
            <h1 className="text-3xl font-bold mb-2">{note.title}</h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
              <span>By {note.ownerName}</span>
              <span>•</span>
              <span>Updated {format(new Date(note.updatedAt), 'MMM d, yyyy')}</span>
            </div>
            <div className="prose prose-neutral dark:prose-invert max-w-none whitespace-pre-wrap">
              {note.content || 'No content'}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};
