"use client";

import {
  type FieldShellProps,
  withFieldGroup,
} from "@rectangular-labs/ui/components/tanstack-form";
import { Input } from "@rectangular-labs/ui/core/input";
import { type ComponentProps } from "react";

type EmailInputProps = Omit<
  ComponentProps<typeof Input>,
  "form" | "id" | "name" | "onBlur" | "onChange" | "value"
>;

type EmailFieldGroupProps = Omit<FieldShellProps, "children"> & EmailInputProps;

export const EmailFieldGroup = withFieldGroup({
  defaultValues: { email: "" },
  props: {} as EmailFieldGroupProps,
  render: function EmailFieldGroupRender({ group, ...props }) {
    const {
      label = "Email",
      orientation,
      description,
      size,
      autoComplete = "email webauthn",
      placeholder = "Enter your email",
      type = "email",
      ...inputProps
    } = props;

    return (
      <group.AppField name="email">
        {(field) => (
          <field.FieldShell
            description={description}
            label={label}
            orientation={orientation}
            size={size}
          >
            <Input
              {...inputProps}
              autoComplete={autoComplete}
              id={field.name}
              name={field.name}
              onBlur={field.handleBlur}
              onChange={(event) => {
                field.handleChange(event.currentTarget.value);
              }}
              aria-invalid={!field.state.meta.isValid && field.state.meta.isTouched}
              placeholder={placeholder}
              type={type}
              value={field.state.value}
              form={group.form.formId}
            />
          </field.FieldShell>
        )}
      </group.AppField>
    );
  },
});
