"use client";

import {
  type FieldShellProps,
  withFieldGroup,
} from "@rectangular-labs/ui/components/tanstack-form";
import { type ComponentProps } from "react";
import { PhoneInput } from "../core/phone-input";

type PhoneControlProps = Omit<
  ComponentProps<typeof PhoneInput>,
  "form" | "id" | "name" | "onBlur" | "onChange" | "size" | "value"
>;

export type PhoneFieldGroupProps = Omit<FieldShellProps, "children"> & PhoneControlProps;

export const PhoneFieldGroup = withFieldGroup({
  defaultValues: { phone: "" },
  props: {} as PhoneFieldGroupProps,
  render: function PhoneFieldGroupRender({ group, ...props }) {
    const {
      label,
      orientation,
      description,
      size,
      placeholder = "Enter your phone number",
      ...inputProps
    } = props;
    return (
      <group.AppField name="phone">
        {(field) => (
          <field.FieldShell
            description={description}
            label={label}
            orientation={orientation}
            size={size}
          >
            <PhoneInput
              {...inputProps}
              id={field.name}
              name={field.name}
              onBlur={field.handleBlur}
              onChange={(value) => {
                field.handleChange(value ?? "");
              }}
              placeholder={placeholder}
              value={field.state.value}
              form={group.form.formId}
            />
          </field.FieldShell>
        )}
      </group.AppField>
    );
  },
});
