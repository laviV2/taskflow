import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore, api } from '../store/useStore';
import { Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('demo@example.com');
  const [password, setPassword] = useState('password');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { setUser } = useStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await api.post('/auth/login', { email, password });
      setUser(res.data.user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-primary">
      {/* Left side - Brand/Animation */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden items-center justify-center border-r border-bordercolor bg-secondary/50">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.1)_0%,transparent_50%)]" />
        
        {/* Floating shapes (CSS only) */}
        <div className="absolute w-64 h-64 bg-accent-primary/20 rounded-full blur-3xl top-1/4 left-1/4 animate-pulse" />
        <div className="absolute w-64 h-64 bg-accent-secondary/20 rounded-full blur-3xl bottom-1/4 right-1/4 animate-pulse delay-1000" />
        
        <div className="z-10 text-center px-12">
          <h1 className="text-5xl font-display font-bold text-text-primary mb-6 tracking-tight">
            Manage tasks at <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-primary to-accent-secondary">warp speed.</span>
          </h1>
          <p className="text-lg text-text-muted max-w-md mx-auto">
            TaskFlow brings mission-control efficiency to your team's workflow.
          </p>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8 relative">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-display font-bold text-text-primary">Welcome back</h2>
            <p className="text-text-muted mt-2">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 mt-8">
            {error && (
              <div className="p-3 bg-accent-danger/10 border border-accent-danger/50 text-accent-danger rounded-lg text-sm animate-[shake_0.5s_ease-in-out]">
                {error}
              </div>
            )}
            
            <div className="space-y-4">
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
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn btn-primary py-3"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : (
                <>Sign in <ArrowRight size={18} className="ml-2" /></>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-text-muted">
            Don't have an account?{' '}
            <Link to="/signup" className="text-accent-primary hover:text-accent-secondary transition-colors font-medium">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
