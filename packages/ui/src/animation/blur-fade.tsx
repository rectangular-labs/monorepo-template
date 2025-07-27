import type { Variants } from "motion/react";
import { AnimatePresence, motion, useInView } from "motion/react";
import { useRef } from "react";

interface BlurFadeProps {
  children: React.ReactNode;
  className?: string;
  variant?: {
    hidden: { y: number };
    visible: { y: number };
  };
  duration?: number;
  delay?: number;
  yOffset?: number;
  inView?: boolean;
  inViewMargin?: `${number}${"px" | "%"}`;
  blur?: string;
}
export function BlurFade({
  children,
  className,
  variant,
  duration = 0.4,
  delay = 0,
  yOffset = 6,
  inView = false,
  inViewMargin = "-50px",
  blur = "6px",
}: BlurFadeProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inViewResult = useInView(ref, { once: true, margin: inViewMargin });
  const isInView = !inView || inViewResult;
  const defaultVariants: Variants = {
    hidden: { y: yOffset, opacity: 0, filter: `blur(${blur})` },
    visible: { y: -yOffset, opacity: 1, filter: "blur(0px)" },
  };
  const combinedVariants = variant || defaultVariants;
  return (
    <AnimatePresence>
      <motion.div
        animate={isInView ? "visible" : "hidden"}
        className={className}
        exit="hidden"
        initial="hidden"
        ref={ref}
        transition={{
          delay: 0.04 + delay,
          duration,
          ease: "easeOut",
        }}
        variants={combinedVariants}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
