"use client";

import { arktypeResolver } from "@hookform/resolvers/arktype";
import { type } from "arktype";
import { Loader2 } from "lucide-react";
import type * as React from "react";
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
import { PhoneInput } from "../../ui/phone-input";

type IdentifierCaptureFormProps = {
  isDisabled?: boolean;
  submitText?: React.ReactNode | undefined;
  onSubmit?:
    | ((args: {
        medium: "email" | "phone";
        identifier: string;
      }) =>
        | { error: { message?: string } | null }
        | Promise<{ error: { message?: string } | null }>)
    | undefined;
  children?: React.ReactNode;
};

export function IdentifierCaptureForm({
  medium = "email",
  isDisabled = false,
  submitText = "Continue",
  onSubmit,
  children,
}: IdentifierCaptureFormProps & {
  medium: "email" | "phone";
}) {
  if (medium === "email") {
    return (
      <EmailForm
        isDisabled={isDisabled}
        onSubmit={onSubmit}
        submitText={submitText}
      >
        {children}
      </EmailForm>
    );
  }
  return (
    <PhoneForm
      isDisabled={isDisabled}
      onSubmit={onSubmit}
      submitText={submitText}
    >
      {children}
    </PhoneForm>
  );
}

function EmailForm({
  onSubmit,
  children,
  submitText,
  isDisabled,
}: IdentifierCaptureFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const schema = type({ email: "string.email >= 1" });
  const form = useForm({
    resolver: arktypeResolver(schema),
    defaultValues: { email: "" },
  });

  async function handleSubmit({ email }: typeof schema.infer) {
    setIsSubmitting(true);
    const response = await Promise.resolve(
      onSubmit?.({ medium: "email", identifier: email }),
    ).finally(() => {
      setIsSubmitting(false);
    });
    if (response?.error) {
      form.setError("root", {
        message:
          response.error.message ??
          "Something went wrong. Please try again later.",
      });
      return;
    }
  }

  return (
    <Form {...form}>
      <form
        className={"grid w-full gap-6"}
        onSubmit={form.handleSubmit(handleSubmit)}
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
          <FormMessage>{form.formState.errors.root.message}</FormMessage>
        )}
        {children ?? (
          <Button
            className={"w-full"}
            disabled={isSubmitting || isDisabled}
            type="submit"
          >
            {isSubmitting && <Loader2 className="animate-spin" />}
            {submitText}
          </Button>
        )}
      </form>
    </Form>
  );
}

function PhoneForm({
  onSubmit,
  children,
  submitText,
  isDisabled,
}: IdentifierCaptureFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const schema = type({ phone: "string >= 6" });
  const form = useForm({
    resolver: arktypeResolver(schema),
    defaultValues: { phone: "" },
  });

  async function handleSubmit({ phone }: typeof schema.infer) {
    setIsSubmitting(true);
    const response = await Promise.resolve(
      onSubmit?.({ medium: "phone", identifier: phone }),
    ).finally(() => {
      setIsSubmitting(false);
    });
    if (response?.error) {
      form.setError("root", {
        message:
          response.error.message ??
          "Something went wrong. Please try again later.",
      });
      return;
    }
  }

  return (
    <Form {...form}>
      <form
        className={"grid w-full gap-6"}
        onSubmit={form.handleSubmit(handleSubmit)}
      >
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone number</FormLabel>
              <FormControl>
                <PhoneInput
                  defaultCountry="US"
                  placeholder="(555) 123-4567"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {form.formState.errors.root && (
          <FormMessage>{form.formState.errors.root.message}</FormMessage>
        )}
        {children ?? (
          <Button
            className={"w-full"}
            disabled={isSubmitting || isDisabled}
            type="submit"
          >
            {isSubmitting && <Loader2 className="animate-spin" />}
            {submitText}
          </Button>
        )}
      </form>
    </Form>
  );
}
