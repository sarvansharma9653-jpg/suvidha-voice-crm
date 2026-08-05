'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const router = useRouter();

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      if (isSignUp) {
        // Sign Up Flow
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) throw error;

        if (data.user) {
          // Insert profile details
          const { error: profileError } = await supabase
            .from('profiles')
            .insert([{ id: data.user.id, company_name: companyName }]);

          if (profileError) throw profileError;

          setSuccessMsg('🎉 Signup successful! Please check your email to verify your account.');
          setIsSignUp(false);
        }
      } else {
        // Sign In Flow
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        // Redirect to dashboard
        router.push('/');
        router.refresh();
      }
    } catch (err) {
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
      minHeight: '80vh',
    }}>
      <div className="card" style={{ width: '100%', maxWidth: '420px', padding: '2.5rem' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '0.5rem', background: 'linear-gradient(to right, var(--accent-blue), var(--accent-purple))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          {isSignUp ? 'Create Suvidha Account' : 'Welcome to Suvidha'}
        </h2>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '2rem' }}>
          {isSignUp ? 'Start building your own AI voice calling team' : 'Log in to manage your outbound voice calling agents'}
        </p>

        {errorMsg && (
          <div style={{ color: 'var(--accent-red)', background: 'rgba(239, 68, 68, 0.1)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(239, 68, 68, 0.2)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div style={{ color: 'var(--accent-green)', background: 'rgba(16, 185, 129, 0.1)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(16, 185, 129, 0.2)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
            {successMsg}
          </div>
        )}

        <form onSubmit={handleAuth}>
          {isSignUp && (
            <div className="form-group">
              <label>Company / Organization Name</label>
              <input required type="text" className="form-control" placeholder="e.g. Suvidha Services Ltd" value={companyName} onChange={e => setCompanyName(e.target.value)} />
            </div>
          )}
          
          <div className="form-group">
            <label>Email Address</label>
            <input required type="email" className="form-control" placeholder="you@company.com" value={email} onChange={e => setEmail(e.target.value)} />
          </div>

          <div className="form-group" style={{ marginBottom: '2rem' }}>
            <label>Password</label>
            <input required type="password" className="form-control" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.75rem' }} disabled={loading}>
            {loading ? 'Processing...' : isSignUp ? '🚀 Sign Up' : '🔑 Log In'}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem' }}>
          <span style={{ color: 'var(--text-secondary)' }}>
            {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
          </span>
          <button 
            type="button" 
            style={{ background: 'none', border: 'none', color: 'var(--accent-blue)', cursor: 'pointer', fontWeight: 600, padding: 0 }}
            onClick={() => setIsSignUp(!isSignUp)}
          >
            {isSignUp ? 'Log In' : 'Sign Up Free'}
          </button>
        </div>
      </div>
    </div>
  );
}
