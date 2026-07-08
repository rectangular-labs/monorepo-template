"use client";

import { BaseUIComponentProps } from "@base-ui/react/internals/types";
import { Progress as ProgressPrimitive, ProgressRootState } from "@base-ui/react/progress";

import { cn } from "@rectangular-labs/ui/utils";

function Progress({ className, children, value, ...props }: ProgressPrimitive.Root.Props) {
  return (
    <ProgressPrimitive.Root
      value={value}
      data-slot="progress"
      className={cn("flex flex-wrap gap-3", className)}
      {...props}
    >
      {children}
      <ProgressTrack>
        <ProgressIndicator />
      </ProgressTrack>
    </ProgressPrimitive.Root>
  );
}

function ProgressTrack({ className, ...props }: ProgressPrimitive.Track.Props) {
  return (
    <ProgressPrimitive.Track
      className={cn(
        "relative flex h-1 w-full items-center overflow-x-hidden rounded-none bg-muted",
        className,
      )}
      data-slot="progress-track"
      {...props}
    />
  );
}

function ProgressIndicator({ className, ...props }: ProgressPrimitive.Indicator.Props) {
  return (
    <ProgressPrimitive.Indicator
      data-slot="progress-indicator"
      className={cn("h-full bg-primary transition-all", className)}
      {...props}
    />
  );
}

function ProgressLabel({ className, ...props }: ProgressPrimitive.Label.Props) {
  return (
    <ProgressPrimitive.Label
      className={cn("text-xs", className)}
      data-slot="progress-label"
      {...props}
    />
  );
}

function ProgressValue({ className, ...props }: ProgressPrimitive.Value.Props) {
  return (
    <ProgressPrimitive.Value
      className={cn("ms-auto text-xs text-muted-foreground tabular-nums", className)}
      data-slot="progress-value"
      {...props}
    />
  );
}

// derived from the Base UI ProgressRootProps since they don't allow changing the div to something else.
interface CircularProgressProps extends BaseUIComponentProps<"svg", ProgressRootState> {
  "aria-valuetext"?: React.AriaAttributes["aria-valuetext"] | undefined;
  getAriaValueText?: ((formattedValue: string | null, value: number | null) => string) | undefined;
  locale?: Intl.LocalesArgument | undefined;
  /**
   * The maximum value.
   * @default 100
   */
  max?: number | undefined;
  /**
   * The minimum value.
   * @default 0
   */
  min?: number | undefined;
  /**
   * The current value. The component is indeterminate when value is `null`.
   * @default null
   */
  value: number | null;
  size?: number;
  strokeWidth?: number;
}

function clamp(input: number, min: number, max: number): number {
  if (input < min) return min;
  if (input > max) return max;
  return input;
}
function CircularProgress({
  style,
  size = 18,
  className,
  strokeWidth = 1.5,
  value,
  min = 0,
  max = 100,
  children,
  ...props
}: CircularProgressProps) {
  const normalizedValue = Number.isFinite(value) ? clamp(value as number, min, max) : null;
  const range = max - min;
  const center = size / 2;
  const radius = Math.max(0, center - strokeWidth);
  const circumference = 2 * Math.PI * radius;
  const progress =
    normalizedValue !== null && range > 0 ? ((normalizedValue - min) / range) * circumference : 0;

  const circleProps = {
    cx: size / 2,
    cy: size / 2,
    r: radius,
    fill: "none",
    strokeWidth,
  };

  return (
    <ProgressPrimitive.Root
      max={max}
      min={min}
      value={normalizedValue}
      data-slot="circular-progress"
      style={style}
      className={className}
      render={(rootProps) => {
        return (
          <svg
            {...rootProps}
            {...props}
            viewBox={`0 0 ${size} ${size}`}
            style={{ width: size, height: size, ...rootProps.style }}
          />
        );
      }}
    >
      {children}
      <ProgressPrimitive.Track
        className="stroke-current/25"
        data-slot="circle-progress-track"
        render={<circle {...circleProps} />}
      />
      <ProgressPrimitive.Indicator
        data-slot="circle-progress-indicator"
        className={"transition-all"}
        render={
          <circle
            {...circleProps}
            stroke="currentColor"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - progress}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        }
      />
    </ProgressPrimitive.Root>
  );
}

export { CircularProgress, Progress, ProgressLabel, ProgressValue };
