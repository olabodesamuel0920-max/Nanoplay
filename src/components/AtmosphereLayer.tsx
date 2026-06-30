"use client";

const cn = (...classes: (string | undefined | null | false)[]) => classes.filter(Boolean).join(" ");

interface AtmosphereLayerProps {
  variant?: "hero" | "login" | "signup" | "arena" | "winners" | "tiers" | "dashboard" | "wallet";
  className?: string;
}

export default function AtmosphereLayer({ variant = "hero", className }: AtmosphereLayerProps) {
  return (
    <div 
      className={cn("atmosphere-layer", `atmosphere-${variant}`, className)} 
      aria-hidden="true"
    >
      {/* Background Lights & Stadium */}
      <div className="atmosphere-bg" />
      
      {/* Player Silhouettes */}
      <div className="atmosphere-player" />
      
      {/* Pitch Floor */}
      <div className="atmosphere-floor" />
      
      {/* Crowd Arc */}
      <div className="atmosphere-crowd" />
      
      {/* Centerpiece / Floating elements */}
      <div className="atmosphere-centerpiece">
        <div className="atmosphere-badge" />
        <div className="atmosphere-trophy" />
      </div>
      
      {/* Confetti Overlay for winners */}
      {variant === "winners" && <ConfettiOverlay />}
    </div>
  );
}

function ConfettiOverlay() {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 8}s`,
    duration: `${8 + Math.random() * 6}s`,
    color: ["#D4A853", "#FFD700", "#7dd3fc", "#ffffff"][Math.floor(Math.random() * 4)],
    size: 4 + Math.random() * 8,
  }));

  return (
    <div className="confetti-overlay">
      {particles.map((p) => (
        <span
          key={p.id}
          className="confetti-particle"
          style={{
            left: p.left,
            animationDelay: p.delay,
            animationDuration: p.duration,
            width: `${p.size}px`,
            height: `${p.size * 0.6}px`,
            backgroundColor: p.color,
          }}
        />
      ))}
    </div>
  );
}
