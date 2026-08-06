'use client';
import { useEffect, useState } from 'react';
import { store } from '@/lib/store';

export default function AnalyticsPage() {
  const [stats, setStats] = useState({ totalCalls: 0, totalDuration: 0 });

  useEffect(() => {
    const calls = store.getCalls();
    setStats({
      totalCalls: calls.length,
      totalDuration: calls.reduce((a, c) => a + c.duration, 0)
    });
  }, []);

  const formatDuration = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  // Pricing calculator (₹2.50/minute for direct APIs)
  const totalMinutes = stats.totalDuration / 60;
  const estimatedCost = Math.round(totalMinutes * 2.50);
  // Savings compared to Vapi/Retell (which cost approx ₹16.50/minute)
  const estimatedSavings = Math.round(totalMinutes * (16.50 - 2.50));

  return (
    <div>
      <div className="mb-8">
        <h1>📈 Performance Analytics & Billing</h1>
        <p className="subtitle">Real-time cost savings and call performance metrics</p>
      </div>

      <div className="stats-grid mb-8" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        <div className="card">
          <div className="stat-header"><span>Total Calls</span><span>📊</span></div>
          <div className="stat-value">{stats.totalCalls}</div>
          <div className="stat-trend trend-up">↑ 100% active</div>
        </div>
        <div className="card">
          <div className="stat-header"><span>Total Talk Time</span><span>⏱️</span></div>
          <div className="stat-value">{formatDuration(stats.totalDuration)}</div>
          <div className="stat-trend trend-up">↑ {Math.round(totalMinutes)} mins total</div>
        </div>
        <div className="card" style={{ borderColor: 'var(--accent-green)' }}>
          <div className="stat-header"><span style={{ color: 'var(--accent-green)' }}>API Spend (Est.)</span><span>💰</span></div>
          <div className="stat-value" style={{ color: 'var(--accent-green)' }}>₹{estimatedCost}</div>
          <div className="stat-trend trend-up">At ₹2.50 / min rate</div>
        </div>
        <div className="card" style={{ borderColor: 'var(--accent-purple)' }}>
          <div className="stat-header"><span style={{ color: 'var(--accent-purple)' }}>Cost Savings (Vapi Clone)</span><span>⚡</span></div>
          <div className="stat-value" style={{ color: 'var(--accent-purple)' }}>₹{estimatedSavings}</div>
          <div className="stat-trend trend-up" style={{ color: 'var(--accent-purple)' }}>Saved 85% vs Vapi!</div>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="card" style={{flex: 2}}>
          <h2>Call Volume (Last 7 Days)</h2>
          <div className="bar-chart">
            {[45, 60, 30, 80, 55, 90, 65].map((val, i) => (
              <div className="bar-col" key={i}>
                <div className="bar" style={{height: `${val}%`}}></div>
                <span className="bar-label">Day {i+1}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="card" style={{flex: 1}}>
          <h2>Call Outcomes</h2>
          <div className="pie-chart"></div>
          <div className="pie-legend">
            <div className="legend-item"><div className="legend-dot dot-green"></div>Interested</div>
            <div className="legend-item"><div className="legend-dot dot-red"></div>Not Int.</div>
            <div className="legend-item"><div className="legend-dot dot-orange"></div>No Ans</div>
            <div className="legend-item"><div className="legend-dot dot-blue"></div>Voicemail</div>
          </div>
        </div>
      </div>
    </div>
  );
}
