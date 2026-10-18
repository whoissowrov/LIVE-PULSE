import React, { useEffect, useRef, useState } from 'react';

/**
 * CustomCursor - Bespoke Interactive Cursor Component for React
 * Delivers luxury magnetic ring tracking, glowing blood droplet core,
 * hover scaling over interactive UI elements, and click ripple effects.
 */
export default function CustomCursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const [ripples, setRipples] = useState([]);
  const [isHovered, setIsHovered] = useState(false);
  const [isTextInput, setIsTextInput] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Disable on touch devices
    if (window.matchMedia('(pointer: coarse)').matches) return;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;
    let animationFrameId;

    // Smooth lerp loop for the outer trailing ring
    const render = () => {
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;

      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
      }
      animationFrameId = requestAnimationFrame(render);
    };
    animationFrameId = requestAnimationFrame(render);

    const handleMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
      }

      if (!isVisible) setIsVisible(true);
    };

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    const handleMouseOver = (e) => {
      const target = e.target;
      const inputEl = target.closest('input[type="text"], input[type="email"], input[type="password"], input[type="number"], input[type="tel"], textarea');
      const interactiveEl = target.closest('a, button, select, .btn, .interactive-card, .blood-chip, .user-badge, label, .switch');

      if (inputEl) {
        setIsTextInput(true);
        setIsHovered(false);
      } else if (interactiveEl) {
        setIsHovered(true);
        setIsTextInput(false);
      }
    };

    const handleMouseOut = (e) => {
      const target = e.target;
      const interactive = target.closest('a, button, select, input, textarea, .btn, .interactive-card, .blood-chip, .user-badge, label, .switch');
      if (interactive) {
        setIsHovered(false);
        setIsTextInput(false);
      }
    };

    const handleMouseDown = (e) => {
      const newRipple = {
        id: Date.now() + Math.random(),
        x: e.clientX,
        y: e.clientY
      };
      setRipples((prev) => [...prev.slice(-8), newRipple]);

      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
      }, 650);
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);
    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseout', handleMouseOut);
    window.addEventListener('mousedown', handleMouseDown);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);
      window.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  return (
    <>
      {/* Precision Glowing Blood Core */}
      <div
        ref={dotRef}
        className={`custom-cursor-dot ${isHovered ? 'cursor-hover' : ''} ${!isVisible ? 'cursor-hidden' : ''}`}
      />

      {/* Trailing Fluid Magnetic Ring */}
      <div
        ref={ringRef}
        className={`custom-cursor-ring ${isHovered ? 'cursor-hover' : ''} ${isTextInput ? 'cursor-text' : ''} ${!isVisible ? 'cursor-hidden' : ''}`}
      />

      {/* Micro Blood Droplet Ripple Effects */}
      <div className="cursor-ripple-container">
        {ripples.map((ripple) => (
          <div
            key={ripple.id}
            className="cursor-ripple"
            style={{ left: `${ripple.x}px`, top: `${ripple.y}px` }}
          />
        ))}
      </div>
    </>
  );
}
