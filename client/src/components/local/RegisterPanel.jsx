import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../context/auth";

const formSchema = z
  .object({
    username: z.string().min(2).max(50),
    password: z.string().min(8),
    confirmation_password: z.string().min(8),
  })
  .superRefine(({ confirmation_password, password }, ctx) => {
    
    if (confirmation_password !== password) {
      console.log("Is this firing");
      ctx.addIssue({
        code: "custom",
        message: "The passwords did not match",
        path: ['confirmation_password']
      });
    }
  });
export function ProfileForm() {
  const navigate = useNavigate();
  // 1. Define your form.
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmation_password: "",
    },
  });

  // 2. Define a submit handler.
  function onSubmit(values) {
    const { login } = useAuth();
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values);
    const loginEndpoint = "http://localhost:3000/auth/login"; // Adjust the URL based on your server configuration

    const credentials = {
      username: values.username,
      password: values.password,
    };

    fetch(loginEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        // Handle the JWT token received from the server
        console.log("JWT Token:", data);
        login(data, () => {
          navigate("/");
        });
      })
      .catch((error) => {
        console.error("Error:", error.message);
      });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input
                  placeholder="user@example.com"
                  type="email"
                  autoCapitalize="none"
                  autoComplete="email"
                  autoCorrect="off"
                  {...field}
                />
              </FormControl>
              <FormDescription>This is your username or email.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Set Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  autoCapitalize="none"
                  autoComplete="new-password"
                  placeholder="******"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmation_password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  autoCapitalize="none"
                  autoComplete="new-password"
                  placeholder="******"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button size="wide" type="submit">
          Create Account
        </Button>
      </form>
    </Form>
  );
}

export function RegisterPanel() {
  const navigate = useNavigate();
  return (
    <div className=" w-96 m-auto">
      <div className="flex flex-col space-y-2 text-center mb-5">
        <h1 className="text-2xl font-semibold tracking-tight">Create Account</h1>
        <p className="text-sm text-muted-foreground">
          Please enter your details below to sign up.
        </p>
      </div>
      <ProfileForm />
    </div>
  );
}
