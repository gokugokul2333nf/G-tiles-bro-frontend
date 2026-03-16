'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { 
  Zap, 
  AlertCircle, 
  User, 
  Mail, 
  Key, 
  Eye, 
  EyeOff, 
  Lock, 
  ArrowRight 
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const { showToast } = useToast();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      setError('Please fill in all fields.');
      showToast('Please fill in all fields', 'warning');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      showToast('Password must be at least 6 characters', 'warning');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      showToast('Passwords do not match', 'warning');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await register(form.name, form.email, form.password);
      showToast('Account created successfully!', 'success');
      router.push('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = () => {
    const { password } = form;
    if (!password) return null;
    if (password.length < 6) return { label: 'Too short', color: '#ef4444', width: '20%' };
    if (password.length < 8) return { label: 'Weak', color: '#f59e0b', width: '40%' };
    if (!/[A-Z]/.test(password) || !/[0-9]/.test(password)) return { label: 'Fair', color: '#3b82f6', width: '65%' };
    return { label: 'Strong', color: '#10b981', width: '100%' };
  };

  const strength = getPasswordStrength();

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
          <span className="auth-logo-text">The Tiles Bro</span>
        </div>

        <h1 className="auth-title">Create your account</h1>
        <p className="auth-subtitle">Join thousands of users on The Tiles Bro</p>

        {/* Error Alert */}
        {error && (
          <div className="alert alert-error">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Name */}
          <div className="form-group">
            <label className="form-label" htmlFor="name">Full name</label>
            <div className="input-wrapper">
              <User className="input-icon w-4 h-4 text-purple-400" />
              <input
                id="name"
                type="text"
                name="name"
                className="form-input with-icon"
                placeholder="John Doe"
                value={form.name}
                onChange={handleChange}
                autoComplete="name"
                disabled={loading}
              />
            </div>
          </div>

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
                placeholder="Min. 6 characters"
                value={form.password}
                onChange={handleChange}
                autoComplete="new-password"
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
            {/* Password strength bar */}
            {strength && (
              <div style={{ marginTop: '8px' }}>
                <div style={{ height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: strength.width, height: '100%', background: strength.color, borderRadius: '4px', transition: 'all 0.3s ease' }} />
                </div>
                <span style={{ fontSize: '11px', color: strength.color, marginTop: '4px', display: 'block' }}>
                  {strength.label}
                </span>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="form-group">
            <label className="form-label" htmlFor="confirmPassword">Confirm password</label>
            <div className="input-wrapper">
              <Lock className="input-icon w-4 h-4 text-blue-400" />
              <input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                name="confirmPassword"
                className={`form-input with-icon ${form.confirmPassword && form.confirmPassword !== form.password ? 'error' : ''}`}
                placeholder="Repeat your password"
                value={form.confirmPassword}
                onChange={handleChange}
                autoComplete="new-password"
                disabled={loading}
              />
            </div>
          </div>

          {/* Submit */}
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? (
              <>
                <div className="spinner" />
                Creating account...
              </>
            ) : (
              'Create account'
            )}
            {!loading && <ArrowRight className="w-4 h-4 ml-2" />}
          </button>
        </form>

        <div className="auth-footer" style={{ marginTop: '16px', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px' }}>
          By signing up, you agree to our Terms of Service and Privacy Policy.
        </div>

        <div className="auth-footer">
          Already have an account?{' '}
          <Link href="/login" className="auth-link">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
