"use client";

import { type ComponentProps } from "react";

import { Input } from "../../core/input";
import { type FieldShellProps, withFieldGroup } from "../../ui/tanstack-form";

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
