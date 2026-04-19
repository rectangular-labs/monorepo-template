"use client";

import {
  type FieldShellProps,
  withFieldGroup,
} from "@rectangular-labs/ui/components/tanstack-form";
import { PasswordInput, PasswordInputProps } from "../core/password-input";

type PasswordFieldGroupValues = {
  confirmPassword?: string | undefined;
  password: string;
};

export type PasswordFieldGroupProps = Omit<FieldShellProps, "children"> &
  Omit<PasswordInputProps, "form" | "size"> & {
    showConfirmPassword?: boolean | undefined;
  };

export const PasswordFieldGroup = withFieldGroup({
  defaultValues: { password: "" } as PasswordFieldGroupValues,
  props: {} as PasswordFieldGroupProps,
  render: function PasswordFieldGroupRender({ group, showConfirmPassword, ...props }) {
    const {
      label = "Password",
      orientation,
      description,
      size,
      autoComplete = "new-password webauthn",
      enableToggle = true,
      placeholder = "Enter your password",
      ...inputProps
    } = props;

    return (
      <>
        <group.AppField name="password">
          {(field) => (
            <field.FieldShell
              description={description}
              label={label}
              orientation={orientation}
              size={size}
            >
              <PasswordInput
                {...inputProps}
                id={field.name}
                name={field.name}
                onBlur={field.handleBlur}
                aria-invalid={!field.state.meta.isValid && field.state.meta.isTouched}
                onChange={(event) => {
                  field.handleChange(event.currentTarget.value);
                }}
                autoComplete={autoComplete}
                enableToggle={enableToggle}
                placeholder={placeholder}
                value={field.state.value}
                form={group.form.formId}
              />
            </field.FieldShell>
          )}
        </group.AppField>

        {showConfirmPassword ? (
          <group.AppField
            name="confirmPassword"
            validators={{
              onChangeListenTo: ["password"],
              onChange: ({ value }) => {
                if (value !== group.getFieldValue("password")) {
                  return "Passwords do not match";
                }

                return undefined;
              },
            }}
          >
            {(field) => (
              <field.FieldShell label="Confirm password" size={size} orientation={orientation}>
                <PasswordInput
                  autoComplete="new-password"
                  disabled={props.disabled}
                  enableToggle={enableToggle}
                  id={field.name}
                  name={field.name}
                  onBlur={field.handleBlur}
                  aria-invalid={!field.state.meta.isValid && field.state.meta.isTouched}
                  onChange={(event) => {
                    field.handleChange(event.currentTarget.value);
                    field.setErrorMap({ onSubmit: undefined });
                  }}
                  placeholder="Confirm your password"
                  value={field.state.value}
                  form={group.form.formId}
                />
              </field.FieldShell>
            )}
          </group.AppField>
        ) : null}
      </>
    );
  },
});
