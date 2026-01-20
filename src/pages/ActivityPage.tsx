import React from 'react';
import { useActivity } from '@/hooks/useActivity';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Activity, FileText, Users, Trash2, Eye, Share2, Plus } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';
import { ActivityLog } from '@/types';

const getActivityIcon = (action: ActivityLog['action']) => {
  switch (action) {
    case 'created':
      return <Plus className="h-4 w-4 text-success" />;
    case 'updated':
      return <FileText className="h-4 w-4 text-primary" />;
    case 'deleted':
      return <Trash2 className="h-4 w-4 text-destructive" />;
    case 'shared':
      return <Share2 className="h-4 w-4 text-accent" />;
    case 'viewed':
      return <Eye className="h-4 w-4 text-muted-foreground" />;
    case 'collaborator_added':
    case 'collaborator_removed':
      return <Users className="h-4 w-4 text-warning" />;
    default:
      return <Activity className="h-4 w-4" />;
  }
};

const getActionLabel = (action: ActivityLog['action']) => {
  const labels: Record<ActivityLog['action'], string> = {
    created: 'Created',
    updated: 'Updated',
    deleted: 'Deleted',
    shared: 'Shared',
    viewed: 'Viewed',
    collaborator_added: 'Added collaborator',
    collaborator_removed: 'Removed collaborator',
  };
  return labels[action];
};

export const ActivityPage: React.FC = () => {
  const { data: activities, isLoading, error } = useActivity(50);

  if (isLoading) {
    return (
      <div className="container py-8 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-8">
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">Failed to load activity. Please try again later.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Activity className="h-8 w-8 text-primary" />
          Activity Log
        </h1>
        <p className="text-muted-foreground mt-1">
          Track all actions on your notes
        </p>
      </div>

      {activities && activities.length > 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-0">
              {activities.map((activity, index) => (
                <div
                  key={activity.id}
                  className={`flex items-start gap-4 py-4 ${
                    index < activities.length - 1 ? 'border-b' : ''
                  }`}
                >
                  <div className="mt-1">{getActivityIcon(activity.action)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium">{activity.userName}</span>
                      <Badge variant="secondary" className="text-xs">
                        {getActionLabel(activity.action)}
                      </Badge>
                      {activity.noteTitle && activity.action !== 'deleted' && (
                        <Link
                          to={`/notes/${activity.noteId}`}
                          className="text-primary hover:underline truncate max-w-[200px]"
                        >
                          {activity.noteTitle}
                        </Link>
                      )}
                      {activity.action === 'deleted' && (
                        <span className="text-muted-foreground truncate max-w-[200px]">
                          {activity.noteTitle}
                        </span>
                      )}
                    </div>
                    {activity.details && (
                      <p className="text-sm text-muted-foreground mt-1">{activity.details}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Activity className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No activity yet</h3>
            <p className="text-muted-foreground text-center">
              Actions on your notes will appear here
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
