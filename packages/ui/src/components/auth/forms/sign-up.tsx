"use client";

import { arktypeResolver } from "@hookform/resolvers/arktype";
import { type } from "arktype";
import { useMemo } from "react";
import { useForm } from "react-hook-form";

import { cn } from "../../../utils/cn";
import { Button } from "../../ui/button";
import { Checkbox } from "../../ui/checkbox";
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
import { Textarea } from "../../ui/textarea";
import { useAuth } from "../auth-provider";
import { PasswordInput } from "../password-input";

export function SignUpForm() {
  const {
    authClient,
    viewPaths,
    view,
    setView,
    isSubmitting,
    setIsSubmitting,
    credentials,
    onSuccess,
  } = useAuth();

  const usernameEnabled = credentials?.useUsername;
  const confirmPasswordEnabled = credentials?.enableConfirmPassword;
  const additionalFields = credentials?.additionalFields ?? {};

  const baseSchema = type({
    email: "string.email >= 1",
    password: "string > 0",
    username: usernameEnabled ? "string > 0" : "undefined",
    confirmPassword: confirmPasswordEnabled ? "string > 0" : "undefined",
  }).narrow((n, ctx) => {
    if (n.confirmPassword?.length && n.confirmPassword !== n.password) {
      return ctx.mustBe("Passwords do not match");
    }
    return true;
  });

  const additionalSchema: Record<string, string> = {};
  for (const key of Object.keys(additionalFields)) {
    const config = additionalFields[key];
    if (!config) continue;
    additionalSchema[key] = config.type;
    if (!config.required && !config.default) {
      additionalSchema[key] += "|undefined";
    }
    if (config.default) {
      additionalSchema[key] += ` = ${config.default}`;
    }
  }
  const defaultValues = useMemo<typeof baseSchema.infer>(() => {
    const values: typeof baseSchema.infer &
      Record<string, number | string | boolean | undefined> = {
      email: "",
      password: "",
      username: usernameEnabled ? "" : undefined,
      confirmPassword: confirmPasswordEnabled ? "" : undefined,
    };

    for (const key of Object.keys(additionalFields)) {
      values[key] = undefined;
    }
    return values;
  }, [usernameEnabled, confirmPasswordEnabled, additionalFields]);

  const form = useForm<typeof baseSchema.infer>({
    resolver: arktypeResolver(
      type({
        "...": baseSchema,
        ...additionalSchema,
      }),
    ),
    defaultValues,
  });

  async function signUp(
    values: typeof baseSchema.infer &
      Record<string, number | string | boolean | undefined>,
  ) {
    for (const [key, cfg] of Object.entries(additionalFields)) {
      if (!cfg.validate) continue;
      const val = values[key];
      const ok = await Promise.resolve(cfg.validate(String(val ?? "")));
      if (!ok) {
        form.setError(key as keyof typeof baseSchema.infer, {
          message: `${cfg.label ?? key} is invalid`,
        });
        return;
      }
    }

    setIsSubmitting(true);
    const response = await authClient.signUp.email({
      ...values,
      email: values.email,
      password: values.password,
      name: (values.name as string) ?? "",
    });
    setIsSubmitting(false);

    if (response.error) {
      form.setError("root", {
        message:
          response.error.message ?? "Failed to sign up. Please try again.",
      });
      form.resetField("password");
      if (confirmPasswordEnabled) form.resetField("confirmPassword");
      return;
    }
    onSuccess?.();
    setView(viewPaths.SIGN_IN);
    toast.success("Account created successfully");
  }

  if (view !== viewPaths.SIGN_UP) return null;

  return (
    <Form {...form}>
      <form
        className={"grid w-full gap-6"}
        onSubmit={form.handleSubmit(signUp)}
      >
        {Object.keys(additionalFields).includes("name") && (
          <FormField
            control={form.control}
            name={"name" as keyof typeof baseSchema.infer}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input
                    disabled={isSubmitting}
                    placeholder="Your name"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {usernameEnabled && (
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input
                    autoComplete="username"
                    disabled={isSubmitting}
                    placeholder="Choose a username"
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
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  autoComplete="email"
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

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <PasswordInput
                  autoComplete="new-password"
                  disabled={isSubmitting}
                  enableToggle
                  placeholder="Password"
                  type="password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {credentials?.enableConfirmPassword && (
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
                    placeholder="Confirm Password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {Object.keys(additionalFields)
          .filter((key) => key !== "name")
          .map((key) => {
            const cfg = additionalFields[key];
            if (!cfg) {
              // should never happen
              return null;
            }
            // TODO: fix the type casting
            const castKey = key as keyof typeof baseSchema.infer;

            if (cfg.type === "boolean") {
              return (
                <FormField
                  control={form.control}
                  key={castKey}
                  name={castKey}
                  render={({ field: formField }) => {
                    console.log("formField.value", formField.value);
                    return (
                      <FormItem className="flex">
                        <FormControl>
                          <Checkbox
                            checked={Boolean(formField.value)}
                            disabled={isSubmitting}
                            onCheckedChange={formField.onChange}
                          />
                        </FormControl>

                        <FormLabel>{cfg.label ?? castKey}</FormLabel>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
              );
            }
            return (
              <FormField
                control={form.control}
                key={castKey}
                name={castKey}
                render={({ field: formField }) => (
                  <FormItem>
                    <FormLabel>{cfg.label ?? castKey}</FormLabel>
                    <FormControl>
                      {cfg.multiline ? (
                        <Textarea
                          disabled={isSubmitting}
                          placeholder={cfg.placeholder}
                          {...formField}
                        />
                      ) : (
                        <Input
                          disabled={isSubmitting}
                          placeholder={cfg.placeholder}
                          type={cfg.type === "number" ? "number" : "text"}
                          {...form.register(castKey)}
                        />
                      )}
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            );
          })}

        {form.formState.errors.root && (
          <div className="text-destructive text-sm" role="alert">
            {form.formState.errors.root.message}
          </div>
        )}

        <Button className={cn("w-full")} isLoading={isSubmitting} type="submit">
          Sign Up
        </Button>
      </form>
    </Form>
  );
}
