"use client";

import { arktypeResolver } from "@hookform/resolvers/arktype";
import { type } from "arktype";
import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";

// use standard input instead of PasswordInput to avoid missing dependency issues
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

export function ResetPasswordForm() {
  const tokenChecked = useRef(false);
  const {
    authClient,
    setView,
    viewPaths,
    credentials,
    isSubmitting,
    setIsSubmitting,
  } = useAuth();

  const confirmPasswordEnabled = credentials?.enableConfirmPassword;
  const schema = type({
    newPassword: "string >= 8",
    confirmPassword: confirmPasswordEnabled ? "string" : "undefined",
  }).narrow((n, ctx) => {
    if (n.confirmPassword?.length && n.confirmPassword !== n.newPassword) {
      return ctx.mustBe("Passwords do not match");
    }
    return true;
  });

  const form = useForm({
    resolver: arktypeResolver(schema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (tokenChecked.current) return;
    tokenChecked.current = true;

    const searchParams = new URLSearchParams(window.location.search);
    const token = searchParams.get("token");
    if (!token || token === "INVALID_TOKEN") {
      setView(viewPaths.SIGN_IN);
      toast.error("Invalid token, please try resetting your password again.");
    }
  }, [setView, viewPaths]);

  async function resetPassword({ newPassword }: typeof schema.infer) {
    const searchParams = new URLSearchParams(window.location.search);
    const token = searchParams.get("token");
    if (!token) {
      setView(viewPaths.SIGN_IN);
      toast.error("Invalid token, please try resetting your password again.");
      return;
    }

    setIsSubmitting(true);
    const response = await authClient.resetPassword({
      newPassword,
      token,
    });
    setIsSubmitting(false);

    if (response.error) {
      toast.error(
        response.error.message ?? "Failed to reset password, please try again.",
      );
      form.reset();
      return;
    }

    toast.success("Password reset successfully");
    setView(viewPaths.SIGN_IN);
  }

  return (
    <Form {...form}>
      <form
        className={"grid w-full gap-6"}
        onSubmit={form.handleSubmit(resetPassword)}
      >
        <FormField
          control={form.control}
          name="newPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New password</FormLabel>

              <FormControl>
                <input
                  autoComplete="new-password"
                  disabled={isSubmitting}
                  placeholder="At least 8 characters"
                  type="password"
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
                  <input
                    autoComplete="new-password"
                    disabled={isSubmitting}
                    placeholder="Repeat new password"
                    type="password"
                    {...field}
                  />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <Button className={"w-full"} isLoading={isSubmitting} type="submit">
          Reset password
        </Button>
      </form>
    </Form>
  );
}
