"use client";

import {
  createFormHook,
  createFormHookContexts,
  type AnyFormApi,
  type DeepKeys,
  type FieldApi,
} from "@tanstack/react-form";
import { cva } from "class-variance-authority";
import type * as React from "react";

import { cn } from "../../utils";
import { Button, type ButtonProps } from "../core/button";
import { Checkbox } from "../core/checkbox";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldSet,
  FieldTitle,
} from "../core/field";
import { Input } from "../core/input";
import { InputOTP } from "../core/input-otp";
import { RadioGroup, RadioGroupItem, type RadioGroupOption } from "../core/radio-group";
import { Select } from "../core/select";
import { Slider } from "../core/slider";
import { Switch } from "../core/switch";
import { Textarea } from "../core/textarea";

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

type SharedFieldProps = {
  className?: string | undefined;
  contentClassName?: string | undefined;
  description?: React.ReactNode | undefined;
  fieldClassName?: string | undefined;
  label?: React.ReactNode | undefined;
  orientation?: React.ComponentProps<typeof Field>["orientation"] | undefined;
  size?: FieldSize | undefined;
};

type ChoiceControlPosition = "start" | "end";
type FieldSize = "sm" | "default" | "lg";

type TextFieldBaseProps = SharedFieldProps &
  Omit<
    React.ComponentProps<typeof Input>,
    "defaultValue" | "name" | "onBlur" | "onChange" | "value"
  > & {
    inputClassName?: string;
    inputComponent?: React.ComponentType<any>;
  } & Record<string, unknown>;

type TextareaFieldProps = FormFieldProps<
  string | undefined,
  SharedFieldProps &
    Omit<
      React.ComponentProps<typeof Textarea>,
      "defaultValue" | "name" | "onBlur" | "onChange" | "value"
    >
>;
type TextareaFieldBaseProps = Omit<TextareaFieldProps, "field">;

type NativeSelectFieldProps = FormFieldProps<
  string | undefined,
  SharedFieldProps &
    Omit<
      React.ComponentProps<typeof Select>,
      "defaultValue" | "name" | "onBlur" | "onChange" | "value"
    >
>;
type NativeSelectFieldBaseProps = Omit<NativeSelectFieldProps, "field">;

type SliderFieldProps = FormFieldProps<
  number | undefined,
  SharedFieldProps &
    Omit<
      React.ComponentProps<typeof Slider>,
      "defaultValue" | "name" | "onValueChange" | "value"
    > & {
      formatValue?: (value: number) => React.ReactNode;
      max?: number;
      min?: number;
      showValue?: boolean;
    }
>;
type SliderFieldBaseProps = Omit<SliderFieldProps, "field">;

type CheckboxFieldProps = FormFieldProps<
  boolean | undefined,
  SharedFieldProps &
    Omit<
      React.ComponentProps<typeof Checkbox>,
      "checked" | "defaultChecked" | "name" | "onBlur" | "onCheckedChange"
    > & {
      controlPosition?: ChoiceControlPosition;
    }
>;
type CheckboxFieldBaseProps = Omit<CheckboxFieldProps, "field">;

type SwitchFieldProps = FormFieldProps<
  boolean | undefined,
  SharedFieldProps &
    Omit<
      React.ComponentProps<typeof Switch>,
      "checked" | "defaultChecked" | "name" | "onBlur" | "onCheckedChange"
    > & {
      controlPosition?: ChoiceControlPosition;
    }
>;
type SwitchFieldBaseProps = Omit<SwitchFieldProps, "field">;

type RadioGroupFieldProps = FormFieldProps<
  string | undefined,
  SharedFieldProps &
    Omit<
      React.ComponentProps<typeof RadioGroup>,
      "defaultValue" | "name" | "onValueChange" | "value"
    > & {
      optionClassName?: string;
      options: RadioGroupOption[];
      variant?: "default" | "card";
    }
>;
type RadioGroupFieldBaseProps = Omit<RadioGroupFieldProps, "field">;

type CheckboxChoiceCardFieldProps = FormFieldProps<
  boolean | undefined,
  SharedFieldProps &
    Omit<
      React.ComponentProps<typeof Checkbox>,
      "checked" | "defaultChecked" | "name" | "onBlur" | "onCheckedChange"
    > & {
      type: "checkbox";
    }
>;
type CheckboxChoiceCardFieldBaseProps = Omit<CheckboxChoiceCardFieldProps, "field">;

type RadioChoiceCardFieldProps = FormFieldProps<
  string | undefined,
  SharedFieldProps &
    Omit<
      React.ComponentProps<typeof RadioGroup>,
      "defaultValue" | "name" | "onValueChange" | "value"
    > & {
      optionClassName?: string;
      options: RadioGroupOption[];
      type: "radio";
    }
>;
type RadioChoiceCardFieldBaseProps = Omit<RadioChoiceCardFieldProps, "field">;

type OtpFieldProps = FormFieldProps<
  string | undefined,
  SharedFieldProps &
    Omit<
      React.ComponentProps<typeof InputOTP>,
      "children" | "maxLength" | "name" | "onBlur" | "onChange" | "render" | "value"
    > & {
      children: React.ReactNode;
      maxLength?: number;
      onComplete?: (value: string) => void;
    }
>;
type OtpFieldBaseProps = Omit<OtpFieldProps, "field">;

type SubmitButtonProps = Omit<ButtonProps, "isLoading" | "onClick" | "type">;
type ResetButtonProps = Omit<ButtonProps, "isLoading" | "onClick" | "type">;

const { fieldContext, formContext, useFormContext } = createFormHookContexts();

const fieldShellVariants = cva("", {
  variants: {
    size: {
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
      sm: "text-xs",
      default: "",
      lg: "text-sm",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

const fieldDescriptionVariants = cva("", {
  variants: {
    size: {
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
      sm: "text-xs",
      default: "",
      lg: "text-sm",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

const choiceFieldVariants = cva("", {
  variants: {
    controlPosition: {
      end: "",
      start: "flex-row-reverse justify-between",
    },
    size: {
      sm: "[&_[data-slot=field-label]]:text-[11px]",
      default: "",
      lg: "[&_[data-slot=field-label]]:text-sm",
    },
  },
  defaultVariants: {
    controlPosition: "start",
    size: "default",
  },
});

const choiceCardVariants = cva(
  "rounded-none border transition-colors has-data-[checked=true]:border-primary/40 has-data-[checked=true]:bg-primary/5 dark:has-data-[checked=true]:border-primary/30 dark:has-data-[checked=true]:bg-primary/10",
  {
    variants: {
      size: {
        sm: "[&_[data-slot=field]]:p-2",
        default: "[&_[data-slot=field]]:p-3",
        lg: "[&_[data-slot=field]]:p-4",
      },
    },
    defaultVariants: {
      size: "default",
    },
  },
);

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

function getFieldErrors<TValue>(field: TypedFieldApi<TValue>) {
  return toFieldErrors(field.state.meta.errors);
}

function clearFieldSubmitError<TValue>(field: TypedFieldApi<TValue>) {
  field.setErrorMap({ onSubmit: undefined });
}

function renderFieldShell({
  children,
  contentClassName,
  description,
  errors,
  fieldClassName,
  isDisabled,
  isInvalid,
  label,
  orientation = "vertical",
  size = "default",
}: SharedFieldProps & {
  children: React.ReactNode;
  errors: { message?: string }[];
  isDisabled?: boolean | undefined;
  isInvalid: boolean;
}) {
  return (
    <Field
      className={cn(fieldShellVariants({ size }), fieldClassName)}
      data-disabled={isDisabled ? true : undefined}
      data-invalid={isInvalid ? true : undefined}
      orientation={orientation}
    >
      <FieldContent className={contentClassName}>
        {label ? <FieldLabel className={fieldLabelVariants({ size })}>{label}</FieldLabel> : null}
        {description ? (
          <FieldDescription className={fieldDescriptionVariants({ size })}>
            {description}
          </FieldDescription>
        ) : null}
      </FieldContent>
      {children}
      <FieldError className={fieldErrorVariants({ size })} errors={errors} />
    </Field>
  );
}

function TextField<TValue extends string | undefined>(
  props: FormFieldProps<TValue, TextFieldBaseProps>,
) {
  const {
    contentClassName,
    description,
    field,
    fieldClassName,
    inputClassName,
    inputComponent: InputComponent = Input,
    label,
    orientation,
    size = "default",
    ...inputProps
  } = props;
  const errors = getFieldErrors(field);
  const isInvalid = errors.length > 0;

  return renderFieldShell({
    contentClassName,
    description,
    errors,
    fieldClassName,
    isDisabled: inputProps.disabled,
    isInvalid,
    label,
    orientation,
    size,
    children: (
      <InputComponent
        {...inputProps}
        aria-invalid={isInvalid}
        className={inputClassName}
        id={field.name}
        name={field.name}
        onBlur={field.handleBlur}
        onChange={(event) => {
          field.handleChange(event.currentTarget.value as TValue);
          clearFieldSubmitError(field);
        }}
        value={field.state.value ?? ""}
      />
    ),
  });
}

function TextareaField<TValue extends string | undefined>(
  props: FormFieldProps<TValue, TextareaFieldBaseProps>,
) {
  const {
    contentClassName,
    description,
    field,
    fieldClassName,
    label,
    orientation,
    size = "default",
    ...textareaProps
  } = props;
  const errors = getFieldErrors(field);
  const isInvalid = errors.length > 0;

  return renderFieldShell({
    contentClassName,
    description,
    errors,
    fieldClassName,
    isDisabled: textareaProps.disabled,
    isInvalid,
    label,
    orientation,
    size,
    children: (
      <Textarea
        {...textareaProps}
        aria-invalid={isInvalid}
        id={field.name}
        name={field.name}
        onBlur={field.handleBlur}
        onChange={(event) => {
          field.handleChange(event.currentTarget.value as TValue);
          clearFieldSubmitError(field);
        }}
        value={field.state.value ?? ""}
      />
    ),
  });
}

function NativeSelectField<TValue extends string | undefined>(
  props: FormFieldProps<TValue, NativeSelectFieldBaseProps>,
) {
  const {
    children,
    contentClassName,
    description,
    field,
    fieldClassName,
    label,
    orientation,
    size = "default",
    ...selectProps
  } = props;
  const errors = getFieldErrors(field);
  const isInvalid = errors.length > 0;

  return renderFieldShell({
    contentClassName,
    description,
    errors,
    fieldClassName,
    isDisabled: selectProps.disabled,
    isInvalid,
    label,
    orientation,
    size,
    children: (
      <Select
        {...selectProps}
        aria-invalid={isInvalid}
        id={field.name}
        name={field.name}
        onBlur={field.handleBlur}
        onChange={(event) => {
          field.handleChange(event.currentTarget.value as TValue);
          clearFieldSubmitError(field);
        }}
        value={field.state.value ?? ""}
      >
        {children}
      </Select>
    ),
  });
}

function SliderField<TValue extends number | undefined>(
  props: FormFieldProps<TValue, SliderFieldBaseProps>,
) {
  const {
    contentClassName,
    description,
    field,
    fieldClassName,
    formatValue,
    label,
    max = 100,
    min = 0,
    orientation,
    showValue = true,
    size = "default",
    ...sliderProps
  } = props;
  const errors = getFieldErrors(field);
  const isInvalid = errors.length > 0;

  return renderFieldShell({
    contentClassName,
    description,
    errors,
    fieldClassName,
    isDisabled: sliderProps.disabled,
    isInvalid,
    label: showValue ? (
      <div className="flex items-center justify-between gap-3">
        <span>{label}</span>
        <FieldTitle>
          {formatValue ? formatValue(field.state.value ?? min) : (field.state.value ?? min)}
        </FieldTitle>
      </div>
    ) : (
      label
    ),
    orientation,
    size,
    children: (
      <Slider
        {...sliderProps}
        aria-invalid={isInvalid}
        id={field.name}
        max={max}
        min={min}
        name={field.name}
        onValueChange={(value) => {
          field.handleChange(value as TValue);
          clearFieldSubmitError(field);
        }}
        value={field.state.value ?? min}
      />
    ),
  });
}

function CheckboxField<TValue extends boolean | undefined>(
  props: FormFieldProps<TValue, CheckboxFieldBaseProps>,
) {
  const {
    contentClassName,
    controlPosition = "start",
    description,
    field,
    fieldClassName,
    label,
    orientation = "horizontal",
    size = "default",
    ...checkboxProps
  } = props;
  const errors = getFieldErrors(field);
  const isInvalid = errors.length > 0;

  return (
    <Field
      className={cn(choiceFieldVariants({ controlPosition, size }), fieldClassName)}
      data-disabled={checkboxProps.disabled ? true : undefined}
      data-invalid={isInvalid ? true : undefined}
      orientation={orientation}
    >
      <Checkbox
        {...checkboxProps}
        aria-invalid={isInvalid}
        checked={Boolean(field.state.value)}
        id={field.name}
        name={field.name}
        onBlur={field.handleBlur}
        onCheckedChange={(checked) => {
          field.handleChange(Boolean(checked) as TValue);
          clearFieldSubmitError(field);
        }}
      />
      <FieldContent className={contentClassName}>
        {label ? <FieldLabel className={fieldLabelVariants({ size })}>{label}</FieldLabel> : null}
        {description ? (
          <FieldDescription className={fieldDescriptionVariants({ size })}>
            {description}
          </FieldDescription>
        ) : null}
        <FieldError className={fieldErrorVariants({ size })} errors={errors} />
      </FieldContent>
    </Field>
  );
}

function SwitchField<TValue extends boolean | undefined>(
  props: FormFieldProps<TValue, SwitchFieldBaseProps>,
) {
  const {
    contentClassName,
    controlPosition = "start",
    description,
    field,
    fieldClassName,
    label,
    orientation = "horizontal",
    size = "default",
    ...switchProps
  } = props;
  const errors = getFieldErrors(field);
  const isInvalid = errors.length > 0;

  return (
    <Field
      className={cn(choiceFieldVariants({ controlPosition, size }), fieldClassName)}
      data-disabled={switchProps.disabled ? true : undefined}
      data-invalid={isInvalid ? true : undefined}
      orientation={orientation}
    >
      <Switch
        {...switchProps}
        aria-invalid={isInvalid}
        checked={Boolean(field.state.value)}
        id={field.name}
        name={field.name}
        onBlur={field.handleBlur}
        onCheckedChange={(checked) => {
          field.handleChange(checked as TValue);
          clearFieldSubmitError(field);
        }}
      />
      <FieldContent className={contentClassName}>
        {label ? <FieldLabel className={fieldLabelVariants({ size })}>{label}</FieldLabel> : null}
        {description ? (
          <FieldDescription className={fieldDescriptionVariants({ size })}>
            {description}
          </FieldDescription>
        ) : null}
        <FieldError className={fieldErrorVariants({ size })} errors={errors} />
      </FieldContent>
    </Field>
  );
}

function RadioGroupField<TValue extends string | undefined>(
  props: FormFieldProps<TValue, RadioGroupFieldBaseProps>,
) {
  const {
    contentClassName,
    description,
    field,
    fieldClassName,
    label,
    optionClassName,
    options,
    orientation,
    size = "default",
    variant = "default",
    ...radioGroupProps
  } = props;
  const errors = getFieldErrors(field);
  const isInvalid = errors.length > 0;

  return renderFieldShell({
    contentClassName,
    description,
    errors,
    fieldClassName,
    isDisabled: radioGroupProps.disabled,
    isInvalid,
    label,
    orientation,
    size,
    children: (
      <RadioGroup
        {...radioGroupProps}
        aria-invalid={isInvalid}
        name={field.name}
        onValueChange={(value) => {
          field.handleChange(value as TValue);
          clearFieldSubmitError(field);
        }}
        value={field.state.value ?? ""}
      >
        {options.map((option) => {
          const item = (
            <Field
              className="items-start"
              data-disabled={option.disabled ? true : undefined}
              orientation="horizontal"
            >
              <RadioGroupItem
                disabled={radioGroupProps.disabled || option.disabled}
                value={option.value}
              />
              <FieldContent>
                <FieldLabel className={fieldLabelVariants({ size })}>{option.label}</FieldLabel>
                {option.description ? (
                  <FieldDescription className={fieldDescriptionVariants({ size })}>
                    {option.description}
                  </FieldDescription>
                ) : null}
              </FieldContent>
            </Field>
          );

          if (variant === "card") {
            return (
              <FieldLabel
                className={cn(choiceCardVariants({ size }), optionClassName)}
                data-checked={field.state.value === option.value ? true : undefined}
                key={option.value}
              >
                {item}
              </FieldLabel>
            );
          }

          return (
            <div className={optionClassName} key={option.value}>
              {item}
            </div>
          );
        })}
      </RadioGroup>
    ),
  });
}

function ChoiceCardField<
  TValue extends boolean | undefined,
  TRadioValue extends string | undefined,
>(
  props:
    | FormFieldProps<TValue, CheckboxChoiceCardFieldBaseProps>
    | FormFieldProps<TRadioValue, RadioChoiceCardFieldBaseProps>,
) {
  if (props.type === "checkbox") {
    const { field, size = "default", ...rest } = props;
    return (
      <FieldLabel
        className={choiceCardVariants({ size })}
        data-checked={field.state.value ? true : undefined}
      >
        <CheckboxField
          {...rest}
          controlPosition="end"
          field={field}
          orientation="responsive"
          size={size}
        />
      </FieldLabel>
    );
  }

  return <RadioGroupField {...props} variant="card" />;
}

function OtpField<TValue extends string | undefined>(
  props: FormFieldProps<TValue, OtpFieldBaseProps>,
) {
  const {
    children,
    contentClassName,
    description,
    field,
    fieldClassName,
    label,
    maxLength = 6,
    onComplete,
    orientation,
    size = "default",
    ...otpProps
  } = props;
  const errors = getFieldErrors(field);
  const isInvalid = errors.length > 0;

  return renderFieldShell({
    contentClassName,
    description,
    errors,
    fieldClassName,
    isDisabled: otpProps.disabled,
    isInvalid,
    label,
    orientation,
    size,
    children: (
      <InputOTP
        {...otpProps}
        aria-invalid={isInvalid}
        id={field.name}
        maxLength={maxLength}
        name={field.name}
        onBlur={field.handleBlur}
        onChange={(value) => {
          field.handleChange(value as TValue);
          clearFieldSubmitError(field);
          if (value.length === maxLength) {
            onComplete?.(value);
          }
        }}
        value={field.state.value ?? ""}
      >
        {children}
      </InputOTP>
    ),
  });
}

function SubmitButton({ disabled, ...props }: SubmitButtonProps) {
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

function ResetButton({ disabled, ...props }: ResetButtonProps) {
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
    CheckboxField,
    ChoiceCardField,
    NativeSelectField,
    OtpField,
    RadioGroupField,
    SliderField,
    SwitchField,
    TextField,
    TextareaField,
  },
  formComponents: {
    ResetButton,
    SubmitButton,
  },
  fieldContext,
  formContext,
});

export { FieldError, FieldSet, useFormContext };
