import React from 'react';
import { useStore } from '../store/useStore';
import { User, Shield, Bell, Lock, Globe, Save } from 'lucide-react';

const Settings = () => {
  const { user } = useStore();

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-[fadeIn_0.3s_ease-out]">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold text-text-primary">Settings</h2>
          <p className="text-text-muted">Manage your account and preferences</p>
        </div>
        <button className="btn btn-primary flex items-center gap-2">
          <Save size={18} />
          <span>Save Changes</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-accent-primary/10 text-accent-primary border border-accent-primary/20">
            <User size={18} /> Profile Information
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-text-muted hover:bg-secondary hover:text-text-primary transition-all">
            <Shield size={18} /> Security & Privacy
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-text-muted hover:bg-secondary hover:text-text-primary transition-all">
            <Bell size={18} /> Notifications
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-text-muted hover:bg-secondary hover:text-text-primary transition-all">
            <Globe size={18} /> Language & Region
          </button>
        </div>

        <div className="md:col-span-2 space-y-6">
          <div className="glass-card p-6">
            <h3 className="text-lg font-bold text-text-primary mb-6">Profile Information</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-6 mb-8">
                <div className="w-20 h-20 rounded-full bg-secondary border border-bordercolor flex items-center justify-center text-3xl font-bold text-accent-primary">
                  {user?.name?.charAt(0)}
                </div>
                <button className="btn btn-secondary text-sm">Change Avatar</button>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-text-muted mb-1.5">Full Name</label>
                  <input type="text" defaultValue={user?.name} className="w-full bg-secondary border border-bordercolor rounded-lg px-4 py-2 text-text-primary outline-none focus:border-accent-primary" />
                </div>
                <div>
                  <label className="block text-sm text-text-muted mb-1.5">Email Address</label>
                  <input type="email" defaultValue={user?.email} className="w-full bg-secondary border border-bordercolor rounded-lg px-4 py-2 text-text-primary outline-none focus:border-accent-primary" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm text-text-muted mb-1.5">Role</label>
                <div className="flex items-center gap-2 px-4 py-2 bg-secondary/50 border border-bordercolor rounded-lg text-text-muted text-sm italic">
                  <Lock size={14} /> {user?.role.toUpperCase()} (Managed by administrator)
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card p-6">
            <h3 className="text-lg font-bold text-text-primary mb-6">Regional Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-text-muted mb-1.5">Timezone</label>
                <select className="w-full bg-secondary border border-bordercolor rounded-lg px-4 py-2 text-text-primary outline-none focus:border-accent-primary">
                  <option>Pacific Time (PT)</option>
                  <option>Eastern Time (ET)</option>
                  <option>Central European Time (CET)</option>
                  <option>India Standard Time (IST)</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
