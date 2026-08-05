import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Suvidha - AI Outbound Calling Agent",
  description: "Suvidha - Premium CRM dashboard for AI outbound calling agents",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="app-container">
          <aside className="sidebar">
            <div className="sidebar-logo">
              🤖 Suvidha CRM Dashboard
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
                  <Link href="/analytics" className="nav-item">
                    📈 Analytics
                  </Link>
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
