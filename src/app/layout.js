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
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) {
        store.setUserId(u.id);
        if (typeof window !== 'undefined') localStorage.setItem('suvidha_auth_user_id', u.id);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) {
        store.setUserId(u.id);
        if (typeof window !== 'undefined') localStorage.setItem('suvidha_auth_user_id', u.id);
      }
      setLoading(false);
    });

    setNotifications(store.getNotifications());
    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    if (confirm('Are you sure you want to sign out from Suvidha CRM?')) {
      await supabase.auth.signOut();
      if (typeof window !== 'undefined') localStorage.removeItem('suvidha_auth_user_id');
      setUser(null);
    }
  };

  const handleToggleNotif = () => {
    setShowNotifDropdown(!showNotifDropdown);
    if (!showNotifDropdown) {
      store.markNotificationsRead();
      setNotifications(store.getNotifications());
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const companyTitle = user?.user_metadata?.company_name || user?.email?.split('@')[0] || "Sarvan's Workspace";

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
        <div className={`app-container ${isSidebarCollapsed ? 'collapsed' : ''}`}>
          {/* Collapsible Sidebar */}
          <aside className={`sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}>
            <div className="flex justify-between items-center mb-4">
              <div className="sidebar-logo" style={{ margin: 0, padding: 0 }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg, #10b981, #3b82f6)', display: 'inline-block', flexShrink: 0 }}></div>
                {!isSidebarCollapsed && <span>Suvidha AI</span>}
              </div>
              
              <button 
                className="sidebar-toggle-btn"
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                title={isSidebarCollapsed ? "Expand Menu" : "Collapse Menu"}
                style={{ fontSize: '0.85rem' }}
              >
                {isSidebarCollapsed ? '▶' : '◀'}
              </button>
            </div>

            {!isSidebarCollapsed && (
              <div style={{ padding: '0 0 1rem 0', borderBottom: '1px solid var(--border-light)', marginBottom: '1.25rem', fontSize: '0.75rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                Workspace: <strong style={{ color: 'var(--text-primary)' }}>{companyTitle}</strong>
              </div>
            )}

            <nav style={{ flex: 1, overflowY: 'auto' }}>
              {!isSidebarCollapsed && <div className="nav-section-title">MAIN</div>}
              <ul className="nav-links">
                <li>
                  <Link href="/" className="nav-item">
                    <span>🏠</span> {!isSidebarCollapsed && <span>Overview & Studio</span>}
                  </Link>
                </li>
                <li>
                  <Link href="/webcall" className="nav-item">
                    <span>🌐</span> {!isSidebarCollapsed && <span>Instant Web Call (Free)</span>}
                  </Link>
                </li>
              </ul>

              {!isSidebarCollapsed && <div className="nav-section-title" style={{ marginTop: '1.25rem' }}>BUILD & CAMPAIGNS</div>}
              <ul className="nav-links">
                <li>
                  <Link href="/assistants" className="nav-item">
                    <span>🤖</span> {!isSidebarCollapsed && <span>Voice Agents</span>}
                  </Link>
                </li>
                <li>
                  <Link href="/campaigns" className="nav-item">
                    <span>🎯</span> {!isSidebarCollapsed && <span>Campaigns & Bulk Dialer</span>}
                  </Link>
                </li>
                <li>
                  <Link href="/contacts" className="nav-item">
                    <span>👥</span> {!isSidebarCollapsed && <span>Lead Lists & CSV</span>}
                  </Link>
                </li>
              </ul>

              {!isSidebarCollapsed && <div className="nav-section-title" style={{ marginTop: '1.25rem' }}>AUTOMATION & WHATSAPP</div>}
              <ul className="nav-links">
                <li>
                  <Link href="/whatsapp" className="nav-item" style={{ color: 'var(--accent-green)' }}>
                    <span>💬</span> {!isSidebarCollapsed && <span>WhatsApp Automation</span>}
                  </Link>
                </li>
                <li>
                  <Link href="/settings" className="nav-item">
                    <span>⚙️</span> {!isSidebarCollapsed && <span>Telephony Settings</span>}
                  </Link>
                </li>
                <li>
                  <Link href="/followups" className="nav-item">
                    <span>🗓️</span> {!isSidebarCollapsed && <span>AI Follow-up Queue</span>}
                  </Link>
                </li>
              </ul>

              {!isSidebarCollapsed && <div className="nav-section-title" style={{ marginTop: '1.25rem' }}>MONITOR & RECORDINGS</div>}
              <ul className="nav-links">
                <li>
                  <Link href="/calls" className="nav-item">
                    <span>🎙️</span> {!isSidebarCollapsed && <span>Call Transcripts & Audio</span>}
                  </Link>
                </li>
                <li>
                  <Link href="/analytics" className="nav-item">
                    <span>📈</span> {!isSidebarCollapsed && <span>Analytics</span>}
                  </Link>
                </li>
                <li>
                  <Link href="/guide" className="nav-item">
                    <span>📖</span> {!isSidebarCollapsed && <span>Setup Guide</span>}
                  </Link>
                </li>
              </ul>
            </nav>

            {/* User Profile & Sign Out Footer */}
            <div style={{ borderTop: '1px solid var(--border-light)', padding: '1rem 0.5rem 0', marginTop: 'auto' }}>
              <div className="flex justify-between items-center">
                {!isSidebarCollapsed && (
                  <div style={{ overflow: 'hidden', marginRight: '0.5rem' }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: '600', color: '#fff', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                      {user?.email}
                    </div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--accent-green)' }}>
                      🟢 Active
                    </div>
                  </div>
                )}
                <button 
                  onClick={handleLogout}
                  title="Sign Out"
                  className="btn btn-secondary"
                  style={{ padding: '0.35rem 0.55rem', fontSize: '0.75rem', flexShrink: 0 }}
                >
                  🚪 {!isSidebarCollapsed && 'Sign Out'}
                </button>
              </div>
            </div>
          </aside>

          {/* Main App Content Area */}
          <div className={`content-area`}>
            {/* Top Navigation Bar */}
            <header className="topbar">
              <div className="topbar-left">
                <button 
                  className="sidebar-toggle-btn"
                  onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                  title="Toggle Sidebar Slide"
                >
                  ☰
                </button>
                <div className="topbar-chip">
                  <span style={{ fontSize: '0.75rem' }}>🎙️ Suvidha Voice v1.50</span>
                </div>
                <div className="topbar-status">
                  <span className="pulse-dot"></span>
                  <span>Vobiz + Gemini + WhatsApp Engine Active</span>
                </div>
              </div>

              <div className="topbar-right">
                <Link href="/whatsapp" className="btn btn-secondary" style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem', borderColor: 'var(--accent-green)', color: 'var(--accent-green)' }}>
                  💬 WhatsApp Active
                </Link>

                {/* Notification Dropdown */}
                <div style={{ position: 'relative' }}>
                  <button 
                    onClick={handleToggleNotif}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', position: 'relative', fontSize: '1.25rem' }}
                  >
                    🔔
                    {unreadCount > 0 && (
                      <span style={{ position: 'absolute', top: '-4px', right: '-4px', background: 'var(--accent-red)', color: '#fff', fontSize: '0.65rem', padding: '1px 5px', borderRadius: '10px', fontWeight: 'bold' }}>
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {showNotifDropdown && (
                    <div className="card" style={{ position: 'absolute', right: 0, top: '40px', width: '320px', padding: '1rem', zIndex: 1000, boxShadow: '0 10px 25px rgba(0,0,0,0.5)', background: '#12121a' }}>
                      <div className="flex justify-between items-center mb-3">
                        <span style={{ fontWeight: 'bold', fontSize: '0.875rem' }}>Notifications</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Realtime Alerts</span>
                      </div>
                      <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
                        {notifications.map(n => (
                          <div key={n.id} style={{ padding: '0.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '0.8125rem' }}>
                            <div style={{ fontWeight: '600', color: 'var(--accent-green)' }}>{n.title}</div>
                            <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>{n.message}</div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.65rem', marginTop: '2px' }}>{n.time}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </header>

            {/* Page Router Body */}
            <main className={`main-content ${isSidebarCollapsed ? 'collapsed' : ''}`}>
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
