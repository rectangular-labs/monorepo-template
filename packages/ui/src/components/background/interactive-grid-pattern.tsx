"use client";
// credits: https://magicui.design/docs/components/interactive-grid-pattern
import { cn } from "@rectangular-labs/ui/utils";
import type React from "react";
import { useState } from "react";

/**
 * InteractiveGridPattern is a component that renders a grid pattern with interactive squares.
 *
 * @param width - The width of each square.
 * @param height - The height of each square.
 * @param squares - The number of squares in the grid. The first element is the number of horizontal squares, and the second element is the number of vertical squares.
 * @param className - The class name of the grid.
 * @param squaresClassName - The class name of the squares.
 */
interface InteractiveGridPatternProps extends React.SVGProps<SVGSVGElement> {
  width?: number;
  height?: number;
  squares?: [number, number]; // [horizontal, vertical]
  className?: string;
  squaresClassName?: string;
  interactive?: boolean;
}

/**
 * The InteractiveGridPattern component.
 *
 * @see InteractiveGridPatternProps for the props interface.
 * @returns A React component.
 */
export function InteractiveGridPattern({
  width = 40,
  height = 40,
  squares = [24, 24],
  className,
  squaresClassName,
  interactive = true,
  ...props
}: InteractiveGridPatternProps) {
  const [horizontal, vertical] = squares;
  const [hoveredSquare, setHoveredSquare] = useState<number | null>(null);

  return (
    <svg
      className={cn("absolute inset-0", className)}
      height={height * vertical}
      width={width * horizontal}
      {...props}
    >
      <title>Interactive Grid Pattern</title>
      {Array.from({ length: horizontal * vertical }).map((_, index) => {
        const x = (index % horizontal) * width;
        const y = Math.floor(index / horizontal) * height;
        return (
          <rect
            className={cn(
              "stroke-border transition-all duration-100 ease-in-out not-[&:hover]:duration-1000",
              hoveredSquare === index ? "fill-border" : "fill-transparent",
              squaresClassName,
            )}
            height={height}
            key={`${Math.random()}-${x}-${y}`}
            {...(interactive
              ? {
                  onMouseEnter: () => setHoveredSquare(index),
                  onMouseLeave: () => setHoveredSquare(null),
                }
              : {})}
            width={width}
            x={x}
            y={y}
          />
        );
      })}
    </svg>
  );
}
