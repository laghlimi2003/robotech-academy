interface Props {
  percent: number;
  size?: number;
  stroke?: number;
  color?: string;
  label?: string;
}

export default function ProgressRing({
  percent, size = 56, stroke = 5, color = "#4facfe", label,
}: Props) {
  const r = (size - stroke * 2) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (percent / 100) * circ;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={color} strokeWidth={stroke}
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
      </svg>
      {label && <span style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", fontWeight: 700 }}>{label}</span>}
    </div>
  );
}
