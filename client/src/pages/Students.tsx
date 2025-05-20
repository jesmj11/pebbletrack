import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { PlusIcon, Search, Edit, Trash, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
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
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import AddStudentModal from "@/components/modals/AddStudentModal";

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

const Students = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  
  const { data: studentsData, isLoading: isStudentsLoading } = useQuery({
    queryKey: ["/api/students"],
  });
  
  const { data: classesData, isLoading: isClassesLoading } = useQuery({
    queryKey: ["/api/classes"],
  });
  
  const students = studentsData as Student[];
  const classes = classesData as Class[];
  
  const deleteStudentMutation = useMutation({
    mutationFn: async (studentId: number) => {
      return apiRequest("DELETE", `/api/students/${studentId}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/students"] });
      toast({
        title: "Student deleted",
        description: "The student has been successfully deleted",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Could not delete the student",
        variant: "destructive",
      });
    },
  });
  
  const handleDeleteStudent = (studentId: number) => {
    if (confirm("Are you sure you want to delete this student?")) {
      deleteStudentMutation.mutate(studentId);
    }
  };
  
  const handleEditStudent = (student: Student) => {
    setEditingStudent(student);
    setIsAddModalOpen(true);
  };
  
  const filteredStudents = students
    ? students.filter(student => 
        student.user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.user.username.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];
  
  const getClassNameById = (classId: string) => {
    const foundClass = classes?.find(c => c.id.toString() === classId);
    return foundClass ? foundClass.name : "Unknown";
  };
  
  const isLoading = isStudentsLoading || isClassesLoading;
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h2 className="text-2xl font-medium text-neutral-darkest mb-2 sm:mb-0">Students</h2>
        <Button onClick={() => {
          setEditingStudent(null);
          setIsAddModalOpen(true);
        }} className="bg-primary hover:bg-primary-dark text-white flex items-center">
          <PlusIcon className="h-4 w-4 mr-1" />
          <span>Add Student</span>
        </Button>
      </div>
      
      <Card className="p-4">
        <div className="relative mb-4">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input 
            placeholder="Search students..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 bg-neutral-light"
          />
        </div>
        
        {isLoading ? (
          <div className="text-center py-8 text-neutral-dark">
            <p>Loading students...</p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="text-center py-8 text-neutral-dark">
            <p>No students found</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Classes</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.map(student => (
                <TableRow key={student.id}>
                  <TableCell className="font-medium">{student.user.fullName}</TableCell>
                  <TableCell>{student.user.username}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {student.classIds.length > 0 ? (
                        student.classIds.map(classId => (
                          <Badge key={classId} variant="outline" className="bg-neutral-light">
                            {getClassNameById(classId)}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-neutral-dark text-sm">No classes assigned</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleEditStudent(student)}>
                          <Edit className="mr-2 h-4 w-4" />
                          <span>Edit</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeleteStudent(student.id)}>
                          <Trash className="mr-2 h-4 w-4" />
                          <span>Delete</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
      
      <AddStudentModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        student={editingStudent}
        classes={classes || []}
      />
    </div>
  );
};

export default Students;
