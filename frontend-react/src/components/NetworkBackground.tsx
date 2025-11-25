import React, { useRef, useEffect } from 'react';
import './NetworkBackground.css';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
}

interface NetworkBackgroundProps {
  particleCount?: number;
  colors?: string[];
  maxDistance?: number;
  particleSpeed?: number;
  lineOpacity?: number;
  particleRadius?: number;
}

const NetworkBackground: React.FC<NetworkBackgroundProps> = ({
  particleCount = 80,
  colors = ['#ffffff', '#33ccff', '#ff99cc'],
  maxDistance = 60,
  particleSpeed = 0.5,
  lineOpacity = 0.5,
  particleRadius = 2,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef<{ x: number | null; y: number | null; radius: number }>({
    x: null,
    y: null,
    radius: maxDistance * 0.5,
  });

  // Initialize particles
  const initializeParticles = (width: number, height: number): Particle[] => {
    const particles: Particle[] = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * particleSpeed,
        vy: (Math.random() - 0.5) * particleSpeed,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }
    return particles;
  };

  // Animation loop
  const animate = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.clearRect(0, 0, width, height);
    const particles = particlesRef.current;
    const mouse = mouseRef.current;

    // Update and draw particles
    particles.forEach((particle) => {
      // Update position
      particle.x += particle.vx;
      particle.y += particle.vy;

      // Bounce off edges
      if (particle.x < 0 || particle.x > width) particle.vx *= -1;
      if (particle.y < 0 || particle.y > height) particle.vy *= -1;

      // Keep particles in bounds
      particle.x = Math.max(0, Math.min(width, particle.x));
      particle.y = Math.max(0, Math.min(height, particle.y));

      // Draw particle
      ctx.fillStyle = particle.color;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particleRadius, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw connections between particles
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < maxDistance) {
          const opacity = (1 - distance / maxDistance) * lineOpacity;
          ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }

    // Optional: Draw connection to mouse if nearby
    if (mouse.x !== null && mouse.y !== null) {
      particles.forEach((particle) => {
        const dx = particle.x - mouse.x!;
        const dy = particle.y - mouse.y!;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < mouse.radius) {
          const opacity = (1 - distance / mouse.radius) * lineOpacity * 0.5;
          ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(particle.x, particle.y);
          ctx.lineTo(mouse.x!, mouse.y!);
          ctx.stroke();
        }
      });
    }

    animationFrameRef.current = requestAnimationFrame(() => animate(ctx, width, height));
  };

  // Setup canvas and animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions
    const updateCanvasSize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      return { width, height };
    };

    const { width, height } = updateCanvasSize();

    // Initialize particles
    particlesRef.current = initializeParticles(width, height);

    // Start animation
    animate(ctx, width, height);

    // Handle window resize
    const handleResize = () => {
      const { width: newWidth, height: newHeight } = updateCanvasSize();
      // Reposition particles that are outside the new bounds
      particlesRef.current.forEach((particle) => {
        if (particle.x > newWidth) particle.x = newWidth;
        if (particle.y > newHeight) particle.y = newHeight;
      });
    };

    window.addEventListener('resize', handleResize);

    // Mouse interaction
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
    };

    const handleMouseOut = () => {
      mouseRef.current.x = null;
      mouseRef.current.y = null;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseout', handleMouseOut);

    // Cleanup
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseout', handleMouseOut);
    };
  }, [particleCount, colors, maxDistance, particleSpeed, lineOpacity, particleRadius]);

  return <canvas ref={canvasRef} className="network-background-canvas" />;
};

export default NetworkBackground;

