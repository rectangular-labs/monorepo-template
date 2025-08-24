"use client";

import { arktypeResolver } from "@hookform/resolvers/arktype";
import { type } from "arktype";
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

export function MagicLinkForm() {
  const { authClient, isSubmitting, setIsSubmitting } = useAuth();

  const schema = type({ email: "string.email >= 1" });

  const form = useForm({
    resolver: arktypeResolver(schema),
    defaultValues: {
      email: "",
    },
  });

  async function sendMagicLink({ email }: typeof schema.infer) {
    setIsSubmitting(true);
    const response = await authClient.signIn.magicLink({
      email,
      // TODO: set redirectTo for magic link
      callbackURL: "",
    });
    setIsSubmitting(false);

    if (response.error) {
      form.setError("root", {
        message: response.error.message ?? "Failed to send magic link",
      });
      return;
    }

    form.reset();
  }

  return (
    <Form {...form}>
      <form
        className={"grid w-full gap-6"}
        onSubmit={form.handleSubmit(sendMagicLink)}
      >
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>

              <FormControl>
                <Input
                  autoComplete="email webauthn"
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

        <Button className={"w-full"} isLoading={isSubmitting} type="submit">
          Send magic link
        </Button>
      </form>
    </Form>
  );
}
