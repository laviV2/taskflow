import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, Menu, X } from 'lucide-react';
import { useStore } from '../store/useStore';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { setSidebarOpen, sidebarOpen, user, tasks, projects, team } = useStore();
  const [query, setQuery] = React.useState('');
  const [showResults, setShowResults] = React.useState(false);
  
  const getPageTitle = () => {
    const path = location.pathname.split('/')[1];
    return path.charAt(0).toUpperCase() + path.slice(1) || 'Dashboard';
  };

  const results = React.useMemo(() => {
    if (!query.trim()) return { tasks: [], projects: [], team: [] };
    const q = query.toLowerCase();
    return {
      tasks: tasks.filter(t => t.title.toLowerCase().includes(q)).slice(0, 3),
      projects: projects.filter(p => p.name.toLowerCase().includes(q)).slice(0, 3),
      team: team.filter(m => m.name.toLowerCase().includes(q)).slice(0, 3)
    };
  }, [query, tasks, projects, team]);

  const hasResults = results.tasks.length > 0 || results.projects.length > 0 || results.team.length > 0;

  return (
    <header className="h-16 border-b border-bordercolor bg-primary/80 backdrop-blur-md sticky top-0 z-40 flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <button 
          className="md:hidden p-2 text-text-muted hover:text-text-primary"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <Menu size={20} />
        </button>
        <h1 className="text-xl font-display font-bold text-text-primary">{getPageTitle()}</h1>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
          <input 
            type="text" 
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowResults(true);
            }}
            onFocus={() => setShowResults(true)}
            placeholder="Search tasks, projects..." 
            className="bg-secondary border border-bordercolor rounded-full pl-10 pr-4 py-1.5 text-sm text-text-primary focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary w-64 transition-all"
          />

          {showResults && query && (
            <div className="absolute top-full mt-2 w-80 bg-card border border-bordercolor rounded-xl shadow-2xl p-2 animate-[fadeIn_0.2s_ease-out] overflow-hidden">
              <div className="flex items-center justify-between px-3 py-1 mb-2 border-b border-bordercolor">
                <span className="text-[10px] font-bold text-text-muted uppercase">Global Results</span>
                <button onClick={() => setShowResults(false)} className="text-text-muted hover:text-text-primary"><X size={12}/></button>
              </div>
              
              <div className="max-h-80 overflow-y-auto custom-scrollbar">
                {results.projects.length > 0 && (
                  <div className="mb-4">
                    <p className="px-3 text-[10px] font-bold text-accent-primary uppercase mb-1">Projects</p>
                    {results.projects.map(p => (
                      <button key={p.id} onClick={() => { navigate('/projects'); setShowResults(false); setQuery(''); }} className="w-full text-left px-3 py-2 rounded-lg hover:bg-secondary text-sm text-text-primary flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} /> {p.name}
                      </button>
                    ))}
                  </div>
                )}

                {results.tasks.length > 0 && (
                  <div className="mb-4">
                    <p className="px-3 text-[10px] font-bold text-accent-secondary uppercase mb-1">Tasks</p>
                    {results.tasks.map(t => (
                      <button key={t.id} onClick={() => { navigate('/tasks'); setShowResults(false); setQuery(''); }} className="w-full text-left px-3 py-2 rounded-lg hover:bg-secondary text-sm text-text-primary flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-text-muted" /> {t.title}
                      </button>
                    ))}
                  </div>
                )}

                {results.team.length > 0 && (
                  <div>
                    <p className="px-3 text-[10px] font-bold text-accent-success uppercase mb-1">Team</p>
                    {results.team.map(m => (
                      <button key={m.id} onClick={() => { navigate('/team'); setShowResults(false); setQuery(''); }} className="w-full text-left px-3 py-2 rounded-lg hover:bg-secondary text-sm text-text-primary flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-secondary flex items-center justify-center text-[10px]">{m.name.charAt(0)}</div> {m.name}
                      </button>
                    ))}
                  </div>
                )}

                {!hasResults && (
                  <div className="px-3 py-8 text-center">
                    <p className="text-xs text-text-muted italic">No matches found for "{query}"</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4 pl-4 border-l border-bordercolor">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-extrabold text-text-primary uppercase tracking-wider">{user?.name}</p>
            <p className="text-[10px] font-bold text-accent-primary uppercase tracking-[0.2em]">{user?.role}</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
