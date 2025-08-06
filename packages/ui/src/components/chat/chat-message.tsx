import { cva, type VariantProps } from "class-variance-authority";
import { SparklesIcon, UserIcon } from "lucide-react";
import React, { type ReactNode } from "react";
import { cn } from "../../utils/cn";
import { File } from "../icon";
import { MarkdownContent } from "./markdown-content";

const chatMessageVariants = cva("flex w-full gap-4", {
  variants: {
    variant: {
      default: "",
      bubble: "",
      full: "p-5",
    },
    type: {
      incoming: "mr-auto justify-start",
      outgoing: "ml-auto justify-end",
    },
  },
  compoundVariants: [
    {
      variant: "full",
      type: "outgoing",
      className: "bg-muted",
    },
    {
      variant: "full",
      type: "incoming",
      className: "bg-background",
    },
  ],
  defaultVariants: {
    variant: "default",
    type: "incoming",
  },
});

interface MessageContextValue extends VariantProps<typeof chatMessageVariants> {
  id: string;
}

const ChatMessageContext = React.createContext<MessageContextValue | null>(
  null,
);

const useChatMessage = () => {
  const context = React.useContext(ChatMessageContext);
  return context;
};

// Root component
interface ChatMessageProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof chatMessageVariants> {
  children?: React.ReactNode;
  id: string;
}

const ChatMessage = React.forwardRef<HTMLDivElement, ChatMessageProps>(
  (
    {
      className,
      variant = "default",
      type = "incoming",
      id,
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <ChatMessageContext.Provider value={{ variant, type, id }}>
        <div
          className={cn(chatMessageVariants({ variant, type, className }))}
          ref={ref}
          {...props}
        >
          {children}
        </div>
      </ChatMessageContext.Provider>
    );
  },
);
ChatMessage.displayName = "ChatMessage";

// Avatar component

const chatMessageAvatarVariants = cva(
  "flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-transparent ring-1",
  {
    variants: {
      type: {
        incoming: "ring-border",
        outgoing: "ring-muted-foreground/30",
      },
    },
    defaultVariants: {
      type: "incoming",
    },
  },
);

interface ChatMessageAvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  imageSrc?: string;
  icon?: ReactNode;
}

const ChatMessageAvatar = React.forwardRef<
  HTMLDivElement,
  ChatMessageAvatarProps
>(({ className, icon: iconProps, imageSrc, ...props }, ref) => {
  const context = useChatMessage();
  const type = context?.type ?? "incoming";
  const icon =
    iconProps ?? (type === "incoming" ? <SparklesIcon /> : <UserIcon />);
  return (
    <div
      className={cn(chatMessageAvatarVariants({ type, className }))}
      ref={ref}
      {...props}
    >
      {imageSrc ? (
        <img
          alt="Avatar"
          className="h-full w-full object-cover"
          src={imageSrc}
        />
      ) : (
        <div className="translate-y-px [&_svg]:size-4 [&_svg]:shrink-0">
          {icon}
        </div>
      )}
    </div>
  );
});
ChatMessageAvatar.displayName = "ChatMessageAvatar";

// Define the content part types here as well for component props
type TextPart = { type: "text"; text: string };
type ImagePart = { type: "image"; data: string; mimeType: string }; // Base64 data
type FilePart = {
  type: "file";
  data: string; // Base64 data
  mimeType: string;
  name?: string; // Add optional name for display
};
type MessageContentPart = TextPart | ImagePart | FilePart;

// Content component

const chatMessageContentVariants = cva("flex flex-col gap-2", {
  variants: {
    variant: {
      default: "",
      bubble: "rounded-xl px-3 py-2",
      full: "",
    },
    type: {
      incoming: "",
      outgoing: "",
    },
  },
  compoundVariants: [
    {
      variant: "bubble",
      type: "incoming",
      className: "bg-secondary text-secondary-foreground",
    },
    {
      variant: "bubble",
      type: "outgoing",
      className: "bg-primary text-primary-foreground",
    },
  ],
  defaultVariants: {
    variant: "default",
    type: "incoming",
  },
});

interface ChatMessageContentProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "content"> {
  id?: string;
  messageContent: string | MessageContentPart[];
}

const ChatMessageContent = React.forwardRef<
  HTMLDivElement,
  ChatMessageContentProps
>(({ className, messageContent, id: idProp, children, ...props }, ref) => {
  const context = useChatMessage();

  const variant = context?.variant ?? "default";
  const type = context?.type ?? "incoming";
  const id = idProp ?? context?.id ?? "";

  const renderContent = () => {
    if (typeof messageContent === "string") {
      return messageContent.length > 0 ? (
        <MarkdownContent content={messageContent} id={id} />
      ) : null;
    }

    if (Array.isArray(messageContent)) {
      return messageContent.map((part, index) => {
        const partId = `${id}-part-${index}`;
        switch (part.type) {
          case "text":
            return (
              <MarkdownContent content={part.text} id={partId} key={partId} />
            );
          case "image":
            return (
              <img
                alt="User uploaded content"
                className="mt-2 max-w-xs rounded-md border md:max-w-md"
                key={partId}
                src={`data:${part.mimeType};base64,${part.data}`}
              />
            );
          case "file":
            return (
              <div
                className="mt-2 flex items-center gap-2 rounded-md border bg-muted p-2 text-sm"
                key={partId}
              >
                <File className="h-5 w-5 shrink-0 text-muted-foreground" />
                <span className="truncate text-muted-foreground">
                  {part.name || "Attached File"}
                </span>
              </div>
            );
          default:
            return null;
        }
      });
    }

    return null;
  };

  return (
    <div
      className={cn(chatMessageContentVariants({ variant, type, className }))}
      ref={ref}
      {...props}
    >
      {renderContent()}
      {children}
    </div>
  );
});
ChatMessageContent.displayName = "ChatMessageContent";

export { ChatMessage, ChatMessageAvatar, ChatMessageContent };
