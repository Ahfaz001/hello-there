import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useNote, useUpdateNote, useShareNote, useAddCollaborator, useRemoveCollaborator } from '@/hooks/useNotes';
import { useNoteActivity } from '@/hooks/useActivity';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft, Share2, Users, History, Copy, Check, Trash2, 
  Loader2, Globe, Lock, Wifi, WifiOff, Save 
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { WebSocketMessage } from '@/types';

const DEBOUNCE_DELAY = 500;
const SAVE_INDICATOR_DURATION = 2000;

export const NoteEditorPage: React.FC = () => {
  const { noteId } = useParams<{ noteId: string }>();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const { toast } = useToast();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [newCollaboratorEmail, setNewCollaboratorEmail] = useState('');
  const [newCollaboratorRole, setNewCollaboratorRole] = useState<'editor' | 'viewer'>('viewer');
  const [linkCopied, setLinkCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSaved, setShowSaved] = useState(false);

  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  const lastSavedRef = useRef({ title: '', content: '' });

  const { data: note, isLoading, error } = useNote(noteId!);
  const { data: activities } = useNoteActivity(noteId!);
  const updateNote = useUpdateNote();
  const shareNote = useShareNote();
  const addCollaborator = useAddCollaborator();
  const removeCollaborator = useRemoveCollaborator();

  const canEdit = note && (
    note.ownerId === user?.id || 
    user?.role === 'admin' ||
    note.collaborators.some(c => c.userId === user?.id && c.role === 'editor')
  );

  const queryClient = useQueryClient();

  const handleWebSocketMessage = useCallback((message: WebSocketMessage) => {
    if (message.type === 'note_update' && message.userId !== user?.id) {
      const payload = message.payload as { title: string; content: string };
      setTitle(payload.title);
      setContent(payload.content);
      lastSavedRef.current = { title: payload.title, content: payload.content };
    }
    
    // Handle real-time collaborator updates
    if (message.type === 'collaborator_added' || message.type === 'collaborator_removed') {
      // Refetch note data to get updated collaborators list
      queryClient.invalidateQueries({ queryKey: ['notes', noteId] });
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      queryClient.invalidateQueries({ queryKey: ['activity', 'note', noteId] });
    }
  }, [user?.id, noteId, queryClient]);

  const { isConnected, connectedUsers, sendMessage } = useWebSocket({
    noteId: noteId!,
    token: token!,
    onMessage: handleWebSocketMessage,
  });

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      lastSavedRef.current = { title: note.title, content: note.content };
    }
  }, [note]);

  const saveNote = useCallback(async (newTitle: string, newContent: string) => {
    if (!noteId || !canEdit) return;
    if (newTitle === lastSavedRef.current.title && newContent === lastSavedRef.current.content) return;

    setIsSaving(true);
    try {
      await updateNote.mutateAsync({ 
        noteId, 
        data: { title: newTitle, content: newContent } 
      });
      lastSavedRef.current = { title: newTitle, content: newContent };

      sendMessage({
        type: 'note_update',
        noteId,
        userId: user!.id,
        userName: user!.name,
        payload: { title: newTitle, content: newContent },
      });

      setShowSaved(true);
      setTimeout(() => setShowSaved(false), SAVE_INDICATOR_DURATION);
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to save changes',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  }, [noteId, canEdit, updateNote, sendMessage, user, toast]);

  const handleManualSave = useCallback(async () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    await saveNote(title, content);
  }, [saveNote, title, content]);

  const debouncedSave = useCallback((newTitle: string, newContent: string) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(() => {
      saveNote(newTitle, newContent);
    }, DEBOUNCE_DELAY);
  }, [saveNote]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    debouncedSave(newTitle, content);
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    debouncedSave(title, newContent);
  };

  const handleTogglePublic = async () => {
    if (!note) return;
    try {
      await shareNote.mutateAsync({ noteId: note.id, isPublic: !note.isPublic });
      toast({ title: 'Success', description: note.isPublic ? 'Link disabled' : 'Shareable link created' });
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to update sharing settings', variant: 'destructive' });
    }
  };

  const handleCopyLink = async () => {
    if (!note?.shareLink) return;
    const shareUrl = `${window.location.origin}/public/${note.shareLink}`;
    await navigator.clipboard.writeText(shareUrl);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const handleAddCollaborator = async () => {
    if (!noteId || !newCollaboratorEmail.trim()) return;
    try {
      await addCollaborator.mutateAsync({ 
        noteId, 
        email: newCollaboratorEmail, 
        role: newCollaboratorRole 
      });
      setNewCollaboratorEmail('');
      toast({ title: 'Success', description: 'Collaborator added successfully' });
    } catch (err) {
      toast({ 
        title: 'Error', 
        description: err instanceof Error ? err.message : 'Failed to add collaborator',
        variant: 'destructive' 
      });
    }
  };

  const handleRemoveCollaborator = async (userId: string) => {
    if (!noteId) return;
    try {
      await removeCollaborator.mutateAsync({ noteId, userId });
      toast({ title: 'Success', description: 'Collaborator removed' });
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to remove collaborator', variant: 'destructive' });
    }
  };

  if (isLoading) {
    return (
      <div className="container py-8 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !note) {
    return (
      <div className="container py-8">
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">Note not found or you don't have access.</p>
            <Button variant="link" onClick={() => navigate('/notes')} className="mt-2 p-0">
              ← Back to notes
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-6 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" onClick={() => navigate('/notes')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                {isConnected ? (
                  <Wifi className="h-4 w-4 text-success" />
                ) : (
                  <WifiOff className="h-4 w-4 text-destructive" />
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              {isConnected ? 'Connected for real-time collaboration' : 'Disconnected'}
            </TooltipContent>
          </Tooltip>

          {connectedUsers.length > 0 && (
            <div className="flex -space-x-2">
              {connectedUsers.slice(0, 3).map((u) => (
                <Tooltip key={u.userId}>
                  <TooltipTrigger>
                    <div
                      className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-background text-xs font-medium text-white"
                      style={{ backgroundColor: u.color }}
                    >
                      {u.userName.charAt(0).toUpperCase()}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>{u.userName}</TooltipContent>
                </Tooltip>
              ))}
              {connectedUsers.length > 3 && (
                <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-muted text-xs font-medium">
                  +{connectedUsers.length - 3}
                </div>
              )}
            </div>
          )}

          <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Share Note</DialogTitle>
                <DialogDescription>
                  Add collaborators or create a public link
                </DialogDescription>
              </DialogHeader>
              <Tabs defaultValue="collaborators">
                <TabsList className="w-full">
                  <TabsTrigger value="collaborators" className="flex-1">
                    <Users className="mr-2 h-4 w-4" />
                    Collaborators
                  </TabsTrigger>
                  <TabsTrigger value="link" className="flex-1">
                    <Globe className="mr-2 h-4 w-4" />
                    Public Link
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="collaborators" className="space-y-4 mt-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter email address"
                      value={newCollaboratorEmail}
                      onChange={(e) => setNewCollaboratorEmail(e.target.value)}
                      className="flex-1"
                    />
                    <Select value={newCollaboratorRole} onValueChange={(v) => setNewCollaboratorRole(v as 'editor' | 'viewer')}>
                      <SelectTrigger className="w-28">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="viewer">Viewer</SelectItem>
                        <SelectItem value="editor">Editor</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button onClick={handleAddCollaborator} disabled={addCollaborator.isPending}>
                      Add
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {note.collaborators.map((collab) => (
                      <div key={collab.id} className="flex items-center justify-between p-2 bg-muted rounded-md">
                        <div>
                          <p className="font-medium text-sm">{collab.userName}</p>
                          <p className="text-xs text-muted-foreground">{collab.userEmail}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{collab.role}</Badge>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleRemoveCollaborator(collab.userId)}
                          >
                            <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    {note.collaborators.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No collaborators yet
                      </p>
                    )}
                  </div>
                </TabsContent>
                <TabsContent value="link" className="space-y-4 mt-4">
                  <div className="flex items-center justify-between p-4 bg-muted rounded-md">
                    <div className="flex items-center gap-2">
                      {note.isPublic ? (
                        <Globe className="h-5 w-5 text-success" />
                      ) : (
                        <Lock className="h-5 w-5 text-muted-foreground" />
                      )}
                      <div>
                        <p className="font-medium text-sm">
                          {note.isPublic ? 'Public link active' : 'Link sharing disabled'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {note.isPublic ? 'Anyone with the link can view' : 'Only you and collaborators can access'}
                        </p>
                      </div>
                    </div>
                    <Button 
                      variant={note.isPublic ? 'destructive' : 'default'}
                      size="sm"
                      onClick={handleTogglePublic}
                      disabled={shareNote.isPending}
                    >
                      {note.isPublic ? 'Disable' : 'Enable'}
                    </Button>
                  </div>
                  {note.isPublic && note.shareLink && (
                    <div className="flex gap-2">
                      <Input 
                        value={`${window.location.origin}/public/${note.shareLink}`}
                        readOnly
                        className="flex-1"
                      />
                      <Button variant="outline" onClick={handleCopyLink}>
                        {linkCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <Input
                value={title}
                onChange={handleTitleChange}
                placeholder="Untitled Note"
                className="text-2xl font-bold border-none px-0 focus-visible:ring-0"
                disabled={!canEdit}
              />
              <Textarea
                value={content}
                onChange={handleContentChange}
                placeholder="Start writing..."
                className="min-h-[400px] border-none resize-none focus-visible:ring-0"
                disabled={!canEdit}
              />
            </div>
            
            {canEdit && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {showSaved && (
                    <>
                      <Check className="h-4 w-4 text-green-500" />
                      <span className="text-green-600">Saved</span>
                    </>
                  )}
                </div>
                <Button 
                  onClick={handleManualSave} 
                  disabled={isSaving || (title === lastSavedRef.current.title && content === lastSavedRef.current.content)}
                >
                  {isSaving ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  {isSaving ? 'Saving...' : 'Save'}
                </Button>
              </div>
            )}
            
            {!canEdit && (
              <p className="text-sm text-muted-foreground mt-4">
                You have view-only access to this note.
              </p>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <History className="h-4 w-4" />
                Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="max-h-[300px] overflow-y-auto">
              {activities && activities.length > 0 ? (
                <div className="space-y-3">
                  {activities.slice(0, 10).map((activity) => (
                    <div key={activity.id} className="text-sm">
                      <p>
                        <span className="font-medium">{activity.userName}</span>
                        {' '}
                        <span className="text-muted-foreground">
                          {activity.action.replace('_', ' ')}
                        </span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No activity yet</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Note Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Owner</span>
                <span>{note.ownerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created</span>
                <span>{format(new Date(note.createdAt), 'MMM d, yyyy')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Updated</span>
                <span>{formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
