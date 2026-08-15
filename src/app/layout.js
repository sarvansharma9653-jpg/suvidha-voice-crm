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
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

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
          <div>Loading Suvidha Voice Platform...</div>
        </body>
      </html>
    );
  }

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
          {/* Dograh & Sarvam AI Style Categorized Sidebar */}
          <aside className="sidebar">
            <div className="sidebar-logo">
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg, #10b981, #3b82f6)', display: 'inline-block' }}></div>
              Suvidha AI
            </div>

            <div style={{ padding: '0 1rem 1rem 1.25rem', borderBottom: '1px solid var(--border-light)', marginBottom: '1.25rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Team: <strong style={{ color: 'var(--text-primary)' }}>Sarvan Sharma's Team</strong>
            </div>

            <nav style={{ flex: 1, overflowY: 'auto' }}>
              <div className="nav-section-title">MAIN</div>
              <ul className="nav-links">
                <li>
                  <Link href="/" className="nav-item">
                    🏠 Overview & Playground
                  </Link>
                </li>
              </ul>

              <div className="nav-section-title" style={{ marginTop: '1.25rem' }}>BUILD</div>
              <ul className="nav-links">
                <li>
                  <Link href="/assistants" className="nav-item">
                    🤖 Voice Agents
                  </Link>
                </li>
                <li>
                  <Link href="/campaigns" className="nav-item">
                    🎯 Campaigns
                  </Link>
                </li>
                <li>
                  <Link href="/contacts" className="nav-item">
                    👥 Lead Lists & CSV
                  </Link>
                </li>
              </ul>

              <div className="nav-section-title" style={{ marginTop: '1.25rem' }}>DEPLOY & TELEPHONY</div>
              <ul className="nav-links">
                <li>
                  <Link href="/settings" className="nav-item">
                    📞 Telephony & Numbers
                  </Link>
                </li>
                <li>
                  <Link href="/followups" className="nav-item">
                    📅 AI Follow-up Queue
                  </Link>
                </li>
              </ul>

              <div className="nav-section-title" style={{ marginTop: '1.25rem' }}>MONITOR & LOGS</div>
              <ul className="nav-links">
                <li>
                  <Link href="/calls" className="nav-item">
                    🎙️ Call Recordings & Transcripts
                  </Link>
                </li>
                <li>
                  <Link href="/analytics" className="nav-item">
                    📊 Agent Analytics
                  </Link>
                </li>
              </ul>

              <div style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid var(--border-light)' }}>
                <button 
                  onClick={handleLogout} 
                  className="nav-item" 
                  style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', color: 'var(--accent-red)' }}
                >
                  🚪 Logout
                </button>
              </div>
            </nav>
          </aside>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            {/* Top Bar with Real-Time Notification Bell & Onboarding Banner */}
            <header className="top-header">
              <div className="onboarding-steps flex items-center gap-3">
                <span className="step-pill active">🤖 Suvidha Voice Platform v1.45</span>
                <span className="step-arrow">•</span>
                <span className="step-pill">🟢 AWS Swara Engine Online</span>
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
