import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { API_ENDPOINTS, fetchWithAuth } from '@/config/api';
import { User, UserRole, Note } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Shield, Search, Trash2, Loader2, Users, FileText, ExternalLink, Clock } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

interface AdminNote extends Note {
  ownerName: string;
  ownerEmail: string;
}

const getRoleBadgeVariant = (role: UserRole) => {
  switch (role) {
    case 'admin':
      return 'destructive' as const;
    case 'editor':
      return 'default' as const;
    default:
      return 'secondary' as const;
  }
};

export const AdminPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [noteSearchQuery, setNoteSearchQuery] = useState('');
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [deleteNoteId, setDeleteNoteId] = useState<string | null>(null);
  
  const { user, token } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch users
  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: () => fetchWithAuth<{ users: User[] }>(API_ENDPOINTS.ADMIN_USERS, token!),
    enabled: !!token && user?.role === 'admin',
    select: (data) => data.users,
  });

  // Fetch all notes
  const { data: notes, isLoading: notesLoading } = useQuery({
    queryKey: ['admin', 'notes'],
    queryFn: () => fetchWithAuth<{ notes: AdminNote[] }>(API_ENDPOINTS.ADMIN_NOTES, token!),
    enabled: !!token && user?.role === 'admin',
    select: (data) => data.notes,
  });

  const updateRole = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: UserRole }) =>
      fetchWithAuth(API_ENDPOINTS.ADMIN_USER(userId), token!, {
        method: 'PATCH',
        body: JSON.stringify({ role }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      toast({ title: 'Success', description: 'User role updated' });
    },
    onError: (err) => {
      toast({ 
        title: 'Error', 
        description: err instanceof Error ? err.message : 'Failed to update role',
        variant: 'destructive'
      });
    },
  });

  const deleteUser = useMutation({
    mutationFn: (userId: string) =>
      fetchWithAuth(API_ENDPOINTS.ADMIN_USER(userId), token!, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'notes'] });
      toast({ title: 'Success', description: 'User deleted' });
    },
    onError: (err) => {
      toast({ 
        title: 'Error', 
        description: err instanceof Error ? err.message : 'Failed to delete user',
        variant: 'destructive'
      });
    },
  });

  const deleteNote = useMutation({
    mutationFn: (noteId: string) =>
      fetchWithAuth(API_ENDPOINTS.ADMIN_NOTE(noteId), token!, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'notes'] });
      toast({ title: 'Success', description: 'Note deleted' });
    },
    onError: (err) => {
      toast({ 
        title: 'Error', 
        description: err instanceof Error ? err.message : 'Failed to delete note',
        variant: 'destructive'
      });
    },
  });

  const filteredUsers = useMemo(() => {
    if (!users) return [];
    if (!userSearchQuery.trim()) return users;
    const query = userSearchQuery.toLowerCase();
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(query) ||
        u.email.toLowerCase().includes(query)
    );
  }, [users, userSearchQuery]);

  const filteredNotes = useMemo(() => {
    if (!notes) return [];
    if (!noteSearchQuery.trim()) return notes;
    const query = noteSearchQuery.toLowerCase();
    return notes.filter(
      (n) =>
        n.title.toLowerCase().includes(query) ||
        n.content.toLowerCase().includes(query) ||
        n.ownerName.toLowerCase().includes(query) ||
        n.ownerEmail.toLowerCase().includes(query)
    );
  }, [notes, noteSearchQuery]);

  const handleRoleChange = (userId: string, role: UserRole) => {
    updateRole.mutate({ userId, role });
  };

  const handleDeleteUser = () => {
    if (deleteUserId) {
      deleteUser.mutate(deleteUserId);
      setDeleteUserId(null);
    }
  };

  const handleDeleteNote = () => {
    if (deleteNoteId) {
      deleteNote.mutate(deleteNoteId);
      setDeleteNoteId(null);
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="container py-8">
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">Access denied. Admin privileges required.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Shield className="h-8 w-8 text-primary" />
          Admin Panel
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage users and notes
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Users ({users?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="notes" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Users Notes ({notes?.length || 0})
          </TabsTrigger>
        </TabsList>

        {/* Users Tab */}
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle>All Users</CardTitle>
                  <CardDescription>View and manage all registered users</CardDescription>
                </div>
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search users..."
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {usersLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead className="w-[80px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.length > 0 ? (
                        filteredUsers.map((u) => (
                          <TableRow key={u.id}>
                            <TableCell className="font-medium">{u.name}</TableCell>
                            <TableCell>{u.email}</TableCell>
                            <TableCell>
                              <Select
                                value={u.role}
                                onValueChange={(value) => handleRoleChange(u.id, value as UserRole)}
                                disabled={u.id === user?.id}
                              >
                                <SelectTrigger className="w-28">
                                  <SelectValue>
                                    <Badge variant={getRoleBadgeVariant(u.role)}>
                                      {u.role}
                                    </Badge>
                                  </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="viewer">Viewer</SelectItem>
                                  <SelectItem value="editor">Editor</SelectItem>
                                  <SelectItem value="admin">Admin</SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell>
                              {format(new Date(u.createdAt), 'MMM d, yyyy')}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setDeleteUserId(u.id)}
                                disabled={u.id === user?.id}
                              >
                                <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                            {userSearchQuery ? 'No users match your search' : 'No users found'}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notes Tab */}
        <TabsContent value="notes">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle>All Users Notes</CardTitle>
                  <CardDescription>View, edit, and delete notes from all users</CardDescription>
                </div>
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search notes..."
                    value={noteSearchQuery}
                    onChange={(e) => setNoteSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {notesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Owner</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Updated</TableHead>
                        <TableHead className="w-[100px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredNotes.length > 0 ? (
                        filteredNotes.map((note) => (
                          <TableRow key={note.id}>
                            <TableCell>
                              <div className="flex flex-col">
                                <span className="font-medium line-clamp-1">{note.title}</span>
                                <span className="text-xs text-muted-foreground line-clamp-1">
                                  {note.content?.substring(0, 50) || 'No content'}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <span className="font-medium">{note.ownerName}</span>
                                <span className="text-xs text-muted-foreground">{note.ownerEmail}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col gap-1">
                                {note.isPublic ? (
                                  <Badge variant="outline" className="w-fit">Public</Badge>
                                ) : (
                                  <Badge variant="secondary" className="w-fit">Private</Badge>
                                )}
                                {note.collaborators.length > 0 && (
                                  <span className="text-xs text-muted-foreground">
                                    {note.collaborators.length} collaborator{note.collaborators.length > 1 ? 's' : ''}
                                  </span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                <span className="text-sm">
                                  {formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  asChild
                                >
                                  <Link to={`/notes/${note.id}`}>
                                    <ExternalLink className="h-4 w-4 text-muted-foreground hover:text-primary" />
                                  </Link>
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setDeleteNoteId(note.id)}
                                >
                                  <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                            {noteSearchQuery ? 'No notes match your search' : 'No notes found'}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete User Dialog */}
      <AlertDialog open={!!deleteUserId} onOpenChange={() => setDeleteUserId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this user? This will also delete all their notes. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Note Dialog */}
      <AlertDialog open={!!deleteNoteId} onOpenChange={() => setDeleteNoteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Note</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this note? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteNote} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};