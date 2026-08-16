'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function AuthPage() {
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'signup' | 'forgot'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [signupCount, setSignupCount] = useState(0);
  const router = useRouter();

  const MAX_SIGNUPS = 2;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const count = parseInt(localStorage.getItem('suvidha_device_signup_count') || '0', 10);
      setSignupCount(count);
    }
  }, []);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      // 1. FORGOT PASSWORD FLOW
      if (authMode === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/auth?mode=reset` : undefined,
        });

        if (error) throw error;

        setSuccessMsg(`📬 Password reset link sent to ${email}! Please check your email inbox.`);
        return;
      }

      // 2. SIGN UP FLOW (WITH 2-ACCOUNT DEVICE LIMIT & SAFE METADATA STORAGE)
      if (authMode === 'signup') {
        if (signupCount >= MAX_SIGNUPS) {
          throw new Error(`🚫 Device Signup Limit Reached! A maximum of ${MAX_SIGNUPS} trial accounts can be created from this device. Please log in to your existing account.`);
        }

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              company_name: companyName || 'My Business Team',
            }
          }
        });

        if (error) throw error;

        if (data.user) {
          // Increment device signup counter
          const newCount = signupCount + 1;
          setSignupCount(newCount);
          if (typeof window !== 'undefined') {
            localStorage.setItem('suvidha_device_signup_count', newCount.toString());
            localStorage.setItem('suvidha_auth_user_id', data.user.id);
            localStorage.setItem('suvidha_client_company', companyName || 'My Business Team');
          }

          setSuccessMsg('🎉 Account created successfully! Logging you in...');
          
          // Auto sign-in if session was created
          if (data.session) {
            setTimeout(() => {
              router.push('/');
              router.refresh();
            }, 800);
          } else {
            setSuccessMsg('🎉 Signup successful! If email verification is enabled, please check your inbox, or click Log In.');
            setTimeout(() => {
              setAuthMode('login');
            }, 1500);
          }
        }
      } 
      // 3. SIGN IN FLOW
      else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        if (data?.user && typeof window !== 'undefined') {
          localStorage.setItem('suvidha_auth_user_id', data.user.id);
          const metaCompany = data.user.user_metadata?.company_name;
          if (metaCompany) localStorage.setItem('suvidha_client_company', metaCompany);
        }

        // Redirect to dashboard
        router.push('/');
        router.refresh();
      }
    } catch (err) {
      console.error('Auth error:', err);
      setErrorMsg(err.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '85vh',
    }}>
      <div className="card" style={{ width: '100%', maxWidth: '440px', padding: '2.5rem', background: '#0e0e14' }}>
        
        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, #10b981, #3b82f6)', margin: '0 auto 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
            🎙️
          </div>
          <h2 style={{ margin: '0 0 0.5rem 0', background: 'linear-gradient(to right, var(--accent-blue), var(--accent-green))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontSize: '1.5rem' }}>
            {authMode === 'signup' ? 'Create Suvidha Account' : authMode === 'forgot' ? 'Reset Password' : 'Login to Suvidha CRM'}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>
            {authMode === 'signup' ? 'Start your AI voice calling sales team' : authMode === 'forgot' ? 'Enter your email to receive recovery instructions' : 'Access your isolated multi-tenant voice workspace'}
          </p>
        </div>

        {errorMsg && (
          <div style={{ color: 'var(--accent-red)', background: 'rgba(239, 68, 68, 0.1)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(239, 68, 68, 0.2)', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div style={{ color: 'var(--accent-green)', background: 'rgba(16, 185, 129, 0.1)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(16, 185, 129, 0.2)', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
            {successMsg}
          </div>
        )}

        {/* Signup Limit Counter Alert */}
        {authMode === 'signup' && (
          <div style={{ background: signupCount >= MAX_SIGNUPS ? 'rgba(239,68,68,0.1)' : 'rgba(59,130,246,0.08)', padding: '0.6rem 0.85rem', borderRadius: '6px', marginBottom: '1.25rem', fontSize: '0.75rem', color: signupCount >= MAX_SIGNUPS ? 'var(--accent-red)' : 'var(--accent-blue)', border: '1px solid rgba(255,255,255,0.08)' }}>
            🛡️ <strong>Device Limit:</strong> {signupCount} of {MAX_SIGNUPS} trial accounts created on this device.
          </div>
        )}

        <form onSubmit={handleAuth}>
          {authMode === 'signup' && (
            <div className="form-group mb-4">
              <label>Company / Organization Name</label>
              <input 
                required 
                type="text" 
                className="form-control" 
                placeholder="e.g. Acme Real Estate / Suvidha Loans" 
                value={companyName} 
                onChange={e => setCompanyName(e.target.value)} 
              />
            </div>
          )}
          
          <div className="form-group mb-4">
            <label>Work Email Address</label>
            <input 
              required 
              type="email" 
              className="form-control" 
              placeholder="you@company.com" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
            />
          </div>

          {authMode !== 'forgot' && (
            <div className="form-group mb-4">
              <div className="flex justify-between items-center mb-1">
                <label style={{ margin: 0 }}>Password</label>
                {authMode === 'login' && (
                  <button 
                    type="button" 
                    onClick={() => { setAuthMode('forgot'); setErrorMsg(''); setSuccessMsg(''); }}
                    style={{ background: 'none', border: 'none', color: 'var(--accent-blue)', fontSize: '0.75rem', cursor: 'pointer', padding: 0 }}
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div style={{ position: 'relative' }}>
                <input 
                  required 
                  type={showPassword ? 'text' : 'password'} 
                  className="form-control" 
                  placeholder="••••••••" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '0.85rem' }}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>
          )}

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', padding: '0.85rem', marginTop: '0.5rem', fontWeight: '600' }} 
            disabled={loading || (authMode === 'signup' && signupCount >= MAX_SIGNUPS)}
          >
            {loading ? 'Processing...' : authMode === 'signup' ? '🚀 Create Free Account' : authMode === 'forgot' ? '📬 Send Reset Link' : '🔑 Log In to Workspace'}
          </button>
        </form>

        {/* Auth Mode Switchers */}
        <div style={{ marginTop: '1.75rem', textAlign: 'center', fontSize: '0.85rem', borderTop: '1px solid var(--border-light)', paddingTop: '1.25rem' }}>
          {authMode === 'forgot' ? (
            <button 
              type="button" 
              style={{ background: 'none', border: 'none', color: 'var(--accent-blue)', cursor: 'pointer', fontWeight: 600 }}
              onClick={() => { setAuthMode('login'); setErrorMsg(''); setSuccessMsg(''); }}
            >
              ← Back to Login
            </button>
          ) : authMode === 'signup' ? (
            <div>
              <span style={{ color: 'var(--text-secondary)' }}>Already have an account? </span>
              <button 
                type="button" 
                style={{ background: 'none', border: 'none', color: 'var(--accent-blue)', cursor: 'pointer', fontWeight: 600 }}
                onClick={() => { setAuthMode('login'); setErrorMsg(''); setSuccessMsg(''); }}
              >
                Log In
              </button>
            </div>
          ) : (
            <div>
              <span style={{ color: 'var(--text-secondary)' }}>Don't have an account? </span>
              <button 
                type="button" 
                style={{ background: 'none', border: 'none', color: 'var(--accent-green)', cursor: 'pointer', fontWeight: 600 }}
                onClick={() => { setAuthMode('signup'); setErrorMsg(''); setSuccessMsg(''); }}
              >
                Sign Up Free (Trial)
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
