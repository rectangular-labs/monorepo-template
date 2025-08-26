"use client";

import { arktypeResolver } from "@hookform/resolvers/arktype";
import { type } from "arktype";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "../../ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../ui/form";
import { toast } from "../../ui/sonner";
import { useAuth } from "../auth-provider";
import { PasswordInput } from "../password-input";
import { PasswordSchema } from "../schema/password";

type ChangePasswordProps = { onComplete?: () => void | Promise<void> } & (
  | {
      mode: "update";
    }
  | {
      mode: "reset-code";
      email: string;
      code: string;
    }
  | {
      mode: "reset-token";
      token: string;
    }
);

export function ChangePasswordForm(props: ChangePasswordProps) {
  const { authClient, credentials } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const confirmPasswordEnabled = credentials?.enableConfirmPassword;
  const schema = type({
    oldPassword: props.mode === "update" ? PasswordSchema : type("undefined"),
    newPassword: PasswordSchema,
    confirmPassword: confirmPasswordEnabled
      ? PasswordSchema
      : type("undefined"),
  }).narrow((n, ctx) => {
    if (n.confirmPassword?.length && n.confirmPassword !== n.newPassword) {
      return ctx.reject({
        message: "Passwords do not match",
        path: ["confirmPassword"],
      });
    }
    return true;
  });

  const form = useForm({
    resolver: arktypeResolver(schema),
    defaultValues: {
      oldPassword: props.mode === "update" ? "" : undefined,
      newPassword: "",
      confirmPassword: confirmPasswordEnabled ? "" : undefined,
    },
  });

  async function handleSubmit(values: typeof schema.infer) {
    setIsSubmitting(true);
    const response = await (() => {
      if (props.mode === "update") {
        return authClient.changePassword({
          newPassword: values.newPassword,
          currentPassword: values.oldPassword ?? "",
          revokeOtherSessions: true,
        });
      }
      if (props.mode === "reset-token") {
        return authClient.resetPassword({
          newPassword: values.newPassword,
          token: props.token,
        });
      }
      if (props.mode === "reset-code") {
        return authClient.emailOtp.resetPassword({
          email: props.email,
          otp: props.code,
          password: values.newPassword,
        });
      }
      const _never: never = props;
      throw new Error("Invalid mode");
    })();
    setIsSubmitting(false);

    if (response.error) {
      form.setError("root", {
        message:
          response.error.message ??
          "Failed to change password. Please try again later.",
      });
      return;
    }
    await Promise.resolve(props.onComplete?.());

    toast.success("Password updated successfully");
    form.reset();
  }

  return (
    <Form {...form}>
      <form
        className={"grid w-full gap-6"}
        onSubmit={form.handleSubmit(handleSubmit)}
      >
        {props.mode === "update" && (
          <FormField
            control={form.control}
            name="oldPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Current password</FormLabel>
                <FormControl>
                  <PasswordInput
                    autoComplete="current-password"
                    disabled={isSubmitting}
                    enableToggle
                    placeholder="Your current password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="newPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New password</FormLabel>

              <FormControl>
                <PasswordInput
                  autoComplete="new-password"
                  disabled={isSubmitting}
                  enableToggle
                  placeholder="At least 8 characters"
                  {...field}
                />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        {confirmPasswordEnabled && (
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm password</FormLabel>

                <FormControl>
                  <PasswordInput
                    autoComplete="new-password"
                    disabled={isSubmitting}
                    enableToggle
                    placeholder="Repeat new password"
                    {...field}
                  />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {form.formState.errors.root && (
          <FormMessage>{form.formState.errors.root.message}</FormMessage>
        )}

        <Button className={"w-full"} disabled={isSubmitting} type="submit">
          {isSubmitting && <Loader2 className="animate-spin" />}
          {props.mode === "update" ? "Update password" : "Reset password"}
        </Button>
      </form>
    </Form>
  );
}
