import React, { useMemo } from 'react';
import { Bell, MessageSquare, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useStore } from '../store/useStore';

const Notifications = () => {
  const { user, tasks, leaves } = useStore();

  const notifications = useMemo(() => {
    const list: any[] = [];
    const now = new Date();

    // Task Overdue Notifications
    tasks.forEach(t => {
      if (t.due_date && new Date(t.due_date) < now && t.status !== 'Done') {
        const isMine = t.assignee_id === user?.id;
        if (isMine || user?.role === 'admin') {
          list.push({
            id: `overdue-${t.id}`,
            type: 'alert',
            text: `${isMine ? 'Your task' : 'Team task'} "${t.title}" is overdue!`,
            time: 'High Priority',
            icon: AlertTriangle,
            color: 'text-accent-danger'
          });
        }
      }
    });

    // New Assignments (for Member)
    if (user?.role === 'member') {
      tasks.filter(t => t.assignee_id === user?.id && t.status === 'To Do').forEach(t => {
        list.push({
          id: `new-${t.id}`,
          type: 'info',
          text: `You have a new task: "${t.title}"`,
          time: 'Active',
          icon: Bell,
          color: 'text-accent-secondary'
        });
      });
    }

    // Pending Leaves (for Admin)
    if (user?.role === 'admin') {
      leaves.filter(l => l.status === 'Pending').forEach(l => {
        list.push({
          id: `leave-${l.id}`,
          type: 'message',
          text: `${l.user?.name} requested leave: "${l.reason}"`,
          time: 'Action Required',
          icon: MessageSquare,
          color: 'text-accent-primary'
        });
      });
    }

    return list;
  }, [tasks, leaves, user]);

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-[fadeIn_0.3s_ease-out]">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-display font-bold text-text-primary">Notifications</h2>
          <p className="text-text-muted">Stay updated with your team's activity</p>
        </div>
        <button className="text-sm text-accent-primary hover:underline">Mark all as read</button>
      </div>

      <div className="space-y-4">
        {notifications.map((n) => (
          <div key={n.id} className="glass-card p-4 flex items-start gap-4 hover:bg-secondary/50 transition-colors cursor-pointer border-l-4 border-l-transparent hover:border-l-accent-primary">
            <div className={`p-2 rounded-lg bg-secondary ${n.color}`}>
              <n.icon size={20} />
            </div>
            <div className="flex-1">
              <p className="text-text-primary font-medium">{n.text}</p>
              <p className="text-xs text-text-muted mt-1">{n.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Notifications;
