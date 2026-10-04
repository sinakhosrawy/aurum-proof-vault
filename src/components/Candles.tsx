// Decorative forex-style candlestick chart (deterministic so SSR matches).
function series(n: number, seed: number) {
  let s = seed;
  const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  let price = 50;
  return Array.from({ length: n }, () => {
    const open = price;
    const close = Math.max(10, Math.min(90, open + (rnd() - 0.42) * 12));
    const high = Math.max(open, close) + rnd() * 5;
    const low = Math.min(open, close) - rnd() * 5;
    price = close;
    return { open, close, high, low };
  });
}

export function Candles({ count = 28, seed = 7, className = "" }: { count?: number; seed?: number; className?: string }) {
  const data = series(count, seed);
  const w = 100 / count;
  const y = (v: number) => 100 - v;
  const line = data.map((d, i) => `${i * w + w / 2},${y(d.close)}`).join(" ");
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className={className} aria-hidden>
      {[20, 40, 60, 80].map((g) => (
        <line key={g} x1="0" x2="100" y1={g} y2={g} className="stroke-steel/10" strokeWidth="0.2" />
      ))}
      <polyline points={line} fill="none" className="stroke-gold/50" strokeWidth="0.35" />
      {data.map((d, i) => {
        const up = d.close >= d.open;
        const x = i * w + w / 2;
        return (
          <g
            key={i}
            className={`candle-grow ${up ? "fill-up stroke-up" : "fill-down stroke-down"}`}
            style={{ animationDelay: `${i * 35}ms` }}
          >
            <line x1={x} x2={x} y1={y(d.high)} y2={y(d.low)} strokeWidth="0.3" />
            <rect
              x={x - w * 0.3}
              width={w * 0.6}
              y={y(Math.max(d.open, d.close))}
              height={Math.max(0.6, Math.abs(d.close - d.open))}
              strokeWidth="0"
            />
          </g>
        );
      })}
    </svg>
  );
}
