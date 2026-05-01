import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore, api } from '../store/useStore';
import { Mail, Lock, User, Shield, Users, ArrowRight, Loader2 } from 'lucide-react';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'member'>('member');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await api.post('/auth/signup', { name, email, password, role });
      setUser(res.data.user);
      navigate('/dashboard');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to sign up');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-primary">
      <div className="hidden lg:flex flex-1 relative overflow-hidden items-center justify-center border-r border-bordercolor bg-secondary/50">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.1)_0%,transparent_50%)]" />
        <div className="z-10 text-center px-12">
          <h1 className="text-5xl font-display font-bold text-text-primary mb-6 tracking-tight">
            Join the <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-secondary to-accent-primary">future</span> of work.
          </h1>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div>
            <h2 className="text-3xl font-display font-bold text-text-primary">Create an account</h2>
            <p className="text-text-muted mt-2">Start managing tasks efficiently</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 mt-8">
            <div>
              <label className="block text-sm font-medium text-text-muted mb-1.5">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full bg-card border border-bordercolor rounded-lg pl-10 pr-4 py-2.5 text-text-primary focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary transition-all"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-muted mb-1.5">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-card border border-bordercolor rounded-lg pl-10 pr-4 py-2.5 text-text-primary focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary transition-all"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-muted mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-card border border-bordercolor rounded-lg pl-10 pr-4 py-2.5 text-text-primary focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-muted mb-3">Select Role</label>
              <div className="grid grid-cols-2 gap-4">
                <label className={`cursor-pointer border rounded-xl p-4 flex flex-col items-center gap-2 transition-all ${role === 'admin' ? 'border-accent-primary bg-accent-primary/10' : 'border-bordercolor bg-card hover:bg-secondary'}`}>
                  <input type="radio" name="role" value="admin" checked={role === 'admin'} onChange={() => setRole('admin')} className="sr-only" />
                  <Shield className={role === 'admin' ? 'text-accent-primary' : 'text-text-muted'} size={24} />
                  <span className={`font-medium ${role === 'admin' ? 'text-text-primary' : 'text-text-muted'}`}>Admin</span>
                </label>
                <label className={`cursor-pointer border rounded-xl p-4 flex flex-col items-center gap-2 transition-all ${role === 'member' ? 'border-accent-secondary bg-accent-secondary/10' : 'border-bordercolor bg-card hover:bg-secondary'}`}>
                  <input type="radio" name="role" value="member" checked={role === 'member'} onChange={() => setRole('member')} className="sr-only" />
                  <Users className={role === 'member' ? 'text-accent-secondary' : 'text-text-muted'} size={24} />
                  <span className={`font-medium ${role === 'member' ? 'text-text-primary' : 'text-text-muted'}`}>Member</span>
                </label>
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full btn btn-primary py-3 mt-4">
              {loading ? <Loader2 className="animate-spin" size={20} /> : (
                <>Create Account <ArrowRight size={18} className="ml-2" /></>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-text-muted">
            Already have an account?{' '}
            <Link to="/login" className="text-accent-primary hover:text-accent-secondary transition-colors font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
