'use client';

type Props = { values: number[]; label?: string };

export default function ProgressChart({ values, label }: Props) {
  if (!values || values.length === 0) {
    return (
      <div className="chart-bars" style={{ justifyContent: 'center', alignItems: 'center' }}>
        <p className="muted" style={{ fontSize: '0.85rem' }}>No data yet — complete your first workout!</p>
      </div>
    );
  }

  const max = Math.max(...values, 1);
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  return (
    <div>
      <div className="chart-bars">
        {values.map((v, i) => (
          <div
            key={i}
            className="chart-bar"
            style={{ height: `${Math.max((v / max) * 100, 4)}%` }}
            title={`${label || 'Value'}: ${v}`}
          />
        ))}
      </div>
      {values.length <= 7 && (
        <div style={{ display: 'flex', gap: '0.7rem', paddingTop: '0.5rem' }}>
          {values.map((_, i) => (
            <div key={i} style={{ flex: 1, textAlign: 'center', color: 'var(--t3)', fontSize: '0.7rem' }}>
              {days[i % 7]}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
