
'use client';
// src/components/progressChart.tsx

interface ProgressChartProps {
  data: number[];
  labels?: string[];
  title?: string;
  color?: string;
  height?: number;
}

export default function ProgressChart({
  data,
  labels,
  title,
  color = 'var(--Au)',
  height = 120,
}: ProgressChartProps) {
  if (!data.length) return null;

  const max = Math.max(...data, 1);
  const points = data.map((v, i) => ({
    x: (i / (data.length - 1)) * 100,
    y: 100 - (v / max) * 80, // keep some bottom margin
  }));

  const polyline = points.map(p => `${p.x},${p.y}`).join(' ');
  const fillPath = `M ${points.map(p => `${p.x},${p.y}`).join(' L ')} L ${points[points.length - 1].x},100 L ${points[0].x},100 Z`;

  return (
    <div style={{ width: '100%' }}>
      {title && (
        <div style={{ fontFamily: 'var(--f-display)', fontSize: '.65rem', color: 'var(--t2)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: '.75rem' }}>
          {title}
        </div>
      )}
      <svg viewBox={`0 0 100 100`} preserveAspectRatio="none" style={{ width: '100%', height, display: 'block' }}>
        <defs>
          <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.3"/>
            <stop offset="100%" stopColor={color} stopOpacity="0"/>
          </linearGradient>
        </defs>
        {/* Grid lines */}
        {[25, 50, 75].map(y => (
          <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="rgba(255,255,255,0.04)" strokeWidth="0.5"/>
        ))}
        {/* Fill area */}
        <path d={fillPath} fill="url(#chartFill)"/>
        {/* Line */}
        <polyline points={polyline} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        {/* Data points */}
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="2" fill={color} opacity="0.8"/>
        ))}
      </svg>
      {labels && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '.5rem' }}>
          {labels.map((l, i) => (
            <span key={i} style={{ fontFamily: 'var(--f-mono)', fontSize: '.62rem', color: 'var(--t3)', letterSpacing: '.04em' }}>{l}</span>
          ))}
        </div>
      )}
    </div>
  );
}
