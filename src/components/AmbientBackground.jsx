import { useMemo } from 'react';

// Time-of-day theme that determines gradient + particle style
function getTimeTheme() {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 8) {
    // Early morning — soft gold sunrise
    return {
      id: 'sunrise',
      gradient: 'linear-gradient(160deg, #ffecd2 0%, #fcb69f 30%, #ffdde1 60%, #f8e8ff 100%)',
      particleColors: ['#fcb69f', '#ffecd2', '#ffb6c1', '#ffd1dc'],
      glowColor: 'rgba(252, 182, 159, 0.12)',
      stars: false,
    };
  }
  if (hour >= 8 && hour < 12) {
    // Morning — warm pink bloom
    return {
      id: 'morning',
      gradient: 'linear-gradient(160deg, #fce4ec 0%, #f8bbd0 25%, #e1f5fe 60%, #f3e5f5 100%)',
      particleColors: ['#f48fb1', '#ce93d8', '#ef9a9a', '#f8bbd0'],
      glowColor: 'rgba(244, 143, 177, 0.1)',
      stars: false,
    };
  }
  if (hour >= 12 && hour < 17) {
    // Afternoon — bright sky
    return {
      id: 'afternoon',
      gradient: 'linear-gradient(160deg, #e0f7fa 0%, #b2ebf2 25%, #fce4ec 55%, #f3e5f5 100%)',
      particleColors: ['#80deea', '#b2ebf2', '#f48fb1', '#ce93d8'],
      glowColor: 'rgba(128, 222, 234, 0.1)',
      stars: false,
    };
  }
  if (hour >= 17 && hour < 20) {
    // Evening — sunset lavender
    return {
      id: 'evening',
      gradient: 'linear-gradient(160deg, #e1bee7 0%, #f8bbd0 30%, #ffccbc 55%, #d1c4e9 100%)',
      particleColors: ['#ce93d8', '#f48fb1', '#ffab91', '#b39ddb'],
      glowColor: 'rgba(206, 147, 216, 0.12)',
      stars: false,
    };
  }
  // Night — deep calm with stars
  return {
    id: 'night',
    gradient: 'linear-gradient(160deg, #1a1a2e 0%, #16213e 30%, #0f3460 60%, #1a1a2e 100%)',
    particleColors: ['#ffffff', '#e8eaf6', '#c5cae9', '#b3e5fc'],
    glowColor: 'rgba(255, 255, 255, 0.04)',
    stars: true,
  };
}

// Generate random particles
function generateParticles(count, colors, stars) {
  return Array.from({ length: count }, (_, i) => {
    const size = stars ? Math.random() * 3 + 1 : Math.random() * 18 + 6;
    return {
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size,
      color: colors[Math.floor(Math.random() * colors.length)],
      opacity: stars ? Math.random() * 0.7 + 0.3 : Math.random() * 0.25 + 0.08,
      duration: Math.random() * 20 + 15,
      delay: Math.random() * -20,
      type: stars ? 'star' : (Math.random() > 0.5 ? 'circle' : 'petal'),
    };
  });
}

export default function AmbientBackground() {
  const theme = useMemo(() => getTimeTheme(), []);
  const particles = useMemo(() => generateParticles(theme.stars ? 40 : 20, theme.particleColors, theme.stars), [theme]);

  return (
    <div className="ambient-bg" style={{ background: theme.gradient }}>
      {/* Floating glow blobs */}
      <div className="ambient-glow ambient-glow-1" style={{ background: theme.glowColor }} />
      <div className="ambient-glow ambient-glow-2" style={{ background: theme.glowColor }} />
      <div className="ambient-glow ambient-glow-3" style={{ background: theme.glowColor }} />

      {/* Particles */}
      {particles.map(p => (
        <div
          key={p.id}
          className={`ambient-particle ambient-particle-${p.type}`}
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            background: p.color,
            opacity: p.opacity,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
