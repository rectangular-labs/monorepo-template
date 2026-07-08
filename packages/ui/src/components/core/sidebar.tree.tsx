import { CaretRightIcon } from "@phosphor-icons/react";
import { cn } from "@rectangular-labs/ui/utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./collapsible";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
} from "./sidebar";

type SidebarTreeNode =
  | {
      type: "item";
      id: string;
      title: React.ReactNode;
      url: string;
      icon?: React.ReactNode;
      active?: boolean;
    }
  | {
      type: "folder";
      id: string;
      title: React.ReactNode;
      url?: string;
      icon?: React.ReactNode;
      defaultOpen?: boolean;
      collapsible?: boolean;
      active?: boolean;
      children: SidebarTreeNode[];
    }
  | {
      type: "group";
      id: string;
      title?: React.ReactNode;
      icon?: React.ReactNode;
      children: SidebarTreeNode[];
    };

type SidebarTreeLinkNode = Extract<SidebarTreeNode, { type: "item" | "folder" }>;

type SidebarTreeProps = {
  nodes: SidebarTreeNode[];
  renderLink?: (props: {
    node: SidebarTreeLinkNode;
    children?: React.ReactNode;
    className?: string;
  }) => React.ReactElement;
};

type SidebarTreeNodeProps = {
  node: SidebarTreeNode;
  renderLink: NonNullable<SidebarTreeProps["renderLink"]>;
  level?: number;
};

const sidebarTreeCollapsibleStyles = [
  {
    group: "group/collapsible-0",
    icon: "group-data-open/collapsible-0:rotate-90",
  },
  {
    group: "group/collapsible-1",
    icon: "group-data-open/collapsible-1:rotate-90",
  },
  {
    group: "group/collapsible-2",
    icon: "group-data-open/collapsible-2:rotate-90",
  },
  {
    group: "group/collapsible-3",
    icon: "group-data-open/collapsible-3:rotate-90",
  },
  {
    group: "group/collapsible-4",
    icon: "group-data-open/collapsible-4:rotate-90",
  },
  {
    group: "group/collapsible-5",
    icon: "group-data-open/collapsible-5:rotate-90",
  },
  {
    group: "group/collapsible-6",
    icon: "group-data-open/collapsible-6:rotate-90",
  },
] as const;

function getSidebarTreeCollapsibleStyle(level: number) {
  return (
    sidebarTreeCollapsibleStyles[Math.min(level, sidebarTreeCollapsibleStyles.length - 1)] ??
    sidebarTreeCollapsibleStyles[0]
  );
}

const defaultRenderTreeLink: NonNullable<SidebarTreeProps["renderLink"]> = ({
  node,
  children,
  className,
}) => (
  <a className={className} href={node.url}>
    {children}
  </a>
);

function SidebarTree({ nodes, renderLink = defaultRenderTreeLink }: SidebarTreeProps) {
  return (
    <>
      {nodes.map((node) =>
        node.type === "group" ? (
          <SidebarTreeNodeItem key={node.id} node={node} renderLink={renderLink} />
        ) : (
          <SidebarGroup key={node.id}>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarTreeNodeItem node={node} renderLink={renderLink} />
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ),
      )}
    </>
  );
}

function SidebarTreeNodeItem({ node, renderLink, level = 0 }: SidebarTreeNodeProps) {
  if (node.type === "group") {
    return (
      <SidebarGroup>
        {node.title ? (
          <SidebarGroupLabel>
            {node.icon}
            {node.title}
          </SidebarGroupLabel>
        ) : null}
        <SidebarGroupContent>
          <SidebarMenu>
            {node.children.map((child) => (
              <SidebarTreeNodeItem
                key={child.id}
                node={child}
                renderLink={renderLink}
                level={level}
              />
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  }

  if (node.type === "item") {
    const content = (
      <>
        {node.icon}
        <span>{node.title}</span>
      </>
    );

    return (
      <SidebarMenuItem>
        <SidebarMenuButton
          {...(node.active === undefined ? {} : { isActive: node.active })}
          render={renderLink({
            node,
            children: content,
          })}
        />
      </SidebarMenuItem>
    );
  }

  const collapsible = node.collapsible !== false;
  const collapsibleStyle = getSidebarTreeCollapsibleStyle(level);
  const folderContent = (
    <>
      {node.icon}
      <span>{node.title}</span>
    </>
  );

  const caret = collapsible ? (
    <CaretRightIcon className={cn("size-4 transition-transform", collapsibleStyle.icon)} />
  ) : null;

  return (
    <SidebarMenuItem>
      <Collapsible
        className={collapsibleStyle.group}
        defaultOpen={node.defaultOpen || !collapsible}
        disabled={!collapsible}
      >
        <div className="relative w-full min-w-0">
          {node.url ? (
            <>
              <SidebarMenuButton
                className={collapsible ? "pe-8" : undefined}
                isActive={node.active}
                render={renderLink({
                  node,
                  children: folderContent,
                })}
              />
              {collapsible ? (
                <CollapsibleTrigger className="text-sidebar-foreground/70 absolute end-1 top-1 flex size-4 items-center justify-center group-data-[collapsible=icon]:hidden">
                  {caret}
                </CollapsibleTrigger>
              ) : null}
            </>
          ) : (
            <CollapsibleTrigger
              render={
                <SidebarMenuButton
                  {...(node.active === undefined ? {} : { isActive: node.active })}
                />
              }
            >
              {folderContent}
              <span className="text-sidebar-foreground/70 ms-auto flex size-4 items-center justify-center">
                {caret}
              </span>
            </CollapsibleTrigger>
          )}
        </div>
        <CollapsibleContent>
          <SidebarMenuSub>
            {node.children.map((child) => (
              <SidebarTreeNodeItem
                key={child.id}
                node={child}
                renderLink={renderLink}
                level={level + 1}
              />
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </Collapsible>
    </SidebarMenuItem>
  );
}

export { SidebarTree };
export type { SidebarTreeLinkNode, SidebarTreeNode, SidebarTreeProps };
