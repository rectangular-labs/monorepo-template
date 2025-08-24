"use client";

import { EyeIcon, EyeOffIcon } from "lucide-react";
import { type ComponentProps, useState } from "react";
import { cn } from "../../utils/cn";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

export function PasswordInput({
  className,
  enableToggle,
  onChange,
  ...props
}: ComponentProps<typeof Input> & { enableToggle?: boolean }) {
  const [disabled, setDisabled] = useState(true);
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative">
      <Input
        className={cn(enableToggle && "pr-10", className)}
        {...props}
        onChange={(event) => {
          setDisabled(!event.target.value);
          onChange?.(event);
        }}
        type={isVisible && enableToggle ? "text" : "password"}
      />

      {enableToggle && (
        <>
          <Button
            className="!bg-transparent absolute top-0 right-0"
            disabled={disabled}
            onClick={() => setIsVisible(!isVisible)}
            size="icon"
            type="button"
            variant="ghost"
          >
            {isVisible ? <EyeIcon /> : <EyeOffIcon />}
          </Button>

          <style>{`.hide-password-toggle::-ms-reveal,
                    .hide-password-toggle::-ms-clear {
                            visibility: hidden;
                            pointer-events: none;
                            display: none;
                        }
                    `}</style>
        </>
      )}
    </div>
  );
}
