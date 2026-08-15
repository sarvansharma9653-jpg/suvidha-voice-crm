'use client';
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { store } from "@/lib/store";
import AuthPage from "./auth/page";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

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

    // Load Notifications
    setNotifications(store.getNotifications());

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const handleToggleNotif = () => {
    setShowNotifDropdown(!showNotifDropdown);
    if (!showNotifDropdown) {
      store.markNotificationsRead();
      setNotifications(store.getNotifications());
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) {
    return (
      <html lang="en">
        <body className={inter.className} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#0a0a0f', color: '#fff' }}>
          <div>Loading Suvidha Voice CRM...</div>
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
              🤖 Suvidha Voice CRM
            </div>
            
            <div style={{ padding: '0 1rem 1rem 1.5rem', borderBottom: '1px solid var(--border-light)', marginBottom: '1.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              👤 Client Account: <strong style={{ color: 'var(--accent-blue)' }}>{user.email}</strong>
            </div>

            <nav>
              <ul className="nav-links">
                <li>
                  <Link href="/" className="nav-item">
                    📊 Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/contacts" className="nav-item">
                    👥 Contacts & CSV
                  </Link>
                </li>
                <li>
                  <Link href="/campaigns" className="nav-item">
                    🎯 AI Auto-Campaigns
                  </Link>
                </li>
                <li>
                  <Link href="/followups" className="nav-item">
                    📅 AI Follow-ups
                  </Link>
                </li>
                <li>
                  <Link href="/calls" className="nav-item">
                    📞 Call Transcripts
                  </Link>
                </li>
                <li>
                  <Link href="/analytics" className="nav-item">
                    📈 Analytics
                  </Link>
                </li>
                <li>
                  <Link href="/settings" className="nav-item">
                    ⚙️ Telephony Settings
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

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            {/* Top Bar with Real-Time Notification Bell & Onboarding Banner */}
            <header className="top-header">
              <div className="onboarding-steps flex items-center gap-4">
                <span className="step-pill">1. ⚙️ Connect Telephony</span>
                <span className="step-arrow">➔</span>
                <span className="step-pill">2. 👥 Upload Leads (CSV)</span>
                <span className="step-arrow">➔</span>
                <span className="step-pill active">3. 🚀 Launch Auto-Campaign</span>
              </div>

              {/* Notification Bell */}
              <div style={{ position: 'relative' }}>
                <button className="notif-btn" onClick={handleToggleNotif}>
                  🔔
                  {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
                </button>

                {showNotifDropdown && (
                  <div className="notif-dropdown">
                    <div className="notif-dropdown-header">
                      <span>🔥 Instant Hot Lead Alerts</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{notifications.length} alerts</span>
                    </div>
                    <div className="notif-list">
                      {notifications.length === 0 ? (
                        <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                          No alerts yet
                        </div>
                      ) : (
                        notifications.map(n => (
                          <div key={n.id} className={`notif-item ${n.type === 'hot_lead' ? 'hot' : ''}`}>
                            <div className="notif-item-title">{n.title}</div>
                            <div className="notif-item-msg">{n.message}</div>
                            <div className="notif-item-time">{n.time}</div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </header>

            <main className="main-content" style={{ marginLeft: 0 }}>
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
