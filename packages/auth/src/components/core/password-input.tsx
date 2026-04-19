"use client";

import { EyeOff, EyeOn } from "@rectangular-labs/ui/components/icons";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@rectangular-labs/ui/core/input-group";
import { type ComponentProps, useState } from "react";

export type PasswordInputProps = Omit<ComponentProps<typeof InputGroupInput>, "type"> & {
  enableToggle?: boolean | undefined;
};

export function PasswordInput({ className, enableToggle = true, ...props }: PasswordInputProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <InputGroup className={className}>
      <InputGroupInput
        {...props}
        className="hide-password-toggle"
        type={isVisible && enableToggle ? "text" : "password"}
      />

      {enableToggle ? (
        <InputGroupAddon align="inline-end">
          <InputGroupButton
            aria-label={isVisible ? "Hide password" : "Show password"}
            onClick={() => setIsVisible((visible) => !visible)}
            size="icon-xs"
            variant="ghost"
          >
            {isVisible ? <EyeOn /> : <EyeOff />}
          </InputGroupButton>
        </InputGroupAddon>
      ) : null}

      <style>{`.hide-password-toggle::-ms-reveal,
      .hide-password-toggle::-ms-clear {
        visibility: hidden;
        pointer-events: none;
        display: none;
      }`}</style>
    </InputGroup>
  );
}
