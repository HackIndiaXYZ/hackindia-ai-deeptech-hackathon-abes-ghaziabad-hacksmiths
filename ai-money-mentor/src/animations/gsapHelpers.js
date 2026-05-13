import gsap from 'gsap';

export const countUpNumber = (elementRef, endValue, duration = 2, prefix = "", suffix = "") => {
  if (!elementRef.current) return;
  
  const obj = { val: 0 };
  gsap.to(obj, {
    val: endValue,
    duration: duration,
    ease: "power1.out",
    onUpdate: () => {
      // Format with commas based on Indian numbering system if needed, but for now just Math.floor
      elementRef.current.innerText = `${prefix}${Math.floor(obj.val).toLocaleString('en-IN')}${suffix}`;
    }
  });
};

export const drawSVGPath = (elementRef, duration = 1) => {
  if (!elementRef.current) return;
  const length = elementRef.current.getTotalLength();
  gsap.set(elementRef.current, { strokeDasharray: length, strokeDashoffset: length });
  gsap.to(elementRef.current, { strokeDashoffset: 0, duration, ease: "power2.out" });
};

export const shimmerEffect = (elementRef) => {
  if (!elementRef.current) return;
  gsap.to(elementRef.current, {
    backgroundPosition: "200% center",
    duration: 1.5,
    repeat: -1,
    ease: "linear"
  });
};
