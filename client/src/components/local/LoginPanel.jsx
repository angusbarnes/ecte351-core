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
import { useNavigate, useLocation } from "react-router-dom";

import { useAuth } from "../../context/auth";

const formSchema = z.object({
  username: z.string().min(2).max(50),
  password: z.string().min(5),
});

export function ProfileForm() {
  const navigate = useNavigate();
  const location = useLocation();
  // 1. Define your form.
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // 2. Define a submit handler.
  function onSubmit(values) {
    const { login } = useAuth();

    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values);
    const loginEndpoint = "http://localhost:3000/auth/login/"; // Adjust the URL based on your server configuration

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
          const queryParams = new URLSearchParams(location.search);

          // Get a specific parameter and decode it
          const encodedParam = queryParams.get("from");
          console.log(encodedParam);
          console.log(`/${encodedParam || ""}`);
          navigate(`${encodedParam || "/"}`);
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
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  autoCapitalize="none"
                  autoComplete="current-password"
                  placeholder="******"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button size="wide" type="submit">
          Login
        </Button>
      </form>
    </Form>
  );
}

export function LoginPanel() {
  const navigate = useNavigate();
  return (
    <div className=" w-96 m-auto">
      <div className="flex flex-col space-y-2 text-center mb-5">
        <h1 className="text-2xl font-semibold tracking-tight">Login or Create an Account</h1>
        <p className="text-sm text-muted-foreground">
          Enter your details below to sign in or click the button to create your account
        </p>
      </div>
      <ProfileForm />
      <Button
        variant="outline"
        size="wide"
        className="mt-2"
        onClick={() => {
          navigate("/register");
        }}
      >
        Need an account? Sign Up
      </Button>
      <p className="text-primary text-xs mt-3 text-center">
        Forgot your password? <a className="font-bold">Too Bad</a>
      </p>
    </div>
  );
}
