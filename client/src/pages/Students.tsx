import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { PlusIcon, Search, Edit, Trash, MoreHorizontal, Users, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface Student {
  id: number;
  fullName: string;
  gradeLevel: string;
  parentId: number;
  avatar?: string | null;
  level?: number | null;
  xp?: number | null;
  totalXp?: number | null;
  pin?: string | null;
  createdAt?: Date | null;
}

const studentFormSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  gradeLevel: z.string().min(1, "Grade level is required"),
  pin: z.string().optional().refine((val) => !val || (val.length >= 4 && val.length <= 6), {
    message: "PIN must be between 4-6 digits if provided",
  }),
});

const Students = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // Get current user to ensure they're a parent
  const { data: currentUser } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  // Fetch students for this parent
  const { data: students, isLoading: isStudentsLoading } = useQuery<Student[]>({
    queryKey: ["/api/auth/students"],
    enabled: !!currentUser && currentUser.role === "parent",
  });

  const form = useForm<z.infer<typeof studentFormSchema>>({
    resolver: zodResolver(studentFormSchema),
    defaultValues: {
      fullName: "",
      gradeLevel: "",
      pin: "",
    },
  });
  
  const createStudentMutation = useMutation({
    mutationFn: async (studentData: z.infer<typeof studentFormSchema>) => {
      return apiRequest("POST", "/api/auth/students", studentData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/students"] });
      setIsAddModalOpen(false);
      form.reset();
      toast({
        title: "Student added",
        description: "The student has been successfully added to your family.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Could not add the student",
        variant: "destructive",
      });
    },
  });

  const updateStudentMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: z.infer<typeof studentFormSchema> }) => {
      return apiRequest("PUT", `/api/auth/students/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/students"] });
      setIsAddModalOpen(false);
      setEditingStudent(null);
      form.reset();
      toast({
        title: "Student updated",
        description: "The student has been successfully updated.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Could not update the student",
        variant: "destructive",
      });
    },
  });

  const deleteStudentMutation = useMutation({
    mutationFn: async (studentId: number) => {
      return apiRequest("DELETE", `/api/auth/students/${studentId}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/students"] });
      toast({
        title: "Student removed",
        description: "The student has been successfully removed from your family.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Could not remove the student",
        variant: "destructive",
      });
    },
  });
  
  const handleDeleteStudent = (studentId: number) => {
    if (confirm("Are you sure you want to remove this student from your family?")) {
      deleteStudentMutation.mutate(studentId);
    }
  };
  
  const handleEditStudent = (student: Student) => {
    setEditingStudent(student);
    form.reset({
      fullName: student.fullName,
      gradeLevel: student.gradeLevel,
      pin: student.pin || "",
    });
    setIsAddModalOpen(true);
  };

  const onSubmit = (data: z.infer<typeof studentFormSchema>) => {
    if (editingStudent) {
      updateStudentMutation.mutate({ id: editingStudent.id, data });
    } else {
      createStudentMutation.mutate(data);
    }
  };

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    setEditingStudent(null);
    form.reset();
  };
  
  const filteredStudents = students
    ? students.filter(student => 
        student.fullName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];
  
  if (currentUser?.role !== "parent") {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Access Restricted</h3>
          <p className="text-gray-600">Only parents can manage students.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div className="mb-4 sm:mb-0">
          <h2 className="text-3xl font-bold text-[#4B5563]" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
            My Students
          </h2>
          <p className="text-[#6B7280] mt-2">
            Manage your homeschool students and their learning progress
          </p>
        </div>
        <Button 
          onClick={() => {
            setEditingStudent(null);
            form.reset();
            setIsAddModalOpen(true);
          }} 
          className="bg-gradient-to-r from-[#7E8A97] to-[#8BA88E] hover:from-[#6E7A87] to-[#7B987E] text-white"
          size="lg"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Student
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{students?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Active in your homeschool
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Learners</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {students?.filter(s => s.level && s.level > 0).length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Students with progress
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Learning Progress</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Active</div>
            <p className="text-xs text-muted-foreground">
              All students learning
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input 
                placeholder="Search students by name..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isStudentsLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#9CA3AF] mx-auto"></div>
              <p className="text-[#6B7280] mt-4">Loading your students...</p>
            </div>
          ) : !students || students.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Students Yet</h3>
              <p className="text-gray-600 mb-6">Get started by adding your first student to begin their learning journey.</p>
              <Button 
                onClick={() => {
                  setEditingStudent(null);
                  form.reset();
                  setIsAddModalOpen(true);
                }}
                className="bg-gradient-to-r from-[#7E8A97] to-[#8BA88E] hover:from-[#6E7A87] to-[#7B987E] text-white"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Add Your First Student
              </Button>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">No students match your search.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStudents.map(student => (
                <Card key={student.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-[#7E8A97] to-[#8BA88E] rounded-full flex items-center justify-center text-white font-bold text-lg">
                          {student.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-semibold text-[#4B5563]" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                            {student.fullName}
                          </h3>
                          <p className="text-sm text-[#6B7280]">Level {student.level || 1}</p>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditStudent(student)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Student
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteStudent(student.id)}
                            className="text-red-600"
                          >
                            <Trash className="mr-2 h-4 w-4" />
                            Remove Student
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          {student.gradeLevel}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[#6B7280]">XP Points</span>
                        <span className="font-semibold text-[#4B5563]">{student.xp || 0}</span>
                      </div>
                      
                      {student.pin && (
                        <div className="text-xs text-[#6B7280]">
                          Protected with PIN
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Student Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={handleCloseModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: 'Comic Sans MS, cursive' }}>
              {editingStudent ? "Edit Student" : "Add New Student"}
            </DialogTitle>
            <DialogDescription>
              {editingStudent 
                ? "Update your student's information." 
                : "Add a new student to your homeschool family."
              }
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Student Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter student's full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="gradeLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Grade Level</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 2nd Grade, 5th Grade" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="pin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Student PIN (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="4-6 digit PIN for student access" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleCloseModal}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-gradient-to-r from-[#9CA3AF] to-[#A7B8A8] hover:from-[#8B9196] to-[#96A897] text-white"
                  disabled={createStudentMutation.isPending || updateStudentMutation.isPending}
                >
                  {createStudentMutation.isPending || updateStudentMutation.isPending
                    ? "Saving..." 
                    : editingStudent 
                      ? "Update Student" 
                      : "Add Student"
                  }
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Students;
