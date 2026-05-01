import React, { useState, useEffect } from 'react';
import { Plus, MoreVertical, Calendar, X, Loader2, Users, Trash, FolderKanban } from 'lucide-react';
import { useStore, api } from '../store/useStore';

const Projects = () => {
  const { user, projects, fetchProjects, team, fetchTeam } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProjects();
    fetchTeam();
  }, []);

  const [newProject, setNewProject] = useState({ name: '', desc: '', color: '#6366F1', due: '' });

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/projects', {
        name: newProject.name,
        description: newProject.desc,
        color: newProject.color,
        due_date: newProject.due || null
      });
      await fetchProjects();
      setIsModalOpen(false);
      setNewProject({ name: '', desc: '', color: '#6366F1', due: '' });
    } catch (e) {
      alert('Failed to add project');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async (userId: string) => {
    try {
      await api.post(`/projects/${selectedProject.id}/members`, { user_id: userId });
      // Fetch latest projects to get the updated member list
      const res = await api.get('/projects');
      useStore.setState({ projects: res.data });
      const updated = res.data.find((p: any) => p.id === selectedProject.id);
      setSelectedProject(updated);
    } catch (e) { alert('Failed to add member'); }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!window.confirm('Remove this member from project?')) return;
    try {
      await api.delete(`/projects/${selectedProject.id}/members/${userId}`);
      const res = await api.get('/projects');
      useStore.setState({ projects: res.data });
      const updated = res.data.find((p: any) => p.id === selectedProject.id);
      setSelectedProject(updated);
    } catch (e) { alert('Failed to remove member'); }
  };

  return (
    <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold text-text-primary">Projects</h2>
          <p className="text-text-muted">Direct mission control for your initiatives</p>
        </div>
        {user?.role === 'admin' && (
          <button onClick={() => setIsModalOpen(true)} className="btn btn-primary flex items-center gap-2">
            <Plus size={18} />
            <span>Start New Project</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {projects.length > 0 ? projects.map(project => (
          <div 
            key={project.id} 
            onClick={() => setSelectedProject(project)}
            className="glass-card p-6 hover-glow group cursor-pointer flex flex-col h-full border-t-4"
            style={{ borderTopColor: project.color }}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-text-primary group-hover:text-accent-primary transition-colors">{project.name}</h3>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                  project.status === 'active' 
                    ? 'bg-accent-success/10 text-accent-success border-accent-success/20' 
                    : 'bg-accent-danger/10 text-accent-danger border-accent-danger/20'
                }`}>
                  {project.status || 'active'}
                </span>
              </div>
              <button className="text-text-muted hover:text-text-primary">
                <MoreVertical size={18} />
              </button>
            </div>
            
            <p className="text-sm text-text-muted mb-6 flex-1 line-clamp-2">{project.description}</p>
            
            <div className="space-y-4 mt-auto">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-text-muted">Progress</span>
                  <span className="text-text-primary font-medium">{project.progress || 0}%</span>
                </div>
                <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                  <div 
                    className="h-full transition-all duration-1000 ease-out rounded-full" 
                    style={{ width: `${project.progress || 0}%`, backgroundColor: project.color }}
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t border-bordercolor">
                <div className="flex -space-x-2">
                  {project.members?.slice(0, 3).map((m: any, i: number) => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-card bg-secondary flex items-center justify-center text-[10px] font-bold text-text-primary">
                      {m.user?.name.charAt(0)}
                    </div>
                  ))}
                  {project.members?.length > 3 && (
                    <div className="w-8 h-8 rounded-full border-2 border-card bg-secondary flex items-center justify-center text-[10px] font-bold text-text-muted">
                      +{project.members.length - 3}
                    </div>
                  )}
                  {(!project.members || project.members.length === 0) && <span className="text-[10px] text-text-muted">No members</span>}
                </div>
                <div className="text-xs text-text-muted flex items-center gap-1">
                  <Calendar size={14} />
                  {project.due_date ? new Date(project.due_date).toLocaleDateString() : 'No deadline'}
                </div>
              </div>
            </div>
          </div>
        )) : (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-center space-y-4 opacity-50 bg-secondary/10 rounded-2xl border border-dashed border-bordercolor">
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center text-text-muted">
              <FolderKanban size={32} />
            </div>
            <div>
              <p className="text-lg font-bold text-text-primary">No Active Projects</p>
              <p className="text-sm text-text-muted">{user?.role === 'admin' ? 'Create a new project to get started.' : 'You have not been assigned to any projects yet.'}</p>
            </div>
          </div>
        )}
      </div>

      {/* Project Detail Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary/80 backdrop-blur-sm p-4">
          <div className="bg-card border border-bordercolor rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-[slideUp_0.3s_ease-out]">
            <div className="p-8 space-y-8">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-3xl font-display font-bold text-text-primary mb-2">{selectedProject.name}</h3>
                  <p className="text-text-muted">{selectedProject.description || 'No description provided.'}</p>
                </div>
                <button onClick={() => setSelectedProject(null)} className="p-2 hover:bg-secondary rounded-full">
                  <X size={24} className="text-text-muted" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <h4 className="text-sm font-bold uppercase tracking-widest text-accent-primary">Project Management</h4>
                  <div className="space-y-3">
                    <div className="bg-secondary/30 p-4 rounded-xl border border-bordercolor max-h-60 overflow-y-auto">
                      <p className="text-xs text-text-muted mb-3 uppercase">Assigned Team Members</p>
                      <div className="space-y-3">
                        {selectedProject.members?.map((m: any) => (
                          <div key={m.user.id} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2 text-text-primary">
                              <div className="w-6 h-6 rounded-full bg-accent-primary/20 flex items-center justify-center text-[10px]">{m.user.name.charAt(0)}</div>
                              {m.user.name}
                            </div>
                            {user?.role === 'admin' && (
                              <button onClick={() => handleRemoveMember(m.user.id)} className="p-1 hover:text-accent-danger text-text-muted transition-colors">
                                <X size={14} />
                              </button>
                            )}
                          </div>
                        ))}
                        {(!selectedProject.members || selectedProject.members.length === 0) && <p className="text-xs text-text-muted italic">No members assigned yet</p>}
                      </div>
                    </div>
                    
                    {user?.role === 'admin' && (
                      <div className="space-y-3">
                        <div className="relative">
                          <select 
                            onChange={(e) => {
                              if (e.target.value) handleAddMember(e.target.value);
                              e.target.value = "";
                            }}
                            className="w-full btn btn-secondary justify-start gap-3 bg-secondary/50 appearance-none text-left"
                          >
                            <option value="">+ Assign New Member</option>
                            {team.filter(tm => !selectedProject.members?.some((m: any) => m.user.id === tm.id)).map(tm => (
                              <option key={tm.id} value={tm.id}>{tm.name} ({tm.role})</option>
                            ))}
                          </select>
                        </div>
                        <button 
                          onClick={async () => {
                            if (window.confirm('Are you sure you want to CLOSE this project?')) {
                              try {
                                await api.put(`/projects/${selectedProject.id}`, { status: 'Closed' });
                                await fetchProjects();
                                setSelectedProject(null);
                                alert('Project Closed Successfully');
                              } catch (e) { alert('Failed to close project'); }
                            }
                          }}
                          className="w-full btn bg-accent-danger/10 text-accent-danger border border-accent-danger/20 hover:bg-accent-danger hover:text-white justify-start gap-3 transition-all"
                        >
                          <Trash size={18} /> Delete Project
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-6">
                  <h4 className="text-sm font-bold uppercase tracking-widest text-accent-secondary">Timeline & Health</h4>
                  <div className="bg-secondary/50 p-4 rounded-xl border border-bordercolor space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-text-muted">Deadline</span>
                      <span className="text-sm font-bold text-text-primary">{selectedProject.due_date ? new Date(selectedProject.due_date).toLocaleDateString() : 'Flexible'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-text-muted">Status</span>
                      <span className="px-2 py-1 rounded bg-accent-success/10 text-accent-success text-[10px] font-bold border border-accent-success/20 uppercase">{selectedProject.status === 'active' ? 'On Track' : 'Closed'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary/80 backdrop-blur-sm p-4 animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-card border border-bordercolor rounded-2xl w-full max-w-md shadow-2xl animate-[slideUp_0.3s_ease-out]">
            <div className="flex items-center justify-between p-6 border-b border-bordercolor">
              <h3 className="text-xl font-display font-bold text-text-primary">Create New Project</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-text-muted hover:text-text-primary transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleAddProject} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-text-muted mb-1.5">Project Name</label>
                <input 
                  type="text" required
                  value={newProject.name} onChange={e => setNewProject({...newProject, name: e.target.value})}
                  className="w-full bg-secondary border border-bordercolor rounded-lg px-4 py-2.5 text-text-primary focus:outline-none focus:border-accent-primary"
                  placeholder="e.g. Website Redesign"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-muted mb-1.5">Description</label>
                <textarea 
                  value={newProject.desc} onChange={e => setNewProject({...newProject, desc: e.target.value})}
                  className="w-full bg-secondary border border-bordercolor rounded-lg px-4 py-2.5 text-text-primary focus:outline-none focus:border-accent-primary resize-none h-24"
                  placeholder="Brief project description..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-1.5">Color Theme</label>
                  <input 
                    type="color" 
                    value={newProject.color} onChange={e => setNewProject({...newProject, color: e.target.value})}
                    className="w-full h-10 bg-secondary border border-bordercolor rounded-lg cursor-pointer p-1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-1.5">Due Date</label>
                  <input 
                    type="date" 
                    value={newProject.due} onChange={e => setNewProject({...newProject, due: e.target.value})}
                    className="w-full bg-secondary border border-bordercolor rounded-lg px-4 py-2 text-text-primary focus:outline-none focus:border-accent-primary"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="btn btn-primary min-w-[120px]">
                  {loading ? <Loader2 size={18} className="animate-spin" /> : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
