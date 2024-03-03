import { useState } from 'react'
import { Button } from './components/ui/button'
import {Input} from './components/ui/input'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import './App.css'

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
  username: z.string().min(2).max(50),
  password: z.string().min(5)
});

export function ProfileForm() {
  // 1. Define your form.
  const form =
    useForm(
      {
        resolver: zodResolver(formSchema),
        defaultValues: {
          username: "",
          password: ""
        },
      });

  // 2. Define a submit handler.
  function onSubmit(values) {
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
        console.log("JWT Token:", data.token);
      })
      .catch((error) => {
        console.error("Error:", error.message);
      });

  }

   return (
     <Form {...form}>
       <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
         <FormField
           control={form.control}
           name="username"
           render={({ field }) => (
             <FormItem>
               <FormLabel>Username</FormLabel>
               <FormControl>
                 <Input placeholder="shadcn" {...field} />
               </FormControl>
               <FormDescription>This is your public display name.</FormDescription>
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
                 <Input placeholder="shadcn" {...field} />
               </FormControl>
               <FormDescription>Choose something strong.</FormDescription>
               <FormMessage />
             </FormItem>
           )}
         />
         <Button variant="wide" type="submit">Submit</Button>
       </form>
     </Form>
   );
}

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div className="bg-background p-4 shadow-md rounded-md w-96 m-auto">
        <div className="flex items-center justify-center text-center align-middle font-bold uppercase mb-4">
          <h1 className='text-3xl'>GENERIC LOGO</h1>
        </div>
        <ProfileForm />
      </div>
    </>
  );
}

export default App
