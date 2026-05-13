import React, { useEffect, useRef } from 'react';

export default function CustomCursor() {
  const dotRef = useRef(null);
  const pos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const onMouseMove = (e) => {
      pos.current.x = e.clientX;
      pos.current.y = e.clientY;
    };

    // Use a simple RAF loop for smooth 60fps tracking with no GSAP overhead
    let raf;
    const render = () => {
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${pos.current.x}px, ${pos.current.y}px)`;
      }
      raf = requestAnimationFrame(render);
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    raf = requestAnimationFrame(render);

    // Hide default cursor on desktop
    document.body.style.cursor = 'none';

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      cancelAnimationFrame(raf);
      document.body.style.cursor = 'auto';
    };
  }, []);

  return (
    <div className="hidden md:block pointer-events-none fixed inset-0 z-[10000]">
      <div 
        ref={dotRef} 
        className="fixed top-0 left-0 -ml-1.5 -mt-1.5 w-3 h-3 rounded-full bg-gold shadow-[0_0_8px_rgba(245,166,35,0.6)]"
        style={{ willChange: 'transform' }}
      />
    </div>
  );
}
