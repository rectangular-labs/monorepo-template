"use client";

import { arktypeResolver } from "@hookform/resolvers/arktype";
import { type } from "arktype";
import { useForm } from "react-hook-form";

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
import { useAuth } from "../auth-provider";
import { PasswordInput } from "../password-input";

export function SignInForm() {
  const {
    authClient,
    view,
    setView,
    viewPaths,
    isSubmitting,
    setIsSubmitting,
    credentials,
  } = useAuth();

  const usernameEnabled = credentials?.useUsername;
  const rememberMeEnabled = credentials?.enableRememberMe;
  const schema = type({
    email: usernameEnabled ? "string > 0" : "string.email >= 1",
    password: "string > 0",
    rememberMe: "boolean",
  });

  const form = useForm<typeof schema.infer>({
    resolver: arktypeResolver(schema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: !rememberMeEnabled,
    },
  });

  async function signIn({ email, password, rememberMe }: typeof schema.infer) {
    setIsSubmitting(true);
    const response = await (async () => {
      if (usernameEnabled) {
        return await authClient.signIn.username({
          username: email,
          password,
          rememberMe,
        });
      } else {
        return await authClient.signIn.email({
          email,
          password,
          rememberMe,
        });
      }
    })();
    setIsSubmitting(false);

    if (response.error) {
      if (response.error.status === 403) {
        // todo: redirect to verify email address
        return;
      }
      form.resetField("password");
      if (response.error.code === "PASSWORD_COMPROMISED") {
        form.setError("password", {
          message:
            response.error.message ??
            "Password has been compromised. Please choose a different one.",
        });
        return;
      }
      form.setError("root", {
        message:
          response.error.message ??
          "Something went wrong. Please try again later.",
      });
      return;
    }

    if ("twoFactorRedirect" in response.data) {
      setView(viewPaths.TWO_FACTOR);
    } else {
      // TODO: handle success / redirect to callbackURL
      // success path handled by consumer onSuccess if needed
    }
  }

  if (view !== viewPaths.SIGN_IN) return null;

  return (
    <Form {...form}>
      <form
        className={"grid w-full gap-6"}
        onSubmit={form.handleSubmit(signIn)}
      >
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{usernameEnabled ? "Username" : "Email"}</FormLabel>

              <FormControl>
                <Input
                  autoComplete={
                    usernameEnabled ? "username webauthn" : "email webauthn"
                  }
                  disabled={isSubmitting}
                  placeholder={
                    usernameEnabled ? "Enter your username" : "Enter your email"
                  }
                  type={usernameEnabled ? "text" : "email"}
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
              <div className="flex items-center justify-between">
                <FormLabel>Password</FormLabel>

                {credentials?.enableForgotPassword && (
                  <Button
                    onClick={() => setView(viewPaths.FORGOT_PASSWORD)}
                    variant="link"
                  >
                    Forgot password?
                  </Button>
                )}
              </div>

              <FormControl>
                <PasswordInput
                  autoComplete="current-password webauthn"
                  disabled={isSubmitting}
                  placeholder="Your password"
                  {...field}
                />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        {rememberMeEnabled && (
          <FormField
            control={form.control}
            name="rememberMe"
            render={({ field }) => (
              <FormItem className="flex">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    disabled={isSubmitting}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>

                <FormLabel>Remember me</FormLabel>
              </FormItem>
            )}
          />
        )}
        {/* TODO: Display root error message */}
        <Button className={"w-full"} isLoading={isSubmitting} type="submit">
          Sign in
        </Button>
      </form>
    </Form>
  );
}
