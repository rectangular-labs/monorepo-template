import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";
import { useScrollToBottom } from "../../hooks/use-scroll-to-bottom";
import { cn } from "../../utils/cn";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";

type ScrollButtonAlignment = "left" | "center" | "right";

interface ScrollButtonProps {
  onClick: () => void;
  alignment?: ScrollButtonAlignment;
  className?: string;
}

export function ScrollButton({
  onClick,
  alignment = "right",
  className,
}: ScrollButtonProps) {
  const alignmentClasses = {
    left: "left-4",
    center: "left-1/2 -translate-x-1/2",
    right: "right-4",
  };

  return (
    <Button
      className={cn(
        "absolute bottom-4 rounded-full shadow-lg hover:bg-secondary",
        alignmentClasses[alignment],
        className,
      )}
      onClick={onClick}
      size="icon"
      variant="secondary"
    >
      <ChevronDown className="h-4 w-4" />
    </Button>
  );
}

interface ChatMessageAreaProps {
  children: ReactNode;
  className?: string;
  scrollButtonAlignment?: ScrollButtonAlignment;
}

export function ChatMessageArea({
  children,
  className,
  scrollButtonAlignment = "right",
}: ChatMessageAreaProps) {
  const [containerRef, showScrollButton, scrollToBottom] =
    useScrollToBottom<HTMLDivElement>();

  return (
    <ScrollArea className="relative">
      <div ref={containerRef}>
        <div className={cn(className, "min-h-0")}>{children}</div>
      </div>
      {showScrollButton && (
        <ScrollButton
          alignment={scrollButtonAlignment}
          className="absolute bottom-4 rounded-full shadow-lg hover:bg-secondary"
          onClick={scrollToBottom}
        />
      )}
    </ScrollArea>
  );
}

ChatMessageArea.displayName = "ChatMessageArea";
