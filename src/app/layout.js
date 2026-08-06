'use client';
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import AuthPage from "./auth/page";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active session on load
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  if (loading) {
    return (
      <html lang="en">
        <body className={inter.className} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#0a0a0f', color: '#fff' }}>
          <div>Loading Suvidha CRM...</div>
        </body>
      </html>
    );
  }

  // FORCE LOGIN: If user is not authenticated, render the AuthPage directly
  if (!user) {
    return (
      <html lang="en">
        <body className={inter.className} style={{ background: '#0a0a0f', color: '#fff' }}>
          <main className="main-content" style={{ marginLeft: 0, padding: '2rem' }}>
            <AuthPage />
          </main>
        </body>
      </html>
    );
  }

  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="app-container">
          <aside className="sidebar">
            <div className="sidebar-logo">
              🤖 Suvidha CRM Dashboard
            </div>
            
            <div style={{ padding: '0 1rem 1rem 1.5rem', borderBottom: '1px solid var(--border-light)', marginBottom: '1.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              👤 Logged in as: <strong style={{ color: 'var(--accent-blue)' }}>{user.email}</strong>
            </div>

            <nav>
              <ul className="nav-links">
                <li>
                  <Link href="/" className="nav-item">
                    📊 Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/assistants" className="nav-item">
                    🤖 Assistants
                  </Link>
                </li>
                <li>
                  <Link href="/contacts" className="nav-item">
                    👥 Contacts
                  </Link>
                </li>
                <li>
                  <Link href="/campaigns" className="nav-item">
                    🎯 Campaigns
                  </Link>
                </li>
                <li>
                  <Link href="/calls" className="nav-item">
                    📞 Call Logs
                  </Link>
                </li>
                <li>
                  <Link href="/followups" className="nav-item">
                    📅 Follow-ups
                  </Link>
                </li>
                <li>
                  <Link href="/guide" className="nav-item">
                    📖 User Guide
                  </Link>
                </li>
                <li>
                  <Link href="/settings" className="nav-item">
                    ⚙️ Settings
                  </Link>
                </li>
                <li style={{ marginTop: '2rem' }}>
                  <button 
                    onClick={handleLogout} 
                    className="nav-item" 
                    style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', color: 'var(--accent-red)' }}
                  >
                    🚪 Logout
                  </button>
                </li>
              </ul>
            </nav>
          </aside>
          <main className="main-content">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
