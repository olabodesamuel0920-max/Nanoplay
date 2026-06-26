// src/components/ui/glass-card.tsx
import React from "react";
import styles from "./glass-card.module.css";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  accent?: boolean;
  hoverEffect?: boolean;
  className?: string;
}

export default function GlassCard({
  children,
  accent = false,
  hoverEffect = true,
  className = "",
  ...props
}: GlassCardProps) {
  const cardClassName = [
    styles.card,
    accent ? styles.accent : "",
    hoverEffect ? styles.hover : "",
    className
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={cardClassName} {...props}>
      {children}
    </div>
  );
}
