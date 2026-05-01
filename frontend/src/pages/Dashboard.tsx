import React, { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { CheckCircle2, Clock, AlertTriangle, TrendingUp, MoreVertical, Calendar, X } from 'lucide-react';
import { useStore } from '../store/useStore';

const Dashboard = () => {
  const { user, tasks, fetchTasks, attendance, fetchAttendance, leaves, fetchLeaves, team, fetchTeam } = useStore();
  const [activeDetail, setActiveDetail] = useState<string | null>(null);
  
  useEffect(() => {
    fetchTasks();
    fetchAttendance();
    fetchLeaves();
    fetchTeam();
  }, []);

  const stats = useMemo(() => {
    const relevantTasks = user?.role === 'admin' ? tasks : tasks.filter(t => t.assignee_id === user?.id);
    const total = relevantTasks.length;
    const inProgress = relevantTasks.filter(t => t.status === 'In Progress').length;
    const completed = relevantTasks.filter(t => t.status === 'Done').length;
    const overdue = relevantTasks.filter(t => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'Done').length;
    return { total, inProgress, completed, overdue };
  }, [tasks, user]);

  const teamStats = useMemo(() => {
    const today = new Date().toDateString();
    const presentUsers = attendance.filter(a => new Date(a.date).toDateString() === today).map(a => a.user);
    const absentUsers = team.filter(m => !presentUsers.some(p => p?.id === m.id));
    return { presentUsers, absentUsers };
  }, [attendance, team]);

  const barData = [
    { name: 'To Do', value: tasks.filter(t => t.status === 'To Do').length, color: '#94A3B8' },
    { name: 'In Progress', value: tasks.filter(t => t.status === 'In Progress').length, color: '#818CF8' },
    { name: 'In Review', value: tasks.filter(t => t.status === 'In Review').length, color: '#FBBF24' },
    { name: 'Done', value: tasks.filter(t => t.status === 'Done').length, color: '#34D399' },
  ];

  const pieData = [
    { name: 'Critical', value: tasks.filter(t => t.priority === 'Critical').length || 1, color: '#FB7185' },
    { name: 'High', value: tasks.filter(t => t.priority === 'High').length || 1, color: '#F43F5E' },
    { name: 'Medium', value: tasks.filter(t => t.priority === 'Medium').length || 1, color: '#FBBF24' },
    { name: 'Low', value: tasks.filter(t => t.priority === 'Low').length || 1, color: '#94A3B8' },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-display font-bold text-text-primary tracking-tight">
            {user?.role === 'admin' ? 'Executive Dashboard' : 'Member Command Center'}
          </h2>
          <p className="text-text-muted mt-1">{user?.role === 'admin' ? 'Strategic overview' : 'Your personal mission status'} for <span className="font-extrabold text-text-primary">{user?.name}</span></p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex -space-x-2">
            {team.slice(0, 5).map(m => (
              <div key={m.id} className="w-8 h-8 rounded-full border-2 border-bg-primary bg-secondary flex items-center justify-center text-[10px] font-bold" title={m.name}>
                {m.name.charAt(0)}
              </div>
            ))}
          </div>
          <span className="text-xs text-text-muted font-medium">{team.length} Team Members</span>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Initiatives" 
          value={stats.total} 
          icon={<TrendingUp size={24} />} 
          color="text-accent-primary"
          onClick={() => setActiveDetail('total')}
        />
        
        {user?.role === 'admin' ? (
          <>
            <StatCard 
              title="Present Today" 
              value={teamStats.presentUsers.length} 
              icon={<CheckCircle2 size={24} />} 
              color="text-accent-success"
              onClick={() => setActiveDetail('present')}
            />
            <StatCard 
              title="On Leave" 
              value={teamStats.absentUsers.length} 
              icon={<Clock size={24} />} 
              color="text-accent-warning"
              onClick={() => setActiveDetail('absent')}
            />
            <StatCard 
              title="Pending Approval" 
              value={leaves.filter(l => l.status === 'Pending').length} 
              icon={<AlertTriangle size={24} />} 
              color="text-accent-danger" 
              pulse={leaves.filter(l => l.status === 'Pending').length > 0}
              onClick={() => setActiveDetail('pending')}
            />
          </>
        ) : (
          <>
            <StatCard title="In Progress" value={stats.inProgress} icon={<Clock size={24} />} color="text-accent-secondary" />
            <StatCard title="Completed" value={stats.completed} icon={<CheckCircle2 size={24} />} color="text-accent-success" />
            <StatCard title="Overdue" value={stats.overdue} icon={<AlertTriangle size={24} />} color="text-accent-danger" pulse={stats.overdue > 0} />
          </>
        )}
      </div>

      {tasks.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 glass-card p-8">
            <h3 className="text-xl font-bold text-text-primary mb-8 flex items-center gap-2">
              <div className="w-1.5 h-6 bg-accent-primary rounded-full" /> Workflow Velocity
            </h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <XAxis dataKey="name" stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis hide />
                  <Tooltip 
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                    contentStyle={{ backgroundColor: '#0F172A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={40}>
                    {barData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-card p-8">
            <h3 className="text-xl font-bold text-text-primary mb-8 flex items-center gap-2">
              <div className="w-1.5 h-6 bg-accent-secondary rounded-full" /> Priority Load
            </h3>
            <div className="h-72 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={70} outerRadius={90} paddingAngle={8} dataKey="value">
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#0F1219', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none flex-col">
                <span className="text-4xl font-display font-bold text-text-primary">{tasks.length}</span>
                <span className="text-xs text-text-muted uppercase tracking-widest">Total</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="py-20 glass-card flex flex-col items-center justify-center text-center space-y-4 opacity-50">
          <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center text-text-muted border border-bordercolor">
            <TrendingUp size={40} />
          </div>
          <div>
            <p className="text-xl font-bold text-text-primary">No Data for Analysis</p>
            <p className="text-sm text-text-muted max-w-xs">Start creating tasks and assigning them to see your workflow velocity and priority metrics here.</p>
          </div>
        </div>
      )}

      {/* Detail Popover Logic */}
      {activeDetail && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="glass-card w-full max-w-lg p-8 animate-slideUp relative">
            <button onClick={() => setActiveDetail(null)} className="absolute top-6 right-6 text-text-muted hover:text-text-primary transition-colors">
              <X size={24} />
            </button>
            <h3 className="text-2xl font-bold text-text-primary mb-6 flex items-center gap-3">
              {activeDetail === 'present' && <><CheckCircle2 className="text-accent-success" /> Team Present Today</>}
              {activeDetail === 'absent' && <><Clock className="text-accent-warning" /> Team On Leave / Absent</>}
              {activeDetail === 'pending' && <><AlertTriangle className="text-accent-danger" /> Pending Approvals</>}
              {activeDetail === 'total' && <><TrendingUp className="text-accent-primary" /> Active Initiatives</>}
            </h3>
            
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
              {activeDetail === 'present' && teamStats.presentUsers.map((p: any) => (
                <div key={p.id} className="flex items-center justify-between p-4 rounded-xl bg-card border border-bordercolor">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-accent-success/20 text-accent-success flex items-center justify-center font-bold">{p.name.charAt(0)}</div>
                    <div>
                      <p className="font-bold text-text-primary">{p.name}</p>
                      <p className="text-xs text-text-muted">{p.email}</p>
                    </div>
                  </div>
                  <span className="text-[10px] bg-accent-success/10 text-accent-success px-2 py-1 rounded font-bold uppercase tracking-wider">Active</span>
                </div>
              ))}
              {activeDetail === 'absent' && teamStats.absentUsers.map((m: any) => (
                <div key={m.id} className="flex items-center justify-between p-4 rounded-xl bg-card border border-bordercolor opacity-70">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-accent-warning/20 text-accent-warning flex items-center justify-center font-bold">{m.name.charAt(0)}</div>
                    <div>
                      <p className="font-bold text-text-primary">{m.name}</p>
                      <p className="text-xs text-text-muted">{m.email}</p>
                    </div>
                  </div>
                  <span className="text-[10px] bg-card text-text-muted px-2 py-1 rounded font-bold uppercase tracking-wider">Out</span>
                </div>
              ))}
              {activeDetail === 'pending' && leaves.filter(l => l.status === 'Pending').map((l: any) => (
                <div key={l.id} className="p-4 rounded-xl bg-card border border-bordercolor">
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-bold text-text-primary">{l.user?.name}</p>
                    <span className="text-[10px] text-accent-danger font-bold">{new Date(l.startDate).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm text-text-muted italic">"{l.reason}"</p>
                </div>
              ))}
              {activeDetail === 'total' && tasks.slice(0, 10).map((t: any) => (
                <div key={t.id} className="flex items-center justify-between p-4 rounded-xl bg-card border border-bordercolor">
                  <span className="font-medium text-text-primary">{t.title}</span>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded ${t.priority === 'Critical' ? 'bg-accent-danger/20 text-accent-danger' : 'bg-secondary text-text-muted'}`}>{t.priority}</span>
                </div>
              ))}
            </div>
            <button onClick={() => setActiveDetail(null)} className="w-full mt-8 btn btn-primary">Close Details</button>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ title, value, icon, color, pulse, onClick }: any) => (
  <div 
    onClick={onClick}
    className="glass-card p-6 hover-glow relative overflow-hidden group cursor-pointer"
  >
    <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-[0.03] bg-current ${color} group-hover:scale-150 transition-transform duration-700`} />
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs font-bold text-text-muted mb-2 uppercase tracking-[0.15em]">{title}</p>
        <h4 className="text-4xl font-display font-bold text-text-primary tabular-nums tracking-tight">{value}</h4>
      </div>
      <div className={`p-3 rounded-2xl bg-card ${color} ${pulse ? 'animate-pulse' : ''} border border-bordercolor shadow-inner`}>
        {icon}
      </div>
    </div>
    <div className="mt-4 flex items-center gap-1.5 text-[10px] text-text-muted opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:bg-primary">
      <TrendingUp size={12} className="text-accent-success" />
      <span>Click to analyze details</span>
    </div>
  </div>
);

export default Dashboard;
