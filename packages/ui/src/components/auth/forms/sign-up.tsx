"use client";

import { cn } from "@rectangular-labs/ui/utils";
import { type } from "arktype";
import { useMemo, useState } from "react";
import { Checkbox } from "../../core/checkbox";
import { Field, FieldContent, FieldError, FieldLabel } from "../../core/field";
import { Input } from "../../core/input";
import { toast } from "../../core/sonner";
import { Textarea } from "../../core/textarea";
import {
  clearFormError,
  setFieldError,
  setFormError,
  toFieldErrors,
  useAppForm,
} from "../../ui/tanstack-form";
import type { AdditionalField } from "../auth-provider";
import { type AuthViewPath, useAuth } from "../auth-provider";
import { PasswordInput } from "../password-input";
import { PasswordSchema } from "../schema/password";
import type { VerificationInfo } from "./verification-form";

function getAdditionalFieldDefaultValue(config: AdditionalField) {
  if (config.default !== undefined) {
    return config.default;
  }

  return undefined;
}

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
  type SignUpFormValues = {
    confirmPassword: string | undefined;
    email: string;
    name: string | undefined;
    password: string;
    username: string | undefined;
  } & Record<string, boolean | number | string | undefined>;

  const baseSchema = type({
    email: "string.email >= 1",
    password: PasswordSchema,
    username: usernameEnabled ? "string >= 3" : "undefined",
    confirmPassword: confirmPasswordEnabled ? PasswordSchema : type("undefined"),
  });

  const additionalSchema: Record<string, string> = {};
  for (const key of Object.keys(additionalFields)) {
    const config = additionalFields[key];
    if (!config) continue;
    additionalSchema[key] = config.type;
    if (!config.required && config.default === undefined) {
      additionalSchema[key] += "|undefined";
    }
    if (config.default !== undefined) {
      additionalSchema[key] += ` = ${config.default}`;
    }
  }

  const schema = type({
    "...": baseSchema,
    ...additionalSchema,
  }).narrow((value, ctx) => {
    if (value.confirmPassword?.length && value.confirmPassword !== value.password) {
      return ctx.reject({
        message: "Passwords do not match",
        path: ["confirmPassword"],
      });
    }
    return true;
  });

  const defaultValues = useMemo<SignUpFormValues>(() => {
    const values: SignUpFormValues = {
      confirmPassword: confirmPasswordEnabled ? "" : undefined,
      email: "",
      name: Object.hasOwn(credentials?.additionalFields ?? {}, "name") ? "" : undefined,
      password: "",
      username: usernameEnabled ? "" : undefined,
    };

    for (const [key, config] of Object.entries(credentials?.additionalFields ?? {})) {
      values[key] = key === "name" ? values.name : getAdditionalFieldDefaultValue(config);
    }

    return values;
  }, [confirmPasswordEnabled, credentials?.additionalFields, usernameEnabled]);

  const form = useAppForm({
    defaultValues,
    listeners: {
      onChange: ({ formApi }) => clearFormError(formApi),
    },
    onSubmit: async ({ formApi, value }) => {
      for (const [key, config] of Object.entries(additionalFields)) {
        if (!config.validate) continue;

        const isValid = await Promise.resolve(config.validate(String(value[key] ?? "")));
        if (!isValid) {
          setFieldError<typeof defaultValues>(
            formApi,
            key as keyof typeof defaultValues,
            `${config.label ?? key} is invalid`,
          );
          return;
        }
      }

      setShouldDisable(true);
      setIsSubmitting(true);

      const response = await authClient.signUp.email({
        ...value,
        email: value.email,
        name: typeof value.name === "string" ? value.name : "",
        password: value.password,
      });

      setIsSubmitting(false);
      setShouldDisable(false);

      if (response.error) {
        if (response.error.code === "PASSWORD_COMPROMISED") {
          setFieldError<typeof defaultValues>(
            formApi,
            "password",
            response.error.message ??
              "Password has been compromised. Please choose a different one.",
          );
          formApi.resetField("password");
          if (confirmPasswordEnabled) {
            formApi.resetField("confirmPassword");
          }
          return;
        }

        setFormError(formApi, response.error.message ?? "Failed to sign up. Please try again.");
        return;
      }

      if (!response.data.token) {
        if (credentials?.verificationMode === "code") {
          setView(viewPaths.IDENTITY_VERIFICATION);
          setVerificationInfo({
            identifier: value.email,
            mode: "verification-email-code",
          });
        }
        if (credentials?.verificationMode === "token") {
          setView(viewPaths.IDENTITY_VERIFICATION);
          setVerificationInfo({
            identifier: value.email,
            mode: "verification-email-token",
          });
        }
        return;
      }

      toast.success("Account created successfully");
      await successHandler();
    },
    validators: {
      onChange: schema,
      onSubmit: schema,
    },
  });

  if (!credentials) {
    console.warn(
      "Rendering the sign up form but credentials was set to `undefined` in the `AuthProvider`.",
    );
    return null;
  }

  return (
    <form.AppForm>
      <form
        className="grid w-full gap-6"
        onSubmit={(event) => {
          event.preventDefault();
          void form.handleSubmit();
        }}
      >
        {Object.hasOwn(additionalFields, "name") ? (
          <form.AppField name="name">
            {(field) => {
              const errors = toFieldErrors(field.state.meta.errors);
              return (
                <Field
                  data-disabled={isSubmitting || shouldDisable ? true : undefined}
                  data-invalid={errors.length > 0 ? true : undefined}
                >
                  <FieldLabel htmlFor={field.name}>Name</FieldLabel>
                  <FieldContent>
                    <Input
                      disabled={isSubmitting || shouldDisable}
                      id={field.name}
                      name={field.name}
                      onBlur={field.handleBlur}
                      onChange={(event) => {
                        field.handleChange(event.currentTarget.value as never);
                        field.setErrorMap({ onSubmit: undefined });
                      }}
                      placeholder="Your name"
                      value={typeof field.state.value === "string" ? field.state.value : ""}
                    />
                    <FieldError errors={errors} />
                  </FieldContent>
                </Field>
              );
            }}
          </form.AppField>
        ) : null}

        {usernameEnabled ? (
          <form.AppField name="username">
            {(field) => {
              const errors = toFieldErrors(field.state.meta.errors);
              return (
                <Field
                  data-disabled={isSubmitting || shouldDisable ? true : undefined}
                  data-invalid={errors.length > 0 ? true : undefined}
                >
                  <FieldLabel htmlFor={field.name}>Username</FieldLabel>
                  <FieldContent>
                    <Input
                      autoComplete="username"
                      disabled={isSubmitting || shouldDisable}
                      id={field.name}
                      name={field.name}
                      onBlur={field.handleBlur}
                      onChange={(event) => {
                        field.handleChange(event.currentTarget.value as never);
                        field.setErrorMap({ onSubmit: undefined });
                      }}
                      placeholder="Choose a username"
                      value={typeof field.state.value === "string" ? field.state.value : ""}
                    />
                    <FieldError errors={errors} />
                  </FieldContent>
                </Field>
              );
            }}
          </form.AppField>
        ) : null}

        <form.AppField name="email">
          {(field) => {
            const errors = toFieldErrors(field.state.meta.errors);
            return (
              <Field
                data-disabled={isSubmitting || shouldDisable ? true : undefined}
                data-invalid={errors.length > 0 ? true : undefined}
              >
                <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                <FieldContent>
                  <Input
                    autoComplete="email"
                    disabled={isSubmitting || shouldDisable}
                    id={field.name}
                    name={field.name}
                    onBlur={field.handleBlur}
                    onChange={(event) => {
                      field.handleChange(event.currentTarget.value as never);
                      field.setErrorMap({ onSubmit: undefined });
                    }}
                    placeholder="you@example.com"
                    type="email"
                    value={typeof field.state.value === "string" ? field.state.value : ""}
                  />
                  <FieldError errors={errors} />
                </FieldContent>
              </Field>
            );
          }}
        </form.AppField>

        <form.AppField name="password">
          {(field) => {
            const errors = toFieldErrors(field.state.meta.errors);
            return (
              <Field
                data-disabled={isSubmitting || shouldDisable ? true : undefined}
                data-invalid={errors.length > 0 ? true : undefined}
              >
                <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                <FieldContent>
                  <PasswordInput
                    autoComplete="new-password"
                    disabled={isSubmitting || shouldDisable}
                    enableToggle
                    id={field.name}
                    name={field.name}
                    onBlur={field.handleBlur}
                    onChange={(event) => {
                      field.handleChange(event.currentTarget.value as never);
                      field.setErrorMap({ onSubmit: undefined });
                    }}
                    placeholder="Password"
                    value={typeof field.state.value === "string" ? field.state.value : ""}
                  />
                  <FieldError errors={errors} />
                </FieldContent>
              </Field>
            );
          }}
        </form.AppField>

        {confirmPasswordEnabled ? (
          <form.AppField name="confirmPassword">
            {(field) => {
              const errors = toFieldErrors(field.state.meta.errors);
              return (
                <Field
                  data-disabled={isSubmitting || shouldDisable ? true : undefined}
                  data-invalid={errors.length > 0 ? true : undefined}
                >
                  <FieldLabel htmlFor={field.name}>Confirm password</FieldLabel>
                  <FieldContent>
                    <PasswordInput
                      autoComplete="new-password"
                      disabled={isSubmitting || shouldDisable}
                      enableToggle
                      id={field.name}
                      name={field.name}
                      onBlur={field.handleBlur}
                      onChange={(event) => {
                        field.handleChange(event.currentTarget.value as never);
                        field.setErrorMap({ onSubmit: undefined });
                      }}
                      placeholder="Confirm password"
                      value={typeof field.state.value === "string" ? field.state.value : ""}
                    />
                    <FieldError errors={errors} />
                  </FieldContent>
                </Field>
              );
            }}
          </form.AppField>
        ) : null}

        {Object.entries(additionalFields)
          .filter(([key]) => key !== "name")
          .map(([key, config]) => {
            const castKey = key as keyof typeof defaultValues;
            if (config.type === "boolean") {
              return (
                <form.AppField key={key} name={castKey}>
                  {(field) => {
                    const errors = toFieldErrors(field.state.meta.errors);
                    return (
                      <Field
                        data-disabled={isSubmitting || shouldDisable ? true : undefined}
                        data-invalid={errors.length > 0 ? true : undefined}
                        orientation="horizontal"
                      >
                        <Checkbox
                          checked={Boolean(field.state.value)}
                          disabled={isSubmitting || shouldDisable}
                          id={field.name}
                          name={field.name}
                          onBlur={field.handleBlur}
                          onCheckedChange={(checked) => {
                            field.handleChange(Boolean(checked) as never);
                            field.setErrorMap({ onSubmit: undefined });
                          }}
                        />
                        <FieldContent>
                          <FieldLabel htmlFor={field.name}>{config.label ?? key}</FieldLabel>
                          <FieldError errors={errors} />
                        </FieldContent>
                      </Field>
                    );
                  }}
                </form.AppField>
              );
            }

            if (config.multiline) {
              return (
                <form.AppField key={key} name={castKey}>
                  {(field) => {
                    const errors = toFieldErrors(field.state.meta.errors);
                    return (
                      <Field
                        data-disabled={isSubmitting || shouldDisable ? true : undefined}
                        data-invalid={errors.length > 0 ? true : undefined}
                      >
                        <FieldLabel htmlFor={field.name}>{config.label ?? key}</FieldLabel>
                        <FieldContent>
                          <Textarea
                            disabled={isSubmitting || shouldDisable}
                            id={field.name}
                            name={field.name}
                            onBlur={field.handleBlur}
                            onChange={(event) => {
                              field.handleChange(event.currentTarget.value as never);
                              field.setErrorMap({ onSubmit: undefined });
                            }}
                            placeholder={config.placeholder}
                            value={typeof field.state.value === "string" ? field.state.value : ""}
                          />
                          <FieldError errors={errors} />
                        </FieldContent>
                      </Field>
                    );
                  }}
                </form.AppField>
              );
            }

            return (
              <form.AppField key={key} name={castKey}>
                {(field) => {
                  if (config.type === "number") {
                    const errors = toFieldErrors(field.state.meta.errors);
                    return (
                      <Field
                        data-disabled={isSubmitting || shouldDisable ? true : undefined}
                        data-invalid={errors.length > 0 ? true : undefined}
                      >
                        <FieldLabel htmlFor={field.name}>{config.label ?? key}</FieldLabel>
                        <FieldContent>
                          <Input
                            disabled={isSubmitting || shouldDisable}
                            id={field.name}
                            name={field.name}
                            onBlur={field.handleBlur}
                            onChange={(event) => {
                              const nextValue = event.target.value;
                              field.handleChange(
                                (nextValue === "" ? undefined : Number(nextValue)) as never,
                              );
                              field.setErrorMap({ onSubmit: undefined });
                            }}
                            placeholder={config.placeholder}
                            type="number"
                            value={
                              typeof field.state.value === "number" ? String(field.state.value) : ""
                            }
                          />
                          <FieldError errors={errors} />
                        </FieldContent>
                      </Field>
                    );
                  }

                  return (
                    <Field
                      data-disabled={isSubmitting || shouldDisable ? true : undefined}
                      data-invalid={
                        toFieldErrors(field.state.meta.errors).length > 0 ? true : undefined
                      }
                    >
                      <FieldLabel htmlFor={field.name}>{config.label ?? key}</FieldLabel>
                      <FieldContent>
                        <Input
                          disabled={isSubmitting || shouldDisable}
                          id={field.name}
                          name={field.name}
                          onBlur={field.handleBlur}
                          onChange={(event) => {
                            field.handleChange(event.currentTarget.value as never);
                            field.setErrorMap({ onSubmit: undefined });
                          }}
                          placeholder={config.placeholder}
                          value={typeof field.state.value === "string" ? field.state.value : ""}
                        />
                        <FieldError errors={toFieldErrors(field.state.meta.errors)} />
                      </FieldContent>
                    </Field>
                  );
                }}
              </form.AppField>
            );
          })}

        <form.Subscribe selector={(state) => state.errorMap.onSubmit}>
          {(error) => <FieldError errors={toFieldErrors(error)} />}
        </form.Subscribe>

        <form.SubmitButton className={cn("w-full")} disabled={shouldDisable}>
          Sign Up
        </form.SubmitButton>
      </form>
    </form.AppForm>
  );
}
