import React, { useState, useEffect } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragOverlay, useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus, MoreHorizontal, Calendar, MessageSquare, X } from 'lucide-react';
import { useStore, api } from '../store/useStore';

const COLUMNS = ['To Do', 'In Progress', 'In Review', 'Done'];

const SortableTask = ({ task, onClick }: { task: any, onClick: () => void }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const priorityColors: any = {
    'Low': 'bg-secondary text-text-muted',
    'Medium': 'bg-accent-warning/20 text-accent-warning border-accent-warning/50',
    'High': 'bg-orange-500/20 text-orange-500 border-orange-500/50',
    'Critical': 'bg-accent-danger/20 text-accent-danger border-accent-danger/50 animate-pulse',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className="bg-card border border-bordercolor rounded-lg p-4 cursor-grab active:cursor-grabbing hover-glow mb-3 group"
    >
      <div className="flex justify-between items-start mb-3">
        <span className={`text-xs px-2 py-1 rounded border ${priorityColors[task.priority] || priorityColors['Low']}`}>
          {task.priority}
        </span>
        <button className="text-text-muted hover:text-text-primary opacity-0 group-hover:opacity-100 transition-opacity">
          <MoreHorizontal size={16} />
        </button>
      </div>
      <h4 className="text-sm font-medium text-text-primary mb-4 leading-tight group-hover:text-accent-primary transition-colors">{task.title}</h4>
      
      <div className="flex items-center justify-between text-text-muted text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1"><Calendar size={14} />{task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No date'}</div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-secondary px-1.5 py-0.5 rounded text-[10px]">
            {task.project?.name?.substring(0, 8)}...
          </div>
          <div className="w-6 h-6 rounded-full bg-accent-primary/20 flex items-center justify-center border border-accent-primary/30 text-accent-primary font-bold">
            {task.assignee?.name?.charAt(0) || 'U'}
          </div>
        </div>
      </div>
    </div>
  );
};

const DroppableColumn = ({ column, tasks, onAddTask, user, onTaskClick }: any) => {
  const { setNodeRef } = useDroppable({ id: column });

  return (
    <div ref={setNodeRef} className="w-80 flex flex-col bg-secondary/30 rounded-xl p-4 border border-bordercolor/50 h-full">
      <div className="flex justify-between items-center mb-4 px-1">
        <h3 className="font-bold text-text-primary">{column}</h3>
        <span className="text-xs bg-secondary text-text-muted px-2 py-1 rounded-full border border-bordercolor">
          {tasks.length}
        </span>
      </div>
      
      <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar min-h-[200px]">
        <SortableContext id={column} items={tasks.map((t: any) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task: any) => (
            <SortableTask key={task.id} task={task} onClick={() => onTaskClick(task)} />
          ))}
        </SortableContext>
        {user?.role === 'admin' && (
          <button 
            onClick={() => onAddTask(column)}
            className="w-full py-2 flex items-center justify-center gap-2 text-text-muted hover:text-text-primary hover:bg-secondary rounded-lg transition-colors border border-dashed border-transparent hover:border-bordercolor mt-2"
          >
            <Plus size={16} /> Quick Add
          </button>
        )}
      </div>
    </div>
  );
};

const Tasks = () => {
  const { user, tasks, fetchTasks, projects, team, setTasks } = useStore();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newTask, setNewTask] = useState({ 
    title: '', description: '', status: 'To Do', priority: 'Medium', 
    project_id: '', assignee_id: '', due_date: '' 
  });

  useEffect(() => {
    fetchTasks();
    useStore.getState().fetchProjects();
    useStore.getState().fetchTeam();
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  );

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;

    let newStatus = '';
    if (COLUMNS.includes(over.id as string)) {
      newStatus = over.id as string;
    } else {
      const overTask = tasks.find(t => t.id === over.id);
      if (overTask && overTask.status) newStatus = overTask.status;
    }

    if (newStatus) {
      const originalTasks = [...tasks];
      setTasks(tasks.map(t => t.id === active.id ? { ...t, status: newStatus } : t));
      
      try {
        await api.put(`/tasks/${active.id}`, { status: newStatus });
        useStore.getState().fetchProjects(); // Sync project progress
      } catch (e) {
        setTasks(originalTasks);
      }
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/tasks', newTask);
      setTasks([...tasks, res.data]);
      setIsModalOpen(false);
      setNewTask({ title: '', description: '', status: 'To Do', priority: 'Medium', project_id: '', assignee_id: '', due_date: '' });
      await fetchTasks();
    } catch (e: any) {
      const errorMsg = e.response?.data?.error || 'Failed to create task';
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      setTasks(tasks.filter(t => t.id !== id));
      setSelectedTask(null);
      await api.delete(`/tasks/${id}`);
      await fetchTasks();
    } catch (e) {
      alert('Failed to delete task');
      await fetchTasks();
    }
  };

  return (
    <div className="h-full flex flex-col animate-[fadeIn_0.3s_ease-out]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-display font-bold text-text-primary">Kanban Board</h2>
          <p className="text-text-muted">
            {user?.role === 'admin' ? 'Team Work Distribution' : 'Your Task Backlog'}
          </p>
        </div>
        {user?.role === 'admin' && (
          <button onClick={() => setIsModalOpen(true)} className="btn btn-primary flex items-center gap-2">
            <Plus size={18} />
            <span>Assign New Task</span>
          </button>
        )}
      </div>

      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <div className="flex gap-6 h-full pb-4 w-max min-w-full">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            {COLUMNS.map(column => (
              <DroppableColumn 
                key={column} 
                column={column} 
                tasks={tasks.filter(t => t.status === column)}
                user={user}
                onTaskClick={setSelectedTask}
                onAddTask={(col: string) => {
                  setNewTask({...newTask, status: col});
                  setIsModalOpen(true);
                }}
              />
            ))}
            <DragOverlay>
              {activeId ? <SortableTask task={tasks.find(t => t.id === activeId)} onClick={() => {}} /> : null}
            </DragOverlay>
          </DndContext>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary/80 backdrop-blur-sm p-4">
          <div className="bg-card border border-bordercolor rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-[slideUp_0.3s_ease-out]">
            <div className="p-8 space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs px-2 py-1 rounded bg-accent-primary/10 text-accent-primary border border-accent-primary/20">{selectedTask.project?.name}</span>
                    <span className="text-xs text-text-muted font-mono">{selectedTask.id.substring(0, 8)}</span>
                  </div>
                  <h3 className="text-3xl font-display font-bold text-text-primary">{selectedTask.title}</h3>
                </div>
                <button onClick={() => setSelectedTask(null)} className="p-2 hover:bg-secondary rounded-full transition-colors">
                  <X size={24} className="text-text-muted" />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-8 py-6 border-y border-bordercolor">
                <div>
                  <p className="text-xs text-text-muted mb-1 uppercase tracking-wider">Status</p>
                  <p className="font-bold text-text-primary">{selectedTask.status}</p>
                </div>
                <div>
                  <p className="text-xs text-text-muted mb-1 uppercase tracking-wider">Assignee</p>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-[10px] font-bold">
                      {selectedTask.assignee?.name?.charAt(0)}
                    </div>
                    <p className="font-bold text-text-primary">{selectedTask.assignee?.name || 'Unassigned'}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-text-muted mb-1 uppercase tracking-wider">Due Date</p>
                  <p className="font-bold text-text-primary">{selectedTask.due_date ? new Date(selectedTask.due_date).toLocaleDateString() : 'No date'}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-text-muted mb-2">Description</p>
                <div className="bg-secondary/30 p-4 rounded-xl border border-bordercolor min-h-[100px] text-text-primary leading-relaxed">
                  {selectedTask.description || 'No description provided.'}
                </div>
              </div>

              <div className="flex justify-between items-center pt-4">
                <button onClick={() => handleDeleteTask(selectedTask.id)} className="text-accent-danger hover:text-accent-danger/80 text-sm font-bold flex items-center gap-1 transition-colors">
                  <X size={16} /> Delete Task
                </button>
                <div className="flex gap-3">
                  <button onClick={() => setSelectedTask(null)} className="btn btn-secondary">Close</button>
                  {user?.role === 'admin' && <button className="btn btn-primary">Edit Task</button>}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary/80 backdrop-blur-sm p-4">
          <div className="bg-card border border-bordercolor rounded-2xl w-full max-w-md shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-bordercolor shrink-0">
              <h3 className="text-xl font-display font-bold text-text-primary">Create New Task</h3>
            </div>
            <form onSubmit={handleCreateTask} className="p-6 space-y-4 overflow-y-auto custom-scrollbar">
              <div className="bg-accent-primary/5 p-4 rounded-xl border border-accent-primary/10 mb-2">
                <label className="block text-xs font-bold text-accent-primary uppercase tracking-widest mb-1.5">Task Heading</label>
                <input 
                  required 
                  type="text" 
                  value={newTask.title} 
                  onChange={e => setNewTask({...newTask, title: e.target.value})} 
                  placeholder="What needs to be done?"
                  className="w-full bg-transparent border-none text-lg font-bold text-text-primary focus:outline-none placeholder:opacity-30" 
                />
              </div>
              <div>
                <label className="block text-sm text-text-muted mb-1">Description</label>
                <textarea rows={3} value={newTask.description} onChange={e => setNewTask({...newTask, description: e.target.value})} className="w-full bg-secondary border border-bordercolor rounded-lg px-4 py-2 text-text-primary focus:border-accent-primary outline-none resize-none" placeholder="Task details..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-text-muted mb-1">Priority</label>
                  <select value={newTask.priority} onChange={e => setNewTask({...newTask, priority: e.target.value})} className="w-full bg-secondary border border-bordercolor rounded-lg px-3 py-2 text-text-primary outline-none">
                    <option>Low</option><option>Medium</option><option>High</option><option>Critical</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-text-muted mb-1">Due Date</label>
                  <input type="date" value={newTask.due_date} onChange={e => setNewTask({...newTask, due_date: e.target.value})} className="w-full bg-secondary border border-bordercolor rounded-lg px-3 py-2 text-text-primary outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm text-text-muted mb-1">Project</label>
                <select required value={newTask.project_id} onChange={e => setNewTask({...newTask, project_id: e.target.value})} className="w-full bg-secondary border border-bordercolor rounded-lg px-3 py-2 text-text-primary outline-none">
                  <option value="">Select Project</option>
                  {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm text-text-muted mb-1">Assignee</label>
                <select required value={newTask.assignee_id} onChange={e => setNewTask({...newTask, assignee_id: e.target.value})} className="w-full bg-secondary border border-bordercolor rounded-lg px-3 py-2 text-text-primary outline-none">
                  <option value="">Select Member</option>
                  {team.filter(m => m.role === 'member').map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 btn btn-secondary">Cancel</button>
                <button type="submit" disabled={loading} className="flex-1 btn btn-primary">{loading ? 'Creating...' : 'Create Task'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;
