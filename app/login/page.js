'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { 
  Zap, 
  AlertCircle, 
  Mail, 
  Key, 
  Eye, 
  EyeOff, 
  ArrowRight 
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { showToast } = useToast();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError('Please fill in all fields.');
      showToast('Please fill in all fields', 'warning');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { data } = await login(form.email, form.password);
      // redirect depending on role
      if (data.user?.role === 'marketing') {
        router.push('/marketing');
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please try again.';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-bg-orb auth-bg-orb-1" />
      <div className="auth-bg-orb auth-bg-orb-2" />

      <div className="auth-card">
        {/* Logo */}
        <div className="auth-logo">
          <div className="auth-logo-icon">
            <Zap className="w-6 h-6 text-indigo-500" />
          </div>
          <span className="auth-logo-text">NexaApp</span>
        </div>

        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-subtitle">Sign in to your account to continue</p>

        {/* Error Alert */}
        {error && (
          <div className="alert alert-error">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Email */}
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email address</label>
            <div className="input-wrapper">
              <Mail className="input-icon w-4 h-4 text-indigo-400" />
              <input
                id="email"
                type="email"
                name="email"
                className="form-input with-icon"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
                disabled={loading}
              />
            </div>
          </div>

          {/* Password */}
          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <div className="input-wrapper">
              <Key className="input-icon w-4 h-4 text-yellow-500" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                className="form-input with-icon"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                autoComplete="current-password"
                disabled={loading}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((v) => !v)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-5 h-5 text-slate-400" /> : <Eye className="w-5 h-5 text-slate-400" />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? (
              <>
                <div className="spinner" />
                Signing in...
              </>
            ) : (
              'Sign in'
            )}
            {!loading && <ArrowRight className="w-4 h-4 ml-2" />}
          </button>
        </form>

        <div className="auth-footer">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="auth-link">
            Create one for free
          </Link>
        </div>
      </div>
    </div>
  );
}
