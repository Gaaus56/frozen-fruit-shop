import { useId } from "react";
import { business } from "@/data/business";

const COLORS = {
  edge: "#8a0f0b",
  band: "#b3160f",
  cream: "#f4f1e8",
  centerRing: "#2b1a17",
  text: "#f4f1e8",
  snowflake: "#7a0e0a",
};

const BRAND_TEXT = "TRÁI CÂY ĐÔNG LẠNH";
const LOCATION_TEXT = "ĐÀ NẴNG";

function Snowflake({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  return (
    <g stroke={COLORS.snowflake} strokeWidth="7" strokeLinecap="round" transform={`translate(${cx} ${cy})`}>
      {[0, 60, 120].map((angle) => (
        <g key={angle} transform={`rotate(${angle})`}>
          <line x1={-r} y1="0" x2={r} y2="0" />
          {[-1, 1].map((side) => (
            <g key={side}>
              <line x1={side * r * 0.62} y1="0" x2={side * r * 0.85} y2={-r * 0.25} />
              <line x1={side * r * 0.62} y1="0" x2={side * r * 0.85} y2={r * 0.25} />
            </g>
          ))}
        </g>
      ))}
    </g>
  );
}

export function LogoBadge({ className }: { className?: string }) {
  const uid = useId().replace(/:/g, "");
  const topPath = `top-${uid}`;
  const bottomPath = `bottom-${uid}`;

  return (
    <svg viewBox="0 0 1000 1000" role="img" aria-label={`Logo ${business.name}`} className={className}>
      <defs>
        <path id={topPath} d="M 173 500 A 327 327 0 0 1 827 500" />
        <path id={bottomPath} d="M 113 500 A 387 387 0 0 0 887 500" />
      </defs>

      <circle cx="500" cy="500" r="500" fill={COLORS.cream} />
      <circle cx="500" cy="500" r="470" fill={COLORS.edge} />
      <circle cx="500" cy="500" r="452" fill={COLORS.cream} />
      <circle cx="500" cy="500" r="440" fill={COLORS.band} />
      <circle cx="500" cy="500" r="275" fill={COLORS.cream} />
      <circle cx="500" cy="500" r="264" fill={COLORS.centerRing} />
      <circle cx="500" cy="500" r="256" fill={COLORS.cream} />

      <g
        fill={COLORS.text}
        fontWeight="800"
        textAnchor="middle"
        style={{ fontFamily: "var(--font-archivo), Arial, sans-serif" }}
      >
        <text fontSize="84" textLength="820" lengthAdjust="spacing">
          <textPath href={`#${topPath}`} startOffset="50%">
            {BRAND_TEXT}
          </textPath>
        </text>
        <text fontSize="88" textLength="500" lengthAdjust="spacing">
          <textPath href={`#${bottomPath}`} startOffset="50%">
            {LOCATION_TEXT}
          </textPath>
        </text>
      </g>

      <Snowflake cx={142.5} cy={500} r={36} />
      <Snowflake cx={857.5} cy={500} r={36} />

      <image href="/images/logo-28fruit.png" x="285" y="290" width="430" height="414" />
    </svg>
  );
}
