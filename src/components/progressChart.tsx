export default function ProgressChart({ values = [] }: { values?: number[] }) {
  const max = Math.max(...values, 1);
  return <div className="chart-bars">{values.map((v, i) => <div key={i} className="chart-bar" title={`${v}`} style={{ height: `${Math.max(8, (v / max) * 100)}%` }} />)}</div>;
}
