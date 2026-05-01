import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FolderKanban, CheckSquare, Users, LogOut, PanelLeftClose, PanelLeftOpen, Clock, MessageSquare } from 'lucide-react';
import { useStore } from '../store/useStore';

const Sidebar = () => {
  const { sidebarOpen, setSidebarOpen, user, setUser } = useStore();

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Projects', icon: FolderKanban, path: '/projects' },
    { name: user?.role === 'admin' ? 'Team Tasks' : 'My Tasks', icon: CheckSquare, path: '/tasks' },
    { name: 'Team', icon: Users, path: '/team' },
    { name: 'Time & Leave', icon: Clock, path: '/time' },
    { name: 'Messages', icon: MessageSquare, path: '/messages' },
  ];

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <aside className={`bg-secondary border-r border-bordercolor transition-all duration-300 flex flex-col ${sidebarOpen ? 'w-64' : 'w-20'}`}>
      <div className="h-16 flex items-center justify-between px-6 border-b border-bordercolor">
        <div className={`flex items-center gap-2 overflow-hidden transition-all ${!sidebarOpen ? 'w-0' : 'w-full'}`}>
          <div className="w-8 h-8 rounded bg-accent-primary flex items-center justify-center text-white font-bold">T</div>
          <span className="font-display font-bold text-xl text-text-primary">TaskFlow</span>
        </div>
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-text-muted hover:text-text-primary transition-colors"
        >
          {sidebarOpen ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
        </button>
      </div>

      <nav className="flex-1 py-6 px-3 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) => `
              flex items-center gap-3 px-3 py-2 rounded-lg transition-all group
              ${isActive 
                ? 'bg-accent-primary text-white' 
                : 'text-text-muted hover:bg-card hover:text-text-primary'}
            `}
          >
            <item.icon size={20} className="shrink-0" />
            <span className={`font-medium whitespace-nowrap transition-all ${!sidebarOpen ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'}`}>
              {item.name}
            </span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-bordercolor">
        <div className={`flex items-center gap-3 ${!sidebarOpen ? 'justify-center' : ''}`}>
          <div className="w-10 h-10 rounded-full bg-accent-secondary/20 flex items-center justify-center text-accent-secondary shrink-0 font-bold">
            {user?.name ? user.name.charAt(0).toUpperCase() : '?'}
          </div>
          {sidebarOpen && (
            <div className="flex-1 overflow-hidden">
              <div className="text-sm font-medium text-text-primary truncate">{user?.name}</div>
              <div className="text-xs text-text-muted truncate capitalize">{user?.role}</div>
            </div>
          )}
          {sidebarOpen && (
            <button onClick={handleLogout} className="text-text-muted hover:text-accent-danger transition-colors">
              <LogOut size={18} />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
