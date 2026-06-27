// src/components/ui/logo.tsx
import React from "react";

interface LogoProps {
  size?: number;
  showText?: boolean;
  className?: string;
  goldTextOnly?: boolean;
}

export default function Logo({
  size = 28,
  showText = true,
  className = "",
  goldTextOnly = false,
}: LogoProps) {
  return (
    <div
      className={`inline-flex items-center gap-3 ${className}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "10px",
        cursor: "pointer",
        userSelect: "none",
      }}
    >
      {/* SVG logo mark: shield/pitch circuit with N */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          filter: "drop-shadow(0 0 10px var(--accent-gold-glow-strong))",
          flexShrink: 0,
        }}
      >
        {/* Outer Shield Hexagon */}
        <polygon
          points="50,5 90,25 90,75 50,95 10,75 10,25"
          stroke="var(--accent-gold)"
          strokeWidth="6"
          strokeLinejoin="round"
          fill="rgba(11, 11, 14, 0.85)"
        />
        
        {/* Inner Pitch Circle mark */}
        <circle
          cx="50"
          cy="50"
          r="30"
          stroke="var(--accent-cyan)"
          strokeWidth="3"
          strokeDasharray="6 4"
          opacity="0.6"
        />

        {/* Vertical Center Pitch Line */}
        <line
          x1="50"
          y1="20"
          x2="50"
          y2="80"
          stroke="var(--accent-cyan)"
          strokeWidth="2"
          opacity="0.4"
        />

        {/* Stylized N Lettermark */}
        <path
          d="M32 72V28L50 53V28M50 72V47L68 72V28"
          stroke="var(--accent-gold)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {showText && (
        <span
          style={{
            fontFamily: "var(--font-heading)",
            fontWeight: 900,
            fontSize: `${size * 0.75}px`,
            letterSpacing: "-0.04em",
            textTransform: "uppercase",
            lineHeight: 1,
            color: "var(--foreground-primary)",
          }}
        >
          NANO
          <span
            style={{
              color: goldTextOnly ? "var(--accent-gold)" : "var(--accent-cyan)",
              textShadow: goldTextOnly
                ? "0 0 10px var(--accent-gold-glow)"
                : "0 0 10px var(--accent-cyan-glow)",
            }}
          >
            PLAY
          </span>
        </span>
      )}
    </div>
  );
}
