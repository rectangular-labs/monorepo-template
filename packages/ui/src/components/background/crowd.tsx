"use client";

/**
 * Inspired by and adapted from https://codepen.io/zadvorsky/pen/xxwbBQV
 * illustration by https://www.openpeeps.com/
 */
import { useIsMobile } from "@rectangular-labs/ui/hooks/use-mobile";
import { cn } from "@rectangular-labs/ui/utils";
import { animate } from "motion";
import { cubicBezier } from "motion/react";
import { useEffect, useRef } from "react";

interface CrowdCanvasProps {
  src: string;
  className?: string;
  rows?: number;
  cols?: number;
}

type Peep = {
  image: HTMLImageElement;
  rect: number[];
  width: number;
  height: number;
  drawArgs: (HTMLImageElement | number)[];
  x: number;
  y: number;
  anchorY: number;
  scaleX: number;
  walk: WalkControls | null;
  setRect: (rect: number[]) => void;
  render: (ctx: CanvasRenderingContext2D) => void;
};

type Stage = {
  width: number;
  height: number;
};

type WalkControls = {
  cancel: () => void;
};

const CrowdCanvas = ({ src, className, rows = 15, cols = 7 }: CrowdCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const config = {
      src,
      rows,
      cols,
    };

    // UTILS
    const randomRange = (min: number, max: number) => min + Math.random() * (max - min);
    const randomIndex = <T,>(array: T[]) => randomRange(0, array.length) | 0;
    const removeFromArray = <T,>(array: T[], i: number) => array.splice(i, 1)[0];
    const removeItemFromArray = <T,>(array: T[], item: T) =>
      removeFromArray(array, array.indexOf(item));
    const removeRandomFromArray = <T,>(array: T[]) => removeFromArray(array, randomIndex(array));

    // TWEEN FACTORIES
    const resetPeep = ({ stage, peep }: { stage: Stage; peep: Peep }) => {
      const direction = Math.random() > 0.5 ? 1 : -1;
      const ease = cubicBezier(0.55, 0, 1, 0.45);
      const offsetY = (isMobile ? 175 : 100) - 250 * ease(Math.random());
      const startY = stage.height - peep.height + offsetY;
      let startX: number;
      let endX: number;

      if (direction === 1) {
        startX = -peep.width;
        endX = stage.width;
        peep.scaleX = 1;
      } else {
        startX = stage.width + peep.width;
        endX = 0;
        peep.scaleX = -1;
      }

      peep.x = startX;
      peep.y = startY;
      peep.anchorY = startY;

      return {
        startX,
        startY,
        endX,
      };
    };

    const normalWalk = ({
      peep,
      props,
      progress = 0,
    }: {
      peep: Peep;
      props: {
        startX: number;
        startY: number;
        endX: number;
      };
      progress?: number;
    }): WalkControls => {
      const { startX, startY, endX } = props;

      const baseXDuration = 10;
      const baseYDuration = 0.25;
      const timeScale = randomRange(0.5, 1.5);
      const xDuration = baseXDuration / timeScale;
      const yDuration = baseYDuration / timeScale;

      // Align vertical bobbing phase with horizontal progress
      const initialX = startX + (endX - startX) * progress;
      const elapsedX = progress * xDuration;

      // Horizontal walk
      const xAnim = animate(initialX, endX, {
        duration: xDuration - elapsedX,
        elapsed: progress * xDuration,
        type: "tween",
        onUpdate: (v) => {
          peep.x = v;
        },
      });

      // Vertical bobbing
      const yAnim = animate(startY, startY - 10, {
        duration: yDuration,
        repeat: xDuration / yDuration,
        repeatType: "reverse",
        onUpdate: (v) => {
          peep.y = v;
        },
      });

      const controls: WalkControls = {
        cancel: () => {
          xAnim.cancel();
          yAnim.cancel();
        },
      };

      // Invoke onComplete when horizontal walk finishes
      void xAnim.finished.then(() => {
        removePeepFromCrowd(peep);
        addPeepToCrowd();
      });

      return controls;
    };

    // FACTORY FUNCTIONS
    const createPeep = ({ image, rect }: { image: HTMLImageElement; rect: number[] }): Peep => {
      const peep: Peep = {
        image,
        rect: [],
        width: 0,
        height: 0,
        drawArgs: [],
        x: 0,
        y: 0,
        anchorY: 0,
        scaleX: 1,
        walk: null,
        setRect: (rect: number[]) => {
          peep.rect = rect;
          peep.width = rect[2] ?? 0;
          peep.height = rect[3] ?? 0;
          peep.drawArgs = [peep.image, ...rect, 0, 0, peep.width, peep.height];
        },
        render: (ctx: CanvasRenderingContext2D) => {
          ctx.save();
          ctx.translate(peep.x, peep.y);
          ctx.scale(peep.scaleX, 1);
          ctx.drawImage(
            peep.image,
            peep.rect[0] ?? 0,
            peep.rect[1] ?? 0,
            peep.rect[2] ?? 0,
            peep.rect[3] ?? 0,
            0,
            0,
            peep.width,
            peep.height,
          );
          ctx.restore();
        },
      };

      peep.setRect(rect);
      return peep;
    };

    // MAIN
    const img = document.createElement("img");
    const stage = {
      width: 0,
      height: 0,
    };

    const allPeeps: Peep[] = [];
    const availablePeeps: Peep[] = [];
    const crowd: Peep[] = [];

    const createPeeps = () => {
      const { rows, cols } = config;
      const { naturalWidth: width, naturalHeight: height } = img;
      const total = rows * cols;
      const rectWidth = width / rows;
      const rectHeight = height / cols;

      for (let i = 0; i < (isMobile ? total * 0.5 : 0.8 * total); i++) {
        allPeeps.push(
          createPeep({
            image: img,
            rect: [(i % rows) * rectWidth, ((i / rows) | 0) * rectHeight, rectWidth, rectHeight],
          }),
        );
      }
    };

    const initCrowd = () => {
      while (availablePeeps.length) {
        addPeepToCrowd(Math.random());
      }
    };

    const addPeepToCrowd = (progress?: number) => {
      const peep = removeRandomFromArray(availablePeeps);
      if (!peep) return;
      const walk = normalWalk({
        peep,
        props: resetPeep({
          peep,
          stage,
        }),
        progress: progress ?? 0,
      });
      peep.walk = walk;

      crowd.push(peep);
      crowd.sort((a, b) => a.anchorY - b.anchorY);
      return peep;
    };

    const removePeepFromCrowd = (peep: Peep) => {
      removeItemFromArray(crowd, peep);
      availablePeeps.push(peep);
    };

    const render = () => {
      if (!canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();

      ctx.scale(devicePixelRatio, devicePixelRatio);

      crowd.forEach((peep) => {
        peep.render(ctx);
      });

      ctx.restore();
    };

    const resize = () => {
      if (!canvas) return;
      stage.width = canvas.clientWidth;
      stage.height = canvas.clientHeight;
      canvas.width = stage.width * devicePixelRatio;
      canvas.height = stage.height * devicePixelRatio;

      crowd.forEach((peep) => {
        peep.walk?.cancel();
      });

      crowd.length = 0;
      availablePeeps.length = 0;
      availablePeeps.push(...allPeeps);

      initCrowd();
    };

    let rafId = 0;
    const loop = () => {
      render();
      rafId = requestAnimationFrame(loop);
    };

    const init = () => {
      createPeeps();
      resize();
      loop();
    };
    img.onload = init;
    img.src = config.src;

    const handleResize = () => resize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      if (rafId) cancelAnimationFrame(rafId);
      crowd.forEach((peep) => {
        if (peep.walk) peep.walk?.cancel();
      });
    };
  }, [cols, rows, src, isMobile]);
  return (
    <canvas
      className={cn("pointer-events-none absolute bottom-0 h-[90vh] w-full select-none", className)}
      draggable={false}
      ref={canvasRef}
    />
  );
};

export { CrowdCanvas };
