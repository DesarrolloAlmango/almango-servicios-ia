
import React, { useEffect, useRef } from "react";
import lottie from "lottie-web";

interface LottieAnimationProps {
  src: string;
  loop?: boolean;
  autoplay?: boolean;
  className?: string;
}

const LottieAnimation: React.FC<LottieAnimationProps> = ({
  src,
  loop = true,
  autoplay = true,
  className = "w-full h-full"
}) => {
  const container = useRef<HTMLDivElement>(null);
  const animationInstance = useRef<any>(null);

  useEffect(() => {
    if (container.current) {
      if (animationInstance.current) {
        animationInstance.current.destroy();
      }
      
      fetch(src)
        .then(response => response.json())
        .then(data => {
          animationInstance.current = lottie.loadAnimation({
            container: container.current!,
            renderer: 'svg',
            loop: loop,
            autoplay: autoplay,
            animationData: data
          });
        })
        .catch(error => console.error("Error loading Lottie animation:", error));
    }

    return () => {
      if (animationInstance.current) {
        animationInstance.current.destroy();
      }
    };
  }, [src, loop, autoplay]);

  return <div ref={container} className={className}></div>;
};

export default LottieAnimation;
