import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore, api } from '../store/useStore';
import { Mail, Shield, User as UserIcon, MoreVertical, Plus, X } from 'lucide-react';

const Team = () => {
  const { user, team, fetchTeam } = useStore();
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteForm, setInviteForm] = useState({ name: '', email: '', password: '', role: 'member' });
  const navigate = useNavigate();

  useEffect(() => {
    fetchTeam();
  }, []);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/auth/signup', inviteForm);
      fetchTeam();
      setIsInviteModalOpen(false);
      setInviteForm({ name: '', email: '', password: '', role: 'member' });
      alert('Member added successfully!');
    } catch (e: any) {
      alert(e.response?.data?.error || 'Failed to add member');
    }
  };

  return (
    <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold text-text-primary">Team Members</h2>
          <p className="text-text-muted">Manage your organization members</p>
        </div>
        {user?.role === 'admin' && (
          <button onClick={() => setIsInviteModalOpen(true)} className="btn btn-primary flex items-center gap-2">
            <Plus size={18} />
            <span>Invite Member</span>
          </button>
        )}
      </div>

      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary/80 backdrop-blur-sm p-4">
          <div className="bg-card border border-bordercolor rounded-2xl w-full max-w-md shadow-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-text-primary">Add Team Member</h3>
              <button onClick={() => setIsInviteModalOpen(false)} className="text-text-muted hover:text-text-primary"><X size={20}/></button>
            </div>
            <form onSubmit={handleInvite} className="space-y-4">
              <input required placeholder="Name" className="input-field" value={inviteForm.name} onChange={e => setInviteForm({...inviteForm, name: e.target.value})} />
              <input required type="email" placeholder="Email" className="input-field" value={inviteForm.email} onChange={e => setInviteForm({...inviteForm, email: e.target.value})} />
              <input required type="password" placeholder="Initial Password" className="input-field" value={inviteForm.password} onChange={e => setInviteForm({...inviteForm, password: e.target.value})} />
              <select className="input-field" value={inviteForm.role} onChange={e => setInviteForm({...inviteForm, role: e.target.value})}>
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>
              <button type="submit" className="w-full btn btn-primary">Add Member</button>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
        {team.map((member) => (
          <div 
            key={member.id} 
            onClick={() => setSelectedMember(member)}
            className="glass-card p-6 flex flex-col items-center text-center relative hover-glow cursor-pointer"
          >
            {user?.role === 'admin' && (
              <button className="absolute top-4 right-4 text-text-muted hover:text-text-primary transition-colors">
                <MoreVertical size={18} />
              </button>
            )}
            
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-accent-primary to-accent-secondary p-1 mb-4">
              <div className="w-full h-full rounded-full bg-card flex items-center justify-center text-2xl font-bold text-text-primary border-2 border-primary">
                {member.name.charAt(0)}
              </div>
            </div>
            
            <h3 className="text-lg font-bold text-text-primary">{member.name}</h3>
            <p className="text-sm text-text-muted flex items-center justify-center gap-1 mt-1 mb-4">
              <Mail size={14} /> {member.email}
            </p>
            
            <div className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1 mb-6
              ${member.role === 'admin' 
                ? 'bg-accent-primary/10 text-accent-primary border-accent-primary/30' 
                : 'bg-accent-secondary/10 text-accent-secondary border-accent-secondary/30'}`}
            >
              {member.role === 'admin' ? <Shield size={12} /> : <UserIcon size={12} />}
              {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
            </div>
            
            <div className="w-full grid grid-cols-2 gap-4 border-t border-bordercolor pt-4 mt-auto">
              <div>
                <p className="text-xs text-text-muted mb-1">Active Tasks</p>
                <p className="text-lg font-bold text-text-primary">{member.assignedTasks?.length || 0}</p>
              </div>
              <div>
                <p className="text-xs text-text-muted mb-1">Joined</p>
                <p className="text-sm font-medium text-text-primary mt-1">{new Date(member.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary/80 backdrop-blur-sm p-4">
          <div className="bg-card border border-bordercolor rounded-2xl w-full max-w-md shadow-2xl p-8 relative">
            <button onClick={() => setSelectedMember(null)} className="absolute top-4 right-4 text-text-muted hover:text-text-primary"><X size={20}/></button>
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center text-3xl font-bold text-accent-primary mb-4 border border-accent-primary/30">
                {selectedMember.name.charAt(0)}
              </div>
              <h3 className="text-2xl font-bold text-text-primary">{selectedMember.name}</h3>
              <p className="text-text-muted mb-6">{selectedMember.email}</p>
              
              <div className="w-full space-y-4">
                <div className="bg-secondary/50 p-4 rounded-xl border border-bordercolor">
                  <h4 className="text-sm font-medium text-text-muted mb-2 uppercase tracking-wider">Performance Metrics</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-xs text-text-muted">Tasks Completed</span>
                      <p className="text-lg font-bold text-text-primary">
                        {selectedMember.assignedTasks?.filter((t: any) => t.status === 'Done').length || 0}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs text-text-muted">Active Tasks</span>
                      <p className="text-lg font-bold text-accent-secondary">
                        {selectedMember.assignedTasks?.filter((t: any) => t.status !== 'Done').length || 0}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-text-muted uppercase">Currently Working On</h4>
                  <div className="max-h-32 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                    {selectedMember.assignedTasks?.filter((t: any) => t.status !== 'Done').map((t: any) => (
                      <div key={t.id} className="text-xs p-2 bg-secondary rounded border border-bordercolor text-text-primary">
                        {t.title}
                      </div>
                    ))}
                    {(!selectedMember.assignedTasks || selectedMember.assignedTasks.filter((t: any) => t.status !== 'Done').length === 0) && (
                      <p className="text-xs text-text-muted italic">No active tasks</p>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-4 pt-4">
                  <button onClick={() => navigate('/messages')} className="flex-1 btn btn-primary">Message</button>
                  <button onClick={() => navigate('/tasks')} className="flex-1 btn btn-secondary">Assign Task</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Team;
