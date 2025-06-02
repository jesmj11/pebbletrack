import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  PlusIcon, 
  Search, 
  Edit, 
  Trash, 
  MoreHorizontal, 
  Users, 
  GraduationCap, 
  BookOpen, 
  Calendar, 
  CheckCircle, 
  Clock, 
  ChevronRight,
  ArrowLeft,
  FileText,
  Award,
  TrendingUp
} from "lucide-react";
import { getAvatarForStudent, natureAvatars } from "@/lib/avatars";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
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
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertStudentSchema } from "@shared/schema";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

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

const Students = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [view, setView] = useState<'students' | 'classes' | 'assignments'>('students');
  const { toast } = useToast();

  // Get current authenticated user
  const { data: currentUser } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  // Fetch family students
  const { data: students } = useQuery({
    queryKey: ["/api/auth/students"],
    enabled: !!currentUser && currentUser?.role === "parent",
  });

  // Mock data for student classes and assignments (would come from API)
  const getStudentClasses = (studentId: number) => [
    {
      id: 1,
      name: "Math",
      description: "Arithmetic, Algebra, and Problem Solving",
      progress: 85,
      totalAssignments: 12,
      completedAssignments: 10,
      color: "#8BA88E"
    },
    {
      id: 2,
      name: "Science",
      description: "Nature Studies and Simple Experiments",
      progress: 72,
      totalAssignments: 8,
      completedAssignments: 6,
      color: "#A8C7DD"
    },
    {
      id: 3,
      name: "Reading",
      description: "Literature and Comprehension",
      progress: 90,
      totalAssignments: 15,
      completedAssignments: 14,
      color: "#D9E5D1"
    },
    {
      id: 4,
      name: "History",
      description: "World History and Geography",
      progress: 65,
      totalAssignments: 10,
      completedAssignments: 7,
      color: "#F5F2EA"
    }
  ];

  const getClassAssignments = (classId: number) => [
    {
      id: 1,
      title: "Multiplication Tables Practice",
      description: "Complete multiplication tables 1-12",
      dueDate: "2025-01-05",
      status: "completed",
      type: "practice"
    },
    {
      id: 2,
      title: "Word Problems Set A",
      description: "Solve 10 word problems involving addition and subtraction",
      dueDate: "2025-01-07",
      status: "pending",
      type: "homework"
    },
    {
      id: 3,
      title: "Geometry Shapes Quiz",
      description: "Identify and describe basic geometric shapes",
      dueDate: "2025-01-08",
      status: "pending",
      type: "quiz"
    },
    {
      id: 4,
      title: "Fractions Introduction",
      description: "Learn about halves, thirds, and quarters",
      dueDate: "2025-01-10",
      status: "not_started",
      type: "lesson"
    }
  ];

  const form = useForm({
    resolver: zodResolver(insertStudentSchema),
    defaultValues: {
      fullName: "",
      gradeLevel: "",
      avatar: "",
      pin: "",
    },
  });

  const handleEditStudent = (student: Student) => {
    setEditingStudent(student);
    form.reset({
      fullName: student.fullName,
      gradeLevel: student.gradeLevel,
      avatar: student.avatar || "",
      pin: student.pin || "",
    });
    setIsAddModalOpen(true);
  };

  const resetForm = () => {
    setEditingStudent(null);
    form.reset({
      fullName: "",
      gradeLevel: "",
      avatar: "",
      pin: "",
    });
  };

  // Handle navigation breadcrumbs
  const getBreadcrumb = () => {
    if (view === 'students') return 'Students';
    if (view === 'classes') return `${selectedStudent?.fullName} > Classes`;
    if (view === 'assignments') return `${selectedStudent?.fullName} > ${selectedClass?.name} > Assignments`;
    return 'Students';
  };

  const handleBackClick = () => {
    if (view === 'assignments') {
      setView('classes');
      setSelectedClass(null);
    } else if (view === 'classes') {
      setView('students');
      setSelectedStudent(null);
    }
  };

  const filteredStudents = students?.filter((student: any) =>
    student.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // Student List View
  if (view === 'students') {
    return (
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h2 className="text-3xl font-bold text-[#3E4A59]" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
              Students
            </h2>
            <p className="text-[#7E8A97] mt-1">
              Manage your family's learning journey
            </p>
          </div>
          <Button 
            onClick={() => setIsAddModalOpen(true)}
            className="bg-gradient-to-r from-[#7E8A97] to-[#8BA88E] hover:from-[#6E7A87] to-[#7B987E] text-white"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Student
          </Button>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#7E8A97] h-4 w-4" />
          <Input
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 border-[#D9E5D1] focus:border-[#8BA88E]"
          />
        </div>

        {/* Students Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStudents.map((student: any) => {
            const avatar = getAvatarForStudent(student.fullName);
            const studentClasses = getStudentClasses(student.id);
            const overallProgress = Math.round(
              studentClasses.reduce((acc, cls) => acc + cls.progress, 0) / studentClasses.length
            );

            return (
              <Card 
                key={student.id} 
                className="border-[#D9E5D1] hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => {
                  setSelectedStudent(student);
                  setView('classes');
                }}
              >
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <div 
                      className="w-16 h-16 rounded-full flex items-center justify-center text-2xl"
                      style={{ backgroundColor: avatar.backgroundColor }}
                    >
                      {avatar.emoji}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-[#3E4A59]" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                        {student.fullName}
                      </h3>
                      <p className="text-[#7E8A97] text-sm">{student.gradeLevel}</p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          handleEditStudent(student);
                        }}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          <Trash className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-[#7E8A97]">Overall Progress</span>
                      <span className="text-sm font-medium text-[#3E4A59]">{overallProgress}%</span>
                    </div>
                    <Progress value={overallProgress} className="h-2" />
                    
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-[#7E8A97]">Active Classes</span>
                      <span className="font-medium text-[#3E4A59]">{studentClasses.length}</span>
                    </div>

                    <div className="flex justify-between items-center text-sm">
                      <span className="text-[#7E8A97]">Completed Tasks</span>
                      <span className="font-medium text-[#3E4A59]">
                        {studentClasses.reduce((acc, cls) => acc + cls.completedAssignments, 0)}/
                        {studentClasses.reduce((acc, cls) => acc + cls.totalAssignments, 0)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-[#D9E5D1]">
                    <Button 
                      variant="ghost" 
                      className="w-full text-[#8BA88E] hover:bg-[#D9E5D1]"
                    >
                      View Classes
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Add/Edit Student Modal */}
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                {editingStudent ? "Edit Student" : "Add New Student"}
              </DialogTitle>
              <DialogDescription>
                {editingStudent ? "Update student information" : "Add a new student to your family"}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form className="space-y-4">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
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
                        <Input placeholder="e.g., 3rd Grade, Kindergarten" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="avatar"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Avatar</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose an avatar" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {natureAvatars.map((avatar) => (
                            <SelectItem key={avatar.id} value={avatar.id}>
                              <div className="flex items-center space-x-2">
                                <span>{avatar.emoji}</span>
                                <span>{avatar.name}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="pin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>PIN (Optional)</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="4-digit PIN for student login" {...field} />
                      </FormControl>
                      <FormDescription>
                        Optional PIN for student to access their own tasks
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsAddModalOpen(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-gradient-to-r from-[#7E8A97] to-[#8BA88E] hover:from-[#6E7A87] to-[#7B987E] text-white"
              >
                {editingStudent ? "Update" : "Add"} Student
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Classes View for Selected Student
  if (view === 'classes' && selectedStudent) {
    const studentClasses = getStudentClasses(selectedStudent.id);
    const avatar = getAvatarForStudent(selectedStudent.fullName);

    return (
      <div className="space-y-6 p-6">
        {/* Header with Breadcrumb */}
        <div className="flex items-center space-x-4 mb-6">
          <Button 
            variant="ghost" 
            onClick={handleBackClick}
            className="text-[#7E8A97] hover:text-[#3E4A59]"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Students
          </Button>
        </div>

        <div className="flex items-center space-x-4 mb-6">
          <div 
            className="w-16 h-16 rounded-full flex items-center justify-center text-2xl"
            style={{ backgroundColor: avatar.backgroundColor }}
          >
            {avatar.emoji}
          </div>
          <div>
            <h2 className="text-3xl font-bold text-[#3E4A59]" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
              {selectedStudent.fullName}'s Classes
            </h2>
            <p className="text-[#7E8A97] mt-1">
              {selectedStudent.gradeLevel} • {studentClasses.length} Active Classes
            </p>
          </div>
        </div>

        {/* Classes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {studentClasses.map((classItem) => (
            <Card 
              key={classItem.id}
              className="border-[#D9E5D1] hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => {
                setSelectedClass(classItem);
                setView('assignments');
              }}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-12 h-12 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: classItem.color }}
                    >
                      <BookOpen className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-[#3E4A59]" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                        {classItem.name}
                      </h3>
                      <p className="text-sm text-[#7E8A97]">{classItem.description}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[#7E8A97]">Progress</span>
                    <span className="text-sm font-medium text-[#3E4A59]">{classItem.progress}%</span>
                  </div>
                  <Progress value={classItem.progress} className="h-2" />

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-[#7E8A97]">Completed</span>
                      <p className="font-medium text-[#3E4A59]">{classItem.completedAssignments}</p>
                    </div>
                    <div>
                      <span className="text-[#7E8A97]">Total</span>
                      <p className="font-medium text-[#3E4A59]">{classItem.totalAssignments}</p>
                    </div>
                  </div>

                  <Button 
                    variant="ghost" 
                    className="w-full text-[#8BA88E] hover:bg-[#D9E5D1] mt-4"
                  >
                    View Assignments
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Assignments View for Selected Class
  if (view === 'assignments' && selectedStudent && selectedClass) {
    const assignments = getClassAssignments(selectedClass.id);
    const avatar = getAvatarForStudent(selectedStudent.fullName);

    return (
      <div className="space-y-6 p-6">
        {/* Header with Breadcrumb */}
        <div className="flex items-center space-x-4 mb-6">
          <Button 
            variant="ghost" 
            onClick={handleBackClick}
            className="text-[#7E8A97] hover:text-[#3E4A59]"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Classes
          </Button>
        </div>

        <div className="flex items-center space-x-4 mb-6">
          <div 
            className="w-16 h-16 rounded-full flex items-center justify-center text-2xl"
            style={{ backgroundColor: avatar.backgroundColor }}
          >
            {avatar.emoji}
          </div>
          <div>
            <h2 className="text-3xl font-bold text-[#3E4A59]" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
              {selectedClass.name} Assignments
            </h2>
            <p className="text-[#7E8A97] mt-1">
              {selectedStudent.fullName} • {assignments.length} Assignments
            </p>
          </div>
        </div>

        {/* Assignments List */}
        <div className="space-y-4">
          {assignments.map((assignment) => {
            const getStatusColor = (status: string) => {
              switch (status) {
                case 'completed': return 'bg-[#D9E5D1] text-[#8BA88E]';
                case 'pending': return 'bg-yellow-100 text-yellow-700';
                case 'not_started': return 'bg-gray-100 text-gray-700';
                default: return 'bg-gray-100 text-gray-700';
              }
            };

            const getStatusIcon = (status: string) => {
              switch (status) {
                case 'completed': return <CheckCircle className="h-4 w-4" />;
                case 'pending': return <Clock className="h-4 w-4" />;
                case 'not_started': return <Calendar className="h-4 w-4" />;
                default: return <Calendar className="h-4 w-4" />;
              }
            };

            const getTypeIcon = (type: string) => {
              switch (type) {
                case 'homework': return <FileText className="h-5 w-5" />;
                case 'quiz': return <Award className="h-5 w-5" />;
                case 'practice': return <TrendingUp className="h-5 w-5" />;
                case 'lesson': return <BookOpen className="h-5 w-5" />;
                default: return <FileText className="h-5 w-5" />;
              }
            };

            return (
              <Card key={assignment.id} className="border-[#D9E5D1]">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="p-2 bg-[#F5F2EA] rounded-lg">
                        {getTypeIcon(assignment.type)}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-[#3E4A59]" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                          {assignment.title}
                        </h3>
                        <p className="text-[#7E8A97] text-sm mb-2">{assignment.description}</p>
                        <div className="flex items-center space-x-4 text-sm">
                          <span className="text-[#7E8A97]">Due: {assignment.dueDate}</span>
                          <Badge className={`text-xs ${getStatusColor(assignment.status)}`}>
                            {getStatusIcon(assignment.status)}
                            <span className="ml-1 capitalize">{assignment.status.replace('_', ' ')}</span>
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Assignment
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Mark Complete
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          <Trash className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Add Assignment Button */}
        <Button 
          className="bg-gradient-to-r from-[#7E8A97] to-[#8BA88E] hover:from-[#6E7A87] to-[#7B987E] text-white"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Assignment
        </Button>
      </div>
    );
  }

  return null;
};

export default Students;