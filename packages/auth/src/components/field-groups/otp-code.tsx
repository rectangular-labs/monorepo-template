"use client";

import {
  withFieldGroup,
  type FieldShellProps,
} from "@rectangular-labs/ui/components/tanstack-form";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@rectangular-labs/ui/core/input-otp";
import { type ComponentProps } from "react";

type OTPInputProps = Omit<
  ComponentProps<typeof InputOTP>,
  | "children"
  | "form"
  | "id"
  | "maxLength"
  | "name"
  | "onBlur"
  | "onChange"
  | "render"
  | "size"
  | "value"
> & {
  maxLength?: number | undefined;
};

type OTPCodeFieldGroupProps = Omit<FieldShellProps, "children"> & OTPInputProps;

export const OTPCodeFieldGroup = withFieldGroup({
  defaultValues: { code: "" },
  props: {} as OTPCodeFieldGroupProps,
  render: function OTPCodeFieldGroupRender({ group, ...props }) {
    const { label, orientation, description, size, maxLength, ...inputProps } = props;
    const otpLength = maxLength ?? 6;

    return (
      <group.AppField name="code">
        {(field) => {
          return (
            <field.FieldShell
              description={description}
              label={label}
              orientation={orientation}
              size={size}
            >
              <InputOTP
                {...inputProps}
                id={field.name}
                maxLength={otpLength}
                name={field.name}
                onBlur={field.handleBlur}
                onChange={(value) => {
                  field.handleChange(value);
                }}
                value={field.state.value}
                form={group.form.formId}
              >
                <InputOTPGroup className="w-full">
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </field.FieldShell>
          );
        }}
      </group.AppField>
    );
  },
});
