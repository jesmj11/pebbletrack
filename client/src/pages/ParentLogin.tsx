import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { ArrowLeft, User } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function ParentLogin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginFormData) => {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Login failed");
      }
      
      return response.json();
    },
    onSuccess: async () => {
      // Invalidate auth query to trigger re-fetch
      await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      // Wait a moment for the query to update
      setTimeout(() => {
        toast({
          title: "Welcome back!",
          description: "You've successfully logged in.",
        });
        setLocation("/");
      }, 100);
    },
    onError: (error: any) => {
      toast({
        title: "Login failed",
        description: error.message || "Please check your email and password.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: LoginFormData) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#9CA3AF] via-[#A7B8A8] to-[#7FB3C4] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <Link href="/">
          <Button variant="ghost" className="mb-4 text-[#4B5563] hover:text-[#8BA88E]">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>

        <Card className="border-2 border-[#8BA88E]/20">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-[#8BA88E] rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-[#4B5563]" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
              Parent Login
            </CardTitle>
            <CardDescription>
              Sign in to manage your family's homeschool journey
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input 
                          type="email" 
                          placeholder="your@email.com" 
                          {...field} 
                          className="text-lg"
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
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="Enter your password" 
                          {...field} 
                          className="text-lg"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full bg-[#8BA88E] hover:bg-[#7A9A7D] text-white text-lg py-6"
                  disabled={loginMutation.isPending}
                  style={{ fontFamily: 'Comic Sans MS, cursive' }}
                >
                  {loginMutation.isPending ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </Form>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-[#6B7280]">
                Don't have an account?{" "}
                <Link href="/parent/register" className="text-[#8BA88E] hover:underline font-medium">
                  Create Family Account
                </Link>
              </p>
            </div>

            {/* Demo Credentials */}
            <div className="mt-6 p-4 bg-[#F3F4F6] rounded-lg">
              <p className="text-xs text-[#6B7280] mb-2">Demo Credentials:</p>
              <p className="text-xs text-[#4B5563]">Email: parent@test.com</p>
              <p className="text-xs text-[#4B5563]">Password: password123</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}