"use client";
import { arktypeResolver } from "@hookform/resolvers/arktype";
import { type } from "arktype";
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
import { Input } from "../../ui/input";
import { useAuth } from "../auth-provider";

export function RecoverAccountForm() {
  const { authClient, onSuccess } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const schema = type({ code: "string > 0" });

  const form = useForm({
    resolver: arktypeResolver(schema),
    defaultValues: { code: "" },
  });

  async function verifyBackupCode({ code }: typeof schema.infer) {
    setIsSubmitting(true);
    const response = await authClient.twoFactor.verifyBackupCode({
      code,
    });
    setIsSubmitting(false);

    if (response.error) {
      form.setError("code", {
        message: response.error.message ?? "Failed to verify backup code",
      });
      form.resetField("code");
      return;
    }

    // TODO: handle success / redirect to callbackURL
    onSuccess?.();
  }

  return (
    <Form {...form}>
      <form
        className={"grid w-full gap-6"}
        onSubmit={form.handleSubmit(verifyBackupCode)}
      >
        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Backup code</FormLabel>

              <FormControl>
                <Input
                  autoComplete="off"
                  disabled={isSubmitting}
                  placeholder="Your backup code"
                  {...field}
                />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <Button isLoading={isSubmitting} type="submit">
          Recover account
        </Button>
      </form>
    </Form>
  );
}
