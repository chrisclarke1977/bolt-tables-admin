'use client';

import { useState, useEffect } from 'react';
import { Bell, Settings, Check } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { ThemeSwitcher } from '@/components/theme-switcher';

interface Notification {
  id: string;
  type: 'comment' | 'reaction';
  read: boolean;
  created_at: string;
  actor: {
    full_name: string;
    avatar_url: string | null;
  } | null;
  posts: {
    title: string;
  } | null;
  comments?: {
    content: string;
  } | null;
  reactions?: {
    type: string;
  } | null;
}

export function Header() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    fetchNotifications();

    const subscription = supabase
      .channel('notifications_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, () => {
        fetchNotifications();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select(`
          *,
          actor:users(
            full_name,
            avatar_url
          ),
          posts(
            title
          ),
          comments(
            content
          ),
          reactions(
            type
          )
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      setNotifications(data || []);
      setUnreadCount(data?.filter(n => !n.read).length || 0);
    } catch (error: any) {
      console.error('Error fetching notifications:', error);
      toast({
        variant: 'destructive',
        title: 'Error fetching notifications',
        description: error.message,
      });
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id);

      if (error) throw error;

      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, read: true } : n
      ));
      setUnreadCount(Math.max(0, unreadCount - 1));
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error marking notification as read',
        description: error.message,
      });
    }
  };

  const getNotificationText = (notification: Notification) => {
    if (!notification.actor || !notification.posts) return 'Notification';
    
    const actorName = notification.actor.full_name;
    const postTitle = notification.posts.title;

    if (notification.type === 'comment') {
      return `${actorName} commented on your post "${postTitle}"`;
    } else {
      return `${actorName} reacted to your post "${postTitle}"`;
    }
  };

  return (
    <div className="flex items-center gap-2">
      <ThemeSwitcher />
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80">
          <ScrollArea className="h-[400px] p-4">
            {notifications.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No notifications
              </p>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`mb-4 p-3 rounded-lg ${
                    notification.read ? 'bg-background' : 'bg-muted'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm">
                      {getNotificationText(notification)}
                    </p>
                    {!notification.read && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => markAsRead(notification.id)}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(notification.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))
            )}
          </ScrollArea>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <Settings className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>
            Profile Settings
          </DropdownMenuItem>
          <DropdownMenuItem>
            Account Settings
          </DropdownMenuItem>
          <DropdownMenuItem>
            Preferences
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}