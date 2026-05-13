import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';

export function useAnimatedNumber(initialValue, duration = 1) {
  const [value, setValue] = useState(initialValue);
  const elementRef = useRef(null);
  const prevValue = useRef(initialValue);

  useEffect(() => {
    if (value !== prevValue.current && elementRef.current) {
      // Color flash
      gsap.fromTo(elementRef.current, 
        { color: '#F5A623', scale: 1.1, textShadow: '0 0 10px rgba(245,166,35,0.8)' },
        { color: 'inherit', scale: 1, textShadow: 'none', duration: 0.5, ease: 'power2.out' }
      );
      
      // Number tween
      const obj = { val: prevValue.current };
      gsap.to(obj, {
        val: value,
        duration: duration,
        ease: 'power2.out',
        onUpdate: () => {
          if(elementRef.current) elementRef.current.innerText = Math.floor(obj.val).toLocaleString('en-IN');
        }
      });
      prevValue.current = value;
    }
  }, [value, duration]);

  return [elementRef, setValue];
}
