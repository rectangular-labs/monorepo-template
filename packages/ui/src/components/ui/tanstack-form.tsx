"use client";

import {
  createFormHook,
  createFormHookContexts,
  type AnyFormApi,
  type DeepKeys,
  type FieldApi,
} from "@tanstack/react-form";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { Button } from "../core/button";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldSet,
} from "../core/field";

type ErrorLike = {
  message?: string;
  summary?: string;
};

type TypedFieldApi<TValue> = FieldApi<
  any,
  any,
  TValue,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any
>;

type FormFieldProps<TValue, TProps extends Record<string, unknown> = {}> = TProps & {
  field: TypedFieldApi<TValue>;
};

const { fieldContext, formContext, useFormContext } = createFormHookContexts();

const fieldShellVariants = cva("", {
  variants: {
    size: {
      xs: "",
      sm: "",
      default: "",
      lg: "",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

const fieldLabelVariants = cva("", {
  variants: {
    size: {
      xs: "text-xs",
      sm: "text-sm",
      default: "",
      lg: "text-base/relaxed",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

const fieldDescriptionVariants = cva("", {
  variants: {
    size: {
      xs: "text-[11px]",
      sm: "text-xs",
      default: "",
      lg: "text-sm/relaxed",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

const fieldErrorVariants = cva("", {
  variants: {
    size: {
      xs: "text-[11px]",
      sm: "text-xs",
      default: "",
      lg: "text-sm",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

type FieldShellVariantProps = VariantProps<typeof fieldShellVariants> &
  VariantProps<typeof fieldLabelVariants> &
  VariantProps<typeof fieldDescriptionVariants> &
  VariantProps<typeof fieldErrorVariants>;

type FieldShellOrientation =
  | Extract<React.ComponentProps<typeof Field>["orientation"], "vertical" | "responsive">
  | "horizontal-start"
  | "horizontal-end";

type FieldShellProps<TValue> = FormFieldProps<
  TValue,
  {
    children: React.ReactNode;
    description?: React.ReactNode | undefined;
    label?: React.ReactNode | undefined;
    orientation?: FieldShellOrientation | undefined;
  } & FieldShellVariantProps
>;

function collectErrorMessages(error: unknown, messages: Set<string>) {
  if (!error) return;

  if (typeof error === "string") {
    messages.add(error);
    return;
  }

  if (Array.isArray(error)) {
    for (const entry of error) {
      collectErrorMessages(entry, messages);
    }
    return;
  }

  if (typeof error === "object") {
    const { message, summary } = error as ErrorLike;
    if (typeof message === "string" && message.length > 0) {
      messages.add(message);
    }
    if (typeof summary === "string" && summary.length > 0) {
      messages.add(summary);
    }
  }
}

function FieldShell<TValue>({
  children,
  description,
  field,
  label,
  orientation = "responsive",
  size = "default",
}: FieldShellProps<TValue>) {
  const fieldOrientation =
    orientation === "horizontal-start" || orientation === "horizontal-end"
      ? "horizontal"
      : orientation;
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
  const errors = toFieldErrors(field.state.meta.errors);

  return (
    <Field
      className={fieldShellVariants({ size })}
      data-invalid={isInvalid ? true : undefined}
      orientation={fieldOrientation}
    >
      {orientation === "horizontal-end" ? children : null}
      <FieldContent>
        {label ? <FieldLabel className={fieldLabelVariants({ size })}>{label}</FieldLabel> : null}
        {fieldOrientation === "vertical" ? children : null}
        {description ? (
          <FieldDescription className={fieldDescriptionVariants({ size })}>
            {description}
          </FieldDescription>
        ) : null}
        {isInvalid && fieldOrientation === "horizontal" ? (
          <FieldError className={fieldErrorVariants({ size })} errors={errors} />
        ) : null}
      </FieldContent>
      {orientation !== "horizontal-end" && fieldOrientation !== "vertical" ? children : null}
      {isInvalid && fieldOrientation !== "horizontal" ? (
        <FieldError className={fieldErrorVariants({ size })} errors={errors} />
      ) : null}
    </Field>
  );
}

function SubmitButton({
  disabled,
  ...props
}: Omit<React.ComponentProps<typeof Button>, "isLoading" | "onClick" | "type">) {
  const form = useFormContext();

  return (
    <form.Subscribe
      selector={(state) => ({ canSubmit: state.canSubmit, isSubmitting: state.isSubmitting })}
    >
      {(state) => (
        <Button
          {...props}
          disabled={disabled || !state.canSubmit}
          isLoading={state.isSubmitting}
          onClick={() => {
            void form.handleSubmit();
          }}
          type="button"
        />
      )}
    </form.Subscribe>
  );
}

function ResetButton({
  disabled,
  ...props
}: Omit<React.ComponentProps<typeof Button>, "isLoading" | "onClick" | "type">) {
  const form = useFormContext();

  return (
    <form.Subscribe
      selector={(state) => ({ isDirty: state.isDirty, isSubmitting: state.isSubmitting })}
    >
      {(state) => (
        <Button
          {...props}
          disabled={disabled || state.isSubmitting || !state.isDirty}
          onClick={() => {
            form.reset();
          }}
          type="button"
          variant={props.variant ?? "outline"}
        />
      )}
    </form.Subscribe>
  );
}

export function toFieldErrors(error: unknown) {
  const messages = new Set<string>();
  collectErrorMessages(error, messages);
  return Array.from(messages).map((message) => ({ message }));
}

export function clearFormError(form: AnyFormApi) {
  form.setErrorMap({
    onSubmit: undefined,
  });
}

export function setFormError(form: AnyFormApi, message: string) {
  form.setErrorMap({
    onSubmit: message,
  });
}

export function setFieldError<TFormData>(
  form: AnyFormApi,
  name: DeepKeys<TFormData>,
  message: string,
) {
  form.setFieldMeta(
    name as never,
    (prev: Record<string, unknown> = {} as Record<string, unknown>) =>
      ({
        ...prev,
        isTouched: true,
        errorMap: {
          ...(prev.errorMap as Record<string, unknown> | undefined),
          onSubmit: message,
        },
      }) as never,
  );
}

export const { useAppForm } = createFormHook({
  fieldComponents: {
    FieldShell,
  },
  formComponents: {
    ResetButton,
    SubmitButton,
  },
  fieldContext,
  formContext,
});

export { FieldError, FieldSet, useFormContext };
