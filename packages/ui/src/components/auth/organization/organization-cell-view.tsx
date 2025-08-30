"use client";

import { cn } from "../../../utils/cn";
import { Skeleton } from "../../ui/skeleton";
import {
  OrganizationLogo,
  type OrganizationLogoProps,
} from "./organization-logo";

export function OrganizationCellView({
  isPending,
  size,
  organization,
}: OrganizationLogoProps) {
  return (
    <div className={"flex items-center gap-2 truncate"}>
      <OrganizationLogo
        className={size !== "sm" ? "my-0.5" : undefined}
        isPending={isPending}
        organization={organization}
        size={size}
      />

      <div className={"flex flex-col truncate text-left leading-tight"}>
        {isPending ? (
          <>
            <Skeleton
              className={cn(
                "max-w-full",
                size === "lg" ? "h-4.5 w-32" : "h-3.5 w-24",
              )}
            />

            {size !== "sm" && (
              <Skeleton
                className={cn(
                  "mt-1.5 max-w-full",
                  size === "lg" ? "h-3.5 w-24" : "h-3 w-16",
                )}
              />
            )}
          </>
        ) : (
          <>
            <span
              className={cn(
                "truncate font-semibold",
                size === "lg" ? "text-base" : "text-sm",
              )}
            >
              {organization?.name}
            </span>

            {size !== "sm" && organization?.slug && (
              <span
                className={cn(
                  "truncate opacity-70",
                  size === "lg" ? "text-sm" : "text-xs",
                )}
              >
                {organization.slug}
              </span>
            )}
          </>
        )}
      </div>
    </div>
  );
}
