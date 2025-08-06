"use client";

import type React from "react";
import { createContext, useContext } from "react";
import { useTextareaResize } from "../../hooks/use-textarea-resize";
import { cn } from "../../utils/cn";
import { ArrowUp } from "../icon";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";

interface ChatInputContextValue {
  value?: string | undefined;
  onChange?: React.ChangeEventHandler<HTMLTextAreaElement> | undefined;
  onSubmit?: (() => void) | undefined;
  loading?: boolean | undefined;
  onStop?: (() => void) | undefined;
  variant?: "default" | "unstyled" | undefined;
  rows?: number | undefined;
}

const ChatInputContext = createContext<ChatInputContextValue>({});

interface ChatInputProps extends Omit<ChatInputContextValue, "variant"> {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "unstyled";
  rows?: number;
}

function ChatInput({
  children,
  className,
  variant = "default",
  value,
  onChange,
  onSubmit,
  loading,
  onStop,
  rows = 1,
}: ChatInputProps) {
  return (
    <ChatInputContext.Provider
      value={{
        value,
        onChange,
        onSubmit,
        loading,
        onStop,
        variant,
        rows,
      }}
    >
      <div
        className={cn(
          variant === "default" &&
            "flex w-full flex-col items-end rounded-2xl border border-input bg-transparent p-2 focus-within:outline-none focus-within:ring-1 focus-within:ring-ring",
          variant === "unstyled" && "flex w-full items-start gap-2",
          className,
        )}
      >
        {children}
      </div>
    </ChatInputContext.Provider>
  );
}

ChatInput.displayName = "ChatInput";

interface ChatInputTextAreaProps extends React.ComponentProps<typeof Textarea> {
  value?: string;
  onChange?: React.ChangeEventHandler<HTMLTextAreaElement>;
  onSubmit?: () => void;
  variant?: "default" | "unstyled";
}

function ChatInputTextArea({
  onSubmit: onSubmitProp,
  value: valueProp,
  onChange: onChangeProp,
  className,
  variant: variantProp,
  ...props
}: ChatInputTextAreaProps) {
  const context = useContext(ChatInputContext);
  const value = valueProp ?? context.value ?? "";
  const onChange = onChangeProp ?? context.onChange;
  const onSubmit = onSubmitProp ?? context.onSubmit;
  const rows = context.rows ?? 1;

  // Convert parent variant to textarea variant unless explicitly overridden
  const variant =
    variantProp ?? (context.variant === "default" ? "unstyled" : "default");

  const textareaRef = useTextareaResize(value, rows);
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!onSubmit) {
      return;
    }
    if (e.key === "Enter" && !e.shiftKey) {
      if (typeof value !== "string" || value.trim().length === 0) {
        return;
      }
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <Textarea
      ref={textareaRef}
      {...props}
      className={cn(
        "max-h-[400px] min-h-0 resize-none overflow-x-hidden",
        variant === "unstyled" &&
          "border-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0",
        className,
      )}
      onChange={onChange}
      onKeyDown={handleKeyDown}
      rows={rows}
      value={value}
    />
  );
}

ChatInputTextArea.displayName = "ChatInputTextArea";

interface ChatInputSubmitProps extends React.ComponentProps<typeof Button> {
  onSubmit?: () => void;
  loading?: boolean;
  onStop?: () => void;
}

function ChatInputSubmit({
  onSubmit: onSubmitProp,
  loading: loadingProp,
  onStop: onStopProp,
  className,
  ...props
}: ChatInputSubmitProps) {
  const context = useContext(ChatInputContext);
  const loading = loadingProp ?? context.loading;
  const onStop = onStopProp ?? context.onStop;
  const onSubmit = onSubmitProp ?? context.onSubmit;

  if (loading && onStop) {
    return (
      <Button
        className={className}
        onClick={onStop}
        size={"icon"}
        variant={"outline"}
        {...props}
      >
        <svg
          aria-label="Stop"
          fill="currentColor"
          height="24"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          width="24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <title>Stop</title>
          <rect height="12" width="12" x="6" y="6" />
        </svg>
      </Button>
    );
  }

  const isDisabled =
    typeof context.value !== "string" ||
    context.value.trim().length === 0 ||
    props.disabled;

  return (
    <Button
      className={className}
      disabled={isDisabled}
      onClick={(event) => {
        event.preventDefault();
        if (!isDisabled) {
          onSubmit?.();
        }
      }}
      size={"icon"}
      variant={"outline"}
      {...props}
    >
      <ArrowUp />
    </Button>
  );
}

ChatInputSubmit.displayName = "ChatInputSubmit";

export { ChatInput, ChatInputTextArea, ChatInputSubmit };
