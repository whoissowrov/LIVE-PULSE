import React, { useEffect, useRef } from 'react';

/**
 * AmbientBackground - Luxury glowing bioluminescent particles drifting softly
 * in the background with interactive deflection from the visitor's cursor.
 */
export default function AmbientBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const particles = [];
    const count = Math.min(22, Math.max(12, Math.floor(window.innerWidth / 65)));
    const colors = [
      'rgba(239, 68, 68, ',
      'rgba(244, 63, 94, ',
      'rgba(185, 28, 28, '
    ];

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 26 + 12,
        color: colors[Math.floor(Math.random() * colors.length)],
        baseAlpha: Math.random() * 0.12 + 0.04,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        angle: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.01 + 0.006
      });
    }

    let mouseX = width / 2;
    let mouseY = height / 2;
    const handleMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove);

    let animationId;
    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.angle += p.speed;
        p.x += p.vx + Math.cos(p.angle) * 0.22;
        p.y += p.vy + Math.sin(p.angle) * 0.22;

        // Interactive cursor repulsion
        const dx = p.x - mouseX;
        const dy = p.y - mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 140 && dist > 0) {
          p.x += (dx / dist) * 0.75;
          p.y += (dy / dist) * 0.75;
        }

        // Boundary wrap
        if (p.x < -p.radius) p.x = width + p.radius;
        if (p.x > width + p.radius) p.x = -p.radius;
        if (p.y < -p.radius) p.y = height + p.radius;
        if (p.y > height + p.radius) p.y = -p.radius;

        // Radial glow
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius);
        grad.addColorStop(0, `${p.color}${p.baseAlpha})`);
        grad.addColorStop(0.7, `${p.color}${p.baseAlpha * 0.4})`);
        grad.addColorStop(1, `${p.color}0)`);

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return <canvas ref={canvasRef} className="ambient-canvas" />;
}
