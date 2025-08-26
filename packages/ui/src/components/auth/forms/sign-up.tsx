"use client";

import { arktypeResolver } from "@hookform/resolvers/arktype";
import { type } from "arktype";
import { Loader2 } from "lucide-react";
import { useMemo, useState } from "react";
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
import { type AuthViewPath, useAuth } from "../auth-provider";
import { PasswordInput } from "../password-input";
import { PasswordSchema } from "../schema/password";
import type { VerificationInfo } from "./verification-form";

export function SignUpForm({
  setView,
  shouldDisable,
  setShouldDisable,
  setVerificationInfo,
}: {
  setView: (view: AuthViewPath) => void;
  shouldDisable: boolean;
  setShouldDisable: (disabled: boolean) => void;
  setVerificationInfo: (verificationInfo: VerificationInfo) => void;
}) {
  const { authClient, viewPaths, credentials, successHandler } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const usernameEnabled = credentials?.useUsername;
  const confirmPasswordEnabled = credentials?.enableConfirmPassword;
  const additionalFields = credentials?.additionalFields ?? {};

  const baseSchema = type({
    email: "string.email >= 1",
    password: PasswordSchema,
    username: usernameEnabled ? "string >= 3" : "undefined",
    confirmPassword: confirmPasswordEnabled
      ? PasswordSchema
      : type("undefined"),
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
      }).narrow((n, ctx) => {
        if (n.confirmPassword?.length && n.confirmPassword !== n.password) {
          return ctx.reject({
            message: "Passwords do not match",
            path: ["confirmPassword"],
          });
        }
        return true;
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

    setShouldDisable(true);
    setIsSubmitting(true);
    const response = await authClient.signUp.email({
      ...values,
      email: values.email,
      password: values.password,
      name: (values.name as string) ?? "",
    });
    setIsSubmitting(false);
    setShouldDisable(false);

    if (response.error) {
      if (response.error.code === "PASSWORD_COMPROMISED") {
        form.setError("password", {
          message:
            response.error.message ??
            "Password has been compromised. Please choose a different one.",
        });
        form.resetField("password");
        if (confirmPasswordEnabled) form.resetField("confirmPassword");
        return;
      }

      form.setError("root", {
        message:
          response.error.message ?? "Failed to sign up. Please try again.",
      });
      return;
    }

    if (!response.data.token) {
      // Handle email verification case
      if (credentials?.verificationMode === "code") {
        setView(viewPaths.IDENTITY_VERIFICATION);
        setVerificationInfo({
          mode: "verification-email-code",
          identifier: values.email,
        });
      }
      if (credentials?.verificationMode === "token") {
        setView(viewPaths.IDENTITY_VERIFICATION);
        setVerificationInfo({
          mode: "verification-email-token",
          identifier: values.email,
        });
      }
      return;
    }

    toast.success("Account created successfully");
    await successHandler();
  }

  if (!credentials) {
    console.warn(
      "Rendering the sign up form but credentials was set to `undefined` in the `AuthProvider`.",
    );
    return null;
  }

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
                    disabled={isSubmitting || shouldDisable}
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
                    disabled={isSubmitting || shouldDisable}
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
                  disabled={isSubmitting || shouldDisable}
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
                  disabled={isSubmitting || shouldDisable}
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
                    disabled={isSubmitting || shouldDisable}
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
                            disabled={isSubmitting || shouldDisable}
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
                          disabled={isSubmitting || shouldDisable}
                          placeholder={cfg.placeholder}
                          {...formField}
                        />
                      ) : (
                        <Input
                          disabled={isSubmitting || shouldDisable}
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
          <FormMessage>{form.formState.errors.root.message}</FormMessage>
        )}

        <Button
          className={cn("w-full")}
          disabled={isSubmitting || shouldDisable}
          type="submit"
        >
          {isSubmitting && <Loader2 className="animate-spin" />}
          Sign Up
        </Button>
      </form>
    </Form>
  );
}
