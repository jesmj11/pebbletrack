import { useState } from "react";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { 
  Dialog, 
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";

interface Student {
  id: number;
  user: {
    id: number;
    fullName: string;
    username: string;
  };
  classIds: string[];
}

interface Class {
  id: number;
  name: string;
}

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  classes: Class[];
}

const studentSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters").optional(),
  classIds: z.array(z.string()).optional(),
});

const AddStudentModal = ({ isOpen, onClose, student, classes }: AddStudentModalProps) => {
  const { toast } = useToast();
  const [selectedClasses, setSelectedClasses] = useState<string[]>(
    student?.classIds || []
  );
  
  const form = useForm<z.infer<typeof studentSchema>>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      fullName: student?.user.fullName || "",
      username: student?.user.username || "",
      password: "",
      classIds: student?.classIds || [],
    },
  });

  const isEditing = !!student;

  const createMutation = useMutation({
    mutationFn: async (values: z.infer<typeof studentSchema>) => {
      return apiRequest("POST", "/api/students", {
        ...values,
        password: values.password || "password123",
        classIds: selectedClasses,
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Student created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/students"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/teacher"] });
      onClose();
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create student",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (values: z.infer<typeof studentSchema>) => {
      if (!student) return null;
      return apiRequest("PUT", `/api/students/${student.id}`, {
        fullName: values.fullName,
        classIds: selectedClasses,
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Student updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/students"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/teacher"] });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update student",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: z.infer<typeof studentSchema>) => {
    if (isEditing) {
      updateMutation.mutate(values);
    } else {
      createMutation.mutate(values);
    }
  };

  const handleClassToggle = (classId: string) => {
    setSelectedClasses((prev) => {
      if (prev.includes(classId)) {
        return prev.filter((id) => id !== classId);
      } else {
        return [...prev, classId];
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Student" : "Add New Student"}</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Full Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Username" 
                      {...field} 
                      disabled={isEditing} 
                      className={isEditing ? "opacity-50" : ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {!isEditing && (
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Leave empty for default password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div>
              <FormLabel>Assigned Classes</FormLabel>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {classes.map((cls) => (
                  <div
                    key={cls.id}
                    className={`p-2 border rounded-md cursor-pointer ${
                      selectedClasses.includes(cls.id.toString())
                        ? "border-primary bg-primary/10"
                        : "border-gray-200"
                    }`}
                    onClick={() => handleClassToggle(cls.id.toString())}
                  >
                    {cls.name}
                  </div>
                ))}
              </div>
              {classes.length === 0 && (
                <p className="text-sm text-gray-500 mt-1">No classes available</p>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="mt-4"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="mt-4"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {createMutation.isPending || updateMutation.isPending ? (
                  "Saving..."
                ) : isEditing ? (
                  "Update Student"
                ) : (
                  "Add Student"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddStudentModal;
