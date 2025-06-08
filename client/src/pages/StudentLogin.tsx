import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { queryClient, getQueryFn } from "@/lib/queryClient";
import { ArrowLeft, GraduationCap } from "lucide-react";
import { getAvatarForStudent } from "@/lib/avatars";

const pinSchema = z.object({
  pin: z.string().min(4, "PIN must be at least 4 characters").max(8, "PIN must be at most 8 characters"),
});

type PinFormData = z.infer<typeof pinSchema>;

interface Student {
  id: number;
  fullName: string;
  gradeLevel: string;
  avatar: string | null;
  pin: string | null;
}

export default function StudentLogin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  
  // Fetch available students
  const { data: students, isLoading: studentsLoading } = useQuery<Student[]>({
    queryKey: ["/api/students"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: false,
  });

  const form = useForm<PinFormData>({
    resolver: zodResolver(pinSchema),
    defaultValues: {
      pin: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: PinFormData) => {
      if (!selectedStudent) throw new Error("Please select a student first");
      
      const response = await fetch("/api/auth/student-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ 
          studentId: selectedStudent.id, 
          pin: data.pin 
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Login failed");
      }
      
      return response.json();
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setTimeout(() => {
        toast({
          title: `Welcome back, ${selectedStudent?.fullName}!`,
          description: "Let's start learning today!",
        });
        setLocation("/student");
      }, 100);
    },
    onError: (error: any) => {
      toast({
        title: "Login failed",
        description: error.message || "Please check your PIN and try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: PinFormData) => {
    loginMutation.mutate(data);
  };

  if (studentsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#9CA3AF] via-[#A7B8A8] to-[#7FB3C4] flex items-center justify-center">
        <div className="text-xl font-bold text-[#4B5563]" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
          Loading students...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#9CA3AF] via-[#A7B8A8] to-[#7FB3C4] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Back Button */}
        <Link href="/">
          <Button variant="ghost" className="mb-4 text-[#4B5563] hover:text-[#7FB3C4]">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>

        <Card className="border-2 border-[#7FB3C4]/20">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-[#7FB3C4] rounded-full flex items-center justify-center mx-auto mb-4">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-[#4B5563]" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
              Student Login
            </CardTitle>
            <CardDescription>
              Choose your name and enter your PIN to start learning
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!selectedStudent ? (
              <div>
                <h3 className="text-lg font-bold text-[#4B5563] mb-4" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                  Who's learning today?
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {students?.map((student) => {
                    const avatar = getAvatarForStudent(student.fullName);
                    return (
                      <Button
                        key={student.id}
                        variant="outline"
                        className="h-auto p-4 flex flex-col items-center space-y-3 border-2 hover:border-[#7FB3C4] hover:bg-[#7FB3C4]/10"
                        onClick={() => setSelectedStudent(student)}
                      >
                        <div 
                          className="w-16 h-16 rounded-full flex items-center justify-center text-2xl"
                          style={{ backgroundColor: avatar.backgroundColor }}
                        >
                          {avatar.emoji}
                        </div>
                        <div className="text-center">
                          <p className="font-bold text-[#4B5563]" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                            {student.fullName}
                          </p>
                          <p className="text-xs text-[#6B7280]">
                            {student.gradeLevel}
                          </p>
                        </div>
                      </Button>
                    );
                  })}
                </div>
                
                {(!students || students.length === 0) && (
                  <div className="text-center py-8">
                    <p className="text-[#6B7280] mb-4">
                      No students found. Ask your parent to create student accounts first.
                    </p>
                    <Link href="/parent/login">
                      <Button variant="outline" className="text-[#8BA88E] border-[#8BA88E]">
                        Parent Login
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <div className="flex items-center space-x-4 mb-6 p-4 bg-[#F3F4F6] rounded-lg">
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center text-xl"
                    style={{ backgroundColor: getAvatarForStudent(selectedStudent.fullName).backgroundColor }}
                  >
                    {getAvatarForStudent(selectedStudent.fullName).emoji}
                  </div>
                  <div>
                    <p className="font-bold text-[#4B5563]" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                      {selectedStudent.fullName}
                    </p>
                    <p className="text-sm text-[#6B7280]">
                      {selectedStudent.gradeLevel}
                    </p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setSelectedStudent(null)}
                    className="ml-auto text-[#6B7280] hover:text-[#4B5563]"
                  >
                    Change
                  </Button>
                </div>

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="pin"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-lg">Enter Your PIN</FormLabel>
                          <FormControl>
                            <Input 
                              type="password" 
                              placeholder="Enter your 4-digit PIN" 
                              {...field} 
                              className="text-2xl text-center tracking-widest"
                              maxLength={8}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit" 
                      className="w-full bg-[#7FB3C4] hover:bg-[#6FA3B4] text-white text-lg py-6"
                      disabled={loginMutation.isPending}
                      style={{ fontFamily: 'Comic Sans MS, cursive' }}
                    >
                      {loginMutation.isPending ? "Signing in..." : "Start Learning!"}
                    </Button>
                  </form>
                </Form>

                <div className="mt-6 text-center">
                  <p className="text-sm text-[#6B7280]">
                    Forgot your PIN? Ask your parent for help.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}