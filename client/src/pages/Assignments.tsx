import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import { PlusIcon, Search, Edit, Trash, MoreHorizontal, Calendar, Clock, AlertCircle } from "lucide-react";
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
import AddAssignmentModal from "@/components/modals/AddAssignmentModal";

interface Assignment {
  id: number;
  title: string;
  description?: string;
  classId: number;
  dueDate: string;
  priority: string;
  createdBy: number;
  studentId?: number;
  studentName?: string;
  gradeLevel?: string;
}

interface Class {
  id: number;
  name: string;
}

const Assignments = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  
  // For our homeschool demo, we'll use mock data
  const isAssignmentsLoading = false;
  const isClassesLoading = false;
  
  // Mock homeschool assignments - with student-specific assignments
  const assignments: Assignment[] = [
    {
      id: 1,
      title: "Addition and Subtraction Practice",
      description: "Complete worksheet pages 10-12",
      classId: 1, // Math
      dueDate: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
      priority: "high",
      createdBy: 1,
      studentId: 1,
      studentName: "Emma",
      gradeLevel: "2nd Grade"
    },
    {
      id: 2,
      title: "Phonics Reading Exercise",
      description: "Read chapter 3 of 'Learn to Read' book",
      classId: 3, // Reading
      dueDate: new Date(Date.now() + 172800000).toISOString(), // Day after tomorrow
      priority: "medium",
      createdBy: 1,
      studentId: 1,
      studentName: "Emma",
      gradeLevel: "2nd Grade"
    },
    {
      id: 3,
      title: "Fractions and Decimals",
      description: "Complete practice problems 1-15",
      classId: 1, // Math
      dueDate: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
      priority: "high",
      createdBy: 1,
      studentId: 2,
      studentName: "Michael",
      gradeLevel: "5th Grade"
    },
    {
      id: 4,
      title: "Weather Systems Research",
      description: "Create a diagram of weather systems",
      classId: 2, // Science
      dueDate: new Date(Date.now() + 259200000).toISOString(), // 3 days from now
      priority: "medium",
      createdBy: 1,
      studentId: 2,
      studentName: "Michael",
      gradeLevel: "5th Grade"
    },
    {
      id: 5,
      title: "Algebra Equations",
      description: "Solve the equations on pages 45-47",
      classId: 1, // Math
      dueDate: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
      priority: "high",
      createdBy: 1,
      studentId: 3,
      studentName: "Sophia",
      gradeLevel: "7th Grade"
    },
    {
      id: 6,
      title: "Ancient Civilizations Essay",
      description: "Write a 2-page essay on ancient Egypt",
      classId: 4, // History
      dueDate: new Date(Date.now() + 345600000).toISOString(), // 4 days from now
      priority: "low",
      createdBy: 1,
      studentId: 3,
      studentName: "Sophia",
      gradeLevel: "7th Grade"
    }
  ];
  
  // Mock classes
  const classes: Class[] = [
    { id: 1, name: "Math" },
    { id: 2, name: "Science" },
    { id: 3, name: "Reading" },
    { id: 4, name: "History" }
  ];
  
  const deleteAssignmentMutation = useMutation({
    mutationFn: async (assignmentId: number) => {
      return apiRequest("DELETE", `/api/assignments/${assignmentId}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/assignments"] });
      toast({
        title: "Assignment deleted",
        description: "The assignment has been successfully deleted",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Could not delete the assignment",
        variant: "destructive",
      });
    },
  });
  
  const handleDeleteAssignment = (assignmentId: number) => {
    if (confirm("Are you sure you want to delete this assignment?")) {
      deleteAssignmentMutation.mutate(assignmentId);
    }
  };
  
  const handleEditAssignment = (assignment: Assignment) => {
    setEditingAssignment(assignment);
    setIsAddModalOpen(true);
  };
  
  const filteredAssignments = assignments
    ? assignments.filter(assignment => 
        assignment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (assignment.description && assignment.description.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : [];
  
  const getClassName = (classId: number) => {
    const foundClass = classes?.find(c => c.id === classId);
    return foundClass ? foundClass.name : "Unknown";
  };
  
  const getPriorityBadge = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "high":
        return <Badge className="bg-red-500 hover:bg-red-600">High</Badge>;
      case "medium":
        return <Badge className="bg-amber-500 hover:bg-amber-600">Medium</Badge>;
      case "low":
        return <Badge className="bg-green-500 hover:bg-green-600">Low</Badge>;
      default:
        return <Badge className="bg-neutral-500">Unknown</Badge>;
    }
  };
  
  const isLoading = isAssignmentsLoading || isClassesLoading;
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h2 className="text-2xl font-medium text-neutral-darkest mb-2 sm:mb-0">Assignments</h2>
        <Button onClick={() => {
          setEditingAssignment(null);
          setIsAddModalOpen(true);
        }} className="bg-primary hover:bg-primary-dark text-white flex items-center">
          <PlusIcon className="h-4 w-4 mr-1" />
          <span>Add Assignment</span>
        </Button>
      </div>
      
      <Card className="p-4">
        <div className="relative mb-4">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input 
            placeholder="Search assignments..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 bg-neutral-light"
          />
        </div>
        
        {isLoading ? (
          <div className="text-center py-8 text-neutral-dark">
            <p>Loading assignments...</p>
          </div>
        ) : filteredAssignments.length === 0 ? (
          <div className="text-center py-8 text-neutral-dark">
            <p>No assignments found</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAssignments.map(assignment => {
                const dueDate = new Date(assignment.dueDate);
                const isPastDue = dueDate < new Date();
                
                return (
                  <TableRow key={assignment.id}>
                    <TableCell className="font-medium">{assignment.title}</TableCell>
                    <TableCell>
                      {assignment.studentName ? (
                        <div>
                          <div className="font-medium">{assignment.studentName}</div>
                          {assignment.gradeLevel && (
                            <Badge variant="outline" className="bg-secondary bg-opacity-10 text-secondary-dark mt-1">
                              {assignment.gradeLevel}
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <span className="text-neutral-dark">All students</span>
                      )}
                    </TableCell>
                    <TableCell>{getClassName(assignment.classId)}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        {isPastDue ? (
                          <div className="flex items-center text-red-500">
                            <AlertCircle className="h-4 w-4 mr-1" />
                            <span>{format(dueDate, "MMM d, yyyy h:mm a")}</span>
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1 text-neutral-dark" />
                            <span>{format(dueDate, "MMM d, yyyy")}</span>
                            <Clock className="h-4 w-4 ml-2 mr-1 text-neutral-dark" />
                            <span>{format(dueDate, "h:mm a")}</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getPriorityBadge(assignment.priority)}</TableCell>
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
                          <DropdownMenuItem onClick={() => handleEditAssignment(assignment)}>
                            <Edit className="mr-2 h-4 w-4" />
                            <span>Edit</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteAssignment(assignment.id)}>
                            <Trash className="mr-2 h-4 w-4" />
                            <span>Delete</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </Card>
      
      <AddAssignmentModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        assignment={editingAssignment}
        classes={classes || []}
      />
    </div>
  );
};

export default Assignments;
