export default function ProgressChart({ data }: { data: number[] }) {
  const max = Math.max(...data, 100);
  return <div className="progress-bars">{data.map((value, index) => <div key={index} className="bar" style={{ height:`${Math.max(12, (value / max) * 100)}%` }}><span>{value}</span></div>)}</div>;
}
