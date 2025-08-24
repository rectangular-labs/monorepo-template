"use client";

import { arktypeResolver } from "@hookform/resolvers/arktype";
import { type } from "arktype";
import { useForm } from "react-hook-form";
import { cn } from "../../../utils/cn";
import { Button } from "../../ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../ui/form";
import { Input } from "../../ui/input";
import { toast } from "../../ui/sonner";
import { useAuth } from "../auth-provider";

export function ForgotPasswordForm() {
  const { authClient, isSubmitting, setIsSubmitting, setView, viewPaths } =
    useAuth();

  const form = useForm({
    resolver: arktypeResolver(
      type({
        email: "string.email >= 1",
      }),
    ),
    defaultValues: {
      email: "",
    },
  });

  async function forgotPassword({ email }: { email: string }) {
    setIsSubmitting(true);
    const response = await authClient.requestPasswordReset({
      email,
      // TODO: set redirectTo for password reset
      redirectTo: "",
    });
    setIsSubmitting(false);

    if (response.error) {
      form.setError("root", {
        message: response.error.message ?? "Failed to send reset link",
      });
      return;
    }

    toast.success("Please check your email for the reset link.");
  }

  return (
    <Form {...form}>
      <form
        className={"grid w-full gap-6"}
        onSubmit={form.handleSubmit(forgotPassword)}
      >
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>

              <FormControl>
                <Input
                  disabled={isSubmitting}
                  placeholder="you@example.com"
                  type="email"
                  {...field}
                />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        {form.formState.errors.root && (
          <div className="text-destructive text-sm" role="alert">
            {form.formState.errors.root.message}
          </div>
        )}

        <Button className={cn("w-full")} isLoading={isSubmitting} type="submit">
          Send reset link
        </Button>
      </form>
    </Form>
  );
}
