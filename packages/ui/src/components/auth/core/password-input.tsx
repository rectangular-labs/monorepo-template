"use client";

import { EyeIcon, EyeSlashIcon } from "@phosphor-icons/react";
import { type ComponentProps, useState } from "react";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "../../core/input-group";

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
            {isVisible ? <EyeIcon /> : <EyeSlashIcon />}
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
