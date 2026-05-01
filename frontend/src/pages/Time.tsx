import React, { useEffect, useState } from 'react';
import { useStore, api } from '../store/useStore';
import { Clock, LogIn, LogOut, Calendar, Check, X, Users } from 'lucide-react';

const Time = () => {
  const { user, attendance, fetchAttendance, leaves, fetchLeaves } = useStore();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [leaveForm, setLeaveForm] = useState({ reason: '', startDate: '', endDate: '' });

  useEffect(() => {
    fetchAttendance();
    fetchLeaves();
  }, []);

  const handleSignIn = async () => {
    try {
      await api.post('/attendance/signin');
      fetchAttendance();
    } catch (e: any) {
      alert(e.response?.data?.error || 'Failed to sign in');
    }
  };

  const handleSignOut = async () => {
    try {
      await api.post('/attendance/signout');
      fetchAttendance();
    } catch (e: any) {
      alert(e.response?.data?.error || 'Failed to sign out');
    }
  };

  const handleApplyLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/leaves', leaveForm);
      fetchLeaves();
      setLeaveForm({ reason: '', startDate: '', endDate: '' });
      alert('Leave requested successfully');
    } catch (e: any) {
      alert('Failed to apply for leave');
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveStatus = async (id: string, status: string) => {
    try {
      await api.put(`/leaves/${id}`, { status });
      fetchLeaves();
    } catch (e: any) {
      alert('Failed to update leave status');
    }
  };

  const myAttendance = attendance.filter(a => a.user_id === user?.id);
  const todayAttendance = myAttendance.find(a => new Date(a.date).toDateString() === new Date().toDateString());
  const myLeaves = leaves.filter(l => l.user_id === user?.id);
  const teamLeaves = leaves.filter(l => l.user_id !== user?.id);

  return (
    <div className="space-y-8 animate-[fadeIn_0.3s_ease-out]">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold text-text-primary">Time & Leave</h2>
          <p className="text-text-muted">Presence and time management mission control</p>
        </div>
        {user?.role === 'admin' && (
          <div className="flex bg-secondary p-1 rounded-lg border border-bordercolor">
            <button onClick={() => setActiveTab('personal')} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'personal' ? 'bg-accent-primary text-white' : 'text-text-muted hover:text-text-primary'}`}>My Time</button>
            <button onClick={() => setActiveTab('team')} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'team' ? 'bg-accent-primary text-white' : 'text-text-muted hover:text-text-primary'}`}>Team Management</button>
          </div>
        )}
      </div>

      {activeTab === 'personal' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="glass-card p-6 flex flex-col items-center text-center">
              <Clock size={48} className="text-accent-primary mb-4" />
              <h3 className="text-xl font-bold text-text-primary mb-2">Daily Presence</h3>
              <p className="text-text-muted mb-6">Current: {todayAttendance ? (todayAttendance.sign_out ? 'Completed' : 'Signed In') : 'Signed Out'}</p>
              
              <div className="flex gap-4 w-full">
                <button onClick={handleSignIn} disabled={!!todayAttendance} className="flex-1 btn btn-primary gap-2 disabled:opacity-50"><LogIn size={18} /> Sign In</button>
                <button onClick={handleSignOut} disabled={!todayAttendance || !!todayAttendance.sign_out} className="flex-1 btn btn-secondary gap-2 border-accent-danger text-accent-danger hover:bg-accent-danger/10 disabled:opacity-50"><LogOut size={18} /> Sign Out</button>
              </div>
            </div>

            <div className="glass-card p-6">
              <h3 className="text-lg font-bold text-text-primary mb-4">Request Leave</h3>
              <form onSubmit={handleApplyLeave} className="space-y-4">
                <input required placeholder="Reason for leave..." type="text" value={leaveForm.reason} onChange={e => setLeaveForm({...leaveForm, reason: e.target.value})} className="w-full bg-secondary border border-bordercolor rounded-lg px-4 py-2 text-text-primary outline-none" />
                <div className="grid grid-cols-2 gap-4">
                  <input required type="date" value={leaveForm.startDate} onChange={e => setLeaveForm({...leaveForm, startDate: e.target.value})} className="w-full bg-secondary border border-bordercolor rounded-lg px-4 py-2 text-text-primary outline-none" />
                  <input required type="date" value={leaveForm.endDate} onChange={e => setLeaveForm({...leaveForm, endDate: e.target.value})} className="w-full bg-secondary border border-bordercolor rounded-lg px-4 py-2 text-text-primary outline-none" />
                </div>
                <button disabled={loading} type="submit" className="w-full btn btn-primary">Submit Request</button>
              </form>
            </div>
          </div>

          <div className="glass-card p-6">
            <h3 className="text-lg font-bold text-text-primary mb-4">Personal Records</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-text-muted uppercase">Recent Attendance</h4>
                {myAttendance.slice(0, 5).map(a => (
                  <div key={a.id} className="flex justify-between p-3 rounded-lg bg-secondary border border-bordercolor text-sm">
                    <span className="text-text-primary">{new Date(a.date).toLocaleDateString()}</span>
                    <span className="text-text-muted">In: {new Date(a.sign_in).toLocaleTimeString()} {a.sign_out ? `| Out: ${new Date(a.sign_out).toLocaleTimeString()}` : ''}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-2 pt-4">
                <h4 className="text-xs font-bold text-text-muted uppercase">My Leaves</h4>
                {myLeaves.map(l => (
                  <div key={l.id} className="p-3 rounded-lg bg-secondary border border-bordercolor text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-text-primary font-medium">{l.reason}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded border ${l.status === 'Approved' ? 'text-green-500 border-green-500/30' : 'text-yellow-500 border-yellow-500/30'}`}>{l.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-card p-6 border-l-4 border-l-accent-primary">
              <p className="text-xs text-text-muted uppercase font-bold mb-1">Total Team</p>
              <h4 className="text-2xl font-bold text-text-primary">{attendance.length > 0 ? [...new Set(attendance.map(a => a.user_id))].length : 0} Members</h4>
            </div>
            <div className="glass-card p-6 border-l-4 border-l-accent-success">
              <p className="text-xs text-text-muted uppercase font-bold mb-1">Active Now</p>
              <h4 className="text-2xl font-bold text-accent-success">{attendance.filter(a => !a.sign_out && new Date(a.date).toDateString() === new Date().toDateString()).length} Working</h4>
            </div>
            <div className="glass-card p-6 border-l-4 border-l-accent-warning">
              <p className="text-xs text-text-muted uppercase font-bold mb-1">Pending Leaves</p>
              <h4 className="text-2xl font-bold text-accent-warning">{teamLeaves.filter(l => l.status === 'Pending').length} Requests</h4>
            </div>
          </div>

          <div className="glass-card overflow-hidden">
            <div className="p-6 border-b border-bordercolor flex items-center justify-between bg-secondary/10">
              <h3 className="text-lg font-bold text-text-primary flex items-center gap-2"><Users size={20} className="text-accent-primary" /> Team Attendance Ledger</h3>
              <button onClick={() => window.print()} className="btn btn-secondary py-1 text-xs">Export PDF</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-text-muted text-[10px] uppercase tracking-[0.1em] bg-secondary/30">
                    <th className="py-4 px-6 font-bold">Team Member</th>
                    <th className="py-4 px-6 font-bold">Date</th>
                    <th className="py-4 px-6 font-bold">Shift Start</th>
                    <th className="py-4 px-6 font-bold">Shift End</th>
                    <th className="py-4 px-6 font-bold">Duration</th>
                    <th className="py-4 px-6 font-bold text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {attendance.map(a => {
                    const duration = a.sign_out ? Math.round((new Date(a.sign_out).getTime() - new Date(a.sign_in).getTime()) / (1000 * 60 * 60) * 10) / 10 : '---';
                    return (
                      <tr key={a.id} className="border-b border-bordercolor/30 hover:bg-secondary/20 transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-bold text-accent-primary">{a.user?.name.charAt(0)}</div>
                            <span className="font-medium text-text-primary">{a.user?.name}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-text-muted">{new Date(a.date).toLocaleDateString()}</td>
                        <td className="py-4 px-6 text-text-primary font-mono">{new Date(a.sign_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                        <td className="py-4 px-6 text-text-muted font-mono">{a.sign_out ? new Date(a.sign_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '---'}</td>
                        <td className="py-4 px-6 text-text-primary">{duration} hrs</td>
                        <td className="py-4 px-6 text-right">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${a.sign_out ? 'bg-accent-success/10 text-accent-success border border-accent-success/20' : 'bg-accent-primary/10 text-accent-primary border border-accent-primary/20 animate-pulse'}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${a.sign_out ? 'bg-accent-success' : 'bg-accent-primary'}`} />
                            {a.sign_out ? 'COMPLETED' : 'ON DUTY'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {attendance.length === 0 && <div className="p-12 text-center text-text-muted italic">No attendance records found in the system ledger.</div>}
            </div>
          </div>

          <div className="glass-card p-6">
            <h3 className="text-lg font-bold text-text-primary mb-6">Pending Leave Requests</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teamLeaves.filter(l => l.status === 'Pending').map(l => (
                <div key={l.id} className="p-5 rounded-2xl bg-secondary/30 border border-bordercolor flex flex-col hover-glow transition-all">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-accent-secondary/20 flex items-center justify-center text-accent-secondary font-bold">{l.user?.name.charAt(0)}</div>
                    <div>
                      <p className="text-sm font-bold text-text-primary">{l.user?.name}</p>
                      <p className="text-[10px] text-text-muted uppercase tracking-wider">{l.user?.role}</p>
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-text-primary font-medium mb-1 line-clamp-2">"{l.reason}"</p>
                    <div className="flex items-center gap-2 text-[10px] text-text-muted mb-4 bg-secondary/50 px-2 py-1 rounded w-fit">
                      <Calendar size={12} /> {new Date(l.startDate).toLocaleDateString()} — {new Date(l.endDate).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <div className="flex gap-2 pt-4 border-t border-bordercolor/50">
                    <button onClick={() => handleLeaveStatus(l.id, 'Approved')} className="flex-1 py-2 rounded-xl text-xs font-bold bg-accent-success text-white hover:bg-accent-success/80 transition-colors shadow-lg shadow-accent-success/20">Approve</button>
                    <button onClick={() => handleLeaveStatus(l.id, 'Rejected')} className="flex-1 py-2 rounded-xl text-xs font-bold bg-secondary text-text-muted hover:text-accent-danger transition-colors">Reject</button>
                  </div>
                </div>
              ))}
              {teamLeaves.filter(l => l.status === 'Pending').length === 0 && <p className="text-text-muted text-sm italic py-4">All leave requests have been processed.</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Time;
